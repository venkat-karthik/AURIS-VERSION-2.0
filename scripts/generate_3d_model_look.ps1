Add-Type -AssemblyName System.Drawing

function Convert-To-3D-Model-Render {
    param(
        [string]$inputFile,
        [string]$outputFile,
        [double]$skinSmoothRadius = 2.0,
        [double]$specularIntensity = 0.35,
        [double]$specularExponent = 1.8,
        [double]$rimLightIntensity = 0.25,
        [double]$contrast = 1.12,
        [double]$saturation = 1.15
    )

    Write-Host "Rendering 3D Model style for: $inputFile -> $outputFile"
    $src = [System.Drawing.Bitmap]::new($inputFile)
    $w = $src.Width
    $h = $src.Height

    # Format24bppRgb
    $rect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
    $srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $stride = [Math]::Abs($srcData.Stride)
    $bytes = $stride * $h
    $srcBytes = [byte[]]::new($bytes)
    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $bytes)
    $src.UnlockBits($srcData)

    $outBytes = [byte[]]::new($bytes)

    # 1. Edge-preserving bilateral skin smoothing (gives the pristine CGI / 3D Metahuman look)
    # Fast separable approximation:
    $tempBytes = [byte[]]::new($bytes)
    $rad = [int]$skinSmoothRadius
    $sigmaColor = 32.0

    for ($y = 0; $y -lt $h; $y++) {
        $row = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            $centerIdx = $row + ($x * 3)
            $cb = [double]$srcBytes[$centerIdx]
            $cg = [double]$srcBytes[$centerIdx + 1]
            $cr = [double]$srcBytes[$centerIdx + 2]

            $sumB = 0.0
            $sumG = 0.0
            $sumR = 0.0
            $sumW = 0.0

            for ($dx = -$rad; $dx -le $rad; $dx++) {
                $nx = [Math]::Max(0, [Math]::Min($w - 1, $x + $dx))
                $nIdx = $row + ($nx * 3)
                $nb = [double]$srcBytes[$nIdx]
                $ng = [double]$srcBytes[$nIdx + 1]
                $nr = [double]$srcBytes[$nIdx + 2]

                $spatialDist = [Math]::Abs($dx)
                $spatialWeight = [Math]::Exp(- ($spatialDist * $spatialDist) / (2.0 * $rad * $rad))

                $colorDist = [Math]::Sqrt(($cr - $nr)*($cr - $nr) + ($cg - $ng)*($cg - $ng) + ($cb - $nb)*($cb - $nb))
                $colorWeight = [Math]::Exp(- ($colorDist * $colorDist) / (2.0 * $sigmaColor * $sigmaColor))

                $weight = $spatialWeight * $colorWeight
                $sumB += $nb * $weight
                $sumG += $ng * $weight
                $sumR += $nr * $weight
                $sumW += $weight
            }

            if ($sumW -gt 0) {
                $tempBytes[$centerIdx] = [byte]($sumB / $sumW)
                $tempBytes[$centerIdx + 1] = [byte]($sumG / $sumW)
                $tempBytes[$centerIdx + 2] = [byte]($sumR / $sumW)
            } else {
                $tempBytes[$centerIdx] = $srcBytes[$centerIdx]
                $tempBytes[$centerIdx + 1] = $srcBytes[$centerIdx + 1]
                $tempBytes[$centerIdx + 2] = $srcBytes[$centerIdx + 2]
            }
        }
    }

    # Vertical pass + 3D PBR Shading passes
    $centerX = $w / 2.0
    $centerY = $h / 2.0
    $maxDist = [Math]::Sqrt($centerX * $centerX + $centerY * $centerY)

    for ($y = 0; $y -lt $h; $y++) {
        $row = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            $centerIdx = $row + ($x * 3)
            $cb = [double]$tempBytes[$centerIdx]
            $cg = [double]$tempBytes[$centerIdx + 1]
            $cr = [double]$tempBytes[$centerIdx + 2]

            $sumB = 0.0
            $sumG = 0.0
            $sumR = 0.0
            $sumW = 0.0

            for ($dy = -$rad; $dy -le $rad; $dy++) {
                $ny = [Math]::Max(0, [Math]::Min($h - 1, $y + $dy))
                $nIdx = ($ny * $stride) + ($x * 3)
                $nb = [double]$tempBytes[$nIdx]
                $ng = [double]$tempBytes[$nIdx + 1]
                $nr = [double]$tempBytes[$nIdx + 2]

                $spatialDist = [Math]::Abs($dy)
                $spatialWeight = [Math]::Exp(- ($spatialDist * $spatialDist) / (2.0 * $rad * $rad))

                $colorDist = [Math]::Sqrt(($cr - $nr)*($cr - $nr) + ($cg - $ng)*($cg - $ng) + ($cb - $nb)*($cb - $nb))
                $colorWeight = [Math]::Exp(- ($colorDist * $colorDist) / (2.0 * $sigmaColor * $sigmaColor))

                $weight = $spatialWeight * $colorWeight
                $sumB += $nb * $weight
                $sumG += $ng * $weight
                $sumR += $nr * $weight
                $sumW += $weight
            }

            $smoothB = if ($sumW -gt 0) { $sumB / $sumW } else { $cb }
            $smoothG = if ($sumW -gt 0) { $sumG / $sumW } else { $cg }
            $smoothR = if ($sumW -gt 0) { $sumR / $sumW } else { $cr }

            # Original raw pixel for edge retention
            $origB = [double]$srcBytes[$centerIdx]
            $origG = [double]$srcBytes[$centerIdx + 1]
            $origR = [double]$srcBytes[$centerIdx + 2]

            # 3D Subsurface blend: 75% smooth 3D skin, 25% sharp features (eyes/lashes/hair)
            $bB = $smoothB * 0.78 + $origB * 0.22
            $bG = $smoothG * 0.78 + $origG * 0.22
            $bR = $smoothR * 0.78 + $origR * 0.22

            # 2. 3D Model Specular Reflection (PBR highlight curve)
            $lum = (0.299 * $bR + 0.587 * $bG + 0.114 * $bB) / 255.0
            $specular = 0.0
            if ($lum -gt 0.38) {
                $specular = [Math]::Pow(($lum - 0.38) / 0.62, $specularExponent) * $specularIntensity * 255.0
            }

            # 3. 3D Fresnel Rim Lighting on outer perimeter
            $distFromCenter = [Math]::Sqrt(($x - $centerX)*($x - $centerX) + ($y - $centerY)*($y - $centerY))
            $normDist = $distFromCenter / $maxDist
            $rim = 0.0
            if ($normDist -gt 0.55) {
                $rimFactor = ($normDist - 0.55) / 0.45
                $rim = [Math]::Pow($rimFactor, 2.0) * $rimLightIntensity * 255.0
            }

            # 4. Ambient Occlusion (soft crevice depth)
            $ao = 1.0
            if ($lum -lt 0.25) {
                $ao = 0.88 + ($lum / 0.25) * 0.12
            }

            # Composite 3D model color
            $rComp = ($bR * $ao) + $specular + ($rim * 0.9)
            $gComp = ($bG * $ao) + $specular + ($rim * 0.95)
            $bComp = ($bB * $ao) + $specular + ($rim * 1.1)

            # S-Curve Contrast (3D DCC / Unreal Engine tone curve)
            $rN = [Math]::Max(0.0, [Math]::Min(1.0, $rComp / 255.0))
            $gN = [Math]::Max(0.0, [Math]::Min(1.0, $gComp / 255.0))
            $bN = [Math]::Max(0.0, [Math]::Min(1.0, $bComp / 255.0))

            $rC = ($rN - 0.5) * $contrast + 0.5
            $gC = ($gN - 0.5) * $contrast + 0.5
            $bC = ($bN - 0.5) * $contrast + 0.5

            # Saturation
            $gray = 0.299 * $rC + 0.587 * $gC + 0.114 * $bC
            $rFin = [Math]::Max(0.0, [Math]::Min(1.0, $gray + ($rC - $gray) * $saturation))
            $gFin = [Math]::Max(0.0, [Math]::Min(1.0, $gray + ($gC - $gray) * $saturation))
            $bFin = [Math]::Max(0.0, [Math]::Min(1.0, $gray + ($bC - $gray) * $saturation))

            $outBytes[$centerIdx] = [byte]($bFin * 255.0)
            $outBytes[$centerIdx + 1] = [byte]($gFin * 255.0)
            $outBytes[$centerIdx + 2] = [byte]($rFin * 255.0)
        }
    }

    $outBitmap = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $dstData = $outBitmap.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    [System.Runtime.InteropServices.Marshal]::Copy($outBytes, 0, $dstData.Scan0, $bytes)
    $outBitmap.UnlockBits($dstData)

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 96)
    $outBitmap.Save($outputFile, $encoder, $encParams)
    $outBitmap.Dispose()
    $src.Dispose()

    Write-Host "Success! Created 3D Model style portrait: $outputFile"
}

Convert-To-3D-Model-Render "public\images\ava-face-square.jpg" "public\images\ava-3d.jpg" 2.5 0.38 1.7 0.28 1.12 1.15
Convert-To-3D-Model-Render "public\images\marcus-face-square.jpg" "public\images\marcus-3d.jpg" 2.5 0.35 1.7 0.25 1.10 1.12
Convert-To-3D-Model-Render "public\images\maya-face-square.jpg" "public\images\maya-3d.jpg" 2.5 0.35 1.7 0.25 1.10 1.12
Convert-To-3D-Model-Render "public\images\elena-face-square.jpg" "public\images\elena-3d.jpg" 2.5 0.38 1.7 0.28 1.12 1.14

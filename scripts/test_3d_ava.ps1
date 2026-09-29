Add-Type -AssemblyName System.Drawing

function Create3DModelStyle($inputFile, $outputFile, $rimColorR, $rimColorG, $rimColorB) {
    $src = [System.Drawing.Bitmap]::new($inputFile)
    $w = $src.Width
    $h = $src.Height
    $out = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)

    # Lock bits for fast processing
    $rect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
    $srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $dstData = $out.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)

    $stride = [Math]::Abs($srcData.Stride)
    $bytes = $stride * $h
    $srcBytes = [byte[]]::new($bytes)
    $dstBytes = [byte[]]::new($bytes)

    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $bytes)

    # 1. First pass: Smart skin smoothing + CGI specular enhancement + Fresnel Rim Light
    $centerX = $w / 2.0
    $centerY = $h / 2.0
    $maxRadius = [Math]::Sqrt($centerX * $centerX + $centerY * $centerY)

    for ($y = 0; $y -lt $h; $y++) {
        $row = $y * $stride
        $dy = $y - $centerY
        for ($x = 0; $x -lt $w; $x++) {
            $idx = $row + ($x * 3)
            $b = [double]$srcBytes[$idx]
            $g = [double]$srcBytes[$idx + 1]
            $r = [double]$srcBytes[$idx + 2]

            # Luminance
            $lum = (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255.0

            # CGI 3D Lighting Curve:
            # - Boost mid-to-high specular highlights (smooth glossy 3D shader look)
            # - Deepen subtle ambient occlusion in shadows
            $specularBoost = 1.0
            if ($lum -gt 0.5) {
                # Smooth quadratic specular highlight typical of 3D skin shaders
                $specularBoost = 1.0 + [Math]::Pow(($lum - 0.5) * 2.0, 1.8) * 0.22
            } elseif ($lum -lt 0.3) {
                # Subtle ambient occlusion deepening
                $specularBoost = 0.88 + ($lum / 0.3) * 0.12
            }

            $rNew = $r * $specularBoost
            $gNew = $g * $specularBoost
            $bNew = $b * $specularBoost

            # Fresnel Rim Light on outer silhouette
            $dx = $x - $centerX
            $dist = [Math]::Sqrt($dx * $dx + $dy * $dy)
            $distNorm = $dist / ($w * 0.48) # 0 at center, ~1.0 near circle boundary

            if ($distNorm -gt 0.72) {
                $rimFactor = [Math]::Pow(($distNorm - 0.72) / 0.28, 2.0) * 0.45
                $rNew = $rNew * (1.0 - $rimFactor) + ($rimColorR * $rimFactor)
                $gNew = $gNew * (1.0 - $rimFactor) + ($rimColorG * $rimFactor)
                $bNew = $bNew * (1.0 - $rimFactor) + ($rimColorB * $rimFactor)
            }

            # Clamp
            $dstBytes[$idx] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $bNew))
            $dstBytes[$idx + 1] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $gNew))
            $dstBytes[$idx + 2] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $rNew))
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($dstBytes, 0, $dstData.Scan0, $bytes)
    $src.UnlockBits($srcData)
    $out.UnlockBits($dstData)

    # 2. Add subtle CGI surface smoothing via high quality Graphics overlay with soft alpha
    # Drawing a soft blurred duplicate at low opacity gives that perfect Unreal/Pixar 3D skin subsurface scattering!
    $g = [System.Drawing.Graphics]::FromImage($out)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Subtle ambient studio vignette around circular frame
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddEllipse(0, 0, $w, $h)
    $pbg = [System.Drawing.Drawing2D.PathGradientBrush]::new($path)
    $pbg.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
    $pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(65, $rimColorR, $rimColorG, $rimColorB))
    $g.FillEllipse($pbg, 0, 0, $w, $h)
    $pbg.Dispose()
    $path.Dispose()

    $g.Dispose()
    $src.Dispose()

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 96)
    $out.Save($outputFile, $encoder, $encParams)
    $out.Dispose()

    Write-Host "Generated 3D Model Style: $outputFile"
}

# Test on Ava with Auris Mint/Emerald/Cyan Rim (R=16, G=185, B=129)
Create3DModelStyle "public\images\ava-face-square.jpg" "public\images\ava-3d.jpg" 30 200 180

Add-Type -AssemblyName System.Drawing

function ConvertTo3DModelLook($inputFile, $outputFile, $specularGain, $smoothRadius) {
    $src = [System.Drawing.Bitmap]::new($inputFile)
    $w = $src.Width
    $h = $src.Height
    $out = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)

    # Lock bits
    $rect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
    $srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $dstData = $out.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)

    $stride = [Math]::Abs($srcData.Stride)
    $bytes = $stride * $h
    $srcBytes = [byte[]]::new($bytes)
    $dstBytes = [byte[]]::new($bytes)

    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $bytes)

    # 1. 3D Model Shader Pass:
    # - Smooth skin tonal transitions (CGI Subsurface scattering)
    # - Accentuate 3D specular reflections (forehead, cheekbones, nose, lips)
    # - Deepen subtle ambient occlusion in facial crevices
    for ($y = 0; $y -lt $h; $y++) {
        $row = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            $idx = $row + ($x * 3)
            $b = [double]$srcBytes[$idx]
            $g = [double]$srcBytes[$idx + 1]
            $r = [double]$srcBytes[$idx + 2]

            # Relative luminance
            $lum = (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255.0

            # 3D SSS & Specular curve:
            # CGI models have softer midtones (subsurface scatter) and higher specular peaks
            $factor = 1.0
            if ($lum -gt 0.45) {
                # Specular sheen on highlights (like 3D Blinn-Phong shader)
                $factor = 1.0 + [Math]::Pow(($lum - 0.45) / 0.55, 1.6) * $specularGain
            } elseif ($lum -lt 0.25) {
                # Ambient Occlusion shading in deep recesses
                $factor = 0.92 + ($lum / 0.25) * 0.08
            }

            # Slight color vibrancy boost typical of 3D game engines (Unreal/Unity)
            $avg = ($r + $g + $b) / 3.0
            $rSat = $avg + ($r - $avg) * 1.08
            $gSat = $avg + ($g - $avg) * 1.08
            $bSat = $avg + ($b - $avg) * 1.08

            $dstBytes[$idx] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $bSat * $factor))
            $dstBytes[$idx + 1] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $gSat * $factor))
            $dstBytes[$idx + 2] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $rSat * $factor))
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($dstBytes, 0, $dstData.Scan0, $bytes)
    $src.UnlockBits($srcData)
    $out.UnlockBits($dstData)

    # 2. CGI Subsurface Bloom overlay:
    # A soft-blended semi-transparent layer simulating light passing through skin
    $g = [System.Drawing.Graphics]::FromImage($out)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Gentle ambient occlusion vignette at circular edge
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddEllipse(2, 2, $w - 4, $h - 4)
    $pbg = [System.Drawing.Drawing2D.PathGradientBrush]::new($path)
    $pbg.CenterColor = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
    $pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(40, 15, 23, 42))
    $g.FillEllipse($pbg, 2, 2, $w - 4, $h - 4)
    $pbg.Dispose()
    $path.Dispose()

    $g.Dispose()
    $src.Dispose()

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 96)
    $out.Save($outputFile, $encoder, $encParams)
    $out.Dispose()

    Write-Host "Processed 3D Model Portrait: $outputFile"
}

ConvertTo3DModelLook "public\images\ava-face-square.jpg" "public\images\ava-3d-model.jpg" 0.22 3
ConvertTo3DModelLook "public\images\marcus-face-square.jpg" "public\images\marcus-3d-model.jpg" 0.20 3
ConvertTo3DModelLook "public\images\maya-face-square.jpg" "public\images\maya-3d-model.jpg" 0.20 3
ConvertTo3DModelLook "public\images\elena-face-square.jpg" "public\images\elena-3d-model.jpg" 0.22 3

Add-Type -AssemblyName System.Drawing

function EnhanceTo3DMetahuman($inputFile, $outputFile, $specularPower, $specularGain, $contrast, $saturation) {
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

    for ($y = 0; $y -lt $h; $y++) {
        $row = $y * $stride
        for ($x = 0; $x -lt $w; $x++) {
            $idx = $row + ($x * 3)
            $b = [double]$srcBytes[$idx]
            $g = [double]$srcBytes[$idx + 1]
            $r = [double]$srcBytes[$idx + 2]

            # 1. Luminance
            $lum = (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255.0

            # 2. 3D CGI Specular Highlight Pass:
            # Emulates 3D Physically-Based Rendering (PBR) specular reflection on high points
            $specular = 0.0
            if ($lum -gt 0.42) {
                $specular = [Math]::Pow(($lum - 0.42) / 0.58, $specularPower) * $specularGain * 255.0
            }

            # 3. Ambient Occlusion (AO) Pass:
            # Soft deepening of micro-shadows
            $ao = 1.0
            if ($lum -lt 0.28) {
                $ao = 0.90 + ($lum / 0.28) * 0.10
            }

            # 4. S-Curve Contrast (3D cinematic tone mapping)
            $rVal = ($r * $ao) + $specular
            $gVal = ($g * $ao) + $specular
            $bVal = ($b * $ao) + $specular

            # Normalize to 0..1
            $rNorm = [Math]::Max(0.0, [Math]::Min(1.0, $rVal / 255.0))
            $gNorm = [Math]::Max(0.0, [Math]::Min(1.0, $gVal / 255.0))
            $bNorm = [Math]::Max(0.0, [Math]::Min(1.0, $bVal / 255.0))

            # Apply S-curve contrast around 0.5
            $rC = ($rNorm - 0.5) * $contrast + 0.5
            $gC = ($gNorm - 0.5) * $contrast + 0.5
            $bC = ($bNorm - 0.5) * $contrast + 0.5

            # Saturation enhancement
            $gray = 0.299 * $rC + 0.587 * $gC + 0.114 * $bC
            $rFinal = $gray + ($rC - $gray) * $saturation
            $gFinal = $gray + ($gC - $gray) * $saturation
            $bFinal = $gray + ($bC - $gray) * $saturation

            $dstBytes[$idx] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $bFinal * 255.0))
            $dstBytes[$idx + 1] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $gFinal * 255.0))
            $dstBytes[$idx + 2] = [byte][Math]::Max(0.0, [Math]::Min(255.0, $rFinal * 255.0))
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($dstBytes, 0, $dstData.Scan0, $bytes)
    $src.UnlockBits($srcData)
    $out.UnlockBits($dstData)

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 96)
    $out.Save($outputFile, $encoder, $encParams)
    $out.Dispose()
    $src.Dispose()

    Write-Host "Processed 3D Metahuman look: $outputFile"
}

# Ava (cool blue studio lighting) -> enhance 3D CGI specular & contrast
EnhanceTo3DMetahuman "public\images\ava-face-square.jpg" "public\images\ava-3d.jpg" 1.4 0.24 1.10 1.14

# Marcus (warm enterprise advisor) -> enhance 3D CGI specular & contrast
EnhanceTo3DMetahuman "public\images\marcus-face-square.jpg" "public\images\marcus-3d.jpg" 1.5 0.22 1.08 1.10

# Maya (operations dispatcher) -> enhance 3D CGI specular & contrast
EnhanceTo3DMetahuman "public\images\maya-face-square.jpg" "public\images\maya-3d.jpg" 1.5 0.22 1.08 1.10

# Elena (concierge) -> enhance 3D CGI specular & contrast
EnhanceTo3DMetahuman "public\images\elena-face-square.jpg" "public\images\elena-3d.jpg" 1.4 0.24 1.10 1.12

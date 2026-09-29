Add-Type -AssemblyName System.Drawing

$inputPath = "public\images\ameca.jpg"
$outputPath = "public\images\humanoid-robot-transparent.png"
$bmp = [System.Drawing.Bitmap]::new($inputPath)
$w = $bmp.Width
$h = $bmp.Height

$outBmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for fast pixel processing
$rect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
$srcData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytes = [Math]::Abs($srcData.Stride) * $h
$srcRgbValues = [byte[]]::new($bytes)
$dstRgbValues = [byte[]]::new($bytes)

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcRgbValues, 0, $bytes)

# Ameca has white background (> 235)
for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = $srcRgbValues[$i]
    $g = $srcRgbValues[$i + 1]
    $r = $srcRgbValues[$i + 2]
    
    # Check if close to white background
    if ($r -gt 232 -and $g -gt 232 -and $b -gt 232) {
        $dstRgbValues[$i] = 0
        $dstRgbValues[$i + 1] = 0
        $dstRgbValues[$i + 2] = 0
        $dstRgbValues[$i + 3] = 0 # Transparent
    } elseif ($r -gt 215 -and $g -gt 215 -and $b -gt 215) {
        # Soft feathering at the boundary
        $factor = ($r + $g + $b) / (3.0 * 255.0)
        $alpha = [byte](255 * [Math]::Max(0.0, [Math]::Min(1.0, (1.0 - $factor) / 0.15)))
        $dstRgbValues[$i] = $b
        $dstRgbValues[$i + 1] = $g
        $dstRgbValues[$i + 2] = $r
        $dstRgbValues[$i + 3] = $alpha
    } else {
        $dstRgbValues[$i] = $b
        $dstRgbValues[$i + 1] = $g
        $dstRgbValues[$i + 2] = $r
        $dstRgbValues[$i + 3] = 255
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($dstRgbValues, 0, $dstData.Scan0, $bytes)

$bmp.UnlockBits($srcData)
$outBmp.UnlockBits($dstData)

$outBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$outBmp.Dispose()

Write-Host "Successfully generated transparent humanoid robot portrait at $outputPath"

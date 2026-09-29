Add-Type -AssemblyName System.Drawing

$inputPath = "public\images\ameca.jpg"
$outputPath = "public\images\ameca-portrait.jpg"
$src = [System.Drawing.Bitmap]::new($inputPath)

# Source is 878 x 973
# Face center is at x: 445, y: 220
# A 520x520 box centered on (445, 270) captures the head, face, eyes, neck and top of chest
$cropW = 520
$cropH = 520
$cropX = [int](445 - ($cropW / 2)) # 185
$cropY = 30 # from top of head

$dstSize = 600
$final = [System.Drawing.Bitmap]::new($dstSize, $dstSize, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($final)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH)
$dstRect = [System.Drawing.Rectangle]::new(0, 0, $dstSize, $dstSize)

$g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$src.Dispose()

# Save with 95% quality JPEG
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 95)

$final.Save($outputPath, $encoder, $encParams)
$final.Dispose()

Write-Host "Created crisp portrait at $outputPath"

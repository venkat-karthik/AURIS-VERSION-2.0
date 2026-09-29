Add-Type -AssemblyName System.Drawing

function CropFace($inputFile, $outputFile, $cropX, $cropY, $cropSize) {
    $src = [System.Drawing.Bitmap]::new($inputFile)
    $dstSize = 600
    $final = [System.Drawing.Bitmap]::new($dstSize, $dstSize, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($final)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $srcRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropSize, $cropSize)
    $dstRect = [System.Drawing.Rectangle]::new(0, 0, $dstSize, $dstSize)

    $g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $src.Dispose()

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 96)

    $final.Save($outputFile, $encoder, $encParams)
    $final.Dispose()
    Write-Host "Created face crop: $outputFile"
}

# 1. Ava: 800 x 1000
CropFace "public\images\ava-face.jpg" "public\images\ava-face-square.jpg" 130 80 620

# 2. Marcus: 800 x 1200
CropFace "public\images\marcus-face.jpg" "public\images\marcus-face-square.jpg" 75 100 650

# 3. Maya: 800 x 1200
CropFace "public\images\maya-face.jpg" "public\images\maya-face-square.jpg" 175 60 550

# 4. Elena: 800 x 1200
CropFace "public\images\elena-raw.jpg" "public\images\elena-face-square.jpg" 110 80 640

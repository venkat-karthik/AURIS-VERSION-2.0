Add-Type -AssemblyName System.Drawing

$inputPath = "public\images\humanoid-robot-transparent.png"
$outputPath = "public\images\auris-humanoid-avatar.png"
$src = [System.Drawing.Bitmap]::new($inputPath)

$size = 600
$final = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($final)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# 1. Background: Deep futuristic cyber-studio gradient with Auris emerald/teal ambient light
$bgBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($size, $size),
    [System.Drawing.Color]::FromArgb(255, 12, 22, 33),  # Deep Auris Navy Slate
    [System.Drawing.Color]::FromArgb(255, 6, 13, 20)    # Dark Midnight
)
$g.FillRectangle($bgBrush, 0, 0, $size, $size)
$bgBrush.Dispose()

# Radial Emerald Aura behind head
$path = [System.Drawing.Drawing2D.GraphicsPath]::new()
$path.AddEllipse(70, 40, 460, 460)
$pbg = [System.Drawing.Drawing2D.PathGradientBrush]::new($path)
$pbg.CenterColor = [System.Drawing.Color]::FromArgb(90, 16, 185, 129) # Emerald #10B981
$pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 14, 165, 233))
$g.FillEllipse($pbg, 70, 40, 460, 460)
$pbg.Dispose()
$path.Dispose()

# 2. Draw the humanoid robot cropped and centered
# Source is 878 wide x 973 high.
# Head is roughly x: 260 to 620 (width ~360), y: 30 to 480 (height ~450).
# Center of head is around x: 440, y: 240.
$srcRect = [System.Drawing.Rectangle]::new(80, 20, 720, 720)
$dstRect = [System.Drawing.Rectangle]::new(0, 0, $size, $size)

$g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

# 3. Add glowing cybernetic circuitry matching Auris theme (#10B981 and #0EA5E9)
# Pen for glowing temple & jawline circuit trace
$glowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(180, 16, 185, 129), 3) # Emerald
$glowPenCore = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(240, 167, 243, 208), 1.5) # Mint core

# Temple circuit
$g.DrawCurve($glowPen, @(
    [System.Drawing.Point]::new(245, 150),
    [System.Drawing.Point]::new(255, 185),
    [System.Drawing.Point]::new(270, 220)
))
$g.DrawCurve($glowPenCore, @(
    [System.Drawing.Point]::new(245, 150),
    [System.Drawing.Point]::new(255, 185),
    [System.Drawing.Point]::new(270, 220)
))

# Jawline cyber-seam light
$g.DrawCurve($glowPen, @(
    [System.Drawing.Point]::new(270, 220),
    [System.Drawing.Point]::new(305, 260),
    [System.Drawing.Point]::new(350, 280)
))
$g.DrawCurve($glowPenCore, @(
    [System.Drawing.Point]::new(270, 220),
    [System.Drawing.Point]::new(305, 260),
    [System.Drawing.Point]::new(350, 280)
))

# Symmetrical subtle accent on left temple
$cyanPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(140, 14, 165, 233), 2.5) # Sky Cyan
$g.DrawCurve($cyanPen, @(
    [System.Drawing.Point]::new(400, 170),
    [System.Drawing.Point]::new(415, 205),
    [System.Drawing.Point]::new(420, 245)
))
$cyanPen.Dispose()

# Glowing Comm Node at ear (SIP/WebRTC AI Voice Indicator)
$earGlowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(240, 16, 185, 129))
$g.FillEllipse($earGlowBrush, 238, 195, 9, 9)
$earGlowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(120, 52, 211, 153), 4)
$g.DrawEllipse($earGlowPen, 235, 192, 15, 15)
$earGlowBrush.Dispose()
$earGlowPen.Dispose()

# Iris specular cyan glow (realistic life-spark in eyes)
# Left eye ~ (320, 150), Right eye ~ (400, 158)
$eyeSpark = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(210, 56, 189, 248))
$g.FillEllipse($eyeSpark, 318, 148, 4, 4)
$g.FillEllipse($eyeSpark, 398, 156, 4, 4)
$eyeSpark.Dispose()

# Soft vignette ring around edge of avatar
$vigPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(80, 16, 185, 129), 6)
$g.DrawEllipse($vigPen, 3, 3, $size - 6, $size - 6)
$vigPen.Dispose()

$glowPen.Dispose()
$glowPenCore.Dispose()
$g.Dispose()
$src.Dispose()

$final.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$final.Dispose()

Write-Host "Created themed Auris Humanoid Robot avatar at $outputPath"

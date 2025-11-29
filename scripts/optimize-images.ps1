
# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

$sourceDir = "public\images\marketplaces"
$files = Get-ChildItem -Path $sourceDir -Filter "*.png"

foreach ($file in $files) {
    Write-Host "Optimizing $($file.Name)..."
    
    $image = [System.Drawing.Image]::FromFile($file.FullName)
    
    # Calculate new dimensions (max width 400px)
    $maxWidth = 400
    if ($image.Width -gt $maxWidth) {
        $newWidth = $maxWidth
        $newHeight = [int]($image.Height * ($maxWidth / $image.Width))
        
        $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graph = [System.Drawing.Graphics]::FromImage($bitmap)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graph.DrawImage($image, 0, 0, $newWidth, $newHeight)
        
        $image.Dispose()
        
        # Save with compression
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/png" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85)
        
        $bitmap.Save($file.FullName, $codec, $encoderParams)
        $bitmap.Dispose()
        $graph.Dispose()
        
        Write-Host "Resized and saved $($file.Name)"
    } else {
        $image.Dispose()
        Write-Host "Skipping $($file.Name) (already small enough)"
    }
}

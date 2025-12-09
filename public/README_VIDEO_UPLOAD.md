# How to Upload Your Hero Video

## Video File Location

Place your video file in the `public/` directory with one of these names:
- `hero-video.mp4` (recommended - most compatible)
- `hero-video.webm` (alternative format for better compression)

## Supported Formats

The hero section supports:
- **MP4** (H.264 codec) - Best browser compatibility
- **WebM** (VP9 codec) - Better compression, smaller file size

## Video Specifications (Recommended)

- **Resolution**: 1920x1080 (Full HD) or higher
- **Aspect Ratio**: 16:9
- **Duration**: 10-30 seconds (will loop)
- **File Size**: Under 10MB for best performance (use compression if needed)
- **Frame Rate**: 24-30fps

## How to Upload

### Option 1: Drag and Drop
1. Open the `public/` folder in your file explorer
2. Drag your video file into the folder
3. Rename it to `hero-video.mp4` (or `hero-video.webm`)

### Option 2: Command Line
```bash
# Copy your video file to the public directory
cp /path/to/your/video.mp4 public/hero-video.mp4
```

### Option 3: Using Cursor/VS Code
1. Right-click on the `public/` folder in the file explorer
2. Select "Upload" or "Add File"
3. Select your video file
4. Rename it to `hero-video.mp4`

## Video Compression Tips

If your video is too large, compress it using:

### Using FFmpeg (Command Line)
```bash
# Compress MP4 video
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -crf 23 -preset medium hero-video.mp4

# Or create WebM version (smaller file size)
ffmpeg -i input.mp4 -vcodec libvpx-vp9 -acodec libopus -crf 30 hero-video.webm
```

### Online Tools
- [CloudConvert](https://cloudconvert.com/mp4-converter)
- [HandBrake](https://handbrake.fr/) (Desktop app)
- [FreeConvert](https://www.freeconvert.com/mp4-compressor)

## Testing

After uploading:
1. Restart your dev server (`npm run dev`)
2. Navigate to `http://localhost:3000`
3. The video should play automatically in the hero section background

## Fallback

If the video doesn't load, the hero section will automatically fall back to:
1. A blurred background image
2. A dark gradient overlay

The video will loop automatically and be muted for autoplay compatibility.


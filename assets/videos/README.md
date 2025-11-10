# Video Backgrounds for Clear Seas Enhanced

This directory contains background videos for cards, headers, and sections.

## 📁 Required Videos

Place your videos from the Google Drive folder here with these exact names:

### Hero Section
- **hero-bg.mp4** - Main hero background (abstract/flowing visuals)
  - Recommended: Abstract, flowing, tech-inspired
  - Opacity: 25%, heavily blurred
  - Style: `video-bg-abstract`

### Signal Cards (Hero Panels)
- **card-cyan.mp4** - Boutique Independence card
  - Recommended: Cyan/blue tones, geometric patterns
  - Opacity: 20%, medium blur
  - Style: `video-bg-cyan`

- **card-tech.mp4** - Cost-Effective Excellence card
  - Recommended: Tech/data visualization, grid patterns
  - Opacity: 20%, medium blur
  - Style: `video-bg-tech`

- **card-magenta.mp4** - Real-World Experience card
  - Recommended: Magenta/pink tones, organic motion
  - Opacity: 20%, medium blur
  - Style: `video-bg-magenta`

## 🎨 Optional Videos (Add if desired)

### Capability Cards
- **capability-1.mp4** - Custom AI Development
- **capability-2.mp4** - AI Strategy & Planning
- **capability-3.mp4** - Integration & Support

### Platform Cards
- **platform-parserstor.mp4** - Parserstor card background
- **platform-vib3code.mp4** - Vib3Code card background
- **platform-stacks.mp4** - Client Intelligence Stacks card

### Section Headers
- **research-bg.mp4** - Research/Approach section background
- **contact-bg.mp4** - Contact section background

## 📋 Video Specifications

### Recommended Settings:
- **Resolution**: 1920x1080 (1080p) or 1280x720 (720p)
- **Format**: MP4 (H.264)
- **Duration**: 10-30 seconds (will loop seamlessly)
- **Frame Rate**: 30fps
- **File Size**: Keep under 5MB per video (optimize for web)
- **Audio**: Remove audio track (videos are muted)

### Optimization Tips:
```bash
# Using FFmpeg to optimize videos:
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -vf scale=1280:720 -crf 28 -preset slow output.mp4
```

## 🎯 From Google Drive

Your videos are in: `https://drive.google.com/drive/folders/1E6WPAjNqkh6JbMbHxdBiPIKRL8F7PxiQ`

### Download Instructions:
1. Make the folder publicly accessible (Share → Anyone with link)
2. Right-click each video → Download
3. Rename to match the filenames above
4. Place in this directory (`assets/videos/`)

## 🎨 Video Style Classes

The CSS includes these pre-configured style classes:

- `.video-bg-cyan` - Cyan hue shift, high saturation
- `.video-bg-magenta` - Magenta hue shift, high saturation
- `.video-bg-tech` - Desaturated, high contrast overlay
- `.video-bg-abstract` - Balanced blur and screen blend mode

## 🚀 How It Works

1. **Lazy Loading**: Videos only load when scrolled into view
2. **Performance**:
   - Disabled on mobile devices
   - Paused when page is hidden
   - Respects `prefers-reduced-motion`
3. **Fallback**: Gradient backgrounds show while loading or if video fails

## 🔧 Adding More Videos

To add video backgrounds to other elements:

```html
<div class="your-element">
    <div class="video-background">
        <video data-src="assets/videos/your-video.mp4"
               muted loop playsinline
               class="video-bg-cyan">
        </video>
    </div>
    <!-- Your content -->
</div>
```

Make sure the parent element has `position: relative` and `overflow: hidden`.

## 📊 Current Video Usage

- [x] Hero section - `hero-bg.mp4`
- [x] Signal Card 1 (Boutique) - `card-cyan.mp4`
- [x] Signal Card 2 (Cost-Effective) - `card-tech.mp4`
- [x] Signal Card 3 (Experience) - `card-magenta.mp4`
- [ ] Capability Cards (optional)
- [ ] Platform Cards (optional)
- [ ] Section Headers (optional)

## 🎬 Recommended Videos from Google Drive

Based on typical naming patterns, look for videos like:
- Neon/holographic effects
- Geometric patterns
- Flowing abstract visuals
- Tech/data visualizations
- Color gradient animations

## 🐛 Troubleshooting

**Videos not playing?**
- Check browser console for errors
- Verify video files are in correct directory
- Ensure videos are web-optimized MP4 format
- Try a different browser (autoplay policies vary)

**Performance issues?**
- Reduce video resolution
- Compress videos further
- Disable some video backgrounds
- Videos auto-disable on mobile

**Videos too prominent?**
- Adjust opacity in `video-backgrounds.css`
- Increase blur amount
- Change mix-blend-mode

---

🌟 **A Paul Phillips Manifestation**

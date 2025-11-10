# Quick Video Setup Guide

## 🎯 To Add Your Videos from Google Drive

### Step 1: Make Drive Folder Public
1. Go to: https://drive.google.com/drive/folders/1E6WPAjNqkh6JbMbHxdBiPIKRL8F7PxiQ
2. Click "Share" button
3. Change to "Anyone with the link can view"
4. Copy link

### Step 2: Download Videos
Download these 4 videos (or similar):
- 1 abstract/flowing video for hero background
- 3 colorful videos for cards (cyan, tech, magenta themes)

### Step 3: Rename & Place
Rename the downloaded videos:
```
your-video-1.mp4  →  hero-bg.mp4
your-video-2.mp4  →  card-cyan.mp4
your-video-3.mp4  →  card-tech.mp4
your-video-4.mp4  →  card-magenta.mp4
```

Place in: `/mnt/c/Users/millz/ClearSeas-Enhanced/assets/videos/`

### Step 4: Commit & Deploy
```bash
cd /mnt/c/Users/millz/ClearSeas-Enhanced
git add assets/videos/
git commit -m "Add video backgrounds from Google Drive"
git push origin enhanced-combined-visualizer
```

## 🎨 Alternative: Use Direct Google Drive Links

If you can't download, you can use direct Google Drive streaming:

1. Get shareable link for each video
2. Convert to direct link format:
   ```
   https://drive.google.com/file/d/FILE_ID/view
   → https://drive.google.com/uc?export=download&id=FILE_ID
   ```
3. Update `index.html` video sources to use these links

## ⚡ Quick Test

To test the system without videos:
1. Videos will show gradient fallbacks
2. Logo should be visible in header
3. All styling and structure is ready

## 📝 What's Already Done

✅ Video background CSS system
✅ Lazy loading JavaScript
✅ Mobile/reduced-motion handling
✅ Logo added to header
✅ HTML structure with video placeholders
✅ Performance optimization
✅ Fallback gradients

🎬 **Just add videos and deploy!**

---

## 🚀 Deploy Without Videos (Test First)

You can deploy now to test the structure:
```bash
git add .
git commit -m "✨ Add video background system (videos pending)"
git push origin enhanced-combined-visualizer
```

Videos can be added later without breaking anything.

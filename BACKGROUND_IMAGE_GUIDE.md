# Full Background Image Implementation Guide

## Overview
This guide explains how to add a full background image to the MediTrack landing page.

## CSS Properties Added

The following CSS properties have been added to `/frontend/src/pages/Home.css`:

### `.home-wrapper` Class
```css
background-image: url('path-to-your-image.jpg');
background-size: cover;
background-position: center;
background-repeat: no-repeat;
background-attachment: fixed;
position: relative;
```

### Properties Explanation

1. **`background-image: url('path-to-your-image.jpg')`**
   - Sets the background image
   - Replace `'path-to-your-image.jpg'` with your actual image path

2. **`background-size: cover`**
   - Ensures the image covers the entire viewport
   - Image scales proportionally to fill the container
   - No empty spaces will appear

3. **`background-position: center`**
   - Centers the image both horizontally and vertically
   - Ensures the most important part of the image is visible

4. **`background-repeat: no-repeat`**
   - Prevents the image from repeating/tiling
   - Shows only one instance of the image

5. **`background-attachment: fixed`**
   - Creates a parallax scrolling effect
   - Image stays fixed while content scrolls over it
   - Alternative: Use `scroll` for normal scrolling behavior

6. **`position: relative`**
   - Required for the overlay to work properly
   - Allows z-index layering

## Optional Overlay

An overlay has been added for better text readability:

```css
.home-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  z-index: 0;
  pointer-events: none;
}
```

### Customizing the Overlay

- **Light overlay (current)**: `rgba(255, 255, 255, 0.1)` - 10% white
- **Darker overlay**: `rgba(0, 0, 0, 0.3)` - 30% black
- **No overlay**: Comment out or remove the entire `.home-wrapper::before` block
- **Adjust opacity**: Change the last number (0.1) to any value between 0 (transparent) and 1 (opaque)

## How to Use

### Step 1: Add Your Image
Place your background image in the `/frontend/public/` directory.
Example: `/frontend/public/background.jpg`

### Step 2: Update the CSS
Edit `/frontend/src/pages/Home.css` and update line 26:
```css
background-image: url('/background.jpg');
```

### Step 3: Build and Preview
```bash
cd frontend
npm run build
npm run preview
```

## Image Recommendations

- **File format**: JPG (smaller file size) or PNG (if transparency needed)
- **Resolution**: 1920x1080 or higher for sharp display on large screens
- **File size**: Optimize to < 500KB for faster loading
- **Content**: Use images with neutral/soft areas for text placement
- **Contrast**: Consider image brightness relative to text colors

## Alternative Approaches

### Multiple Background Images
```css
background-image: 
  linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)),
  url('/background.jpg');
```

### Responsive Background Images
```css
/* Mobile */
@media (max-width: 768px) {
  .home-wrapper {
    background-image: url('/background-mobile.jpg');
  }
}

/* Desktop */
@media (min-width: 769px) {
  .home-wrapper {
    background-image: url('/background-desktop.jpg');
  }
}
```

### Using CSS Variables
In `index.css`:
```css
:root {
  --background-image: url('/background.jpg');
}
```

In `Home.css`:
```css
.home-wrapper {
  background-image: var(--background-image);
}
```

## Troubleshooting

### Image Not Showing
- Check the file path is correct
- Ensure the image is in the `/frontend/public/` directory
- Verify the image file name matches exactly (case-sensitive)
- Clear browser cache and rebuild

### Image Too Large/Slow Loading
- Optimize the image using tools like TinyPNG or ImageOptim
- Consider using WebP format for better compression
- Use lazy loading for better performance

### Text Not Readable
- Adjust the overlay opacity
- Use a darker or lighter overlay depending on image brightness
- Consider adding text shadows: `text-shadow: 2px 2px 4px rgba(0,0,0,0.5);`

## Additional Resources

- [MDN - background-image](https://developer.mozilla.org/en-US/docs/Web/CSS/background-image)
- [MDN - background-size](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size)
- [CSS Tricks - Perfect Full Page Background Image](https://css-tricks.com/perfect-full-page-background-image/)

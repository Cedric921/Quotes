#!/bin/bash

# Script to generate app icons and splash screens for Expo/React Native
# Usage: ./generate-icons.sh

ASSETS_DIR="$(dirname "$0")/../assets/images"
SOURCE_TRANSPARENT="$ASSETS_DIR/source-icon-transparent.png"
SOURCE_WHITE="$ASSETS_DIR/source-icon-white.png"

# Create images directory if it doesn't exist
mkdir -p "$ASSETS_DIR"

# Check if source images exist
if [ ! -f "$SOURCE_TRANSPARENT" ]; then
    echo "❌ Error: $SOURCE_TRANSPARENT not found"
    echo "Please save the transparent background icon as source-icon-transparent.png"
    exit 1
fi

if [ ! -f "$SOURCE_WHITE" ]; then
    echo "❌ Error: $SOURCE_WHITE not found"
    echo "Please save the white background icon as source-icon-white.png"
    exit 1
fi

echo "🎨 Generating app icons and splash screens..."

# 1. app-icon-all.png 1024x1024 (with white background)
echo "→ Creating app-icon-all.png (1024x1024, white background)..."
sips -z 1024 1024 "$SOURCE_WHITE" --out "$ASSETS_DIR/app-icon-all.png" 2>/dev/null

# 2. app-icon-android-legacy.png 1024x1024 (with white background)
echo "→ Creating app-icon-android-legacy.png (1024x1024, white background)..."
sips -z 1024 1024 "$SOURCE_WHITE" --out "$ASSETS_DIR/app-icon-android-legacy.png" 2>/dev/null

# 3. app-icon-android-adaptive-foreground.png 1024x1024 (transparent)
echo "→ Creating app-icon-android-adaptive-foreground.png (1024x1024, transparent)..."
sips -z 1024 1024 "$SOURCE_TRANSPARENT" --out "$ASSETS_DIR/app-icon-android-adaptive-foreground.png" 2>/dev/null

# 4. splash-logo-android-universal.png 1242x2437 (icon centered, transparent)
echo "→ Creating splash-logo-android-universal.png (1242x2437, centered icon)..."
# First resize icon to fit nicely in splash (about 40% of width = ~500px)
ICON_SIZE=500
CANVAS_W=1242
CANVAS_H=2437

# Create temporary resized icon
TEMP_ICON="/tmp/temp-splash-icon.png"
sips -z $ICON_SIZE $ICON_SIZE "$SOURCE_TRANSPARENT" --out "$TEMP_ICON" 2>/dev/null

# Use Python to create centered splash (since sips can't do canvas operations)
python3 << EOF
from PIL import Image
import os

# Open the icon
icon = Image.open("$TEMP_ICON").convert("RGBA")

# Create transparent canvas
canvas = Image.new("RGBA", ($CANVAS_W, $CANVAS_H), (0, 0, 0, 0))

# Calculate center position
x = ($CANVAS_W - $ICON_SIZE) // 2
y = ($CANVAS_H - $ICON_SIZE) // 2

# Paste icon onto canvas
canvas.paste(icon, (x, y), icon)

# Save
canvas.save("$ASSETS_DIR/splash-logo-android-universal.png")
print("   ✓ splash-logo-android-universal.png created")
EOF

# 5. splash-logo-all.png 1440x2561 (icon centered, transparent)
echo "→ Creating splash-logo-all.png (1440x2561, centered icon)..."
CANVAS_W2=1440
CANVAS_H2=2561
ICON_SIZE2=550

# Create temporary resized icon
TEMP_ICON2="/tmp/temp-splash-icon2.png"
sips -z $ICON_SIZE2 $ICON_SIZE2 "$SOURCE_TRANSPARENT" --out "$TEMP_ICON2" 2>/dev/null

python3 << EOF
from PIL import Image

# Open the icon
icon = Image.open("$TEMP_ICON2").convert("RGBA")

# Create transparent canvas
canvas = Image.new("RGBA", ($CANVAS_W2, $CANVAS_H2), (0, 0, 0, 0))

# Calculate center position
x = ($CANVAS_W2 - $ICON_SIZE2) // 2
y = ($CANVAS_H2 - $ICON_SIZE2) // 2

# Paste icon onto canvas
canvas.paste(icon, (x, y), icon)

# Save
canvas.save("$ASSETS_DIR/splash-logo-all.png")
print("   ✓ splash-logo-all.png created")
EOF

# Cleanup temp files
rm -f /tmp/temp-splash-icon.png /tmp/temp-splash-icon2.png

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "Generated files in $ASSETS_DIR:"
ls -la "$ASSETS_DIR"/*.png 2>/dev/null | awk '{print "   " $9 " (" $5 " bytes)"}'


#!/usr/bin/env bash
# Render the launcher PNGs from ic_launcher.svg (needs rsvg-convert and ImageMagick).
# The PNGs are what F-Droid shows in the store listing; launchers on API 26+ use the adaptive icon.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
res="$here/../app/src/main/res"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for pair in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
  dpi="${pair%%:*}" px="${pair##*:}"
  full=$((px * 108 / 72))
  mkdir -p "$res/mipmap-$dpi"
  rsvg-convert -w "$full" -h "$full" "$here/ic_launcher.svg" -o "$tmp/full.png"
  off=$(((full - px) / 2))
  magick "$tmp/full.png" -crop "${px}x${px}+${off}+${off}" +repage "$tmp/crop.png"
  r=$((px * 18 / 100))
  magick "$tmp/crop.png" \( -size "${px}x${px}" xc:none -fill white -draw "roundrectangle 0,0 $((px - 1)),$((px - 1)) $r,$r" \) \
    -compose CopyOpacity -composite -strip "$res/mipmap-$dpi/ic_launcher.png"
  magick "$tmp/crop.png" \( -size "${px}x${px}" xc:none -fill white -draw "circle $((px / 2)),$((px / 2)) $((px / 2)),0" \) \
    -compose CopyOpacity -composite -strip "$res/mipmap-$dpi/ic_launcher_round.png"
done

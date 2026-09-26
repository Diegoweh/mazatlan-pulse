#!/usr/bin/env bash
#
# Turns a camera/export master into web-ready background loops.
#
#   scripts/encode-web-video.sh public/video/video-1.mp4 [max-width]
#
# Produces <name>.mp4 (H.264) under public/video/web/. Originals are untouched.
#
# No webm: measured on this project's footage, VP9 came out 40-70% LARGER than
# x264 at matching visual quality, and every browser that matters plays H.264.
# A second file would cost bytes and buy nothing.
#
# Choices, and why:
#   -an            background loops are muted, so an audio track is pure waste
#   +faststart     moves the index to the front so playback starts before the
#                  whole file has arrived
#   yuv420p        the only pixel format every browser decodes
#   crf            quality-targeted, not bitrate-targeted: simple footage gets
#                  small automatically instead of being padded to a fixed rate
#   scale + even   H.264 requires even dimensions; -2 keeps the aspect ratio
set -euo pipefail

src="${1:?usage: encode-web-video.sh <input> [max-width]}"
max_width="${2:-1280}"

name="$(basename "${src%.*}")"
outdir="$(dirname "$src")/web"
mkdir -p "$outdir"

before=$(wc -c < "$src" | tr -d ' ')

echo "→ $name  (origen: $((before / 1024 / 1024)) MB, ancho maximo destino: ${max_width}px)"

ffmpeg -y -loglevel error -i "$src" \
  -vf "scale='min($max_width,iw)':-2:flags=lanczos" \
  -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p \
  -movflags +faststart -an \
  "$outdir/$name.mp4"

mp4=$(wc -c < "$outdir/$name.mp4" | tr -d ' ')
printf '  mp4 : %6s KB  (%.1f%% del original)\n' "$((mp4 / 1024))" "$(echo "$mp4 $before" | awk '{print $1/$2*100}')"

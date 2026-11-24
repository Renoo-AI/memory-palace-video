#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-final}"

if [[ "$MODE" == "preview" ]]; then
  echo "Encoding preview_720.mp4 (1280x720 @ 15fps -> CFR 30fps)..."
  ffmpeg -y -framerate 15 -i renders/preview/frame_%05d.png -i audio/mix.wav \
    -vf "fps=30" -c:v libx264 -pix_fmt yuv420p -crf 20 -c:a aac -b:a 192k -ar 48000 -shortest preview_720.mp4
else
  echo "Encoding final.mp4 (1920x1080 @ 30fps, yuv420p, AAC 48kHz)..."
  ffmpeg -y -framerate 30 -i renders/final/frame_%05d.png -i audio/mix.wav \
    -c:v libx264 -pix_fmt yuv420p -crf 16 -preset medium -c:a aac -b:a 192k -ar 48000 -shortest final.mp4
fi

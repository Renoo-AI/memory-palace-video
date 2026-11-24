#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${1:-renders/final}"
STEP="${2:-120}" # 120 frames @ 30fps = 4s; pass 60 for 15fps preview

echo "Building contact_sheet.png from ${SRC_DIR} (every ${STEP} frames = 4s)..."
ffmpeg -y -i "${SRC_DIR}/frame_%05d.png" \
  -vf "select='not(mod(n\,${STEP}))',scale=320:180,drawtext=text='%{expr\:n*4}s':x=8:y=8:fontsize=16:fontcolor=black:box=1:boxcolor=white@0.85,tile=7x6" \
  -frames:v 1 contact_sheet.png

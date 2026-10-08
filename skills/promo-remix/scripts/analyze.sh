#!/usr/bin/env bash
# Usage: analyze.sh <video> <outdir>
# Writes 4fps timestamped contact sheets (sheet_NN.jpg, 16 frames = 4s each)
# and a full-res frame every second (full/f_SS.png) for cropping assets.
set -euo pipefail
V="$1"; O="$2"; mkdir -p "$O/full"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of compact "$V"
ffmpeg -v error -y -i "$V" -vf "fps=4,scale=320:-1,drawtext=text='%{pts\:hms}':x=5:y=5:fontsize=14:fontcolor=yellow:box=1:boxcolor=black,tile=4x4" "$O/sheet_%02d.jpg"
ffmpeg -v error -y -i "$V" -vf fps=1 "$O/full/f_%02d.png"
ls "$O"

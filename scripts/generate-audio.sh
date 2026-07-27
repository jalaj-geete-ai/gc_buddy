#!/usr/bin/env bash
# Regenerate every German audio clip in public/audio.
#
# Run from the repo root:  bash scripts/generate-audio.sh
# Takes about 5 minutes and needs ~100 MB of scratch space.
#
# WHY THIS EXISTS
# Android WebView has no Web Speech API, so speechSynthesis cannot work inside
# the mobile app. All German audio is therefore pre-generated and shipped as
# static MP3s under public/audio, played with a plain <audio> element.
#
# WHAT IT PRODUCES
#   public/audio/ph/<LEVEL>-<index>.mp3   544 listening phrases   (A1-B2)
#   public/audio/w/<wordId>.mp3          1200 vocabulary words
# Word ids are day*100 + position, matching public/vocab.json.
#
# VOICE
# Piper neural TTS, German female voice "kerstin" (low quality tier — the only
# German female voice mirrored on GitHub; HuggingFace was unreachable from the
# build sandbox). If you can reach a commercial TTS API, prefer it: the whole
# corpus is ~72k characters, which is about $1.15 on Google or Azure neural
# voices and sounds markedly better. Keep the filenames identical and nothing
# in the app needs to change.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${TMPDIR:-/tmp}/gcbuddy-tts"
VOICE_URL="https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-kerstin-low.tar.gz"
PIPER_URL="https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz"

command -v ffmpeg >/dev/null || { echo "ffmpeg required: apt-get install -y ffmpeg"; exit 1; }

mkdir -p "$WORK" && cd "$WORK"
[ -x piper/piper ]        || { echo "→ fetching piper";  curl -sL "$PIPER_URL" -o piper.tar.gz && tar xzf piper.tar.gz; }
[ -f de-kerstin-low.onnx ] || { echo "→ fetching voice";  curl -sL "$VOICE_URL" -o voice.tar.gz && tar xzf voice.tar.gz; }
export LD_LIBRARY_PATH="$WORK/piper:${LD_LIBRARY_PATH:-}"

echo "→ building job list"
node "$ROOT/scripts/audio-jobs.mjs" "$ROOT" > "$WORK/batch.jsonl"
echo "  $(wc -l < "$WORK/batch.jsonl") clips queued"

mkdir -p "$WORK/wav/ph" "$WORK/wav/w"
echo "→ synthesising (a few minutes)"
./piper/piper --model de-kerstin-low.onnx --json-input < "$WORK/batch.jsonl" > /dev/null 2>&1

echo "→ encoding to mp3 (32 kbps mono, silence trimmed)"
mkdir -p "$ROOT/public/audio/ph" "$ROOT/public/audio/w"
TRIM="silenceremove=start_periods=1:start_silence=0.04:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.04:start_threshold=-45dB,areverse"
find "$WORK/wav" -name '*.wav' -print0 | xargs -0 -P 8 -I{} sh -c '
  out="'"$ROOT"'/public/audio/${1#'"$WORK"'/wav/}"; out="${out%.wav}.mp3"
  ffmpeg -v error -i "$1" -af "'"$TRIM"'" -ac 1 -ar 22050 -b:a 32k "$out" -y
' _ {}

echo "→ done: $(find "$ROOT/public/audio" -name '*.mp3' | wc -l) clips, $(du -sh "$ROOT/public/audio" | cut -f1)"
echo "  verify with: node scripts/audio-jobs.mjs . --verify"

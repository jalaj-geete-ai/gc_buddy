#!/usr/bin/env python3
# Current production audio generator for GC Buddy.
#
# Regenerates every German clip in public/audio using Microsoft Edge neural TTS
# (edge-tts), which sounds markedly clearer than the offline Piper fallback in
# scripts/generate-audio.sh. Students reported the old clips were too fast and
# hard to follow, so this uses a clear female voice at -15% speed for beginner
# Indian nurses learning German.
#
# WHY EDGE-TTS
# High-quality neural voice, free, no API key. It needs outbound access to
# Microsoft's speech endpoint, so run it from a normal machine (some sandboxed
# build environments block that host).
#
# HOW TO RUN
#   pip install edge-tts
#   # place gcbuddy_audio_manifest.csv next to this script (columns: path,
#   # section, level, german, english — produced by scripts/audio-jobs.mjs)
#   python3 generate-audio-edge.py
#   # then copy the produced ph/ and w/ folders into public/audio/
#
# Clip filenames must stay byte-for-byte identical to the manifest's `path`
# column (ph/<LEVEL>-<index>.mp3, w/<wordId>.mp3); a mismatch makes that clip
# silently fall back to on-device speech. Verify coverage afterwards with:
#   node scripts/audio-jobs.mjs . --verify

import asyncio
import csv
import os
import sys
import zipfile
import edge_tts

MANIFEST_PATH = os.path.join(os.path.dirname(__file__), "gcbuddy_audio_manifest.csv")
BASE_DIR = os.path.dirname(__file__)
VOICE = "de-DE-KatjaNeural"  # Clear, natural female German voice (nurse persona)
RATE = "-15%"  # -15% slower speed for beginner learners
CONCURRENCY = 8  # Parallel requests
MAX_RETRIES = 5

async def generate_clip(sem, row, idx, total, stats):
    rel_path = row["path"].strip().replace("/", os.sep).replace("\\", os.sep)
    target_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)

    # Check if file already exists and is non-empty
    if os.path.exists(target_path) and os.path.getsize(target_path) > 200:
        stats["skipped"] += 1
        return True

    text = row["german"].strip()
    if not text:
        print(f"[{idx}/{total}] Warning: Empty text for {rel_path}")
        return False

    async with sem:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                communicate = edge_tts.Communicate(text, voice=VOICE, rate=RATE)
                await communicate.save(target_path)

                # Check output file size
                if os.path.exists(target_path) and os.path.getsize(target_path) > 100:
                    stats["success"] += 1
                    done = stats["success"] + stats["skipped"]
                    if done % 50 == 0 or done == total:
                        print(f"Progress: {done}/{total} ({done*100//total}%) | Generated: {stats['success']} | Skipped: {stats['skipped']} | Failed: {stats['failed']}")
                    return True
                else:
                    raise Exception("Output file empty or too small")
            except Exception as e:
                if attempt == MAX_RETRIES:
                    print(f"[{idx}/{total}] FAILED {rel_path}: {e}")
                    stats["failed"] += 1
                    stats["errors"].append((rel_path, text, str(e)))
                    return False
                await asyncio.sleep(attempt * 1.5)

async def main():
    if not os.path.exists(MANIFEST_PATH):
        print(f"Error: Manifest not found at {MANIFEST_PATH}")
        sys.exit(1)

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    total = len(rows)
    print("=" * 60)
    print("STARTING GC BUDDY AUDIO TTS BATCH GENERATION")
    print("=" * 60)
    print(f"Total audio files to generate: {total}")
    print(f" - Listening phrases (ph/):   {sum(1 for r in rows if r['section'] == 'Listening')}")
    print(f" - Vocabulary items (w/):     {sum(1 for r in rows if r['section'] == 'Vocabulary')}")
    print(f"TTS Engine: Edge TTS (Microsoft Neural)")
    print(f"Voice:      {VOICE}")
    print(f"Rate:       {RATE}")
    print(f"Concurrency:{CONCURRENCY}")
    print("=" * 60)

    sem = asyncio.Semaphore(CONCURRENCY)
    stats = {"success": 0, "skipped": 0, "failed": 0, "errors": []}

    tasks = [
        generate_clip(sem, row, i + 1, total, stats)
        for i, row in enumerate(rows)
    ]

    await asyncio.gather(*tasks)

    print("\n" + "=" * 60)
    print("GENERATION SUMMARY")
    print("=" * 60)
    print(f"Total expected:  {total}")
    print(f"Newly generated: {stats['success']}")
    print(f"Pre-existing:    {stats['skipped']}")
    print(f"Failed:          {stats['failed']}")

    # Verification
    print("\nRunning verification...")
    missing = []
    for row in rows:
        p = os.path.join(BASE_DIR, row["path"].strip().replace("/", os.sep).replace("\\", os.sep))
        if not os.path.exists(p) or os.path.getsize(p) < 100:
            missing.append(row["path"])

    if missing:
        print(f"ERROR: {len(missing)} files missing or invalid!")
        for m in missing[:15]:
            print(f"  - {m}")
        sys.exit(1)
    else:
        print(f"SUCCESS: All {total} audio files verified present and valid!")

    # Create ZIP archive
    zip_path = os.path.join(BASE_DIR, "gc_buddy_audio_all.zip")
    print(f"\nCreating ZIP archive: {zip_path}...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for row in rows:
            rel_path = row["path"].strip()
            full_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep).replace("\\", os.sep))
            zf.write(full_path, arcname=rel_path)

    zip_size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"ZIP archive created successfully! Size: {zip_size_mb:.2f} MB")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())

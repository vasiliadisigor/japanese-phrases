# Kotoba · 100 Everyday Phrases

A buildless web app for **Japanese for Photographer** (Master Lesson Template v1.0.0). It teaches the 100 phrases from the @mikanko_studio post “100 phrases Japanese people say every day” (Instagram, 7 Nov 2026) in ten sets of ten. Explanations are in English. No account, build step, paid service or API key is needed. It uses the same design, storage pattern and hosting steps as **Kazu · Japanese Numbers**.

## Start in one minute

- **Simplest:** open `standalone.html` in a browser. All the code is in that one file.
- **Full PWA:** publish this folder on GitHub Pages exactly as with Kazu: create a public repository (for example `japanese-phrases`), upload the **contents** of this folder (including `icons`), then Settings → Pages → Deploy from a branch → `main` / `(root)`.
- **Local preview:** `python -m http.server 8765 --bind 127.0.0.1`, then visit `http://127.0.0.1:8765`.
- **iPhone:** open the published HTTPS link in Safari → Share → Add to Home Screen.

## How it follows the course rules

| Course rule (SKILL.md) | In Kotoba |
|---|---|
| Speaker immediately left of every Japanese item, 44 px target | Phrases, word breakdowns, examples, feedback, phrase list, writing example |
| Display layers: Japanese, audio, reading, romaji, meaning, usage note | Every card; romaji can be hidden in settings |
| Unlearned language explained | Each card has an English note, register, word/particle breakdown and every kanji’s meaning and reading |
| Katakana priority, kanji writing for every new kanji | **Write** tab: all 79 kanji and 3 katakana in stroke order (KanjiVG), animated model and a drawing pad |
| Writing widget v1–v2 | Stroke animation, guide, automatic progress on a correct stroke, checks start, end, path and direction; a wrong stroke is cleared and the start is marked |
| Mastery before progression | “Next character” unlocks after three correct writes; missed cards return in the same session |
| Spaced repetition, recurring-error policy | Correct cards return after 1, 3, 7, 14 days; phrases missed twice or more go to **Tricky phrases** |
| Speaking first | **English → say it** practice with browser speech recognition: raw transcript shown, compared with the target, retry or self-assess; self-check fallback without a microphone |
| Rapid preview, no subliminal claims | **Listen through this set**: Japanese, then English, as an optional warm-up |
| Practical, professional context | Usage notes for clients and set life, plus an “On location” photography scene per set |
| Do not claim unsupported features | Recognition checks words, not pitch accent; device voices vary |

## Practice modes

Read Japanese → choose meaning · Listen → choose meaning · English → choose Japanese · English → say it · English → type it. Typing accepts kanji, kana or Hepburn romaji; long vowels, macrons, spaces, case and punctuation are forgiving (arigatō = arigatou = arigato; を = o or wo; は = wa or ha).

## Progress

Saved in this browser under `kotoba-progress-v1`; it does not sync. Settings → Download a progress backup / Restore progress backup.

## Credits

Phrase selection: @mikanko_studio, https://www.instagram.com/p/DfcKta_jA6y/. English meanings, notes and breakdowns: written for this course. Stroke data: KanjiVG © Ulrich Apel, CC BY-SA 3.0 (https://kanjivg.tagaini.net); `strokes.js` is distributed under the same licence. Audio: Web Speech API.

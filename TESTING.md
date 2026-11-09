# Validation · 9 November 2026

- `node --test tests/*.cjs`: 9 tests pass. 100 phrases in 10 sets; every kanji has a meaning, reading and KanjiVG stroke data; kana fields contain no kanji; every phrase accepts its own kanji, kana and romaji and rejects its neighbours; romaji normalisation gives 100 distinct answers; speech matching gives match/close/different; PWA manifest, icons, service-worker precache and single-file edition checked.
- Headless Chrome, 390×844 and 1280×900, hosted and `standalone.html`: no console errors, no horizontal overflow. Card navigation, breakdown → kanji → Write → Back to phrase, typed answer right and wrong, wrong card re-queued, session summary, recall mode, speak mode controls, search, reload persistence and the 82-character “All” writing set.
- Writing check: tracing every stroke of all 82 characters in order passes; reversed strokes are rejected for all strokes except some very short dots, where direction is not checked.
- Not testable headless: real voices and microphone recognition. Check on iPhone Safari and desktop Chrome after publishing.

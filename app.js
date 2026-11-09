'use strict';
(() => {
  const K = window.KOTOBA, S = window.KOTOBA_STROKES || {};
  const $ = id => document.getElementById(id), key = 'kotoba-progress-v1';
  const byId = Object.fromEntries(K.phrases.map(p => [p.id, p]));
  const catOf = Object.fromEntries(K.cats.map(c => [c.id, c]));
  let state = {cards: {}, write: {}, settings: {romaji: true, rate: 0.9, voice: ''}}, storageOK = true;

  function validState(s) {
    const okCards = s && s.cards && typeof s.cards === 'object' && !Array.isArray(s.cards) &&
      Object.entries(s.cards).every(([k, v]) => byId[k] && v && Number.isInteger(v.stage) && v.stage >= 0 && v.stage <= 4 && Number.isFinite(v.due) && Number.isInteger(v.errors || 0));
    const okWrite = s && s.write && typeof s.write === 'object' && Object.entries(s.write).every(([k, v]) => K.chars[k] && v && Number.isInteger(v.count) && v.count >= 0);
    const st = s && s.settings;
    return okCards && okWrite && st && typeof st.romaji === 'boolean' && [0.7, 0.9, 1].includes(st.rate) && typeof st.voice === 'string';
  }
  try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if (saved && validState(saved)) state = saved; } catch { storageOK = false; }
  function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { storageOK = false; } updateProgress(); }

  let view = 'learn', idx = 0, quiz = null, voices = [], speechToken = 0, speechTimer, previewing = false, returnTo = null;
  const synth = window.speechSynthesis;
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ---------- sets ---------- */
  function setId() { return $('set').value; }
  function list() { return setId() === 'all' ? K.phrases : K.phrases.filter(p => p.cat === setId()); }
  function current() { const l = list(); idx = Math.max(0, Math.min(idx, l.length - 1)); return l[idx]; }
  function setWeb(text) { $('webListen').href = 'https://translate.google.com/?sl=ja&tl=en&text=' + encodeURIComponent(text) + '&op=translate'; }
  function el(tag, props = {}, ...kids) { const e = document.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'class') e.className = v; else if (k === 'lang') e.lang = v; else if (k.startsWith('on')) e[k] = v; else if (k in e) e[k] = v; else e.setAttribute(k, v); } e.append(...kids); return e; }
  function speakerBtn(text, label) { return el('button', {class: 'speaker small', type: 'button', 'aria-label': label || 'Hear this Japanese', onclick: () => speak(text)}, '▶'); }

  /* ---------- views ---------- */
  function setView(v) {
    stopSpeech(); if (v !== 'write') returnTo = returnTo && v === 'learn' ? returnTo : null;
    view = v;
    for (const x of ['learn', 'practice', 'write', 'explore']) $(x + 'View').hidden = x !== v;
    document.querySelectorAll('[data-view]').forEach(b => b.dataset.view === v ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
    if (v === 'practice') updateDue();
    if (v === 'write') renderWrite();
    if (v === 'explore') renderList();
    if (v === 'learn') renderLearn();
  }

  /* ---------- learn ---------- */
  function renderLearn() {
    const p = current(), c = catOf[p.cat], l = list();
    $('setTag').textContent = c.en.toUpperCase();
    $('register').textContent = p.reg; $('register').dataset.reg = p.reg;
    $('studyJp').textContent = p.jp;
    $('studyKana').textContent = p.kana; $('studyKana').hidden = p.kana === p.jp;
    $('studyRomaji').textContent = p.romaji; $('studyRomaji').hidden = !state.settings.romaji;
    $('studyEn').textContent = p.en; $('studyNote').textContent = p.note;
    $('learnIndex').textContent = (idx + 1) + ' / ' + l.length;
    $('previous').disabled = idx === 0; $('next').disabled = idx === l.length - 1;
    $('parts').replaceChildren(...p.parts.map(([jp, rd, mean]) => el('li', {}, speakerBtn(jp === 'LINE' ? 'ライン' : jp, 'Hear ' + rd), el('b', {lang: 'ja'}, jp), el('span', {}, (rd !== jp ? rd + ' · ' : '') + mean))));
    $('parts').hidden = !p.parts.length;
    $('kanjiRow').replaceChildren(...p.chars.map(ch => el('button', {class: 'kanji-chip', type: 'button', onclick: () => openWrite(ch, p.id), 'aria-label': 'Write ' + ch + ', ' + K.chars[ch][0]}, el('b', {lang: 'ja'}, ch), el('small', {}, K.chars[ch][0], el('br'), 'Write it ✎'))));
    $('kanjiRow').hidden = !p.chars.length;
    $('breakdown').hidden = !p.parts.length && !p.chars.length;
    const scene = (setId() === 'all' ? c : catOf[setId()]).scene;
    $('sceneJp').textContent = scene.jp; $('sceneEn').textContent = scene.en;
    if (view === 'learn') setWeb(p.say);
    updateSetProgress();
  }
  function go(i) { stopSpeech(); idx = i; renderLearn(); }

  /* ---------- audio ---------- */
  function loadVoices() {
    voices = synth ? synth.getVoices().filter(v => /^ja(?:[-_]|$)/i.test(v.lang)) : [];
    $('voice').replaceChildren(el('option', {value: ''}, voices.length ? 'Automatic Japanese voice' : 'Device default · ja-JP (no listed voice)'));
    voices.forEach(v => $('voice').append(el('option', {value: v.voiceURI}, v.name + ' · ' + v.lang)));
    $('voice').value = voices.some(v => v.voiceURI === state.settings.voice) ? state.settings.voice : '';
    if (!synth) $('audioStatus').textContent = 'Browser speech is unavailable. Use “Listen on the web”.';
  }
  function stopSpeech() { speechToken++; clearTimeout(speechTimer); if (synth) synth.cancel(); if (previewing) { previewing = false; $('preview').textContent = '▶ Listen through this set'; } }
  function utter(text, lang, onend) {
    const u = new SpeechSynthesisUtterance(text); u.lang = lang;
    if (lang === 'ja-JP') { u.rate = state.settings.rate; const v = voices.find(v => v.voiceURI === state.settings.voice) || voices[0]; if (v) u.voice = v; }
    else { const v = synth.getVoices().find(v => /^en/i.test(v.lang)); if (v) u.voice = v; }
    u.onend = onend; return u;
  }
  function speak(text) {
    setWeb(text);
    if (!synth || !window.SpeechSynthesisUtterance) { $('audioStatus').textContent = 'Use “Listen on the web” to hear this phrase.'; return; }
    stopSpeech(); const token = speechToken;
    const u = utter(text, 'ja-JP', () => { if (token === speechToken) { clearTimeout(speechTimer); $('audioStatus').textContent = 'Tap ▶ to listen again.'; } });
    u.onstart = () => { if (token === speechToken) { clearTimeout(speechTimer); $('audioStatus').textContent = 'Playing Japanese' + (u.voice ? ' · ' + u.voice.name : '') + '.'; } };
    u.onerror = () => { if (token === speechToken) { clearTimeout(speechTimer); $('audioStatus').textContent = 'Audio could not play. Try another voice or “Listen on the web”.'; } };
    $('audioStatus').textContent = 'Starting Japanese audio…';
    speechTimer = setTimeout(() => { if (token === speechToken) $('audioStatus').textContent = 'No sound? Check volume, choose a Japanese voice, or use “Listen on the web”.'; }, 6500);
    try { synth.speak(u); } catch { $('audioStatus').textContent = 'Audio unavailable. Use “Listen on the web”.'; }
  }
  function preview() {
    if (previewing) { stopSpeech(); return; }
    if (!synth) { $('audioStatus').textContent = 'Listen-through needs browser speech.'; return; }
    stopSpeech(); previewing = true; $('preview').textContent = '■ Stop listening'; const token = speechToken;
    const step = i => {
      if (token !== speechToken) return;
      if (i >= list().length) { stopSpeech(); $('audioStatus').textContent = 'Set complete. Now try a practice round.'; return; }
      idx = i; renderLearn(); const p = current();
      $('audioStatus').textContent = 'Listen-through · ' + (i + 1) + ' of ' + list().length;
      synth.speak(utter(p.say, 'ja-JP', () => setTimeout(() => { if (token === speechToken) synth.speak(utter(p.en, 'en-US', () => setTimeout(() => step(i + 1), 700))); }, 450)));
    };
    step(idx);
  }

  /* ---------- progress ---------- */
  function due(ids) { return ids.filter(id => state.cards[id] && state.cards[id].due <= Date.now()); }
  function updateSetProgress() {
    const ids = list().map(p => p.id), seen = ids.filter(id => state.cards[id]).length, d = due(ids).length;
    const learned = ids.filter(id => (state.cards[id]?.stage || 0) >= 2).length;
    $('setProgress').textContent = seen ? learned + ' of ' + ids.length + ' recalled after a break · ' + seen + ' practised' : ids.length + ' phrases · not practised yet';
    $('setDue').textContent = d ? d + ' due for review' : '';
  }
  function updateProgress() {
    const c = Object.keys(state.cards).length, w = Object.values(state.write).filter(v => v.count >= 3).length;
    $('progressText').textContent = storageOK ? (c || w ? c + ' phrases practised · ' + w + ' characters mastered · saved on this device' : 'A fresh start. Progress saves on this device.') : 'Progress is temporary: browser storage is unavailable.';
    updateSetProgress();
  }
  function tricky() { return list().map(p => p.id).filter(id => (state.cards[id]?.errors || 0) >= 2 && state.cards[id].stage < 3); }
  function updateDue() {
    const d = due(list().map(p => p.id)).length, t = tricky().length;
    $('dueCount').textContent = (d ? d + ' cards due in this set. ' : 'New cards are ready. Due reviews will appear here. ') + (t ? t + ' tricky phrases need extra work.' : '');
    $('reviewQuiz').disabled = !d; $('trickyQuiz').disabled = !t;
  }

  /* ---------- practice ---------- */
  const shuffled = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function startQuiz(source = 'new') {
    let pool;
    if (source === 'due') pool = due(list().map(p => p.id)).sort((a, b) => state.cards[a].due - state.cards[b].due);
    else if (source === 'tricky') pool = shuffled(tricky());
    else { const fresh = list().filter(p => !state.cards[p.id]).map(p => p.id); pool = [...shuffled(fresh), ...shuffled(list().filter(p => state.cards[p.id]).map(p => p.id))]; }
    if (!pool.length) return;
    const queue = pool.slice(0, 10).map(id => ({p: byId[id], retry: false}));
    quiz = {queue, index: 0, initial: queue.length, firstCorrect: 0, retries: 0, type: $('quizType').value, answered: false, done: false};
    $('practiceSetup').hidden = true; $('quizSummary').hidden = true; $('quizArea').hidden = false; setView('practice'); renderQuestion();
  }
  function choicesFor(p) {
    const same = K.phrases.filter(x => x.cat === p.cat && x.id !== p.id), other = K.phrases.filter(x => x.cat !== p.cat);
    const picks = new Set([p]); for (const x of [...shuffled(same.slice()), ...shuffled(other.slice())]) { if (picks.size === 4) break; if ([...picks].every(y => y.en !== x.en && y.jp !== x.jp)) picks.add(x); }
    return shuffled([...picks]);
  }
  function renderQuestion() {
    stopSpeech(); stopRec(); const {p, retry} = quiz.queue[quiz.index], t = quiz.type; quiz.answered = false; setWeb(p.say);
    $('quizProgress').textContent = retry ? 'Review · let’s try that one again' : 'Card ' + (quiz.index + 1) + ' of ' + quiz.initial;
    $('quizBar').max = quiz.initial; $('quizBar').value = Math.min(quiz.index, quiz.initial);
    $('quizPrompt').textContent = {choice: 'WHAT DOES THIS MEAN?', listen: 'TAP ▶, THEN CHOOSE THE MEANING', recall: 'WHICH JAPANESE SAYS THIS?', speak: 'SAY THIS IN JAPANESE', type: 'TYPE THIS IN JAPANESE'}[t];
    const jpShown = t === 'choice';
    $('quizQuestion').textContent = t === 'listen' ? 'Listen closely' : jpShown ? p.jp : p.en;
    $('quizQuestion').lang = jpShown ? 'ja' : 'en';
    $('quizSpeak').hidden = !(t === 'choice' || t === 'listen');
    $('quizHint').textContent = {choice: 'Read it, or tap the speaker for a clue.', listen: 'Replay as often as you like.', recall: 'Think of the situation: who are you talking to?', speak: Rec ? 'Tap the button, say the phrase, tap again to stop.' : 'Say it out loud, then check yourself.', type: 'Kana, kanji or romaji. Spaces and punctuation don’t matter.'}[t] + (t !== 'choice' && t !== 'listen' ? ' · ' + catOf[p.cat].en : '');
    $('feedback').hidden = true; $('continueQuiz').hidden = true;
    $('typeForm').hidden = t !== 'type'; $('speakArea').hidden = t !== 'speak'; $('answers').hidden = !['choice', 'listen', 'recall'].includes(t);
    $('typedAnswer').value = ''; $('typedAnswer').disabled = false; $('checkTyped').disabled = false;
    $('answers').replaceChildren();
    if (!$('answers').hidden) choicesFor(p).forEach(x => {
      const ja = t === 'recall';
      $('answers').append(el('button', {class: 'answer', type: 'button', lang: ja ? 'ja' : 'en', onclick: e => answer(x.id === p.id, e.currentTarget), 'data-id': x.id}, ja ? x.jp : x.en));
    });
    if (t === 'speak') resetSpeak();
  }
  function answer(ok, btn) {
    if (quiz.answered) return; quiz.answered = true; stopRec();
    const {p, retry} = quiz.queue[quiz.index], old = state.cards[p.id];
    document.querySelectorAll('.answer').forEach(b => { b.disabled = true; if (b.dataset.id === p.id) b.classList.add('correct'); });
    if (btn && !ok) btn.classList.add('wrong');
    $('typedAnswer').disabled = true; $('checkTyped').disabled = true;
    ['speakChoices', 'selfCheck', 'selfMark'].forEach(id => $(id).hidden = true); $('micButton').disabled = true;
    const errors = old?.errors || 0;
    if (ok) {
      if (!retry) quiz.firstCorrect++;
      const stage = retry ? 0 : Math.min(old?.stage ?? 0, 3);
      state.cards[p.id] = {stage: Math.min(stage + 1, 4), due: Date.now() + [1, 3, 7, 14][stage] * 864e5, errors};
    } else {
      state.cards[p.id] = {stage: 0, due: Date.now(), errors: errors + 1};
      quiz.queue.push({p, retry: true}); quiz.retries++;
    }
    save();
    const fb = $('feedback'); fb.className = 'feedback' + (ok ? '' : ' retry'); fb.hidden = false;
    fb.replaceChildren(
      el('p', {}, el('strong', {}, ok ? 'Yes, that’s it.' : 'Keep going. Here it is:')),
      el('div', {class: 'japanese-line'}, speakerBtn(p.say, 'Hear the answer'), el('span', {class: 'fb-jp', lang: 'ja'}, p.jp)),
      ...(p.kana !== p.jp ? [el('p', {lang: 'ja'}, p.kana)] : []), el('p', {}, p.romaji + ' · ' + p.en),
      el('p', {class: 'muted'}, p.note + (ok ? '' : ' You’ll see this card again.')));
    $('continueQuiz').hidden = false; $('continueQuiz').textContent = quiz.index + 1 < quiz.queue.length ? 'Continue →' : 'See your progress →'; $('continueQuiz').focus();
  }
  function endQuiz(completed) {
    stopSpeech(); stopRec(); quiz.done = true; $('quizArea').hidden = true; $('quizSummary').hidden = false;
    $('quizSummary').querySelector('h2').textContent = completed ? 'Practice complete.' : 'A good place to pause.';
    $('summaryText').textContent = quiz.firstCorrect + ' of ' + quiz.initial + ' right on the first try. ' + (completed && quiz.retries ? 'You went back over every missed card. ' : !completed ? 'Missed cards stay due for review. ' : '') + 'Your answers are saved' + (storageOK ? ' on this device.' : ' only for this visit.');
    updateDue(); updateSetProgress();
  }

  /* ---------- speaking ---------- */
  let rec = null, recording = false;
  function resetSpeak() {
    $('heard').textContent = ''; $('speakChoices').hidden = true; $('selfMark').hidden = true;
    $('micButton').disabled = false; $('micButton').hidden = !Rec; $('selfCheck').hidden = !!Rec;
    setMic(false);
  }
  function setMic(on) { recording = on; $('micButton').setAttribute('aria-pressed', on); $('micLabel').textContent = on ? 'Listening… tap to stop' : 'Tap and speak'; }
  function stopRec() { if (rec) { try { rec.abort(); } catch {} rec = null; } if (recording) setMic(false); }
  function toggleMic() {
    if (recording) { try { rec && rec.stop(); } catch {} setMic(false); return; }
    stopSpeech(); const r = new Rec(); rec = r; r.lang = 'ja-JP'; r.interimResults = true; r.maxAlternatives = 3; r.continuous = false;
    let finalText = '';
    r.onresult = e => {
      let text = ''; for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      $('heard').replaceChildren('We heard: ', el('b', {lang: 'ja'}, text));
      const last = e.results[e.results.length - 1];
      if (last.isFinal) { finalText = Array.from({length: last.length}, (_, i) => last[i].transcript); if (e.results.length > 1) finalText.unshift(text); }
    };
    r.onerror = e => { setMic(false); $('heard').textContent = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Microphone permission is off. Say it aloud and check yourself instead.' : e.error === 'no-speech' ? 'Nothing heard. Tap and try again.' : 'Recognition stopped (' + e.error + '). Try again.'; if (/allowed/.test(e.error)) { $('micButton').hidden = true; $('selfCheck').hidden = false; } };
    r.onend = () => { setMic(false); rec = null; if (finalText) judge(Array.isArray(finalText) ? finalText : [finalText]); };
    try { r.start(); setMic(true); $('heard').textContent = 'Listening…'; } catch { $('heard').textContent = 'Could not start the microphone. Try again.'; }
  }
  function judge(alts) {
    if (quiz.answered) return; const {p} = quiz.queue[quiz.index];
    const results = alts.map(t => ({t, ...K.heard(p, t)})).sort((a, b) => b.score - a.score), best = results[0];
    $('heard').replaceChildren('We heard: ', el('b', {lang: 'ja'}, alts[0]));
    if (best.status === 'match') { answer(true); return; }
    $('heard').append(el('br'), best.status === 'close' ? 'Close. Recognition may write a word in kanji or kana differently. Listen to the model and decide.' : 'That sounds different from the target. Listen and try again.');
    $('heard').append(el('div', {class: 'japanese-line', style: 'margin-top:10px'}, speakerBtn(p.say, 'Hear the model answer'), el('span', {class: 'fb-jp', lang: 'ja'}, best.status === 'close' ? p.jp : '…')));
    $('speakChoices').hidden = false; $('speakAccept').hidden = best.status !== 'close';
  }

  /* ---------- writing ---------- */
  const pad = $('pad'), ctx = pad.getContext('2d'), model = $('model');
  let wChar = null, strokes = [], done = [], userInk = [], cur = null, misses = 0, size = 300, animToken = 0;
  function charsForSet() { return [...new Set(list().flatMap(p => p.chars))]; }
  function exampleFor(ch) { return list().find(p => p.chars.includes(ch)) || K.phrases.find(p => p.chars.includes(ch)); }
  function openWrite(ch, from) { wChar = ch; returnTo = from || null; setView('write'); }
  function renderWrite() {
    const chars = charsForSet(); if (!chars.includes(wChar)) wChar = chars.find(c => (state.write[c]?.count || 0) < 3) || chars[0];
    $('charStrip').replaceChildren(...chars.map(c => { const n = Math.min(state.write[c]?.count || 0, 3); const b = el('button', {type: 'button', role: 'listitem', class: n >= 3 ? 'done' : '', lang: 'ja', onclick: () => { wChar = c; returnTo = null; renderWrite(); }, 'aria-label': c + ', ' + K.chars[c][0] + ', written ' + n + ' of 3'}, c, el('small', {}, n >= 3 ? '✓' : '●'.repeat(n) + '○'.repeat(3 - n))); if (c === wChar) b.setAttribute('aria-current', 'true'); return b; }));
    const info = K.chars[wChar], ex = exampleFor(wChar);
    $('writeChar').textContent = wChar; $('writeMeaning').textContent = info[0];
    strokes = (S[wChar] || []).map(d => ({d}));
    $('writeReading').textContent = 'Reading here: ' + info[1] + ' · ' + strokes.length + ' stroke' + (strokes.length === 1 ? '' : 's');
    $('writeExample').textContent = ex.jp + ' · ' + ex.en; $('writeSpeak').onclick = () => speak(ex.say);
    $('backToPhrase').hidden = !returnTo;
    buildModel(); resetPad(); updateMastery(); setWeb(ex.say);
  }
  function buildModel() {
    animToken++; model.replaceChildren();
    const ns = 'http://www.w3.org/2000/svg';
    const grid = document.createElementNS(ns, 'path'); grid.setAttribute('d', 'M54.5 4V105M4 54.5H105'); grid.setAttribute('style', 'stroke:#e7ebe2;stroke-width:.6;stroke-dasharray:2 2;fill:none'); model.append(grid);
    strokes.forEach((s, i) => {
      const g = document.createElementNS(ns, 'path'); g.setAttribute('d', s.d); g.setAttribute('class', 'ghost'); model.append(g);
      const p = document.createElementNS(ns, 'path'); p.setAttribute('d', s.d); p.setAttribute('class', 'ink'); p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '0'; model.append(p); s.ink = p;
      const len = g.getTotalLength(); s.len = len;
      s.start = g.getPointAtLength(0); s.end = g.getPointAtLength(len); s.mid = g.getPointAtLength(len / 2); s.q1 = g.getPointAtLength(len / 4); s.q3 = g.getPointAtLength(len * 3 / 4);
      const t = document.createElementNS(ns, 'text'); t.setAttribute('x', s.start.x - 5); t.setAttribute('y', s.start.y - 1.5); t.textContent = i + 1; model.append(t);
    });
  }
  function playStrokes() {
    const token = ++animToken, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    strokes.forEach(s => { s.ink.style.transition = 'none'; s.ink.style.strokeDashoffset = reduce ? '0' : '1'; });
    if (reduce) return; model.getBoundingClientRect();
    let i = 0; const next = () => { if (token !== animToken || i >= strokes.length) return; const s = strokes[i++], ms = Math.max(280, s.len * 9); s.ink.style.transition = 'stroke-dashoffset ' + ms + 'ms ease-in-out'; s.ink.style.strokeDashoffset = '0'; setTimeout(next, ms + 160); };
    setTimeout(next, 150);
  }
  function resetPad() {
    const r = pad.getBoundingClientRect(); size = r.width || 300; const dpr = window.devicePixelRatio || 1;
    pad.width = Math.round(size * dpr); pad.height = Math.round(size * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    done = []; userInk = []; cur = null; misses = 0; drawPad(); msg('Start with stroke 1.', '');
  }
  function drawPad(hintStroke) {
    const k = size / 109; ctx.clearRect(0, 0, size, size);
    ctx.save(); ctx.strokeStyle = '#e4e8df'; ctx.setLineDash([4, 5]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(size / 2, 6); ctx.lineTo(size / 2, size - 6); ctx.moveTo(6, size / 2); ctx.lineTo(size - 6, size / 2); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.scale(k, k); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if ($('guideToggle').checked) { ctx.strokeStyle = '#e6e9e0'; ctx.lineWidth = 5; strokes.forEach(s => ctx.stroke(new Path2D(s.d))); }
    if (hintStroke != null) { ctx.strokeStyle = '#f0c7b4'; ctx.lineWidth = 5; ctx.stroke(new Path2D(strokes[hintStroke].d)); }
    ctx.restore();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(5, size / 40); ctx.strokeStyle = '#183e38';
    for (const pts of userInk) { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q.x * k, q.y * k) : ctx.moveTo(q.x * k, q.y * k)); ctx.stroke(); }
    if (done.length < strokes.length && misses >= 1) { const s = strokes[done.length]; ctx.fillStyle = '#ac4e32'; ctx.beginPath(); ctx.arc(s.start.x * k, s.start.y * k, Math.max(5, size / 45), 0, 7); ctx.fill(); }
    $('strokeCount').textContent = done.length < strokes.length ? 'Stroke ' + (done.length + 1) + ' of ' + strokes.length : 'All ' + strokes.length + ' strokes';
  }
  function msg(t, cls) { $('writeMsg').textContent = t; $('writeMsg').className = 'write-msg ' + (cls || ''); }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function pt(e) { const r = pad.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * 109, y: (e.clientY - r.top) / r.height * 109}; }
  function at(pts, f) { let total = 0; const segs = []; for (let i = 1; i < pts.length; i++) { const d = dist(pts[i - 1], pts[i]); segs.push(d); total += d; } let target = total * f; for (let i = 0; i < segs.length; i++) { if (target <= segs[i]) { const t = segs[i] ? target / segs[i] : 0; return {x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t}; } target -= segs[i]; } return pts[pts.length - 1]; }
  function strokeOK(pts, s) {
    const T = 19;
    if (s.len < 16) return dist(at(pts, .5), s.mid) < T && dist(pts[0], s.start) < T * 1.2;
    if (pts.length < 2) return false;
    const ex = s.end.x - s.start.x, ey = s.end.y - s.start.y, ux = pts[pts.length - 1].x - pts[0].x, uy = pts[pts.length - 1].y - pts[0].y;
    if (Math.hypot(ex, ey) > 8 && ex * ux + ey * uy <= 0) return false;
    return dist(pts[0], s.start) < T && dist(pts[pts.length - 1], s.end) < T && dist(at(pts, .5), s.mid) < T * 1.15 && dist(at(pts, .25), s.q1) < T * 1.3 && dist(at(pts, .75), s.q3) < T * 1.3;
  }
  pad.addEventListener('pointerdown', e => { if (done.length >= strokes.length) return; e.preventDefault(); pad.setPointerCapture(e.pointerId); cur = [pt(e)]; });
  pad.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); const q = pt(e); if (dist(q, cur[cur.length - 1]) > .6) { cur.push(q); const k = size / 109, a = cur[cur.length - 2]; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(5, size / 40); ctx.strokeStyle = '#183e38'; ctx.beginPath(); ctx.moveTo(a.x * k, a.y * k); ctx.lineTo(q.x * k, q.y * k); ctx.stroke(); } });
  const endStroke = e => {
    if (!cur) return; const pts = cur; cur = null; const s = strokes[done.length];
    if (strokeOK(pts, s)) {
      done.push(pts); userInk.push(pts); misses = 0; drawPad();
      if (done.length === strokes.length) complete(); else msg('Good. Stroke ' + (done.length + 1) + ' next.', 'good');
    } else {
      misses++; drawPad(misses >= 2 ? done.length : null);
      msg(misses >= 2 ? 'Follow the orange line: stroke ' + (done.length + 1) + ' starts at the dot.' : 'Not quite. Check the start, direction and order. Stroke ' + (done.length + 1) + ' starts at the dot.', 'bad');
    }
  };
  pad.addEventListener('pointerup', endStroke); pad.addEventListener('pointercancel', () => { cur = null; drawPad(); });
  function complete() {
    const w = state.write[wChar] = state.write[wChar] || {count: 0, last: 0}; w.count++; w.last = Date.now(); save();
    msg(w.count >= 3 ? (w.count === 3 ? 'Mastered. ' : '') + wChar + ' is yours. Keep it fresh by writing it again in a few days.' : 'Beautiful. Correct ' + w.count + ' of 3. Write it again.', 'good');
    updateMastery(); renderStripOnly();
  }
  function renderStripOnly() { const n = Math.min(state.write[wChar]?.count || 0, 3); const b = $('charStrip').querySelector('[aria-current]'); if (b) { b.className = n >= 3 ? 'done' : ''; b.lastChild.textContent = n >= 3 ? '✓' : '●'.repeat(n) + '○'.repeat(3 - n); } }
  function updateMastery() {
    const n = state.write[wChar]?.count || 0, chars = charsForSet(), i = chars.indexOf(wChar);
    $('masteryText').textContent = n >= 3 ? 'Mastered · written correctly ' + n + ' times' : 'Written correctly ' + n + ' of 3';
    $('masteryDots').textContent = '●'.repeat(Math.min(n, 3)) + '○'.repeat(Math.max(0, 3 - n));
    $('nextChar').disabled = n < 3 || i === chars.length - 1;
    $('nextChar').textContent = i === chars.length - 1 ? 'Last in this set' : 'Next character →';
    if (n < 3) $('masteryText').textContent += ' · 3 unlocks the next character';
  }

  /* ---------- explore ---------- */
  function renderList() {
    const q = $('search').value.trim().toLowerCase(), rq = K.romaNorm(q);
    const items = []; let lastCat = null;
    K.phrases.filter(p => !q || p.jp.includes(q) || p.kana.includes(q) || p.en.toLowerCase().includes(q) || (rq && K.romaNorm(p.romaji).includes(rq))).forEach(p => {
      if (p.cat !== lastCat) { const c = catOf[p.cat]; items.push(el('li', {class: 'cat-head'}, c.no + ' · ' + c.en.toUpperCase() + ' · ', el('span', {lang: 'ja'}, c.jp + '（' + c.kana + '）'))); lastCat = p.cat; }
      items.push(el('li', {}, speakerBtn(p.say, 'Hear ' + p.romaji), el('button', {class: 'pl-text', type: 'button', onclick: () => { $('set').value = p.cat; idx = K.phrases.filter(x => x.cat === p.cat).indexOf(p); setView('learn'); }}, el('b', {lang: 'ja'}, p.jp), el('span', {}, p.romaji + ' · ' + p.en))));
    });
    $('phraseList').replaceChildren(...(items.length ? items : [el('li', {class: 'muted'}, 'No phrase matches. Try English, romaji or Japanese.')]));
  }

  /* ---------- wiring ---------- */
  $('set').append(el('option', {value: 'all'}, 'All 100 phrases'), ...K.cats.map(c => el('option', {value: c.id}, c.no + ' · ' + c.en + ' · ' + c.jp)));
  $('set').value = 'greet';
  $('set').onchange = () => { stopSpeech(); stopRec(); idx = 0; quiz = null; returnTo = null; $('practiceSetup').hidden = false; $('quizArea').hidden = true; $('quizSummary').hidden = true; renderLearn(); updateDue(); if (view === 'write') renderWrite(); };
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => setView(b.dataset.view));
  $('previous').onclick = () => go(idx - 1); $('next').onclick = () => go(idx + 1);
  $('shuffle').onclick = () => go(Math.floor(Math.random() * list().length));
  $('studySpeak').onclick = () => speak(current().say);
  $('sceneSpeak').onclick = () => { const c = setId() === 'all' ? catOf[current().cat] : catOf[setId()]; speak(c.scene.say || c.scene.jp); };
  $('preview').onclick = preview;
  $('startFromLearn').onclick = () => startQuiz(); $('startQuiz').onclick = () => startQuiz(); $('reviewQuiz').onclick = () => startQuiz('due'); $('trickyQuiz').onclick = () => startQuiz('tricky');
  $('quizSpeak').onclick = () => speak(quiz.queue[quiz.index].p.say);
  $('typeForm').onsubmit = e => { e.preventDefault(); const v = $('typedAnswer').value; if (!v.trim()) { $('typedAnswer').focus(); return; } answer(K.check(quiz.queue[quiz.index].p, v)); };
  $('micButton').onclick = toggleMic;
  $('speakRetry').onclick = () => { $('speakChoices').hidden = true; $('heard').textContent = ''; toggleMic(); };
  $('speakAccept').onclick = () => answer(true); $('speakGiveUp').onclick = () => answer(false);
  $('selfReveal').onclick = () => { const {p} = quiz.queue[quiz.index]; $('selfCheck').hidden = true; $('selfMark').hidden = false; $('heard').replaceChildren(el('div', {class: 'japanese-line'}, speakerBtn(p.say, 'Hear the answer'), el('span', {class: 'fb-jp', lang: 'ja'}, p.jp)), p.romaji); speak(p.say); };
  $('selfRight').onclick = () => answer(true); $('selfWrong').onclick = () => answer(false);
  $('continueQuiz').onclick = () => { quiz.index++; if (quiz.index >= quiz.queue.length) endQuiz(true); else renderQuestion(); };
  $('endQuiz').onclick = () => endQuiz(false);
  $('again').onclick = () => { $('quizSummary').hidden = true; $('practiceSetup').hidden = false; quiz = null; updateDue(); };
  $('playStrokes').onclick = playStrokes; $('clearPad').onclick = resetPad; $('writeAgain').onclick = resetPad; $('guideToggle').onchange = () => drawPad();
  $('nextChar').onclick = () => { const c = charsForSet(); wChar = c[c.indexOf(wChar) + 1]; returnTo = null; renderWrite(); playStrokes(); };
  $('backToPhrase').onclick = () => { const p = byId[returnTo]; if ($('set').value !== 'all' && $('set').value !== p.cat) $('set').value = p.cat; idx = list().indexOf(p); setView('learn'); };
  $('search').oninput = renderList;
  $('settingsButton').onclick = () => { loadVoices(); $('settings').showModal(); };
  $('voice').onchange = () => { state.settings.voice = $('voice').value; save(); };
  $('rate').value = state.settings.rate; $('rate').onchange = () => { state.settings.rate = Number($('rate').value); save(); };
  $('romajiToggle').checked = state.settings.romaji; $('romajiToggle').onchange = () => { state.settings.romaji = $('romajiToggle').checked; save(); renderLearn(); };
  $('testVoice').onclick = () => speak('こんにちは。よろしくお願いします。');
  $('exportProgress').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'})); const a = el('a', {href: url, download: 'kotoba-progress.json'}); a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); $('settingsMessage').textContent = 'Backup downloaded. Restore it on another device to move your progress.'; };
  $('importProgress').onchange = async () => {
    const f = $('importProgress').files[0]; if (!f) return;
    try { if (f.size > 500000) throw Error(); const s = JSON.parse(await f.text()); if (!validState(s)) throw Error(); state = {cards: s.cards, write: s.write, settings: s.settings}; save(); $('rate').value = state.settings.rate; $('romajiToggle').checked = state.settings.romaji; loadVoices(); renderLearn(); updateDue(); $('settingsMessage').textContent = 'Progress restored. It replaces the progress that was on this device.'; }
    catch { $('settingsMessage').textContent = 'That is not a valid Kotoba backup. Your progress has not changed.'; }
    $('importProgress').value = '';
  };
  let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (view === 'write') { const keep = userInk.slice(), d = done.slice(); resetPad(); done = d; userInk = keep; drawPad(); } }, 200); });
  if (synth) synth.addEventListener('voiceschanged', loadVoices);
  loadVoices(); renderLearn(); updateDue(); updateProgress();
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopSpeech(); stopRec(); } });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && document.querySelector('link[rel=manifest]')) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();

const {test}=require('node:test');const assert=require('node:assert/strict');
const K=require('../phrases.js');const S=require('../strokes.js');
test('100 phrases in 10 sets of 10, all fields present',()=>{
  assert.equal(K.phrases.length,100);assert.equal(K.cats.length,10);
  for(const c of K.cats)assert.equal(K.phrases.filter(p=>p.cat===c.id).length,10);
  for(const p of K.phrases)for(const f of ['jp','kana','romaji','en','reg','note','say'])assert.ok(p[f],p.id+' '+f);
  assert.equal(new Set(K.phrases.map(p=>p.jp)).size,100);
});
test('every kanji is explained and has stroke data',()=>{
  for(const p of K.phrases)for(const ch of p.jp)if(/[一-鿿]/.test(ch)){assert.ok(K.chars[ch],ch);assert.ok(S[ch]&&S[ch].length,ch);}
  for(const ch of Object.keys(K.chars))assert.ok(S[ch]&&S[ch].length,ch);
});
test('kana readings contain no kanji',()=>{for(const p of K.phrases)assert.ok(!/[一-鿿]/.test(p.kana),p.kana);});
test('each phrase accepts its own kanji, kana and romaji; rejects others',()=>{
  for(const p of K.phrases){assert.ok(K.check(p,p.jp));assert.ok(K.check(p,p.kana));assert.ok(K.check(p,p.romaji));
    const other=K.phrases.find(x=>x.id!==p.id&&x.cat===p.cat);assert.ok(!K.check(p,other.romaji),p.id+' vs '+other.id);}
});
test('romaji tolerance: macrons, long vowels, particles, case and punctuation',()=>{
  const f=jp=>K.phrases.find(p=>p.jp===jp);
  for(const a of ['arigatou','arigato','ARIGATŌ!'])assert.ok(K.check(f('ありがとう'),a),a);
  for(const a of ['mizu wo kudasai','Mizu o kudasai.'])assert.ok(K.check(f('水をください'),a),a);
  for(const a of ['jitsu ha','jitsuwa'])assert.ok(K.check(f('実は'),a),a);
  assert.ok(K.check(f('こんばんは'),'kombanwa'));
  assert.ok(!K.check(f('水をください'),'mizu kudasai'));assert.ok(!K.check(f('ありがとう'),''));
  const norms=new Set(K.phrases.map(p=>K.romaNorm(p.romaji)));assert.equal(norms.size,100);
});
test('speech matching: exact, punctuation-insensitive, close and different',()=>{
  const p=K.phrases.find(x=>x.jp==='お疲れ様です');
  assert.equal(K.heard(p,'お疲れ様です。').status,'match');assert.equal(K.heard(p,'おつかれさまです').status,'match');
  assert.equal(K.heard(p,'お疲れさまです').status,'close');assert.equal(K.heard(p,'こんにちは').status,'different');
});

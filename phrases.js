'use strict';
/* Kotoba · 100 everyday phrases.
   Source list: @mikanko_studio, Instagram post DfcKta_jA6y (7 Nov 2026), "100 phrases Japanese people say every day".
   English meanings, notes and breakdowns written for Japanese for Photographer (Master Lesson Template v1.0.0).
   Phrase fields: [japanese, kana, romaji, english, register, note, parts?, say?]
   parts: [[japanese, reading, meaning], ...]   say: optional speech text when the written form could be misread. */
(function (root) {
  const cats = [
    {id:'greet', no:1, jp:'挨拶', kana:'あいさつ', en:'Greetings & thanks',
      scene:{jp:'はじめまして。よろしくお願いします。', en:'Meeting the model and the team before the first frame.'}},
    {id:'react', no:2, jp:'リアクション', kana:'りあくしょん', en:'Reactions',
      scene:{jp:'すごい！最高！', en:'The whole team crowds the monitor around a perfect frame.'}},
    {id:'daily', no:3, jp:'日常', kana:'にちじょう', en:'Home & on the way',
      scene:{jp:'ちょっと待って。今行く！', en:'Your assistant calls you to set while you change lenses.', say:'ちょっと待って。いま行く！'}},
    {id:'polite', no:4, jp:'丁寧に', kana:'ていねいに', en:'Being polite',
      scene:{jp:'お先に失礼します。', en:'Leaving the studio while the retouching team keeps working.'}},
    {id:'link', no:5, jp:'つなぎ言葉', kana:'つなぎことば', en:'Linking words',
      scene:{jp:'やっぱり、最高！', en:'Back to your first-choice frame during the edit.'}},
    {id:'short', no:6, jp:'一言で', kana:'ひとことで', en:'In a word',
      scene:{jp:'いいね！そうだね。', en:'Agreeing with the stylist’s last-minute jacket swap.'}},
    {id:'shop', no:7, jp:'お店で', kana:'おみせで', en:'Cafés & shops',
      scene:{jp:'カードで払えますか？', en:'Buying coffee for the crew, or spare batteries in Akihabara.'}},
    {id:'friends', no:8, jp:'友達と', kana:'ともだちと', en:'With friends',
      scene:{jp:'また連絡するね。じゃあね。', en:'Saying goodbye to a model you got on well with after a casting.'}},
    {id:'feel', no:9, jp:'気持ち', kana:'きもち', en:'Feelings',
      scene:{jp:'緊張する…安心した！', en:'Before and after presenting your selects to the client.'}},
    {id:'cheer', no:10, jp:'応援', kana:'おうえん', en:'Encouragement',
      scene:{jp:'頑張って！お疲れ！', en:'Cheering on your assistant through a long location day.'}}
  ];

  const P = {
    greet: [
      ['おはよう','おはよう','ohayō','Good morning','casual','Casual, for friends and family. Polite: おはようございます. On Japanese film and fashion sets, おはようございます is the first greeting of the working day, whatever the hour.'],
      ['こんにちは','こんにちは','konnichiwa','Hello; good afternoon','neutral','The final は is the topic particle, so it is pronounced wa. Used with people outside your close circle; colleagues who see each other daily rarely say it.'],
      ['こんばんは','こんばんは','konbanwa','Good evening','neutral','は is read wa again. ん before b sounds close to m: kombanwa.'],
      ['はじめまして','はじめまして','hajimemashite','Nice to meet you','polite','Only at a first meeting. Usually followed by your name and よろしくお願いします.',[['はじめて','はじめて','for the first time']]],
      ['ありがとう','ありがとう','arigatō','Thanks','casual','Casual. To clients and staff say ありがとうございます (arigatō gozaimasu).'],
      ['すみません','すみません','sumimasen','Excuse me; sorry; thank you for the trouble','polite','Three jobs: getting attention (in a café), a light apology, and thanks when someone goes out of their way. The u in su is often whispered: s’mimasen.'],
      ['お疲れ様です','おつかれさまです','otsukaresama desu','Thanks for your hard work','polite','The working greeting in Japan. Say it to colleagues during the day, and お疲れ様でした (… deshita, past) when the shoot wraps.',[['お','お','polite prefix'],['疲れ','つかれ','tiredness'],['様','さま','honorific'],['です','です','is (polite)']]],
      ['よろしくお願いします','よろしくおねがいします','yoroshiku onegai shimasu','I’m counting on you; please treat me well','polite','After introductions, at the start of a shoot, or when asking a favour. Essential on every set.',[['よろしく','よろしく','kindly; favourably'],['お願いします','おねがいします','I request; please']]],
      ['いただきます','いただきます','itadakimasu','Said before eating','polite','Literally “I humbly receive”. Said before eating, often with hands together; also when someone brings food for the crew.'],
      ['ごちそうさまでした','ごちそうさまでした','gochisōsama deshita','Thank you for the meal','polite','Said after eating: to your host, or to the staff as you leave a restaurant.']
    ],
    react: [
      ['本当？','ほんとう？','hontō?','Really?','casual','Rising intonation makes it a question. Polite: 本当ですか？ Often shortened to ほんと？',[['本当','ほんとう','truth; real']]],
      ['まじで？','まじで？','majide?','Seriously?','slang','Young, casual speech. With clients use 本当ですか？ instead.'],
      ['すごい！','すごい！','sugoi!','Amazing! Wow!','casual','For anything impressive. Polite: すごいですね！ (sugoi desu ne).'],
      ['やばい','やばい','yabai','Crazy! / Oh no!','slang','Originally “dangerous”. Now “wow” or “oh no”, depending on tone. Keep it among friends.'],
      ['うそ！','うそ！','uso!','No way!','casual','Literally “a lie!”, but it expresses surprise, not an accusation.'],
      ['なるほど','なるほど','naruhodo','I see; that makes sense','neutral','Shows you understood. With seniors it can sound like you are judging their point; そうなんですね (sō nan desu ne, “oh, I see”) is softer.'],
      ['かわいい！','かわいい！','kawaii!','So cute!','casual','Four beats: ka-wa-i-i. Praise for clothes, accessories, animals, people.'],
      ['面白い','おもしろい','omoshiroi','Funny; interesting','neutral','Means both “fun/funny” and “interesting”. Polite: 面白いです.',[['面白い','おもしろい','interesting (an adjective)']]],
      ['最高！','さいこう！','saikō!','The best! Awesome!','casual','The perfect reaction to a great frame.',[['最','さい','most'],['高','こう','high']]],
      ['残念','ざんねん','zannen','What a pity','neutral','Disappointment: a cancelled shoot, bad weather. Polite: 残念です.']
    ],
    daily: [
      ['行ってきます','いってきます','ittekimasu','I’m off (and I’ll be back)','neutral','Said when leaving home or the office. The reply is いってらっしゃい. The small っ doubles the t: it-te.',[['行って','いって','go, and…'],['きます','きます','come (back)']]],
      ['いってらっしゃい','いってらっしゃい','itterasshai','See you; have a good one','neutral','Said to someone who is leaving and will return. Reply to 行ってきます.'],
      ['ただいま','ただいま','tadaima','I’m home; I’m back','neutral','Also used when you return to the office or the studio. The reply is おかえり.'],
      ['おかえり','おかえり','okaeri','Welcome back','casual','Reply to ただいま. Polite: おかえりなさい (okaeri nasai).'],
      ['おやすみ','おやすみ','oyasumi','Good night','casual','Polite: おやすみなさい (oyasumi nasai).'],
      ['お腹すいた','おなかすいた','onaka suita','I’m hungry','casual','Literally “my stomach became empty”. Polite: お腹がすきました.',[['お腹','おなか','stomach'],['すいた','すいた','became empty']]],
      ['眠い','ねむい','nemui','I’m sleepy','casual','An adjective that works as a full sentence. Polite: 眠いです.'],
      ['疲れた','つかれた','tsukareta','I’m tired','casual','Past form of 疲れる (to get tired). Polite: 疲れました. Same 疲 as in お疲れ様.'],
      ['ちょっと待って','ちょっとまって','chotto matte','Wait a moment','casual','Polite: ちょっと待ってください (… kudasai, please).',[['ちょっと','ちょっと','a little'],['待って','まって','wait']]],
      ['今行く！','いまいく！','ima iku!','Coming! On my way!','casual','Polite: 今行きます！ (ima ikimasu).',[['今','いま','now'],['行く','いく','go']],'いま行く！']
    ],
    polite: [
      ['お願いします','おねがいします','onegai shimasu','Please (I request)','polite','For ordering, asking for help, or handing over a task: これ、お願いします.'],
      ['どうぞ','どうぞ','dōzo','Please, go ahead','polite','Offering something or letting someone go first. お願いします asks; どうぞ offers.'],
      ['どういたしまして','どういたしまして','dō itashimashite','You’re welcome','polite','The textbook reply to thanks. Many people say いえいえ (ie ie, “no, no”) instead.'],
      ['失礼します','しつれいします','shitsurei shimasu','Excuse me (for intruding or leaving)','polite','Entering an office, ending a phone call, leaving a room.',[['失礼','しつれい','rudeness; discourtesy'],['します','します','I do']]],
      ['ごめんなさい','ごめんなさい','gomen nasai','I’m sorry','neutral','A personal apology. At work, すみません or 申し訳ありません (mōshiwake arimasen, very formal) is usual.'],
      ['気にしないで','きにしないで','ki ni shinaide','Don’t worry about it','casual','Polite: 気にしないでください.',[['気','き','mind; feeling'],['に','に','particle: onto'],['しないで','しないで','don’t do']]],
      ['助かります','たすかります','tasukarimasu','That really helps','polite','Thanks for practical help, like an assistant bringing a fresh battery.'],
      ['お先に失礼します','おさきにしつれいします','osaki ni shitsurei shimasu','Excuse me for leaving first','polite','Said when you leave work before others. The usual reply is お疲れ様です.',[['お先に','おさきに','ahead (of you)'],['失礼します','しつれいします','excuse me']]],
      ['恐れ入ります','おそれいります','osore irimasu','I’m much obliged; excuse me','very polite','Keigo (respectful speech) for clients, galleries and hotels: to thank, or to begin a polite request.'],
      ['お邪魔します','おじゃまします','ojama shimasu','Sorry to intrude (as I come in)','polite','Entering a home, an office or a location. On leaving: お邪魔しました.']
    ],
    link: [
      ['ところで','ところで','tokorode','By the way','neutral','Changes the topic.'],
      ['実は','じつは','jitsu wa','Actually; to tell the truth','neutral','は is the topic particle, read wa. Introduces news or a confession.'],
      ['やっぱり','やっぱり','yappari','As I thought; after all','casual','Neutral form: やはり (yahari).'],
      ['とりあえず','とりあえず','toriaezu','For now; to start with','neutral','Classic in an izakaya: とりあえずビール (… bīru), “a beer to start”.'],
      ['つまり','つまり','tsumari','In other words; so','neutral','Sums up or restates what was said.'],
      ['例えば','たとえば','tatoeba','For example','neutral','Introduces an example.'],
      ['正直','しょうじき','shōjiki','Honestly','neutral','Also 正直に言うと (shōjiki ni iu to), “to be honest”.'],
      ['なんか','なんか','nanka','Kind of; like…','casual','A filler, like English “like”. It can sound young and vague, so use it sparingly.'],
      ['だから','だから','dakara','So; that’s why','casual','Polite: ですから (desukara).'],
      ['そういえば','そういえば','sō ieba','Come to think of it','neutral','Introduces something you just remembered.',[['そう','そう','so; like that'],['いえば','いえば','if (I) say']]]
    ],
    short: [
      ['いいね！','いいね！','ii ne!','Nice! Great!','casual','いい (good) + ね (looking for agreement). Ideal when the model nails a pose.'],
      ['仕方ない','しかたない','shikata nai','It can’t be helped','neutral','Accepting what you cannot change. Casual variant: しょうがない (shō ga nai).',[['仕方','しかた','way of doing'],['ない','ない','there is none']]],
      ['簡単だよ','かんたんだよ','kantan da yo','It’s easy','casual','簡単 (easy) + だ (is) + よ (I’m telling you). Polite: 簡単です.'],
      ['無理！','むり！','muri!','Impossible! I can’t!','casual','Direct. With clients, soften it: ちょっと難しいです (chotto muzukashii desu, “that’s a little difficult”).'],
      ['もちろん','もちろん','mochiron','Of course','neutral','A friendly, confident yes.'],
      ['確かに','たしかに','tashika ni','That’s true; indeed','neutral','Agreeing with a point someone just made.'],
      ['そうだね','そうだね','sō da ne','Yeah, that’s right','casual','Polite: そうですね (sō desu ne).'],
      ['微妙','びみょう','bimyō','So-so; iffy','casual','A soft way to say “not great” about a dish, an outfit or a shot.'],
      ['まあまあ','まあまあ','māmā','So-so; not bad','neutral','Hold each a: mā-mā.'],
      ['関係ない','かんけいない','kankei nai','It doesn’t matter; it’s unrelated','casual','関係 (relation) + ない (there is none). It can sound blunt.']
    ],
    shop: [
      ['これください','これください','kore kudasai','This one, please','polite','これ (this) + ください (please give me). Point at the item.'],
      ['いくらですか？','いくらですか？','ikura desu ka?','How much is it?','polite','か at the end turns a sentence into a question.'],
      ['お会計お願いします','おかいけいおねがいします','okaikei onegai shimasu','The bill, please','polite','In restaurants you often pay at the register by the door.',[['お会計','おかいけい','the bill'],['お願いします','おねがいします','please']]],
      ['おすすめは何ですか？','おすすめはなんですか？','osusume wa nan desu ka?','What do you recommend?','polite','は is read wa. 何 is read なん (nan) before です.',[['おすすめ','おすすめ','recommendation'],['は','は (wa)','topic particle'],['何','なん','what'],['ですか','ですか','is it?']],'おすすめはなんですか？'],
      ['水をください','みずをください','mizu o kudasai','Water, please','polite','を is written wo but pronounced o; it marks the thing you want.',[['水','みず','water'],['を','を (o)','object particle'],['ください','ください','please give']]],
      ['カードで払えますか？','カードではらえますか？','kādo de haraemasu ka?','Can I pay by card?','polite','Katakana カード = card. で = by means of. 払えます = can pay.',[['カード','かーど','card'],['で','で','by; with'],['払えます','はらえます','can pay'],['か','か','question']]],
      ['袋はいりません','ふくろはいりません','fukuro wa irimasen','I don’t need a bag','polite','Shops in Japan charge for bags. は is read wa.',[['袋','ふくろ','bag'],['は','は (wa)','topic particle'],['いりません','いりません','don’t need']]],
      ['美味しい！','おいしい！','oishii!','Delicious!','neutral','Often written in hiragana: おいしい.'],
      ['持ち帰りで','もちかえりで','mochikaeri de','To take away, please','polite','The answer to “eat in or take out?”. Eating in: 店内で (tennai de).',[['持ち帰り','もちかえり','takeaway'],['で','で','as; with']]],
      ['大丈夫です','だいじょうぶです','daijōbu desu','I’m fine; no thank you','polite','A polite refusal (“I’m fine without it”) or “I’m OK”. Tone and context decide.']
    ],
    friends: [
      ['久しぶり！','ひさしぶり！','hisashiburi!','Long time no see!','casual','Polite: お久しぶりです.'],
      ['元気？','げんき？','genki?','How are you?','casual','Literally “well?”. Polite: お元気ですか？'],
      ['元気だよ','げんきだよ','genki da yo','I’m good','casual','元気 (well) + だ (is) + よ (telling you). Polite: 元気です.'],
      ['何してる？','なにしてる？','nani shiteru?','What are you doing?','casual','Short for 何をしている. A typical first message on LINE.',[['何','なに','what'],['してる','してる','are doing']]],
      ['LINEやってる？','ラインやってる？','rain yatteru?','Are you on LINE?','casual','LINE is Japan’s main messaging app. This is how people swap contacts.',[['LINE','ライン','the LINE app'],['やってる','やってる','are using; are doing']],'ラインやってる？'],
      ['また連絡するね','またれんらくするね','mata renraku suru ne','I’ll be in touch','casual','また (again) + 連絡する (contact) + ね.',[['また','また','again'],['連絡する','れんらくする','to contact'],['ね','ね','friendly ending']]],
      ['一緒に行こう','いっしょにいこう','issho ni ikō','Let’s go together','casual','行こう is the “let’s” form of 行く. Polite: 一緒に行きましょう.',[['一緒に','いっしょに','together'],['行こう','いこう','let’s go']]],
      ['今度遊ぼう','こんどあそぼう','kondo asobō','Let’s hang out sometime','casual','Often a friendly gesture rather than a fixed plan.',[['今度','こんど','next time; sometime'],['遊ぼう','あそぼう','let’s hang out']]],
      ['じゃあね','じゃあね','jā ne','Bye!','casual','Between friends.'],
      ['またね','またね','mata ne','See you!','casual','Literally “again, OK?”.']
    ],
    feel: [
      ['嬉しい','うれしい','ureshii','I’m happy; I’m glad','neutral','Polite: 嬉しいです.'],
      ['楽しい','たのしい','tanoshii','Fun; I’m having fun','neutral','楽しかった (tanoshikatta) = that was fun.'],
      ['寂しい','さびしい','sabishii','Lonely; I miss you','neutral','Also さみしい (samishii).'],
      ['怖い','こわい','kowai','Scary; I’m scared','neutral','For people, places, heights, or a stern director.'],
      ['恥ずかしい','はずかしい','hazukashii','Embarrassing; I feel shy','neutral','Models may say this when a pose feels awkward. Reassure them.'],
      ['悲しい','かなしい','kanashii','Sad','neutral','Polite: 悲しいです.'],
      ['ムカつく','むかつく','mukatsuku','That’s so annoying','slang','Rude-ish. The katakana ムカ adds emphasis.'],
      ['緊張する','きんちょうする','kinchō suru','I’m nervous','neutral','Polite: 緊張します.'],
      ['安心した','あんしんした','anshin shita','What a relief','neutral','安心 (peace of mind) + した (did).'],
      ['感動した','かんどうした','kandō shita','I was moved','neutral','For a film, an exhibition, a wonderful moment.']
    ],
    cheer: [
      ['頑張って！','がんばって！','ganbatte!','Good luck! Hang in there!','casual','Polite: 頑張ってください.'],
      ['頑張ります','がんばります','ganbarimasu','I’ll do my best','polite','A useful promise to a client or agency.'],
      ['無理しないで','むりしないで','muri shinaide','Don’t overdo it','casual','無理 (too much) + しないで (don’t do).'],
      ['お大事に','おだいじに','odaiji ni','Get well soon; take care','neutral','Said to someone who is ill or injured.'],
      ['おめでとう！','おめでとう！','omedetō!','Congratulations!','casual','Polite: おめでとうございます.'],
      ['信じてる','しんじてる','shinjiteru','I believe in you','casual','Short for 信じている.'],
      ['応援してる','おうえんしてる','ōen shiteru','I’m rooting for you','casual','応援 (support) + してる (am doing).'],
      ['一人じゃないよ','ひとりじゃないよ','hitori ja nai yo','You’re not alone','casual','一人 (one person; alone) + じゃない (is not) + よ.'],
      ['さすが！','さすが！','sasuga!','As expected of you!','casual','Praise for living up to a reputation: さすがプロ！ (sasuga puro, “a real pro!”).'],
      ['お疲れ！','おつかれ！','otsukare!','Good work! Cheers!','casual','Short, casual お疲れ様です between peers after work.']
    ]
  };

  /* Kanji and katakana with writing practice: meaning, reading in these phrases */
  const chars = {
    '疲':['tired','つか'],'様':['honorific; manner','さま'],'願':['wish; request','ねが'],
    '本':['origin; true; book','ほん'],'当':['hit; correct','とう'],'面':['face; surface','おも'],'白':['white','しろ'],
    '最':['most','さい'],'高':['high','こう'],'残':['remain','ざん'],'念':['thought; feeling','ねん'],
    '行':['go','い'],'腹':['belly','なか'],'眠':['sleep','ねむ'],'待':['wait','ま'],'今':['now','いま・こん'],
    '失':['lose','しつ'],'礼':['courtesy; thanks','れい'],'気':['spirit; mind','き'],'助':['help','たす'],'先':['ahead; previous','さき'],
    '恐':['fear','おそ'],'入':['enter','い'],'邪':['wicked','じゃ'],'魔':['demon','ま'],
    '実':['truth; fruit','じつ'],'例':['example','たと'],'正':['correct','しょう'],'直':['straight; honest','じき'],
    '仕':['serve; do','し'],'方':['way; direction','かた'],'簡':['simple','かん'],'単':['single; simple','たん'],
    '無':['nothing; without','む'],'理':['reason; logic','り'],'確':['certain','たし'],'微':['delicate','び'],'妙':['strange; subtle','みょう'],
    '関':['connection','かん'],'係':['relation','けい'],'会':['meet','かい'],'計':['measure; total','けい'],'何':['what','なに・なん'],
    '水':['water','みず'],'払':['pay','はら'],'袋':['bag','ふくろ'],'美':['beauty','おい (special reading)'],'味':['taste','おい (special reading)'],
    '持':['hold; carry','も'],'帰':['return home','かえ'],'大':['big','だい'],'丈':['length; sturdy','じょう'],'夫':['man; husband','ぶ'],
    '久':['long time','ひさ'],'元':['origin','げん'],'連':['link; take along','れん'],'絡':['entwine; connect','らく'],
    '一':['one','いっ・ひと'],'緒':['cord; beginning','しょ'],'度':['time; degree','ど'],'遊':['play','あそ'],
    '嬉':['glad','うれ'],'楽':['fun; ease','たの'],'寂':['lonely','さび'],'怖':['scary','こわ'],'恥':['shame','は'],'悲':['sad','かな'],
    '緊':['tense','きん'],'張':['stretch','ちょう・ば'],'安':['peaceful; cheap','あん'],'心':['heart','しん'],'感':['feeling','かん'],'動':['move','どう'],
    '頑':['stubborn; firm','がん'],'事':['thing; matter','じ'],'信':['trust','しん'],'応':['respond','おう'],'援':['aid','えん'],'人':['person','り (in 一人)'],
    'カ':['katakana ka','か'],'ド':['katakana do','ど'],'ム':['katakana mu','む']
  };

  const phrases = [];
  for (const c of cats) P[c.id].forEach((p, i) => phrases.push({
    id: c.id + '-' + (i + 1), n: (c.no - 1) * 10 + i + 1, cat: c.id,
    jp: p[0], kana: p[1], romaji: p[2], en: p[3], reg: p[4], note: p[5], parts: p[6] || [], say: p[7] || p[0]
  }));
  const writable = s => [...s].filter(ch => chars[ch]);
  phrases.forEach(p => { p.chars = [...new Set(writable(p.jp))]; });

  /* Answer checking: kanji/kana exact (punctuation-insensitive) or Hepburn romaji, long vowels optional */
  const strip = s => String(s).normalize('NFKC').replace(/[\s、。，．,.!?！？…・「」'"\-ー~〜]/g, '').toLowerCase();
  const kataToHira = s => s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  function romaNorm(s) {
    let r = String(s).normalize('NFKC').toLowerCase()
      .replace(/[āâ]/g, 'a').replace(/[īî]/g, 'i').replace(/[ūû]/g, 'u').replace(/[ēê]/g, 'e').replace(/[ōô]/g, 'o')
      .replace(/\bwo\b/g, 'o').replace(/\bha\b/g, 'wa').replace(/[^a-z]/g, '');
    r = r.replace(/ou/g, 'o').replace(/oo/g, 'o').replace(/uu/g, 'u').replace(/aa/g, 'a').replace(/ii/g, 'i').replace(/ee/g, 'e').replace(/ei/g, 'e');
    return r.replace(/m(?=[bmp])/g, 'n');
  }
  function check(p, answer) {
    const a = strip(answer); if (!a) return false;
    const jpForms = [p.jp, p.kana, p.say].map(x => kataToHira(strip(x)));
    if (jpForms.includes(kataToHira(a))) return true;
    if (/^[a-z]+$/.test(a.normalize('NFD').replace(/[̀-ͯ]/g, ''))) {
      const target = romaNorm(p.romaji), mine = romaNorm(answer);
      return mine === target;
    }
    return false;
  }
  function similarity(a, b) {
    a = kataToHira(strip(a)); b = kataToHira(strip(b));
    if (!a || !b) return 0;
    const d = Array.from({length: a.length + 1}, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    return 1 - d[a.length][b.length] / Math.max(a.length, b.length);
  }
  function heard(p, transcript) {
    const best = Math.max(...[p.jp, p.kana, p.say].map(f => similarity(transcript, f)));
    return {score: best, status: best >= 0.999 ? 'match' : best >= 0.6 ? 'close' : 'different'};
  }

  const api = {version: '1.0.0', template: '1.0.0', cats, phrases, chars, check, heard, similarity, romaNorm, strip};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KOTOBA = api;
})(typeof window !== 'undefined' ? window : globalThis);

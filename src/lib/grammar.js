// ── GRAMMAR REFERENCE ─────────────────────────────────────────────────────────
// A complete, level-organised grammar reference that mirrors the GC Buddy
// curriculum (CURRICULUM in constants.js). Every major grammar point the course
// teaches from A1 to B2 has an entry here, kept nursing-focused throughout.
//
// Content is STRUCTURED (not one big pre-formatted string) so the Learn Hub can
// render clean tables, example pairs and callouts instead of a monospace dump.
//
// Entry shape:
//   { id, level, icon, title, sub, ref, blocks[], tip?, mistake? }
// Block shape (discriminated by `type`):
//   { type:'note',  h?, text }                       → a short paragraph
//   { type:'list',  h?, items:[ 'text', ... ] }      → bullet list
//   { type:'table', h?, cols:[...], rows:[[...]] }   → reference table
//   { type:'ex',    h?, items:[ [de, en], ... ] }    → German → English examples
// `ref` is the matching CURRICULUM topic id, so the two stay in sync.

export const GRAMMAR = {
  A1: [
    {
      id: 'a1-pron', level: 'A1', icon: '🔤', ref: 'a1-1',
      title: 'Pronunciation & the Alphabet',
      sub: 'Vowels, umlauts, ß and tricky consonant clusters',
      blocks: [
        { type: 'note', text: 'German is largely phonetic — once you know the sounds, you can read almost any word. A few letters differ sharply from English.' },
        { type: 'table', h: 'Sounds that trip up English speakers', cols: ['Letter', 'Sounds like', 'Example'], rows: [
          ['w', 'English "v"', 'Wunde (wound) = "voonde"'],
          ['v', 'English "f"', 'Vater (father) = "fahter"'],
          ['z', '"ts"', 'Zimmer (room) = "tsimmer"'],
          ['ei', '"eye"', 'nein (no) = "nine"'],
          ['ie', '"ee"', 'Fieber (fever) = "feeber"'],
          ['eu / äu', '"oy"', 'Deutsch = "doytsch"'],
          ['ch', 'soft "h" / "kh"', 'ich, Nacht'],
          ['sch', '"sh"', 'Schmerz (pain) = "shmerts"'],
        ]},
        { type: 'list', h: 'Umlauts & ß', items: [
          'ä ≈ "e" in bed · ö ≈ "u" in fur · ü — say "ee" with rounded lips',
          'ß (Eszett) = a sharp "ss", always after a long vowel: Straße, groß',
          'Umlauts change meaning: schon (already) vs. schön (beautiful)',
        ]},
      ],
      tip: 'Read every new word aloud with its article — pronunciation and gender stick together.',
    },
    {
      id: 'a1-sein', level: 'A1', icon: '📗', ref: 'a1-3',
      title: "The Verb 'sein' (to be) & Pronouns",
      sub: 'Personal pronouns and the most important irregular verb',
      blocks: [
        { type: 'table', h: 'Subject pronouns + sein', cols: ['Pronoun', 'Meaning', 'sein'], rows: [
          ['ich', 'I', 'bin'],
          ['du', 'you (informal)', 'bist'],
          ['er / sie / es', 'he / she / it', 'ist'],
          ['wir', 'we', 'sind'],
          ['ihr', 'you (plural, informal)', 'seid'],
          ['sie / Sie', 'they / You (formal)', 'sind'],
        ]},
        { type: 'ex', h: 'In the hospital', items: [
          ['Ich bin die Nachtschwester.', 'I am the night nurse.'],
          ['Sind Sie der Arzt?', 'Are you the doctor?'],
          ['Der Patient ist müde.', 'The patient is tired.'],
          ['Wir sind gleich fertig.', 'We are almost done.'],
        ]},
      ],
      tip: 'With patients and colleagues you don\'t know, always use the formal "Sie".',
      mistake: 'Plural "sie" (they) and formal "Sie" (you) look alike — the capital S marks the formal one.',
    },
    {
      id: 'a1-haben', level: 'A1', icon: '✋', ref: 'a1-6',
      title: "Present Tense & 'haben'",
      sub: 'Regular verb endings and the verb "to have"',
      blocks: [
        { type: 'note', text: 'Regular verbs = stem + ending. Take the infinitive (arbeiten → arbeit-) and add the ending for each pronoun.' },
        { type: 'table', h: 'arbeiten (to work) · haben (to have)', cols: ['Pronoun', 'arbeiten', 'haben'], rows: [
          ['ich', 'arbeite', 'habe'],
          ['du', 'arbeitest', 'hast'],
          ['er/sie/es', 'arbeitet', 'hat'],
          ['wir', 'arbeiten', 'haben'],
          ['ihr', 'arbeitet', 'habt'],
          ['sie/Sie', 'arbeiten', 'haben'],
        ]},
        { type: 'ex', h: 'Nursing examples', items: [
          ['Ich arbeite auf der Intensivstation.', 'I work in the ICU.'],
          ['Haben Sie Schmerzen?', 'Are you in pain? (lit. Do you have pain?)'],
          ['Der Patient hat Fieber.', 'The patient has a fever.'],
        ]},
      ],
      tip: 'German uses "haben" for states English uses "to be" for: Hunger haben, Durst haben, Angst haben, Schmerzen haben.',
    },
    {
      id: 'a1-gender', level: 'A1', icon: '🏷️', ref: 'a1-5',
      title: 'Nouns, Genders & Plurals',
      sub: 'der / die / das and how to form plurals',
      blocks: [
        { type: 'table', h: 'Every noun has one of three genders', cols: ['Gender', 'Article', 'Hospital examples'], rows: [
          ['masculine', 'der', 'der Arzt, der Arm, der Blutdruck, der Puls'],
          ['feminine', 'die', 'die Schwester, die Wunde, die Tablette, die Station'],
          ['neuter', 'das', 'das Krankenhaus, das Bett, das Blut, das Medikament'],
        ]},
        { type: 'list', h: 'Handy gender hints', items: [
          '-ung, -heit, -keit, -e → usually die (die Behandlung, die Spritze)',
          '-er (person/tool), -ismus → usually der (der Computer)',
          '-chen, -lein, -ment → das (das Mädchen, das Medikament)',
          'In the plural every noun takes die: die Tabletten, die Ärzte',
        ]},
      ],
      tip: 'There is no reliable rule for every word — learn the article as part of the noun from day one.',
      mistake: 'Guessing the article from the English meaning fails: das Mädchen (the girl) is neuter, not feminine.',
    },
    {
      id: 'a1-wordorder', level: 'A1', icon: '🧱', ref: 'a1-7',
      title: 'Sentence Structure & Questions',
      sub: 'The verb-second rule, yes/no and W-questions',
      blocks: [
        { type: 'list', h: 'The golden rule', items: [
          'In a statement the conjugated verb is always the SECOND element.',
          'Ich messe jetzt den Blutdruck. → Jetzt messe ich den Blutdruck. (verb still 2nd)',
        ]},
        { type: 'ex', h: 'Yes/No questions — verb first', items: [
          ['Haben Sie Schmerzen?', 'Are you in pain?'],
          ['Nehmen Sie Medikamente?', 'Do you take any medication?'],
        ]},
        { type: 'table', h: 'W-questions', cols: ['Word', 'Meaning', 'Example'], rows: [
          ['Wer', 'who', 'Wer ist Ihr Arzt?'],
          ['Was', 'what', 'Was tut weh?'],
          ['Wo', 'where', 'Wo haben Sie Schmerzen?'],
          ['Wann', 'when', 'Wann hat es angefangen?'],
          ['Wie', 'how', 'Wie geht es Ihnen?'],
          ['Warum', 'why', 'Warum sind Sie hier?'],
        ]},
      ],
      tip: 'Time-Manner-Place: state WHEN, then HOW, then WHERE — "Ich gehe heute mit dem Bus zur Klinik."',
    },
    {
      id: 'a1-possessive', level: 'A1', icon: '👪', ref: 'a1-8',
      title: 'Possessives & the Imperative',
      sub: 'mein/dein/Ihr and giving instructions',
      blocks: [
        { type: 'table', h: 'Possessive articles', cols: ['Pronoun', 'Possessive', 'Example'], rows: [
          ['ich', 'mein', 'mein Name'],
          ['du', 'dein', 'deine Karte'],
          ['er / es', 'sein', 'sein Zimmer'],
          ['sie', 'ihr', 'ihre Tablette'],
          ['Sie (formal)', 'Ihr', 'Ihr Blutdruck'],
        ]},
        { type: 'ex', h: 'Formal imperative (Sie) — for patient instructions', items: [
          ['Öffnen Sie bitte den Mund.', 'Please open your mouth.'],
          ['Atmen Sie tief ein.', 'Breathe in deeply.'],
          ['Nehmen Sie die Tablette nach dem Essen.', 'Take the tablet after eating.'],
          ['Bleiben Sie bitte ruhig.', 'Please stay calm.'],
        ]},
      ],
      tip: 'The polite imperative = verb + "Sie" + "bitte". It is the phrase pattern you will use most on the ward.',
    },
    {
      id: 'a1-akk', level: 'A1', icon: '🎯', ref: 'a1-9',
      title: 'The Accusative Case',
      sub: 'The direct object — what receives the action',
      blocks: [
        { type: 'table', h: 'Only masculine changes!', cols: ['Gender', 'Nominative', 'Accusative'], rows: [
          ['masculine', 'der / ein', 'den / einen'],
          ['feminine', 'die / eine', 'die / eine'],
          ['neuter', 'das / ein', 'das / ein'],
          ['plural', 'die', 'die'],
        ]},
        { type: 'ex', h: 'Examples', items: [
          ['Ich rufe den Arzt.', 'I call the doctor. (der → den)'],
          ['Ich nehme die Tablette.', 'I take the tablet. (unchanged)'],
          ['Ich prüfe das Formular.', 'I check the form. (unchanged)'],
        ]},
        { type: 'list', h: 'Accusative prepositions (always)', items: ['durch, für, gegen, ohne, um', 'Die Spritze ist für den Patienten.'] },
      ],
      tip: 'If a masculine "der"-word is the thing being acted on, it becomes "den". Everything else stays the same.',
    },
    {
      id: 'a1-negation', level: 'A1', icon: '🚫', ref: 'a1-13',
      title: 'Negation: nicht vs. kein',
      sub: 'The two ways to say "no / not"',
      blocks: [
        { type: 'list', h: 'Which one?', items: [
          'kein → negates a NOUN with ein/no article (Ich habe kein Fieber.)',
          'nicht → negates a verb, adjective, or a noun with der/die/das (Der Patient schläft nicht.)',
        ]},
        { type: 'ex', h: 'Compare', items: [
          ['Ich habe keine Schmerzen.', 'I have no pain.'],
          ['Das ist nicht der richtige Patient.', 'That is not the right patient.'],
          ['Sie dürfen heute nicht essen.', 'You may not eat today.'],
        ]},
      ],
      tip: '"nicht" usually goes at the end, or right before the word it negates.',
      mistake: 'Don\'t say "Ich habe nicht Fieber" — with a bare noun use kein: "Ich habe kein Fieber".',
    },
    {
      id: 'a1-separable', level: 'A1', icon: '✂️', ref: 'a1-15',
      title: 'Separable Verbs & Daily Routine',
      sub: 'Verbs that split, and telling the time',
      blocks: [
        { type: 'note', text: 'Many verbs have a prefix that jumps to the END of the sentence in the present tense: aufstehen, anrufen, einnehmen, mitkommen.' },
        { type: 'ex', h: 'The prefix goes last', items: [
          ['Ich stehe um sechs Uhr auf.', 'I get up at six. (aufstehen)'],
          ['Nehmen Sie das Medikament morgens ein.', 'Take the medication in the morning. (einnehmen)'],
          ['Ich rufe den Arzt an.', 'I call the doctor. (anrufen)'],
        ]},
        { type: 'table', h: 'Telling the time', cols: ['German', 'Meaning'], rows: [
          ['Es ist acht Uhr.', "It's 8:00"],
          ['Viertel nach acht', '8:15'],
          ['halb neun', "8:30 (lit. 'half nine')"],
          ['Viertel vor neun', '8:45'],
        ]},
      ],
      mistake: '"halb neun" means 8:30, NOT 9:30 — Germans count toward the coming hour.',
    },
    {
      id: 'a1-modal', level: 'A1', icon: '🔑', ref: 'a1-16',
      title: 'Modal Verbs',
      sub: 'können, müssen, dürfen, sollen, wollen, möchten',
      blocks: [
        { type: 'table', h: 'Meaning + ich-form', cols: ['Modal', 'Meaning', 'ich / er'], rows: [
          ['können', 'can / able to', 'kann'],
          ['müssen', 'must / have to', 'muss'],
          ['dürfen', 'may / allowed to', 'darf'],
          ['sollen', 'should / supposed to', 'soll'],
          ['wollen', 'want to', 'will'],
          ['möchten', 'would like to', 'möchte'],
        ]},
        { type: 'ex', h: 'Modal + infinitive at the end', items: [
          ['Sie müssen nüchtern bleiben.', 'You must stay fasting.'],
          ['Können Sie den Arm heben?', 'Can you lift your arm?'],
          ['Sie dürfen jetzt aufstehen.', 'You may get up now.'],
          ['Ich möchte Ihren Blutdruck messen.', 'I would like to measure your blood pressure.'],
        ]},
      ],
      tip: 'Word order: modal in position 2, the main verb (infinitive) at the very end.',
      mistake: 'Never conjugate the second verb: "Ich kann helfen" ✓ — not "Ich kann helfe" ✗.',
    },
    {
      id: 'a1-perfekt', level: 'A1', icon: '⏮️', ref: 'a1-20',
      title: 'The Perfect Tense (Perfekt) & Connectors',
      sub: 'Talking about the past + und/aber/oder/denn',
      blocks: [
        { type: 'note', text: 'Perfekt = haben/sein (position 2) + Partizip II (at the end). It is the normal way to talk about the past in speech.' },
        { type: 'ex', h: 'haben for most verbs', items: [
          ['Ich habe die Tablette genommen.', 'I took the tablet.'],
          ['Der Patient hat gut geschlafen.', 'The patient slept well.'],
        ]},
        { type: 'ex', h: 'sein for movement / change', items: [
          ['Der Patient ist aufgestanden.', 'The patient got up.'],
          ['Das Fieber ist gesunken.', 'The fever went down.'],
        ]},
        { type: 'list', h: 'ADUSO connectors (word order stays normal)', items: ['aber (but), denn (because), und (and), sondern (but rather), oder (or)'] },
      ],
      tip: 'Regular participle = ge + stem + t (gemacht); many strong verbs = ge + stem + en (genommen, geschlafen).',
    },
    {
      id: 'a1-dativ', level: 'A1', icon: '🎁', ref: 'a1-23',
      title: 'The Dative Case',
      sub: 'The indirect object — to / for whom',
      blocks: [
        { type: 'table', h: 'Dative articles', cols: ['Gender', 'Nom.', 'Dative'], rows: [
          ['masculine', 'der', 'dem'],
          ['feminine', 'die', 'der'],
          ['neuter', 'das', 'dem'],
          ['plural', 'die', 'den (+n on noun)'],
        ]},
        { type: 'ex', h: 'Give / help / explain take the dative', items: [
          ['Ich gebe dem Patienten die Tablette.', 'I give the patient the tablet.'],
          ['Ich helfe der Frau.', 'I help the woman.'],
          ['Wie geht es Ihnen?', 'How are you? (dative Ihnen)'],
        ]},
        { type: 'list', h: 'Always-dative prepositions', items: ['aus, bei, mit, nach, seit, von, zu', 'mit dem Bus, nach der Visite, beim Arzt'] },
      ],
      tip: 'Think "to/for whom" → dative. "Who/what is acted on" → accusative.',
    },
    {
      id: 'a1-wechsel', level: 'A1', icon: '↔️', ref: 'a1-25',
      title: 'Two-Way Prepositions',
      sub: 'Wechselpräpositionen — accusative or dative?',
      blocks: [
        { type: 'list', h: 'The nine two-way prepositions', items: ['in, an, auf, über, unter, vor, hinter, neben, zwischen'] },
        { type: 'list', h: 'The rule', items: [
          'Movement TO a place (Wohin?) → accusative',
          'Location / no movement (Wo?) → dative',
        ]},
        { type: 'ex', h: 'Same preposition, two cases', items: [
          ['Ich lege den Patienten ins Bett.', 'I put the patient into bed. (motion → Akk)'],
          ['Der Patient liegt im Bett.', 'The patient lies in bed. (location → Dat)'],
        ]},
      ],
      tip: 'Ask "wohin?" (where to) for accusative, "wo?" (where) for dative.',
    },
  ],

  A2: [
    {
      id: 'a2-praeteritum', level: 'A2', icon: '📜', ref: 'a2-2',
      title: 'Simple Past (Präteritum): war / hatte',
      sub: 'The written/narrative past and modal past forms',
      blocks: [
        { type: 'table', h: 'sein & haben in the past', cols: ['Pronoun', 'sein → war', 'haben → hatte'], rows: [
          ['ich', 'war', 'hatte'],
          ['du', 'warst', 'hattest'],
          ['er/sie/es', 'war', 'hatte'],
          ['wir/sie/Sie', 'waren', 'hatten'],
        ]},
        { type: 'ex', h: 'Used constantly in reports', items: [
          ['Der Patient war heute Nacht unruhig.', 'The patient was restless last night.'],
          ['Sie hatte starke Schmerzen.', 'She had strong pain.'],
          ['Er musste auf die Toilette.', 'He had to go to the toilet. (modal past)'],
        ]},
      ],
      tip: 'sein, haben and the modal verbs are used in the Präteritum even in speech; other verbs mostly use Perfekt.',
    },
    {
      id: 'a2-weil', level: 'A2', icon: '🔗', ref: 'a2-3',
      title: 'Subordinate Clauses: weil, dass, ob',
      sub: 'Causal and reported clauses — verb goes to the end',
      blocks: [
        { type: 'note', text: 'After weil (because), dass (that), ob (whether), wenn (if/when) the conjugated verb moves to the very END of the clause.' },
        { type: 'ex', h: 'Verb-final clauses', items: [
          ['Ich rufe den Arzt, weil der Patient Fieber hat.', 'I call the doctor because the patient has a fever.'],
          ['Ich glaube, dass er Schmerzen hat.', 'I think that he is in pain.'],
          ['Ich weiß nicht, ob sie gegessen hat.', "I don't know whether she has eaten."],
        ]},
      ],
      tip: 'A comma always separates the two clauses, and the verb sits just before the period.',
      mistake: 'weil sends the verb to the end; "denn" (also = because) does NOT — keep them apart.',
    },
    {
      id: 'a2-reflexive', level: 'A2', icon: '🔁', ref: 'a2-9',
      title: 'Reflexive Verbs',
      sub: 'sich waschen, sich fühlen and body-part expressions',
      blocks: [
        { type: 'table', h: 'Reflexive pronouns', cols: ['Pronoun', 'Accusative', 'Dative'], rows: [
          ['ich', 'mich', 'mir'],
          ['du', 'dich', 'dir'],
          ['er/sie/es/Sie', 'sich', 'sich'],
          ['wir', 'uns', 'uns'],
        ]},
        { type: 'ex', h: 'Nursing use', items: [
          ['Wie fühlen Sie sich heute?', 'How do you feel today?'],
          ['Können Sie sich waschen?', 'Can you wash yourself?'],
          ['Ich wasche mir die Hände.', 'I wash my hands. (dative — a body part follows)'],
        ]},
      ],
      tip: 'When a body part is named, the reflexive pronoun is usually dative: "Ich putze mir die Zähne".',
    },
    {
      id: 'a2-adjendings', level: 'A2', icon: '🎨', ref: 'a2-11',
      title: 'Adjective Endings',
      sub: 'Endings after der-, ein- and no article',
      blocks: [
        { type: 'note', text: 'An adjective before a noun takes an ending. The safest starting rule: after der/die/das use -e or -en.' },
        { type: 'table', h: 'After definite article (der/die/das)', cols: ['Case', 'm', 'f', 'n', 'pl'], rows: [
          ['Nom.', 'der -e', 'die -e', 'das -e', 'die -en'],
          ['Akk.', 'den -en', 'die -e', 'das -e', 'die -en'],
          ['Dat.', 'dem -en', 'der -en', 'dem -en', 'den -en'],
        ]},
        { type: 'ex', h: 'Examples', items: [
          ['der starke Schmerz', 'the strong pain'],
          ['Ich gebe dem alten Patienten die Tablette.', 'I give the old patient the tablet.'],
          ['ein hohes Fieber', 'a high fever'],
        ]},
      ],
      tip: 'Rule of thumb: if the article already shows the case clearly, the adjective usually ends in -en.',
    },
    {
      id: 'a2-comparison', level: 'A2', icon: '📊', ref: 'a2-14',
      title: 'Comparative & Superlative',
      sub: 'größer, am größten — comparing things',
      blocks: [
        { type: 'table', h: 'Three degrees', cols: ['Base', 'Comparative', 'Superlative'], rows: [
          ['schnell', 'schneller', 'am schnellsten'],
          ['gut', 'besser', 'am besten'],
          ['hoch', 'höher', 'am höchsten'],
          ['gern', 'lieber', 'am liebsten'],
        ]},
        { type: 'ex', h: 'In use', items: [
          ['Heute geht es dem Patienten besser.', 'Today the patient is doing better.'],
          ['Der Blutdruck ist höher als gestern.', 'The blood pressure is higher than yesterday.'],
          ['Diese Station ist am ruhigsten.', 'This ward is the calmest.'],
        ]},
      ],
      tip: 'Use "als" for than (höher als) and "so … wie" for as … as (so hoch wie).',
    },
    {
      id: 'a2-genitiv', level: 'A2', icon: '🔐', ref: 'a2-16',
      title: 'The Genitive Case',
      sub: 'Possession: "the patient\'s chart"',
      blocks: [
        { type: 'table', h: 'Genitive articles', cols: ['Gender', 'Nom.', 'Genitive'], rows: [
          ['masculine', 'der', 'des (+s/es on noun)'],
          ['feminine', 'die', 'der'],
          ['neuter', 'das', 'des (+s/es on noun)'],
          ['plural', 'die', 'der'],
        ]},
        { type: 'ex', h: 'Examples', items: [
          ['die Kurve des Patienten', "the patient's chart"],
          ['die Dosis des Medikaments', 'the dose of the medication'],
          ['während der Visite', 'during the ward round'],
        ]},
        { type: 'list', h: 'Genitive prepositions', items: ['wegen (because of), trotz (despite), während (during), (an)statt (instead of)'] },
      ],
      tip: 'In everyday speech many Germans replace the genitive with "von + dative": die Kurve von dem Patienten.',
    },
    {
      id: 'a2-fixedprep', level: 'A2', icon: '📌', ref: 'a2-19',
      title: 'Fixed Verb + Preposition Combinations',
      sub: 'warten auf, leiden an, sich kümmern um',
      blocks: [
        { type: 'note', text: 'Many verbs demand a specific preposition (and case). They must be learned as a unit.' },
        { type: 'table', h: 'Key clinical combinations', cols: ['Combination', 'Case', 'Meaning'], rows: [
          ['leiden an', 'dative', 'to suffer from'],
          ['warten auf', 'accusative', 'to wait for'],
          ['sich kümmern um', 'accusative', 'to take care of'],
          ['fragen nach', 'dative', 'to ask about'],
          ['sich erinnern an', 'accusative', 'to remember'],
        ]},
        { type: 'ex', h: 'Examples', items: [
          ['Der Patient leidet an Diabetes.', 'The patient suffers from diabetes.'],
          ['Wir kümmern uns um Sie.', 'We take care of you.'],
        ]},
      ],
      tip: 'Learn the preposition WITH the verb, like one word: "warten-auf".',
    },
    {
      id: 'a2-futur', level: 'A2', icon: '🔮', ref: 'a2-21',
      title: 'Future Tense (Futur I)',
      sub: 'werden + infinitive',
      blocks: [
        { type: 'table', h: 'werden', cols: ['Pronoun', 'Form'], rows: [
          ['ich', 'werde'], ['du', 'wirst'], ['er/sie/es', 'wird'], ['wir/sie/Sie', 'werden'],
        ]},
        { type: 'ex', h: 'Future & assumptions', items: [
          ['Der Arzt wird gleich kommen.', 'The doctor will come shortly.'],
          ['Sie werden sich bald besser fühlen.', 'You will feel better soon.'],
          ['Das wird wohl eine Erkältung sein.', "It's probably a cold. (assumption)"],
        ]},
      ],
      tip: 'German often uses the present tense + a time word for the future: "Morgen kommt der Arzt".',
    },
    {
      id: 'a2-konj2', level: 'A2', icon: '🙏', ref: 'a2-22',
      title: 'Konjunktiv II: Politeness',
      sub: 'würde, könnte, hätte, wäre for polite requests',
      blocks: [
        { type: 'table', h: 'Core polite forms', cols: ['Verb', 'Konjunktiv II', 'Use'], rows: [
          ['werden', 'würde', 'would'],
          ['können', 'könnte', 'could'],
          ['haben', 'hätte', 'would have'],
          ['sein', 'wäre', 'would be'],
        ]},
        { type: 'ex', h: 'Polite ward language', items: [
          ['Könnten Sie bitte den Arm heben?', 'Could you please lift your arm?'],
          ['Ich würde Ihnen empfehlen, viel zu trinken.', 'I would recommend that you drink a lot.'],
          ['Es wäre gut, wenn Sie sich ausruhen.', 'It would be good if you rested.'],
        ]},
      ],
      tip: 'Könnten / würden Sie …? is the most courteous way to ask a patient to do something.',
    },
    {
      id: 'a2-passiv', level: 'A2', icon: '⚙️', ref: 'a2-25',
      title: 'Passive Voice (Introduction)',
      sub: 'werden + Partizip II — the language of documentation',
      blocks: [
        { type: 'note', text: 'Passive focuses on the ACTION, not who does it — perfect for medical records.' },
        { type: 'ex', h: 'Present passive', items: [
          ['Das Medikament wird gegeben.', 'The medication is given.'],
          ['Der Verband wird gewechselt.', 'The dressing is changed.'],
          ['Der Patient wird untersucht.', 'The patient is examined.'],
        ]},
        { type: 'list', h: 'Add the agent with "von"', items: ['Das Rezept wird vom Arzt geschrieben. (by the doctor)'] },
      ],
      tip: 'Formation: werden (conjugated) + past participle at the end.',
    },
    {
      id: 'a2-relative', level: 'A2', icon: '🧷', ref: 'a2-26',
      title: 'Relative Clauses',
      sub: 'der/die/das as "who / which / that"',
      blocks: [
        { type: 'note', text: 'A relative clause adds information about a noun. The relative pronoun matches the noun\'s gender/number; its CASE comes from its role in the sub-clause. The verb goes to the end.' },
        { type: 'ex', h: 'Examples', items: [
          ['Der Patient, der im Zimmer 3 liegt, hat Fieber.', 'The patient who is in room 3 has a fever.'],
          ['Die Tablette, die Sie nehmen, ist gegen Schmerzen.', 'The tablet that you take is for pain.'],
          ['Das Kind, dem ich helfe, ist krank.', 'The child (whom) I am helping is ill. (dative)'],
        ]},
      ],
      tip: 'The relative pronoun looks like the article: der, die, das, den, dem, deren…',
    },
  ],

  B1: [
    {
      id: 'b1-infinitiv', level: 'B1', icon: '🎯', ref: 'b1-12',
      title: 'Infinitive Clauses: um…zu, ohne…zu, statt…zu',
      sub: 'Expressing purpose and manner',
      blocks: [
        { type: 'ex', h: 'Three key patterns', items: [
          ['Ich komme, um den Blutdruck zu messen.', 'I come in order to measure the blood pressure.'],
          ['Er verließ das Bett, ohne zu klingeln.', 'He left the bed without ringing.'],
          ['Statt zu warten, rief sie den Arzt.', 'Instead of waiting, she called the doctor.'],
        ]},
        { type: 'list', h: 'Rules', items: [
          '"zu" + infinitive goes to the end.',
          'Use "um…zu" only when both clauses share the same subject; otherwise use "damit".',
        ]},
      ],
      tip: 'um…zu = in order to. If the subjects differ, switch to "damit": "Ich erkläre es, damit Sie es verstehen".',
    },
    {
      id: 'b1-lassen', level: 'B1', icon: '🤲', ref: 'b1-4',
      title: "The Verb 'lassen'",
      sub: 'to let, to have something done, to leave',
      blocks: [
        { type: 'ex', h: 'Three uses', items: [
          ['Lassen Sie mich Ihnen helfen.', 'Let me help you. (permit)'],
          ['Der Arzt lässt Blut abnehmen.', 'The doctor has blood drawn. (causative)'],
          ['Lassen Sie die Tür bitte offen.', 'Please leave the door open. (leave)'],
        ]},
      ],
      tip: 'lassen works like a modal — the second verb is an infinitive at the end, with no "zu".',
    },
    {
      id: 'b1-temporal', level: 'B1', icon: '⏳', ref: 'b1-9',
      title: 'Temporal Clauses: als, wenn, während, bevor, nachdem',
      sub: 'Ordering events in time',
      blocks: [
        { type: 'table', h: 'Which connector?', cols: ['Connector', 'Meaning'], rows: [
          ['als', 'when (single past event)'],
          ['wenn', 'when / whenever (present or repeated)'],
          ['während', 'while'],
          ['bevor', 'before'],
          ['nachdem', 'after (+ one tense earlier)'],
        ]},
        { type: 'ex', h: 'Examples', items: [
          ['Als der Patient kam, hatte er hohes Fieber.', 'When the patient came, he had a high fever.'],
          ['Nachdem ich Blut abgenommen hatte, ging ich zum nächsten Zimmer.', 'After I had drawn blood, I went to the next room.'],
        ]},
      ],
      mistake: 'For a one-time past event use "als", not "wenn": "Als ich Nachtdienst hatte …".',
    },
    {
      id: 'b1-konj2', level: 'B1', icon: '💭', ref: 'b1-10',
      title: 'Konjunktiv II — Core & Past',
      sub: 'Hypotheticals, advice and past unreal situations',
      blocks: [
        { type: 'ex', h: 'Present hypothetical', items: [
          ['Wenn ich mehr Zeit hätte, würde ich es erklären.', 'If I had more time, I would explain it.'],
          ['An Ihrer Stelle würde ich den Arzt fragen.', 'In your place I would ask the doctor.'],
        ]},
        { type: 'ex', h: 'Past hypothetical (hätte/wäre + Partizip II)', items: [
          ['Wenn der Patient früher gekommen wäre, hätte man mehr tun können.', 'If the patient had come earlier, more could have been done.'],
        ]},
      ],
      tip: 'Past unreal = hätte/wäre + participle. Add a modal at the very end: "… hätte helfen können".',
    },
    {
      id: 'b1-ndecl', level: 'B1', icon: '🧑‍⚕️', ref: 'b1-15',
      title: 'Weak Masculine Nouns (N-Deklination)',
      sub: 'der Patient → den Patienten',
      blocks: [
        { type: 'note', text: 'A group of masculine nouns add -(e)n in every case except the nominative singular. "der Patient" is the one you meet most.' },
        { type: 'table', h: 'der Patient', cols: ['Case', 'Form'], rows: [
          ['Nominativ', 'der Patient'],
          ['Akkusativ', 'den Patienten'],
          ['Dativ', 'dem Patienten'],
          ['Genitiv', 'des Patienten'],
        ]},
        { type: 'list', h: 'Other N-nouns', items: ['der Kollege, der Junge, der Mensch, der Name, der Herr'] },
      ],
      mistake: 'Write "Ich sehe den Patienten", not "den Patient" — the -en is required.',
    },
    {
      id: 'b1-plusquam', level: 'B1', icon: '⏪', ref: 'b1-18',
      title: 'Past Perfect (Plusquamperfekt)',
      sub: 'hatte / war + Partizip II — the "past before the past"',
      blocks: [
        { type: 'ex', h: 'One event before another past event', items: [
          ['Der Patient hatte schon gegessen, bevor die Visite begann.', 'The patient had already eaten before the round began.'],
          ['Sie war gestürzt, bevor wir kamen.', 'She had fallen before we came.'],
        ]},
      ],
      tip: 'Pairs naturally with "nachdem": the nachdem-clause takes Plusquamperfekt, the main clause Präteritum/Perfekt.',
    },
    {
      id: 'b1-correlative', level: 'B1', icon: '🔀', ref: 'b1-20',
      title: 'Correlative Connectors',
      sub: 'sowohl…als auch, entweder…oder, weder…noch',
      blocks: [
        { type: 'table', h: 'Paired connectors', cols: ['Pair', 'Meaning'], rows: [
          ['sowohl … als auch', 'both … and'],
          ['entweder … oder', 'either … or'],
          ['weder … noch', 'neither … nor'],
          ['nicht nur … sondern auch', 'not only … but also'],
          ['zwar … aber', 'admittedly … but'],
        ]},
        { type: 'ex', h: 'Examples', items: [
          ['Der Patient hat weder Fieber noch Schmerzen.', 'The patient has neither fever nor pain.'],
          ['Sie bekommen sowohl Tabletten als auch eine Infusion.', 'You get both tablets and an infusion.'],
        ]},
      ],
    },
    {
      id: 'b1-passiv', level: 'B1', icon: '⚙️', ref: 'b1-23',
      title: 'Passive Voice: Process, State & "man"',
      sub: 'Vorgangspassiv, Zustandspassiv and the man-construction',
      blocks: [
        { type: 'list', h: 'Two passives', items: [
          'Vorgangspassiv (process): werden + Partizip II → "Die Wunde wird versorgt." (is being treated)',
          'Zustandspassiv (state/result): sein + Partizip II → "Die Wunde ist versorgt." (is treated/done)',
        ]},
        { type: 'ex', h: 'Passive with modals + the "man" alternative', items: [
          ['Das Medikament muss gekühlt werden.', 'The medication must be refrigerated.'],
          ['Man muss den Verband täglich wechseln.', 'One must change the dressing daily. (active alternative)'],
        ]},
      ],
      tip: '"man" (one/you/they) is an easy way to avoid the passive while keeping the impersonal tone.',
    },
    {
      id: 'b1-nominal', level: 'B1', icon: '🔤', ref: 'b1-25',
      title: 'Nominalized Adjectives',
      sub: 'der Kranke, der Angehörige — adjectives used as nouns',
      blocks: [
        { type: 'note', text: 'Adjectives can become nouns (capitalised) but keep adjective endings. Very common in clinical German.' },
        { type: 'table', h: 'Examples', cols: ['Adjective', 'As a noun', 'Meaning'], rows: [
          ['krank', 'der/die Kranke', 'the sick person'],
          ['angehörig', 'die Angehörigen', 'the relatives'],
          ['pflegebedürftig', 'der/die Pflegebedürftige', 'the person needing care'],
          ['erwachsen', 'der/die Erwachsene', 'the adult'],
        ]},
      ],
      mistake: 'The endings still change with case: "Ich spreche mit den Angehörigen" (dative plural).',
    },
    {
      id: 'b1-jedesto', level: 'B1', icon: '📈', ref: 'b1-27',
      title: 'Proportional Clauses: je … desto',
      sub: '"the more … the more"',
      blocks: [
        { type: 'ex', h: 'Structure: je + comparative (verb last), desto + comparative (verb 2nd)', items: [
          ['Je mehr Sie trinken, desto besser fühlen Sie sich.', 'The more you drink, the better you feel.'],
          ['Je früher wir behandeln, desto schneller heilt die Wunde.', 'The earlier we treat, the faster the wound heals.'],
        ]},
      ],
      tip: 'The "je"-part is a subordinate clause (verb at the end); the "desto"-part is a main clause (verb second).',
    },
  ],

  B2: [
    {
      id: 'b2-tekamolo', level: 'B2', icon: '🧭', ref: 'b2-1',
      title: 'Word Order Mastery: TeKaMoLo',
      sub: 'Temporal · Kausal · Modal · Lokal — the order of adverbials',
      blocks: [
        { type: 'note', text: 'When several adverbial phrases meet in the middle field, the default order is Time → Reason → Manner → Place.' },
        { type: 'ex', h: 'All four together', items: [
          ['Ich gehe heute wegen der Visite schnell auf die Station.', 'Today, because of the round, I go quickly to the ward.'],
          ['Der Patient wurde gestern notfallmäßig mit dem Krankenwagen ins Klinikum gebracht.', 'Yesterday the patient was brought to the hospital urgently by ambulance.'],
        ]},
      ],
      tip: 'TE-KA-MO-LO: wann? → warum? → wie? → wo/wohin?',
    },
    {
      id: 'b2-prefix', level: 'B2', icon: '🧩', ref: 'b2-2',
      title: 'Word Formation & Prefixes',
      sub: 'un-, miss-, be-, er-, ver-, zer- change meaning',
      blocks: [
        { type: 'table', h: 'Common prefixes', cols: ['Prefix', 'Effect', 'Example'], rows: [
          ['un-', 'negation', 'unruhig (restless)'],
          ['miss-', 'wrong/failure', 'missverstehen (misunderstand)'],
          ['ver-', 'change / mistake', 'verwechseln (mix up), verabreichen (administer)'],
          ['be-', 'makes verb transitive', 'behandeln (treat)'],
          ['er-', 'completion / achieving', 'erkennen (recognise)'],
          ['zer-', 'apart / destruction', 'zerbrechen (shatter)'],
        ]},
      ],
      tip: 'Recognising prefixes lets you decode long clinical words you have never seen before.',
    },
    {
      id: 'b2-relative', level: 'B2', icon: '🧷', ref: 'b2-5',
      title: 'Advanced Relative Clauses',
      sub: 'wo-compounds, was-clauses, relative adverbs',
      blocks: [
        { type: 'ex', h: 'Beyond der/die/das', items: [
          ['Das ist alles, was ich weiß.', 'That is all (that) I know. (after alles/etwas/nichts → was)'],
          ['Die Station, wo ich arbeite, ist neu.', 'The ward where I work is new.'],
          ['Der Patient, mit dem ich gesprochen habe, ist entlassen.', 'The patient I spoke with has been discharged.'],
        ]},
      ],
      tip: 'After indefinite antecedents (alles, etwas, nichts, das) the relative pronoun is "was", not "das".',
    },
    {
      id: 'b2-fvg', level: 'B2', icon: '🏛️', ref: 'b2-6',
      title: 'Noun-Verb Combinations (Funktionsverbgefüge)',
      sub: 'Fixed formal phrases in clinical & official German',
      blocks: [
        { type: 'table', h: 'Common combinations', cols: ['Phrase', 'Plain verb', 'Meaning'], rows: [
          ['eine Entscheidung treffen', 'entscheiden', 'to make a decision'],
          ['in Betracht ziehen', 'erwägen', 'to consider'],
          ['zur Verfügung stehen', '—', 'to be available'],
          ['Rücksprache halten', '—', 'to consult / confer'],
          ['in Frage kommen', '—', 'to be an option'],
        ]},
        { type: 'ex', h: 'In use', items: [
          ['Wir müssen eine Entscheidung über die Therapie treffen.', 'We must make a decision about the therapy.'],
          ['Bitte halten Sie Rücksprache mit dem Oberarzt.', 'Please confer with the senior physician.'],
        ]},
      ],
      tip: 'These fixed phrases sound professional in reports and handovers — learn them as chunks.',
    },
    {
      id: 'b2-alsob', level: 'B2', icon: '🎭', ref: 'b2-8',
      title: 'Unreal Comparisons: als ob',
      sub: 'als ob / als wenn / als + Konjunktiv II',
      blocks: [
        { type: 'ex', h: '"as if" constructions', items: [
          ['Der Patient sieht aus, als ob er Schmerzen hätte.', 'The patient looks as if he were in pain.'],
          ['Sie tut, als wäre nichts passiert.', 'She acts as if nothing had happened.'],
          ['Es klingt, als hätte er Fieber.', 'It sounds as if he had a fever.'],
        ]},
      ],
      tip: 'After "als" alone (no "ob"), the verb comes right after: "als hätte er …". With "als ob", the verb goes to the end.',
    },
    {
      id: 'b2-partizip', level: 'B2', icon: '📎', ref: 'b2-9',
      title: 'Extended Participial Attributes',
      sub: 'Compressing a relative clause into a phrase before the noun',
      blocks: [
        { type: 'note', text: 'Formal/written German packs information before the noun using a participle with modifiers — a hallmark of medical texts.' },
        { type: 'ex', h: 'Relative clause → participial attribute', items: [
          ['der Patient, der frisch operiert wurde → der frisch operierte Patient', 'the freshly operated(-on) patient'],
          ['die Medikamente, die vom Arzt verordnet wurden → die vom Arzt verordneten Medikamente', 'the medications prescribed by the doctor'],
        ]},
      ],
      tip: 'Read these from the noun backwards to unpack the meaning quickly.',
    },
    {
      id: 'b2-consequence', level: 'B2', icon: '➡️', ref: 'b2-10',
      title: 'Manner & Consequence: sodass, indem',
      sub: 'Expressing result and means',
      blocks: [
        { type: 'ex', h: 'Result vs. means', items: [
          ['Der Patient wurde stabilisiert, sodass er verlegt werden konnte.', 'The patient was stabilised so that he could be transferred. (result)'],
          ['Man senkt das Fieber, indem man Wadenwickel macht.', 'You lower the fever by applying calf compresses. (means)'],
        ]},
        { type: 'list', h: 'Quick guide', items: [
          'sodass / so … dass → consequence (so that, with the result that)',
          'indem → the method/means (by doing …)',
          'dadurch, dass → by the fact that',
        ]},
      ],
    },
    {
      id: 'b2-partikeln', level: 'B2', icon: '💬', ref: 'b2-11',
      title: 'Modal Particles (Modalpartikeln)',
      sub: 'doch, mal, eben, ja, wohl — the "flavour words"',
      blocks: [
        { type: 'note', text: 'These little words carry no dictionary meaning but colour the tone — reassuring, softening, or emphasising. Native-sounding German needs them.' },
        { type: 'table', h: 'Bedside particles', cols: ['Particle', 'Feeling it adds', 'Example'], rows: [
          ['mal', 'softens a request', 'Zeigen Sie mir mal Ihren Arm.'],
          ['doch', 'reassures / gentle urging', 'Setzen Sie sich doch.'],
          ['ja', 'shared knowledge / warning', 'Das tut ja nicht weh.'],
          ['wohl', 'probability', 'Sie sind wohl müde.'],
          ['eben / halt', 'resignation', 'Das ist eben so.'],
        ]},
      ],
      tip: '"Setzen Sie sich doch mal" feels far warmer to a patient than a bare "Setzen Sie sich".',
    },
  ],
}

// Curriculum topics that are vocabulary/skills rather than grammar points — shown
// as a short "see the Curriculum" pointer so learners know where the rest lives.
export const GRAMMAR_LEVELS = ['A1', 'A2', 'B1', 'B2']

export const grammarForLevel = (lvl) => GRAMMAR[lvl] || []
export const allGrammar = () => GRAMMAR_LEVELS.flatMap(l => GRAMMAR[l])

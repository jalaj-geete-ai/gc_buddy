import { useState, useEffect, useRef } from 'react'
import { C } from '../lib/constants'
import { PBar, Btn, Spin } from '../components/UI'
import { sb, trackEvent } from '../lib/supabase'

// ── TEST DATA (from PDF) ────────────────────────────────────────────────────
const TESTS = [
  {
    id: 'A1_T1',
    name: 'Test 1: Phonetics & Basics Quick Quiz',
    classes: 'Class 1',
    level: 'A1',
    totalMarks: 20,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Multiple Choice — Pronunciation Rules',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T1A1', text: "German letter 'W' is pronounced like:", opts: ["English 'W' (water)", "English 'V' (very)", "English 'B'", "English 'F'"], ans: 1, marks: 1 },
          { id: 'T1A2', text: "German letter 'J' is pronounced like:", opts: ["English 'J' (jungle)", "English 'Y' (yes)", "English 'G' (good)", "English 'Ch'"], ans: 1, marks: 1 },
          { id: 'T1A3', text: "German letter 'Z' is pronounced like:", opts: ["English 'Z' (zoo)", "English 'S' (sun)", "English 'Ts' (cats)", "English 'Dz'"], ans: 2, marks: 1 },
          { id: 'T1A4', text: "The diphthong 'ei' sounds like:", opts: ["English 'ee' (see)", "English 'eye/I' (mine)", "English 'oy' (boy)", "English 'ay' (say)"], ans: 1, marks: 1 },
          { id: 'T1A5', text: "The diphthong 'ie' sounds like:", opts: ["English 'I' (mine)", "Long English 'ee' (see)", "English 'oy' (boy)", "English 'uh'"], ans: 1, marks: 1 },
          { id: 'T1A6', text: "German 'sch' sounds like:", opts: ["English 'sk' (sky)", "English 'sh' (shoe)", "English 'sc' (scare)", "English 'ch' (church)"], ans: 1, marks: 1 },
          { id: 'T1A7', text: "Umlaut 'ü' is pronounced:", opts: ["Like English 'u' (cup)", "Lips round (U) but say 'I'", "Like English 'oo' (moon)", "Like English 'y'"], ans: 1, marks: 1 },
          { id: 'T1A8', text: "The letter 'V' in German sounds like:", opts: ["English 'V' (very)", "English 'F' (father)", "English 'B' (before)", "English 'W' (water)"], ans: 1, marks: 1 },
          { id: 'T1A9', text: "'st' at the START of a German word sounds like:", opts: ["'st' (standard)", "'sht' (shhtar)", "'ts' (cats)", "'s' (see)"], ans: 1, marks: 1 },
          { id: 'T1A10', text: "The Eszett 'ß' is the same as:", opts: ["'s'", "'sz'", "'ss'", "'z'"], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Section B: Write the German Letter Names',
        marks: 10,
        type: 'fill',
        instructions: 'Write the correct German name for each letter.',
        questions: [
          { id: 'T1B1', text: "German name for letter 'A':", ans: 'ah', marks: 1 },
          { id: 'T1B2', text: "German name for letter 'W':", ans: 'vay', marks: 1 },
          { id: 'T1B3', text: "German name for letter 'J':", ans: 'yot', marks: 1 },
          { id: 'T1B4', text: "German name for letter 'Z':", ans: 'tset', marks: 1 },
          { id: 'T1B5', text: "German name for letter 'Ä':", ans: 'ay-umlaut', altAns: ['ä','ae','äh'], marks: 1 },
          { id: 'T1B6', text: "German name for letter 'B':", ans: 'bay', marks: 1 },
          { id: 'T1B7', text: "German name for letter 'V':", ans: 'fow', altAns: ['fau','fav'], marks: 1 },
          { id: 'T1B8', text: "German name for letter 'R':", ans: 'err', altAns: ['er'], marks: 1 },
          { id: 'T1B9', text: "German name for letter 'Ö':", ans: 'oh-umlaut', altAns: ['ö','oe','öh'], marks: 1 },
          { id: 'T1B10', text: "German name for letter 'Ü':", ans: 'oo-umlaut', altAns: ['ü','ue','üh'], marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T2',
    name: 'Test 2: Greetings, Introduction & Verb Sein',
    classes: 'Classes 2–3',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Greetings',
        marks: 10,
        type: 'fill',
        instructions: 'Write the correct German greeting for each situation.',
        questions: [
          { id: 'T2P1Q1', text: "It is 8:00 AM. Greet your patient formally:", ans: 'guten morgen', altAns: ['guten morgen!'], marks: 2 },
          { id: 'T2P1Q2', text: "Say goodbye formally to the head doctor:", ans: 'auf wiedersehen', altAns: ['auf wiedersehen!'], marks: 2 },
          { id: 'T2P1Q3', text: "Welcome a new patient warmly:", ans: 'herzlich willkommen', altAns: ['guten tag','herzlich willkommen!','guten tag!'], marks: 2 },
          { id: 'T2P1Q4', text: "Greet your Indian friend casually:", ans: 'hallo', altAns: ['hallo!','hi','hi!'], marks: 2 },
          { id: 'T2P1Q5', text: "Ask your senior colleague (formal) how they are:", ans: 'wie geht es ihnen', altAns: ['wie geht es ihnen?','wie geht es ihnen?'], marks: 2 },
        ]
      },
      {
        title: 'Part 2: Self-Introduction',
        marks: 10,
        type: 'fill_blank',
        instructions: 'Fill in the blanks with the correct German word.',
        questions: [
          { id: 'T2P2Q1', text: "Guten _________ ! (morning at 9AM)", ans: 'morgen', marks: 2 },
          { id: 'T2P2Q2', text: "Ich _________ Priya Sharma. (my name is)", ans: 'heiße', altAns: ['heisse','heiße'], marks: 2 },
          { id: 'T2P2Q3', text: "Ich _________ aus Indien. (come from)", ans: 'komme', marks: 2 },
          { id: 'T2P2Q4', text: "Ich _________ Krankenschwester. (I am)", ans: 'bin', marks: 2 },
          { id: 'T2P2Q5', text: "Auf _________! (formal goodbye)", ans: 'wiedersehen', marks: 2 },
        ]
      },
      {
        title: 'Part 3: Verb "sein" — Fill in',
        marks: 10,
        type: 'fill_blank',
        instructions: 'Fill in the correct form of the verb "sein".',
        questions: [
          { id: 'T2P3Q1', text: "Ich _______ Krankenschwester.", ans: 'bin', marks: 1 },
          { id: 'T2P3Q2', text: "Du _______ krank.", ans: 'bist', marks: 1 },
          { id: 'T2P3Q3', text: "Er _______ Arzt. Sie _______ Ärztin. (write both, separated by /)", ans: 'ist/ist', altAns: ['ist / ist','ist, ist'], marks: 1 },
          { id: 'T2P3Q4', text: "Wir _______ Kollegen.", ans: 'sind', marks: 1 },
          { id: 'T2P3Q5', text: "Ihr _______ müde.", ans: 'seid', marks: 1 },
          { id: 'T2P3Q6', text: "Sie (they) _______ Patienten.", ans: 'sind', marks: 1 },
          { id: 'T2P3Q7', text: "Sie (formal) _______ sehr nett.", ans: 'sind', marks: 1 },
          { id: 'T2P3Q8', text: "Ich _______ nicht müde. (negation — write full phrase)", ans: 'bin nicht', altAns: ['bin...nicht','bin'], marks: 1 },
          { id: 'T2P3Q9', text: "_______ Sie Arzt? (question, formal — write the verb)", ans: 'sind', marks: 1 },
          { id: 'T2P3Q10', text: "_______ du krank? (question, informal — write the verb)", ans: 'bist', marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T3',
    name: 'Test 3: End-of-Block Test (Classes 1–5)',
    classes: 'Classes 1–5',
    level: 'A1',
    totalMarks: 50,
    timeMinutes: 40,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Phonetics',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T3A1', text: "German 'V' sounds like:", opts: ["English 'V' (very)", "English 'F' (father)", "English 'W' (water)", "English 'B'"], ans: 1, marks: 1 },
          { id: 'T3A2', text: "German diphthong 'au' sounds like:", opts: ["oo", "ay", "ow (cow)", "oy"], ans: 2, marks: 1 },
          { id: 'T3A3', text: "'sch' in German sounds like:", opts: ["sk", "sh", "ch", "ts"], ans: 1, marks: 1 },
          { id: 'T3A4', text: "ß (Eszett) is the same as:", opts: ["sz", "z", "ss", "s"], ans: 2, marks: 1 },
          { id: 'T3A5', text: "The special letter 'ö' is pronounced:", opts: ["Like 'o' in 'more'", "Lips round like O, say E", "Like 'oh' in English", "Like 'oo' in English"], ans: 1, marks: 1 },
          { id: 'T3A6', text: "German name for letter 'W':", ans: 'vay', altAns: ['vay','fow'], type: 'fill', marks: 1 },
          { id: 'T3A7', text: "German name for letter 'J':", ans: 'yot', type: 'fill', marks: 1 },
          { id: 'T3A8', text: "Which letters are called Umlauts? (write all 3)", ans: 'ä, ö, ü', altAns: ['ä ö ü','ä,ö,ü','a o u umlaut','ä/ö/ü'], type: 'fill', marks: 1 },
        ]
      },
      {
        title: 'Section B: Greetings & Introduction',
        marks: 10,
        type: 'fill',
        instructions: 'Write the correct German phrase.',
        questions: [
          { id: 'T3B1', text: "Say 'Good morning!' formally:", ans: 'guten morgen', altAns: ['guten morgen!'], marks: 1 },
          { id: 'T3B2', text: "Say 'My name is [your name].':", ans: 'ich heiße', altAns: ['mein name ist','ich heisse'], marks: 1 },
          { id: 'T3B3', text: "Say 'I come from India.':", ans: 'ich komme aus indien', altAns: ['ich komme aus indien.'], marks: 1 },
          { id: 'T3B4', text: "Say 'I am a nurse.':", ans: 'ich bin krankenschwester', altAns: ['ich bin krankenpfleger','ich bin eine krankenschwester'], marks: 1 },
          { id: 'T3B5', text: "Say 'Goodbye!' formally:", ans: 'auf wiedersehen', altAns: ['auf wiedersehen!'], marks: 1 },
          { id: 'T3B6', text: "Ask formally: 'How are you?':", ans: 'wie geht es ihnen', altAns: ['wie geht es ihnen?'], marks: 1 },
          { id: 'T3B7', text: "Answer: 'Very well, thank you.':", ans: 'sehr gut danke', altAns: ['sehr gut, danke','sehr gut, danke!'], marks: 1 },
          { id: 'T3B8', text: "Say 'Nice to meet you!':", ans: 'schön sie kennenzulernen', altAns: ['schön, sie kennenzulernen!','es freut mich'], marks: 1 },
          { id: 'T3B9', text: "Ask formally: 'What is your name?':", ans: 'wie heißen sie', altAns: ['wie heißen sie?','wie heissen sie?'], marks: 1 },
          { id: 'T3B10', text: "Ask formally: 'Where are you from?':", ans: 'woher kommen sie', altAns: ['woher kommen sie?'], marks: 1 },
        ]
      },
      {
        title: 'Section C: Verb Sein',
        marks: 10,
        type: 'fill_blank',
        instructions: 'Fill in the correct form of sein.',
        questions: [
          { id: 'T3C1', text: "Ich _______ Ärztin.", ans: 'bin', marks: 1 },
          { id: 'T3C2', text: "Du _______ nett.", ans: 'bist', marks: 1 },
          { id: 'T3C3', text: "Er _______ müde.", ans: 'ist', marks: 1 },
          { id: 'T3C4', text: "Wir _______ fertig.", ans: 'sind', marks: 1 },
          { id: 'T3C5', text: "Ihr _______ krank?", ans: 'seid', marks: 1 },
          { id: 'T3C6', text: "Sie (they) _______ Patienten.", ans: 'sind', marks: 1 },
          { id: 'T3C7', text: "Sie (formal) _______ der neue Arzt.", ans: 'sind', marks: 1 },
          { id: 'T3C8', text: "Das _______ nicht richtig.", ans: 'ist', marks: 1 },
          { id: 'T3C9', text: "_______ Sie Krankenschwester? (question)", ans: 'sind', marks: 1 },
          { id: 'T3C10', text: "Wir _______ nicht fertig.", ans: 'sind', marks: 1 },
        ]
      },
      {
        title: 'Section D: Numbers',
        marks: 12,
        type: 'mixed',
        instructions: 'Write numbers in German words or write the digits.',
        questions: [
          { id: 'T3D1', text: "Write in German: 7", ans: 'sieben', type: 'fill', marks: 1 },
          { id: 'T3D2', text: "Write in German: 12", ans: 'zwölf', altAns: ['zwoelf','zwölf'], type: 'fill', marks: 1 },
          { id: 'T3D3', text: "Write in German: 15", ans: 'fünfzehn', altAns: ['fuenfzehn'], type: 'fill', marks: 1 },
          { id: 'T3D4', text: "Write in German: 21", ans: 'einundzwanzig', type: 'fill', marks: 1 },
          { id: 'T3D5', text: "Write in German: 38", ans: 'achtunddreißig', altAns: ['achtunddreissig'], type: 'fill', marks: 1 },
          { id: 'T3D6', text: "Write in German: 50", ans: 'fünfzig', altAns: ['fuenfzig'], type: 'fill', marks: 1 },
          { id: 'T3D7', text: "Write in German: 67", ans: 'siebenundsechzig', type: 'fill', marks: 1 },
          { id: 'T3D8', text: "Write in German: 100", ans: 'hundert', altAns: ['einhundert'], type: 'fill', marks: 1 },
          { id: 'T3D9', text: "Write in digits: dreiundzwanzig =", ans: '23', type: 'fill', marks: 1 },
          { id: 'T3D10', text: "Write in digits: siebenundneunzig =", ans: '97', type: 'fill', marks: 1 },
          { id: 'T3D11', text: "Write in digits: fünfundvierzig =", ans: '45', type: 'fill', marks: 1 },
          { id: 'T3D12', text: "Hospital sentence: Der Patient ist _____ Jahre alt. (Patient is 45 years old)", ans: 'fünfundvierzig', altAns: ['fuenfundvierzig','45'], type: 'fill', marks: 1 },
        ]
      },
      {
        title: 'Section E: Nouns & Genders',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T3E1', text: "Article for 'Arzt' (doctor)?", opts: ["der","die","das"], ans: 0, marks: 1 },
          { id: 'T3E2', text: "Article for 'Tablette' (tablet)?", opts: ["der","die","das"], ans: 1, marks: 1 },
          { id: 'T3E3', text: "Article for 'Krankenhaus' (hospital)?", opts: ["der","die","das"], ans: 2, marks: 1 },
          { id: 'T3E4', text: "Article for 'Patient' (patient)?", opts: ["der","die","das"], ans: 0, marks: 1 },
          { id: 'T3E5', text: "Article for 'Fieber' (fever)?", opts: ["der","die","das"], ans: 2, marks: 1 },
          { id: 'T3E6', text: "Article for 'Bett' (bed)?", opts: ["der","die","das"], ans: 2, marks: 1 },
          { id: 'T3E7', text: "Article for 'Nase' (nose)?", opts: ["der","die","das"], ans: 1, marks: 1 },
          { id: 'T3E8', text: "Article for 'Kind' (child)?", opts: ["der","die","das"], ans: 2, marks: 1 },
          { id: 'T3E9', text: "'Das ist _______ Krankenhaus.' — Fill in ein or eine:", opts: ["ein","eine"], ans: 0, marks: 1 },
          { id: 'T3E10', text: "'Ich bin _______ Krankenschwester.' — Fill in ein or eine:", opts: ["ein","eine"], ans: 1, marks: 1 },
        ]
      }
    ]
  },

  // ── TESTS 4–6: CLASSES 6–10 ──────────────────────────────────────────────
  {
    id: 'A1_T4',
    name: 'Test 4: Present Tense Verbs & Haben',
    classes: 'Class 6',
    level: 'A1',
    totalMarks: 25,
    timeMinutes: 20,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Conjugate the Verb',
        marks: 10,
        type: 'fill_blank',
        instructions: 'Fill in the correct present tense form of the verb in brackets.',
        questions: [
          { id: 'T4A1', text: 'Ich _____ in Berlin. (wohnen)', ans: 'wohne', marks: 1 },
          { id: 'T4A2', text: 'Du _____ aus Indien. (kommen)', ans: 'kommst', marks: 1 },
          { id: 'T4A3', text: 'Er _____ Deutsch. (lernen)', ans: 'lernt', marks: 1 },
          { id: 'T4A4', text: 'Wir _____ Krankenschwestern. (sein)', ans: 'sind', marks: 1 },
          { id: 'T4A5', text: 'Ihr _____ viel. (arbeiten — watch the stem!)', ans: 'arbeitet', marks: 1 },
          { id: 'T4A6', text: 'Sie (they) _____ Patienten. (sein)', ans: 'sind', marks: 1 },
          { id: 'T4A7', text: 'Ich _____ einen Bruder. (haben)', ans: 'habe', marks: 1 },
          { id: 'T4A8', text: 'Du _____ Hunger? (haben)', ans: 'hast', marks: 1 },
          { id: 'T4A9', text: 'Er _____ kein Fieber. (haben)', ans: 'hat', marks: 1 },
          { id: 'T4A10', text: 'Wir _____ Zeit. (haben)', ans: 'haben', marks: 1 },
        ]
      },
      {
        title: 'Section B: Choose the Correct Verb Form',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T4B1', text: 'Priya _____ in München.', opts: ['wohnt','wohne','wohnst','wohnen'], ans: 0, marks: 1 },
          { id: 'T4B2', text: 'Du _____ viel Arbeit.', opts: ['habe','hast','hat','haben'], ans: 1, marks: 1 },
          { id: 'T4B3', text: 'Wir _____ aus Indien.', opts: ['kommt','komme','kommen','kommst'], ans: 2, marks: 1 },
          { id: 'T4B4', text: 'Ihr _____ Deutsch.', opts: ['lernt','lernen','lerne','lernst'], ans: 0, marks: 1 },
          { id: 'T4B5', text: 'Er _____ einen Termin.', opts: ['haben','hast','hat','habe'], ans: 2, marks: 1 },
          { id: 'T4B6', text: 'Ich _____ Krankenschwester.', opts: ['bist','ist','bin','sind'], ans: 2, marks: 1 },
          { id: 'T4B7', text: 'Sie (formal) _____ Arzt?', opts: ['sind','seid','bist','ist'], ans: 0, marks: 1 },
          { id: 'T4B8', text: 'Das Kind _____ Fieber.', opts: ['habe','hast','hat','haben'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Section C: Identify Subject, Verb, Object',
        marks: 4,
        type: 'fill',
        instructions: 'Write the requested sentence element.',
        questions: [
          { id: 'T4C1', text: '"Ich lerne Deutsch." → Write the VERB:', ans: 'lerne', marks: 1 },
          { id: 'T4C2', text: '"Die Krankenschwester macht die Arbeit." → Write the SUBJECT:', ans: 'die krankenschwester', altAns: ['krankenschwester'], marks: 1 },
          { id: 'T4C3', text: '"Wir haben einen Patienten." → Write the OBJECT:', ans: 'einen patienten', altAns: ['patienten'], marks: 1 },
          { id: 'T4C4', text: '"Du machst viele Fehler." → Write the OBJECT:', ans: 'viele fehler', altAns: ['fehler'], marks: 1 },
        ]
      },
      {
        title: 'Section D: Translate into German',
        marks: 3,
        type: 'fill',
        instructions: 'Use the correct verb conjugation.',
        questions: [
          { id: 'T4D1', text: 'She lives in Hamburg.', ans: 'sie wohnt in hamburg', marks: 1 },
          { id: 'T4D2', text: 'We are learning German.', ans: 'wir lernen deutsch', marks: 1 },
          { id: 'T4D3', text: 'Do you (formal) have an appointment?', ans: 'haben sie einen termin', marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T5',
    name: 'Test 5: Sentence Structure, W-Questions & Family',
    classes: 'Classes 7–8',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Word Order — Correct or Incorrect?',
        marks: 6,
        type: 'mcq',
        questions: [
          { id: 'T5P1Q1', text: '"Ich arbeite im Krankenhaus." — Is this correct?', opts: ['✓ Correct','✗ Wrong'], ans: 0, marks: 1 },
          { id: 'T5P1Q2', text: '"Arbeite ich im Krankenhaus." — Is this correct as a statement?', opts: ['✓ Correct','✗ Wrong'], ans: 1, marks: 1 },
          { id: 'T5P1Q3', text: '"Wo wohnst du?" — Is this correct?', opts: ['✓ Correct','✗ Wrong'], ans: 0, marks: 1 },
          { id: 'T5P1Q4', text: '"Kommt woher Sie?" — Correct version:', opts: ['Woher kommen Sie?','Woher Sie kommen?','Kommen Sie woher?','Sie kommen woher?'], ans: 0, marks: 1 },
          { id: 'T5P1Q5', text: '"Heute ich lerne Deutsch." — Correct version:', opts: ['Heute lerne ich Deutsch.','Ich heute lerne Deutsch.','Lerne heute ich Deutsch.','Deutsch heute ich lerne.'], ans: 0, marks: 1 },
          { id: 'T5P1Q6', text: '"Was machst du heute?" — Is this correct?', opts: ['✓ Correct','✗ Wrong'], ans: 0, marks: 1 },
        ]
      },
      {
        title: 'Part 2: W-Question Words',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T5P2Q1', text: '_____ heißen Sie? (Ich heiße Dr. Müller.)', opts: ['Wie','Wo','Woher','Wann'], ans: 0, marks: 1 },
          { id: 'T5P2Q2', text: '_____ kommen Sie? (Ich komme aus Kerala.)', opts: ['Wo','Woher','Wie','Wann'], ans: 1, marks: 1 },
          { id: 'T5P2Q3', text: '_____ wohnen Sie? (Ich wohne in Berlin.)', opts: ['Woher','Wie','Wo','Wann'], ans: 2, marks: 1 },
          { id: 'T5P2Q4', text: '_____ arbeiten Sie? (Ich arbeite im Krankenhaus.)', opts: ['Wie','Woher','Wann','Wo'], ans: 3, marks: 1 },
          { id: 'T5P2Q5', text: '_____ ist das? (Das ist meine Kollegin.)', opts: ['Was','Wann','Wer','Wo'], ans: 2, marks: 1 },
          { id: 'T5P2Q6', text: '_____ alt sind Sie? (Ich bin 28 Jahre alt.)', opts: ['Was','Wie','Wo','Wer'], ans: 1, marks: 1 },
          { id: 'T5P2Q7', text: '_____ haben Sie Schmerzen? (Im Bauch.)', opts: ['Wann','Wer','Wie','Wo'], ans: 3, marks: 1 },
          { id: 'T5P2Q8', text: '_____ kommt der Arzt? (Um 10 Uhr.)', opts: ['Wo','Wer','Wann','Wie'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Part 3: Family Vocabulary with Articles',
        marks: 8,
        type: 'fill',
        instructions: 'Write the German word WITH article (der/die/das).',
        questions: [
          { id: 'T5P3Q1', text: 'Father:', ans: 'der vater', marks: 1 },
          { id: 'T5P3Q2', text: 'Mother:', ans: 'die mutter', marks: 1 },
          { id: 'T5P3Q3', text: 'Brother:', ans: 'der bruder', marks: 1 },
          { id: 'T5P3Q4', text: 'Sister:', ans: 'die schwester', marks: 1 },
          { id: 'T5P3Q5', text: 'Son:', ans: 'der sohn', marks: 1 },
          { id: 'T5P3Q6', text: 'Daughter:', ans: 'die tochter', marks: 1 },
          { id: 'T5P3Q7', text: 'Child:', ans: 'das kind', marks: 1 },
          { id: 'T5P3Q8', text: 'Parents:', ans: 'die eltern', marks: 1 },
        ]
      },
      {
        title: 'Part 4: Possessive Articles',
        marks: 4,
        type: 'fill_blank',
        instructions: 'Fill in mein / meine / dein / deine.',
        questions: [
          { id: 'T5P4Q1', text: 'Das ist _____ Vater. (my father — masculine)', ans: 'mein', marks: 1 },
          { id: 'T5P4Q2', text: 'Ich liebe _____ Mutter. (my mother — feminine)', ans: 'meine', marks: 1 },
          { id: 'T5P4Q3', text: 'Wie heißt _____ Schwester? (your sister — informal)', ans: 'deine', marks: 1 },
          { id: 'T5P4Q4', text: '_____ Bruder ist Arzt. (My brother — masculine)', ans: 'mein', marks: 1 },
        ]
      },
      {
        title: 'Part 5: Imperativ — Hospital Commands (Sie-form)',
        marks: 4,
        type: 'fill_blank',
        instructions: 'Write the correct Imperativ (Sie-form) of the verb.',
        questions: [
          { id: 'T5P5Q1', text: '_____ Sie die Tablette bitte! (nehmen)', ans: 'nehmen', marks: 1 },
          { id: 'T5P5Q2', text: '_____ Sie viel Wasser! (trinken)', ans: 'trinken', marks: 1 },
          { id: 'T5P5Q3', text: '_____ Sie bitte morgen wieder! (kommen)', ans: 'kommen', marks: 1 },
          { id: 'T5P5Q4', text: '_____ Sie bitte hier! (warten)', ans: 'warten', marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T6',
    name: 'Test 6: End-of-Block Test (Classes 6–10)',
    classes: 'Classes 6–10',
    level: 'A1',
    totalMarks: 50,
    timeMinutes: 45,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Verb Conjugation',
        marks: 10,
        type: 'fill_blank',
        instructions: 'Fill in the correct present tense form.',
        questions: [
          { id: 'T6A1', text: 'Ich _____ in Frankfurt. (wohnen)', ans: 'wohne', marks: 1 },
          { id: 'T6A2', text: 'Du _____ viele Fragen. (stellen)', ans: 'stellst', marks: 1 },
          { id: 'T6A3', text: 'Sie (she) _____ Ärztin. (sein)', ans: 'ist', marks: 1 },
          { id: 'T6A4', text: 'Wir _____ Deutsch. (lernen)', ans: 'lernen', marks: 1 },
          { id: 'T6A5', text: 'Ihr _____ heute? (arbeiten)', ans: 'arbeitet', marks: 1 },
          { id: 'T6A6', text: 'Er _____ einen Bruder. (haben)', ans: 'hat', marks: 1 },
          { id: 'T6A7', text: 'Sie (they) _____ Patienten. (sein)', ans: 'sind', marks: 1 },
          { id: 'T6A8', text: 'Ich _____ kein Fieber. (haben)', ans: 'habe', marks: 1 },
          { id: 'T6A9', text: 'Du _____ aus welcher Stadt? (kommen)', ans: 'kommst', marks: 1 },
          { id: 'T6A10', text: 'Der Patient _____ Schmerzen. (haben)', ans: 'hat', marks: 1 },
        ]
      },
      {
        title: 'Section B: Sentence Structure & Questions',
        marks: 10,
        type: 'fill',
        instructions: 'Build, rewrite, or correct the sentences.',
        questions: [
          { id: 'T6B1', text: 'Build a statement: [ich / wohnen / in / München]', ans: 'ich wohne in münchen', altAns: ['ich wohne in munchen'], marks: 1 },
          { id: 'T6B2', text: 'Build a yes/no question: [du / haben / einen Termin]', ans: 'hast du einen termin', marks: 1 },
          { id: 'T6B3', text: 'Correct the word order: "Heute ich habe viel Arbeit."', ans: 'heute habe ich viel arbeit', marks: 1 },
          { id: 'T6B4', text: 'W-question asking WHERE someone lives (informal):', ans: 'wo wohnst du', altAns: ['wo wohnen sie'], marks: 1 },
          { id: 'T6B5', text: 'W-question asking WHEN the doctor comes:', ans: 'wann kommt der arzt', marks: 1 },
          { id: 'T6B6', text: 'Build: [Die Ärztin / kommen / um 10 Uhr]', ans: 'die ärztin kommt um 10 uhr', altAns: ['die arztin kommt um 10 uhr'], marks: 1 },
          { id: 'T6B7', text: 'Inversion — start with "Morgen": [wir / arbeiten / viel]', ans: 'morgen arbeiten wir viel', marks: 1 },
          { id: 'T6B8', text: 'Correct: "Was du machst?"', ans: 'was machst du', marks: 1 },
          { id: 'T6B9', text: 'Build: [Ich / haben / Hunger / und / Durst]', ans: 'ich habe hunger und durst', marks: 1 },
          { id: 'T6B10', text: 'Ask formally: "What is your name?"', ans: 'wie heißen sie', altAns: ['wie heissen sie'], marks: 1 },
        ]
      },
      {
        title: 'Section C: Family & Possessives',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T6C1', text: 'Article for Vater (father):', opts: ['der','die','das'], ans: 0, marks: 1 },
          { id: 'T6C2', text: 'Article for Mutter (mother):', opts: ['der','die','das'], ans: 1, marks: 1 },
          { id: 'T6C3', text: '"_____ Schwester" (his sister)', opts: ['meine','seine','deine','ihre'], ans: 1, marks: 1 },
          { id: 'T6C4', text: '"_____ Bruder" (her brother)', opts: ['sein','ihr','mein','dein'], ans: 1, marks: 1 },
          { id: 'T6C5', text: 'Article for Kinder (children, plural):', opts: ['der','die','das'], ans: 1, marks: 1 },
          { id: 'T6C6', text: 'Article for Eltern (parents):', opts: ['der','die','das'], ans: 1, marks: 1 },
          { id: 'T6C7', text: '"Das ist _____ Mann." (my husband)', opts: ['mein','meine','dein','deine'], ans: 0, marks: 1 },
          { id: 'T6C8', text: '"Wie alt ist _____ Tochter?" (your daughter — informal)', opts: ['meine','deine','seine','ihre'], ans: 1, marks: 1 },
          { id: 'T6C9', text: '"_____ Mutter ist Ärztin." (My mother)', opts: ['Mein','Meine','Dein','Deine'], ans: 1, marks: 1 },
          { id: 'T6C10', text: '"_____ Vater heißt Ramesh." (My father)', opts: ['Meine','Dein','Mein','Seine'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Section D: Multiple Choice — Grammar',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T6D1', text: 'The verb always stays at position ___ in a German statement.', opts: ['1','2','3','Last'], ans: 1, marks: 1 },
          { id: 'T6D2', text: 'Which is the correct question form?', opts: ['Wohnst du wo?','Du wohnst wo?','Wo wohnst du?','Wo du wohnst?'], ans: 2, marks: 1 },
          { id: 'T6D3', text: 'Ich habe ___ Bruder. (I have a brother — masculine)', opts: ['eine','ein','einer','einen'], ans: 1, marks: 1 },
          { id: 'T6D4', text: 'My sister = _____ Schwester', opts: ['mein','meine','meiner','meinen'], ans: 1, marks: 1 },
          { id: 'T6D5', text: 'Which verb needs an extra "e" before endings?', opts: ['wohnen','kommen','arbeiten','lernen'], ans: 2, marks: 1 },
          { id: 'T6D6', text: '"Haben" for er/sie/es is:', opts: ['habe','hast','hat','haben'], ans: 2, marks: 1 },
          { id: 'T6D7', text: 'Which is a correct W-question?', opts: ['Woher kommen Sie?','Woher Sie kommen?','Kommen Sie woher?','Sie kommen woher?'], ans: 0, marks: 1 },
          { id: 'T6D8', text: 'Imperativ (Sie-form) of "trinken":', opts: ['Trinkt!','Trinkst!','Trinken Sie!','Trinke!'], ans: 2, marks: 1 },
          { id: 'T6D9', text: '"Wann" asks about:', opts: ['Where','When','Who','Why'], ans: 1, marks: 1 },
          { id: 'T6D10', text: 'Which sentence shows correct inversion?', opts: ['Heute ich lerne.','Heute lerne ich.','Ich heute lerne.','Lerne heute ich.'], ans: 1, marks: 1 },
        ]
      },
      {
        title: 'Section E: Accusative Case',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T6E1', text: 'Das ist ___ Arzt. (nominative)', opts: ['der','den','ein'], ans: 0, marks: 1 },
          { id: 'T6E2', text: 'Ich suche ___ Arzt. (accusative)', opts: ['der','den','ein'], ans: 1, marks: 1 },
          { id: 'T6E3', text: 'Das ist ___ Tablette. (nominative)', opts: ['die','eine','der'], ans: 0, marks: 1 },
          { id: 'T6E4', text: 'Ich nehme ___ Tablette. (accusative — fem. unchanged)', opts: ['die','eine','der'], ans: 0, marks: 1 },
          { id: 'T6E5', text: 'Das ist ___ Krankenhaus. (nominative)', opts: ['das','ein','den'], ans: 0, marks: 1 },
          { id: 'T6E6', text: 'Ich suche ___ Schlüssel. (accusative, masc.)', opts: ['der','den','ein'], ans: 1, marks: 1 },
          { id: 'T6E7', text: 'Ich habe ___ Hund. (accusative, masc.)', opts: ['einen','ein','eine'], ans: 0, marks: 1 },
          { id: 'T6E8', text: 'Sie braucht ___ Termin. (accusative, masc.)', opts: ['einen','ein','eine'], ans: 0, marks: 1 },
          { id: 'T6E9', text: 'Er kauft ___ Buch. (accusative, neuter unchanged)', opts: ['ein','einen','eine'], ans: 0, marks: 1 },
          { id: 'T6E10', text: 'Wir haben ___ Frage. (accusative, fem. unchanged)', opts: ['eine','ein','einen'], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  // ── TESTS 7–9: CLASSES 11–15 ─────────────────────────────────────────────
  {
    id: 'A1_T7',
    name: 'Test 7: Accusative Pronouns, Prepositions & Home',
    classes: 'Classes 11–12',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Accusative Pronouns',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T7P1Q1', text: 'Ich suche ___. (den Arzt — masc.)', opts: ['ihn','sie','es','ihm'], ans: 0, marks: 1 },
          { id: 'T7P1Q2', text: 'Er ruft ___. (die Schwester — fem.)', opts: ['ihn','sie','es','ihr'], ans: 1, marks: 1 },
          { id: 'T7P1Q3', text: 'Wir nehmen ___. (das Medikament — neuter)', opts: ['ihn','sie','es','ihm'], ans: 2, marks: 1 },
          { id: 'T7P1Q4', text: 'Ich höre ___. (du — you informal)', opts: ['mich','dich','euch','uns'], ans: 1, marks: 1 },
          { id: 'T7P1Q5', text: 'Er sieht ___. (ich — me)', opts: ['mich','dich','euch','uns'], ans: 0, marks: 1 },
          { id: 'T7P1Q6', text: 'Sie braucht ___. (wir — us)', opts: ['mich','euch','uns','Sie'], ans: 2, marks: 1 },
          { id: 'T7P1Q7', text: 'Ich verstehe ___. (ihr — you all)', opts: ['uns','euch','sie','Sie'], ans: 1, marks: 1 },
          { id: 'T7P1Q8', text: 'Er kennt ___. (die Ärztin — fem.)', opts: ['ihn','es','sie','ihr'], ans: 2, marks: 1 },
          { id: 'T7P1Q9', text: 'Wir rufen ___. (Sie formal)', opts: ['ihn','sie','Sie','euch'], ans: 2, marks: 1 },
          { id: 'T7P1Q10', text: 'Ich sehe ___. (es / das Kind)', opts: ['ihn','sie','es','ihm'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Part 2: DOGFU Accusative Prepositions',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T7P2Q1', text: 'Das Medikament ist _____ den Patienten in Zimmer 3.', opts: ['für','gegen','durch','ohne'], ans: 0, marks: 1 },
          { id: 'T7P2Q2', text: 'Die Tablette hilft _____ Fieber.', opts: ['für','gegen','ohne','durch'], ans: 1, marks: 1 },
          { id: 'T7P2Q3', text: 'Ich komme _____ 14 Uhr zur Operation.', opts: ['für','ohne','um','gegen'], ans: 2, marks: 1 },
          { id: 'T7P2Q4', text: 'Sie läuft _____ den langen Korridor.', opts: ['für','durch','gegen','ohne'], ans: 1, marks: 1 },
          { id: 'T7P2Q5', text: 'Bitte kommen Sie nicht _____ einen Termin.', opts: ['für','gegen','um','ohne'], ans: 3, marks: 1 },
          { id: 'T7P2Q6', text: 'Das Frühstück ist _____ 7 Uhr.', opts: ['gegen','für','um','ohne'], ans: 2, marks: 1 },
          { id: 'T7P2Q7', text: 'Diese Creme ist _____ Juckreiz. (itching)', opts: ['für','gegen','ohne','durch'], ans: 1, marks: 1 },
          { id: 'T7P2Q8', text: 'Er arbeitet _____ seinen Kollegen. (without colleagues)', opts: ['für','gegen','durch','ohne'], ans: 3, marks: 1 },
        ]
      },
      {
        title: 'Part 3: Home Vocabulary',
        marks: 12,
        type: 'fill',
        instructions: 'Write the German word WITH article (der/die/das).',
        questions: [
          { id: 'T7P3Q1', text: 'kitchen', ans: 'die küche', altAns: ['die kuche'], marks: 1 },
          { id: 'T7P3Q2', text: 'bedroom', ans: 'das schlafzimmer', marks: 1 },
          { id: 'T7P3Q3', text: 'bathroom', ans: 'das bad', altAns: ['das badezimmer'], marks: 1 },
          { id: 'T7P3Q4', text: 'living room', ans: 'das wohnzimmer', marks: 1 },
          { id: 'T7P3Q5', text: 'bed', ans: 'das bett', marks: 1 },
          { id: 'T7P3Q6', text: 'wardrobe', ans: 'der schrank', marks: 1 },
          { id: 'T7P3Q7', text: 'table', ans: 'der tisch', marks: 1 },
          { id: 'T7P3Q8', text: 'lamp', ans: 'die lampe', marks: 1 },
          { id: 'T7P3Q9', text: 'door', ans: 'die tür', altAns: ['die tur'], marks: 1 },
          { id: 'T7P3Q10', text: 'window', ans: 'das fenster', marks: 1 },
          { id: 'T7P3Q11', text: 'hallway', ans: 'der flur', marks: 1 },
          { id: 'T7P3Q12', text: 'balcony', ans: 'der balkon', marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T8',
    name: 'Test 8: Food, Groceries & Café Phrases',
    classes: 'Classes 13–14',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Food & Drink Vocabulary',
        marks: 8,
        type: 'fill',
        instructions: 'Write the German with correct article.',
        questions: [
          { id: 'T8P1Q1', text: 'bread', ans: 'das brot', marks: 1 },
          { id: 'T8P1Q2', text: 'water', ans: 'das wasser', marks: 1 },
          { id: 'T8P1Q3', text: 'coffee', ans: 'der kaffee', marks: 1 },
          { id: 'T8P1Q4', text: 'milk', ans: 'die milch', marks: 1 },
          { id: 'T8P1Q5', text: 'egg (singular)', ans: 'das ei', marks: 1 },
          { id: 'T8P1Q6', text: 'apple', ans: 'der apfel', marks: 1 },
          { id: 'T8P1Q7', text: 'meat', ans: 'das fleisch', marks: 1 },
          { id: 'T8P1Q8', text: 'cheese', ans: 'der käse', altAns: ['der kase'], marks: 1 },
        ]
      },
      {
        title: 'Part 2: essen & trinken Conjugation',
        marks: 8,
        type: 'fill_blank',
        instructions: 'Fill in the correct form.',
        questions: [
          { id: 'T8P2Q1', text: 'Ich _____ (essen)', ans: 'esse', marks: 1 },
          { id: 'T8P2Q2', text: 'Du _____ (essen)', ans: 'isst', marks: 1 },
          { id: 'T8P2Q3', text: 'Er/sie/es _____ (essen)', ans: 'isst', marks: 1 },
          { id: 'T8P2Q4', text: 'Ihr _____ (essen)', ans: 'esst', marks: 1 },
          { id: 'T8P2Q5', text: 'Ich _____ (trinken)', ans: 'trinke', marks: 1 },
          { id: 'T8P2Q6', text: 'Du _____ (trinken)', ans: 'trinkst', marks: 1 },
          { id: 'T8P2Q7', text: 'Er/sie/es _____ (trinken)', ans: 'trinkt', marks: 1 },
          { id: 'T8P2Q8', text: 'Wir _____ (trinken)', ans: 'trinken', marks: 1 },
        ]
      },
      {
        title: 'Part 3: Hunger, Thirst & Preferences',
        marks: 6,
        type: 'fill',
        instructions: 'Translate into German.',
        questions: [
          { id: 'T8P3Q1', text: 'I am hungry.', ans: 'ich habe hunger', marks: 1 },
          { id: 'T8P3Q2', text: 'Are you (formal) thirsty?', ans: 'haben sie durst', marks: 1 },
          { id: 'T8P3Q3', text: 'I like to eat rice.', ans: 'ich esse gern reis', altAns: ['ich esse gerne reis'], marks: 1 },
          { id: 'T8P3Q4', text: 'He does not like to drink coffee.', ans: 'er trinkt nicht gern kaffee', altAns: ['er trinkt nicht gerne kaffee'], marks: 1 },
          { id: 'T8P3Q5', text: 'She prefers to eat vegetables.', ans: 'sie isst lieber gemüse', altAns: ['sie isst lieber gemuse'], marks: 1 },
          { id: 'T8P3Q6', text: 'I like fish the most.', ans: 'ich esse am liebsten fisch', marks: 1 },
        ]
      },
      {
        title: 'Part 4: Market & Café Phrases',
        marks: 8,
        type: 'fill',
        instructions: 'Write the German phrase for each situation.',
        questions: [
          { id: 'T8P4Q1', text: 'You want 500g of cheese (politely):', ans: 'ich hätte gern 500 gramm käse bitte', altAns: ['ich hätte gern 500g käse bitte','ich hatte gern 500 gramm kase bitte'], marks: 1 },
          { id: 'T8P4Q2', text: 'Ask how much something costs:', ans: 'was kostet das', marks: 1 },
          { id: 'T8P4Q3', text: 'Ask for the bill at a restaurant:', ans: 'zahlen bitte', marks: 1 },
          { id: 'T8P4Q4', text: 'Say "Anything else?" (as a shopkeeper):', ans: 'noch etwas', marks: 1 },
          { id: 'T8P4Q5', text: 'Say you will take that (a product):', ans: 'das nehme ich', marks: 1 },
          { id: 'T8P4Q6', text: 'Ask: "Together or separately?":', ans: 'zusammen oder getrennt', marks: 1 },
          { id: 'T8P4Q7', text: 'Say "Keep the change":', ans: 'stimmt so', marks: 1 },
          { id: 'T8P4Q8', text: 'Ask if you can pay by card:', ans: 'kann ich mit karte zahlen', marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T9',
    name: 'Test 9: End-of-Block Test (Classes 11–15)',
    classes: 'Classes 11–15',
    level: 'A1',
    totalMarks: 50,
    timeMinutes: 45,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Accusative Pronouns',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T9A1', text: 'Ich rufe den Arzt. → Ich rufe ___.', opts: ['ihn','sie','es','ihm'], ans: 0, marks: 1 },
          { id: 'T9A2', text: 'Er kennt die Schwester. → Er kennt ___.', opts: ['ihn','sie','es','ihr'], ans: 1, marks: 1 },
          { id: 'T9A3', text: 'Wir nehmen das Mittel. → Wir nehmen ___.', opts: ['ihn','sie','es','ihm'], ans: 2, marks: 1 },
          { id: 'T9A4', text: 'Sie sieht mich. → Which pronoun is used?', opts: ['mich','dich','uns','euch'], ans: 0, marks: 1 },
          { id: 'T9A5', text: 'Ich höre euch. → Which pronoun is used?', opts: ['mich','euch','uns','Sie'], ans: 1, marks: 1 },
          { id: 'T9A6', text: 'Er braucht uns. → Which pronoun is used?', opts: ['mich','euch','uns','Sie'], ans: 2, marks: 1 },
          { id: 'T9A7', text: 'Wir verstehen Sie (formal). → Wir verstehen ___.', opts: ['ihn','sie','Sie','euch'], ans: 2, marks: 1 },
          { id: 'T9A8', text: 'Ich sehe das Kind. → Ich sehe ___.', opts: ['ihn','sie','es','ihm'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Section B: DOGFU Prepositions + Accusative',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T9B1', text: 'Das Medikament ist ___ Patienten. (für + der Patient)', opts: ['für den','für dem','für die','für das'], ans: 0, marks: 1 },
          { id: 'T9B2', text: 'Ich gehe ___ Korridor. (durch + der Korridor)', opts: ['durch den','durch dem','durch die','durch das'], ans: 0, marks: 1 },
          { id: 'T9B3', text: 'Das hilft ___ Schmerz. (gegen + der Schmerz)', opts: ['gegen den','gegen dem','gegen die','gegen das'], ans: 0, marks: 1 },
          { id: 'T9B4', text: 'Komm nicht ___ Plan. (ohne + ein Plan)', opts: ['ohne einen','ohne einem','ohne ein','ohne eine'], ans: 0, marks: 1 },
          { id: 'T9B5', text: 'Die Operation beginnt ___ Uhr.', opts: ['um 9','gegen 9','für 9','durch 9'], ans: 0, marks: 1 },
          { id: 'T9B6', text: 'Ich arbeite ___ Pause. (ohne + eine Pause)', opts: ['ohne eine','ohne einem','ohne ein','ohne einen'], ans: 0, marks: 1 },
          { id: 'T9B7', text: 'Das ist ___ Ärztin. (für + die Ärztin — fem. unchanged)', opts: ['für die','für der','für den','für das'], ans: 0, marks: 1 },
          { id: 'T9B8', text: 'Wir laufen ___ Krankenhaus. (durch + das — neuter unchanged)', opts: ['durch das','durch dem','durch den','durch die'], ans: 0, marks: 1 },
        ]
      },
      {
        title: 'Section C: Home, Food & Conjugation',
        marks: 10,
        type: 'fill',
        instructions: 'Write the German with article or conjugate as instructed.',
        questions: [
          { id: 'T9C1', text: 'kitchen (with article)', ans: 'die küche', altAns: ['die kuche'], marks: 1 },
          { id: 'T9C2', text: 'bed (with article)', ans: 'das bett', marks: 1 },
          { id: 'T9C3', text: 'cheese (with article)', ans: 'der käse', altAns: ['der kase'], marks: 1 },
          { id: 'T9C4', text: 'water (with article)', ans: 'das wasser', marks: 1 },
          { id: 'T9C5', text: 'hallway (with article)', ans: 'der flur', marks: 1 },
          { id: 'T9C6', text: 'essen — du form:', ans: 'isst', marks: 1 },
          { id: 'T9C7', text: 'trinken — du form:', ans: 'trinkst', marks: 1 },
          { id: 'T9C8', text: 'sein — du form:', ans: 'bist', marks: 1 },
          { id: 'T9C9', text: 'essen — er/sie/es form:', ans: 'isst', marks: 1 },
          { id: 'T9C10', text: 'trinken — er/sie/es form:', ans: 'trinkt', marks: 1 },
        ]
      },
      {
        title: 'Section D: Negation — nicht or kein?',
        marks: 12,
        type: 'mcq',
        questions: [
          { id: 'T9D1', text: 'Ich habe _____ Zeit. (no time)', opts: ['keine','nicht','kein','keinen'], ans: 0, marks: 1 },
          { id: 'T9D2', text: 'Er arbeitet _____ heute. (not today)', opts: ['keine','nicht','kein','keinen'], ans: 1, marks: 1 },
          { id: 'T9D3', text: 'Das ist _____ Krankenhaus. (no hospital — neuter)', opts: ['keine','nicht','kein','keinen'], ans: 2, marks: 1 },
          { id: 'T9D4', text: 'Sie ist _____ müde. (not tired)', opts: ['keine','nicht','kein','keinen'], ans: 1, marks: 1 },
          { id: 'T9D5', text: 'Ich habe _____ Hunger. (masc. accusative)', opts: ['keine','nicht','kein','keinen'], ans: 3, marks: 1 },
          { id: 'T9D6', text: 'Es gibt _____ freies Bett. (neuter)', opts: ['keine','nicht','kein','keinen'], ans: 2, marks: 1 },
          { id: 'T9D7', text: 'Das ist _____ mein Buch. (not my book)', opts: ['keine','nicht','kein','keinen'], ans: 1, marks: 1 },
          { id: 'T9D8', text: 'Wir haben _____ Termin. (masc. accusative)', opts: ['keine','nicht','kein','keinen'], ans: 3, marks: 1 },
          { id: 'T9D9', text: 'Sie kommt _____ aus Indien. (not from India)', opts: ['keine','nicht','kein','keinen'], ans: 1, marks: 1 },
          { id: 'T9D10', text: 'Er ist _____ Arzt. (not a doctor)', opts: ['keine','nicht','kein','keinen'], ans: 2, marks: 1 },
          { id: 'T9D11', text: 'Ich trinke _____ gern Kaffee.', opts: ['keine','nicht','kein','keinen'], ans: 1, marks: 1 },
          { id: 'T9D12', text: 'Es gibt _____ Parkplätze hier. (plural)', opts: ['keine','nicht','kein','keinen'], ans: 0, marks: 1 },
        ]
      },
      {
        title: 'Section E: Doch! and Café Phrases',
        marks: 12,
        type: 'mcq',
        questions: [
          { id: 'T9E1', text: '"Hast du keinen Hunger?" — You DO have hunger:', opts: ['Ja!','Nein!','Doch!','Nicht!'], ans: 2, marks: 2 },
          { id: 'T9E2', text: '"Du bist nicht müde, oder?" — You ARE tired:', opts: ['Ja!','Nein!','Doch!','Nicht!'], ans: 2, marks: 2 },
          { id: 'T9E3', text: '"Kommst du morgen?" — You are NOT coming:', opts: ['Doch!','Ja!','Nein!','Nicht!'], ans: 2, marks: 2 },
          { id: 'T9E4', text: '"Haben Sie keinen Termin?" — You DO have one:', opts: ['Nein!','Ja!','Nicht!','Doch!'], ans: 3, marks: 2 },
          { id: 'T9E5', text: 'How do you politely order in a café?', opts: ['Ich will einen Kaffee!','Ich hätte gern einen Kaffee, bitte.','Gib mir Kaffee!','Kaffee, sofort!'], ans: 1, marks: 2 },
          { id: 'T9E6', text: 'How do you ask for the bill?', opts: ['Geben Sie mir Geld!','Zahlen, bitte!','Ich möchte nicht zahlen.','Wo ist das Geld?'], ans: 1, marks: 2 },
        ]
      }
    ]
  },

  // ── TESTS 10–12: CLASSES 16–20 ───────────────────────────────────────────
  {
    id: 'A1_T10',
    name: 'Test 10: Time & Clock + Separable Verbs',
    classes: 'Classes 16–17',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Time — Formal to Informal',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T10P1Q1', text: '8:00 in informal German:', opts: ['acht Uhr','Viertel nach acht','halb acht','halb neun'], ans: 0, marks: 1 },
          { id: 'T10P1Q2', text: '8:15 in informal German:', opts: ['acht Uhr fünfzehn','Viertel nach acht','halb neun','Viertel vor neun'], ans: 1, marks: 1 },
          { id: 'T10P1Q3', text: '8:30 in informal German (⚠️ tricky!):', opts: ['halb acht','halb neun','Viertel nach acht','Viertel vor neun'], ans: 1, marks: 1 },
          { id: 'T10P1Q4', text: '8:45 in informal German:', opts: ['halb neun','Viertel nach acht','Viertel vor neun','Viertel vor acht'], ans: 2, marks: 1 },
          { id: 'T10P1Q5', text: '14:00 in informal German:', opts: ['vierzehn Uhr','zwei Uhr nachmittags','halb drei','Viertel nach zwei'], ans: 1, marks: 1 },
          { id: 'T10P1Q6', text: '17:30 in informal German (⚠️ tricky!):', opts: ['halb sieben','halb sechs','halb fünf','Viertel vor sechs'], ans: 1, marks: 1 },
          { id: 'T10P1Q7', text: '10:45 in informal German:', opts: ['Viertel nach zehn','halb elf','Viertel vor elf','halb zwölf'], ans: 2, marks: 1 },
          { id: 'T10P1Q8', text: '23:00 in informal German:', opts: ['drei Uhr nachts','elf Uhr nachts','zwölf Uhr nachts','zehn Uhr nachts'], ans: 1, marks: 1 },
        ]
      },
      {
        title: 'Part 2: Time Prepositions',
        marks: 6,
        type: 'mcq',
        questions: [
          { id: 'T10P2Q1', text: 'Die Operation beginnt _____ 9 Uhr.', opts: ['von','bis','um','seit'], ans: 2, marks: 1 },
          { id: 'T10P2Q2', text: 'Ich arbeite _____ 7 _____ 15 Uhr.', opts: ['um...bis','von...bis','seit...um','von...um'], ans: 1, marks: 1 },
          { id: 'T10P2Q3', text: '_____ arbeiten Sie heute? (How long?)', opts: ['Wann','Wie lange','Seit wann','Von wann'], ans: 1, marks: 1 },
          { id: 'T10P2Q4', text: 'Ich bin _____ einer Stunde hier. (ongoing)', opts: ['von','bis','um','seit'], ans: 3, marks: 1 },
          { id: 'T10P2Q5', text: 'Die Pause ist _____ 12 bis 12:30 Uhr.', opts: ['um','seit','von','ab'], ans: 2, marks: 1 },
          { id: 'T10P2Q6', text: 'Der Arzt kommt _____ Viertel nach zehn.', opts: ['seit','von','bis','um'], ans: 3, marks: 1 },
        ]
      },
      {
        title: 'Part 3: Separable Verbs',
        marks: 10,
        type: 'fill',
        instructions: 'Rewrite — the separable prefix goes to the END of the sentence.',
        questions: [
          { id: 'T10P3Q1', text: '[aufstehen] Ich / um 6 Uhr →', ans: 'ich stehe um 6 uhr auf', marks: 1 },
          { id: 'T10P3Q2', text: '[anrufen] Er / den Patienten →', ans: 'er ruft den patienten an', marks: 1 },
          { id: 'T10P3Q3', text: '[einkaufen] Wir / nach der Arbeit →', ans: 'wir kaufen nach der arbeit ein', marks: 1 },
          { id: 'T10P3Q4', text: '[abfahren] Der Zug / um 8 Uhr →', ans: 'der zug fährt um 8 uhr ab', altAns: ['der zug fahrt um 8 uhr ab'], marks: 1 },
          { id: 'T10P3Q5', text: '[fernsehen] Sie / abends →', ans: 'sie sieht abends fern', marks: 1 },
          { id: 'T10P3Q6', text: '[anfangen] Wann / du / ? →', ans: 'wann fängst du an', altAns: ['wann fangst du an'], marks: 1 },
          { id: 'T10P3Q7', text: '[aufhören] Ich / um 16 Uhr →', ans: 'ich höre um 16 uhr auf', altAns: ['ich hore um 16 uhr auf'], marks: 1 },
          { id: 'T10P3Q8', text: '[aufmachen] Bitte / die Tür →', ans: 'bitte mach die tür auf', altAns: ['bitte machen sie die tür auf','bitte mach die tur auf'], marks: 1 },
          { id: 'T10P3Q9', text: '[einschlafen] Er / um 22 Uhr →', ans: 'er schläft um 22 uhr ein', altAns: ['er schlaft um 22 uhr ein'], marks: 1 },
          { id: 'T10P3Q10', text: '[ausgehen] Wir / am Wochenende →', ans: 'wir gehen am wochenende aus', marks: 1 },
        ]
      },
      {
        title: 'Part 4: Daily Routine',
        marks: 6,
        type: 'fill',
        instructions: 'Write sentences about your daily routine using separable verbs AND time expressions.',
        questions: [
          { id: 'T10P4Q1', text: 'Use "aufstehen" + a time (e.g. um 6 Uhr):', ans: 'ich stehe um 6 uhr auf', altAns: ['ich stehe um 5 uhr auf','ich stehe um 7 uhr auf','ich stehe früh auf'], marks: 2 },
          { id: 'T10P4Q2', text: 'Use "anfangen" + a time:', ans: 'ich fange um 8 uhr mit der arbeit an', altAns: ['ich fange um 8 uhr an','die arbeit fängt um 8 uhr an'], marks: 2 },
          { id: 'T10P4Q3', text: 'Use "einschlafen" + a time:', ans: 'ich schlafe um 22 uhr ein', altAns: ['ich schlafe früh ein','ich schlafe um 23 uhr ein'], marks: 2 },
        ]
      }
    ]
  },
  {
    id: 'A1_T11',
    name: 'Test 11: Modal Verbs I & II',
    classes: 'Classes 18–19',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Modal Verb Conjugation',
        marks: 12,
        type: 'fill_blank',
        instructions: 'Fill in the correct conjugation.',
        questions: [
          { id: 'T11P1Q1', text: 'ich _____ (können)', ans: 'kann', marks: 1 },
          { id: 'T11P1Q2', text: 'du _____ (können)', ans: 'kannst', marks: 1 },
          { id: 'T11P1Q3', text: 'ihr _____ (können)', ans: 'könnt', altAns: ['konnt'], marks: 1 },
          { id: 'T11P1Q4', text: 'er/sie/es _____ (müssen)', ans: 'muss', marks: 1 },
          { id: 'T11P1Q5', text: 'wir _____ (müssen)', ans: 'müssen', altAns: ['mussen'], marks: 1 },
          { id: 'T11P1Q6', text: 'ihr _____ (müssen)', ans: 'müsst', altAns: ['musst'], marks: 1 },
          { id: 'T11P1Q7', text: 'ich _____ (dürfen)', ans: 'darf', marks: 1 },
          { id: 'T11P1Q8', text: 'du _____ (dürfen)', ans: 'darfst', marks: 1 },
          { id: 'T11P1Q9', text: 'ich _____ (möchten)', ans: 'möchte', altAns: ['mochte'], marks: 1 },
          { id: 'T11P1Q10', text: 'du _____ (möchten)', ans: 'möchtest', altAns: ['mochtest'], marks: 1 },
          { id: 'T11P1Q11', text: 'ich _____ (wollen)', ans: 'will', marks: 1 },
          { id: 'T11P1Q12', text: 'ich _____ (sollen)', ans: 'soll', marks: 1 },
        ]
      },
      {
        title: 'Part 2: Choose the Right Modal',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T11P2Q1', text: 'Doctor tells patient to rest → "Sie _____ sich ausruhen."', opts: ['können','wollen','sollen','möchten'], ans: 2, marks: 1 },
          { id: 'T11P2Q2', text: 'Offer help politely → "Ich _____ Ihnen helfen."', opts: ['will','kann','muss','soll'], ans: 1, marks: 1 },
          { id: 'T11P2Q3', text: 'Hospital rule: No smoking → "Hier _____ man nicht rauchen."', opts: ['muss','kann','darf','soll'], ans: 2, marks: 1 },
          { id: 'T11P2Q4', text: 'Patient politely asks for water → "Ich _____ ein Glas Wasser."', opts: ['will','soll','möchte','kann'], ans: 2, marks: 1 },
          { id: 'T11P2Q5', text: 'Nurse must work night shift → "Ich _____ Nachtschicht arbeiten."', opts: ['darf','muss','soll','kann'], ans: 1, marks: 1 },
          { id: 'T11P2Q6', text: 'Ask if you may enter → "_____ ich reinkommen?"', opts: ['Muss','Will','Soll','Darf'], ans: 3, marks: 1 },
          { id: 'T11P2Q7', text: 'You want to learn German well → "Ich _____ Deutsch gut lernen."', opts: ['darf','soll','will','muss'], ans: 2, marks: 1 },
          { id: 'T11P2Q8', text: 'Patient should drink water → "Der Patient _____ viel trinken."', opts: ['darf','kann','soll','will'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Part 3: Build Modal Sentences',
        marks: 10,
        type: 'fill',
        instructions: 'Build correct German sentences.',
        questions: [
          { id: 'T11P3Q1', text: '[Ich / können / Ihnen / helfen]', ans: 'ich kann ihnen helfen', marks: 1 },
          { id: 'T11P3Q2', text: '[Sie / müssen / täglich / Medikamente / nehmen] (formal)', ans: 'sie müssen täglich medikamente nehmen', altAns: ['sie mussen taglich medikamente nehmen'], marks: 1 },
          { id: 'T11P3Q3', text: '[Hier / dürfen / Sie / nicht / parken]', ans: 'hier dürfen sie nicht parken', altAns: ['hier durfen sie nicht parken'], marks: 1 },
          { id: 'T11P3Q4', text: '[Was / möchten / Sie / trinken] ?', ans: 'was möchten sie trinken', altAns: ['was mochten sie trinken'], marks: 1 },
          { id: 'T11P3Q5', text: '[Der Patient / sollen / ruhen]', ans: 'der patient soll ruhen', marks: 1 },
          { id: 'T11P3Q6', text: '[Wir / wollen / heute / den Arzt / anrufen]', ans: 'wir wollen heute den arzt anrufen', marks: 1 },
          { id: 'T11P3Q7', text: '[Du / können / morgen / kommen] ?', ans: 'kannst du morgen kommen', marks: 1 },
          { id: 'T11P3Q8', text: '[Ich / möchten / einen / Termin]', ans: 'ich möchte einen termin', altAns: ['ich mochte einen termin'], marks: 1 },
          { id: 'T11P3Q9', text: '[Er / dürfen / nicht / essen]', ans: 'er darf nicht essen', marks: 1 },
          { id: 'T11P3Q10', text: '[Wir / müssen / pünktlich / sein]', ans: 'wir müssen pünktlich sein', altAns: ['wir mussen punktlich sein'], marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T12',
    name: 'Test 12: End-of-Block Test (Classes 16–20)',
    classes: 'Classes 16–20',
    level: 'A1',
    totalMarks: 50,
    timeMinutes: 45,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Time',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T12A1', text: '9:30 in informal German:', opts: ['halb zehn','halb neun','Viertel nach neun','Viertel vor zehn'], ans: 0, marks: 1 },
          { id: 'T12A2', text: '11:15 in informal German:', opts: ['halb elf','Viertel nach elf','Viertel vor elf','elf Uhr fünfzehn'], ans: 1, marks: 1 },
          { id: 'T12A3', text: '14:45 in informal German:', opts: ['Viertel vor drei','halb drei','Viertel nach zwei','drei Uhr'], ans: 0, marks: 1 },
          { id: 'T12A4', text: '20:00 in informal German:', opts: ['acht Uhr abends','zwanzig Uhr','acht Uhr morgens','halb neun'], ans: 0, marks: 1 },
          { id: 'T12A5', text: 'Die Schicht beginnt _____ 7 Uhr.', opts: ['von','seit','bis','um'], ans: 3, marks: 1 },
          { id: 'T12A6', text: 'Ich arbeite _____ 7 bis 15 Uhr.', opts: ['seit','um','von','ab'], ans: 2, marks: 1 },
          { id: 'T12A7', text: 'Ich bin _____ zwei Stunden hier.', opts: ['von','bis','um','seit'], ans: 3, marks: 1 },
          { id: 'T12A8', text: '"Ward rounds are at 8 AM." in German:', opts: ['Die Visite ist um 8 Uhr.','Die Visite ist von 8 Uhr.','Die Visite ist seit 8 Uhr.','Die Visite ist bis 8 Uhr.'], ans: 0, marks: 1 },
          { id: 'T12A9', text: '"I work from 14:00 to 22:00." in German:', opts: ['Ich arbeite von 14 bis 22 Uhr.','Ich arbeite seit 14 bis 22 Uhr.','Ich arbeite um 14 bis 22 Uhr.','Ich arbeite ab 14 bis 22 Uhr.'], ans: 0, marks: 1 },
          { id: 'T12A10', text: '"How long have you been here?" in German:', opts: ['Wann sind Sie hier?','Wie lange sind Sie schon hier?','Wo sind Sie hier?','Wie sind Sie hier?'], ans: 1, marks: 1 },
        ]
      },
      {
        title: 'Section B: Separable Verbs',
        marks: 10,
        type: 'fill',
        instructions: 'Rewrite with the prefix in the correct position.',
        questions: [
          { id: 'T12B1', text: '[aufstehen] Ich / um 5:30 Uhr →', ans: 'ich stehe um 5:30 uhr auf', altAns: ['ich stehe um 530 uhr auf'], marks: 1 },
          { id: 'T12B2', text: '[anrufen] Bitte / du / den Arzt →', ans: 'bitte ruf den arzt an', altAns: ['bitte rufe den arzt an'], marks: 1 },
          { id: 'T12B3', text: '[anfangen] Die Arbeit / um 8 Uhr →', ans: 'die arbeit fängt um 8 uhr an', altAns: ['die arbeit fangt um 8 uhr an'], marks: 1 },
          { id: 'T12B4', text: '[aufhören] Wann / ihr / ? →', ans: 'wann hört ihr auf', altAns: ['wann hort ihr auf'], marks: 1 },
          { id: 'T12B5', text: '[einkaufen] Wir / nach der Arbeit →', ans: 'wir kaufen nach der arbeit ein', marks: 1 },
          { id: 'T12B6', text: '[fernsehen] Er / jeden Abend →', ans: 'er sieht jeden abend fern', marks: 1 },
          { id: 'T12B7', text: '[einschlafen] Das Baby / schnell →', ans: 'das baby schläft schnell ein', altAns: ['das baby schlaft schnell ein'], marks: 1 },
          { id: 'T12B8', text: '[abfahren] Der Bus / um halb acht →', ans: 'der bus fährt um halb acht ab', altAns: ['der bus fahrt um halb acht ab'], marks: 1 },
          { id: 'T12B9', text: '[ausgehen] Sie / am Freitag →', ans: 'sie gehen am freitag aus', marks: 1 },
          { id: 'T12B10', text: '[aufmachen] Die Krankenschwester / die Tür →', ans: 'die krankenschwester macht die tür auf', altAns: ['die krankenschwester macht die tur auf'], marks: 1 },
        ]
      },
      {
        title: 'Section C: Modal Verb Conjugation',
        marks: 12,
        type: 'fill_blank',
        instructions: 'Fill in the correct form of the modal verb.',
        questions: [
          { id: 'T12C1', text: 'Ich _____ Ihnen helfen. (können)', ans: 'kann', marks: 1 },
          { id: 'T12C2', text: 'Du _____ diese Tablette nehmen. (müssen)', ans: 'musst', marks: 1 },
          { id: 'T12C3', text: 'Er _____ nicht essen. (dürfen)', ans: 'darf', marks: 1 },
          { id: 'T12C4', text: 'Was _____ Sie trinken? (möchten)', ans: 'möchten', altAns: ['mochten'], marks: 1 },
          { id: 'T12C5', text: 'Wir _____ pünktlich sein. (müssen)', ans: 'müssen', altAns: ['mussen'], marks: 1 },
          { id: 'T12C6', text: 'Ihr _____ leise sein. (sollen)', ans: 'sollt', marks: 1 },
          { id: 'T12C7', text: 'Sie _____ morgen kommen. (können)', ans: 'können', altAns: ['konnen'], marks: 1 },
          { id: 'T12C8', text: 'Ich _____ einen Termin. (möchten)', ans: 'möchte', altAns: ['mochte'], marks: 1 },
          { id: 'T12C9', text: '_____ ich reinkommen? (dürfen)', ans: 'darf', marks: 1 },
          { id: 'T12C10', text: 'Der Patient _____ ruhen. (sollen)', ans: 'soll', marks: 1 },
          { id: 'T12C11', text: 'Du _____ nicht parken. (dürfen)', ans: 'darfst', marks: 1 },
          { id: 'T12C12', text: 'Was _____ du werden? (wollen)', ans: 'willst', marks: 1 },
        ]
      },
      {
        title: 'Section D: Modal Sentences & Meaning',
        marks: 18,
        type: 'mcq',
        questions: [
          { id: 'T12D1', text: '"I can speak German." in German:', opts: ['Ich kann Deutsch sprechen.','Ich muss Deutsch sprechen.','Ich soll Deutsch sprechen.','Ich will Deutsch sprechen.'], ans: 0, marks: 1 },
          { id: 'T12D2', text: '"You (formal) must take this medication daily." in German:', opts: ['Sie dürfen täglich diese Tablette nehmen.','Sie sollen täglich diese Tablette nehmen.','Sie müssen täglich diese Tablette nehmen.','Sie können täglich diese Tablette nehmen.'], ans: 2, marks: 1 },
          { id: 'T12D3', text: '"Patients may not smoke here." in German:', opts: ['Hier müssen Patienten nicht rauchen.','Hier dürfen Patienten nicht rauchen.','Hier sollen Patienten nicht rauchen.','Hier wollen Patienten nicht rauchen.'], ans: 1, marks: 1 },
          { id: 'T12D4', text: '"What would you like to eat?" in German:', opts: ['Was sollen Sie essen?','Was dürfen Sie essen?','Was möchten Sie essen?','Was müssen Sie essen?'], ans: 2, marks: 1 },
          { id: 'T12D5', text: '"She is supposed to rest." in German:', opts: ['Sie muss sich ausruhen.','Sie soll sich ausruhen.','Sie darf sich ausruhen.','Sie will sich ausruhen.'], ans: 1, marks: 1 },
          { id: 'T12D6', text: '"We want to call the doctor." in German:', opts: ['Wir sollen den Arzt anrufen.','Wir müssen den Arzt anrufen.','Wir wollen den Arzt anrufen.','Wir können den Arzt anrufen.'], ans: 2, marks: 1 },
          { id: 'T12D7', text: '"Du musst nicht kommen." means:', opts: ['You are not allowed to come.','You do not HAVE TO come.','You should not come.','You cannot come.'], ans: 1, marks: 3 },
          { id: 'T12D8', text: '"Du darfst nicht kommen." means:', opts: ['You do not have to come.','You cannot come.','You are NOT ALLOWED to come.','You should not come.'], ans: 2, marks: 3 },
          { id: 'T12D9', text: 'Hospital example of "musst nicht" (not obligatory):', opts: ['Du musst heute nicht arbeiten.','Du darfst hier nicht rauchen.','Du kannst morgen nicht kommen.','Du sollst nicht essen.'], ans: 0, marks: 3 },
          { id: 'T12D10', text: 'Hospital example of "darfst nicht" (prohibition):', opts: ['Du musst heute nicht kommen.','Du darfst hier nicht rauchen.','Du kannst heute nicht kommen.','Du willst nicht essen.'], ans: 1, marks: 3 },
        ]
      }
    ]
  },
  // ── TESTS 13–15: CLASSES 21–25 ───────────────────────────────────────────
  {
    id: 'A1_T13',
    name: 'Test 13: Sentence Architecture & Travel',
    classes: 'Classes 21–22',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Word Order — Correct or Rewrite',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T13P1Q1', text: '"Ich heute arbeite im Krankenhaus." — Correct version:', opts: ['✓ It is already correct','Ich arbeite heute im Krankenhaus.','Heute ich arbeite im Krankenhaus.','Arbeite ich heute im Krankenhaus.'], ans: 1, marks: 1 },
          { id: 'T13P1Q2', text: '"Morgen fahren wir nach Berlin." — Is it correct?', opts: ['✓ Correct','✗ Wrong'], ans: 0, marks: 1 },
          { id: 'T13P1Q3', text: '"Um 6 Uhr ich stehe auf." — Correct version:', opts: ['Um 6 Uhr stehe ich auf.','Ich stehe auf um 6 Uhr.','Ich auf stehe um 6 Uhr.','Stehe ich um 6 Uhr auf.'], ans: 0, marks: 1 },
          { id: 'T13P1Q4', text: '"Heute kann ich kommen." — Is it correct?', opts: ['✓ Correct','✗ Wrong'], ans: 0, marks: 1 },
          { id: 'T13P1Q5', text: '"Ich muss morgen früh aufstehen." — Is it correct?', opts: ['✓ Correct','✗ Wrong'], ans: 0, marks: 1 },
          { id: 'T13P1Q6', text: '"Den Arzt ich rufe an." — Correct version:', opts: ['Ich rufe den Arzt an.','Den Arzt rufe ich.','Rufe ich den Arzt an.','Den Arzt ich an rufe.'], ans: 0, marks: 1 },
          { id: 'T13P1Q7', text: '"Jeden Tag lernt er Deutsch." — Is it correct?', opts: ['✓ Correct','✗ Wrong'], ans: 0, marks: 1 },
          { id: 'T13P1Q8', text: '"Kann Sie mir helfen?" — Correct version:', opts: ['Können Sie mir helfen?','Kann mir Sie helfen?','Sie können mir helfen?','Helfen Sie mir kann?'], ans: 0, marks: 1 },
          { id: 'T13P1Q9', text: '"Wann du aufstehst?" — Correct version:', opts: ['Wann stehst du auf?','Wann du stehst auf?','Du wann aufstehst?','Aufstehst du wann?'], ans: 0, marks: 1 },
          { id: 'T13P1Q10', text: '"Im Krankenhaus arbeite ich jeden Tag." — Is it correct?', opts: ['✓ Correct','✗ Wrong'], ans: 0, marks: 1 },
        ]
      },
      {
        title: 'Part 2: mit + Dative — Transport',
        marks: 8,
        type: 'fill',
        instructions: 'Write the correct "mit + dative" phrase.',
        questions: [
          { id: 'T13P2Q1', text: 'der Zug →', ans: 'mit dem zug', marks: 1 },
          { id: 'T13P2Q2', text: 'die U-Bahn →', ans: 'mit der u-bahn', altAns: ['mit der ubahn'], marks: 1 },
          { id: 'T13P2Q3', text: 'das Fahrrad →', ans: 'mit dem fahrrad', marks: 1 },
          { id: 'T13P2Q4', text: 'der Bus →', ans: 'mit dem bus', marks: 1 },
          { id: 'T13P2Q5', text: 'das Auto →', ans: 'mit dem auto', marks: 1 },
          { id: 'T13P2Q6', text: 'das Taxi →', ans: 'mit dem taxi', marks: 1 },
          { id: 'T13P2Q7', text: 'die S-Bahn →', ans: 'mit der s-bahn', altAns: ['mit der sbahn'], marks: 1 },
          { id: 'T13P2Q8', text: 'das Flugzeug →', ans: 'mit dem flugzeug', marks: 1 },
        ]
      },
      {
        title: 'Part 3: Travel Vocabulary & Directions',
        marks: 12,
        type: 'fill',
        instructions: 'Write the German word with article or the correct phrase.',
        questions: [
          { id: 'T13P3Q1', text: 'train station (with article):', ans: 'der bahnhof', marks: 1 },
          { id: 'T13P3Q2', text: 'platform (with article):', ans: 'das gleis', marks: 1 },
          { id: 'T13P3Q3', text: 'delay (with article):', ans: 'die verspätung', altAns: ['die verspatung'], marks: 1 },
          { id: 'T13P3Q4', text: 'return ticket:', ans: 'hin und zurück', altAns: ['hin und zuruck'], marks: 1 },
          { id: 'T13P3Q5', text: 'Turn left:', ans: 'biegen sie links ab', altAns: ['links abbiegen'], marks: 2 },
          { id: 'T13P3Q6', text: 'Go straight:', ans: 'gehen sie geradeaus', altAns: ['geradeaus gehen','geradeaus'], marks: 2 },
          { id: 'T13P3Q7', text: 'On the right side:', ans: 'auf der rechten seite', marks: 2 },
          { id: 'T13P3Q8', text: 'At the traffic light:', ans: 'an der ampel', marks: 2 },
        ]
      }
    ]
  },
  {
    id: 'A1_T14',
    name: 'Test 14: Perfekt I & II — haben and sein + Partizip II',
    classes: 'Classes 23–24',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Build the Partizip II',
        marks: 10,
        type: 'fill',
        instructions: 'Write the correct Partizip II.',
        questions: [
          { id: 'T14P1Q1', text: 'lernen →', ans: 'gelernt', marks: 1 },
          { id: 'T14P1Q2', text: 'kaufen →', ans: 'gekauft', marks: 1 },
          { id: 'T14P1Q3', text: 'arbeiten →', ans: 'gearbeitet', marks: 1 },
          { id: 'T14P1Q4', text: 'essen →', ans: 'gegessen', marks: 1 },
          { id: 'T14P1Q5', text: 'trinken →', ans: 'getrunken', marks: 1 },
          { id: 'T14P1Q6', text: 'gehen →', ans: 'gegangen', marks: 1 },
          { id: 'T14P1Q7', text: 'kommen →', ans: 'gekommen', marks: 1 },
          { id: 'T14P1Q8', text: 'fahren →', ans: 'gefahren', marks: 1 },
          { id: 'T14P1Q9', text: 'telefonieren → (⚠️ no ge-!)', ans: 'telefoniert', marks: 1 },
          { id: 'T14P1Q10', text: 'anrufen →', ans: 'angerufen', marks: 1 },
        ]
      },
      {
        title: 'Part 2: Complete Perfekt Sentences',
        marks: 12,
        type: 'fill',
        instructions: 'Choose haben or sein and write the full sentence.',
        questions: [
          { id: 'T14P2Q1', text: 'ich / gehen / ins Krankenhaus / gestern →', ans: 'ich bin gestern ins krankenhaus gegangen', marks: 1 },
          { id: 'T14P2Q2', text: 'er / nehmen / die Tablette / heute Morgen →', ans: 'er hat heute morgen die tablette genommen', marks: 1 },
          { id: 'T14P2Q3', text: 'wir / fahren / mit dem Zug / nach Köln →', ans: 'wir sind mit dem zug nach köln gefahren', altAns: ['wir sind mit dem zug nach koln gefahren'], marks: 1 },
          { id: 'T14P2Q4', text: 'sie (she) / essen / zu viel / gestern Abend →', ans: 'sie hat gestern abend zu viel gegessen', marks: 1 },
          { id: 'T14P2Q5', text: 'du / aufstehen / um 5 Uhr →', ans: 'du bist um 5 uhr aufgestanden', marks: 1 },
          { id: 'T14P2Q6', text: 'ich / telefonieren / mit dem Arzt →', ans: 'ich habe mit dem arzt telefoniert', marks: 1 },
          { id: 'T14P2Q7', text: 'der Patient / einschlafen / früh →', ans: 'der patient ist früh eingeschlafen', altAns: ['der patient ist fruh eingeschlafen'], marks: 1 },
          { id: 'T14P2Q8', text: 'wir / schreiben / den Bericht →', ans: 'wir haben den bericht geschrieben', marks: 1 },
          { id: 'T14P2Q9', text: 'sie (they) / kommen / aus Indien →', ans: 'sie sind aus indien gekommen', marks: 1 },
          { id: 'T14P2Q10', text: 'ich / einkaufen / nach der Arbeit →', ans: 'ich habe nach der arbeit eingekauft', marks: 1 },
          { id: 'T14P2Q11', text: 'er / sehen / den Film →', ans: 'er hat den film gesehen', marks: 1 },
          { id: 'T14P2Q12', text: 'du / fliegen / nach Frankfurt →', ans: 'du bist nach frankfurt geflogen', marks: 1 },
        ]
      },
      {
        title: 'Part 3: war & hatte — Präteritum',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T14P3Q1', text: 'Ich _____ krank. (sein — Präteritum)', opts: ['war','warst','waren','bin'], ans: 0, marks: 1 },
          { id: 'T14P3Q2', text: 'Du _____ müde. (sein — Präteritum)', opts: ['war','warst','waren','seid'], ans: 1, marks: 1 },
          { id: 'T14P3Q3', text: 'Er _____ Arzt. (sein — Präteritum)', opts: ['war','warst','waren','ist'], ans: 0, marks: 1 },
          { id: 'T14P3Q4', text: 'Wir _____ fertig. (sein — Präteritum)', opts: ['war','warst','waren','seid'], ans: 2, marks: 1 },
          { id: 'T14P3Q5', text: 'Ich _____ Fieber. (haben — Präteritum)', opts: ['hatte','hattest','hatten','habe'], ans: 0, marks: 1 },
          { id: 'T14P3Q6', text: 'Du _____ Zeit. (haben — Präteritum)', opts: ['hatte','hattest','hatten','hast'], ans: 1, marks: 1 },
          { id: 'T14P3Q7', text: 'Sie (formal) _____ einen Termin. (haben — Präteritum)', opts: ['hatte','hattest','hatten','haben'], ans: 2, marks: 1 },
          { id: 'T14P3Q8', text: 'Wir _____ keine Zeit. (haben — Präteritum)', opts: ['hatte','hattest','hatten','haben'], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T15',
    name: 'Test 15: End-of-Block Test (Classes 21–25)',
    classes: 'Classes 21–25',
    level: 'A1',
    totalMarks: 50,
    timeMinutes: 45,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Sentence Architecture',
        marks: 10,
        type: 'fill',
        instructions: 'Correct the word order or rewrite as instructed.',
        questions: [
          { id: 'T15A1', text: 'Correct: "Heute ich lerne Deutsch." →', ans: 'heute lerne ich deutsch', marks: 1 },
          { id: 'T15A2', text: 'Correct: "Ich auf um 6 Uhr stehe." →', ans: 'ich stehe um 6 uhr auf', marks: 1 },
          { id: 'T15A3', text: 'Correct: "Kann morgen du kommen?" →', ans: 'kannst du morgen kommen', marks: 1 },
          { id: 'T15A4', text: 'Correct: "Morgen ich muss früh aufstehen." →', ans: 'morgen muss ich früh aufstehen', altAns: ['morgen muss ich fruh aufstehen'], marks: 1 },
          { id: 'T15A5', text: 'Correct: "Den Patient rufe ich an." →', ans: 'ich rufe den patienten an', altAns: ['ich rufe den patient an'], marks: 1 },
          { id: 'T15A6', text: 'Rewrite starting with "Jeden Tag": [Ich arbeite jeden Tag im Krankenhaus.]', ans: 'jeden tag arbeite ich im krankenhaus', marks: 1 },
          { id: 'T15A7', text: 'Rewrite starting with "Um 12 Uhr": [Wir essen um 12 Uhr.]', ans: 'um 12 uhr essen wir', marks: 1 },
          { id: 'T15A8', text: 'Rewrite starting with "Morgen": [Ich kann morgen kommen.]', ans: 'morgen kann ich kommen', marks: 1 },
          { id: 'T15A9', text: 'Rewrite starting with "Um 5 Uhr": [Ich stehe um 5 Uhr auf.]', ans: 'um 5 uhr stehe ich auf', marks: 1 },
          { id: 'T15A10', text: 'Rewrite starting with "Nach der Arbeit": [Ich muss nach der Arbeit einkaufen.]', ans: 'nach der arbeit muss ich einkaufen', marks: 1 },
        ]
      },
      {
        title: 'Section B: Travel & Transport',
        marks: 10,
        type: 'fill',
        instructions: 'Transport, station vocabulary and directions.',
        questions: [
          { id: 'T15B1', text: 'der Zug → mit + dative:', ans: 'mit dem zug', marks: 1 },
          { id: 'T15B2', text: 'die U-Bahn → mit + dative:', ans: 'mit der u-bahn', altAns: ['mit der ubahn'], marks: 1 },
          { id: 'T15B3', text: 'das Auto → mit + dative:', ans: 'mit dem auto', marks: 1 },
          { id: 'T15B4', text: 'das Flugzeug → mit + dative:', ans: 'mit dem flugzeug', marks: 1 },
          { id: 'T15B5', text: 'departure (with article):', ans: 'die abfahrt', marks: 1 },
          { id: 'T15B6', text: 'one-way ticket:', ans: 'einfach', altAns: ['einfache fahrkarte'], marks: 1 },
          { id: 'T15B7', text: 'platform (with article):', ans: 'das gleis', marks: 1 },
          { id: 'T15B8', text: 'Turn right:', ans: 'biegen sie rechts ab', altAns: ['rechts abbiegen'], marks: 1 },
          { id: 'T15B9', text: 'Straight ahead:', ans: 'gehen sie geradeaus', altAns: ['geradeaus gehen','geradeaus'], marks: 1 },
          { id: 'T15B10', text: 'At the crossroads:', ans: 'an der kreuzung', marks: 1 },
        ]
      },
      {
        title: 'Section C: Partizip II',
        marks: 10,
        type: 'fill',
        instructions: 'Write the correct Partizip II.',
        questions: [
          { id: 'T15C1', text: 'lernen →', ans: 'gelernt', marks: 1 },
          { id: 'T15C2', text: 'essen →', ans: 'gegessen', marks: 1 },
          { id: 'T15C3', text: 'schreiben →', ans: 'geschrieben', marks: 1 },
          { id: 'T15C4', text: 'trinken →', ans: 'getrunken', marks: 1 },
          { id: 'T15C5', text: 'telefonieren → (⚠️ no ge-!)', ans: 'telefoniert', marks: 1 },
          { id: 'T15C6', text: 'gehen →', ans: 'gegangen', marks: 1 },
          { id: 'T15C7', text: 'kommen →', ans: 'gekommen', marks: 1 },
          { id: 'T15C8', text: 'fahren →', ans: 'gefahren', marks: 1 },
          { id: 'T15C9', text: 'aufstehen →', ans: 'aufgestanden', marks: 1 },
          { id: 'T15C10', text: 'fliegen →', ans: 'geflogen', marks: 1 },
        ]
      },
      {
        title: 'Section D: Perfekt — haben vs. sein',
        marks: 12,
        type: 'fill',
        instructions: 'Write the full Perfekt sentence.',
        questions: [
          { id: 'T15D1', text: 'ich / lernen / Deutsch / gestern →', ans: 'ich habe gestern deutsch gelernt', marks: 1 },
          { id: 'T15D2', text: 'er / gehen / ins Café / am Samstag →', ans: 'er ist am samstag ins café gegangen', altAns: ['er ist am samstag ins cafe gegangen'], marks: 1 },
          { id: 'T15D3', text: 'wir / essen / zusammen / Mittagessen →', ans: 'wir haben zusammen mittagessen gegessen', marks: 1 },
          { id: 'T15D4', text: 'sie (she) / kommen / aus Indien →', ans: 'sie ist aus indien gekommen', marks: 1 },
          { id: 'T15D5', text: 'ich / einkaufen / nach der Arbeit →', ans: 'ich habe nach der arbeit eingekauft', marks: 1 },
          { id: 'T15D6', text: 'du / aufstehen / um 6 Uhr →', ans: 'du bist um 6 uhr aufgestanden', marks: 1 },
          { id: 'T15D7', text: 'er / telefonieren / mit dem Arzt → (⚠️ haben, no ge-!)', ans: 'er hat mit dem arzt telefoniert', marks: 1 },
          { id: 'T15D8', text: 'wir / fahren / mit dem Zug / nach Berlin →', ans: 'wir sind mit dem zug nach berlin gefahren', marks: 1 },
          { id: 'T15D9', text: 'ich / schreiben / den Bericht →', ans: 'ich habe den bericht geschrieben', marks: 1 },
          { id: 'T15D10', text: 'du / einschlafen / früh →', ans: 'du bist früh eingeschlafen', altAns: ['du bist fruh eingeschlafen'], marks: 1 },
          { id: 'T15D11', text: 'sie (they) / bleiben / in Deutschland → (⚠️ bleiben uses sein!)', ans: 'sie sind in deutschland geblieben', marks: 1 },
          { id: 'T15D12', text: 'er / anrufen / die Ärztin →', ans: 'er hat die ärztin angerufen', altAns: ['er hat die arztin angerufen'], marks: 1 },
        ]
      },
      {
        title: 'Section E: Past Tense Story',
        marks: 8,
        type: 'fill',
        instructions: 'Write about a nurse\'s first week in Germany using Perfekt.',
        questions: [
          { id: 'T15E1', text: 'Arrival sentence — use "sein" Perfekt + a transport (mit dem Flugzeug/Zug):', ans: 'ich bin mit dem flugzeug nach deutschland geflogen', altAns: ['ich bin mit dem zug nach deutschland gefahren','ich bin mit dem flugzeug gekommen'], marks: 3 },
          { id: 'T15E2', text: 'Activity sentence — use "haben" Perfekt:', ans: 'ich habe meine kollegen kennengelernt', altAns: ['ich habe viel deutsch gesprochen','ich habe viel gelernt'], marks: 3 },
          { id: 'T15E3', text: 'Feeling sentence — use "war" (Präteritum):', ans: 'ich war sehr müde aber glücklich', altAns: ['ich war müde','es war sehr gut','ich war glücklich'], marks: 2 },
        ]
      }
    ]
  },
  // ── TESTS 16–18: CLASSES 26–30 ───────────────────────────────────────────
  {
    id: 'A1_T16',
    name: 'Test 16: ADUSO Conjunctions & Dative Case Intro',
    classes: 'Classes 26 & 28',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: ADUSO Conjunctions',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T16P1Q1', text: 'Ich bin krank, _____ ich muss arbeiten.', opts: ['aber','denn','und','sondern'], ans: 0, marks: 1 },
          { id: 'T16P1Q2', text: 'Das ist keine Tablette, _____ eine Kapsel.', opts: ['aber','denn','und','sondern'], ans: 3, marks: 1 },
          { id: 'T16P1Q3', text: 'Ich trinke Wasser, _____ ich habe Durst.', opts: ['aber','denn','und','oder'], ans: 1, marks: 1 },
          { id: 'T16P1Q4', text: 'Ich bin Krankenschwester _____ ich komme aus Indien.', opts: ['aber','denn','und','sondern'], ans: 2, marks: 1 },
          { id: 'T16P1Q5', text: 'Möchten Sie Tee _____ Wasser?', opts: ['aber','denn','und','oder'], ans: 3, marks: 1 },
          { id: 'T16P1Q6', text: 'Der Patient ist krank, _____ er ist ruhig.', opts: ['aber','denn','und','sondern'], ans: 0, marks: 1 },
          { id: 'T16P1Q7', text: 'Er ist nicht Arzt, _____ Pfleger. (after nicht/kein → ?)', opts: ['aber','denn','und','sondern'], ans: 3, marks: 1 },
          { id: 'T16P1Q8', text: 'Ich lerne Deutsch, _____ ich arbeite in Deutschland.', opts: ['aber','denn','und','sondern'], ans: 1, marks: 1 },
          { id: 'T16P1Q9', text: 'Das Medikament ist teuer, _____ es hilft sehr gut.', opts: ['aber','denn','und','sondern'], ans: 0, marks: 1 },
          { id: 'T16P1Q10', text: 'Sie spricht nicht Englisch, _____ sie spricht Deutsch.', opts: ['aber','denn','und','sondern'], ans: 3, marks: 1 },
        ]
      },
      {
        title: 'Part 2: Dative Articles',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T16P2Q1', text: 'Ich helfe ___ Arzt. (der Arzt — definite dative)', opts: ['dem','der','den','einem'], ans: 0, marks: 1 },
          { id: 'T16P2Q2', text: 'Ich gebe ___ Patientin die Tablette. (die Patientin — def. dative)', opts: ['dem','der','den','einer'], ans: 1, marks: 1 },
          { id: 'T16P2Q3', text: 'Ich danke ___ Kind. (das Kind — definite dative)', opts: ['dem','der','den','einem'], ans: 0, marks: 1 },
          { id: 'T16P2Q4', text: 'Das Buch gehört ___ Schwester. (die Schwester — def. dative)', opts: ['dem','der','den','einer'], ans: 1, marks: 1 },
          { id: 'T16P2Q5', text: 'Ich helfe ___ Pfleger. (ein Pfleger — indefinite dative)', opts: ['dem','einem','einen','der'], ans: 1, marks: 1 },
          { id: 'T16P2Q6', text: 'Er gibt ___ Patienten Wasser. (der Patient — weak noun!)', opts: ['dem','der','den','einem'], ans: 0, marks: 1 },
          { id: 'T16P2Q7', text: 'Ich erkläre ___ Ärztin die Situation. (eine Ärztin — indef.)', opts: ['dem','der','einen','einer'], ans: 3, marks: 1 },
          { id: 'T16P2Q8', text: 'Zeigen Sie ___ Kollegin den Weg. (eine Kollegin — indef.)', opts: ['dem','der','einen','einer'], ans: 3, marks: 1 },
          { id: 'T16P2Q9', text: 'Das Rezept gehört ___ Arzt. (der Arzt — definite dative)', opts: ['dem','der','den','einem'], ans: 0, marks: 1 },
          { id: 'T16P2Q10', text: 'Ich helfe ___ Familie. (eine Familie — indefinite dative)', opts: ['dem','der','einen','einer'], ans: 3, marks: 1 },
        ]
      },
      {
        title: 'Part 3: Identify NOM / ACC / DAT',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T16P3Q1', text: '"DER ARZT gibt dem Kind eine Tablette." — DER ARZT is:', opts: ['NOM','ACC','DAT'], ans: 0, marks: 1 },
          { id: 'T16P3Q2', text: '"Der Arzt gibt DEM KIND eine Tablette." — DEM KIND is:', opts: ['NOM','ACC','DAT'], ans: 2, marks: 1 },
          { id: 'T16P3Q3', text: '"Der Arzt gibt dem Kind EINE TABLETTE." — EINE TABLETTE is:', opts: ['NOM','ACC','DAT'], ans: 1, marks: 1 },
          { id: 'T16P3Q4', text: '"ICH helfe der Ärztin." — ICH is:', opts: ['NOM','ACC','DAT'], ans: 0, marks: 1 },
          { id: 'T16P3Q5', text: '"Ich helfe DER ÄRZTIN." — DER ÄRZTIN is:', opts: ['NOM','ACC','DAT'], ans: 2, marks: 1 },
          { id: 'T16P3Q6', text: '"DIE SCHWESTER zeigt dem Patienten den Weg." — DIE SCHWESTER is:', opts: ['NOM','ACC','DAT'], ans: 0, marks: 1 },
          { id: 'T16P3Q7', text: '"Die Schwester zeigt DEM PATIENTEN den Weg." — DEM PATIENTEN is:', opts: ['NOM','ACC','DAT'], ans: 2, marks: 1 },
          { id: 'T16P3Q8', text: '"Die Schwester zeigt dem Patienten DEN WEG." — DEN WEG is:', opts: ['NOM','ACC','DAT'], ans: 1, marks: 1 },
          { id: 'T16P3Q9', text: '"ICH danke dem Arzt." — ICH is:', opts: ['NOM','ACC','DAT'], ans: 0, marks: 1 },
          { id: 'T16P3Q10', text: '"Ich danke DEM ARZT." — DEM ARZT is:', opts: ['NOM','ACC','DAT'], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T17',
    name: 'Test 17: Dative Pronouns, Fixed & Two-Way Prepositions',
    classes: 'Classes 27–29',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Dative Pronouns',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T17P1Q1', text: 'Er hilft ___. (ich → dative)', opts: ['ich','mich','mir','mein'], ans: 2, marks: 1 },
          { id: 'T17P1Q2', text: 'Ich danke ___. (du → dative)', opts: ['du','dich','dir','dein'], ans: 2, marks: 1 },
          { id: 'T17P1Q3', text: 'Sie gibt ___ die Tablette. (er → dative)', opts: ['er','ihn','ihm','sein'], ans: 2, marks: 1 },
          { id: 'T17P1Q4', text: 'Ich zeige ___ den Weg. (sie/she → dative)', opts: ['sie','ihn','ihr','ihm'], ans: 2, marks: 1 },
          { id: 'T17P1Q5', text: 'Er erklärt ___ die Situation. (wir → dative)', opts: ['wir','uns','unser','euch'], ans: 1, marks: 1 },
          { id: 'T17P1Q6', text: 'Kann ich ___ helfen? (Sie formal → dative)', opts: ['Sie','Ihnen','Ihr','sich'], ans: 1, marks: 1 },
          { id: 'T17P1Q7', text: 'Ich gebe ___ das Medikament. (ihr/you all → dative)', opts: ['ihr','euch','uns','ihnen'], ans: 1, marks: 1 },
          { id: 'T17P1Q8', text: 'Sie sagt ___ die Wahrheit. (ich → dative)', opts: ['ich','mich','mir','mein'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Part 2: Fixed Dative Prepositions',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T17P2Q1', text: 'Ich fahre ___ dem Zug nach Berlin. (with)', opts: ['mit','von','bei','seit'], ans: 0, marks: 1 },
          { id: 'T17P2Q2', text: 'Ich gehe ___ Arzt. (to the — zu + dem = ?)', opts: ['zum','zur','nach','zu'], ans: 0, marks: 1 },
          { id: 'T17P2Q3', text: 'Ich komme ___ Indien. (from a country)', opts: ['von','aus','bei','nach'], ans: 1, marks: 1 },
          { id: 'T17P2Q4', text: 'Ich wohne ___ meiner Freundin. (at/with)', opts: ['mit','von','bei','seit'], ans: 2, marks: 1 },
          { id: 'T17P2Q5', text: 'Das Rezept ist ___ Arzt. (von + dem = ?)', opts: ['vom','von','aus','bei'], ans: 0, marks: 1 },
          { id: 'T17P2Q6', text: 'Ich bin ___ drei Jahren in Deutschland. (for/since)', opts: ['von','für','seit','bis'], ans: 2, marks: 1 },
          { id: 'T17P2Q7', text: 'Ich fahre ___ Berlin. (to a city — no article)', opts: ['zu','in','nach','bis'], ans: 2, marks: 1 },
          { id: 'T17P2Q8', text: 'Ich gehe ___ Apotheke. (zu + der = ?)', opts: ['zum','zur','nach','zu'], ans: 1, marks: 1 },
          { id: 'T17P2Q9', text: 'Er wohnt ___ Krankenhaus. (bei + dem = ?)', opts: ['beim','bei','vom','zum'], ans: 0, marks: 1 },
          { id: 'T17P2Q10', text: 'Ich komme gerade ___ Krankenhaus. (von + dem = ?)', opts: ['vom','von','aus','beim'], ans: 0, marks: 1 },
        ]
      },
      {
        title: 'Part 3: Two-Way Prepositions — Wo? or Wohin?',
        marks: 12,
        type: 'mcq',
        questions: [
          { id: 'T17P3Q1', text: 'Ich lege das Buch auf ___ Tisch. (Wohin? → ACC)', opts: ['dem Tisch','den Tisch','der Tisch','einem Tisch'], ans: 1, marks: 1 },
          { id: 'T17P3Q2', text: 'Das Buch liegt auf ___ Tisch. (Wo? → DAT)', opts: ['dem Tisch','den Tisch','der Tisch','einen Tisch'], ans: 0, marks: 1 },
          { id: 'T17P3Q3', text: 'Sie geht in ___ Zimmer. (Wohin? → in+das = ?)', opts: ['im Zimmer','ins Zimmer','dem Zimmer','den Zimmer'], ans: 1, marks: 1 },
          { id: 'T17P3Q4', text: 'Sie ist in ___ Zimmer. (Wo? → in+dem = ?)', opts: ['im Zimmer','ins Zimmer','das Zimmer','den Zimmer'], ans: 0, marks: 1 },
          { id: 'T17P3Q5', text: 'Hänge die Lampe über ___ Bett! (Wohin? → ACC neuter)', opts: ['dem Bett','das Bett','den Bett','einem Bett'], ans: 1, marks: 1 },
          { id: 'T17P3Q6', text: 'Die Lampe hängt über ___ Bett. (Wo? → DAT)', opts: ['dem Bett','das Bett','den Bett','ein Bett'], ans: 0, marks: 1 },
          { id: 'T17P3Q7', text: 'Stell den Stuhl neben ___ Tür. (Wohin? → ACC fem.)', opts: ['der Tür','die Tür','den Tür','einer Tür'], ans: 1, marks: 1 },
          { id: 'T17P3Q8', text: 'Der Stuhl steht neben ___ Tür. (Wo? → DAT: die→?)', opts: ['die Tür','den Tür','der Tür','das Tür'], ans: 2, marks: 1 },
          { id: 'T17P3Q9', text: 'Ich gehe an ___ Fenster. (Wohin? → an+das = ?)', opts: ['am Fenster','ans Fenster','dem Fenster','den Fenster'], ans: 1, marks: 1 },
          { id: 'T17P3Q10', text: 'Ich stehe an ___ Fenster. (Wo? → an+dem = ?)', opts: ['am Fenster','ans Fenster','das Fenster','den Fenster'], ans: 0, marks: 1 },
          { id: 'T17P3Q11', text: 'Der Patient liegt unter ___ Decke. (Wo? → DAT: die→?)', opts: ['die Decke','den Decke','der Decke','das Decke'], ans: 2, marks: 1 },
          { id: 'T17P3Q12', text: 'Leg die Decke über ___ Patienten! (Wohin? → ACC: der→?)', opts: ['dem Patienten','den Patienten','der Patienten','einem Patienten'], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T18',
    name: 'Test 18: End-of-Block Test (Classes 26–30)',
    classes: 'Classes 26–30',
    level: 'A1',
    totalMarks: 50,
    timeMinutes: 45,
    passMark: 60,
    sections: [
      {
        title: 'Section A: ADUSO Conjunctions',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T18A1', text: 'Ich bin Krankenschwester _____ ich komme aus Chennai.', opts: ['aber','denn','und','sondern'], ans: 2, marks: 1 },
          { id: 'T18A2', text: 'Das ist keine Tablette, _____ ein Antibiotikum.', opts: ['aber','denn','und','sondern'], ans: 3, marks: 1 },
          { id: 'T18A3', text: 'Er kann nicht kommen, _____ er ist krank.', opts: ['aber','denn','und','sondern'], ans: 1, marks: 1 },
          { id: 'T18A4', text: 'Möchten Sie heute _____ morgen einen Termin?', opts: ['aber','denn','und','oder'], ans: 3, marks: 1 },
          { id: 'T18A5', text: 'Das Medikament ist stark, _____ es hilft nicht.', opts: ['aber','denn','und','sondern'], ans: 0, marks: 1 },
          { id: 'T18A6', text: 'Which conjunction is used AFTER nicht/kein (correction)?', opts: ['aber','denn','und','sondern'], ans: 3, marks: 2 },
          { id: 'T18A7', text: 'Which ADUSO conjunction means "because"?', opts: ['aber','denn','und','sondern'], ans: 1, marks: 3 },
        ]
      },
      {
        title: 'Section B: Dative Articles',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T18B1', text: 'Ich helfe ___ Arzt. (der Arzt)', opts: ['dem','der','den','einem'], ans: 0, marks: 1 },
          { id: 'T18B2', text: 'Sie gibt ___ Patientin eine Tablette. (die Patientin)', opts: ['dem','der','den','einer'], ans: 1, marks: 1 },
          { id: 'T18B3', text: 'Ich danke ___ Kind. (das Kind)', opts: ['dem','der','den','einem'], ans: 0, marks: 1 },
          { id: 'T18B4', text: 'Das Buch gehört ___ Pfleger. (der Pfleger)', opts: ['dem','der','den','einem'], ans: 0, marks: 1 },
          { id: 'T18B5', text: 'Ich erkläre ___ Familie die Situation. (eine Familie)', opts: ['dem','der','einen','einer'], ans: 3, marks: 1 },
          { id: 'T18B6', text: 'Er zeigt ___ Patienten den Weg. (ein Patient — indefinite)', opts: ['dem','der','einen','einem'], ans: 3, marks: 1 },
          { id: 'T18B7', text: 'Ich helfe ___ Ärztin. (die Ärztin)', opts: ['dem','der','den','einer'], ans: 1, marks: 1 },
          { id: 'T18B8', text: 'Das gehört ___ Krankenschwestern. (plural — ⚠️ +n!)', opts: ['der','den','die','dem'], ans: 1, marks: 1 },
          { id: 'T18B9', text: 'Ich gebe ___ Mann die Tablette. (ein Mann)', opts: ['dem','der','einen','einem'], ans: 3, marks: 1 },
          { id: 'T18B10', text: 'Er dankt ___ Kollegin. (die Kollegin)', opts: ['dem','der','den','einer'], ans: 1, marks: 1 },
        ]
      },
      {
        title: 'Section C: Dative Pronouns & Prepositions',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T18C1', text: 'Ich helfe ___. (ich → dative)', opts: ['mich','mir','mein','ich'], ans: 1, marks: 1 },
          { id: 'T18C2', text: 'Sie dankt ___. (du → dative)', opts: ['dich','dir','dein','du'], ans: 1, marks: 1 },
          { id: 'T18C3', text: 'Er gibt ___ Wasser. (sie/she → dative)', opts: ['sie','ihr','ihn','ihm'], ans: 1, marks: 1 },
          { id: 'T18C4', text: 'Kann ich ___ helfen? (Sie formal → dative)', opts: ['Sie','Ihnen','Ihr','sich'], ans: 1, marks: 1 },
          { id: 'T18C5', text: 'Ich fahre ___ Zug. (with the)', opts: ['mit der','mit dem','mit das','bei dem'], ans: 1, marks: 1 },
          { id: 'T18C6', text: 'Ich gehe ___ Arzt. (zu + dem = ?)', opts: ['zu dem','zum','zur','nach dem'], ans: 1, marks: 1 },
          { id: 'T18C7', text: 'Ich komme ___ Indien. (from a country)', opts: ['von','bei','aus','seit'], ans: 2, marks: 1 },
          { id: 'T18C8', text: 'Ich bin ___ zwei Jahren in Deutschland.', opts: ['von','für','bei','seit'], ans: 3, marks: 1 },
          { id: 'T18C9', text: 'Das ist ___ Arzt. (von + dem = ?)', opts: ['von dem','vom','von der','aus dem'], ans: 1, marks: 1 },
          { id: 'T18C10', text: 'Ich gehe ___ Apotheke. (zu + der = ?)', opts: ['zum','zur','nach der','zu der'], ans: 1, marks: 1 },
        ]
      },
      {
        title: 'Section D: Two-Way Prepositions',
        marks: 12,
        type: 'mcq',
        questions: [
          { id: 'T18D1', text: 'Ich lege das Buch auf ___ Tisch. (Wohin? → ACC)', opts: ['dem Tisch','den Tisch','der Tisch','ein Tisch'], ans: 1, marks: 1 },
          { id: 'T18D2', text: 'Das Buch liegt auf ___ Tisch. (Wo? → DAT)', opts: ['dem Tisch','den Tisch','der Tisch','ein Tisch'], ans: 0, marks: 1 },
          { id: 'T18D3', text: 'Ich gehe ___ Krankenhaus. (Wohin? → in+das = ?)', opts: ['im Krankenhaus','ins Krankenhaus','dem Krankenhaus','den Krankenhaus'], ans: 1, marks: 1 },
          { id: 'T18D4', text: 'Ich bin ___ Krankenhaus. (Wo? → in+dem = ?)', opts: ['im Krankenhaus','ins Krankenhaus','das Krankenhaus','den Krankenhaus'], ans: 0, marks: 1 },
          { id: 'T18D5', text: 'Ich hänge die Lampe über ___ Bett. (Wohin? → ACC neuter)', opts: ['dem Bett','das Bett','den Bett','ein Bett'], ans: 1, marks: 1 },
          { id: 'T18D6', text: 'Die Lampe hängt über ___ Bett. (Wo? → DAT)', opts: ['dem Bett','das Bett','den Bett','ein Bett'], ans: 0, marks: 1 },
          { id: 'T18D7', text: 'Stell den Stuhl neben ___ Tür. (Wohin? → ACC fem.)', opts: ['der Tür','die Tür','den Tür','einer Tür'], ans: 1, marks: 1 },
          { id: 'T18D8', text: 'Der Stuhl steht neben ___ Tür. (Wo? → DAT)', opts: ['die Tür','den Tür','der Tür','das Tür'], ans: 2, marks: 1 },
          { id: 'T18D9', text: 'Wir fahren in ___ Stadt. (Wohin? → ACC fem.)', opts: ['der Stadt','die Stadt','den Stadt','einer Stadt'], ans: 1, marks: 1 },
          { id: 'T18D10', text: 'Wir sind in ___ Stadt. (Wo? → DAT)', opts: ['die Stadt','den Stadt','der Stadt','das Stadt'], ans: 2, marks: 1 },
          { id: 'T18D11', text: 'Leg das Tablet auf ___ Bett. (Wohin? → ACC neuter)', opts: ['dem Bett','das Bett','den Bett','ein Bett'], ans: 1, marks: 1 },
          { id: 'T18D12', text: 'Das Tablet liegt auf ___ Bett. (Wo? → DAT)', opts: ['dem Bett','das Bett','den Bett','ein Bett'], ans: 0, marks: 1 },
        ]
      },
      {
        title: 'Section E: Free Production',
        marks: 8,
        type: 'fill',
        instructions: 'Write sentences describing a nurse with a patient using Days 26–30 grammar.',
        questions: [
          { id: 'T18E1', text: 'Sentence with a dative verb (helfen/geben/danken) + dative article:', ans: 'ich helfe dem patienten', altAns: ['ich gebe der patientin die tablette','ich danke dem arzt','ich helfe den patienten'], marks: 3 },
          { id: 'T18E2', text: 'Sentence with an ADUSO conjunction (aber/denn/und/sondern/oder):', ans: 'ich spreche langsam denn der patient versteht nicht gut deutsch', altAns: ['ich arbeite und ich helfe','das ist kein schmerzmittel sondern ein antibiotikum'], marks: 3 },
          { id: 'T18E3', text: 'Sentence with a two-way preposition (in/auf/an/neben/über):', ans: 'ich gehe ins zimmer', altAns: ['ich lege die medizin auf den tisch','ich bin im krankenhaus','ich arbeite im krankenhaus'], marks: 2 },
        ]
      }
    ]
  },

  // ── TESTS 19–21: CLASSES 31–35 ───────────────────────────────────────────
  {
    id: 'A1_T19',
    name: 'Test 19: Body & Health & Doctor Roleplay',
    classes: 'Classes 31–32',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Body Parts with Article',
        marks: 10,
        type: 'fill',
        instructions: 'Write the German word WITH article.',
        questions: [
          { id: 'T19P1Q1', text: 'head', ans: 'der kopf', marks: 1 },
          { id: 'T19P1Q2', text: 'back', ans: 'der rücken', altAns: ['der rucken'], marks: 1 },
          { id: 'T19P1Q3', text: 'eye', ans: 'das auge', marks: 1 },
          { id: 'T19P1Q4', text: 'stomach', ans: 'der bauch', marks: 1 },
          { id: 'T19P1Q5', text: 'nose', ans: 'die nase', marks: 1 },
          { id: 'T19P1Q6', text: 'throat', ans: 'der hals', marks: 1 },
          { id: 'T19P1Q7', text: 'shoulder', ans: 'die schulter', marks: 1 },
          { id: 'T19P1Q8', text: 'knee', ans: 'das knie', marks: 1 },
          { id: 'T19P1Q9', text: 'heart', ans: 'das herz', marks: 1 },
          { id: 'T19P1Q10', text: 'lung', ans: 'die lunge', marks: 1 },
        ]
      },
      {
        title: 'Part 2: tut weh / tun weh',
        marks: 5,
        type: 'mcq',
        questions: [
          { id: 'T19P2Q1', text: 'Mein Kopf _____ weh.', opts: ['tut','tun'], ans: 0, marks: 1 },
          { id: 'T19P2Q2', text: 'Meine Beine _____ weh.', opts: ['tut','tun'], ans: 1, marks: 1 },
          { id: 'T19P2Q3', text: 'Mein Rücken _____ weh.', opts: ['tut','tun'], ans: 0, marks: 1 },
          { id: 'T19P2Q4', text: 'Meine Augen _____ weh.', opts: ['tut','tun'], ans: 1, marks: 1 },
          { id: 'T19P2Q5', text: 'Meine Brust _____ weh.', opts: ['tut','tun'], ans: 0, marks: 1 },
        ]
      },
      {
        title: 'Part 3A: Symptoms',
        marks: 5,
        type: 'fill',
        instructions: 'Write the German symptom word.',
        questions: [
          { id: 'T19P3Q1', text: 'fever', ans: 'fieber', altAns: ['das fieber'], marks: 1 },
          { id: 'T19P3Q2', text: 'cough', ans: 'husten', altAns: ['der husten'], marks: 1 },
          { id: 'T19P3Q3', text: 'runny nose', ans: 'schnupfen', altAns: ['der schnupfen'], marks: 1 },
          { id: 'T19P3Q4', text: 'dizziness', ans: 'schwindel', altAns: ['der schwindel'], marks: 1 },
          { id: 'T19P3Q5', text: 'allergy', ans: 'allergie', altAns: ['die allergie'], marks: 1 },
        ]
      },
      {
        title: 'Part 3B: Modal Verbs — Medical Advice',
        marks: 5,
        type: 'mcq',
        questions: [
          { id: 'T19P3BQ1', text: 'Sie _____ viel Wasser trinken. (should)', opts: ['müssen','sollen','dürfen','können'], ans: 1, marks: 1 },
          { id: 'T19P3BQ2', text: 'Sie _____ im Bett bleiben. (must)', opts: ['sollen','dürfen','müssen','können'], ans: 2, marks: 1 },
          { id: 'T19P3BQ3', text: 'Sie _____ keinen Sport treiben. (may not)', opts: ['müssen','sollen','können','dürfen'], ans: 3, marks: 1 },
          { id: 'T19P3BQ4', text: 'Sie _____ Ibuprofen nehmen. (can)', opts: ['sollen','dürfen','müssen','können'], ans: 3, marks: 1 },
          { id: 'T19P3BQ5', text: 'Imperativ: _____ Sie viel Wasser! (trinken)', opts: ['Trinkt','Trinkst','Trinken','Trink'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Part 4: Patient-Doctor Dialogue',
        marks: 5,
        type: 'fill',
        instructions: 'Complete the patient side of the dialogue.',
        questions: [
          { id: 'T19P4Q1', text: 'Doctor: "Was fehlt Ihnen?" — Answer with 2 symptoms:', ans: 'ich habe fieber und mein kopf tut weh', altAns: ['ich habe husten und schnupfen','ich habe fieber und husten'], marks: 2 },
          { id: 'T19P4Q2', text: 'Doctor: "Seit wann haben Sie die Beschwerden?" — Answer:', ans: 'seit gestern', altAns: ['seit zwei tagen','seit 2 tagen','seit einer woche'], marks: 2 },
          { id: 'T19P4Q3', text: 'Doctor gives advice — Thank the doctor:', ans: 'vielen dank herr doktor', altAns: ['vielen dank frau doktor','danke schön','vielen dank'], marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T20',
    name: 'Test 20: Formal Writing — Krankmeldung',
    classes: 'Class 33',
    level: 'A1',
    totalMarks: 25,
    timeMinutes: 20,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Formal or Informal?',
        marks: 6,
        type: 'mcq',
        questions: [
          { id: 'T20P1Q1', text: '"Sehr geehrte Frau Weber," is:', opts: ['Formal','Informal'], ans: 0, marks: 1 },
          { id: 'T20P1Q2', text: '"Lieber Thomas," is:', opts: ['Formal','Informal'], ans: 1, marks: 1 },
          { id: 'T20P1Q3', text: '"Mit freundlichen Grüßen" is:', opts: ['Formal closing','Informal closing'], ans: 0, marks: 1 },
          { id: 'T20P1Q4', text: '"Viele Grüße" is:', opts: ['Formal closing','Informal closing'], ans: 1, marks: 1 },
          { id: 'T20P1Q5', text: '"Sehr geehrte Damen und Herren," is used when:', opts: ['Writing to a person you know','Writing to an unknown company/group'], ans: 1, marks: 1 },
          { id: 'T20P1Q6', text: 'The formal opposite of "Viele Grüße" is:', opts: ['Liebe Grüße','Mit freundlichen Grüßen','Tschüss','Bis bald'], ans: 1, marks: 1 },
        ]
      },
      {
        title: 'Part 2: Letter Components — Correct Order',
        marks: 4,
        type: 'mcq',
        questions: [
          { id: 'T20P2Q1', text: 'In a German formal letter, what comes FIRST (position 1)?', opts: ['Anrede (salutation)','Datum (date)','Absender (sender address)','Empfänger (recipient)'], ans: 2, marks: 1 },
          { id: 'T20P2Q2', text: 'What comes at position 2?', opts: ['Inhalt (content)','Empfänger (recipient)','Schluss (closing)','Betreff (subject)'], ans: 1, marks: 1 },
          { id: 'T20P2Q3', text: '"Betreff:" means:', opts: ['Greeting','Subject line','Closing','Signature'], ans: 1, marks: 1 },
          { id: 'T20P2Q4', text: 'What comes LAST (position 8)?', opts: ['Anrede','Datum','Unterschrift (signature)','Betreff'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Part 3: Write a Sick Note (Krankmeldung)',
        marks: 15,
        type: 'fill',
        instructions: 'Build a formal sick note to your supervisor, line by line.',
        questions: [
          { id: 'T20P3Q1', text: 'Write the date line for Munich, 20 June 2025:', ans: 'münchen 20 juni 2025', altAns: ['münchen den 20 juni 2025','munchen 20 juni 2025','münchen 20.06.2025'], marks: 2 },
          { id: 'T20P3Q2', text: 'Formal salutation to "Frau Dr. Weber":', ans: 'sehr geehrte frau dr weber', altAns: ['sehr geehrte frau doktor weber','sehr geehrte frau weber'], marks: 2 },
          { id: 'T20P3Q3', text: 'Write: "I cannot come to work today because I am sick."', ans: 'ich kann heute nicht zur arbeit kommen da ich krank bin', altAns: ['ich kann heute leider nicht zur arbeit kommen denn ich bin krank','ich kann heute nicht arbeiten denn ich bin krank'], marks: 4 },
          { id: 'T20P3Q4', text: 'Write ONE symptom sentence (min. 2 symptoms):', ans: 'ich habe fieber und mein hals tut weh', altAns: ['ich habe husten und schnupfen','ich habe hohes fieber und husten'], marks: 3 },
          { id: 'T20P3Q5', text: 'Write: "I hope to be able to work again tomorrow."', ans: 'ich hoffe morgen wieder arbeiten zu können', altAns: ['ich hoffe morgen wieder arbeiten zu konnen','ich komme hoffentlich morgen wieder'], marks: 2 },
          { id: 'T20P3Q6', text: 'Write the formal closing:', ans: 'mit freundlichen grüßen', altAns: ['mit freundlichen grüssen','mit freundlichen grussen'], marks: 2 },
        ]
      }
    ]
  },
  {
    id: 'A1_T21',
    name: 'Test 21: End-of-Block Test (Classes 31–35)',
    classes: 'Classes 31–35',
    level: 'A1',
    totalMarks: 50,
    timeMinutes: 45,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Body & Health',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T21A1', text: 'Article for Kopf (head):', opts: ['der','die','das'], ans: 0, marks: 1 },
          { id: 'T21A2', text: 'Article for Rücken (back):', opts: ['der','die','das'], ans: 0, marks: 1 },
          { id: 'T21A3', text: 'Article for Brust (chest):', opts: ['der','die','das'], ans: 1, marks: 1 },
          { id: 'T21A4', text: 'Article for Lunge (lung):', opts: ['der','die','das'], ans: 1, marks: 1 },
          { id: 'T21A5', text: 'Article for Knie (knee):', opts: ['der','die','das'], ans: 2, marks: 1 },
          { id: 'T21A6', text: 'Mein Kopf _____ weh.', opts: ['tut','tun'], ans: 0, marks: 1 },
          { id: 'T21A7', text: 'Meine Beine _____ weh.', opts: ['tut','tun'], ans: 1, marks: 1 },
          { id: 'T21A8', text: 'Meine Brust _____ weh.', opts: ['tut','tun'], ans: 0, marks: 1 },
          { id: 'T21A9', text: 'German word for "fever":', opts: ['Husten','Fieber','Schwindel','Allergie'], ans: 1, marks: 1 },
          { id: 'T21A10', text: 'German word for "dizziness":', opts: ['Schnupfen','Fieber','Schwindel','Husten'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Section B: Doctor Roleplay Language',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T21B1', text: '"What is the matter with you?" in German:', opts: ['Was haben Sie?','Was fehlt Ihnen?','Wie geht es Ihnen?','Was ist passiert?'], ans: 1, marks: 1 },
          { id: 'T21B2', text: '"Since when do you have the symptoms?" in German:', opts: ['Wann haben Sie Schmerzen?','Wie lange schlafen Sie?','Seit wann haben Sie die Beschwerden?','Was fehlt Ihnen?'], ans: 2, marks: 1 },
          { id: 'T21B3', text: '"You should rest." in German:', opts: ['Sie müssen sich ausruhen.','Sie dürfen sich ausruhen.','Sie sollen sich ausruhen.','Sie können sich ausruhen.'], ans: 2, marks: 1 },
          { id: 'T21B4', text: '"You must not eat." (before operation):', opts: ['Sie sollen nicht essen.','Sie dürfen nicht essen.','Sie müssen nicht essen.','Sie können nicht essen.'], ans: 1, marks: 1 },
          { id: 'T21B5', text: '"Take these tablets three times daily!" (Imperativ):', opts: ['Nimmt diese Tabletten dreimal täglich!','Nehmt diese Tabletten dreimal täglich!','Nehmen Sie diese Tabletten dreimal täglich!','Trinken Sie diese Tabletten dreimal täglich!'], ans: 2, marks: 1 },
          { id: 'T21B6', text: 'Patient has a cold. Which advice is correct?', opts: ['Sie dürfen viel Sport treiben.','Sie müssen viel arbeiten.','Sie sollen viel Wasser trinken.','Sie dürfen sofort arbeiten.'], ans: 2, marks: 1 },
          { id: 'T21B7', text: '"Sie müssen zu Hause bleiben." means:', opts: ['You should go to hospital.','You must stay at home.','You may not rest.','You can go outside.'], ans: 1, marks: 1 },
          { id: 'T21B8', text: '"Nehmen Sie Aspirin!" is:', opts: ['A question','A statement','A command (Imperativ)','A greeting'], ans: 2, marks: 1 },
          { id: 'T21B9', text: '"Seit gestern." answers which question?', opts: ['Was fehlt Ihnen?','Wie geht es Ihnen?','Seit wann haben Sie die Beschwerden?','Wie heißen Sie?'], ans: 2, marks: 1 },
          { id: 'T21B10', text: '"Vielen Dank, Herr Doktor!" is:', opts: ['A greeting','A farewell','An expression of thanks','A question'], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Section C: Formal Writing',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T21C1', text: 'Formal salutation to "Herr Doktor Schmidt":', opts: ['Lieber Herr Schmidt,','Sehr geehrter Herr Doktor Schmidt,','Hallo Dr. Schmidt,','Guten Tag Schmidt,'], ans: 1, marks: 2 },
          { id: 'T21C2', text: 'Formal salutation to an unknown company:', opts: ['Liebe alle,','Hallo zusammen,','Sehr geehrte Damen und Herren,','Guten Tag,'], ans: 2, marks: 2 },
          { id: 'T21C3', text: 'Correct formal closing:', opts: ['Liebe Grüße','Viele Grüße','Mit freundlichen Grüßen','Tschüss'], ans: 2, marks: 1 },
          { id: 'T21C4', text: '"Leider kann ich nicht kommen" means:', opts: ['Unfortunately I cannot come.','I can come later.','I would like to come.','When can I come?'], ans: 0, marks: 1 },
          { id: 'T21C5', text: 'Best way to decline an invitation politely:', opts: ['Ich will nicht kommen.','Leider kann ich nicht kommen, denn ich muss arbeiten.','Ich komme nicht.','Nein.'], ans: 1, marks: 2 },
          { id: 'T21C6', text: '"Es tut mir leid." means:', opts: ['It is good.','I am sorry.','Thank you.','You are welcome.'], ans: 1, marks: 2 },
        ]
      },
      {
        title: 'Section D: Goethe A1 Exam Knowledge',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T21D1', text: 'The Goethe A1 exam has how many modules?', opts: ['2','3','4','5'], ans: 2, marks: 1 },
          { id: 'T21D2', text: 'Module 1 of the Goethe A1 exam is:', opts: ['Lesen','Schreiben','Sprechen','Hören'], ans: 3, marks: 1 },
          { id: 'T21D3', text: 'Module 3 of the Goethe A1 exam is:', opts: ['Hören','Lesen','Schreiben','Sprechen'], ans: 2, marks: 1 },
          { id: 'T21D4', text: 'Each Goethe A1 module is worth how many points?', opts: ['10','20','25','30'], ans: 2, marks: 1 },
          { id: 'T21D5', text: 'TRUE or FALSE: Read questions BEFORE the audio starts.', opts: ['TRUE — good strategy','FALSE — wait for the audio'], ans: 0, marks: 1 },
          { id: 'T21D6', text: 'TRUE or FALSE: Leave blanks if unsure — negative marking applies.', opts: ['TRUE','FALSE — no negative marking, always answer!'], ans: 1, marks: 1 },
          { id: 'T21D7', text: 'TRUE or FALSE: In True/False reading, if the text does NOT mention it → FALSCH.', opts: ['TRUE','FALSE'], ans: 0, marks: 1 },
          { id: 'T21D8', text: 'TRUE or FALSE: In speaking, one-word answers are acceptable.', opts: ['TRUE','FALSE — full sentences required!'], ans: 1, marks: 1 },
          { id: 'T21D9', text: 'A good self-introduction includes:', opts: ['Only your name','Only your job','Name, age, origin and profession','Name and salary'], ans: 2, marks: 1 },
          { id: 'T21D10', text: '"Ich bin 28 Jahre alt." is used in:', opts: ['Self-introduction','Asking directions','Ordering food','Shopping'], ans: 0, marks: 1 },
        ]
      },
      {
        title: 'Section E: Write a Formal Letter',
        marks: 10,
        type: 'fill',
        instructions: 'Build a formal letter to a German doctor\'s office, line by line.',
        questions: [
          { id: 'T21E1', text: 'Date line for Munich, 20 June 2025:', ans: 'münchen 20 juni 2025', altAns: ['münchen den 20 juni 2025','munchen 20 juni 2025'], marks: 1 },
          { id: 'T21E2', text: 'Formal salutation to an unknown doctor\'s office:', ans: 'sehr geehrte damen und herren', marks: 2 },
          { id: 'T21E3', text: 'Write: "I am writing because I have been sick for several days."', ans: 'ich schreibe ihnen da ich leider seit einigen tagen krank bin', altAns: ['ich schreibe ihnen weil ich krank bin','ich bin seit einigen tagen krank'], marks: 2 },
          { id: 'T21E4', text: 'Write ONE symptom sentence (min. 2 symptoms):', ans: 'ich habe fieber und mein hals tut weh', altAns: ['ich habe husten und schnupfen','ich habe fieber und husten'], marks: 2 },
          { id: 'T21E5', text: 'Write: "Can you please give me an appointment as soon as possible?"', ans: 'können sie mir bitte so bald wie möglich einen termin geben', altAns: ['können sie mir bitte einen termin geben','ich brauche bitte einen termin'], marks: 2 },
          { id: 'T21E6', text: 'Write the formal closing:', ans: 'mit freundlichen grüßen', altAns: ['mit freundlichen grüssen','mit freundlichen grussen'], marks: 1 },
        ]
      }
    ]
  }
]

function checkAnswer(q, userAns) {
  const clean = (s) => s.toString().toLowerCase().trim()
    .replace(/[!?.,-]/g, '').replace(/\s+/g, ' ')
  const ua = clean(userAns)
  const ca = clean(q.ans)
  if (ua === ca) return true
  if (q.altAns) return q.altAns.some(a => clean(a) === ua)
  return false
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DailyTestPage({ user, onTestComplete }) {
  const [phase, setPhase] = useState('list')      // list | intro | test | result
  const [selTest, setSelTest] = useState(null)
  const [sectionIdx, setSectionIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [allAnswers, setAllAnswers] = useState({}) // {q_id: userAnswer}
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [fillVal, setFillVal] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [myHistory, setMyHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const startTimeRef = useRef(null)
  const inputRef = useRef(null)

  // Load history
  useEffect(() => {
    if (user?.rollNumber) loadHistory()
  }, [user])

  async function loadHistory() {
    const { data } = await sb.from('daily_test_submissions')
      .select('*').eq('roll_number', user.rollNumber)
      .order('submitted_at', { ascending: false })
    if (data) setMyHistory(data)
  }

  // Flatten all questions for the current test
  const allQs = selTest ? selTest.sections.flatMap(s =>
    s.questions.map(q => ({ ...q, sectionTitle: s.title, sectionType: s.type }))
  ) : []
  const totalQs = allQs.length
  const curQ = allQs[qIdx]

  function startTest(test) {
    setSelTest(test)
    setSectionIdx(0); setQIdx(0)
    setAllAnswers({}); setSelectedOpt(null); setFillVal('')
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('test')
    trackEvent(user?.rollNumber, 'daily_test_start', 'daily_test', test.id, test.level)
  }

  function handleSelect(optIdx) {
    setSelectedOpt(optIdx)
  }

  function goNext() {
    // Save answer — must match the same isMCQ logic used for rendering
    const qType = curQ.type || curQ.sectionType || 'fill'
    const curIsMCQ = qType === 'mcq' && Array.isArray(curQ.opts) && curQ.opts.length > 0
    const ans = curIsMCQ
      ? (selectedOpt !== null ? curQ.opts[selectedOpt] : '')
      : fillVal

    setAllAnswers(prev => ({ ...prev, [curQ.id]: ans }))

    if (qIdx + 1 < totalQs) {
      setQIdx(q => q + 1)
      setSelectedOpt(null); setFillVal('')
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // All done — evaluate
      const finalAnswers = { ...allAnswers, [curQ.id]: ans }
      evaluateAndSubmit(finalAnswers)
    }
  }

  async function evaluateAndSubmit(answersMap) {
    setSubmitting(true)
    const timeSec = Math.round((Date.now() - startTimeRef.current) / 1000)
    let score = 0
    const details = []
    let saveError = null

    try {
      allQs.forEach(q => {
        const userAns = answersMap[q.id] || ''
        // Determine if this is MCQ or fill — per-question type takes priority over section type
        const qType = q.type || q.sectionType || 'fill'
        const isMCQq = qType === 'mcq' && Array.isArray(q.opts) && q.opts.length > 0 && typeof q.ans === 'number'
        let isCorrect = false
        let correctAnsDisplay = ''

        if (isMCQq) {
          // MCQ: compare selected option text (case-insensitive)
          isCorrect = userAns.toLowerCase().trim() === (q.opts[q.ans] || '').toLowerCase().trim()
          correctAnsDisplay = q.opts[q.ans]
        } else {
          // Fill: use checkAnswer (already case-insensitive)
          isCorrect = checkAnswer(q, userAns)
          correctAnsDisplay = q.ans
        }

        const earned = isCorrect ? q.marks : 0
        score += earned
        details.push({
          q_id: q.id,
          q_text: q.text,
          answer: userAns,
          correct: isCorrect,
          marks_earned: earned,
          marks_total: q.marks,
          correct_ans: correctAnsDisplay
        })
      })
    } catch (e) {
      console.error('Scoring exception:', e)
      saveError = 'Scoring error: ' + (e.message || 'unknown')
    }

    const pct = selTest.totalMarks ? Math.round((score / selTest.totalMarks) * 100) : 0
    const passed = pct >= selTest.passMark

    try {
      const { error } = await sb.from('daily_test_submissions').insert({
        roll_number: user.rollNumber,
        test_id: selTest.id,
        test_name: selTest.name,
        level: selTest.level,
        score,
        total_marks: selTest.totalMarks,
        percentage: pct,
        answers: details,
        time_taken_sec: timeSec,
      })
      if (error) { console.error('Submit error:', error.message); saveError = error.message }
    } catch (e) { console.error('Submit exception:', e); saveError = e.message || 'Network error' }

    trackEvent(user?.rollNumber, 'daily_test_complete', 'daily_test', selTest.id, selTest.level, score)
    setResult({ score, pct, passed, details, timeSec, test: selTest, saveError })
    setSubmitting(false)
    setPhase('result')
    loadHistory()
    // Trigger level-up check in parent — only if save succeeded
    if (!saveError && onTestComplete) onTestComplete()
  }

  // ── LIST VIEW ──
  if (phase === 'list') {
    const attempted = (tid) => myHistory.filter(h => h.test_id === tid)
    const bestScore = (tid) => {
      const h = attempted(tid)
      return h.length ? Math.max(...h.map(s => s.score)) : null
    }

    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>📝 Daily Tests</h2>
        <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>A1 Level · Classes 1–35 · 21 tests · Auto-graded instantly</p>

        {/* My history toggle */}
        {myHistory.length > 0 && (
          <div style={{ background: C.blueL, borderRadius: 10, padding: '10px 13px', marginBottom: 12, cursor: 'pointer', border: `1px solid ${C.blue}33` }}
            onClick={() => setShowHistory(h => !h)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: C.blue, fontSize: 12 }}>📊 My Test History ({myHistory.length} attempts)</span>
              <span style={{ color: C.blue, fontSize: 11 }}>{showHistory ? '▲' : '▼'}</span>
            </div>
            {showHistory && (
              <div style={{ marginTop: 10 }}>
                {myHistory.slice(0, 10).map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < myHistory.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 11 }}>
                    <span style={{ color: C.navy, fontWeight: 600 }}>{h.test_name?.split(':')[0]}</span>
                    <span style={{ color: h.percentage >= 60 ? C.green : C.red, fontWeight: 700 }}>{h.score}/{h.total_marks} ({h.percentage}%)</span>
                    <span style={{ color: C.textS }}>{new Date(h.submitted_at).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Test cards */}
        {TESTS.map(test => {
          const attempts = attempted(test.id)
          const best = bestScore(test.id)
          const bestPct = best !== null ? Math.round((best / test.totalMarks) * 100) : null
          const passed = bestPct !== null && bestPct >= test.passMark

          return (
            <div key={test.id} style={{ background: '#fff', borderRadius: 14, border: `2px solid ${passed ? C.green : C.border}`, padding: '15px', marginBottom: 10, boxShadow: C.sh }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{test.name}</div>
                  <div style={{ fontSize: 10, color: C.textS }}>{test.classes} · {test.totalMarks} marks · {test.timeMinutes} min</div>
                </div>
                {passed && <span style={{ fontSize: 18 }}>✅</span>}
              </div>

              {/* Sections preview */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {test.sections.map((s, i) => (
                  <span key={i} style={{ background: C.surfAlt, color: C.textS, fontSize: 9, padding: '2px 7px', borderRadius: 8, fontWeight: 500 }}>
                    {s.title.split(':')[0]} ({s.marks}m)
                  </span>
                ))}
              </div>

              {/* Stats */}
              {attempts.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, background: passed ? C.greenL : C.amberL, borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: passed ? C.green : C.amber }}>{best}/{test.totalMarks}</div>
                    <div style={{ fontSize: 9, color: C.textS }}>Best Score</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: passed ? C.green : C.amber }}>{bestPct}%</div>
                    <div style={{ fontSize: 9, color: C.textS }}>Best %</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{attempts.length}</div>
                    <div style={{ fontSize: 9, color: C.textS }}>Attempts</div>
                  </div>
                </div>
              )}

              <Btn label={attempts.length > 0 ? '🔄 Retake Test' : '▶ Start Test'}
                onClick={() => startTest(test)} variant={passed ? 'outline' : 'primary'} style={{ width: '100%' }} />
            </div>
          )
        })}

        <div style={{ background: C.amberL, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: '10px 13px', marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, marginBottom: 4 }}>📌 Instructions</div>
          <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
            • Answer <strong>all questions</strong> before submitting<br />
            • For fill-in questions, write in <strong>German</strong><br />
            • Your score is saved to your profile automatically<br />
            • Pass mark is <strong>60%</strong> for all tests · You can retake anytime
          </div>
        </div>
      </div>
    )
  }

  // ── TEST VIEW ──
  if (phase === 'test') {
    const progress = ((qIdx) / totalQs) * 100
    const sType = curQ?.type || curQ?.sectionType || 'fill'
    const isMCQ = sType === 'mcq' && Array.isArray(curQ?.opts) && curQ.opts.length > 0
    const isFill = !isMCQ

    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <button onClick={() => { if (window.confirm('Quit test? Your progress will be lost.')) setPhase('list') }}
            style={{ background: 'none', border: 'none', color: C.textS, fontSize: 11, cursor: 'pointer' }}>✕ Quit</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{selTest?.name?.split(':')[0]}</div>
            <div style={{ fontSize: 10, color: C.textS }}>Q{qIdx + 1} of {totalQs}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>{Math.round(progress)}%</div>
        </div>

        <PBar pct={progress} h={5} style={{ marginBottom: 12 }} />

        {/* Section label */}
        <div style={{ background: C.blueL, borderRadius: 8, padding: '5px 10px', marginBottom: 10, fontSize: 10, color: C.blue, fontWeight: 600 }}>
          {curQ?.sectionTitle}
        </div>

        {/* Question card */}
        <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px', marginBottom: 12, boxShadow: C.sh }}>
          <div style={{ fontSize: 10, color: C.textS, marginBottom: 6 }}>
            Question {qIdx + 1} · {curQ?.marks} mark{curQ?.marks > 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.6, marginBottom: 14 }}>
            {curQ?.text}
          </div>

          {/* MCQ options */}
          {isMCQ && curQ.opts && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {curQ.opts.map((opt, i) => (
                <div key={i} onClick={() => handleSelect(i)}
                  style={{ padding: '11px 13px', borderRadius: 9, border: `2px solid ${selectedOpt === i ? C.blue : C.border}`, background: selectedOpt === i ? C.blueL : '#fff', cursor: 'pointer', fontSize: 12, color: selectedOpt === i ? C.blue : C.text, fontWeight: selectedOpt === i ? 600 : 400, display: 'flex', alignItems: 'center', gap: 9, transition: 'all .12s' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: selectedOpt === i ? C.blue : C.border, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* Fill input */}
          {isFill && (
            <div>
              <input ref={inputRef} value={fillVal} onChange={e => setFillVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && fillVal.trim()) goNext() }}
                placeholder="Type your answer in German..."
                style={{ width: '100%', padding: '12px 14px', borderRadius: 9, border: `2px solid ${fillVal ? C.blue : C.border}`, fontSize: 13, fontFamily: 'inherit', color: C.text, outline: 'none', boxSizing: 'border-box', background: fillVal ? C.blueL : '#fff' }}
                autoFocus />
              <div style={{ fontSize: 10, color: C.textS, marginTop: 5 }}>Press Enter or tap Next to continue</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setAllAnswers(prev => ({ ...prev, [curQ.id]: '' })); setSelectedOpt(null); setFillVal(''); goNext() }}
            style={{ padding: '11px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.textS, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            Skip
          </button>
          <Btn
            label={qIdx + 1 === totalQs ? `Submit Test ✓` : `Next →`}
            onClick={goNext}
            disabled={isMCQ ? selectedOpt === null : !fillVal.trim()}
            variant="primary"
            style={{ flex: 1, padding: '12px' }}
          />
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 12, justifyContent: 'center' }}>
          {allQs.map((q, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < qIdx ? C.green : i === qIdx ? C.blue : C.border }} />
          ))}
        </div>
      </div>
    )
  }

  // ── SUBMITTING ──
  if (submitting) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Spin sz={34} />
      <div style={{ color: C.navy, fontSize: 13, fontWeight: 600 }}>Grading your answers...</div>
      <div style={{ color: C.textS, fontSize: 11 }}>Saving to your profile</div>
    </div>
  )

  // ── RESULT VIEW ──
  if (phase === 'result' && result) {
    const { score, pct, passed, details, timeSec, test, saveError } = result
    const correct = details.filter(d => d.correct).length
    const wrong = details.filter(d => !d.correct).length
    const mins = Math.floor(timeSec / 60), secs = timeSec % 60

    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        {saveError && (
          <div style={{ background: C.redL, border: `1.5px solid ${C.red}`, borderRadius: 10, padding: '11px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 3 }}>⚠️ Score not saved to server</div>
            <div style={{ fontSize: 10, color: C.textM }}>Your result may not appear in Performance. Error: {saveError}. Please check your internet and try retaking the test.</div>
          </div>
        )}
        {/* Score hero */}
        <div style={{ background: `linear-gradient(135deg, ${passed ? '#0a5c2a' : C.navy}, ${passed ? '#0d7a38' : C.navyM})`, borderRadius: 16, padding: '24px 20px', marginBottom: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>{passed ? '🏆' : pct >= 40 ? '📚' : '💪'}</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{score}/{test.totalMarks}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: passed ? '#5eff9b' : '#ffcf5a', marginBottom: 6 }}>{pct}%</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>
            {passed ? '✅ PASSED' : '❌ Not Passed'} · Pass mark: {test.passMark}%
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            ['✅ Correct', correct, C.green, C.greenL],
            ['❌ Wrong', wrong, C.red, C.redL],
            ['⏱ Time', `${mins}m ${secs}s`, C.blue, C.blueL],
          ].map(([lbl, val, color, bg]) => (
            <div key={lbl} style={{ flex: 1, background: bg, borderRadius: 11, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: 9, color: C.textS, marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Section breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '13px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, letterSpacing: '.07em', marginBottom: 10 }}>SECTION BREAKDOWN</div>
          {test.sections.map((sec, si) => {
            const secQs = sec.questions.map(q => details.find(d => d.q_id === q.id)).filter(Boolean)
            const secScore = secQs.reduce((a, d) => a + (d.correct ? d.marks_total : 0), 0)
            const secPct = Math.round((secScore / sec.marks) * 100)
            return (
              <div key={si} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{sec.title.split('—')[0].split(':').slice(0, 2).join(':')}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: secPct >= 50 ? C.green : C.red }}>{secScore}/{sec.marks}</span>
                </div>
                <PBar pct={secPct} h={5} color={secPct >= 50 ? C.green : C.red} />
              </div>
            )
          })}
        </div>

        {/* Q&A review */}
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '13px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, letterSpacing: '.07em', marginBottom: 10 }}>DETAILED REVIEW</div>
          {details.map((d, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < details.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{d.correct ? '✅' : '❌'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.text, marginBottom: 3, lineHeight: 1.4 }}>Q{i + 1}: {d.q_text}</div>
                  <div style={{ fontSize: 10, color: d.correct ? C.green : C.red }}>
                    Your answer: <strong>{d.answer || '(blank)'}</strong>
                  </div>
                  {!d.correct && (
                    <div style={{ fontSize: 10, color: C.green, marginTop: 1 }}>
                      Correct: <strong>{d.correct_ans}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn label="← All Tests" onClick={() => setPhase('list')} variant="outline" style={{ flex: 1 }} />
          <Btn label="Retake 🔄" onClick={() => startTest(test)} variant="primary" style={{ flex: 1 }} />
        </div>
      </div>
    )
  }
}

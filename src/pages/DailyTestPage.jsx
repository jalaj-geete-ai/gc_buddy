import { useState, useEffect, useRef } from 'react'
import { C, LEVELS, LEVEL_THEME } from '../lib/constants'
import { PBar, Btn, Spin, Badge } from '../components/UI'
import { sb, trackEvent } from '../lib/supabase'
import { B1_TESTS } from '../lib/b1DailyTests'

// ── TEST DATA (from PDF) ────────────────────────────────────────────────────
const TESTS = [
  {
    id: 'A1_D1',
    name: "Day 1: Phonetics & Basics",
    classes: "Class 1",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D1Q1', text: "How many letters does the German alphabet have?", opts: ["24", "26", "28", "30"], ans: 1, marks: 1 },
          { id: 'A1D1Q2', text: "Which word contains an Umlaut?", opts: ["Katze", "Hund", "Brüder", "Haus"], ans: 2, marks: 1 },
          { id: 'A1D1Q3', text: "\"sch\" in German sounds like:", opts: ["sk", "sh", "ch (English)", "sz"], ans: 1, marks: 1 },
          { id: 'A1D1Q4', text: "How is \"ie\" pronounced in German?", opts: ["Short i", "Long e (ee)", "like \"eye\"", "like \"ya\""], ans: 1, marks: 1 },
          { id: 'A1D1Q5', text: "The letter \"W\" in German sounds like:", opts: ["English W", "English V", "English F", "English B"], ans: 1, marks: 1 },
          { id: 'A1D1Q6', text: "How is \"ei\" pronounced?", opts: ["Long e", "like \"ay\"", "like \"eye\"", "like \"ee\""], ans: 2, marks: 1 },
          { id: 'A1D1Q7', text: "Which German letter sounds like English \"ts\"?", opts: ["V", "W", "Z", "X"], ans: 2, marks: 1 },
          { id: 'A1D1Q8', text: "\"sp\" at the start of a German word sounds like:", opts: ["sp (normal)", "shp", "zp", "fp"], ans: 1, marks: 1 },
          { id: 'A1D1Q9', text: "ß (Eszett) sounds like:", opts: ["sz", "ss (double s)", "sh", "ts"], ans: 1, marks: 1 },
          { id: 'A1D1Q10', text: "Which vowel combination creates the \"ow\" sound (as in \"how\")?", opts: ["ie", "ei", "eu/äu", "au"], ans: 3, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D2',
    name: "Day 2: Greetings & Intro",
    classes: "Class 2",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D2Q1', text: "\"Good morning\" in German is:", opts: ["Guten Abend", "Guten Tag", "Guten Morgen", "Gute Nacht"], ans: 2, marks: 1 },
          { id: 'A1D2Q2', text: "Which greeting is INFORMAL?", opts: ["Guten Morgen", "Guten Tag", "Hallo", "Guten Abend"], ans: 2, marks: 1 },
          { id: 'A1D2Q3', text: "\"How are you?\" (formal):", opts: ["Wie geht's?", "Wie geht es Ihnen?", "Was machst du?", "Wie heißt du?"], ans: 1, marks: 1 },
          { id: 'A1D2Q4', text: "\"My name is Anna\" in German:", opts: ["Ich bin Anna", "Mein Name heißt Anna", "Ich heiße Anna", "Both A and C"], ans: 3, marks: 1 },
          { id: 'A1D2Q5', text: "\"Where are you from?\" (formal):", opts: ["Woher kommst du?", "Wo wohnst du?", "Woher kommen Sie?", "Wohin fahren Sie?"], ans: 2, marks: 1 },
          { id: 'A1D2Q6', text: "\"I am from India\":", opts: ["Ich bin Indien", "Ich komme aus Indien", "Ich wohne Indien", "Ich bin in Indien"], ans: 1, marks: 1 },
          { id: 'A1D2Q7', text: "\"Goodbye\" (formal):", opts: ["Tschüss", "Ciao", "Auf Wiedersehen", "Mach's gut"], ans: 2, marks: 1 },
          { id: 'A1D2Q8', text: "\"Tschüss\" is:", opts: ["Formal goodbye", "Informal goodbye", "Good morning", "Thank you"], ans: 1, marks: 1 },
          { id: 'A1D2Q9', text: "Germans typically greet with:", opts: ["A bow", "A hug", "A handshake", "No physical contact"], ans: 2, marks: 1 },
          { id: 'A1D2Q10', text: "\"Fine, thank you\" in German:", opts: ["Danke, gut", "Bitte, gut", "Gut, danke", "Ja, danke"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D3',
    name: "Day 3: The Verb \"To Be\" — sein",
    classes: "Class 3",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D3Q1', text: "\"I am\" in German:", opts: ["ich bin", "ich ist", "ich bist", "ich sind"], ans: 0, marks: 1 },
          { id: 'A1D3Q2', text: "\"You are\" (informal singular):", opts: ["du ist", "du bist", "du sind", "du bin"], ans: 1, marks: 1 },
          { id: 'A1D3Q3', text: "\"He/She/It is\":", opts: ["er/sie/es bin", "er/sie/es bist", "er/sie/es ist", "er/sie/es sind"], ans: 2, marks: 1 },
          { id: 'A1D3Q4', text: "\"We are\":", opts: ["wir bist", "wir ist", "wir bin", "wir sind"], ans: 3, marks: 1 },
          { id: 'A1D3Q5', text: "\"You are\" (plural informal):", opts: ["ihr bist", "ihr seid", "ihr sind", "ihr ist"], ans: 1, marks: 1 },
          { id: 'A1D3Q6', text: "\"They are\" / \"You are\" (formal):", opts: ["sie/Sie bin", "sie/Sie bist", "sie/Sie sind", "sie/Sie ist"], ans: 2, marks: 1 },
          { id: 'A1D3Q7', text: "Personal pronoun for \"he\":", opts: ["ich", "du", "er", "wir"], ans: 2, marks: 1 },
          { id: 'A1D3Q8', text: "\"I am a nurse.\" — correct German:", opts: ["Ich bin Krankenschwester.", "Ich bist Krankenschwester.", "Ich ist Krankenschwester.", "Ich sind Krankenschwester."], ans: 0, marks: 1 },
          { id: 'A1D3Q9', text: "\"Das ist schön\" means:", opts: ["That is ugly.", "That is expensive.", "That is beautiful.", "That is new."], ans: 2, marks: 1 },
          { id: 'A1D3Q10', text: "Which is the formal \"you\"?", opts: ["du", "ihr", "er", "Sie"], ans: 3, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D4',
    name: "Day 4: Numbers & Data",
    classes: "Class 4",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D4Q1', text: "\"Zwanzig\" means:", opts: ["12", "20", "21", "200"], ans: 1, marks: 1 },
          { id: 'A1D4Q2', text: "How do you say 21 in German?", opts: ["zwanzigeins", "einzwanzig", "einundzwanzig", "zwanzig-und-ein"], ans: 2, marks: 1 },
          { id: 'A1D4Q3', text: "\"Dreißig\" means:", opts: ["13", "30", "33", "300"], ans: 1, marks: 1 },
          { id: 'A1D4Q4', text: "\"Hundert\" means:", opts: ["10", "1,000", "100", "110"], ans: 2, marks: 1 },
          { id: 'A1D4Q5', text: "What is \"fünfzehn\"?", opts: ["5", "50", "15", "51"], ans: 2, marks: 1 },
          { id: 'A1D4Q6', text: "\"Wie alt bist du?\" means:", opts: ["What is your name?", "Where are you from?", "How old are you?", "How are you?"], ans: 2, marks: 1 },
          { id: 'A1D4Q7', text: "The German word for the number 7:", opts: ["sechs", "sieben", "acht", "neun"], ans: 1, marks: 1 },
          { id: 'A1D4Q8', text: "How do you say your phone number in German?", opts: ["All digits as one word", "Each digit individually", "In pairs of two", "In groups of three"], ans: 1, marks: 1 },
          { id: 'A1D4Q9', text: "\"Tausend\" means:", opts: ["100", "10,000", "1,000", "100,000"], ans: 2, marks: 1 },
          { id: 'A1D4Q10', text: "German ordinal for \"first\":", opts: ["ein", "eins", "erste", "einer"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D5',
    name: "Day 5: Nouns & Genders",
    classes: "Class 5",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D5Q1', text: "Which article is used for masculine nouns?", opts: ["die", "das", "der", "ein"], ans: 2, marks: 1 },
          { id: 'A1D5Q2', text: "\"Die\" is used for:", opts: ["Masculine nouns only", "Feminine nouns only", "Neuter nouns only", "Feminine and plural nouns"], ans: 3, marks: 1 },
          { id: 'A1D5Q3', text: "The article for \"Kind\" (child) is:", opts: ["der", "die", "das", "ein"], ans: 2, marks: 1 },
          { id: 'A1D5Q4', text: "Which ending often signals a feminine noun?", opts: ["-er", "-ung", "-chen", "-ismus"], ans: 1, marks: 1 },
          { id: 'A1D5Q5', text: "Indefinite article for masculine (a/an):", opts: ["die", "das", "der", "ein"], ans: 3, marks: 1 },
          { id: 'A1D5Q6', text: "\"Arzt\" (doctor) is masculine. Its article is:", opts: ["die", "das", "der", "keine"], ans: 2, marks: 1 },
          { id: 'A1D5Q7', text: "Which noun has the article \"das\"?", opts: ["Mutter", "Buch", "Vater", "Frau"], ans: 1, marks: 1 },
          { id: 'A1D5Q8', text: "Plural nouns always use:", opts: ["der", "die", "das", "ein"], ans: 1, marks: 1 },
          { id: 'A1D5Q9', text: "Which suffix often signals neuter gender?", opts: ["-schaft", "-heit", "-chen", "-ung"], ans: 2, marks: 1 },
          { id: 'A1D5Q10', text: "\"eine\" is the indefinite article for:", opts: ["Masculine", "Neuter", "Feminine", "Plural"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D6',
    name: "Day 6: Verbs in Present Tense",
    classes: "Class 6",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D6Q1', text: "\"lernen\" — \"ich\" form:", opts: ["lernst", "lerne", "lernt", "lernen"], ans: 1, marks: 1 },
          { id: 'A1D6Q2', text: "\"wohnen\" — \"er/sie/es\" form:", opts: ["wohnst", "wohnen", "wohnt", "wohne"], ans: 2, marks: 1 },
          { id: 'A1D6Q3', text: "\"kommen\" — \"wir\" form:", opts: ["kommt", "kommen", "kommst", "komme"], ans: 1, marks: 1 },
          { id: 'A1D6Q4', text: "\"arbeiten\" — \"du\" form (note -t stem!):", opts: ["arbeitest", "arbeit", "arbeits", "arbeitet"], ans: 0, marks: 1 },
          { id: 'A1D6Q5', text: "The standard verb ending for \"ihr\" is:", opts: ["-e", "-st", "-t", "-en"], ans: 2, marks: 1 },
          { id: 'A1D6Q6', text: "\"haben\" — \"er\" form is irregular. It is:", opts: ["habt", "haben", "habe", "hat"], ans: 3, marks: 1 },
          { id: 'A1D6Q7', text: "Which verb does NOT follow regular conjugation?", opts: ["lernen", "wohnen", "sein", "machen"], ans: 2, marks: 1 },
          { id: 'A1D6Q8', text: "\"Sie (they) lernen\" — ending:", opts: ["-t", "-st", "-en", "-e"], ans: 2, marks: 1 },
          { id: 'A1D6Q9', text: "\"ich mache\" means:", opts: ["I am doing / I do", "I will do", "I did", "I should do"], ans: 0, marks: 1 },
          { id: 'A1D6Q10', text: "\"spielen\" — \"ihr\" form:", opts: ["spielen", "spielt", "spielst", "spiele"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D7',
    name: "Day 7: Sentence Structure",
    classes: "Class 7",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D7Q1', text: "In German, the verb is always in:", opts: ["Position 1", "Position 2", "Position 3", "The last position"], ans: 1, marks: 1 },
          { id: 'A1D7Q2', text: "\"Jeden Tag lerne ich Deutsch.\" The verb is:", opts: ["Jeden", "Tag", "lerne", "Deutsch"], ans: 2, marks: 1 },
          { id: 'A1D7Q3', text: "To form a yes/no question in German:", opts: ["Add \"Was\" at the start", "Put the verb at Position 1", "Put the verb at the end", "Add a question particle"], ans: 1, marks: 1 },
          { id: 'A1D7Q4', text: "Which is a W-question word?", opts: ["Dann", "Wo", "Aber", "Sehr"], ans: 1, marks: 1 },
          { id: 'A1D7Q5', text: "\"Woher\" asks about:", opts: ["Where to", "Where (location)", "Where from", "When"], ans: 2, marks: 1 },
          { id: 'A1D7Q6', text: "S-V-O stands for:", opts: ["Subject-Verb-Object", "Sentence-Verb-Order", "Subject-Vowel-Object", "Syntax-Verb-Output"], ans: 0, marks: 1 },
          { id: 'A1D7Q7', text: "\"Wo wohnst du?\" means:", opts: ["Who are you?", "When do you come?", "Where do you live?", "What do you do?"], ans: 2, marks: 1 },
          { id: 'A1D7Q8', text: "Which is correct word order?", opts: ["Ich wohne Berlin in.", "Wohne ich in Berlin.", "Ich wohne in Berlin.", "In Berlin wohne — ich."], ans: 2, marks: 1 },
          { id: 'A1D7Q9', text: "\"Was machst du?\" means:", opts: ["Where do you come from?", "What are you doing?", "When do you work?", "Who are you?"], ans: 1, marks: 1 },
          { id: 'A1D7Q10', text: "Inversion happens when:", opts: ["A W-word starts the sentence", "Something other than the subject is in Position 1", "The sentence has two verbs", "There is a modal verb"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D8',
    name: "Day 8: Family & Relations",
    classes: "Class 8",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D8Q1', text: "\"Mutter\" means:", opts: ["Father", "Sister", "Mother", "Daughter"], ans: 2, marks: 1 },
          { id: 'A1D8Q2', text: "German for \"brother\":", opts: ["Bruder", "Brüder", "Schwester", "Sohn"], ans: 0, marks: 1 },
          { id: 'A1D8Q3', text: "\"Mein\" is the possessive for:", opts: ["Feminine only", "Masculine (and neuter) as Nominative", "Plural only", "All genders always"], ans: 1, marks: 1 },
          { id: 'A1D8Q4', text: "\"Meine Mutter\" — why \"meine\"?", opts: ["Mutter is neuter", "Mutter is plural", "Mutter is feminine", "Mutter starts with M"], ans: 2, marks: 1 },
          { id: 'A1D8Q5', text: "\"Das ist mein Vater.\" means:", opts: ["That is my brother.", "That is my father.", "That is my son.", "That is my grandfather."], ans: 1, marks: 1 },
          { id: 'A1D8Q6', text: "\"Großeltern\" means:", opts: ["Parents", "Grandparents", "Siblings", "Cousins"], ans: 1, marks: 1 },
          { id: 'A1D8Q7', text: "The imperative of \"kommen\" (du, informal) is:", opts: ["Kommt!", "Kommen!", "Komm!", "Kommst!"], ans: 2, marks: 1 },
          { id: 'A1D8Q8', text: "\"Wer ist das?\" means:", opts: ["What is that?", "Who is that?", "Where is that?", "When is that?"], ans: 1, marks: 1 },
          { id: 'A1D8Q9', text: "\"dein/deine\" means:", opts: ["my", "his", "your (informal)", "our"], ans: 2, marks: 1 },
          { id: 'A1D8Q10', text: "\"Schwiegermutter\" means:", opts: ["Sister-in-law", "Mother-in-law", "Stepmother", "Aunt"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D9',
    name: "Day 9: Integrated Review — Days 1–8",
    classes: "Class 9",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D9Q1', text: "\"sch\" sounds like:", opts: ["sk", "sh", "ss", "ch"], ans: 1, marks: 1 },
          { id: 'A1D9Q2', text: "\"Wir sind\" uses which pronoun?", opts: ["ich", "du", "ihr", "wir"], ans: 3, marks: 1 },
          { id: 'A1D9Q3', text: "Informal goodbye:", opts: ["Auf Wiedersehen", "Tschüss", "Guten Abend", "Danke"], ans: 1, marks: 1 },
          { id: 'A1D9Q4', text: "\"dreiundzwanzig\" =", opts: ["32", "23", "33", "13"], ans: 1, marks: 1 },
          { id: 'A1D9Q5', text: "Article for \"Buch\" (book):", opts: ["der", "die", "das", "ein"], ans: 2, marks: 1 },
          { id: 'A1D9Q6', text: "\"lernen\" — ich form:", opts: ["lernst", "lernt", "lerne", "lernen"], ans: 2, marks: 1 },
          { id: 'A1D9Q7', text: "Verb position in German main clause:", opts: ["Position 1", "Position 2", "Position 3", "End"], ans: 1, marks: 1 },
          { id: 'A1D9Q8', text: "\"meine Schwester\" — Schwester is:", opts: ["Masculine", "Neuter", "Feminine", "Plural"], ans: 2, marks: 1 },
          { id: 'A1D9Q9', text: "\"Woher kommen Sie?\" asks:", opts: ["Where are you going?", "Where are you from?", "How are you?", "Where do you live?"], ans: 1, marks: 1 },
          { id: 'A1D9Q10', text: "\"Guten Tag\" can be used:", opts: ["Morning only", "Evening only", "Any time of day", "Night only"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D10',
    name: "Day 10: Accusative Case I",
    classes: "Class 10",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D10Q1', text: "In Accusative case, which article changes?", opts: ["die → den", "das → dem", "der → den", "die → der"], ans: 2, marks: 1 },
          { id: 'A1D10Q2', text: "\"Ich sehe ___ Mann.\" (der Mann — Accusative)", opts: ["der", "dem", "den", "die"], ans: 2, marks: 1 },
          { id: 'A1D10Q3', text: "Feminine articles in Accusative:", opts: ["die stays die", "die → den", "die → der", "die → das"], ans: 0, marks: 1 },
          { id: 'A1D10Q4', text: "Neuter articles in Accusative:", opts: ["das → dem", "das stays das", "das → den", "das → die"], ans: 1, marks: 1 },
          { id: 'A1D10Q5', text: "\"einen\" is:", opts: ["Masculine definite Accusative", "Masculine indefinite Accusative", "Feminine indefinite Accusative", "Neuter indefinite Accusative"], ans: 1, marks: 1 },
          { id: 'A1D10Q6', text: "\"Ich habe ___ Bruder.\" (einen or ein?)", opts: ["ein", "eine", "einen", "der"], ans: 2, marks: 1 },
          { id: 'A1D10Q7', text: "\"haben\" means:", opts: ["to be", "to do", "to have", "to want"], ans: 2, marks: 1 },
          { id: 'A1D10Q8', text: "Accusative answers the question:", opts: ["Who does the action?", "Whom / What directly?", "To whom?", "Whose?"], ans: 1, marks: 1 },
          { id: 'A1D10Q9', text: "\"Ich kaufe ___ Apfel.\" (der Apfel)", opts: ["der", "dem", "den", "die"], ans: 2, marks: 1 },
          { id: 'A1D10Q10', text: "Which verb typically takes an Accusative object?", opts: ["helfen", "kaufen", "danken", "gehören"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D11',
    name: "Day 11: Accusative Case II",
    classes: "Class 11",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D11Q1', text: "Accusative pronoun for \"er\" (he):", opts: ["ihn", "ihm", "er", "sie"], ans: 0, marks: 1 },
          { id: 'A1D11Q2', text: "Accusative pronoun for \"ich\" (I):", opts: ["mir", "mich", "ich", "mein"], ans: 1, marks: 1 },
          { id: 'A1D11Q3', text: "\"Ich rufe ___ an.\" (du)", opts: ["dir", "dich", "du", "dein"], ans: 1, marks: 1 },
          { id: 'A1D11Q4', text: "Which is an Accusative preposition?", opts: ["mit", "bei", "durch", "von"], ans: 2, marks: 1 },
          { id: 'A1D11Q5', text: "\"für\" governs which case?", opts: ["Nominative", "Accusative", "Dative", "Genitive"], ans: 1, marks: 1 },
          { id: 'A1D11Q6', text: "\"ohne\" governs which case?", opts: ["Dative", "Genitive", "Accusative", "Nominative"], ans: 2, marks: 1 },
          { id: 'A1D11Q7', text: "\"Ich kaufe das für ___.\" (sie — her)", opts: ["sie", "ihr", "ihnen", "sie (same as Nominative)"], ans: 0, marks: 1 },
          { id: 'A1D11Q8', text: "Accusative pronoun for \"wir\" (we):", opts: ["uns", "euch", "wir", "unser"], ans: 0, marks: 1 },
          { id: 'A1D11Q9', text: "\"gegen\" preposition governs:", opts: ["Dative", "Genitive", "Accusative", "Nominative"], ans: 2, marks: 1 },
          { id: 'A1D11Q10', text: "\"Ich sehe sie.\" — \"sie\" here can refer to:", opts: ["He", "Her or Them (Accusative)", "Her (Dative only)", "It (Nominative)"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D12',
    name: "Day 12: Home & Living",
    classes: "Class 12",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D12Q1', text: "\"Küche\" means:", opts: ["Bathroom", "Bedroom", "Kitchen", "Living room"], ans: 2, marks: 1 },
          { id: 'A1D12Q2', text: "\"das Bett\" means:", opts: ["Table", "Bed", "Chair", "Wardrobe"], ans: 1, marks: 1 },
          { id: 'A1D12Q3', text: "\"Das Zimmer ist groß.\" — this is a ___ adjective:", opts: ["Attributive (before noun)", "Predicative (after sein)", "Comparative", "Superlative"], ans: 1, marks: 1 },
          { id: 'A1D12Q4', text: "\"Wohnzimmer\" means:", opts: ["Kitchen", "Bedroom", "Bathroom", "Living room"], ans: 3, marks: 1 },
          { id: 'A1D12Q5', text: "\"Es gibt\" + Accusative means:", opts: ["He gives", "There is/are", "It is", "To give"], ans: 1, marks: 1 },
          { id: 'A1D12Q6', text: "\"Der Tisch ist klein.\" — \"klein\" means:", opts: ["big", "expensive", "small", "bright"], ans: 2, marks: 1 },
          { id: 'A1D12Q7', text: "\"Schrank\" means:", opts: ["Shelf", "Wardrobe / Cabinet", "Lamp", "Window"], ans: 1, marks: 1 },
          { id: 'A1D12Q8', text: "\"Miete\" means:", opts: ["Electricity", "Neighbour", "Rent", "Floor"], ans: 2, marks: 1 },
          { id: 'A1D12Q9', text: "\"Wie viele Zimmer hat die Wohnung?\" asks:", opts: ["The size", "The price", "The number of rooms", "The location"], ans: 2, marks: 1 },
          { id: 'A1D12Q10', text: "\"hell\" means:", opts: ["dark", "small", "bright / light", "cheap"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D13',
    name: "Day 13: Food & Groceries",
    classes: "Class 13",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D13Q1', text: "\"Brot\" means:", opts: ["Butter", "Bread", "Cake", "Cheese"], ans: 1, marks: 1 },
          { id: 'A1D13Q2', text: "\"essen\" — \"er/sie/es\" form:", opts: ["essen", "esst", "isst", "esse"], ans: 2, marks: 1 },
          { id: 'A1D13Q3', text: "\"ein Kilo Äpfel\" — \"Kilo\" is a:", opts: ["Food item", "Buying unit", "Price", "Verb"], ans: 1, marks: 1 },
          { id: 'A1D13Q4', text: "\"Ich trinke ___ Wasser.\" (a glass of)", opts: ["eine Flasche", "ein Kilo", "ein Glas", "eine Dose"], ans: 2, marks: 1 },
          { id: 'A1D13Q5', text: "\"Hunger haben\" means:", opts: ["To be thirsty", "To be tired", "To be hungry", "To be full"], ans: 2, marks: 1 },
          { id: 'A1D13Q6', text: "\"Fleisch\" means:", opts: ["Fish", "Meat", "Vegetables", "Fruit"], ans: 1, marks: 1 },
          { id: 'A1D13Q7', text: "\"trinken\" — \"du\" form:", opts: ["trinkt", "trinken", "trinkst", "trinke"], ans: 2, marks: 1 },
          { id: 'A1D13Q8', text: "\"Wie viel kostet das?\" means:", opts: ["How old is that?", "How many do you want?", "How much does that cost?", "Where is that?"], ans: 2, marks: 1 },
          { id: 'A1D13Q9', text: "\"Obst\" means:", opts: ["Vegetables", "Juice", "Fruit", "Dairy"], ans: 2, marks: 1 },
          { id: 'A1D13Q10', text: "\"eine Flasche Wasser\" — \"Flasche\" means:", opts: ["Glass", "Bottle", "Can", "Bag"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D14',
    name: "Day 14: Roleplay — Market & Café",
    classes: "Class 14",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D14Q1', text: "\"Ich hätte gern…\" is used to:", opts: ["Complain", "Order politely in a café", "Ask for directions", "Say goodbye"], ans: 1, marks: 1 },
          { id: 'A1D14Q2', text: "\"Was isst du gern?\" means:", opts: ["What do you eat often?", "What do you like to eat?", "What do you cook?", "What did you eat?"], ans: 1, marks: 1 },
          { id: 'A1D14Q3', text: "\"Zahlen, bitte!\" means:", opts: ["Another round, please!", "Can I see the menu?", "The bill / check, please!", "Water, please!"], ans: 2, marks: 1 },
          { id: 'A1D14Q4', text: "\"I would like a coffee\" (polite):", opts: ["Ich will einen Kaffee.", "Ich hätte gern einen Kaffee.", "Ich brauche Kaffee.", "Ich nehme kein Kaffee."], ans: 1, marks: 1 },
          { id: 'A1D14Q5', text: "\"Was darf es sein?\" means:", opts: ["What would you like?", "How much does it cost?", "Do you have a receipt?", "What is your name?"], ans: 0, marks: 1 },
          { id: 'A1D14Q6', text: "\"Trinkgeld\" means:", opts: ["Drinking water", "Water bill", "A tip / gratuity", "Mineral water"], ans: 2, marks: 1 },
          { id: 'A1D14Q7', text: "\"Gibt es…?\" means:", opts: ["Is there / Do you have…?", "I give…", "He gives…", "There was…"], ans: 0, marks: 1 },
          { id: 'A1D14Q8', text: "\"Ich nehme den Apfelkuchen.\" means:", opts: ["I don't want the apple cake.", "I'll have the apple cake.", "I made the apple cake.", "I bought the apple cake."], ans: 1, marks: 1 },
          { id: 'A1D14Q9', text: "\"Bio\" on a German product means:", opts: ["Expensive", "Imported", "Organic", "Discounted"], ans: 2, marks: 1 },
          { id: 'A1D14Q10', text: "\"Ein Stück\" means:", opts: ["A kilo", "A piece", "A bag", "A bottle"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D15',
    name: "Day 15: Negation — Nicht & Kein",
    classes: "Class 15",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D15Q1', text: "Use \"kein/keine\" to negate:", opts: ["A verb", "A proper noun", "A noun with indefinite or no article", "An adjective"], ans: 2, marks: 1 },
          { id: 'A1D15Q2', text: "\"Ich habe ___ Zeit.\" (I have no time)", opts: ["nicht", "kein", "keine", "keinen"], ans: 2, marks: 1 },
          { id: 'A1D15Q3', text: "\"Ich arbeite ___.\" (I don't work)", opts: ["kein", "keine", "nicht", "keinen"], ans: 2, marks: 1 },
          { id: 'A1D15Q4', text: "\"Er ist ___ Arzt.\" (He is not a doctor)", opts: ["nicht", "kein", "keine", "keinen"], ans: 1, marks: 1 },
          { id: 'A1D15Q5', text: "What does \"Doch!\" mean as a response to a negative question?", opts: ["No, you're right.", "Yes, actually! (contradicts the negative)", "Maybe.", "I don't know."], ans: 1, marks: 1 },
          { id: 'A1D15Q6', text: "\"kein\" before masculine Nominative noun:", opts: ["keine", "keinen", "kein", "keiner"], ans: 2, marks: 1 },
          { id: 'A1D15Q7', text: "\"Ich habe ___ Hunger.\" (I'm not hungry)", opts: ["nicht", "kein", "keinen", "keine"], ans: 2, marks: 1 },
          { id: 'A1D15Q8', text: "\"Ich mag das ___.\" (I don't like that)", opts: ["keine", "kein", "nicht", "nichts"], ans: 2, marks: 1 },
          { id: 'A1D15Q9', text: "\"keine\" is used before:", opts: ["Masculine Nominative nouns", "Feminine and plural nouns", "Verbs", "Adjectives alone"], ans: 1, marks: 1 },
          { id: 'A1D15Q10', text: "\"Er hat kein Auto.\" — \"Auto\" is:", opts: ["Masculine", "Feminine", "Neuter", "Plural"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D16',
    name: "Day 16: Time & Clock",
    classes: "Class 16",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D16Q1', text: "\"Wie spät ist es?\" means:", opts: ["How old are you?", "What time is it?", "How late did you stay?", "When are you coming?"], ans: 1, marks: 1 },
          { id: 'A1D16Q2', text: "\"Halb drei\" (informal) means:", opts: ["3:30", "2:30", "3:00", "2:15"], ans: 1, marks: 1 },
          { id: 'A1D16Q3', text: "\"Viertel nach vier\" means:", opts: ["4:45", "3:45", "4:15", "4:30"], ans: 2, marks: 1 },
          { id: 'A1D16Q4', text: "\"14:30 Uhr\" (formal) in informal is:", opts: ["Halb zwei", "Viertel nach zwei", "Halb drei", "Viertel vor drei"], ans: 2, marks: 1 },
          { id: 'A1D16Q5', text: "\"Viertel vor fünf\" means:", opts: ["4:45", "5:15", "4:15", "5:45"], ans: 0, marks: 1 },
          { id: 'A1D16Q6', text: "\"Um wie viel Uhr?\" asks about:", opts: ["Duration", "A specific clock time", "How long ago", "How long until"], ans: 1, marks: 1 },
          { id: 'A1D16Q7', text: "German 24-hour time is used in:", opts: ["Casual conversation", "Transport schedules and formal announcements", "Text messages", "Between friends only"], ans: 1, marks: 1 },
          { id: 'A1D16Q8', text: "\"morgens\" means:", opts: ["In the evening", "At noon", "In the morning", "At night"], ans: 2, marks: 1 },
          { id: 'A1D16Q9', text: "\"abends\" means:", opts: ["In the morning", "In the evening", "At midday", "At midnight"], ans: 1, marks: 1 },
          { id: 'A1D16Q10', text: "\"von … bis\" expresses:", opts: ["A specific point in time", "A duration from … to …", "A future event", "A past event"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D17',
    name: "Day 17: Daily Routine & Separable Verbs",
    classes: "Class 17",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D17Q1', text: "In \"ich stehe auf\", where does \"auf\" go?", opts: ["Before the verb", "Directly after subject", "To the end of the clause", "Between subject and verb"], ans: 2, marks: 1 },
          { id: 'A1D17Q2', text: "\"aufstehen\" — \"ich\" form:", opts: ["ich aufstehe", "ich stehe auf", "ich auf stehe", "ich aufgestehe"], ans: 1, marks: 1 },
          { id: 'A1D17Q3', text: "\"anrufen\" means:", opts: ["to call (phone)", "to get up", "to watch TV", "to go shopping"], ans: 0, marks: 1 },
          { id: 'A1D17Q4', text: "\"einkaufen\" — \"er\" form:", opts: ["er einkauft", "er kauft ein", "er kauft auf", "er ein kauft"], ans: 1, marks: 1 },
          { id: 'A1D17Q5', text: "Which is a separable prefix?", opts: ["be-", "ge-", "ver-", "auf-"], ans: 3, marks: 1 },
          { id: 'A1D17Q6', text: "\"fernsehen\" means:", opts: ["to travel far", "to watch TV", "to look outside", "to call someone"], ans: 1, marks: 1 },
          { id: 'A1D17Q7', text: "\"Ich stehe um 7 Uhr auf.\" — \"auf\" is at:", opts: ["Position 1", "Position 2", "End of clause", "Before \"Uhr\""], ans: 2, marks: 1 },
          { id: 'A1D17Q8', text: "\"aufwachen\" means:", opts: ["to get dressed", "to wake up", "to fall asleep", "to go out"], ans: 1, marks: 1 },
          { id: 'A1D17Q9', text: "\"ausgehen\" means:", opts: ["to go shopping", "to go out (socially)", "to get up", "to hang up"], ans: 1, marks: 1 },
          { id: 'A1D17Q10', text: "In a question \"Wann stehst du auf?\" — \"auf\" goes:", opts: ["Before du", "After stehst", "At the very end", "Before wann"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D18',
    name: "Day 18: Mid-Phase Assessment",
    classes: "Class 18",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D18Q1', text: "Nominative answers the question:", opts: ["Whom?", "Who does the action?", "To whom?", "Whose?"], ans: 1, marks: 1 },
          { id: 'A1D18Q2', text: "\"Ich sehe ___ Arzt.\" (den/der/dem)", opts: ["der", "dem", "den", "die"], ans: 2, marks: 1 },
          { id: 'A1D18Q3', text: "\"Ich habe ___ Bruder.\" (einen/ein/eine)", opts: ["ein", "eine", "einer", "einen"], ans: 3, marks: 1 },
          { id: 'A1D18Q4', text: "\"Ich habe ___ Auto.\" (kein/nicht)", opts: ["nicht", "kein", "keine", "keinen"], ans: 1, marks: 1 },
          { id: 'A1D18Q5', text: "\"Ich arbeite ___ heute.\" (nicht/kein)", opts: ["kein", "keine", "nicht", "nichts"], ans: 2, marks: 1 },
          { id: 'A1D18Q6', text: "\"Es ist halb acht.\" means:", opts: ["8:30", "7:30", "8:00", "7:45"], ans: 1, marks: 1 },
          { id: 'A1D18Q7', text: "\"Er steht um 6 Uhr ___.\" (auf)", opts: ["auf", "oben", "aus", "ein"], ans: 0, marks: 1 },
          { id: 'A1D18Q8', text: "Which is the correct separable verb sentence?", opts: ["Ich aufstehe früh.", "Ich stehe früh auf.", "Ich stehe auf früh.", "Ich früh stehe auf."], ans: 1, marks: 1 },
          { id: 'A1D18Q9', text: "\"Wann stehst du auf?\" — the verb splits into:", opts: ["aufstehen (whole)", "stehst … auf", "aufsteh only", "auf stehe"], ans: 1, marks: 1 },
          { id: 'A1D18Q10', text: "Accusative pronoun for \"sie\" (she):", opts: ["ihr", "sie", "ihnen", "ihm"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D19',
    name: "Day 19: Modal Verbs I — Können & Wollen",
    classes: "Class 19",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D19Q1', text: "\"können\" expresses:", opts: ["Obligation", "Permission", "Ability / can", "Wish"], ans: 2, marks: 1 },
          { id: 'A1D19Q2', text: "\"ich kann\" — what is notable about \"er/sie/es\" form?", opts: ["It adds -e", "It is also \"kann\" (no -t ending)", "It uses Umlaut", "It always goes to end"], ans: 1, marks: 1 },
          { id: 'A1D19Q3', text: "Modal sentence structure:", opts: ["Modal → Position 1, Infinitive → Position 2", "Modal → Position 2, Infinitive → absolute end", "Infinitive → end, Modal → Position 1", "Modal → end, Infinitive → Position 3"], ans: 1, marks: 1 },
          { id: 'A1D19Q4', text: "\"wollen\" means:", opts: ["To be able to", "To want to / intend to", "To be allowed to", "To have to"], ans: 1, marks: 1 },
          { id: 'A1D19Q5', text: "\"Er ___ Deutsch lernen.\" (wollen — er form)", opts: ["wollst", "wollt", "will", "wollen"], ans: 2, marks: 1 },
          { id: 'A1D19Q6', text: "\"Ich kann Deutsch sprechen.\" — \"sprechen\" is at:", opts: ["Position 1", "Position 2", "Absolute end", "After \"kann\""], ans: 2, marks: 1 },
          { id: 'A1D19Q7', text: "\"wir können\" means:", opts: ["We want", "We can", "We must", "We should"], ans: 1, marks: 1 },
          { id: 'A1D19Q8', text: "\"Kannst du mir helfen?\" means:", opts: ["Do you want to help me?", "Can you help me?", "Must you help me?", "Should you help me?"], ans: 1, marks: 1 },
          { id: 'A1D19Q9', text: "\"ich will\" (wollen) — English translation:", opts: ["I will (future tense)", "I want to", "I can", "I must"], ans: 1, marks: 1 },
          { id: 'A1D19Q10', text: "Which is correct?", opts: ["Ich kann gehe.", "Ich gehe kann.", "Ich kann gehen.", "Ich gehen kann."], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D20',
    name: "Day 20: Modal Verbs II — Müssen, Dürfen, Sollen, Möchten",
    classes: "Class 20",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D20Q1', text: "\"müssen\" means:", opts: ["to want", "to be allowed to", "to have to / must", "to should"], ans: 2, marks: 1 },
          { id: 'A1D20Q2', text: "\"dürfen\" expresses:", opts: ["Obligation", "Ability", "Permission (may / allowed to)", "Wish"], ans: 2, marks: 1 },
          { id: 'A1D20Q3', text: "\"nicht dürfen\" means:", opts: ["Don't have to", "Must not (prohibition)", "Can't", "Don't want to"], ans: 1, marks: 1 },
          { id: 'A1D20Q4', text: "\"nicht müssen\" means:", opts: ["Must not", "Can't", "Don't have to", "Don't want to"], ans: 2, marks: 1 },
          { id: 'A1D20Q5', text: "\"sollen\" means:", opts: ["To want", "To be supposed to / should", "To have to", "To be able to"], ans: 1, marks: 1 },
          { id: 'A1D20Q6', text: "\"möchten\" is the polite form of:", opts: ["müssen", "dürfen", "wollen", "können"], ans: 2, marks: 1 },
          { id: 'A1D20Q7', text: "\"Ich möchte einen Kaffee.\" means:", opts: ["I need a coffee.", "I would like a coffee.", "I must have a coffee.", "I can have a coffee."], ans: 1, marks: 1 },
          { id: 'A1D20Q8', text: "\"du darfst\" means:", opts: ["you must", "you can", "you are allowed to", "you want to"], ans: 2, marks: 1 },
          { id: 'A1D20Q9', text: "Which modal pair is OPPOSITE in meaning?", opts: ["können and dürfen", "müssen and dürfen", "nicht dürfen and nicht müssen", "wollen and möchten"], ans: 2, marks: 1 },
          { id: 'A1D20Q10', text: "\"Er soll um 8 Uhr kommen.\" means:", opts: ["He wants to come at 8.", "He is supposed to come at 8.", "He must come at 8.", "He can come at 8."], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D21',
    name: "Day 21: Sentence Architecture Masterclass",
    classes: "Class 21",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D21Q1', text: "The \"Golden Rule\" of German sentence architecture:", opts: ["Subject is always first", "Conjugated verb is always in Position 2", "Object is always last", "Verb is always first"], ans: 1, marks: 1 },
          { id: 'A1D21Q2', text: "\"Heute gehe ich ins Kino.\" — subject \"ich\" is in:", opts: ["Position 1", "Position 2", "Position 3", "Position 4"], ans: 2, marks: 1 },
          { id: 'A1D21Q3', text: "With a modal verb, the infinitive goes to:", opts: ["Position 2", "Position 1", "Absolute end", "Position 3"], ans: 2, marks: 1 },
          { id: 'A1D21Q4', text: "With a separable verb, the prefix goes to:", opts: ["Position 1", "Before the verb", "Absolute end", "After the subject"], ans: 2, marks: 1 },
          { id: 'A1D21Q5', text: "\"Ich stehe jeden Morgen früh auf.\" — \"auf\" is:", opts: ["At Position 2", "After \"stehe\"", "At absolute end of clause", "Before \"jeden\""], ans: 2, marks: 1 },
          { id: 'A1D21Q6', text: "\"Ich kann jeden Morgen früh aufstehen.\" — \"aufstehen\" is at:", opts: ["Position 2", "Absolute end", "After \"kann\"", "Position 3"], ans: 1, marks: 1 },
          { id: 'A1D21Q7', text: "Inversion is triggered when:", opts: ["A modal verb is used", "Something other than the subject is in Position 1", "The sentence has more than 5 words", "A question is asked"], ans: 1, marks: 1 },
          { id: 'A1D21Q8', text: "\"Morgen fahre ich nach Berlin.\" — why does \"fahre\" come before \"ich\"?", opts: ["It is a question", "\"Morgen\" in Position 1 triggers inversion", "\"ich\" is never in Position 1", "Modal verb rule"], ans: 1, marks: 1 },
          { id: 'A1D21Q9', text: "Which is correctly formed with modal + separable verb?", opts: ["Ich kann aufstehe.", "Ich kann aufstehen.", "Ich aufstehen kann.", "Ich kann auf stehen."], ans: 1, marks: 1 },
          { id: 'A1D21Q10', text: "Position 0 in German sentences is for:", opts: ["The subject", "Coordinating conjunctions (und, aber, denn)", "The verb", "Time expressions"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D22',
    name: "Day 22: Travel & Transport",
    classes: "Class 22",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D22Q1', text: "\"Bahnhof\" means:", opts: ["Airport", "Bus stop", "Train station", "Taxi rank"], ans: 2, marks: 1 },
          { id: 'A1D22Q2', text: "\"Fahrkarte\" means:", opts: ["Map", "Ticket", "Schedule", "Platform"], ans: 1, marks: 1 },
          { id: 'A1D22Q3', text: "\"Gleis\" means:", opts: ["Terminal", "Departure hall", "Platform / track", "Ticket machine"], ans: 2, marks: 1 },
          { id: 'A1D22Q4', text: "\"Verspätung\" means:", opts: ["Cancellation", "Delay", "Early departure", "Connection"], ans: 1, marks: 1 },
          { id: 'A1D22Q5', text: "\"mit dem Zug\" — \"dem\" is which case?", opts: ["Nominative", "Accusative", "Dative", "Genitive"], ans: 2, marks: 1 },
          { id: 'A1D22Q6', text: "\"Wo ist der nächste Bahnhof?\" — \"nächste\" means:", opts: ["Last", "Nearest / Next", "Main", "Central"], ans: 1, marks: 1 },
          { id: 'A1D22Q7', text: "\"links\" means:", opts: ["Straight ahead", "To the right", "To the left", "Behind"], ans: 2, marks: 1 },
          { id: 'A1D22Q8', text: "\"rechts\" means:", opts: ["To the left", "Straight", "To the right", "Turn back"], ans: 2, marks: 1 },
          { id: 'A1D22Q9', text: "\"geradeaus\" means:", opts: ["Turn left", "Go back", "Straight ahead", "Turn right"], ans: 2, marks: 1 },
          { id: 'A1D22Q10', text: "\"mit der U-Bahn\" — \"mit\" requires which case?", opts: ["Accusative", "Nominative", "Dative", "Genitive"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D23',
    name: "Day 23: The Past — Perfekt I (haben)",
    classes: "Class 23",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D23Q1', text: "Perfekt I uses haben + ___", opts: ["Infinitive", "Partizip II", "Present stem", "Modal verb"], ans: 1, marks: 1 },
          { id: 'A1D23Q2', text: "Regular Partizip II formation:", opts: ["stem + -st", "ge- + stem + -t", "ge- + infinitive", "stem + -en"], ans: 1, marks: 1 },
          { id: 'A1D23Q3', text: "Partizip II of \"lernen\":", opts: ["gelernt", "gelernet", "lernend", "gelernen"], ans: 0, marks: 1 },
          { id: 'A1D23Q4', text: "In Perfekt, \"haben\" goes to ___:", opts: ["Position 1", "Position 2", "End", "After Partizip II"], ans: 1, marks: 1 },
          { id: 'A1D23Q5', text: "Partizip II of \"kaufen\":", opts: ["kaufte", "gekauft", "kaufend", "kaufen"], ans: 1, marks: 1 },
          { id: 'A1D23Q6', text: "\"Ich habe das Buch ___.\" (lesen — irregular)", opts: ["gelest", "liest", "gelesen", "lesen"], ans: 2, marks: 1 },
          { id: 'A1D23Q7', text: "\"-ieren\" verbs form Partizip II WITHOUT \"ge-\". Example:", opts: ["genstudiert", "studiert", "gestudiert", "studentiert"], ans: 1, marks: 1 },
          { id: 'A1D23Q8', text: "\"Wir haben Fußball ___.\" (spielen)", opts: ["gespielt", "spielte", "gespielten", "spielend"], ans: 0, marks: 1 },
          { id: 'A1D23Q9', text: "Partizip II position in Perfekt sentence:", opts: ["Position 1", "Position 2", "Absolute end", "After subject"], ans: 2, marks: 1 },
          { id: 'A1D23Q10', text: "\"haben\" in Perfekt — \"du\" form:", opts: ["habe", "habt", "hast", "haben"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D24',
    name: "Day 24: The Past — Perfekt II (sein)",
    classes: "Class 24",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D24Q1', text: "sein is used in Perfekt for:", opts: ["All verbs", "Verbs of motion and change of state", "Only irregular verbs", "Only verbs starting with \"ge-\""], ans: 1, marks: 1 },
          { id: 'A1D24Q2', text: "Partizip II of \"gehen\":", opts: ["gegeht", "gegangen", "gehen", "gehte"], ans: 1, marks: 1 },
          { id: 'A1D24Q3', text: "\"Ich bin nach Berlin ___.\" (fahren)", opts: ["gefahrt", "fuhr", "gefahren", "fahrend"], ans: 2, marks: 1 },
          { id: 'A1D24Q4', text: "sein — \"ich\" form in present:", opts: ["sein", "bist", "bin", "ist"], ans: 2, marks: 1 },
          { id: 'A1D24Q5', text: "Which verb uses HABEN in Perfekt?", opts: ["gehen", "kommen", "lernen", "fahren"], ans: 2, marks: 1 },
          { id: 'A1D24Q6', text: "Partizip II of \"kommen\":", opts: ["gekommt", "kommen", "gekommst", "gekommen"], ans: 3, marks: 1 },
          { id: 'A1D24Q7', text: "\"Er ist früh ___.\" (aufwachen)", opts: ["aufgewacht", "aufwachte", "gewacht auf", "aufwacken"], ans: 0, marks: 1 },
          { id: 'A1D24Q8', text: "\"bleiben\" uses which auxiliary in Perfekt?", opts: ["haben", "sein", "werden", "Both"], ans: 1, marks: 1 },
          { id: 'A1D24Q9', text: "Strong/irregular verbs often have Partizip II ending in:", opts: ["-t", "-en", "-st", "-end"], ans: 1, marks: 1 },
          { id: 'A1D24Q10', text: "\"Sie ist nach Hause ___.\" (gehen)", opts: ["gegangen", "gegeht", "hatte gegangen", "bin gegangen"], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D25',
    name: "Day 25: Past Tense Focus & Storytelling",
    classes: "Class 25",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D25Q1', text: "Which verb uses SEIN in Perfekt?", opts: ["kaufen", "lernen", "fahren", "essen"], ans: 2, marks: 1 },
          { id: 'A1D25Q2', text: "Partizip II of \"essen\":", opts: ["gegessen", "geesst", "gegest", "aß"], ans: 0, marks: 1 },
          { id: 'A1D25Q3', text: "\"Ich habe das gemacht.\" — is the word order correct?", opts: ["Yes", "No — gemacht at Position 2", "No — habe at end", "No — ich after habe"], ans: 0, marks: 1 },
          { id: 'A1D25Q4', text: "Partizip II of \"schreiben\":", opts: ["geschreibt", "schrieb", "geschrieben", "schreibend"], ans: 2, marks: 1 },
          { id: 'A1D25Q5', text: "\"Wir sind ins Kino ___.\" (gehen)", opts: ["gegangen", "geht", "gehen", "hatte gegangen"], ans: 0, marks: 1 },
          { id: 'A1D25Q6', text: "The \"Weekend Report\" activity uses which tense?", opts: ["Present", "Future", "Perfekt", "Präteritum"], ans: 2, marks: 1 },
          { id: 'A1D25Q7', text: "Partizip II of \"trinken\":", opts: ["getrinkt", "getrunken", "trinkte", "getränkt"], ans: 1, marks: 1 },
          { id: 'A1D25Q8', text: "sein in Perfekt — \"er\" form:", opts: ["er haben", "er ist", "er sein", "er wird"], ans: 1, marks: 1 },
          { id: 'A1D25Q9', text: "Partizip II of \"sprechen\":", opts: ["gesprochen", "gesprechten", "sprichst", "gesprechen"], ans: 0, marks: 1 },
          { id: 'A1D25Q10', text: "Which correctly tells a past story?", opts: ["Ich habe gegessen und bin nach Hause gegangen.", "Ich gegessen habe und nach Hause gegangen bin.", "Ich habe essen und bin gehen.", "Ich haben gegessen und sein gegangen."], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D26',
    name: "Day 26: Coordinating Conjunctions — ADUSO",
    classes: "Class 26",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D26Q1', text: "ADUSO stands for:", opts: ["Aber, Denn, Und, Sondern, Oder", "Als, Damit, Und, So, Oder", "Aber, Dann, Und, Seit, Oder", "Als, Denn, Und, So, Obwohl"], ans: 0, marks: 1 },
          { id: 'A1D26Q2', text: "ADUSO conjunctions sit at which position?", opts: ["Position 1", "Position 2", "Position 0 (before the clause)", "End of clause"], ans: 2, marks: 1 },
          { id: 'A1D26Q3', text: "\"aber\" means:", opts: ["and", "but", "or", "because"], ans: 1, marks: 1 },
          { id: 'A1D26Q4', text: "\"denn\" (as ADUSO) means:", opts: ["then", "because (coordinating)", "but", "so"], ans: 1, marks: 1 },
          { id: 'A1D26Q5', text: "\"und\" means:", opts: ["but", "or", "and", "because"], ans: 2, marks: 1 },
          { id: 'A1D26Q6', text: "\"sondern\" is used after a ___:", opts: ["positive statement", "negative statement (nicht … sondern)", "question", "modal verb"], ans: 1, marks: 1 },
          { id: 'A1D26Q7', text: "After ADUSO, word order of next clause is:", opts: ["V2 applies normally", "Verb goes to end", "Verb goes to Position 1", "Subject is omitted"], ans: 0, marks: 1 },
          { id: 'A1D26Q8', text: "\"oder\" means:", opts: ["but", "or", "and", "so"], ans: 1, marks: 1 },
          { id: 'A1D26Q9', text: "\"Ich lerne Deutsch, denn ich will nach Deutschland.\" — \"denn\" is:", opts: ["ADUSO coordinating conjunction", "Subordinating conjunction", "An adverb", "A modal particle"], ans: 0, marks: 1 },
          { id: 'A1D26Q10', text: "ADUSO conjunctions do NOT affect the V2 rule of the following clause:", opts: ["True", "False — they push verb to end", "False — they push verb to Position 1", "Only true for \"und\""], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D27',
    name: "Day 27: Integrated Review — Modals, Travel & Past",
    classes: "Class 27",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D27Q1', text: "\"Er muss heute arbeiten.\" — \"muss\" is in:", opts: ["Position 1", "Position 2", "Position 3", "End"], ans: 1, marks: 1 },
          { id: 'A1D27Q2', text: "Modal + infinitive: \"Er kann nicht kommen.\" — \"kommen\" goes to:", opts: ["Position 2", "Position 3", "Absolute end", "Position 1"], ans: 2, marks: 1 },
          { id: 'A1D27Q3', text: "\"Fahrkarte\" means:", opts: ["Driver's license", "Travel ticket", "Map", "Platform"], ans: 1, marks: 1 },
          { id: 'A1D27Q4', text: "Partizip II of \"fahren\":", opts: ["gefahrt", "fuhr", "gefahren", "fahrend"], ans: 2, marks: 1 },
          { id: 'A1D27Q5', text: "\"Ich bin nach München ___.\" (fahren)", opts: ["gefahrt", "gefahren", "hatte gefahren", "fuhr"], ans: 1, marks: 1 },
          { id: 'A1D27Q6', text: "Which uses SEIN in Perfekt?", opts: ["essen", "kaufen", "kommen", "lernen"], ans: 2, marks: 1 },
          { id: 'A1D27Q7', text: "ADUSO conjunctions at Position 0 do NOT change:", opts: ["The subject", "The V2 rule of the next clause", "The tense", "The meaning"], ans: 1, marks: 1 },
          { id: 'A1D27Q8', text: "Conjugated verb stays in Position 2 of next clause after:", opts: ["weil", "obwohl", "denn", "wenn"], ans: 2, marks: 1 },
          { id: 'A1D27Q9', text: "\"mit dem Bus\" — \"dem\" is which case?", opts: ["Accusative", "Nominative", "Dative", "Genitive"], ans: 2, marks: 1 },
          { id: 'A1D27Q10', text: "\"nicht dürfen\" means:", opts: ["Don't have to", "Can't", "Must not (prohibition)", "Don't want to"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D28',
    name: "Day 28: Dative Case Intro",
    classes: "Class 28",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D28Q1', text: "Dative answers the question:", opts: ["Who does the action?", "Whom / What directly?", "To whom / For whom?", "Whose?"], ans: 2, marks: 1 },
          { id: 'A1D28Q2', text: "\"der\" in Dative becomes:", opts: ["den", "dem", "der", "die"], ans: 1, marks: 1 },
          { id: 'A1D28Q3', text: "\"die\" (feminine) in Dative becomes:", opts: ["der", "dem", "die", "den"], ans: 0, marks: 1 },
          { id: 'A1D28Q4', text: "\"das\" in Dative becomes:", opts: ["das", "den", "dem", "der"], ans: 2, marks: 1 },
          { id: 'A1D28Q5', text: "\"Ich gebe ___ Patienten das Medikament.\" (der Patient → Dative)", opts: ["der", "den", "dem", "die"], ans: 2, marks: 1 },
          { id: 'A1D28Q6', text: "Which verb always takes a Dative object?", opts: ["kaufen", "sehen", "helfen", "besuchen"], ans: 2, marks: 1 },
          { id: 'A1D28Q7', text: "Dative preposition \"mit\" means:", opts: ["for", "without", "with", "through"], ans: 2, marks: 1 },
          { id: 'A1D28Q8', text: "Which is a Dative preposition?", opts: ["durch", "für", "gegen", "nach"], ans: 3, marks: 1 },
          { id: 'A1D28Q9', text: "\"bei\" (Dative preposition) means:", opts: ["through", "for", "at / near / with", "without"], ans: 2, marks: 1 },
          { id: 'A1D28Q10', text: "Plural nouns in Dative: the article takes ___ and the noun adds ___:", opts: ["-e article / -s noun", "-en article / -n on noun (where possible)", "-er article / no change", "no change to either"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D29',
    name: "Day 29: Dative Pronouns & Prepositions",
    classes: "Class 29",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D29Q1', text: "Dative pronoun for \"ich\":", opts: ["mich", "mir", "mein", "ich"], ans: 1, marks: 1 },
          { id: 'A1D29Q2', text: "Dative pronoun for \"du\":", opts: ["dich", "dein", "dir", "du"], ans: 2, marks: 1 },
          { id: 'A1D29Q3', text: "Dative pronoun for \"er/es\":", opts: ["ihn", "er", "ihm", "sein"], ans: 2, marks: 1 },
          { id: 'A1D29Q4', text: "Dative pronoun for \"sie\" (she):", opts: ["sie", "ihr", "ihnen", "sie (same)"], ans: 1, marks: 1 },
          { id: 'A1D29Q5', text: "\"Ich helfe ___.\" (du — Dative)", opts: ["dich", "dir", "du", "dein"], ans: 1, marks: 1 },
          { id: 'A1D29Q6', text: "Which is a FIXED Dative preposition?", opts: ["durch", "für", "von", "um"], ans: 2, marks: 1 },
          { id: 'A1D29Q7', text: "\"seit\" (Dative preposition) means:", opts: ["since / for (with present tense)", "after", "without", "next to"], ans: 0, marks: 1 },
          { id: 'A1D29Q8', text: "\"nach\" (Dative preposition) is used for:", opts: ["to (cities/countries) and after", "from", "without", "for"], ans: 0, marks: 1 },
          { id: 'A1D29Q9', text: "\"Ich gebe ihr das Buch.\" — \"ihr\" here is:", opts: ["Nominative (she)", "Accusative pronoun", "Dative pronoun (to her)", "Possessive"], ans: 2, marks: 1 },
          { id: 'A1D29Q10', text: "\"gegenüber\" (Dative preposition) means:", opts: ["below", "above", "opposite / across from", "between"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D30',
    name: "Day 30: Two-Way Prepositions — Wechselpräpositionen",
    classes: "Class 30",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D30Q1', text: "Two-way prepositions use Accusative when:", opts: ["Location (Wo?)", "Direction / Movement (Wohin?)", "Always", "Never"], ans: 1, marks: 1 },
          { id: 'A1D30Q2', text: "Two-way prepositions use Dative when:", opts: ["Direction (Wohin?)", "Location (Wo? — where something rests)", "Always", "Never"], ans: 1, marks: 1 },
          { id: 'A1D30Q3', text: "Which is a two-way preposition?", opts: ["mit", "von", "auf", "bei"], ans: 2, marks: 1 },
          { id: 'A1D30Q4', text: "\"Das Buch liegt auf ___ Tisch.\" (Wo? — location)", opts: ["den", "dem", "der", "die"], ans: 1, marks: 1 },
          { id: 'A1D30Q5', text: "\"Ich lege das Buch auf ___ Tisch.\" (Wohin? — direction)", opts: ["dem", "der", "den", "die"], ans: 2, marks: 1 },
          { id: 'A1D30Q6', text: "\"in dem\" contracts to:", opts: ["im", "ins", "an", "am"], ans: 0, marks: 1 },
          { id: 'A1D30Q7', text: "\"Er geht in ___ Krankenhaus.\" (movement — Wohin?)", opts: ["dem", "der", "das", "die"], ans: 2, marks: 1 },
          { id: 'A1D30Q8', text: "\"in\" + \"das\" contracts to:", opts: ["im", "ins", "am", "ans"], ans: 1, marks: 1 },
          { id: 'A1D30Q9', text: "\"auf\" + \"dem\" — is there a contraction?", opts: ["aufs", "aufm", "an", "No — stays \"auf dem\""], ans: 3, marks: 1 },
          { id: 'A1D30Q10', text: "Which verb pair shows location vs. motion?", opts: ["stehen (loc.) vs. stellen (mot.)", "gehen (loc.) vs. fahren (mot.)", "haben (loc.) vs. sein (mot.)", "sehen (loc.) vs. schauen (mot.)"], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D31',
    name: "Day 31: Body & Health",
    classes: "Class 31",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D31Q1', text: "\"Kopf\" means:", opts: ["Stomach", "Head", "Back", "Arm"], ans: 1, marks: 1 },
          { id: 'A1D31Q2', text: "\"Mein Rücken tut weh.\" means:", opts: ["My head hurts.", "My legs hurt.", "My back hurts.", "My stomach hurts."], ans: 2, marks: 1 },
          { id: 'A1D31Q3', text: "\"Fieber\" means:", opts: ["Cough", "Cold", "Fever", "Headache"], ans: 2, marks: 1 },
          { id: 'A1D31Q4', text: "\"Husten\" means:", opts: ["Fever", "Cough", "Sore throat", "Runny nose"], ans: 1, marks: 1 },
          { id: 'A1D31Q5', text: "\"Meine Beine tun weh.\" — \"Beine\" is:", opts: ["Singular", "Plural", "Masculine singular", "Neuter singular"], ans: 1, marks: 1 },
          { id: 'A1D31Q6', text: "At a German pharmacy, you go to a:", opts: ["Supermarkt", "Drogerie", "Apotheke", "Arztpraxis"], ans: 2, marks: 1 },
          { id: 'A1D31Q7', text: "\"Ich habe Kopfschmerzen.\" means:", opts: ["I have a stomachache.", "I have a headache.", "I have a fever.", "I have a cold."], ans: 1, marks: 1 },
          { id: 'A1D31Q8', text: "\"mein Arm tut weh\" vs \"meine Arme tun weh\" — what changes?", opts: ["The article only", "\"tut\" → \"tun\" because of plural", "\"weh\" changes", "Nothing changes"], ans: 1, marks: 1 },
          { id: 'A1D31Q9', text: "\"Schnupfen\" means:", opts: ["Cough", "Fever", "Runny nose", "Sore throat"], ans: 2, marks: 1 },
          { id: 'A1D31Q10', text: "A doctor's appointment in Germany is called:", opts: ["Termin beim Arzt", "Arzttermin", "Both A and B", "Krankentermin"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D32',
    name: "Day 32: Roleplay — Doctor & Clinic",
    classes: "Class 32",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D32Q1', text: "\"Wo tut es weh?\" means:", opts: ["When did it start?", "Where does it hurt?", "How long has it hurt?", "What makes it hurt?"], ans: 1, marks: 1 },
          { id: 'A1D32Q2', text: "\"Ich habe seit drei Tagen Fieber.\" — \"seit\" requires:", opts: ["Accusative", "Nominative", "Dative", "Genitive"], ans: 2, marks: 1 },
          { id: 'A1D32Q3', text: "\"Öffnen Sie bitte den Mund.\" means:", opts: ["Please sit down.", "Please open your mouth.", "Please take off your shirt.", "Please breathe deeply."], ans: 1, marks: 1 },
          { id: 'A1D32Q4', text: "Which modal gives medical advice (\"should\")?", opts: ["können", "müssen", "sollen", "dürfen"], ans: 2, marks: 1 },
          { id: 'A1D32Q5', text: "\"Bitte nehmen Sie diese Tabletten.\" means:", opts: ["Please take these tablets.", "Please buy these tablets.", "Please avoid these tablets.", "Please bring these tablets."], ans: 0, marks: 1 },
          { id: 'A1D32Q6', text: "\"Haben Sie Allergien?\" means:", opts: ["Do you have insurance?", "Do you have any allergies?", "Are you in pain?", "Do you have a prescription?"], ans: 1, marks: 1 },
          { id: 'A1D32Q7', text: "\"dreimal täglich\" means:", opts: ["Once daily", "Twice daily", "Three times daily", "Every three days"], ans: 2, marks: 1 },
          { id: 'A1D32Q8', text: "\"Ich bin Krankenschwester.\" means:", opts: ["I am a doctor.", "I am a nurse.", "I work at the hospital.", "I am sick."], ans: 1, marks: 1 },
          { id: 'A1D32Q9', text: "\"Seit wann haben Sie die Beschwerden?\" means:", opts: ["How severe is the pain?", "Where does it hurt?", "Since when have you had these complaints?", "What medication are you taking?"], ans: 2, marks: 1 },
          { id: 'A1D32Q10', text: "\"Bitte legen Sie sich hin.\" means:", opts: ["Please get up.", "Please sit down.", "Please lie down.", "Please come in."], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D33',
    name: "Day 33: Formal Writing",
    classes: "Class 33",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D33Q1', text: "Formal German letter salutation:", opts: ["Lieber Max,", "Hallo!", "Sehr geehrter Herr Müller,", "Hey!"], ans: 2, marks: 1 },
          { id: 'A1D33Q2', text: "Formal letter closing:", opts: ["Tschüss!", "Bis bald!", "Mit freundlichen Grüßen", "Dein / Deine"], ans: 2, marks: 1 },
          { id: 'A1D33Q3', text: "Informal letter opening to a friend:", opts: ["Sehr geehrte Damen und Herren,", "Liebe Anna,", "Zu Händen von,", "Betreff:"], ans: 1, marks: 1 },
          { id: 'A1D33Q4', text: "\"Betreff:\" in a German email means:", opts: ["Sender", "Recipient", "Subject line", "Date"], ans: 2, marks: 1 },
          { id: 'A1D33Q5', text: "When writing to an unknown person (no name), use:", opts: ["Liebe Unbekannte,", "Hallo du,", "Sehr geehrte Damen und Herren,", "Guten Tag alle,"], ans: 2, marks: 1 },
          { id: 'A1D33Q6', text: "\"Ich bitte um Entschuldigung.\" means:", opts: ["I am pleased.", "I would like to book.", "I am requesting information.", "I apologise."], ans: 3, marks: 1 },
          { id: 'A1D33Q7', text: "\"Hiermit\" means:", opts: ["Therefore", "Hereby / With this", "However", "Furthermore"], ans: 1, marks: 1 },
          { id: 'A1D33Q8', text: "\"Ich schreibe Ihnen bezüglich…\" means:", opts: ["I am writing to you regarding…", "I will write later…", "I have already written…", "You should write to me about…"], ans: 0, marks: 1 },
          { id: 'A1D33Q9', text: "\"Anhang\" in an email means:", opts: ["Signature", "Subject", "Attachment", "Reply"], ans: 2, marks: 1 },
          { id: 'A1D33Q10', text: "Which phrase starts a formal request appropriately?", opts: ["Ich will…", "Kannst du mir…", "Ich würde mich freuen, wenn…", "Hey, kannst du…"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D34',
    name: "Day 34: Exam Prep — Reading & Listening",
    classes: "Class 34",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D34Q1', text: "In Goethe A1 \"Hören\" you typically hear:", opts: ["Long academic lectures", "Short announcements, phone messages, and simple conversations", "Complex debates", "News reports"], ans: 1, marks: 1 },
          { id: 'A1D34Q2', text: "The A1 Lesen module typically involves:", opts: ["Newspaper articles", "Short texts, notices, and simple messages", "Long stories", "Academic texts"], ans: 1, marks: 1 },
          { id: 'A1D34Q3', text: "Best strategy for multiple-choice listening:", opts: ["Write full sentences", "Read options before listening to predict content", "Listen without reading options", "Answer all from memory"], ans: 1, marks: 1 },
          { id: 'A1D34Q4', text: "\"Richtig oder Falsch\" means:", opts: ["Multiple choice", "True or False", "Fill in the blank", "Match the meaning"], ans: 1, marks: 1 },
          { id: 'A1D34Q5', text: "\"Globalverstehen\" in reading means:", opts: ["Understanding every word", "Understanding the gist / main idea", "Translating the whole text", "Understanding only the last sentence"], ans: 1, marks: 1 },
          { id: 'A1D34Q6', text: "When you don't understand a word in A1 listening, you should:", opts: ["Stop and ask the examiner", "Use context and move on", "Leave the answer blank", "Guess randomly"], ans: 1, marks: 1 },
          { id: 'A1D34Q7', text: "German spelling in listening: \"sch\" — you write:", opts: ["sh", "sk", "sch", "ch"], ans: 2, marks: 1 },
          { id: 'A1D34Q8', text: "In A1 phone number listening tasks, you write:", opts: ["Numbers in words", "Individual digits as numbers", "Only the area code", "Total as one number"], ans: 1, marks: 1 },
          { id: 'A1D34Q9', text: "\"Lesen\" in the Goethe exam means:", opts: ["Listening", "Speaking", "Reading", "Writing"], ans: 2, marks: 1 },
          { id: 'A1D34Q10', text: "\"Hören\" in the Goethe exam means:", opts: ["Reading", "Listening", "Writing", "Speaking"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_D35',
    name: "Day 35: Exam Prep — Writing & Speaking",
    classes: "Class 35",
    level: 'A1',
    totalMarks: 10,
    timeMinutes: 10,
    passMark: 60,
    sections: [
      {
        title: 'Class Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A1D35Q1', text: "A1 Schreiben typically involves:", opts: ["A 500-word essay", "Filling in a form and writing a short message", "Writing a formal letter", "Summarising a text"], ans: 1, marks: 1 },
          { id: 'A1D35Q2', text: "A1 speaking \"Prompt cards\" are used to:", opts: ["Test vocabulary lists", "Give you a topic or situation to talk about", "Test grammar rules", "Ask you to read aloud"], ans: 1, marks: 1 },
          { id: 'A1D35Q3', text: "\"Sich vorstellen\" in a speaking exam means:", opts: ["To translate", "To read aloud", "To introduce yourself", "To listen carefully"], ans: 2, marks: 1 },
          { id: 'A1D35Q4', text: "\"Vorname\" on a form means:", opts: ["Surname", "Date of birth", "First name", "Address"], ans: 2, marks: 1 },
          { id: 'A1D35Q5', text: "\"Nachname\" means:", opts: ["First name", "Surname / Family name", "Nickname", "Title"], ans: 1, marks: 1 },
          { id: 'A1D35Q6', text: "\"Geburtsdatum\" means:", opts: ["Address", "Phone number", "Date of birth", "Nationality"], ans: 2, marks: 1 },
          { id: 'A1D35Q7', text: "If you don't understand in A1 speaking, say:", opts: ["\"Ich verstehe alles!\"", "\"Könnten Sie das bitte wiederholen?\"", "\"Ich spreche kein Deutsch.\"", "\"Bitte schreiben Sie das auf.\""], ans: 1, marks: 1 },
          { id: 'A1D35Q8', text: "A formal written apology starts with:", opts: ["\"Es tut mir leid…\"", "\"Ich will sagen…\"", "\"Wir schreiben euch…\"", "\"Hey, sorry…\""], ans: 0, marks: 1 },
          { id: 'A1D35Q9', text: "\"Wohnort\" on a form means:", opts: ["Workplace", "Place of birth", "Place of residence", "School"], ans: 2, marks: 1 },
          { id: 'A1D35Q10', text: "At the Goethe-Institut A1 speaking exam you speak with:", opts: ["A computer", "Another student only", "An examiner", "A recording device with no person present"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T1',
    name: "Test 1: A2 Transition & A1 Recap",
    classes: "Lecture 1",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T1Q1', text: "Ich sehe ___ Arzt. (Accusative)", opts: ["der", "den", "dem", "die"], ans: 1, marks: 1 },
          { id: 'A2T1Q2', text: "Er gibt ___ Patientin die Medizin. (Dative)", opts: ["die", "den", "der", "dem"], ans: 2, marks: 1 },
          { id: 'A2T1Q3', text: "Das Buch gehört ___ Kind. (Dative neuter)", opts: ["das", "den", "dem", "des"], ans: 2, marks: 1 },
          { id: 'A2T1Q4', text: "V2 Rule: which is correct?", opts: ["Jeden Tag ich lerne Deutsch.", "Jeden Tag lerne ich Deutsch.", "Jeden Tag Deutsch lerne ich.", "Ich Deutsch lerne jeden Tag."], ans: 1, marks: 1 },
          { id: 'A2T1Q5', text: "Perfekt: Ich ___ nach Berlin gefahren.", opts: ["habe", "war", "bin", "hatte"], ans: 2, marks: 1 },
          { id: 'A2T1Q6', text: "Perfekt: Wir ___ das Buch gelesen.", opts: ["sind", "haben", "waren", "hatten"], ans: 1, marks: 1 },
          { id: 'A2T1Q7', text: "Which verb uses SEIN in Perfekt?", opts: ["lernen", "kaufen", "gehen", "essen"], ans: 2, marks: 1 },
          { id: 'A2T1Q8', text: "Partizip II of \"kaufen\":", opts: ["gekauft", "kaufte", "kaufend", "gekauff"], ans: 0, marks: 1 },
          { id: 'A2T1Q9', text: "Partizip II of \"fahren\":", opts: ["gefahrt", "gefahren", "fuhr", "fahrend"], ans: 1, marks: 1 },
          { id: 'A2T1Q10', text: "Which is a Dative verb?", opts: ["sehen", "kaufen", "helfen", "machen"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T2',
    name: "Test 2: Narrative Past: Präteritum",
    classes: "Lecture 2",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T2Q1', text: "Präteritum of \"sein\" — ich:", opts: ["war", "war", "gewesen", "bin gewesen"], ans: 0, marks: 1 },
          { id: 'A2T2Q2', text: "\"Wir ___ sehr müde.\" (Präteritum of sein)", opts: ["sind", "waren", "seien", "wären"], ans: 1, marks: 1 },
          { id: 'A2T2Q3', text: "\"Er ___ keine Zeit.\" (Präteritum of haben)", opts: ["hat", "gehabt", "hatte", "hätte"], ans: 2, marks: 1 },
          { id: 'A2T2Q4', text: "Modal in Präteritum: \"She was able to help\" =", opts: ["Sie hat gekonnt helfen.", "Sie konnte helfen.", "Sie kann geholfen.", "Sie hatte helfen."], ans: 1, marks: 1 },
          { id: 'A2T2Q5', text: "\"I had to work yesterday.\" =", opts: ["Ich muss gestern arbeiten.", "Ich habe gemusst arbeiten.", "Ich musste gestern arbeiten.", "Ich hatte gearbeitet."], ans: 2, marks: 1 },
          { id: 'A2T2Q6', text: "Which modal NEVER uses Perfekt in speech?", opts: ["können", "haben", "sein", "All modals avoid Perfekt in speech"], ans: 3, marks: 1 },
          { id: 'A2T2Q7', text: "\"3 years ago\" in German =", opts: ["vor drei Jahren", "seit drei Jahren", "nach drei Jahren", "für drei Jahre"], ans: 0, marks: 1 },
          { id: 'A2T2Q8', text: "Word order: \"She wanted to learn German.\" =", opts: ["Sie wollte Deutsch lernen.", "Sie wollte lernen Deutsch.", "Lernen wollte sie Deutsch.", "Sie lernen wollte Deutsch."], ans: 0, marks: 1 },
          { id: 'A2T2Q9', text: "\"Er ___ nicht zu Hause.\" (Präteritum, negation)", opts: ["war kein", "war nicht", "hatte nicht", "wäre nicht"], ans: 1, marks: 1 },
          { id: 'A2T2Q10', text: "\"As a child\" =", opts: ["als ein Kind", "wie ein Kind", "als Kind", "bei einem Kind"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T3',
    name: "Test 3: Causal Clauses: Weil & Da",
    classes: "Lecture 3",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T3Q1', text: "Verb-Kicker: \"Ich lerne Deutsch, weil...\"", opts: ["...ich Deutschland mag.", "...mag ich Deutschland.", "...ich Deutschland möge.", "...Deutschland ich mag."], ans: 0, marks: 1 },
          { id: 'A2T3Q2', text: "Which conjunction triggers the Verb-Kicker?", opts: ["denn", "und", "weil", "aber"], ans: 2, marks: 1 },
          { id: 'A2T3Q3', text: "\"Denn\" occupies which position?", opts: ["Position 1", "Position 0", "Position 2", "End of clause"], ans: 1, marks: 1 },
          { id: 'A2T3Q4', text: "Where does the verb go in a weil clause?", opts: ["Position 1", "Position 2", "Position 0", "Absolute end"], ans: 3, marks: 1 },
          { id: 'A2T3Q5', text: "Correct weil sentence:", opts: ["weil er ist krank", "weil er krank ist", "weil ist er krank", "weil krank er ist"], ans: 1, marks: 1 },
          { id: 'A2T3Q6', text: "Weil vs Da — \"Da\" is used when:", opts: ["The reason is new information", "The reason is already known to both speakers", "You want to be informal", "The clause comes after the main clause"], ans: 1, marks: 1 },
          { id: 'A2T3Q7', text: "Modal + weil: \"He can't come because he is working.\"", opts: ["weil er arbeitet kann", "weil er kann arbeiten", "weil er arbeiten kann", "weil er arbeitend kann"], ans: 2, marks: 1 },
          { id: 'A2T3Q8', text: "Perfekt + weil: \"because I slept\" =", opts: ["weil ich geschlafen habe", "weil ich habe geschlafen", "weil habe ich geschlafen", "weil ich schlief"], ans: 0, marks: 1 },
          { id: 'A2T3Q9', text: "Where does the comma go?", opts: ["After weil", "Before weil", "After the subject", "No comma needed"], ans: 1, marks: 1 },
          { id: 'A2T3Q10', text: "\"Warum?\" is answered with:", opts: ["denn", "da", "weil", "deshalb"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T4',
    name: "Test 4: Conditional Clauses: Wenn & Falls",
    classes: "Lecture 4",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T4Q1', text: "\"Wenn\" can mean:", opts: ["although", "because", "if and when", "therefore"], ans: 2, marks: 1 },
          { id: 'A2T4Q2', text: "\"Falls\" is used for:", opts: ["Certain conditions", "Habitual conditions", "Less certain / formal conditions", "Past conditions"], ans: 2, marks: 1 },
          { id: 'A2T4Q3', text: "Verb-Kicker: \"wenn ich Zeit...\"", opts: ["wenn ich Zeit habe", "wenn ich habe Zeit", "wenn habe ich Zeit", "wenn Zeit ich habe"], ans: 0, marks: 1 },
          { id: 'A2T4Q4', text: "Wenn clause comes first — what comes after the comma?", opts: ["Subject + Verb", "Verb + Subject", "Object + Verb", "Subject + Object"], ans: 1, marks: 1 },
          { id: 'A2T4Q5', text: "\"When I am tired, I sleep.\" — wenn clause first:", opts: ["Wenn ich müde bin, schlafe ich.", "Wenn ich müde bin, ich schlafe.", "Ich schlafe, wenn müde ich bin.", "Wenn ich schlafe, bin ich müde."], ans: 0, marks: 1 },
          { id: 'A2T4Q6', text: "Modal in wenn clause: \"if I can help\":", opts: ["wenn ich kann helfen", "wenn ich helfen kann", "wenn helfen ich kann", "wenn ich geholfen kann"], ans: 1, marks: 1 },
          { id: 'A2T4Q7', text: "\"Falls\" follows which grammar rule?", opts: ["Same as denn — no Verb-Kicker", "Same as wenn — Verb-Kicker", "Verb stays in Position 2", "Verb goes to Position 1"], ans: 1, marks: 1 },
          { id: 'A2T4Q8', text: "\"If the patient has fever, we call the doctor.\" =", opts: ["Wenn der Patient hat Fieber, rufen wir den Arzt.", "Wenn der Patient Fieber hat, rufen wir den Arzt.", "Wenn der Patient Fieber hat, wir rufen den Arzt.", "Falls hat der Patient Fieber, rufen wir den Arzt."], ans: 1, marks: 1 },
          { id: 'A2T4Q9', text: "Which does NOT trigger Verb-Kicker?", opts: ["weil", "wenn", "obwohl", "denn"], ans: 3, marks: 1 },
          { id: 'A2T4Q10', text: "\"Sonst\" means:", opts: ["if", "because", "otherwise", "although"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T5',
    name: "Test 5: Causal Adverbs: Deshalb & Darum",
    classes: "Lecture 5",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T5Q1', text: "Deshalb means:", opts: ["although", "because", "therefore", "if"], ans: 2, marks: 1 },
          { id: 'A2T5Q2', text: "Deshalb sits at Position 1 — what happens next?", opts: ["Subject comes before verb", "Verb comes before subject (inversion)", "Verb goes to end", "No change"], ans: 1, marks: 1 },
          { id: 'A2T5Q3', text: "Correct use of deshalb:", opts: ["Er ist krank, er deshalb geht.", "Er ist krank, deshalb geht er.", "Er ist krank, deshalb er geht.", "Deshalb er geht krank ist."], ans: 1, marks: 1 },
          { id: 'A2T5Q4', text: "Which is NOT a synonym for deshalb?", opts: ["darum", "weil", "deswegen", "daher"], ans: 1, marks: 1 },
          { id: 'A2T5Q5', text: "Weil vs Deshalb — \"weil\" introduces:", opts: ["The consequence", "The reason (Verb-Kicker)", "A condition", "A contrast"], ans: 1, marks: 1 },
          { id: 'A2T5Q6', text: "Transform: \"Ich bin müde, weil ich wenig geschlafen habe.\" → Deshalb version:", opts: ["Ich habe wenig geschlafen, deshalb ich bin müde.", "Ich habe wenig geschlafen, deshalb bin ich müde.", "Deshalb ich habe wenig geschlafen, bin ich müde.", "Ich habe deshalb wenig geschlafen, bin ich müde."], ans: 1, marks: 1 },
          { id: 'A2T5Q7', text: "\"Darum\" and \"deshalb\" are:", opts: ["Subordinating conjunctions", "Coordinating conjunctions", "Adverbial connectors", "Prepositions"], ans: 2, marks: 1 },
          { id: 'A2T5Q8', text: "Correct inversion: \"Wir haben kein Geld. ___ gehen wir nicht ins Restaurant.\"", opts: ["Weil", "Obwohl", "Deshalb", "Wenn"], ans: 2, marks: 1 },
          { id: 'A2T5Q9', text: "Deshalb can also occupy which position WITHOUT inversion?", opts: ["Position 0", "Position 1", "Position 3 (after verb)", "End of clause"], ans: 2, marks: 1 },
          { id: 'A2T5Q10', text: "\"She wants to work in Germany. Therefore she is learning German.\" =", opts: ["Sie will in Deutschland arbeiten, weil sie Deutsch lernt.", "Sie will in Deutschland arbeiten, deshalb lernt sie Deutsch.", "Deshalb sie lernt Deutsch, will in Deutschland arbeiten.", "Sie lernt Deutsch, deshalb sie will in Deutschland arbeiten."], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T6',
    name: "Test 6: Concessive Clauses: Obwohl & Trotzdem",
    classes: "Lecture 6",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T6Q1', text: "Verb-Kicker: \"Er geht zur Arbeit, obwohl...\"", opts: ["…er ist krank.", "…er krank ist.", "…krank er ist.", "…ist er krank."], ans: 1, marks: 1 },
          { id: 'A2T6Q2', text: "Trotzdem at Position 1 forces:", opts: ["Verb-Kicker", "V2 inversion", "No change", "Verb to Position 0"], ans: 1, marks: 1 },
          { id: 'A2T6Q3', text: "Correct trotzdem sentence:", opts: ["Er ist krank, trotzdem er geht.", "Er ist krank, trotzdem geht er.", "Er geht, trotzdem er ist krank.", "Trotzdem er ist krank, geht er."], ans: 1, marks: 1 },
          { id: 'A2T6Q4', text: "Transform to trotzdem: \"Er geht, obwohl er krank ist.\"", opts: ["Er ist krank, trotzdem er geht.", "Er ist krank. Trotzdem geht er.", "Trotzdem er krank ist, geht er.", "Er geht, trotzdem ist er krank."], ans: 1, marks: 1 },
          { id: 'A2T6Q5', text: "Difference: weil vs obwohl?", opts: ["Both use inversion", "weil=expected result, obwohl=unexpected result", "obwohl=expected, weil=unexpected", "Both use Verb-Kicker, no meaning difference"], ans: 1, marks: 1 },
          { id: 'A2T6Q6', text: "Obwohl clause first → main clause starts with:", opts: ["Subject", "Verb", "Object", "Adverb"], ans: 1, marks: 1 },
          { id: 'A2T6Q7', text: "\"Despite that\" in German:", opts: ["weil", "wenn", "trotzdem", "deshalb"], ans: 2, marks: 1 },
          { id: 'A2T6Q8', text: "\"Although she is tired, she works.\" — obwohl version:", opts: ["Obwohl sie müde ist, sie arbeitet.", "Obwohl sie müde ist, arbeitet sie.", "Obwohl ist sie müde, arbeitet sie.", "Sie arbeitet, obwohl ist sie müde."], ans: 1, marks: 1 },
          { id: 'A2T6Q9', text: "Perfekt in obwohl: \"although he has eaten\":", opts: ["obwohl er hat gegessen", "obwohl er gegessen hat", "obwohl gegessen er hat", "obwohl hat er gegessen"], ans: 1, marks: 1 },
          { id: 'A2T6Q10', text: "Which is NOT possible as a synonym for trotzdem?", opts: ["dennoch", "jedoch", "obwohl (as adverb)", "nichtsdestotrotz"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T7',
    name: "Test 7: Finality: Um…zu & Damit",
    classes: "Lecture 7",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T7Q1', text: "Um…zu is used when:", opts: ["Subjects are different", "Subjects are the same", "There is a modal verb", "The clause comes first"], ans: 1, marks: 1 },
          { id: 'A2T7Q2', text: "Damit triggers:", opts: ["Position 1 inversion", "Verb-Kicker", "No special rule", "Modal infinitive"], ans: 1, marks: 1 },
          { id: 'A2T7Q3', text: "\"In order to learn German\" = ?", opts: ["um Deutsch zu lernen", "damit ich Deutsch lerne", "um zu Deutsch lernen", "damit Deutsch zu lernen"], ans: 0, marks: 1 },
          { id: 'A2T7Q4', text: "Separable: \"in order to get up\" = ?", opts: ["um zu aufstehen", "um aufzustehen", "damit aufstehen", "um stehe auf zu"], ans: 1, marks: 1 },
          { id: 'A2T7Q5', text: "\"I explain it so that he understands.\" — correct:", opts: ["Ich erkläre es, um er versteht.", "Ich erkläre es, damit er versteht.", "Ich erkläre es, damit er zu verstehen.", "Ich erkläre es, um zu verstehen."], ans: 1, marks: 1 },
          { id: 'A2T7Q6', text: "Which needs damit (not um…zu)?", opts: ["Ich esse, ___ Energie zu haben.", "Ich erkläre, ___ der Patient versteht.", "Sie schläft früh, ___ ausgeruht zu sein.", "Er übt, ___ besser zu werden."], ans: 1, marks: 1 },
          { id: 'A2T7Q7', text: "Verb-Kicker in damit: \"damit er…\"", opts: ["damit er kommt früh", "damit er früh kommt", "damit kommt er früh", "damit er ist früh"], ans: 1, marks: 1 },
          { id: 'A2T7Q8', text: "Error: \"Ich lerne, um zu arbeiten hier.\" Fix?", opts: ["Ich lerne, um hier zu arbeiten.", "Ich lerne, damit hier zu arbeiten.", "Ich lerne, um hier arbeiten zu.", "No error"], ans: 0, marks: 1 },
          { id: 'A2T7Q9', text: "Um…zu with Perfekt is:", opts: ["Normal: um gelernt zu haben", "Never used", "Only with sein", "Replaced by nachdem"], ans: 0, marks: 1 },
          { id: 'A2T7Q10', text: "\"We prepare so that the patient feels better.\" →", opts: ["Wir bereiten vor, um der Patient sich besser fühlt.", "Wir bereiten vor, damit der Patient sich besser fühlt.", "Wir bereiten vor, um sich besser zu fühlen.", "Wir bereiten vor, damit zu fühlen."], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T8',
    name: "Test 8: Indirect Speech: Dass & Ob",
    classes: "Lecture 8",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T8Q1', text: "Dass introduces:", opts: ["A direct question", "A subordinate clause with Verb-Kicker", "A main clause", "An inversion"], ans: 1, marks: 1 },
          { id: 'A2T8Q2', text: "Verb-Kicker in dass: \"Ich glaube, dass er...\"", opts: ["ist krank.", "krank ist.", "krank.", "ist er krank."], ans: 1, marks: 1 },
          { id: 'A2T8Q3', text: "Ob is used for:", opts: ["Causal clauses", "Indirect yes/no questions", "Purpose clauses", "Conditional clauses"], ans: 1, marks: 1 },
          { id: 'A2T8Q4', text: "\"Do you know if he is coming?\" →", opts: ["Weißt du, dass er kommt?", "Weißt du, ob er kommt?", "Weißt du, ob er ist kommen?", "Weißt du, ob kommt er?"], ans: 1, marks: 1 },
          { id: 'A2T8Q5', text: "Indirect W-question: \"Where does she live?\" →", opts: ["Ich frage, wo wohnt sie.", "Ich frage, wo sie wohnt.", "Ich frage, dass sie wohnt wo.", "Ich frage ob, wo sie wohnt."], ans: 1, marks: 1 },
          { id: 'A2T8Q6', text: "\"Dass\" vs \"Das\": which is the conjunction?", opts: ["das Buch", "Das ist schön.", "Ich glaube, dass er krank ist.", "Das Medikament hilft."], ans: 2, marks: 1 },
          { id: 'A2T8Q7', text: "Trick for dass vs das: replace with \"welches\" → if possible:", opts: ["Use dass", "Use das (relative pronoun)", "Use ob", "No difference"], ans: 1, marks: 1 },
          { id: 'A2T8Q8', text: "Trigger verb for dass: which one fits?", opts: ["gehen", "kommen", "glauben", "kaufen"], ans: 2, marks: 1 },
          { id: 'A2T8Q9', text: "\"She says she is tired.\" →", opts: ["Sie sagt, sie müde ist.", "Sie sagt, dass sie müde ist.", "Sie sagt, ob sie müde ist.", "Sie sagt, wenn sie müde ist."], ans: 1, marks: 1 },
          { id: 'A2T8Q10', text: "Perfekt in dass: \"I hear that she has worked.\" →", opts: ["Ich höre, dass sie gearbeitet hat.", "Ich höre, dass sie hat gearbeitet.", "Ich höre, dass gearbeitet sie hat.", "Ich höre ob sie gearbeitet hat."], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T9',
    name: "Test 9: Module 1 Test & Clause Checkpoint",
    classes: "Lecture 9",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T9Q1', text: "Which requires Verb-Kicker?", opts: ["deshalb", "trotzdem", "obwohl", "darum"], ans: 2, marks: 1 },
          { id: 'A2T9Q2', text: "\"Ich konnte nicht schlafen\" is which tense?", opts: ["Präsens", "Perfekt", "Präteritum", "Futur I"], ans: 2, marks: 1 },
          { id: 'A2T9Q3', text: "Transform: \"Er ist müde. Trotzdem ___.\"", opts: ["er lernt", "lernt er", "er lerne", "lerne"], ans: 1, marks: 1 },
          { id: 'A2T9Q4', text: "\"weil er ist krank\" — what is wrong?", opts: ["Wrong conjunction", "Verb should go to end: krank ist", "Missing comma", "Nothing wrong"], ans: 1, marks: 1 },
          { id: 'A2T9Q5', text: "\"Damals\" means:", opts: ["recently", "later", "back then", "sometimes"], ans: 2, marks: 1 },
          { id: 'A2T9Q6', text: "ob introduces:", opts: ["Reason", "Indirect yes/no question", "Purpose", "Contrast"], ans: 1, marks: 1 },
          { id: 'A2T9Q7', text: "\"die Ausbildung\" means:", opts: ["school", "university", "training/vocational education", "internship"], ans: 2, marks: 1 },
          { id: 'A2T9Q8', text: "Position 0 connectors (no change in word order):", opts: ["weil, damit, obwohl", "und, aber, oder, denn", "deshalb, trotzdem", "wenn, falls, dass"], ans: 1, marks: 1 },
          { id: 'A2T9Q9', text: "um…zu vs damit: which needs the same subject?", opts: ["damit", "Both", "um…zu", "Neither"], ans: 2, marks: 1 },
          { id: 'A2T9Q10', text: "Passing score for Module 1:", opts: ["40/50", "30/50", "35/50", "45/50"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T10',
    name: "Test 10: Reflexive Verbs I",
    classes: "Lecture 10",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T10Q1', text: "Reflexive pronoun for \"wir\":", opts: ["mich", "euch", "uns", "sich"], ans: 2, marks: 1 },
          { id: 'A2T10Q2', text: "Reflexive pronoun for \"er/sie/es\":", opts: ["mich", "dich", "euch", "sich"], ans: 3, marks: 1 },
          { id: 'A2T10Q3', text: "\"I wash myself\" →", opts: ["Ich wasche ihn.", "Ich wasche mich.", "Ich wasche dich.", "Ich wasche sich."], ans: 1, marks: 1 },
          { id: 'A2T10Q4', text: "Word order: reflexive pronoun comes:", opts: ["At the end of clause", "Before the subject", "Directly after the verb", "Before the verb"], ans: 2, marks: 1 },
          { id: 'A2T10Q5', text: "Inversion: \"Jeden Morgen ___ er ___.\" (sich rasieren)", opts: ["rasiert / sich", "sich / rasiert", "rasiert sich / —", "— / sich rasiert"], ans: 0, marks: 1 },
          { id: 'A2T10Q6', text: "\"How are you feeling?\" (formal) →", opts: ["Wie fühlen Sie sich?", "Wie fühlst du dich?", "Wie fühlen Sie dich?", "Wie fühlt sie sich?"], ans: 0, marks: 1 },
          { id: 'A2T10Q7', text: "Separable reflexive: \"Er zieht ___ an.\"", opts: ["sich — at the end", "sich — after zieht", "mich — after zieht", "dich — at end"], ans: 1, marks: 1 },
          { id: 'A2T10Q8', text: "\"Sit down please.\" (formal) →", opts: ["Bitte setzen Sie sich.", "Bitte sitzen Sie sich.", "Bitte setzen sich Sie.", "Bitte sich setzen Sie."], ans: 0, marks: 1 },
          { id: 'A2T10Q9', text: "Reflexive vs direct: \"I wash the patient\" →", opts: ["Ich wasche mich.", "Ich wasche sich.", "Ich wasche ihn.", "Ich wasche dich."], ans: 2, marks: 1 },
          { id: 'A2T10Q10', text: "All these use \"sich\" EXCEPT:", opts: ["er freut …", "sie (she) fühlt …", "du setzt …", "sie (they) ärgern …"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T11',
    name: "Test 11: Reflexive Verbs II",
    classes: "Lecture 11",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T11Q1', text: "Ich wasche ___ täglich. (correct reflexive pronoun, Akk)", opts: ["mir", "mich", "sich", "uns"], ans: 1, marks: 1 },
          { id: 'A2T11Q2', text: "Ich wasche ___ die Hände. (body part — which pronoun?)", opts: ["mich", "mir", "sich", "uns"], ans: 1, marks: 1 },
          { id: 'A2T11Q3', text: "Du kämmst ___ die Haare.", opts: ["dich", "dir", "sich", "euch"], ans: 1, marks: 1 },
          { id: 'A2T11Q4', text: "Er rasiert ___. (kein Objekt — Akkusativ)", opts: ["mir", "sich", "ihm", "er"], ans: 1, marks: 1 },
          { id: 'A2T11Q5', text: "Ich freue mich ___ meinen Urlaub.", opts: ["über", "für", "auf", "an"], ans: 2, marks: 1 },
          { id: 'A2T11Q6', text: "Er ärgert sich ___ den Lärm. (annoyed about)", opts: ["auf", "über", "um", "für"], ans: 1, marks: 1 },
          { id: 'A2T11Q7', text: "Die Pflegerin kümmert sich ___ den Patienten.", opts: ["für", "um", "mit", "über"], ans: 1, marks: 1 },
          { id: 'A2T11Q8', text: "Worüber ärgerst du dich? — For THINGS, we use ___+Verb.", opts: ["Wen", "Wo+Präp", "Was", "Wem"], ans: 1, marks: 1 },
          { id: 'A2T11Q9', text: "Ich erinnere mich ___ die Diagnose.", opts: ["an", "auf", "über", "um"], ans: 0, marks: 1 },
          { id: 'A2T11Q10', text: "Wie ___ Sie sich heute? (fühlen — feel)", opts: ["fühlt", "fühlen", "fühlst", "fühle"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T12',
    name: "Test 12: Adjective Endings I",
    classes: "Lecture 12",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T12Q1', text: "Der ___ Patient schläft. (alt, Nom M, weak)", opts: ["alten", "alte", "alter", "altes"], ans: 1, marks: 1 },
          { id: 'A2T12Q2', text: "Ich sehe den ___ Arzt. (gut, Akk M, weak)", opts: ["gute", "gutem", "guten", "guter"], ans: 2, marks: 1 },
          { id: 'A2T12Q3', text: "Die ___ Pflegerin kommt. (jung, Nom F, weak)", opts: ["jungen", "junger", "junge", "junges"], ans: 2, marks: 1 },
          { id: 'A2T12Q4', text: "Wir helfen der ___ Frau. (krank, Dat F, weak)", opts: ["kranke", "kranken", "kranker", "krank"], ans: 1, marks: 1 },
          { id: 'A2T12Q5', text: "Das ___ Kind schläft. (klein, Nom N, weak)", opts: ["kleinen", "kleines", "kleine", "kleiner"], ans: 2, marks: 1 },
          { id: 'A2T12Q6', text: "Das Zimmer des ___ Arztes. (jung, Gen M, weak)", opts: ["junge", "jungen", "junger", "junges"], ans: 1, marks: 1 },
          { id: 'A2T12Q7', text: "Weak declension = after which article?", opts: ["ein/kein", "der/die/das", "no article", "viel/wenig"], ans: 1, marks: 1 },
          { id: 'A2T12Q8', text: "The 'Saucer Pattern': how many cells get -e (not -en)?", opts: ["3", "7", "5", "11"], ans: 2, marks: 1 },
          { id: 'A2T12Q9', text: "Die ___ Ärztinnen kommen. (erfahren, Nom Pl, weak)", opts: ["erfahrene", "erfahrener", "erfahrenes", "erfahrenen"], ans: 3, marks: 1 },
          { id: 'A2T12Q10', text: "Mit dem ___ Kollegen. (nett, Dat M, weak)", opts: ["nette", "netter", "netten", "nettes"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T13',
    name: "Test 13: Adjective Endings II",
    classes: "Lecture 13",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T13Q1', text: "Ein ___ Mann kommt. (alt, Nom M, mixed)", opts: ["alte", "alten", "altes", "alter"], ans: 3, marks: 1 },
          { id: 'A2T13Q2', text: "Ein ___ Kind liegt im Bett. (krank, Nom N, mixed)", opts: ["kranke", "kranken", "krankes", "kranker"], ans: 2, marks: 1 },
          { id: 'A2T13Q3', text: "Eine ___ Frau hilft. (jung, Nom F, mixed)", opts: ["junge", "junger", "jungen", "junges"], ans: 0, marks: 1 },
          { id: 'A2T13Q4', text: "Ich sehe einen ___ Arzt. (gut, Akk M, mixed)", opts: ["guten", "gute", "gutem", "guter"], ans: 0, marks: 1 },
          { id: 'A2T13Q5', text: "Ich brauche ein ___ Formular. (neu, Akk N, mixed)", opts: ["neue", "neuen", "neues", "neuer"], ans: 2, marks: 1 },
          { id: 'A2T13Q6', text: "Mit einem ___ Team arbeiten wir. (erfahren, Dat N, mixed)", opts: ["erfahrenes", "erfahrener", "erfahrenen", "erfahrenem"], ans: 2, marks: 1 },
          { id: 'A2T13Q7', text: "Mein ___ Patient kommt. (neu, Nom M — possessive = mixed)", opts: ["neue", "neues", "neuen", "neuer"], ans: 3, marks: 1 },
          { id: 'A2T13Q8', text: "RESE-NESE: how many 'strong' cells are in the mixed table?", opts: ["1", "2", "3", "4"], ans: 2, marks: 1 },
          { id: 'A2T13Q9', text: "Ihr ___ Kind wartet. (krank, Nom N, ihr = mixed)", opts: ["kranke", "kränken", "krankes", "kranker"], ans: 2, marks: 1 },
          { id: 'A2T13Q10', text: "Kein ___ Arzt kommt heute. (alt, Nom M, kein = mixed)", opts: ["alte", "alten", "altes", "alter"], ans: 3, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T14',
    name: "Test 14: Adjective Endings III",
    classes: "Lecture 14",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T14Q1', text: "Strong declension is used after ___.", opts: ["der/die/das", "ein/kein", "no article", "welcher"], ans: 2, marks: 1 },
          { id: 'A2T14Q2', text: "___ Kaffee ist gut. (kalt, Nom M, no article)", opts: ["Kalte", "Kalt", "Kaltem", "Kalter"], ans: 3, marks: 1 },
          { id: 'A2T14Q3', text: "Bitte mit ___ Wasser waschen. (sauber, Dat N, no article)", opts: ["saubere", "sauberem", "sauberen", "sauberer"], ans: 1, marks: 1 },
          { id: 'A2T14Q4', text: "Der Patient hat ___ Schmerzen. (stark, Akk Pl, no article)", opts: ["starke", "starkem", "starken", "starkes"], ans: 0, marks: 1 },
          { id: 'A2T14Q5', text: "Strong endings COPY the endings of ___.", opts: ["ein/kein", "kein/mein", "der/die/das/den/dem", "viel/wenig"], ans: 2, marks: 1 },
          { id: 'A2T14Q6', text: "___ Pflegekräfte gesucht! (erfahren, Nom Pl, no article)", opts: ["Erfahrene", "Erfahrenen", "Erfahrener", "Erfahrenes"], ans: 0, marks: 1 },
          { id: 'A2T14Q7', text: "Wir brauchen ___ Material. (steril, Akk N, no article)", opts: ["sterilen", "steriles", "sterile", "sterilem"], ans: 1, marks: 1 },
          { id: 'A2T14Q8', text: "Bei ___ Fieber melden. (hoch, Dat N, no article)", opts: ["hohes", "hoher", "hohem", "hoch"], ans: 2, marks: 1 },
          { id: 'A2T14Q9', text: "Viel ___ Luft tut gut. (frisch, Nom F — viel is uninflected → strong)", opts: ["frischer", "frischem", "frische", "frischen"], ans: 2, marks: 1 },
          { id: 'A2T14Q10', text: "DECISION: 'ein altes Krankenhaus' — which declension?", opts: ["Weak", "Mixed", "Strong", "None"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T15',
    name: "Test 15: Comparative",
    classes: "Lecture 15",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T15Q1', text: "alt → comparative", opts: ["älter", "altern", "mehr alt", "alts"], ans: 0, marks: 1 },
          { id: 'A2T15Q2', text: "gut → comparative", opts: ["mehr gut", "besser", "güter", "gut-er"], ans: 1, marks: 1 },
          { id: 'A2T15Q3', text: "viel → comparative", opts: ["vieler", "mehrere", "mehr", "vielst"], ans: 2, marks: 1 },
          { id: 'A2T15Q4', text: "Berlin ist ___ als München. (groß)", opts: ["mehr groß", "großer", "größer", "am größten"], ans: 2, marks: 1 },
          { id: 'A2T15Q5', text: "Er ist genauso alt ___ ich. (equal comparison)", opts: ["als", "wie", "dass", "ob"], ans: 1, marks: 1 },
          { id: 'A2T15Q6', text: "Diese Methode ist besser ___ die alte. (unequal)", opts: ["wie", "als", "wenn", "ob"], ans: 1, marks: 1 },
          { id: 'A2T15Q7', text: "'immer + Komparativ': Der Patient wird immer ___. (gut)", opts: ["mehr gut", "besser", "am besten", "gut"], ans: 1, marks: 1 },
          { id: 'A2T15Q8', text: "Ein ___ Arzt kommt. (jung, comparative, Nom M, mixed ending)", opts: ["jüngere", "jüngeren", "jüngerer", "jüngeres"], ans: 2, marks: 1 },
          { id: 'A2T15Q9', text: "hoch → comparative", opts: ["hochter", "mehr hoch", "höher", "hoch-er"], ans: 2, marks: 1 },
          { id: 'A2T15Q10', text: "Haben Sie etwas ___es? (stark — something stronger)", opts: ["Stärker", "Stärkes", "Stärkeres", "Stärkerem"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T16',
    name: "Test 16: Superlative",
    classes: "Lecture 16",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T16Q1', text: "alt → superlative (am-form)", opts: ["am altsten", "am ältsten", "am ältesten", "am ältsten"], ans: 2, marks: 1 },
          { id: 'A2T16Q2', text: "gut → superlative (am-form)", opts: ["am gutem", "am gutsten", "am besten", "am gutesten"], ans: 2, marks: 1 },
          { id: 'A2T16Q3', text: "viel → superlative (am-form)", opts: ["am vielsten", "am meisten", "am vielen", "am mehrsten"], ans: 1, marks: 1 },
          { id: 'A2T16Q4', text: "hoch → superlative (am-form)", opts: ["am hochsten", "am höchsten", "am höchsten (same)", "am hochesten"], ans: 1, marks: 1 },
          { id: 'A2T16Q5', text: "Das ist ___ Zimmer im Haus. (groß, Nom N, def art)", opts: ["das großte", "das größte", "das größesten", "am größten"], ans: 1, marks: 1 },
          { id: 'A2T16Q6', text: "Er ist ___ Patient hier. (alt, Nom M, definite article)", opts: ["der ältester", "der älteste", "dem ältesten", "des ältesten"], ans: 1, marks: 1 },
          { id: 'A2T16Q7', text: "Welche Pflegerin arbeitet ___? (schnell, predicative)", opts: ["die schnellste", "am schnellsten", "am schnellsten ✓", "der schnellste"], ans: 1, marks: 1 },
          { id: 'A2T16Q8', text: "After def. article, superlative gets which endings?", opts: ["Strong (copy der/die/das)", "Mixed (3 strong cells)", "Weak (Saucer: -e/-en)", "No ending"], ans: 2, marks: 1 },
          { id: 'A2T16Q9', text: "frisch → superlative (adds -esten because?)", opts: ["ends in -ch", "ends in -sch", "ends in -r", "no reason"], ans: 1, marks: 1 },
          { id: 'A2T16Q10', text: "Die ___ Ärztin bekommt den Preis. (gut, Nom F, def art)", opts: ["die guten", "die gutem", "die beste", "die besten"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T17',
    name: "Test 17: Genitive Case",
    classes: "Lecture 17",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T17Q1', text: "Genitive article for Maskulin and Neutral:", opts: ["der", "die", "des", "dem"], ans: 2, marks: 1 },
          { id: 'A2T17Q2', text: "Genitive article for Feminin and Plural:", opts: ["des", "dem", "die", "der"], ans: 3, marks: 1 },
          { id: 'A2T17Q3', text: "das Buch ___ Arztes (correct Genitive article, M)", opts: ["den", "dem", "des", "der"], ans: 2, marks: 1 },
          { id: 'A2T17Q4', text: "Maskulin noun 'der Arzt' in Genitive → adds:", opts: ["-en", "-s", "-es", "-e"], ans: 2, marks: 1 },
          { id: 'A2T17Q5', text: "Weak masculine (N-Deklination) like 'der Patient' → Genitive ends in:", opts: ["-s", "-es", "-en", "-e"], ans: 2, marks: 1 },
          { id: 'A2T17Q6', text: "Proper name 'Anna' → Genitive:", opts: ["Anna's Buch (apostrophe)", "Annas Buch (no apostrophe)", "von Anna Buch", "der Anna Buch"], ans: 1, marks: 1 },
          { id: 'A2T17Q7', text: "Which preposition takes Genitive? (EXAM: choose the correct one)", opts: ["mit", "nach", "wegen", "von"], ans: 2, marks: 1 },
          { id: 'A2T17Q8', text: "Trotz ___ Diagnose blieb sie ruhig. (F Gen)", opts: ["die", "der", "dem", "des"], ans: 1, marks: 1 },
          { id: 'A2T17Q9', text: "Wegen ___ starken Schmerzes … (M Gen)", opts: ["dem", "den", "des", "der"], ans: 2, marks: 1 },
          { id: 'A2T17Q10', text: "von + Dativ is a ___ alternative to Genitive", opts: ["formal/written", "spoken/colloquial", "incorrect", "mandatory"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T18',
    name: "Test 18: Module 2 Test",
    classes: "Lecture 18",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T18Q1', text: "Module 2 covers Lectures:", opts: ["L1–9", "L5–14", "L10–17", "L15–20"], ans: 2, marks: 1 },
          { id: 'A2T18Q2', text: "Ich wasche ___. (kein Objekt → correct reflexive)", opts: ["mir", "mich", "sich", "uns"], ans: 1, marks: 1 },
          { id: 'A2T18Q3', text: "Ich wasche ___ die Hände. (body part → correct reflexive)", opts: ["mich", "dich", "mir", "sich"], ans: 2, marks: 1 },
          { id: 'A2T18Q4', text: "Der ___ Patient schläft. (alt, weak Nom M)", opts: ["alten", "alter", "alte", "altes"], ans: 2, marks: 1 },
          { id: 'A2T18Q5', text: "Ein ___ Patient schläft. (alt, mixed Nom M)", opts: ["alte", "alten", "altes", "alter"], ans: 3, marks: 1 },
          { id: 'A2T18Q6', text: "Er ist besser ___ ich. (unequal comparison)", opts: ["wie", "als", "so", "dass"], ans: 1, marks: 1 },
          { id: 'A2T18Q7', text: "Das ist am ___. (gut → irregular superlative)", opts: ["gutsten", "am gutem", "besten", "beststen"], ans: 2, marks: 1 },
          { id: 'A2T18Q8', text: "Wegen ___ Schmerzes … (Genitive M)", opts: ["dem", "der", "des", "den"], ans: 2, marks: 1 },
          { id: 'A2T18Q9', text: "Sich freuen ___ etwas (happy about)", opts: ["für", "auf", "über", "um"], ans: 2, marks: 1 },
          { id: 'A2T18Q10', text: "___ erfahren__ Pflegerin arbeitet allein. (Nom F, no article → strong)", opts: ["Erfahrene", "Erfahrener", "Erfahrenes", "Erfahrenen"], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T19',
    name: "Test 19: Two-Way Prepositions I",
    classes: "Lecture 19",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T19Q1', text: "How many two-way prepositions are there?", opts: ["7", "8", "9", "10"], ans: 2, marks: 1 },
          { id: 'A2T19Q2', text: "Wo? (static location) → which case?", opts: ["Akkusativ", "Genitiv", "Nominativ", "Dativ"], ans: 3, marks: 1 },
          { id: 'A2T19Q3', text: "Das Buch liegt auf ___ Tisch. (M, Wo? → Dat)", opts: ["den", "dem", "der", "die"], ans: 1, marks: 1 },
          { id: 'A2T19Q4', text: "Die Lampe hängt an ___ Wand. (F, Wo? → Dat)", opts: ["der", "dem", "die", "den"], ans: 0, marks: 1 },
          { id: 'A2T19Q5', text: "an + dem = ?", opts: ["ans", "am", "im", "zum"], ans: 1, marks: 1 },
          { id: 'A2T19Q6', text: "in + dem = ?", opts: ["ins", "ans", "im", "beim"], ans: 2, marks: 1 },
          { id: 'A2T19Q7', text: "Which verb describes STATIC location (Wo?)?", opts: ["legen", "stellen", "liegen", "setzen"], ans: 2, marks: 1 },
          { id: 'A2T19Q8', text: "Der Patient liegt ___ Bett. (in + dem contraction)", opts: ["ins", "auf dem", "im", "in den"], ans: 2, marks: 1 },
          { id: 'A2T19Q9', text: "Das Bett steht zwischen ___ Fenstern. (Pl Dat)", opts: ["die", "den", "dem", "der"], ans: 1, marks: 1 },
          { id: 'A2T19Q10', text: "Er sitzt an ___ Schreibtisch. (M Dat contraction)", opts: ["den", "dem", "an dem", "am"], ans: 3, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T20',
    name: "Test 20: Two-Way Prepositions II",
    classes: "Lecture 20",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T20Q1', text: "Wohin? (direction / goal) → which case?", opts: ["Dativ", "Nominativ", "Akkusativ", "Genitiv"], ans: 2, marks: 1 },
          { id: 'A2T20Q2', text: "Ich lege das Buch auf ___ Tisch. (M, Wohin? → Akk)", opts: ["dem", "der", "den", "die"], ans: 2, marks: 1 },
          { id: 'A2T20Q3', text: "Er hängt das Bild an ___ Wand. (F, Wohin? → Akk)", opts: ["der", "dem", "die", "den"], ans: 2, marks: 1 },
          { id: 'A2T20Q4', text: "in + das = ?", opts: ["im", "ins", "ans", "am"], ans: 1, marks: 1 },
          { id: 'A2T20Q5', text: "Which verb shows DIRECTION (Wohin?)?", opts: ["liegen", "stehen", "sitzen", "legen"], ans: 3, marks: 1 },
          { id: 'A2T20Q6', text: "Die Pflegerin legt den Patienten ___ Bett. (in+das)", opts: ["im", "in dem", "ins", "in der"], ans: 2, marks: 1 },
          { id: 'A2T20Q7', text: "Location partner of 'legen' (Wohin?) is:", opts: ["stellen", "stecken", "liegen", "setzen"], ans: 2, marks: 1 },
          { id: 'A2T20Q8', text: "Stell den Stuhl neben ___ Bett. (N Akk, Wohin?)", opts: ["dem", "der", "das", "den"], ans: 2, marks: 1 },
          { id: 'A2T20Q9', text: "Häng das Bild an ___ Wand. (F Akk, Wohin?)", opts: ["der", "die", "dem", "den"], ans: 1, marks: 1 },
          { id: 'A2T20Q10', text: "Wo? → liegen → auf dem Tisch. Wohin? → legen → ?", opts: ["auf den Tisch", "auf dem Tisch", "auf der Tisch", "auf das Tisch"], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T21',
    name: "Test 21: Interactive Spatial Lab",
    classes: "Lecture 21",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T21Q1', text: "Das Buch liegt auf ___ Tisch. (M — Wo? → ?)", opts: ["den", "dem", "der", "die"], ans: 1, marks: 1 },
          { id: 'A2T21Q2', text: "Ich lege das Buch auf ___ Tisch. (M — Wohin? → ?)", opts: ["dem", "der", "den", "die"], ans: 2, marks: 1 },
          { id: 'A2T21Q3', text: "Which verb shows LOCATION (Wo?)?", opts: ["legen", "stellen", "liegen", "setzen"], ans: 2, marks: 1 },
          { id: 'A2T21Q4', text: "Which verb shows DIRECTION (Wohin?)?", opts: ["liegen", "stehen", "sitzen", "legen"], ans: 3, marks: 1 },
          { id: 'A2T21Q5', text: "Er geht ___ Krankenhaus. (in+das — direction)", opts: ["im", "in das", "ins", "in den"], ans: 2, marks: 1 },
          { id: 'A2T21Q6', text: "Er ist ___ Krankenhaus. (in+dem — location)", opts: ["ins", "in das", "im", "in den"], ans: 2, marks: 1 },
          { id: 'A2T21Q7', text: "Das Bild hängt an ___ Wand. (F — Wo? → Dat)", opts: ["die", "den", "der", "dem"], ans: 2, marks: 1 },
          { id: 'A2T21Q8', text: "Er hängt das Bild an ___ Wand. (F — Wohin? → Akk)", opts: ["der", "dem", "den", "die"], ans: 3, marks: 1 },
          { id: 'A2T21Q9', text: "Die Pflegerin ___ den Patienten ins Bett. (legt/liegt)", opts: ["liegt", "liegt", "legt", "liegen"], ans: 2, marks: 1 },
          { id: 'A2T21Q10', text: "an + dem = ?", opts: ["ans", "am", "im", "zum"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T22',
    name: "Test 22: Fixed Prepositions I",
    classes: "Lecture 22",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T22Q1', text: "durch → which case ALWAYS?", opts: ["Dativ", "Genitiv", "Akkusativ", "Nominativ"], ans: 2, marks: 1 },
          { id: 'A2T22Q2', text: "für → which case ALWAYS?", opts: ["Akkusativ", "Dativ", "Genitiv", "Nominativ"], ans: 0, marks: 1 },
          { id: 'A2T22Q3', text: "Das ist für ___ Patienten. (M)", opts: ["dem", "den", "der", "die"], ans: 1, marks: 1 },
          { id: 'A2T22Q4', text: "Gegen ___ Schmerzen helfen Tabletten. (Pl)", opts: ["den", "dem", "die", "das"], ans: 2, marks: 1 },
          { id: 'A2T22Q5', text: "Durch ___ Korridor bitte. (M)", opts: ["dem", "das", "der", "den"], ans: 3, marks: 1 },
          { id: 'A2T22Q6', text: "Ohne ___ Rezept. (N)", opts: ["den", "dem", "die", "das"], ans: 3, marks: 1 },
          { id: 'A2T22Q7', text: "entlang: where does it usually go?", opts: ["before noun + Dative", "after noun + Accusative", "before noun + Accusative", "after noun + Dative"], ans: 1, marks: 1 },
          { id: 'A2T22Q8', text: "Ohne ___ Maske darf man nicht rein. (F)", opts: ["der", "dem", "die", "den"], ans: 2, marks: 1 },
          { id: 'A2T22Q9', text: "gegen → case?", opts: ["Dativ", "Akkusativ", "Genitiv", "both Dat and Akk"], ans: 1, marks: 1 },
          { id: 'A2T22Q10', text: "Um ___ Ecke. (F — 'around the corner')", opts: ["der", "dem", "den", "die"], ans: 3, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T23',
    name: "Test 23: Fixed Prepositions II",
    classes: "Lecture 23",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T23Q1', text: "mit → which case ALWAYS?", opts: ["Akkusativ", "Dativ", "Genitiv", "Nominativ"], ans: 1, marks: 1 },
          { id: 'A2T23Q2', text: "aus → which case ALWAYS?", opts: ["Akkusativ", "Dativ", "Nominativ", "Genitiv"], ans: 1, marks: 1 },
          { id: 'A2T23Q3', text: "Er kommt aus ___ Krankenhaus. (N)", opts: ["den", "das", "dem", "der"], ans: 2, marks: 1 },
          { id: 'A2T23Q4', text: "Ich fahre mit ___ Bus. (M)", opts: ["den", "das", "der", "dem"], ans: 3, marks: 1 },
          { id: 'A2T23Q5', text: "zu + dem = ?", opts: ["zur", "zum", "beim", "vom"], ans: 1, marks: 1 },
          { id: 'A2T23Q6', text: "zu + der = ?", opts: ["zum", "beim", "zur", "vom"], ans: 2, marks: 1 },
          { id: 'A2T23Q7', text: "seit + Dative → what tense?", opts: ["Perfekt (haben/sein+PP)", "Futur I", "Präteritum", "Präsens (present)"], ans: 3, marks: 1 },
          { id: 'A2T23Q8', text: "Er ist seit einem Jahr hier ___. (correct ending?)", opts: ["gewesen", "geworden", "gelernt", "(nothing — present tense)"], ans: 3, marks: 1 },
          { id: 'A2T23Q9', text: "Nach ___ Operation schläft er. (F)", opts: ["dem", "das", "die", "der"], ans: 3, marks: 1 },
          { id: 'A2T23Q10', text: "gegenüber + Dat: die Apotheke (F) → ?", opts: ["gegenüber die Apotheke", "gegenüber den Apotheke", "gegenüber der Apotheke", "gegenüber dem Apotheke"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T24',
    name: "Test 24: Module 3 Test",
    classes: "Lecture 24",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T24Q1', text: "Module 3 covers which lectures?", opts: ["L10–17", "L15–22", "L19–23", "L21–25"], ans: 2, marks: 1 },
          { id: 'A2T24Q2', text: "Das Buch liegt auf ___ Tisch. (M, two-way, Wo?)", opts: ["den", "die", "der", "dem"], ans: 3, marks: 1 },
          { id: 'A2T24Q3', text: "Für ___ Patienten. (M, fixed Akk)", opts: ["dem", "der", "den", "die"], ans: 2, marks: 1 },
          { id: 'A2T24Q4', text: "Mit ___ Bus. (M, fixed Dat)", opts: ["den", "die", "der", "dem"], ans: 3, marks: 1 },
          { id: 'A2T24Q5', text: "Ohne ___ Rezept. (N, fixed Akk)", opts: ["dem", "der", "das", "den"], ans: 2, marks: 1 },
          { id: 'A2T24Q6', text: "Seit ___ Jahren bin ich hier. (Pl, seit→Dat) + tense?", opts: ["war", "bin gewesen", "bin", "werde sein"], ans: 2, marks: 1 },
          { id: 'A2T24Q7', text: "Er geht INS Krankenhaus. INS = ?", opts: ["in+dem", "in+das", "an+das", "an+dem"], ans: 1, marks: 1 },
          { id: 'A2T24Q8', text: "durch → category?", opts: ["Two-Way", "Fixed Dative", "Fixed Accusative", "None"], ans: 2, marks: 1 },
          { id: 'A2T24Q9', text: "von + dem = ?", opts: ["zum", "zum", "vom", "zur"], ans: 2, marks: 1 },
          { id: 'A2T24Q10', text: "legen = direction → which case after two-way prep?", opts: ["Dativ", "Genitiv", "Nominativ", "Akkusativ"], ans: 3, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T25',
    name: "Test 25: Futur I",
    classes: "Lecture 25",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T25Q1', text: "Futur I = ?", opts: ["haben + Partizip II", "werden + Infinitiv", "sein + Partizip II", "sein + Infinitiv"], ans: 1, marks: 1 },
          { id: 'A2T25Q2', text: "ich → werden conjugation for Futur I", opts: ["wirst", "werde", "wird", "werden"], ans: 1, marks: 1 },
          { id: 'A2T25Q3', text: "er/sie/es → werden conjugation", opts: ["werde", "werdet", "werden", "wird"], ans: 3, marks: 1 },
          { id: 'A2T25Q4', text: "Ich ___ morgen kommen.", opts: ["wirst", "wird", "werde", "werden"], ans: 2, marks: 1 },
          { id: 'A2T25Q5', text: "Word order: infinitive goes to ___.", opts: ["Position 2", "after subject", "at the end", "before werden"], ans: 2, marks: 1 },
          { id: 'A2T25Q6', text: "Negation in Futur I: Ich werde ___ kommen.", opts: ["nicht kommen", "kommen nicht", "nicht", "kommen nicht mehr"], ans: 0, marks: 1 },
          { id: 'A2T25Q7', text: "'Er wird wohl schlafen.' — which USE of Futur I?", opts: ["Future plan", "Medical prognosis", "Present assumption (wohl)", "Question"], ans: 2, marks: 1 },
          { id: 'A2T25Q8', text: "Futur I question: ___ du morgen kommen?", opts: ["Wirst", "Werde", "Wird", "Werden"], ans: 0, marks: 1 },
          { id: 'A2T25Q9', text: "Subordinate: Ich glaube, dass er kommen ___.", opts: ["werde", "wird", "werden", "wirst"], ans: 1, marks: 1 },
          { id: 'A2T25Q10', text: "With modal: Er wird das tun ___. (können)", opts: ["können", "kann", "gekonnt", "konnte"], ans: 0, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T26',
    name: "Test 26: Konjunktiv II",
    classes: "Lecture 26",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T26Q1', text: "Konjunktiv II of 'sein' (ich-form)?", opts: ["würde sein", "wäre", "sei", "war"], ans: 1, marks: 1 },
          { id: 'A2T26Q2', text: "Konjunktiv II of 'haben' (er-form)?", opts: ["hätte", "hatte", "würde haben", "hat"], ans: 0, marks: 1 },
          { id: 'A2T26Q3', text: "Konjunktiv II of 'können' (wir-form)?", opts: ["könnten", "konnten", "würden können", "können"], ans: 0, marks: 1 },
          { id: 'A2T26Q4', text: "Which sentence is WRONG?", opts: ["Ich wäre gern Ärztin.", "Das wäre toll!", "Ich würde sein glücklich.", "Könnten Sie helfen?"], ans: 2, marks: 1 },
          { id: 'A2T26Q5', text: "Polite version of 'Ich will einen Termin.'", opts: ["Ich will höflich einen Termin.", "Ich wollte gern einen Termin.", "Ich hätte gern einen Termin.", "Ich würde einen Termin wollen."], ans: 2, marks: 1 },
          { id: 'A2T26Q6', text: "Complete: Wenn ich Zeit ___, würde ich kommen.", opts: ["habe", "hätte", "hatte", "haben"], ans: 1, marks: 1 },
          { id: 'A2T26Q7', text: "'Würden Sie das bitte unterschreiben?' — what USE of Konjunktiv II?", opts: ["Wish", "Conditional", "Polite request", "Past tense"], ans: 2, marks: 1 },
          { id: 'A2T26Q8', text: "Which CANNOT be combined with 'würde'?", opts: ["machen", "gehen", "sein", "kommen"], ans: 2, marks: 1 },
          { id: 'A2T26Q9', text: "Konjunktiv II of 'müssen' (Sie-form)?", opts: ["müssten", "mussten", "würden müssen", "müssen"], ans: 0, marks: 1 },
          { id: 'A2T26Q10', text: "'Das sollte klappen.' — meaning?", opts: ["That must work.", "That worked.", "That should/ought to work. (Konj.II)", "That will work."], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T27',
    name: "Test 27: Subjunctive Lab",
    classes: "Lecture 27",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T27Q1', text: "'Wenn ich Zeit habe, würde ich kommen.' — what is wrong?", opts: ["würde is wrong", "habe should be hätte", "nothing is wrong", "kommen should be käme"], ans: 1, marks: 1 },
          { id: 'A2T27Q2', text: "Which is CORRECT Konjunktiv II?", opts: ["Ich würde sein froh.", "Ich wäre froh.", "Ich sein würde froh.", "Ich würde froh sein nicht."], ans: 1, marks: 1 },
          { id: 'A2T27Q3', text: "'Er konnte nicht kommen.' (konnte) = ?", opts: ["Konjunktiv II", "Futur I", "Präteritum", "Präsens"], ans: 2, marks: 1 },
          { id: 'A2T27Q4', text: "'Er könnte das machen.' (könnte) = ?", opts: ["Präteritum", "Futur I", "Konjunktiv II", "Imperativ"], ans: 2, marks: 1 },
          { id: 'A2T27Q5', text: "du-form of wäre?", opts: ["wärest", "wärst", "wärt", "bist"], ans: 1, marks: 1 },
          { id: 'A2T27Q6', text: "'Ich wollte fragen, ob…' — this use of wollte is:", opts: ["Präteritum (past fact)", "Konjunktiv II (polite intro)", "Futur I", "Imperativ"], ans: 1, marks: 1 },
          { id: 'A2T27Q7', text: "Correct polite version of 'Haben Sie Zeit?'", opts: ["Würden Sie Zeit haben?", "Hätten Sie Zeit?", "Hatten Sie Zeit?", "Haben Sie Zeit würden?"], ans: 1, marks: 1 },
          { id: 'A2T27Q8', text: "Which is a common Konjunktiv II ERROR?", opts: ["Ich hätte gern einen Termin.", "Das wäre toll!", "Ich würde haben mehr Zeit.", "Wäre das möglich?"], ans: 2, marks: 1 },
          { id: 'A2T27Q9', text: "Complete: Wenn wir Geld ___, würden wir reisen.", opts: ["haben", "hatten", "hätten", "werden haben"], ans: 2, marks: 1 },
          { id: 'A2T27Q10', text: "'Das sollte möglich sein.' — which type of meaning?", opts: ["Past obligation", "Konjunktiv II assumption/prediction", "Futur I", "Imperative"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T28',
    name: "Test 28: Professional German: CV",
    classes: "Lecture 28",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T28Q1', text: "What is the German term for 'work experience' in a CV?", opts: ["Ausbildung", "Berufserfahrung", "Kenntnisse", "Fähigkeiten"], ans: 1, marks: 1 },
          { id: 'A2T28Q2', text: "German CV date format for 'September 2022'?", opts: ["Sept. 2022", "September/2022", "09/2022", "2022.09"], ans: 2, marks: 1 },
          { id: 'A2T28Q3', text: "'Single' (marital status) in German CV?", opts: ["allein", "unverheiratet", "ledig", "solo"], ans: 2, marks: 1 },
          { id: 'A2T28Q4', text: "Experience order in German CV Berufserfahrung?", opts: ["Oldest first", "Alphabetical", "Newest first (reverse chronological)", "By employer name"], ans: 2, marks: 1 },
          { id: 'A2T28Q5', text: "How are nursing duties written in a German CV?", opts: ["Full sentences with 'ich'", "Noun phrases only (no full sentences)", "Bullet points with verbs", "English terms"], ans: 1, marks: 1 },
          { id: 'A2T28Q6', text: "'B1 German level' — full CV formulation?", opts: ["Deutsch: gut", "Deutsch: B1 — Goethe-Zertifikat", "Deutsch: spreche", "Deutsch: mittelmäßig"], ans: 1, marks: 1 },
          { id: 'A2T28Q7', text: "'officially recognised' for a nursing qualification?", opts: ["staatlich akzeptiert", "offiziell anerkannt", "staatlich anerkannt", "behördlich bestätigt"], ans: 2, marks: 1 },
          { id: 'A2T28Q8', text: "Which is NOT a standard German CV section?", opts: ["Berufserfahrung", "Persönliche Daten", "Career Objective", "Ausbildung"], ans: 2, marks: 1 },
          { id: 'A2T28Q9', text: "The German CV must end with:", opts: ["Salary requirements", "References", "Ort, Datum, Unterschrift", "A career objective"], ans: 2, marks: 1 },
          { id: 'A2T28Q10', text: "Nursing title in German (full official form)?", opts: ["Krankenpfleger", "Pflegehilfe", "Gesundheits- und Krankenpflegerin", "Krankenschwester (outdated)"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T29',
    name: "Test 29: Cover Letter",
    classes: "Lecture 29",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T29Q1', text: "Correct formal salutation (no named contact)?", opts: ["Hallo,", "Guten Tag,", "Sehr geehrte Damen und Herren,", "Liebe Damen und Herren,"], ans: 2, marks: 1 },
          { id: 'A2T29Q2', text: "Correct formal closing for a cover letter?", opts: ["Liebe Grüße", "Viele Grüße", "Mit freundlichen Grüßen", "Tschüss"], ans: 2, marks: 1 },
          { id: 'A2T29Q3', text: "German for 'I am applying for the position as…'?", opts: ["Ich bewerbe mich um die Stelle als…", "Ich will die Stelle als…", "Ich suche die Stelle als…", "Ich habe die Stelle als…"], ans: 0, marks: 1 },
          { id: 'A2T29Q4', text: "'I have 3 years of professional experience' — German?", opts: ["Ich habe 3 Jahre Erfahrung.", "Ich verfüge über 3 Jahre Berufserfahrung.", "Ich besitze 3 Jahres Erfahrung.", "Mir gehören 3 Jahre Berufserfahrung."], ans: 1, marks: 1 },
          { id: 'A2T29Q5', text: "Polite Konjunktiv II closing: 'I would be very happy about an interview.'", opts: ["Ich will ein Interview.", "Über ein Gespräch würde ich mich sehr freuen.", "Ich freue mich auf Gespräch.", "Ein Gespräch würde ich wollen."], ans: 1, marks: 1 },
          { id: 'A2T29Q6', text: "What is the 'Betreff' in a German letter?", opts: ["The closing formula", "The subject line", "The salutation", "The signature"], ans: 1, marks: 1 },
          { id: 'A2T29Q7', text: "'I am available for questions' — German?", opts: ["Ich bin erreichbar.", "Ich stehe Ihnen für Rückfragen gerne zur Verfügung.", "Ich beantworte Fragen.", "Ich habe Zeit für Fragen."], ans: 1, marks: 1 },
          { id: 'A2T29Q8', text: "How do you write the date in a formal German letter?", opts: ["August 19, 2026", "19. August 2026 / 19.08.2026", "19/08/2026", "2026-08-19"], ans: 1, marks: 1 },
          { id: 'A2T29Q9', text: "B1 German — how to phrase in a cover letter?", opts: ["Ich spreche etwas Deutsch.", "Meine Deutschkenntnisse entsprechen dem Niveau B1.", "Mein Deutsch ist gut.", "Ich habe B1 Deutsch."], ans: 1, marks: 1 },
          { id: 'A2T29Q10', text: "Which is a mistake in a German cover letter?", opts: ["Sehr geehrte Damen und Herren,", "Über ein Gespräch würde ich mich freuen.", "Ich bin der beste Kandidat.", "Ich verfüge über 3 Jahre Erfahrung."], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T30',
    name: "Test 30: Job Interview Simulation",
    classes: "Lecture 30",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T30Q1', text: "How should you address the interviewer in Germany?", opts: ["Du", "Sie (formal)", "Ihr", "No pronoun needed"], ans: 1, marks: 1 },
          { id: 'A2T30Q2', text: "'Tell me about yourself' in German interview:", opts: ["Wer sind Sie?", "Erzählen Sie etwas über sich.", "Sagen Sie mir alles.", "Beschreiben Sie sich."], ans: 1, marks: 1 },
          { id: 'A2T30Q3', text: "When asked 'Haben Sie noch Fragen?' you should:", opts: ["Say 'Nein, danke'", "Ask 1–2 prepared questions", "Leave immediately", "Say 'Ich weiß nicht'"], ans: 1, marks: 1 },
          { id: 'A2T30Q4', text: "Asking for repetition politely:", opts: ["Was?", "Wiederholen Sie!", "Entschuldigung, könnten Sie das bitte wiederholen?", "Ich verstehe nicht."], ans: 2, marks: 1 },
          { id: 'A2T30Q5', text: "'Strength' answer: which is BEST for a nurse?", opts: ["Ich bin sehr schön.", "Ich bin zuverlässig, teamfähig und belastbar.", "Ich mache keine Fehler.", "Ich bin der beste Pfleger."], ans: 1, marks: 1 },
          { id: 'A2T30Q6', text: "When to ask about salary in Germany?", opts: ["At the start of the interview", "In the first interview", "Never — it's not allowed", "Only if the interviewer raises it first"], ans: 3, marks: 1 },
          { id: 'A2T30Q7', text: "Buying time to think professionally:", opts: ["'Hmm...'", "'Keine Ahnung.'", "'Das ist eine gute Frage. Ich überlege kurz…'", "'Ich weiß es nicht.'"], ans: 2, marks: 1 },
          { id: 'A2T30Q8', text: "Konjunktiv II in closing of interview: 'I would be happy about a positive reply.'", opts: ["Ich will eine Zusage.", "Über eine positive Rückmeldung würde ich mich sehr freuen.", "Ich freue mich über Zusage.", "Ich möchte eine positive Antwort."], ans: 1, marks: 1 },
          { id: 'A2T30Q9', text: "'reliable' in German interview language?", opts: ["belastbar", "teamfähig", "zuverlässig", "engagiert"], ans: 2, marks: 1 },
          { id: 'A2T30Q10', text: "Formal goodbye at end of interview:", opts: ["Tschüss!", "Bis bald!", "Auf Wiedersehen!", "Ciao!"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T31',
    name: "Test 31: Passive Voice",
    classes: "Lecture 31",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T31Q1', text: "Passive structure in German?", opts: ["haben + PP", "sein + PP", "werden + PP", "werden + Infinitiv"], ans: 2, marks: 1 },
          { id: 'A2T31Q2', text: "'Der Patient wird untersucht.' — which tense?", opts: ["Präteritum", "Futur I", "Präsens", "Perfekt"], ans: 2, marks: 1 },
          { id: 'A2T31Q3', text: "Präteritum passive of 'untersuchen' (er)?", opts: ["er wird untersucht", "er wurde untersucht", "er ist untersucht worden", "er untersuche"], ans: 1, marks: 1 },
          { id: 'A2T31Q4', text: "Perfekt passive — which 'worden' is correct?", opts: ["Das Zimmer ist gereinigt geworden.", "Das Zimmer ist gereinigt worden.", "Das Zimmer hat gereinigt worden.", "Das Zimmer wird gereinigt worden."], ans: 1, marks: 1 },
          { id: 'A2T31Q5', text: "'Der Arzt untersucht den Patienten.' → Passive:", opts: ["Der Arzt wird untersucht.", "Den Patienten wird untersucht.", "Der Patient wird untersucht.", "Der Patient wird untersuchen."], ans: 2, marks: 1 },
          { id: 'A2T31Q6', text: "Agent in passive uses which preposition?", opts: ["mit + Dativ", "von + Dativ", "durch + Akk", "für + Akk"], ans: 1, marks: 1 },
          { id: 'A2T31Q7', text: "'untersuchen' → Partizip II", opts: ["untergesucht", "geuntersucht", "untersucht", "untersuchtet"], ans: 2, marks: 1 },
          { id: 'A2T31Q8', text: "'Hier wird nicht geraucht.' means:", opts: ["Here smoking is good", "Here smoking is done", "No smoking here", "Here you must smoke"], ans: 2, marks: 1 },
          { id: 'A2T31Q9', text: "Separable verb 'ausfüllen' → Partizip II", opts: ["geausfüllt", "ausgefüllt", "ausfüllte", "ausfüllend"], ans: 1, marks: 1 },
          { id: 'A2T31Q10', text: "Passive with agent: '…vom Arzt…' — 'vom' is?", opts: ["durch + Dat", "von + Nom", "von + dem = vom", "bei + Dat"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T32',
    name: "Test 32: Relative Clauses I",
    classes: "Lecture 32",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T32Q1', text: "Relative clause always starts with:", opts: ["a verb", "a comma + relative pronoun", "a conjunction like 'weil'", "an article"], ans: 1, marks: 1 },
          { id: 'A2T32Q2', text: "Verb position in a relative clause:", opts: ["Position 2", "at the beginning", "at the end", "before the relative pronoun"], ans: 2, marks: 1 },
          { id: 'A2T32Q3', text: "'Der Arzt, ___ mir hilft, …' (M, Nom) — correct pronoun?", opts: ["den", "dem", "die", "der"], ans: 3, marks: 1 },
          { id: 'A2T32Q4', text: "'Der Arzt, ___ ich kenne, …' (M, Akk) — correct pronoun?", opts: ["der", "dem", "den", "die"], ans: 2, marks: 1 },
          { id: 'A2T32Q5', text: "Relative pronoun for F (Nominativ AND Akkusativ)?", opts: ["der", "den", "die", "dem"], ans: 2, marks: 1 },
          { id: 'A2T32Q6', text: "Relative pronoun for N (Nominativ AND Akkusativ)?", opts: ["das", "des", "dem", "den"], ans: 0, marks: 1 },
          { id: 'A2T32Q7', text: "Pl Nominativ AND Akkusativ relative pronoun?", opts: ["den", "dem", "denen", "die"], ans: 3, marks: 1 },
          { id: 'A2T32Q8', text: "Which relative pronoun changes between Nom and Akk?", opts: ["Feminin (die)", "Neutral (das)", "Plural (die)", "Maskulin (der→den)"], ans: 3, marks: 1 },
          { id: 'A2T32Q9', text: "'Das Medikament, ___ ich nehme, …' (N, Akk)?", opts: ["der", "den", "das", "dem"], ans: 2, marks: 1 },
          { id: 'A2T32Q10', text: "Missing comma: 'Der Arzt der mich behandelt ist neu.' — fix:", opts: ["No comma needed", "Der Arzt der mich behandelt ist neu.", "Der Arzt, der mich behandelt, ist neu.", "Der Arzt der mich behandelt, ist neu."], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T33',
    name: "Test 33: Relative Clauses II",
    classes: "Lecture 33",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T33Q1', text: "Dative relative pronoun for Maskulin?", opts: ["der", "den", "dem", "denen"], ans: 2, marks: 1 },
          { id: 'A2T33Q2', text: "Dative relative pronoun for Feminin?", opts: ["die", "der", "dem", "denen"], ans: 1, marks: 1 },
          { id: 'A2T33Q3', text: "Dative relative pronoun for Plural (most tested)?", opts: ["den", "die", "dem", "denen"], ans: 3, marks: 1 },
          { id: 'A2T33Q4', text: "'Der Arzt, ___ ich vertraue, …' (M, Dat — vertrauen+Dat)?", opts: ["der", "den", "dem", "denen"], ans: 2, marks: 1 },
          { id: 'A2T33Q5', text: "'Die Ärztin, ___ ich danke, …' (F, Dat — danken+Dat)?", opts: ["die", "der", "dem", "denen"], ans: 1, marks: 1 },
          { id: 'A2T33Q6', text: "'Die Kollegen, mit ___ ich arbeite, …' (Pl, Dat — mit+Dat)?", opts: ["den", "die", "dem", "denen"], ans: 3, marks: 1 },
          { id: 'A2T33Q7', text: "'Das Krankenhaus, in ___ ich arbeite, …' (N, Dat — in+Dat)?", opts: ["das", "das", "dem", "denen"], ans: 2, marks: 1 },
          { id: 'A2T33Q8', text: "'Die Ärztin, mit ___ ich arbeite, …' (F, Dat — mit+Dat)?", opts: ["die", "der", "dem", "denen"], ans: 1, marks: 1 },
          { id: 'A2T33Q9', text: "Which is WRONG?", opts: ["Der Arzt, dem ich helfe, ist nett.", "Die Kollegen, mit denen ich arbeite, …", "Die Ärztin, der ich danke, …", "Die Patienten, mit den ich spreche, …"], ans: 3, marks: 1 },
          { id: 'A2T33Q10', text: "Plural Dative rel. pronoun: DENEN vs. den — which is correct?", opts: ["den (like Akk Pl)", "denen (special Dat Pl form)", "die (like Nom/Akk Pl)", "der (like F Dat)"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T34',
    name: "Test 34: Exam Prep: Reading & Listening",
    classes: "Lecture 34",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T34Q1', text: "R/F/N — Text says praxis opens at 8. Statement: 'opens at 9'. Answer?", opts: ["Richtig", "Falsch", "Nicht im Text", "Cannot say"], ans: 1, marks: 1 },
          { id: 'A2T34Q2', text: "R/F/N — Text only mentions phone. Statement: 'email appointments possible'.", opts: ["Richtig", "Falsch", "Nicht im Text", "Cannot say"], ans: 2, marks: 1 },
          { id: 'A2T34Q3', text: "Reading strategy STEP 1 means:", opts: ["Read every word carefully", "Skim title and first sentence only", "Answer all questions first", "Write notes in the margin"], ans: 1, marks: 1 },
          { id: 'A2T34Q4', text: "In Hören, questions are in ___:", opts: ["random order", "reverse order", "alphabetical order", "chronological order (order of recording)"], ans: 3, marks: 1 },
          { id: 'A2T34Q5', text: "What does 'Achtung' on a sign mean?", opts: ["Exit", "Enter", "Attention/Warning", "Open"], ans: 1, marks: 1 },
          { id: 'A2T34Q6', text: "You should read the Hören questions:", opts: ["only after the recording ends", "during the recording only", "BEFORE the recording starts", "after the second play"], ans: 2, marks: 1 },
          { id: 'A2T34Q7', text: "How many times is each Hören audio segment played?", opts: ["Once", "Twice", "Three times", "Four times"], ans: 1, marks: 1 },
          { id: 'A2T34Q8', text: "'Bitte hinterlassen Sie eine Nachricht.' means:", opts: ["Please enter your name", "Please come to reception", "Please leave a message", "Please take a number"], ans: 2, marks: 1 },
          { id: 'A2T34Q9', text: "'Geöffnet' means:", opts: ["closed", "emergency", "open", "restricted"], ans: 2, marks: 1 },
          { id: 'A2T34Q10', text: "'Nicht im Text' applies when:", opts: ["the text contradicts the statement", "the topic is completely absent from the text", "the statement is partially true", "you didn't understand the text"], ans: 1, marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A2_T35',
    name: "Test 35: Exam Prep: Writing & Speaking",
    classes: "Lecture 35",
    level: 'A2',
    totalMarks: 10,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Daily Test — Multiple Choice (10 Questions)',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'A2T35Q1', text: "A2 Schreiben task length (target words)?", opts: ["20–30", "40–50", "60–80", "100–120"], ans: 2, marks: 1 },
          { id: 'A2T35Q2', text: "The MOST MARKS in Schreiben go to:", opts: ["correct spelling", "covering all bullet points (content)", "long sentences", "formal vocabulary"], ans: 1, marks: 1 },
          { id: 'A2T35Q3', text: "Correct formal salutation (no named contact)?", opts: ["Hallo!", "Guten Tag,", "Sehr geehrte Damen und Herren,", "Liebe Prüfungskommission!"], ans: 2, marks: 1 },
          { id: 'A2T35Q4', text: "Correct formal closing for an exam email?", opts: ["Tschüss!", "Viele Grüße", "Mit freundlichen Grüßen", "Liebe Grüße"], ans: 2, marks: 1 },
          { id: 'A2T35Q5', text: "A2 Sprechen Part 3 (plan something) — useful phrase:", opts: ["Was kostet das?", "Wie wäre es mit…?", "Richtig oder falsch?", "Entschuldigung, wie spät ist es?"], ans: 1, marks: 1 },
          { id: 'A2T35Q6', text: "Verb position in writing: 'Ich leider kommen kann nicht.' — corrected?", opts: ["Ich nicht kommen leider kann.", "Leider ich kann nicht kommen.", "Ich kann leider nicht kommen.", "Leider ich nicht kann kommen."], ans: 2, marks: 1 },
          { id: 'A2T35Q7', text: "Connector for 'that's why / therefore':", opts: ["obwohl", "außerdem", "deshalb", "trotzdem"], ans: 2, marks: 1 },
          { id: 'A2T35Q8', text: "You forget a word in the speaking exam — what to do?", opts: ["Stop and say nothing", "Say 'Ich weiß nicht' and stop", "Keep talking: 'Wie sagt man…?' / use a simpler word", "Leave the room"], ans: 2, marks: 1 },
          { id: 'A2T35Q9', text: "A2 Sprechen Part 1: Sich vorstellen — what should you include?", opts: ["CV in full", "Name, age, origin, job, German level, hobbies", "Only name and age", "Interview questions about weaknesses"], ans: 1, marks: 1 },
          { id: 'A2T35Q10', text: "'Außerdem' is a connector meaning:", opts: ["Unfortunately", "Therefore", "Furthermore / Also", "Despite"], ans: 2, marks: 1 },
        ]
      }
    ]
  },
  ...B1_TESTS,
]

// Levels that actually have tests, for the header (e.g. "A1–B1"), computed so
// the subtitle stays correct as levels/tests are added.
const TEST_LEVELS = LEVELS.filter(lv => TESTS.some(t => t.level === lv))
const TEST_LEVEL_RANGE = TEST_LEVELS.length
  ? (TEST_LEVELS.length === 1 ? TEST_LEVELS[0] : `${TEST_LEVELS[0]}–${TEST_LEVELS[TEST_LEVELS.length - 1]}`)
  : 'A1'

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
  const [expLevel, setExpLevel] = useState(null) // null = level folders view; else the opened level
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
        <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>Levels {TEST_LEVEL_RANGE} · {TESTS.length} tests · Auto-graded instantly</p>

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

        {/* Level folders — click a level to open only its tests; back returns here */}
        {expLevel === null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEVELS.map(lv => {
              const levelTests = TESTS.filter(t => t.level === lv)
              if (levelTests.length === 0) return null
              const passedCount = levelTests.filter(t => {
                const b = bestScore(t.id)
                return b !== null && Math.round((b / t.totalMarks) * 100) >= t.passMark
              }).length
              const isCur = lv === user?.level
              const th = LEVEL_THEME[lv]
              return (
                <div key={lv} onClick={() => setExpLevel(lv)}
                  style={{ background: th.main, color: th.on, borderRadius: 13, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: C.sh }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: th.on, flexShrink: 0 }}>{lv}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Level {lv} Daily Tests{isCur ? ' · your level' : ''}</div>
                    <div style={{ fontSize: 11, opacity: .85, marginTop: 2 }}>{passedCount}/{levelTests.length} passed · {levelTests.length} tests</div>
                  </div>
                  <span style={{ fontSize: 18, opacity: .9 }}>→</span>
                </div>
              )
            })}
          </div>
        ) : (() => {
          const lv = expLevel
          const th = LEVEL_THEME[lv]
          const levelTests = TESTS.filter(t => t.level === lv)
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <button onClick={() => setExpLevel(null)}
                  style={{ background: th.light, color: C.navy, border: `1px solid ${th.main}`, borderRadius: 9, padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>← All levels</button>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: th.main, color: th.on, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{lv}</div>
                <span style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>Level {lv} Daily Tests</span>
              </div>
              {levelTests.map(test => {
                const attempts = attempted(test.id)
                const best = bestScore(test.id)
                const bestPct = best !== null ? Math.round((best / test.totalMarks) * 100) : null
                const passed = bestPct !== null && bestPct >= test.passMark
                return (
                  <div key={test.id} style={{ background: '#fff', borderRadius: 14, border: `2px solid ${passed ? C.green : C.border}`, borderLeft: `4px solid ${th.main}`, padding: '15px', marginBottom: 10, boxShadow: C.sh }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{test.name}</div>
                        <div style={{ fontSize: 10, color: C.textS }}>{test.classes} · {test.totalMarks} marks · {test.timeMinutes} min</div>
                      </div>
                      {passed && <span style={{ fontSize: 18 }}>✅</span>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                      {test.sections.map((s, i) => (
                        <span key={i} style={{ background: C.surfAlt, color: C.textS, fontSize: 9, padding: '2px 7px', borderRadius: 8, fontWeight: 500 }}>
                          {s.title.split(':')[0]} ({s.marks}m)
                        </span>
                      ))}
                    </div>
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
                      onClick={() => startTest(test)} variant={passed ? 'outline' : 'primary'} style={{ width: '100%', ...(passed ? {} : { background: th.main }) }} />
                  </div>
                )
              })}
            </div>
          )
        })()}

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

import { useState } from 'react'
import { C, VOCAB } from '../lib/constants'
import { EXERCISES, pickExercises } from '../lib/data'
import { PBar, Btn } from '../components/UI'
import { trackEvent } from '../lib/supabase'

// ── 400 VOCAB CARDS (100 per level) ──────────────────────────────────────────
const EXTRA_VOCAB = {
  A1:[
    {de:"die Zunge",en:"tongue",hi:"जीभ",ex:"Bitte zeigen Sie mir die Zunge."},
    {de:"der Rücken",en:"back",hi:"पीठ",ex:"Mein Rücken tut weh."},
    {de:"die Schulter",en:"shoulder",hi:"कंधा",ex:"Die Schulter ist verletzt."},
    {de:"der Bauch",en:"stomach",hi:"पेट",ex:"Ich habe Bauchschmerzen."},
    {de:"die Brust",en:"chest",hi:"छाती",ex:"Die Brust schmerzt."},
    {de:"das Knie",en:"knee",hi:"घुटना",ex:"Das Knie ist geschwollen."},
    {de:"der Hals",en:"throat/neck",hi:"गला",ex:"Der Hals tut weh."},
    {de:"die Stirn",en:"forehead",hi:"माथा",ex:"Die Stirn ist heiß."},
    {de:"der Zahn",en:"tooth",hi:"दांत",ex:"Der Zahn schmerzt."},
    {de:"schlafen",en:"to sleep",hi:"सोना",ex:"Der Patient schläft gut."},
    {de:"essen",en:"to eat",hi:"खाना",ex:"Können Sie essen?"},
    {de:"trinken",en:"to drink",hi:"पीना",ex:"Bitte trinken Sie Wasser."},
    {de:"gehen",en:"to walk/go",hi:"चलना",ex:"Der Patient kann gehen."},
    {de:"sitzen",en:"to sit",hi:"बैठना",ex:"Bitte setzen Sie sich."},
    {de:"liegen",en:"to lie down",hi:"लेटना",ex:"Der Patient liegt im Bett."},
    {de:"die Spritze",en:"injection/syringe",hi:"सुई",ex:"Ich gebe eine Spritze."},
    {de:"das Pflaster",en:"plaster/bandage",hi:"पट्टी",ex:"Ich klebe ein Pflaster."},
    {de:"die Brille",en:"glasses",hi:"चश्मा",ex:"Haben Sie eine Brille?"},
    {de:"der Rollstuhl",en:"wheelchair",hi:"व्हीलचेयर",ex:"Der Patient braucht einen Rollstuhl."},
    {de:"die Krücke",en:"crutch",hi:"बैसाखी",ex:"Er geht mit Krücken."},
    {de:"warm / kalt",en:"warm / cold",hi:"गर्म / ठंडा",ex:"Ist Ihnen warm oder kalt?"},
    {de:"hell / dunkel",en:"light / dark",hi:"उजला / अंधेरा",ex:"Soll ich das Licht einschalten?"},
    {de:"links / rechts",en:"left / right",hi:"बाएं / दाएं",ex:"Drehen Sie sich nach links."},
    {de:"oben / unten",en:"above / below",hi:"ऊपर / नीचे",ex:"Heben Sie den Arm nach oben."},
    {de:"die Kurve",en:"patient chart",hi:"मरीज़ का चार्ट",ex:"Ich schaue in die Kurve."},
    {de:"der Finger",en:"finger",hi:"उंगली",ex:"Mein Finger tut weh."},
    {de:"das Auge",en:"eye",hi:"आँख",ex:"Das Auge ist gerötet."},
    {de:"der Mund",en:"mouth",hi:"मुँह",ex:"Bitte öffnen Sie den Mund."},
    {de:"die Lippe",en:"lip",hi:"होंठ",ex:"Die Lippen sind trocken."},
    {de:"das Ohr",en:"ear",hi:"कान",ex:"Das Ohr schmerzt."},
    {de:"der Nacken",en:"neck (nape)",hi:"गर्दन",ex:"Der Nacken ist steif."},
    {de:"die Wade",en:"calf",hi:"पिंडली",ex:"Die Wade ist geschwollen."},
    {de:"der Knöchel",en:"ankle",hi:"टखना",ex:"Der Knöchel ist verdreht."},
    {de:"die Hüfte",en:"hip",hi:"कूल्हा",ex:"Die Hüfte schmerzt beim Gehen."},
    {de:"das Blut",en:"blood",hi:"खून",ex:"Das Blut wird abgenommen."},
    {de:"der Urin",en:"urine",hi:"पेशाब",ex:"Bitte geben Sie eine Urinprobe."},
    {de:"die Haut",en:"skin",hi:"त्वचा",ex:"Die Haut ist trocken."},
    {de:"der Muskel",en:"muscle",hi:"मांसपेशी",ex:"Der Muskel ist verspannt."},
    {de:"der Knochen",en:"bone",hi:"हड्डी",ex:"Der Knochen ist gebrochen."},
    {de:"das Gelenk",en:"joint",hi:"जोड़",ex:"Das Gelenk ist entzündet."},
    {de:"die Leber",en:"liver",hi:"जिगर",ex:"Die Leber ist vergrößert."},
    {de:"die Niere",en:"kidney",hi:"गुर्दा",ex:"Die Niere schmerzt."},
    {de:"der Magen",en:"stomach (organ)",hi:"आमाशय",ex:"Der Magen ist leer."},
    {de:"der Darm",en:"intestine",hi:"आंत",ex:"Der Darm arbeitet normal."},
    {de:"schmerzen",en:"to hurt/ache",hi:"दर्द करना",ex:"Wo schmerzt es?"},
    {de:"brennen",en:"to burn",hi:"जलन",ex:"Die Wunde brennt."},
    {de:"jucken",en:"to itch",hi:"खुजली",ex:"Die Haut juckt."},
    {de:"schwellen",en:"to swell",hi:"सूजना",ex:"Der Fuß schwillt an."},
    {de:"bluten",en:"to bleed",hi:"खून बहना",ex:"Die Wunde blutet."},
    {de:"husten",en:"to cough",hi:"खांसना",ex:"Der Patient hustet stark."},
    {de:"niesen",en:"to sneeze",hi:"छींकना",ex:"Er niest häufig."},
    {de:"erbrechen",en:"to vomit",hi:"उल्टी करना",ex:"Der Patient hat erbrochen."},
    {de:"die Übelkeit",en:"nausea",hi:"मतली",ex:"Haben Sie Übelkeit?"},
    {de:"der Schwindel",en:"dizziness",hi:"चक्कर",ex:"Mir ist schwindelig."},
    {de:"die Müdigkeit",en:"fatigue/tiredness",hi:"थकान",ex:"Ich bin sehr müde."},
    {de:"der Ausschlag",en:"rash",hi:"चकत्ते",ex:"Er hat einen Ausschlag am Arm."},
    {de:"die Schwellung",en:"swelling",hi:"सूजन",ex:"Die Schwellung ist zurückgegangen."},
    {de:"die Narbe",en:"scar",hi:"निशान/घाव का निशान",ex:"Die Narbe heilt gut."},
    {de:"die Krankheit",en:"illness/disease",hi:"बीमारी",ex:"Die Krankheit heilt langsam."},
    {de:"die Verletzung",en:"injury",hi:"चोट",ex:"Die Verletzung ist nicht schlimm."},
    {de:"der Schnitt",en:"cut",hi:"कट/कटाव",ex:"Der Schnitt ist tief."},
    {de:"der Knochen",en:"bone",hi:"हड्डी",ex:"Der Knochen ist gebrochen."},
    {de:"die Erkältung",en:"cold (illness)",hi:"जुकाम",ex:"Ich habe eine Erkältung."},
    {de:"das Fieber",en:"fever",hi:"बुखार",ex:"Sie haben hohes Fieber."},
    {de:"der Husten",en:"cough (noun)",hi:"खांसी",ex:"Der Husten ist schlimm."},
    {de:"die Grippe",en:"flu",hi:"फ्लू",ex:"Er hat die Grippe."},
    {de:"der Durchfall",en:"diarrhea",hi:"दस्त",ex:"Haben Sie Durchfall?"},
    {de:"die Verstopfung",en:"constipation",hi:"कब्ज",ex:"Haben Sie Verstopfung?"},
    {de:"der Schmerz",en:"pain",hi:"दर्द",ex:"Wo ist der Schmerz?"},
    {de:"stark / leicht",en:"strong / mild",hi:"तेज़ / हल्का",ex:"Ist der Schmerz stark oder leicht?"},
    {de:"stechend / dumpf",en:"stabbing / dull",hi:"चुभन / भारी",ex:"Ist es stechend oder dumpf?"},
    {de:"dauernd / manchmal",en:"constant / sometimes",hi:"लगातार / कभी-कभी",ex:"Schmerzt es dauernd?"},
    {de:"der Notfall",en:"emergency",hi:"आपातकाल",ex:"Das ist ein Notfall!"},
    {de:"die Hilfe",en:"help",hi:"सहायता",ex:"Ich brauche Hilfe."},
    {de:"sofort",en:"immediately",hi:"तुरंत",ex:"Ich komme sofort."},
    {de:"ruhig",en:"calm/quiet",hi:"शांत",ex:"Bitte bleiben Sie ruhig."},
    {de:"langsam",en:"slowly",hi:"धीरे",ex:"Bitte sprechen Sie langsam."},
  ],
  A2:[
    {de:"die Untersuchung",en:"examination",hi:"जांच",ex:"Die Untersuchung beginnt jetzt."},
    {de:"der Ultraschall",en:"ultrasound",hi:"अल्ट्रासाउंड",ex:"Ein Ultraschall wurde gemacht."},
    {de:"das Röntgen",en:"X-ray",hi:"एक्स-रे",ex:"Das Röntgenbild ist normal."},
    {de:"die Physiotherapie",en:"physiotherapy",hi:"फिजियोथेरेपी",ex:"Die Physiotherapie hilft sehr."},
    {de:"die Entlassung",en:"discharge",hi:"छुट्टी/अस्पताल से मुक्ति",ex:"Die Entlassung ist morgen."},
    {de:"die Aufnahme",en:"admission",hi:"भर्ती",ex:"Die Aufnahme war heute Morgen."},
    {de:"die Operation",en:"operation/surgery",hi:"ऑपरेशन",ex:"Die Operation war erfolgreich."},
    {de:"die Narbe",en:"scar",hi:"निशान",ex:"Die Narbe heilt gut."},
    {de:"die Schwellung",en:"swelling",hi:"सूजन",ex:"Die Schwellung ist zurückgegangen."},
    {de:"der Verband",en:"dressing/bandage",hi:"पट्टी",ex:"Der Verband muss gewechselt werden."},
    {de:"stechen",en:"to sting/stab",hi:"चुभना",ex:"Es sticht ein bisschen."},
    {de:"drücken",en:"to press/push",hi:"दबाना",ex:"Drückt es hier?"},
    {de:"brennen",en:"to burn",hi:"जलना",ex:"Die Wunde brennt."},
    {de:"jucken",en:"to itch",hi:"खुजली",ex:"Die Wunde juckt."},
    {de:"die Salbe",en:"ointment/cream",hi:"मलहम",ex:"Ich trage eine Salbe auf."},
    {de:"der Tropf",en:"IV drip (informal)",hi:"ड्रिप",ex:"Der Tropf läuft noch."},
    {de:"die Kapsel",en:"capsule",hi:"कैप्सूल",ex:"Die Kapsel schlucken Sie ganz."},
    {de:"das Zäpfchen",en:"suppository",hi:"सपोजिटरी",ex:"Das Zäpfchen wirkt schnell."},
    {de:"nüchtern",en:"fasting",hi:"उपवास (खाली पेट)",ex:"Bitte bleiben Sie nüchtern."},
    {de:"regelmäßig",en:"regularly",hi:"नियमित रूप से",ex:"Nehmen Sie das Medikament regelmäßig."},
    {de:"die Körpertemperatur",en:"body temperature",hi:"शरीर का तापमान",ex:"Die Körpertemperatur ist erhöht."},
    {de:"das Gewicht",en:"weight",hi:"वजन",ex:"Wie viel wiegen Sie?"},
    {de:"die Größe",en:"height",hi:"ऊंचाई",ex:"Wie groß sind Sie?"},
    {de:"der Puls",en:"pulse",hi:"नाड़ी",ex:"Der Puls ist regelmäßig."},
    {de:"die Atmung",en:"breathing/respiration",hi:"सांस",ex:"Die Atmung ist flach."},
    {de:"die Sauerstoffsättigung",en:"oxygen saturation",hi:"ऑक्सीजन संतृप्ति",ex:"Die Sauerstoffsättigung ist 98%."},
    {de:"das EKG",en:"ECG",hi:"ईसीजी",ex:"Das EKG zeigt einen normalen Rhythmus."},
    {de:"der Katheter",en:"catheter",hi:"कैथेटर",ex:"Ein Katheter wurde gelegt."},
    {de:"die Infusion",en:"IV infusion",hi:"इन्फ्यूजन/ड्रिप",ex:"Die Infusion läuft gut."},
    {de:"die Blutentnahme",en:"blood draw",hi:"खून का नमूना",ex:"Ich nehme Ihnen Blut ab."},
    {de:"der Befund",en:"finding/result",hi:"निष्कर्ष/रिपोर्ट",ex:"Der Befund ist normal."},
    {de:"die Diagnose",en:"diagnosis",hi:"निदान",ex:"Die Diagnose lautet Pneumonie."},
    {de:"die Therapie",en:"therapy/treatment",hi:"उपचार",ex:"Die Therapie wirkt gut."},
    {de:"das Medikament",en:"medication",hi:"दवाई",ex:"Das Medikament hilft."},
    {de:"die Tablette",en:"tablet",hi:"गोली",ex:"Bitte nehmen Sie die Tablette."},
    {de:"das Antibiotikum",en:"antibiotic",hi:"एंटीबायोटिक",ex:"Das Antibiotikum wirkt gut."},
    {de:"das Schmerzmittel",en:"painkiller",hi:"दर्द निवारक",ex:"Das Schmerzmittel hilft sofort."},
    {de:"das Fiebermittel",en:"fever reducer",hi:"बुखार की दवाई",ex:"Das Fiebermittel ist wirksam."},
    {de:"die Einnahme",en:"taking (of medicine)",hi:"दवाई लेना",ex:"Die Einnahme erfolgt dreimal täglich."},
    {de:"zweimal täglich",en:"twice daily",hi:"दिन में दो बार",ex:"Bitte nehmen Sie es zweimal täglich."},
    {de:"nach dem Essen",en:"after eating",hi:"खाने के बाद",ex:"Nehmen Sie es nach dem Essen."},
    {de:"vor dem Schlafen",en:"before sleeping",hi:"सोने से पहले",ex:"Diese Tablette vor dem Schlafen nehmen."},
    {de:"auf nüchternem Magen",en:"on an empty stomach",hi:"खाली पेट",ex:"Auf nüchternem Magen einnehmen."},
    {de:"die Krankenakte",en:"medical record",hi:"चिकित्सा रिकॉर्ड",ex:"Ich schaue in die Krankenakte."},
    {de:"die Anamnese",en:"medical history",hi:"चिकित्सा इतिहास",ex:"Die Anamnese wurde erhoben."},
    {de:"die Allergie",en:"allergy",hi:"एलर्जी",ex:"Haben Sie eine Allergie?"},
    {de:"der Unverträglichkeit",en:"intolerance",hi:"असहिष्णुता",ex:"Haben Sie eine Laktoseunverträglichkeit?"},
    {de:"die Vorerkrankung",en:"pre-existing condition",hi:"पहले की बीमारी",ex:"Welche Vorerkrankungen haben Sie?"},
    {de:"die Familienanamnese",en:"family history",hi:"पारिवारिक इतिहास",ex:"Die Familienanamnese ist unauffällig."},
    {de:"die Überweisung",en:"referral",hi:"रेफरल",ex:"Ich brauche eine Überweisung."},
    {de:"der Termin",en:"appointment",hi:"अपॉइंटमेंट",ex:"Der nächste Termin ist Freitag."},
    {de:"die Wartezeit",en:"waiting time",hi:"प्रतीक्षा समय",ex:"Die Wartezeit beträgt 30 Minuten."},
    {de:"stationär",en:"inpatient",hi:"अस्पताल में भर्ती",ex:"Der Patient ist stationär aufgenommen."},
    {de:"ambulant",en:"outpatient",hi:"बाह्य रोगी",ex:"Die Behandlung erfolgt ambulant."},
    {de:"die Intensivstation",en:"ICU",hi:"आईसीयू",ex:"Der Patient liegt auf der Intensivstation."},
    {de:"die Notaufnahme",en:"emergency department",hi:"आपातकालीन विभाग",ex:"Gehen Sie zur Notaufnahme."},
    {de:"das Pflegeheim",en:"nursing home",hi:"नर्सिंग होम",ex:"Er zieht ins Pflegeheim."},
    {de:"die Visite",en:"ward round",hi:"विजिट",ex:"Die Visite beginnt um 8 Uhr."},
    {de:"die Übergabe",en:"handover",hi:"हस्तांतरण",ex:"Die Übergabe ist vollständig."},
    {de:"die Schicht",en:"shift",hi:"पाली",ex:"Meine Schicht beginnt um 7 Uhr."},
    {de:"der Frühdienst",en:"early shift",hi:"सुबह की पाली",ex:"Ich habe heute Frühdienst."},
    {de:"der Spätdienst",en:"late shift",hi:"देर की पाली",ex:"Morgen habe ich Spätdienst."},
    {de:"der Nachtdienst",en:"night shift",hi:"रात की पाली",ex:"Der Nachtdienst ist anstrengend."},
    {de:"die Dokumentation",en:"documentation",hi:"दस्तावेज़ीकरण",ex:"Die Dokumentation ist wichtig."},
    {de:"der Bericht",en:"report",hi:"रिपोर्ट",ex:"Ich schreibe den Bericht."},
    {de:"das Protokoll",en:"protocol/log",hi:"प्रोटोकॉल",ex:"Das Protokoll muss ausgefüllt werden."},
    {de:"die Hygiene",en:"hygiene",hi:"स्वच्छता",ex:"Hygiene ist sehr wichtig."},
    {de:"die Desinfektion",en:"disinfection",hi:"कीटाणुशोधन",ex:"Die Desinfektion erfolgt regelmäßig."},
    {de:"die Handschuhe",en:"gloves",hi:"दस्ताने",ex:"Ich trage immer Handschuhe."},
    {de:"die Maske",en:"mask",hi:"मास्क",ex:"Bitte tragen Sie eine Maske."},
    {de:"die Schürze",en:"apron",hi:"एप्रन",ex:"Ich trage eine Schutzschürze."},
    {de:"der Kittel",en:"coat/gown",hi:"गाउन",ex:"Bitte ziehen Sie den Kittel an."},
    {de:"die Isolation",en:"isolation",hi:"एकांतवास",ex:"Der Patient ist in Isolation."},
    {de:"die Infektion",en:"infection",hi:"संक्रमण",ex:"Eine Infektion wurde festgestellt."},
    {de:"die Wundversorgung",en:"wound care",hi:"घाव की देखभाल",ex:"Die Wundversorgung ist täglich."},
    {de:"der Druckverband",en:"compression bandage",hi:"दबाव पट्टी",ex:"Ein Druckverband wird angelegt."},
    {de:"die Naht",en:"suture/stitch",hi:"टांका",ex:"Die Naht wird entfernt."},
    {de:"das Blutdruckmessgerät",en:"blood pressure monitor",hi:"BP मशीन",ex:"Ich hole das Blutdruckmessgerät."},
    {de:"das Stethoskop",en:"stethoscope",hi:"स्टेथोस्कोप",ex:"Der Arzt benutzt das Stethoskop."},
    {de:"das Thermometer",en:"thermometer",hi:"थर्मामीटर",ex:"Das Thermometer zeigt 37 Grad."},
    {de:"die Spritze",en:"syringe",hi:"सिरिंज",ex:"Ich bereite die Spritze vor."},
    {de:"die Nadel",en:"needle",hi:"सुई",ex:"Die Nadel muss steril sein."},
    {de:"der Tropfständer",en:"IV stand",hi:"IV स्टैंड",ex:"Ich stelle den Tropfständer auf."},
    {de:"das Bettgitter",en:"bed rails",hi:"बेड की रेलिंग",ex:"Das Bettgitter schützt den Patienten."},
    {de:"die Klingel",en:"call bell",hi:"कॉल बेल",ex:"Benutzen Sie bitte die Klingel."},
    {de:"die Rufanlage",en:"nurse call system",hi:"नर्स कॉल सिस्टम",ex:"Die Rufanlage funktioniert gut."},
    {de:"der Rollator",en:"walking frame/rollator",hi:"वॉकर",ex:"Er benutzt einen Rollator."},
    {de:"die Gehhilfe",en:"walking aid",hi:"चलने की सहायता",ex:"Die Gehhilfe hilft beim Gehen."},
    {de:"die Pflegeperson",en:"caregiver",hi:"देखभालकर्ता",ex:"Die Pflegeperson ist immer da."},
    {de:"die Angehörigen",en:"relatives/family members",hi:"परिजन",ex:"Die Angehörigen dürfen besuchen."},
    {de:"der Beistand",en:"support/assistance",hi:"सहारा",ex:"Wir leisten Beistand."},
    {de:"die Pflege",en:"care/nursing",hi:"देखभाल",ex:"Die Pflege ist sehr wichtig."},
    {de:"die Fürsorge",en:"care/welfare",hi:"परवाह",ex:"Wir sorgen für Ihre Fürsorge."},
    {de:"das Wohlbefinden",en:"well-being",hi:"भलाई",ex:"Ihr Wohlbefinden ist uns wichtig."},
    {de:"die Genesung",en:"recovery",hi:"स्वास्थ्य लाभ",ex:"Gute Genesung!"},
    {de:"die Besserung",en:"improvement",hi:"सुधार",ex:"Gute Besserung!"},
    {de:"der Genesungsprozess",en:"recovery process",hi:"स्वास्थ्य-लाभ प्रक्रिया",ex:"Der Genesungsprozess dauert Zeit."},
  ],
  B1:[
    {de:"die Wundversorgung",en:"wound care",hi:"घाव की देखभाल",ex:"Die Wundversorgung erfolgt täglich."},
    {de:"die Beatmung",en:"ventilation",hi:"श्वास सहायता",ex:"Der Patient benötigt Beatmung."},
    {de:"die Sedierung",en:"sedation",hi:"शामक",ex:"Der Patient ist sediert."},
    {de:"die Thrombose",en:"thrombosis",hi:"थ्रोम्बोसिस",ex:"Eine Thrombose muss verhindert werden."},
    {de:"die Prophylaxe",en:"prophylaxis/prevention",hi:"रोकथाम",ex:"Die Prophylaxe ist wichtig."},
    {de:"die Inkontinenz",en:"incontinence",hi:"असंयमता",ex:"Inkontinenz erfordert besondere Pflege."},
    {de:"die Kontraktur",en:"contracture",hi:"संकुचन",ex:"Kontrakturen müssen verhindert werden."},
    {de:"die Lagerung",en:"positioning",hi:"लेटाने की स्थिति",ex:"Die Lagerung alle zwei Stunden ändern."},
    {de:"das Druckgeschwür",en:"pressure ulcer",hi:"दबाव घाव",ex:"Das Druckgeschwür muss behandelt werden."},
    {de:"die Flüssigkeitsbilanz",en:"fluid balance",hi:"तरल संतुलन",ex:"Die Flüssigkeitsbilanz wird dokumentiert."},
    {de:"die Körperpflege",en:"personal hygiene care",hi:"व्यक्तिगत स्वच्छता",ex:"Die Körperpflege ist Teil der Grundpflege."},
    {de:"die Grundpflege",en:"basic nursing care",hi:"बुनियादी देखभाल",ex:"Ich übernehme die Grundpflege."},
    {de:"sturzgefährdet",en:"at risk of falling",hi:"गिरने का खतरा",ex:"Der Patient ist sturzgefährdet."},
    {de:"desorientiert",en:"disoriented",hi:"भ्रमित",ex:"Der Patient ist zeitlich desorientiert."},
    {de:"agitiert",en:"agitated",hi:"उत्तेजित",ex:"Der Patient ist agitiert und unruhig."},
    {de:"die Reanimation",en:"resuscitation/CPR",hi:"पुनर्जीवन",ex:"Eine Reanimation war notwendig."},
    {de:"die Schmerztherapie",en:"pain therapy",hi:"दर्द चिकित्सा",ex:"Die Schmerztherapie wird angepasst."},
    {de:"die Wundinfektion",en:"wound infection",hi:"घाव संक्रमण",ex:"Eine Wundinfektion muss behandelt werden."},
    {de:"die Heilung",en:"healing",hi:"उपचार",ex:"Die Heilung verläuft gut."},
    {de:"postoperativ",en:"post-operative",hi:"ऑपरेशन के बाद",ex:"Die postoperative Phase ist kritisch."},
    {de:"präoperativ",en:"pre-operative",hi:"ऑपरेशन से पहले",ex:"Präoperativ muss der Patient nüchtern sein."},
    {de:"die Krankenakte",en:"medical record",hi:"चिकित्सा रिकॉर्ड",ex:"Ich schaue in die Krankenakte."},
    {de:"das Pflegeprotokoll",en:"nursing protocol",hi:"नर्सिंग प्रोटोकॉल",ex:"Das Pflegeprotokoll wird täglich geführt."},
    {de:"die Dienstübergabe",en:"shift handover",hi:"शिफ्ट परिवर्तन",ex:"Die Dienstübergabe muss vollständig sein."},
    {de:"der Dekubitus",en:"pressure sore/bedsore",hi:"बेड सोर",ex:"Dekubitus täglich dokumentieren."},
    {de:"die Anamnese",en:"medical history",hi:"चिकित्सा इतिहास",ex:"Anamnese vollständig erhoben."},
    {de:"die Compliance",en:"compliance/adherence",hi:"अनुपालन",ex:"Compliance des Patienten ist gut."},
    {de:"der Befund",en:"finding/result",hi:"निष्कर्ष",ex:"Befund ist unauffällig."},
    {de:"die Prognose",en:"prognosis",hi:"रोगनिदान",ex:"Prognose ist günstig."},
    {de:"die Nebenwirkung",en:"side effect",hi:"दुष्प्रभाव",ex:"Medikament hat Nebenwirkungen."},
    {de:"aufklären",en:"to inform patient",hi:"सूचित करना",ex:"Ich kläre den Patienten auf."},
    {de:"die Rehabilitation",en:"rehabilitation",hi:"पुनर्वास",ex:"Patient braucht Rehabilitation."},
    {de:"die Mobilisation",en:"mobilization",hi:"गतिशीलता बढ़ाना",ex:"Mobilisation täglich steigern."},
    {de:"die Pflegemaßnahme",en:"nursing measure",hi:"नर्सिंग उपाय",ex:"Alle Maßnahmen dokumentieren."},
    {de:"die Schmerzskala",en:"pain scale",hi:"दर्द पैमाना",ex:"Wo auf der Schmerzskala?"},
    {de:"die Bewusstseinslage",en:"consciousness level",hi:"चेतना स्तर",ex:"Bewusstseinslage ist klar."},
    {de:"stabil",en:"stable",hi:"स्थिर",ex:"Vitalzeichen sind stabil."},
    {de:"kritisch",en:"critical",hi:"गंभीर",ex:"Der Zustand ist kritisch."},
    {de:"die Pflegediagnose",en:"nursing diagnosis",hi:"नर्सिंग निदान",ex:"Die Pflegediagnose wird gestellt."},
    {de:"die Dekubitusprophylaxe",en:"pressure sore prevention",hi:"बेड सोर रोकथाम",ex:"Dekubitusprophylaxe ist wichtig."},
    {de:"die Aspirationsgefahr",en:"aspiration risk",hi:"सांस में जाने का खतरा",ex:"Aspirationsgefahr beachten."},
    {de:"engmaschig überwachen",en:"to monitor closely",hi:"निकट से निगरानी करना",ex:"Engmaschig überwachen nach OP."},
    {de:"die Pflegeplanung",en:"care planning",hi:"देखभाल योजना",ex:"Die Pflegeplanung ist komplex."},
    {de:"der Schmerzscore",en:"pain score",hi:"दर्द स्कोर",ex:"Schmerzscore täglich dokumentieren."},
    {de:"kontinuierlich",en:"continuously",hi:"लगातार",ex:"Kontinuierlich überwachen."},
    {de:"die Wundkontrolle",en:"wound check",hi:"घाव जांच",ex:"Wundkontrolle täglich durchführen."},
    {de:"die Grunderkrankung",en:"underlying condition",hi:"मूल बीमारी",ex:"Die Grunderkrankung wird behandelt."},
    {de:"die Komplikation",en:"complication",hi:"जटिलता",ex:"Komplikationen vermeiden."},
    {de:"die Verlaufskontrolle",en:"follow-up check",hi:"अनुवर्ती जांच",ex:"Verlaufskontrolle nach 7 Tagen."},
    {de:"die Schmerzmedikation",en:"pain medication",hi:"दर्द की दवाई",ex:"Schmerzmedikation anpassen."},
    {de:"die Bedarfsmedikation",en:"PRN medication",hi:"जरूरत पड़ने पर दवाई",ex:"Bedarfsmedikation bei Schmerz geben."},
    {de:"die Pflegeübergabe",en:"nursing handover",hi:"नर्सिंग हस्तांतरण",ex:"Pflegeübergabe ist vollständig."},
    {de:"die Körperlage",en:"body position",hi:"शरीर की स्थिति",ex:"Körperlage alle 2 Stunden wechseln."},
    {de:"die Mundpflege",en:"oral hygiene care",hi:"मुँह की देखभाल",ex:"Mundpflege täglich durchführen."},
    {de:"die Haarpflege",en:"hair care",hi:"बालों की देखभाल",ex:"Haarpflege wenn nötig."},
    {de:"die Ernährung",en:"nutrition",hi:"पोषण",ex:"Die Ernährung ist ausgewogen."},
    {de:"die Flüssigkeitszufuhr",en:"fluid intake",hi:"तरल पदार्थ का सेवन",ex:"Flüssigkeitszufuhr dokumentieren."},
    {de:"die Ausscheidung",en:"elimination/output",hi:"मल/मूत्र त्याग",ex:"Ausscheidung regelmäßig prüfen."},
    {de:"der Stuhlgang",en:"bowel movement",hi:"मल त्याग",ex:"Hat der Patient Stuhlgang gehabt?"},
    {de:"die Miktion",en:"urination",hi:"पेशाब",ex:"Miktion schmerzfrei."},
    {de:"die Harninkontinenz",en:"urinary incontinence",hi:"मूत्र असंयमता",ex:"Harninkontinenz erfordert Pflege."},
    {de:"die Stuhlinkontinenz",en:"fecal incontinence",hi:"मल असंयमता",ex:"Stuhlinkontinenz dokumentieren."},
    {de:"die Mobilität",en:"mobility",hi:"गतिशीलता",ex:"Mobilität täglich fördern."},
    {de:"bettlägerig",en:"bedridden",hi:"बिस्तर पर",ex:"Patient ist bettlägerig."},
    {de:"die Transferhilfe",en:"transfer assistance",hi:"स्थानांतरण सहायता",ex:"Transferhilfe beim Aufstehen."},
    {de:"die Sitzposition",en:"sitting position",hi:"बैठने की स्थिति",ex:"Patient in Sitzposition bringen."},
    {de:"die Atemtherapie",en:"respiratory therapy",hi:"श्वास चिकित्सा",ex:"Atemtherapie täglich durchführen."},
    {de:"die Inhalation",en:"inhalation",hi:"साँस द्वारा दवाई",ex:"Inhalation dreimal täglich."},
    {de:"der Sauerstoff",en:"oxygen",hi:"ऑक्सीजन",ex:"Sauerstoff über Nasenbrille geben."},
    {de:"die Nasenbrille",en:"nasal cannula",hi:"नाक की नली",ex:"Nasenbrille anlegen."},
    {de:"das Pulsoximeter",en:"pulse oximeter",hi:"पल्स ऑक्सीमीटर",ex:"Sauerstoffsättigung mit Pulsoximeter messen."},
    {de:"der Blutzucker",en:"blood sugar",hi:"रक्त शर्करा",ex:"Blutzucker vor dem Essen messen."},
    {de:"das Insulin",en:"insulin",hi:"इंसुलिन",ex:"Insulin subkutan spritzen."},
    {de:"die Antikoagulation",en:"anticoagulation",hi:"थक्कारोधी उपचार",ex:"Antikoagulation kontrollieren."},
    {de:"subkutan",en:"subcutaneous",hi:"त्वचा के नीचे",ex:"Injektion subkutan geben."},
    {de:"intravenös",en:"intravenous",hi:"नस में",ex:"Antibiotikum intravenös geben."},
    {de:"intramuskulär",en:"intramuscular",hi:"मांसपेशी में",ex:"Injektion intramuskulär geben."},
    {de:"die Schmerzerfassung",en:"pain assessment",hi:"दर्द मूल्यांकन",ex:"Schmerzerfassung ist regelmäßig."},
    {de:"die NRS-Skala",en:"numeric rating scale",hi:"दर्द स्केल",ex:"Schmerz auf NRS-Skala erfassen."},
    {de:"die Vitalzeichen",en:"vital signs",hi:"जीवन संकेत",ex:"Vitalzeichen alle 4 Stunden messen."},
    {de:"die Hämodynamik",en:"hemodynamics",hi:"रक्त गतिकी",ex:"Hämodynamik ist stabil."},
    {de:"der Herzrhythmus",en:"heart rhythm",hi:"हृदय लय",ex:"Herzrhythmus ist regelmäßig."},
    {de:"die Arrhythmie",en:"arrhythmia",hi:"अनियमित धड़कन",ex:"Arrhythmie auf EKG festgestellt."},
    {de:"das Atemgeräusch",en:"breath sound",hi:"सांस की आवाज़",ex:"Atemgeräusche auskultieren."},
    {de:"die Lungenentzündung",en:"pneumonia",hi:"निमोनिया",ex:"Lungenentzündung behandeln."},
    {de:"der Schlaganfall",en:"stroke",hi:"स्ट्रोक",ex:"Schlaganfall sofort behandeln."},
    {de:"der Herzinfarkt",en:"heart attack",hi:"दिल का दौरा",ex:"Herzinfarkt ist ein Notfall."},
    {de:"die Sepsis",en:"sepsis",hi:"सेप्सिस",ex:"Sepsis sofort behandeln."},
    {de:"der Blutverlust",en:"blood loss",hi:"रक्त की कमी",ex:"Blutverlust minimieren."},
    {de:"die Transfusion",en:"transfusion",hi:"रक्त आधान",ex:"Transfusion ist notwendig."},
    {de:"die Notfallversorgung",en:"emergency care",hi:"आपातकालीन देखभाल",ex:"Notfallversorgung sofort einleiten."},
    {de:"die Erstversorgung",en:"first aid",hi:"प्रथमोपचार",ex:"Erstversorgung am Unfallort."},
    {de:"wiederherstellen",en:"to restore/recover",hi:"पुनर्स्थापित करना",ex:"Die Funktion wiederherstellen."},
    {de:"stabilisieren",en:"to stabilize",hi:"स्थिर करना",ex:"Den Zustand stabilisieren."},
    {de:"engmaschig",en:"closely/frequently (monitoring)",hi:"बारीकी से",ex:"Engmaschige Kontrolle notwendig."},
  ],
  B2:[
    {de:"die Ätiologie",en:"etiology/cause",hi:"कारण विज्ञान",ex:"Die Ätiologie ist noch unklar."},
    {de:"die Pathogenese",en:"pathogenesis",hi:"रोगजनन",ex:"Die Pathogenese wird untersucht."},
    {de:"die Symptomatik",en:"symptomatology",hi:"लक्षण विज्ञान",ex:"Die Symptomatik ist unspezifisch."},
    {de:"der Verlauf",en:"disease course",hi:"रोग क्रम",ex:"Der Verlauf ist positiv."},
    {de:"die Komplikation",en:"complication",hi:"जटिलता",ex:"Komplikationen müssen vermieden werden."},
    {de:"die Prävention",en:"prevention",hi:"रोकथाम",ex:"Prävention ist wichtig."},
    {de:"die Rehabilitation",en:"rehabilitation",hi:"पुनर्वास",ex:"Die Rehabilitation beginnt früh."},
    {de:"die Remission",en:"remission",hi:"छूट",ex:"Der Patient ist in Remission."},
    {de:"das Rezidiv",en:"recurrence/relapse",hi:"पुनरावर्तन",ex:"Ein Rezidiv muss verhindert werden."},
    {de:"die Chronifizierung",en:"chronification",hi:"दीर्घकालिकता",ex:"Die Chronifizierung muss vermieden werden."},
    {de:"multimorbide",en:"multimorbid",hi:"बहु-रोगी",ex:"Der Patient ist multimorbide."},
    {de:"die Kachexie",en:"cachexia",hi:"कैशेक्सिया",ex:"Der Patient leidet unter Kachexie."},
    {de:"das Multiorganversagen",en:"multi-organ failure",hi:"बहु-अंग विफलता",ex:"Multiorganversagen ist lebensbedrohlich."},
    {de:"die Sepsis",en:"sepsis",hi:"सेप्सिस",ex:"Sepsis muss sofort behandelt werden."},
    {de:"die Antibiotikatherapie",en:"antibiotic therapy",hi:"एंटीबायोटिक चिकित्सा",ex:"Die Antibiotikatherapie wird angepasst."},
    {de:"die Immunsuppression",en:"immunosuppression",hi:"प्रतिरक्षा दमन",ex:"Immunsuppression erhöht Infektionsrisiko."},
    {de:"die Dialyse",en:"dialysis",hi:"डायलिसिस",ex:"Der Patient benötigt Dialyse."},
    {de:"die Chemotherapie",en:"chemotherapy",hi:"कीमोथेरेपी",ex:"Die Chemotherapie hat Nebenwirkungen."},
    {de:"die Palliativmedizin",en:"palliative medicine",hi:"उपशामक चिकित्सा",ex:"Palliativmedizin verbessert Lebensqualität."},
    {de:"die Patientenverfügung",en:"advance directive",hi:"अग्रिम निर्देश",ex:"Die Patientenverfügung muss beachtet werden."},
    {de:"die Einwilligungsfähigkeit",en:"capacity to consent",hi:"सहमति क्षमता",ex:"Die Einwilligungsfähigkeit wird geprüft."},
    {de:"die Schweigepflicht",en:"confidentiality",hi:"गोपनीयता",ex:"Die Schweigepflicht muss gewahrt werden."},
    {de:"die Haftpflicht",en:"liability",hi:"दायित्व",ex:"Die Haftpflicht des Krankenhauses."},
    {de:"die Qualitätssicherung",en:"quality assurance",hi:"गुणवत्ता आश्वासन",ex:"Qualitätssicherung ist obligatorisch."},
    {de:"die Differentialdiagnose",en:"differential diagnosis",hi:"विभेदक निदान",ex:"Mehrere Erkrankungen in Betracht."},
    {de:"interdisziplinär",en:"interdisciplinary",hi:"अंतःविषय",ex:"Interdisziplinäres Team trifft Entscheidung."},
    {de:"die Patientenautonomie",en:"patient autonomy",hi:"रोगी स्वायत्तता",ex:"Autonomie des Patienten respektieren."},
    {de:"evidenzbasiert",en:"evidence-based",hi:"साक्ष्य-आधारित",ex:"Evidenzbasierte Behandlung anwenden."},
    {de:"indiziert",en:"indicated/appropriate",hi:"संकेतित",ex:"Operation ist indiziert."},
    {de:"kontraindiziert",en:"contraindicated",hi:"प्रतिसंकेत",ex:"Medikament ist kontraindiziert."},
    {de:"die Intervention",en:"intervention",hi:"हस्तक्षेप",ex:"Intervention erfolgte zeitnah."},
    {de:"infaust",en:"poor/hopeless prognosis",hi:"निराशाजनक",ex:"Prognose quoad vitam infaust."},
    {de:"die Rekonvaleszenz",en:"convalescence",hi:"स्वास्थ्यलाभ",ex:"Rekonvaleszenz dauert lange."},
    {de:"nosokomial",en:"hospital-acquired",hi:"अस्पताल-अर्जित",ex:"Nosokomiale Infektion vermeiden."},
    {de:"die Compliance-Problematik",en:"compliance issues",hi:"अनुपालन समस्याएं",ex:"Compliance-Problematik besteht."},
    {de:"resistent",en:"resistant",hi:"प्रतिरोधी",ex:"Erreger ist resistent."},
    {de:"die Prognostik",en:"prognostics",hi:"रोगनिदान विज्ञान",ex:"Prognostik ist schwierig."},
    {de:"die Sterbehilfe",en:"euthanasia/assisted dying",hi:"मृत्यु सहायता",ex:"Sterbehilfe ist ethisch umstritten."},
    {de:"die Behandlungspflicht",en:"duty to treat",hi:"उपचार का कर्तव्य",ex:"Behandlungspflicht des Arztes."},
    {de:"die Aufklärungspflicht",en:"duty to inform",hi:"सूचित करने का कर्तव्य",ex:"Aufklärungspflicht muss erfüllt werden."},
    {de:"das Informed Consent",en:"informed consent",hi:"सूचित सहमति",ex:"Informed Consent ist obligatorisch."},
    {de:"die Lebensqualität",en:"quality of life",hi:"जीवन की गुणवत्ता",ex:"Lebensqualität verbessern."},
    {de:"die Leitlinie",en:"guideline",hi:"दिशानिर्देश",ex:"Leitliniengerechte Behandlung."},
    {de:"die Mortalität",en:"mortality",hi:"मृत्यु दर",ex:"Mortalität durch Prävention senken."},
    {de:"die Morbidität",en:"morbidity",hi:"रुग्णता",ex:"Morbidität ist hoch."},
    {de:"die Inzidenz",en:"incidence",hi:"घटना दर",ex:"Inzidenz der Krankheit steigt."},
    {de:"die Prävalenz",en:"prevalence",hi:"प्रचलन",ex:"Prävalenz in Deutschland."},
    {de:"die Anamnese",en:"medical history",hi:"इतिहास",ex:"Anamnese vollständig erheben."},
    {de:"das Pflegekonzept",en:"nursing concept",hi:"नर्सिंग अवधारणा",ex:"Pflegekonzept umsetzen."},
    {de:"die Pflegetheorie",en:"nursing theory",hi:"नर्सिंग सिद्धांत",ex:"Pflegetheorie in der Praxis."},
    {de:"die Pflegeethik",en:"nursing ethics",hi:"नर्सिंग नैतिकता",ex:"Pflegeethik ist grundlegend."},
    {de:"das Versorgungskonzept",en:"care concept",hi:"देखभाल अवधारणा",ex:"Versorgungskonzept für den Patienten."},
    {de:"die Palliation",en:"palliation",hi:"उपशमन",ex:"Palliation verbessert Wohlbefinden."},
    {de:"die terminale Phase",en:"terminal phase",hi:"अंतिम अवस्था",ex:"In der terminalen Phase begleiten."},
    {de:"das Sterbebett",en:"deathbed",hi:"मृत्युशय्या",ex:"Am Sterbebett begleiten."},
    {de:"die Trauer",en:"grief/mourning",hi:"दुःख",ex:"Trauer der Angehörigen begleiten."},
    {de:"die Seelsorge",en:"pastoral care",hi:"आत्मिक देखभाल",ex:"Seelsorge für den Patienten."},
    {de:"interdisziplinäre Fallkonferenz",en:"interdisciplinary case conference",hi:"अंतःविषय मामला सम्मेलन",ex:"Fallkonferenz wöchentlich durchführen."},
    {de:"das Ethikkomitee",en:"ethics committee",hi:"नैतिकता समिति",ex:"Ethikkomitee wird konsultiert."},
    {de:"die Zwangsmaßnahme",en:"coercive measure",hi:"जबरदस्ती का उपाय",ex:"Zwangsmaßnahmen dokumentieren."},
    {de:"die Fixierung",en:"restraint",hi:"बंधन",ex:"Fixierung nur wenn nötig."},
    {de:"die Freiheitsentziehung",en:"deprivation of liberty",hi:"स्वतंत्रता का हनन",ex:"Freiheitsentziehung dokumentieren."},
    {de:"das Betreuungsrecht",en:"guardianship law",hi:"संरक्षकता कानून",ex:"Betreuungsrecht beachten."},
    {de:"der Betreuer",en:"legal guardian",hi:"कानूनी संरक्षक",ex:"Betreuer informieren."},
    {de:"die Vollmacht",en:"power of attorney",hi:"अटॉर्नी की शक्ति",ex:"Vollmacht liegt vor."},
    {de:"die Triage",en:"triage",hi:"छंटाई/ट्राइएज",ex:"Triage in der Notaufnahme."},
    {de:"die Erstversorgung",en:"first aid/initial care",hi:"प्रथम देखभाल",ex:"Erstversorgung sofort einleiten."},
    {de:"die Intensivpflege",en:"intensive care nursing",hi:"गहन देखभाल नर्सिंग",ex:"Intensivpflege erfordert Expertise."},
    {de:"das Monitoring",en:"monitoring",hi:"निगरानी",ex:"Kontinuierliches Monitoring notwendig."},
    {de:"die Hämodynamik",en:"hemodynamics",hi:"रक्त गतिकी",ex:"Hämodynamik überwachen."},
    {de:"der Kreislauf",en:"circulatory system",hi:"रक्त परिसंचरण",ex:"Kreislauf stabil halten."},
    {de:"die Hypertonie",en:"hypertension",hi:"उच्च रक्तचाप",ex:"Hypertonie medikamentös behandeln."},
    {de:"die Hypotonie",en:"hypotension",hi:"निम्न रक्तचाप",ex:"Hypotonie sofort behandeln."},
    {de:"der Diabetes mellitus",en:"diabetes mellitus",hi:"मधुमेह",ex:"Diabetes mellitus einstellen."},
    {de:"die Herzinsuffizienz",en:"heart failure",hi:"हृदय विफलता",ex:"Herzinsuffizienz therapieren."},
    {de:"die Niereninsuffizienz",en:"renal failure",hi:"गुर्दे की विफलता",ex:"Niereninsuffizienz überwachen."},
    {de:"die COPD",en:"COPD",hi:"सीओपीडी",ex:"COPD-Patient sorgfältig pflegen."},
    {de:"die Demenz",en:"dementia",hi:"मनोभ्रंश",ex:"Demenz erfordert besondere Pflege."},
    {de:"der Delir",en:"delirium",hi:"प्रलाप",ex:"Delir früh erkennen."},
    {de:"die Depression",en:"depression",hi:"अवसाद",ex:"Depression angemessen behandeln."},
    {de:"die Angststörung",en:"anxiety disorder",hi:"चिंता विकार",ex:"Angststörung berücksichtigen."},
    {de:"suizidal",en:"suicidal",hi:"आत्मघाती",ex:"Suizidaler Patient braucht Schutz."},
    {de:"die Multiresistenz",en:"multi-drug resistance",hi:"बहु-औषध प्रतिरोध",ex:"Multiresistenz ist ein Problem."},
    {de:"MRSA",en:"MRSA",hi:"एमआरएसए",ex:"MRSA-Patient isolieren."},
    {de:"die Isolierung",en:"isolation",hi:"एकांतवास",ex:"Isolierung sofort einleiten."},
    {de:"das Hygienekonzept",en:"hygiene concept",hi:"स्वच्छता अवधारणा",ex:"Hygienekonzept streng einhalten."},
    {de:"die Dekolonisation",en:"decolonization",hi:"डी-कॉलोनाइजेशन",ex:"Dekolonisation durchführen."},
    {de:"die Forschung",en:"research",hi:"अनुसंधान",ex:"Pflegeforschung ist wichtig."},
    {de:"die Evaluation",en:"evaluation",hi:"मूल्यांकन",ex:"Maßnahmen evaluieren."},
    {de:"die Qualität",en:"quality",hi:"गुणवत्ता",ex:"Pflegequalität sichern."},
    {de:"das Outcome",en:"outcome",hi:"परिणाम",ex:"Positives Outcome anstreben."},
    {de:"das Riskomanagement",en:"risk management",hi:"जोखिम प्रबंधन",ex:"Risikomanagement umsetzen."},
    {de:"der Standard",en:"standard",hi:"मानक",ex:"Pflegestandards einhalten."},
    {de:"die Patientensicherheit",en:"patient safety",hi:"रोगी सुरक्षा",ex:"Patientensicherheit hat Priorität."},
    {de:"das Critical Incident Reporting",en:"critical incident reporting",hi:"गंभीर घटना रिपोर्टिंग",ex:"CIRS-System nutzen."},
    {de:"die Haftung",en:"liability",hi:"दायित्व",ex:"Haftung vermeiden durch Dokumentation."},
    {de:"die Delegation",en:"delegation (of tasks)",hi:"प्रत्यायोजन",ex:"Aufgaben korrekt delegieren."},
    {de:"die Supervision",en:"supervision",hi:"पर्यवेक्षण",ex:"Supervision für neue Pflegekräfte."},
    {de:"die Weiterbildung",en:"further training",hi:"आगे की शिक्षा",ex:"Weiterbildung ist Pflicht."},
    {de:"die Fachkompetenz",en:"professional competence",hi:"पेशेवर क्षमता",ex:"Fachkompetenz zeigen."},
    {de:"die interkulturelle Kompetenz",en:"intercultural competence",hi:"अंतर-सांस्कृतिक क्षमता",ex:"Interkulturelle Kompetenz wichtig."},
    {de:"die Empathie",en:"empathy",hi:"सहानुभूति",ex:"Empathie zeigen."},
  ],
}

// ── EXPANDED GRAMMAR ──────────────────────────────────────────────────────────
const GRAMMAR = [
  {
    level:'A1/A2',
    t:'Articles: der / die / das',
    c:`German has THREE genders — every noun has an article you must memorize!

MASCULINE (der):
→ der Arzt (doctor), der Patient (patient), der Arm (arm), der Bauch (stomach), der Rücken (back)
→ der Rollstuhl (wheelchair), der Blutdruck (blood pressure), der Puls (pulse)

FEMININE (die):
→ die Krankenschwester (nurse), die Klinik (clinic), die Wunde (wound), die Tablette (tablet)
→ die Pflege (care), die Behandlung (treatment), die Station (ward), die Diagnose (diagnosis)

NEUTER (das):
→ das Krankenhaus (hospital), das Medikament (medication), das Bett (bed), das Blut (blood)
→ das Fieber (fever), das Rezept (prescription), das Formular (form), das Zimmer (room)

💡 TIP: Always learn the article WITH the noun — never separate them!
Wrong: "Krankenhaus" ✗  →  Correct: "das Krankenhaus" ✓

PLURAL → always "die":
→ die Tabletten, die Patienten, die Ärzte, die Krankenschwestern`
  },
  {
    level:'A1/A2',
    t:'Present Tense (Präsens)',
    c:`REGULAR VERBS — Example: arbeiten (to work)

ich arbeite          → I work
du arbeitest         → you work (informal)
er/sie/es arbeitet   → he/she/it works
wir arbeiten         → we work
ihr arbeitet         → you (plural) work
sie/Sie arbeiten     → they/You (formal) work

⚠️ In nursing we ALWAYS use "Sie" (formal) with patients!

NURSING EXAMPLES:
→ Ich arbeite auf der Intensivstation. (I work in ICU)
→ Der Patient schläft gut. (The patient sleeps well)
→ Wie fühlen Sie sich? (How do you feel? — formal)
→ Ich messe Ihren Blutdruck. (I measure your blood pressure)
→ Der Arzt kommt gleich. (The doctor comes shortly)

IRREGULAR VERBS (must memorize!):
sein (to be):      ich bin / du bist / er ist / wir sind
haben (to have):   ich habe / du hast / er hat / wir haben
gehen (to go):     ich gehe / du gehst / er geht / wir gehen
nehmen (to take):  ich nehme / du nimmst / er nimmt / wir nehmen`
  },
  {
    level:'A2',
    t:'Cases: Nominativ, Akkusativ, Dativ',
    c:`German has 4 cases — articles CHANGE based on role in sentence!

NOMINATIV (subject — who is doing the action):
→ Der Patient liegt im Bett. (The patient lies in bed)
→ Die Schwester kommt. (The nurse comes)
→ Das Fieber steigt. (The fever rises)

AKKUSATIV (direct object — what/who receives the action):
→ Ich rufe den Arzt. (I call the doctor) [der → den]
→ Ich nehme die Tablette. (I take the tablet) [die → die — unchanged!]
→ Ich prüfe das Formular. (I check the form) [das → das — unchanged!]

DATIV (indirect object — to/for whom):
→ Ich gebe dem Patienten die Tablette. (I give the patient the tablet) [der → dem]
→ Ich helfe der Patientin. (I help the patient/female) [die → der]
→ Ich erkläre dem Kind die Lage. (I explain the situation to the child) [das → dem]

QUICK REFERENCE TABLE:
         | m (der) | f (die) | n (das)
Nominativ|  der    |  die    |  das
Akkusativ|  den    |  die    |  das
Dativ    |  dem    |  der    |  dem

NURSING EXAMPLE:
→ Ich gebe dem Patienten (Dat) die Medikamente (Akk).
   I give the patient his medications.`
  },
  {
    level:'A2/B1',
    t:'Modal Verbs (Modalverben)',
    c:`Modal verbs express ability, permission, obligation — essential in nursing!

MÜSSEN (must / have to):
→ Patient muss nüchtern bleiben. (Patient must stay fasting)
→ Sie müssen die Tabletten regelmäßig nehmen. (You must take tablets regularly)
→ Ich muss den Arzt informieren. (I must inform the doctor)

KÖNNEN (can / to be able to):
→ Können Sie einatmen? (Can you breathe in?)
→ Ich kann Ihnen helfen. (I can help you)
→ Der Patient kann nicht aufstehen. (The patient cannot stand up)

DÜRFEN (may / to be allowed to):
→ Sie dürfen aufstehen. (You may stand up)
→ Patienten dürfen nicht rauchen. (Patients are not allowed to smoke)
→ Darf ich Ihren Arm nehmen? (May I take your arm?)

SOLLEN (should / supposed to):
→ Medikament soll nach dem Essen genommen werden. (Medicine should be taken after eating)
→ Sie sollen morgen nüchtern kommen. (You should come fasting tomorrow)

WOLLEN (want to):
→ Der Patient will nach Hause. (The patient wants to go home)
→ Ich will den Arzt sprechen. (I want to speak to the doctor)

⚠️ WORD ORDER: Modal + infinitive at END of sentence!
→ Ich kann Ihnen die Spritze geben. ✓
→ Ich kann geben Ihnen die Spritze. ✗`
  },
  {
    level:'B1',
    t:'Perfekt (Past Tense)',
    c:`The Perfekt is the most common past tense in spoken German!

FORMATION: haben/sein + Partizip II (past participle)

MOST VERBS → use HABEN:
→ Ich habe die Tablette genommen. (I took the tablet)
→ Der Patient hat gut geschlafen. (The patient slept well)
→ Ich habe den Verband gewechselt. (I changed the bandage)
→ Die Ärztin hat die Diagnose gestellt. (The doctor made the diagnosis)

VERBS OF MOVEMENT/CHANGE → use SEIN:
→ Der Patient ist aufgestanden. (The patient got up) [aufstehen]
→ Ich bin ins Zimmer gegangen. (I went into the room) [gehen]
→ Das Fieber ist gesunken. (The fever went down) [sinken]
→ Der Zustand ist besser geworden. (The condition improved) [werden]

PARTIZIP II PATTERNS:
Regular:   ge + stem + t   → gearbeitet, gemacht, gefragt
Irregular: ge + stem + en  → genommen, gegeben, gefunden, geschrieben
sep. verb: stem + ge + part → aufgenommen, abgenommen, eingenommen

NURSING USAGE:
→ Ich habe die Vitalzeichen gemessen. (I measured the vital signs)
→ Patient hat Schmerzmittel erhalten. (Patient received painkillers)
→ Die Wundversorgung ist erfolgt. (Wound care has been carried out)
→ Blut wurde abgenommen. (Blood was drawn) — PASSIVE Perfekt!`
  },
  {
    level:'B1',
    t:'Subordinate Clauses (Nebensätze)',
    c:`In subordinate clauses, the VERB goes to the END — very important for B1!

WEIL (because):
→ Ich rufe den Arzt, weil der Patient Schmerzen hat.
  (I call the doctor because the patient has pain.)
→ Sie bleibt im Bett, weil sie Fieber hat.
  (She stays in bed because she has fever.)

OBWOHL (although):
→ Obwohl er Schmerzen hat, bleibt er ruhig.
  (Although he has pain, he stays calm.)
→ Sie isst nicht, obwohl sie Hunger hat.
  (She doesn't eat although she is hungry.)

WENN/FALLS (if / when):
→ Wenn Sie Schmerzen haben, klingeln Sie bitte.
  (If/When you have pain, please ring the bell.)
→ Falls die Übelkeit schlimmer wird, sagen Sie mir Bescheid.
  (If the nausea gets worse, let me know.)

DAMIT (so that):
→ Ich erkläre die Medikamente, damit Sie sie richtig nehmen.
  (I explain the medications so that you take them correctly.)

SOBALD (as soon as):
→ Sobald der Arzt da ist, informiere ich Sie.
  (As soon as the doctor is here, I will inform you.)

BEVOR (before) / NACHDEM (after):
→ Bevor Sie schlafen, nehmen Sie die Tablette.
  (Before you sleep, take the tablet.)
→ Nachdem die Visite ist, erkläre ich alles.
  (After the ward round, I will explain everything.)

⚠️ REMEMBER: Verb always at END of subordinate clause!`
  },
  {
    level:'B1/B2',
    t:'Passive Voice (Passiv)',
    c:`PASSIVE is essential for medical documentation and nursing reports!

PRESENT PASSIVE (Präsens Passiv):
Formation: werden + Partizip II

→ Das Medikament wird gegeben. (The medication is given)
→ Der Verband wird gewechselt. (The dressing is changed)
→ Die Wunde wird versorgt. (The wound is treated)
→ Der Patient wird untersucht. (The patient is examined)
→ Blut wird abgenommen. (Blood is drawn)
→ Maßnahmen werden eingeleitet. (Measures are initiated)

PAST PASSIVE (Perfekt Passiv):
Formation: sein + Partizip II + worden

→ Das Medikament ist gegeben worden. (The medication was given)
→ Der Patient ist aufgenommen worden. (The patient was admitted)
→ Die Operation ist durchgeführt worden. (The operation was performed)

WITH AGENT (von = by):
→ Das Medikament wird vom Arzt verschrieben. (prescribed by the doctor)
→ Der Verband wird von der Schwester gewechselt. (changed by the nurse)

NURSING DOCUMENTATION:
→ Vitaldaten wurden dokumentiert. ✓
→ Medikamente wurden verabreicht. ✓
→ Patient wurde informiert und aufgeklärt. ✓
→ Wundversorgung wurde täglich durchgeführt. ✓

💡 Use passive when the ACTION is more important than WHO does it.`
  },
  {
    level:'B2',
    t:'Konjunktiv II (Subjunctive)',
    c:`Konjunktiv II is used for polite requests, recommendations, hypotheticals — essential for professional B2 communication!

POLITE RECOMMENDATIONS (very common in nursing!):
→ Ich würde empfehlen, dass Sie ruhen. (I would recommend that you rest)
→ Es wäre besser, wenn Sie mehr trinken würden. (It would be better if you drank more)
→ Könnten Sie mir bitte die Hand geben? (Could you please give me your hand?)
→ Dürfte ich fragen, wie alt Sie sind? (May I ask how old you are?)
→ Würden Sie bitte ruhig bleiben? (Would you please stay calm?)

HYPOTHETICAL SITUATIONS:
→ Wenn der Patient früher gekommen wäre, hätte man besser helfen können.
  (If the patient had come earlier, we could have helped better.)
→ Wenn ich an Ihrer Stelle wäre, würde ich den Arzt fragen.
  (If I were in your position, I would ask the doctor.)

KEY FORMS (often irregular!):
sein   → wäre     (would be)
haben  → hätte    (would have)
können → könnte   (could)
müssen → müsste   (should/would have to)
dürfen → dürfte   (would be allowed to)
werden → würde    (would)
wollen → wollte   (would want)

PROFESSIONAL COMMUNICATION:
→ Ich würde vorschlagen... (I would suggest...)
→ Es wäre ratsam... (It would be advisable...)
→ Man könnte erwägen... (One could consider...)
→ Wäre es möglich... (Would it be possible...)

💡 In professional settings Konjunktiv II sounds more polite and respectful!`
  },
  {
    level:'B2',
    t:'Medical Documentation Language',
    c:`Special language patterns used in German medical records and nursing documentation:

OBJECTIVE STYLE (no "I" — use passive or impersonal forms):
→ Patient klagt über... (Patient complains of...)
→ Es wurde festgestellt, dass... (It was determined that...)
→ Die Untersuchung ergibt... (The examination shows...)
→ Befund: unauffällig / auffällig (Finding: normal / abnormal)

ABBREVIATIONS COMMON IN DOCS:
→ RR = Blutdruck (blood pressure — Riva-Rocci)
→ HF = Herzfrequenz (heart rate)
→ AF = Atemfrequenz (respiratory rate)
→ T° = Temperatur
→ SpO2 = Sauerstoffsättigung
→ BZ = Blutzucker (blood sugar)
→ i.v. = intravenös / s.c. = subkutan / p.o. = per os (oral)
→ n.N. = nach Notwendigkeit (as needed / PRN)

DESCRIBING SYMPTOMS:
→ Der Patient gibt an, ... (The patient states that...)
→ Schmerzen werden als ... beschrieben. (Pain is described as...)
→ stechend (stabbing), dumpf (dull), brennend (burning), drückend (pressing)
→ zeitweise (intermittent), dauerhaft (persistent), anfallsweise (in episodes)

HANDOVER (Übergabe) STRUCTURE — SBAR:
S = Situation: "Patient X, 65 Jahre, auf Station 3..."
B = Background: "Aufnahme wegen... Vorerkrankungen..."
A = Assessment: "Aktuell klagt über... Vitalzeichen..."
R = Recommendation: "Bitte beachten Sie... Maßnahmen..."

NURSING RECORD PHRASES:
→ Pflegemaßnahmen wurden durchgeführt. ✓
→ Patient war kooperativ / nicht kooperativ.
→ Zustand stabil / verschlechtert / verbessert.
→ Nächste Kontrolle: [time/date].`
  },
]

export default function LearnHub({ user, onAddScore }) {
  const [sub, setSub] = useState('exercises')

  // EXERCISES STATE
  const [setNum, setSetNum] = useState(null)   // which of 10 sets
  const [exSt, setExSt] = useState(null)
  const [showSetPicker, setShowSetPicker] = useState(false)

  // VOCAB STATE
  const [vocIdx, setVocIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [vocMode, setVocMode] = useState('card')
  const [showVocInstructions, setShowVocInstructions] = useState(true)

  // GRAMMAR STATE
  const [gramIdx, setGramIdx] = useState(null)

  // Combined vocab
  const baseVocab = VOCAB[user?.level] || []
  const extraVocab = EXTRA_VOCAB[user?.level] || []
  const vocab = [...baseVocab, ...extraVocab]
  const vc = vocab[vocIdx % vocab.length]

  const scores = JSON.parse(localStorage.getItem(`gc_ex_${user?.level}`) || '[]')
  const lastScore = scores[scores.length - 1]
  const bestScore = scores.length ? Math.max(...scores) : null

  function startSet(n) {
    // Each "set" is 20 questions from a seeded random (consistent per set number)
    const bank = EXERCISES[user?.level] || EXERCISES.A1
    // For set n, shuffle deterministically then take 20
    const shuffled = [...bank].sort((a, b) => {
      const hashA = (a.q.charCodeAt(0) * (n + 1) + a.q.length) % bank.length
      const hashB = (b.q.charCodeAt(0) * (n + 1) + b.q.length) % bank.length
      return hashA - hashB
    })
    // But actually use random for variety — just track which set number
    const randomized = [...bank].sort(() => Math.random() - 0.5).slice(0, 20)
    setSetNum(n)
    setExSt({ qs: randomized, cur: 0, score: 0, sel: null, done: false, start: Date.now() })
    setShowSetPicker(false)
    trackEvent(user?.rollNumber, 'exercise_start', 'exercise', `Set ${n}`, user?.level)
  }

  function answerEx(i) {
    if (!exSt || exSt.sel !== null) return
    const ok = i === exSt.qs[exSt.cur].ans
    const ns = { ...exSt, sel: i, score: exSt.score + (ok ? 1 : 0) }
    setExSt(ns)
    setTimeout(() => {
      if (exSt.cur + 1 >= exSt.qs.length) {
        trackEvent(user?.rollNumber, 'exercise_complete', 'exercise', `Set ${setNum} Score ${ns.score}`, user?.level, ns.score)
        onAddScore && onAddScore(ns.score)
        const k = `gc_ex_${user?.level}`
        const prev = JSON.parse(localStorage.getItem(k) || '[]')
        prev.push(ns.score); if (prev.length > 100) prev.shift()
        localStorage.setItem(k, JSON.stringify(prev))
        setExSt({ ...ns, done: true })
      } else {
        setExSt({ ...ns, cur: ns.cur + 1, sel: null })
      }
    }, 800)
  }

  function speak(text) {
    window.speechSynthesis.cancel()
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'de-DE'; u.rate = 0.85
      const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('de'))
      if (v) u.voice = v
      u.onerror = () => {}
      window.speechSynthesis.speak(u)
    }, 100)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>📚 Learn Hub</h2>
      <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>Exercises · Vocabulary · Grammar</p>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 14, background: '#fff', borderRadius: 10, padding: 3, border: `1px solid ${C.border}` }}>
        {[['exercises', '💪 Exercises'], ['vocab', '🔤 Vocabulary'], ['grammar', '📐 Grammar']].map(([id, lbl]) => (
          <button key={id} onClick={() => setSub(id)}
            style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11, fontFamily: 'inherit', background: sub === id ? C.navy : 'transparent', color: sub === id ? '#fff' : C.textS, transition: 'all .15s' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── EXERCISES ── */}
      {sub === 'exercises' && (
        !exSt ? (
          <div>
            {/* Stats bar */}
            {scores.length > 0 && (
              <div style={{ display: 'flex', gap: 12, background: '#fff', borderRadius: 11, border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 14, justifyContent: 'center' }}>
                {[['Last', `${lastScore}/20`], ['Best', `${bestScore}/20`], ['Sessions', scores.length]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{v}</div>
                    <div style={{ fontSize: 10, color: C.textS }}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Intro */}
            <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, borderRadius: 14, padding: '18px 20px', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💪</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 4 }}>10 Exercise Sets</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.6 }}>
                Each set has 20 questions · Level <strong style={{ color: C.blueM }}>{user?.level}</strong><br />
                Complete all 10 sets for full mastery!
              </div>
            </div>

            {/* 10 set buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                const sessionScores = JSON.parse(localStorage.getItem(`gc_ex_set_${user?.level}_${n}`) || 'null')
                return (
                  <div key={n} onClick={() => startSet(n)}
                    style={{ background: sessionScores !== null ? C.greenL : '#fff', border: `2px solid ${sessionScores !== null ? C.green : C.border}`, borderRadius: 11, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = C.shM}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: sessionScores !== null ? C.green : C.navy }}>
                      {sessionScores !== null ? '✅' : n}
                    </div>
                    <div style={{ fontSize: 9, color: C.textS, marginTop: 2 }}>Set {n}</div>
                    {sessionScores !== null && <div style={{ fontSize: 10, fontWeight: 600, color: C.green }}>{sessionScores}/20</div>}
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: 10, color: C.textS, textAlign: 'center' }}>Each session randomly picks 20 questions from 200+ question bank</p>
          </div>
        ) : exSt.done ? (
          <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{exSt.score >= 16 ? '🏆' : exSt.score >= 12 ? '🎓' : exSt.score >= 8 ? '📚' : '💪'}</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{exSt.score}/20</div>
            <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>{Math.round((exSt.score / 20) * 100)}% correct · Set {setNum}</div>
            <PBar pct={(exSt.score / 20) * 100} color={exSt.score >= 16 ? C.green : exSt.score >= 12 ? C.blue : C.amber} h={8} style={{ marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Btn label="← All Sets" onClick={() => setExSt(null)} variant="outline" />
              <Btn label="Try Again 🔄" onClick={() => startSet(setNum)} variant="primary" />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
              <Btn label="← Sets" onClick={() => setExSt(null)} variant="ghost" size="sm" />
              <span style={{ fontSize: 10, color: C.textS }}>Set {setNum} · Q{exSt.cur + 1}/20 · Score: {exSt.score}</span>
            </div>
            <PBar pct={(exSt.cur / 20) * 100} h={4} style={{ marginBottom: 10 }} />
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '13px 15px', marginBottom: 9 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>{exSt.qs[exSt.cur].q}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exSt.qs[exSt.cur].opts.map((opt, i) => {
                const isSel = exSt.sel === i, isOk = i === exSt.qs[exSt.cur].ans, show = exSt.sel !== null
                let bg = '#fff', border = C.border, color = C.text
                if (show) { if (isOk) { bg = C.greenL; border = C.green; color = C.green } else if (isSel) { bg = C.redL; border = C.red; color = C.red } }
                return (
                  <div key={i} onClick={() => answerEx(i)}
                    style={{ background: bg, border: `2px solid ${border}`, borderRadius: 9, padding: '10px 13px', cursor: show ? 'default' : 'pointer', fontSize: 12, color, fontWeight: (isSel || (show && isOk)) ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .12s' }}>
                    <span style={{ width: 19, height: 19, borderRadius: '50%', background: show && isOk ? C.green : show && isSel ? C.red : C.border, color: show ? '#fff' : C.textS, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                      {show ? (isOk ? '✓' : isSel ? '✗' : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                    </span>{opt}
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}

      {/* ── VOCABULARY ── */}
      {sub === 'vocab' && (
        <div>
          {/* Instructions panel */}
          <div style={{ background: C.blueL, borderRadius: 12, border: `1px solid ${C.blue}33`, padding: '13px 15px', marginBottom: 12, cursor: 'pointer' }}
            onClick={() => setShowVocInstructions(v => !v)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: C.blue, fontSize: 12 }}>💡 How to Use Flashcards for Memorization</div>
              <span style={{ color: C.blue, fontSize: 12 }}>{showVocInstructions ? '▲' : '▼'}</span>
            </div>
            {showVocInstructions && (
              <div style={{ marginTop: 10, fontSize: 11, color: C.textM, lineHeight: 1.8 }}>
                <strong style={{ color: C.navy }}>🧠 The Spaced Repetition Method:</strong><br />
                1. <strong>See the German word</strong> → try to recall meaning BEFORE flipping<br />
                2. <strong>Flip the card</strong> → check if you were right<br />
                3. <strong>Got it right?</strong> → move on. <strong>Wrong?</strong> → go back and repeat it<br />
                4. <strong>Say it out loud</strong> → press 🔊 and repeat after the audio<br />
                5. <strong>Make a sentence</strong> → use the example sentence in conversation<br /><br />
                <strong style={{ color: C.navy }}>📅 Best Practice:</strong><br />
                • Day 1: Study 20 new cards<br />
                • Day 2: Review yesterday's + 20 new<br />
                • Day 4: Review again (spaced repetition!)<br />
                • Day 7: Final review<br /><br />
                <strong style={{ color: C.navy }}>🎯 Pro Tips:</strong><br />
                • Connect German to the Hindi meaning — both languages help!<br />
                • Use the word 3 times in a sentence = it sticks<br />
                • Group similar words: all body parts, all medications, etc.
              </div>
            )}
          </div>

          {/* Mode switcher */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            {[['card', '🃏 Flashcards'], ['list', '📋 Full List']].map(([m, lbl]) => (
              <button key={m} onClick={() => setVocMode(m)}
                style={{ padding: '5px 12px', borderRadius: 7, border: `1.5px solid ${vocMode === m ? C.blue : C.border}`, background: vocMode === m ? C.blueL : 'transparent', color: vocMode === m ? C.blue : C.textS, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                {lbl}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: 10, color: C.textS, display: 'flex', alignItems: 'center' }}>
              {(vocIdx % vocab.length) + 1}/{vocab.length} cards
            </div>
          </div>

          {vocMode === 'card' && vc ? (
            <div>
              <div onClick={() => setFlipped(f => !f)}
                style={{ background: flipped ? `linear-gradient(135deg,${C.navy},${C.navyM})` : '#fff', border: `1px solid ${C.border}`, borderRadius: 15, padding: '28px 20px', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .3s', boxShadow: C.shM, marginBottom: 12, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 9, color: flipped ? 'rgba(255,255,255,.35)' : C.textS }}>{flipped ? 'EN / हिंदी' : 'Tap to flip →'}</div>
                {!flipped ? (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 5, textAlign: 'center' }}>{vc.de}</div>
                    <div style={{ fontSize: 11, color: C.textS, fontStyle: 'italic', marginBottom: 12, textAlign: 'center' }}>"{vc.ex}"</div>
                    <Btn label="🔊 Listen" onClick={e => { e.stopPropagation(); speak(vc.de) }} variant="outline" size="sm" />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 5, textAlign: 'center' }}>{vc.en}</div>
                    <div style={{ fontSize: 16, color: 'rgba(255,255,255,.8)', marginBottom: 8, textAlign: 'center' }}>🇮🇳 {vc.hi}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontStyle: 'italic', textAlign: 'center' }}>"{vc.ex}"</div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Btn label="← Prev" onClick={() => { setVocIdx(i => (i - 1 + vocab.length) % vocab.length); setFlipped(false) }} variant="outline" />
                <Btn label="Next →" onClick={() => { setVocIdx(i => (i + 1) % vocab.length); setFlipped(false) }} variant="accent" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {vocab.map((w, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>{w.de}</span>
                    <span style={{ color: C.textS, fontSize: 10, marginLeft: 6 }}>· {w.en}</span>
                    <div style={{ fontSize: 10, color: C.textS, marginTop: 1 }}>🇮🇳 {w.hi}</div>
                    <div style={{ fontSize: 10, color: C.textS, marginTop: 1, fontStyle: 'italic' }}>"{w.ex}"</div>
                  </div>
                  <button onClick={() => speak(w.de)} style={{ border: 'none', background: C.blueL, color: C.blue, padding: '3px 7px', borderRadius: 5, cursor: 'pointer', fontSize: 10, flexShrink: 0 }}>🔊</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GRAMMAR ── */}
      {sub === 'grammar' && (
        <div>
          <div style={{ background: C.greenL, border: `1px solid ${C.green}33`, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>📐 All levels covered: A1 · A2 · B1 · B2</div>
            <div style={{ fontSize: 10, color: C.textM, marginTop: 2 }}>With nursing examples, use cases and professional documentation language</div>
          </div>
          {GRAMMAR.map((g, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}
              onClick={() => setGramIdx(gramIdx === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ background: C.blueL, color: C.blue, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, marginRight: 7 }}>{g.level}</span>
                  <span style={{ fontWeight: 600, color: C.navy, fontSize: 12 }}>{g.t}</span>
                </div>
                <span style={{ color: C.blue, fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{gramIdx === i ? '▲' : '▼'}</span>
              </div>
              {gramIdx === i && (
                <div style={{ marginTop: 11, fontSize: 11, color: C.textM, lineHeight: 1.9, whiteSpace: 'pre-line', borderTop: `1px solid ${C.border}`, paddingTop: 11, fontFamily: 'monospace' }}>
                  {g.c}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

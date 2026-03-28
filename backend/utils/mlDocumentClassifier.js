const natural = require('natural');

const classifier = new natural.BayesClassifier();

function normalizeText(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeText(text = '') {
  return normalizeText(text).split(' ').filter(Boolean);
}

const trainingData = [
  { text: 'i need birth certificate', label: 'Birth Certificate' },
  { text: 'apply birth certificate', label: 'Birth Certificate' },
  { text: 'child birth certificate required', label: 'Birth Certificate' },
  { text: 'birth certificate needed', label: 'Birth Certificate' },

  { text: 'land ownership certificate', label: 'Land Ownership Certificate' },
  { text: 'property ownership proof', label: 'Land Ownership Certificate' },
  { text: 'land proof certificate', label: 'Land Ownership Certificate' },
  { text: 'need land certificate', label: 'Land Ownership Certificate' },

  { text: 'income certificate', label: 'Income Certificate' },
  { text: 'salary certificate required', label: 'Income Certificate' },
  { text: 'income proof for scholarship', label: 'Income Certificate' },
  { text: 'i need income certificate', label: 'Income Certificate' },

  { text: 'building approval', label: 'Building Approval' },
  { text: 'house construction approval', label: 'Building Approval' },
  { text: 'building plan approval', label: 'Building Approval' },
  { text: 'need building approval', label: 'Building Approval' },

  { text: 'business license', label: 'Business License' },
  { text: 'shop license required', label: 'Business License' },
  { text: 'trade license needed', label: 'Business License' },
  { text: 'i need business license', label: 'Business License' },

  { text: 'new water connection', label: 'New Water Connection' },
  { text: 'apply water connection', label: 'New Water Connection' },
  { text: 'house water supply connection', label: 'New Water Connection' },
  { text: 'need water connection', label: 'New Water Connection' },

  { text: 'electricity connection', label: 'Electricity Connection' },
  { text: 'new eb connection', label: 'Electricity Connection' },
  { text: 'power connection for house', label: 'Electricity Connection' },
  { text: 'need electricity connection', label: 'Electricity Connection' }
];

trainingData.forEach((item) => {
  classifier.addDocument(tokenizeText(item.text), item.label);
});

classifier.train();

function translateTamilDocumentToEnglish(text = '') {
  const input = normalizeText(text);

  const rules = [
    {
      patterns: [
        'பிறப்பு சான்றிதழ்',
        'எனக்கு பிறப்பு சான்றிதழ் வேண்டும்',
        'குழந்தைக்கு பிறப்பு சான்றிதழ் வேண்டும்'
      ],
      english: 'i need birth certificate'
    },
    {
      patterns: [
        'நில உரிமை சான்றிதழ்',
        'நில சான்றிதழ்',
        'எனக்கு நில உரிமை சான்றிதழ் வேண்டும்'
      ],
      english: 'i need land ownership certificate'
    },
    {
      patterns: [
        'வருமான சான்றிதழ்',
        'எனக்கு வருமான சான்றிதழ் வேண்டும்',
        'படிப்பிற்கு வருமான சான்றிதழ் வேண்டும்'
      ],
      english: 'i need income certificate'
    },
    {
      patterns: [
        'கட்டிடம் அனுமதி',
        'கட்டிட அனுமதி',
        'வீடு கட்ட அனுமதி வேண்டும்'
      ],
      english: 'need building approval'
    },
    {
      patterns: [
        'வணிக உரிமம்',
        'கடை உரிமம்',
        'எனக்கு வணிக உரிமம் வேண்டும்'
      ],
      english: 'i need business license'
    },
    {
      patterns: [
        'புதிய நீர் இணைப்பு',
        'நீர் இணைப்பு வேண்டும்',
        'எனக்கு புதிய நீர் இணைப்பு வேண்டும்'
      ],
      english: 'need water connection'
    },
    {
      patterns: [
        'மின்சாரம் இணைப்பு',
        'புதிய மின் இணைப்பு',
        'எனக்கு மின்சாரம் இணைப்பு வேண்டும்'
      ],
      english: 'need electricity connection'
    }
  ];

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (input.includes(normalizeText(pattern))) {
        return rule.english;
      }
    }
  }

  return text;
}

function predictDocumentTypeML(text = '') {
  if (!text.trim()) return null;

  const translatedText = translateTamilDocumentToEnglish(text);
  const classifications = classifier.getClassifications(tokenizeText(translatedText));

  if (!classifications.length) return null;

  const best = classifications[0];

  if (best.value < 0.01) return null;

  return {
    predictedType: best.label,
    score: best.value,
    translatedText
  };
}

module.exports = {
  predictDocumentTypeML
};
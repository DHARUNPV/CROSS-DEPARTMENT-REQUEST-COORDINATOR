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
  { text: 'Water leakage near my house', label: 'Water leakage' },
  { text: 'pipe is leaking', label: 'Water leakage' },
  { text: 'Water pipe broken', label: 'Water leakage' },
  { text: 'water overflow on road', label: 'Water leakage' },
  { text: 'there is water leakage in my area', label: 'Water leakage' },
  { text: 'Water leakage  in my area', label: 'Water leakage' },

  { text: 'road is damaged', label: 'Road damage' },
  { text: 'road broken badly', label: 'Road damage' },
  { text: 'street road damaged', label: 'Road damage' },
  { text: 'road crack in my area', label: 'Road damage' },

  { text: 'big pothole on road', label: 'Pothole' },
  { text: 'hole in the road', label: 'Pothole' },
  { text: 'pit in road', label: 'Pothole' },
  { text: 'road has pothole', label: 'Pothole' },

  { text: 'street light not working', label: 'Street light issue' },
  { text: 'streetlight problem', label: 'Street light issue' },
  { text: 'road light not glowing', label: 'Street light issue' },
  { text: 'lamp post light off', label: 'Street light issue' },

  { text: 'garbage not collected', label: 'Garbage not collected' },
  { text: 'waste not cleaned', label: 'Garbage not collected' },
  { text: 'trash overflow near house', label: 'Garbage not collected' },
  { text: 'garbage problem in my area', label: 'Garbage not collected' },

  { text: 'drainage blocked', label: 'Drainage blockage' },
  { text: 'drainage in my area', label: 'Drainage blockage' },
  { text: 'sewage blockage in my area', label: 'Drainage blockage' },
  { text: 'dirty water in my area', label: 'Drainage blockage' },
  { text: 'water is polluted in my area', label: 'Drainage blockage' },
  { text: 'drain overflow near my home', label: 'Drainage blockage' },

  { text: 'tree fallen on road', label: 'Tree fallen on road' },
  { text: 'tree blocking road', label: 'Tree fallen on road' },
  { text: 'fallen tree in street', label: 'Tree fallen on road' },
  { text: 'tree branch collapsed on road', label: 'Tree fallen on road' }
];

trainingData.forEach((item) => {
  classifier.addDocument(tokenizeText(item.text), item.label);
});

classifier.train();

function translateTamilToEnglish(text = '') {
  const input = normalizeText(text);

  const rules = [
    {
      patterns: [
        'தண்ணீர் கசிவு',
        'நீர் கசிவு',
        'தண்ணீர் கசிகிறது',
        'நீர் ஒழுகுகிறது',
        'குழாய் கசிகிறது',
        'குழாயில் தண்ணீர் கசிவு',
        'என் பகுதியில் நீர் கசிவு',
        'என் பகுதியில் தண்ணீர் கசிவு'
      ],
      english: 'there is water leakage in my area'
    },
    {
      patterns: [
        'சாலை சேதம்',
        'சாலை உடைந்துள்ளது',
        'சாலை மோசமாக உள்ளது',
        'சாலை பிளவு',
        'சாலை கெட்டுப்போயுள்ளது'
      ],
      english: 'road is damaged'
    },
    {
      patterns: [
        'சாலையில் குழி',
        'பெரிய குழி உள்ளது',
        'சாலையில் பள்ளம் உள்ளது',
        'சாலையில் ஓட்டை'
      ],
      english: 'big pothole on road'
    },
    {
      patterns: [
        'தெரு விளக்கு வேலை செய்யவில்லை',
        'தெரு விளக்கு எரியவில்லை',
        'விளக்கு ஒளி இல்லை',
        'தெரு விளக்கு பிரச்சனை'
      ],
      english: 'street light not working'
    },
    {
      patterns: [
        'குப்பை அகற்றப்படவில்லை',
        'குப்பை சேகரிக்கவில்லை',
        'குப்பை தேங்கியுள்ளது',
        'குப்பை பிரச்சனை'
      ],
      english: 'garbage not collected'
    },
    {
      patterns: [
        'வடிகால் அடைப்பு உள்ளது',
        'கழிவுநீர் தேங்கியுள்ளது',
        'வடிகால் பிரச்சனை உள்ளது',
        'தண்ணீர் மாசடைந்துள்ளது',
        'மாசான தண்ணீர்',
        'அழுக்கு தண்ணீர்'
      ],
      english: 'water is polluted in my area'
    },
    {
      patterns: [
        'சாலையில் மரம் விழுந்துள்ளது',
        'மரம் சாலையில் விழுந்துள்ளது',
        'மரம் விழுந்து பாதை மறித்துள்ளது'
      ],
      english: 'tree fallen on road'
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

function predictComplaintTypeML(text = '') {
  if (!text.trim()) return null;

  const translatedText = translateTamilToEnglish(text);
  const tokens = tokenizeText(translatedText);
  const classifications = classifier.getClassifications(tokens);

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
  predictComplaintTypeML
};
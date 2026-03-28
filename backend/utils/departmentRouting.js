const natural = require('natural');  

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const JaroWinklerDistance = natural.JaroWinklerDistance;

const COMPLAINT_DEPARTMENTS = {
  // This project uses 5 departments:
  // Water Supply Department, Electricity Department, Municipality, Revenue Department, Health Department
  'Water leakage': ['Water Supply Department', 'Municipality'],
  'Road damage': ['Municipality'],
  'Pothole': ['Municipality'],
  'Street light issue': ['Electricity Department', 'Municipality'],
  'Garbage not collected': ['Municipality'],
  'Drainage blockage': ['Municipality', 'Water Supply Department'],
  'Tree fallen on road': ['Municipality']
};

const DOCUMENT_DEPARTMENTS = {
  'Birth Certificate': ['Health Department', 'Municipality'],
  'Land Ownership Certificate': ['Revenue Department'],
  'Income Certificate': ['Revenue Department', 'Municipality'],
  'Building Approval': ['Municipality', 'Electricity Department', 'Water Supply Department'],
  'Business License': ['Municipality', 'Revenue Department'],
  'New Water Connection': ['Water Supply Department', 'Municipality'],
  'Electricity Connection': ['Electricity Department', 'Municipality']
};

const COMPLAINT_SYNONYMS = {
  'Water leakage': [
    'water leakage',
    'water leaking',
    'pipe leakage',
    'water pipe broken',
    'water overflow',
    'water supply leakage',
    'dirty water leakage'
  ],
  'Road damage': [
    'road damage',
    'road broken',
    'damaged road',
    'road crack',
    'bad road',
    'road not good'
  ],
  'Pothole': [
    'pothole',
    'pit on road',
    'hole in road',
    'road hole'
  ],
  'Street light issue': [
    'street light issue',
    'street light problem',
    'streetlight problem',
    'street light not working',
    'streetlight not working',
    'light not working',
    'lamp not working'
  ],
  'Garbage not collected': [
    'garbage not collected',
    'waste not collected',
    'trash not collected',
    'garbage problem',
    'waste overflow',
    'garbage overflow'
  ],
  'Drainage blockage': [
    'drainage blockage',
    'drainage blocked',
    'drain blocked',
    'drainage problem',
    'sewage blockage',
    'dirty drainage water',
    'drainage polluted',
    'drainage overflow'
  ],
  'Tree fallen on road': [
    'tree fallen on road',
    'fallen tree',
    'tree blocking road',
    'branch fallen on road'
  ]
};

const DOCUMENT_SYNONYMS = {
  'Birth Certificate': [
    'birth certificate',
    'need birth certificate',
    'apply birth certificate',
    'child birth certificate',
    'baby birth certificate'
  ],
  'Land Ownership Certificate': [
    'land ownership certificate',
    'land certificate',
    'property certificate',
    'ownership certificate',
    'land proof'
  ],
  'Income Certificate': [
    'income certificate',
    'salary certificate',
    'income proof',
    'annual income certificate'
  ],
  'Building Approval': [
    'building approval',
    'house approval',
    'construction approval',
    'building plan approval'
  ],
  'Business License': [
    'business license',
    'shop license',
    'trade license',
    'business approval'
  ],
  'New Water Connection': [
    'new water connection',
    'water connection',
    'need water connection',
    'water supply connection'
  ],
  'Electricity Connection': [
    'electricity connection',
    'new electricity connection',
    'eb connection',
    'power connection',
    'current connection'
  ]
};

function preprocessText(text = '') {
  const tokens = tokenizer.tokenize(String(text).toLowerCase());
  return tokens.map((token) => stemmer.stem(token)).join(' ');
}

function uniqueDepartments(list = []) {
  return [...new Set(
    list
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  )];
}

function findBestMatch(input, options, synonymsMap = {}) {
  if (!input) return null;

  const inputLower = String(input).toLowerCase().trim();

  // 1. Exact match first
  const exact = options.find((k) => k.toLowerCase() === inputLower);
  if (exact) return exact;

  // 2. Exact synonym match
  for (const option of options) {
    const phrases = [option, ...(synonymsMap[option] || [])];
    const exactSynonym = phrases.find((p) => p.toLowerCase() === inputLower);
    if (exactSynonym) return option;
  }

  // 3. Contains match
  for (const option of options) {
    const phrases = [option, ...(synonymsMap[option] || [])];
    const contains = phrases.find(
      (p) => inputLower.includes(p.toLowerCase()) || p.toLowerCase().includes(inputLower)
    );
    if (contains) return option;
  }

  // 4. NLP-based similarity match
  const processedInput = preprocessText(inputLower);

  let bestMatch = null;
  let bestScore = 0;

  for (const option of options) {
    const phrases = [option, ...(synonymsMap[option] || [])];

    for (const phrase of phrases) {
      const processedOption = preprocessText(phrase);
      const score = JaroWinklerDistance(processedInput, processedOption);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = option;
      }
    }
  }

  // threshold to avoid wrong prediction
  return bestScore >= 0.82 ? bestMatch : null;
}

function predictComplaintTypeFromText(text) {
  return (
    findBestMatch(
      text,
      Object.keys(COMPLAINT_DEPARTMENTS),
      COMPLAINT_SYNONYMS
    ) || ''
  );
}

function predictDocumentTypeFromText(text) {
  return (
    findBestMatch(
      text,
      Object.keys(DOCUMENT_DEPARTMENTS),
      DOCUMENT_SYNONYMS
    ) || ''
  );
}

function getDepartmentsForComplaint(complaintType) {
  const normalized = findBestMatch(
    complaintType,
    Object.keys(COMPLAINT_DEPARTMENTS),
    COMPLAINT_SYNONYMS
  );

  return normalized
    ? uniqueDepartments(COMPLAINT_DEPARTMENTS[normalized])
    : ['Municipality'];
}

function getDepartmentsForDocument(documentType) {
  const normalized = findBestMatch(
    documentType,
    Object.keys(DOCUMENT_DEPARTMENTS),
    DOCUMENT_SYNONYMS
  );

  return normalized
    ? uniqueDepartments(DOCUMENT_DEPARTMENTS[normalized])
    : ['Municipality'];
}

function getDepartmentsForRequest(requestCategory, requestType) {
  if (requestCategory === 'complaint') return getDepartmentsForComplaint(requestType);
  if (requestCategory === 'document') return getDepartmentsForDocument(requestType);
  return ['Municipality'];
}

module.exports = {
  getDepartmentsForComplaint,
  getDepartmentsForDocument,
  getDepartmentsForRequest,
  predictComplaintTypeFromText,
  predictDocumentTypeFromText,
  COMPLAINT_DEPARTMENTS,
  DOCUMENT_DEPARTMENTS
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { config, requests } from '../api/api';

const DOCUMENT_FIELDS = {
  'Birth Certificate': [
    { key: 'childName', label: 'Child Name', required: true, type: 'text' },
    { key: 'parentName', label: 'Parent Name', required: true, type: 'text' },
    { key: 'dateOfBirth', label: 'Date of Birth', required: true, type: 'date' },
    { key: 'gender', label: 'Gender', required: true, type: 'text' },
    { key: 'hospitalName', label: 'Hospital Name', required: true, type: 'text' },
    { key: 'placeOfBirth', label: 'Place of Birth', required: true, type: 'text' },
    { key: 'address', label: 'Address', required: true, type: 'textarea' },
  ],
  'Land Ownership Certificate': [
    { key: 'ownerName', label: 'Owner Name', required: true, type: 'text' },
    { key: 'parentName', label: 'Father / Mother Name', required: true, type: 'text' },
    { key: 'surveyNumber', label: 'Survey Number', required: true, type: 'text' },
    { key: 'landLocation', label: 'Land Location', required: true, type: 'text' },
    { key: 'taluk', label: 'Taluk', required: true, type: 'text' },
    { key: 'district', label: 'District', required: true, type: 'text' },
    { key: 'areaSize', label: 'Area Size', required: true, type: 'text' },
    { key: 'pattaNumber', label: 'Patta Number', required: false, type: 'text' },
  ],
  'Income Certificate': [
    { key: 'applicantName', label: 'Applicant Name', required: true, type: 'text' },
    { key: 'parentName', label: 'Father / Mother Name', required: true, type: 'text' },
    { key: 'annualIncome', label: 'Annual Income', required: true, type: 'number' },
    { key: 'occupation', label: 'Occupation', required: true, type: 'text' },
    { key: 'familyMembersCount', label: 'Family Members Count', required: false, type: 'number' },
    { key: 'address', label: 'Address', required: true, type: 'textarea' },
  ],
  'Building Approval': [
    { key: 'applicantName', label: 'Applicant Name', required: true, type: 'text' },
    { key: 'buildingType', label: 'Building Type', required: true, type: 'text' },
    { key: 'plotNumber', label: 'Plot Number', required: true, type: 'text' },
    { key: 'streetArea', label: 'Street / Area', required: true, type: 'text' },
    { key: 'taluk', label: 'Taluk', required: true, type: 'text' },
    { key: 'district', label: 'District', required: true, type: 'text' },
    { key: 'landArea', label: 'Land Area', required: true, type: 'text' },
    { key: 'buildingArea', label: 'Building Area', required: true, type: 'text' },
  ],
  'Business License': [
    { key: 'businessName', label: 'Business Name', required: true, type: 'text' },
    { key: 'ownerName', label: 'Owner Name', required: true, type: 'text' },
    { key: 'businessType', label: 'Business Type', required: true, type: 'text' },
    { key: 'registrationNumber', label: 'Registration Number', required: false, type: 'text' },
    { key: 'shopAddress', label: 'Shop / Office Address', required: true, type: 'textarea' },
    { key: 'contactNumber', label: 'Contact Number', required: true, type: 'text' },
  ],
  'New Water Connection': [
    { key: 'applicantName', label: 'Applicant Name', required: true, type: 'text' },
    { key: 'parentName', label: 'Father / Mother Name', required: true, type: 'text' },
    { key: 'houseNumber', label: 'House Number', required: true, type: 'text' },
    { key: 'streetArea', label: 'Street / Area', required: true, type: 'text' },
    { key: 'taluk', label: 'Taluk', required: true, type: 'text' },
    { key: 'district', label: 'District', required: true, type: 'text' },
    { key: 'existingWaterSource', label: 'Existing Water Source', required: false, type: 'text' },
    { key: 'contactNumber', label: 'Contact Number', required: true, type: 'text' },
  ],
  'Electricity Connection': [
    { key: 'applicantName', label: 'Applicant Name', required: true, type: 'text' },
    { key: 'parentName', label: 'Father / Mother Name', required: true, type: 'text' },
    { key: 'houseNumber', label: 'House Number', required: true, type: 'text' },
    { key: 'streetArea', label: 'Street / Area', required: true, type: 'text' },
    { key: 'taluk', label: 'Taluk', required: true, type: 'text' },
    { key: 'district', label: 'District', required: true, type: 'text' },
    { key: 'buildingType', label: 'Building Type', required: true, type: 'text' },
    { key: 'contactNumber', label: 'Contact Number', required: true, type: 'text' },
  ],
};

export default function SubmitDocument() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [configData, setConfigData] = useState(null);
  const [requestType, setRequestType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [documentData, setDocumentData] = useState({});
  const [documentNeedText, setDocumentNeedText] = useState('');
  const [predictingType, setPredictingType] = useState(false);
  const [predictionNote, setPredictionNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    config
      .get()
      .then(({ data }) => setConfigData(data))
      .catch(() => setConfigData({ documentTypes: [] }));
  }, []);

  const types = configData?.documentTypes || Object.keys(DOCUMENT_FIELDS);
  const selectedFields = DOCUMENT_FIELDS[requestType] || [];

  useEffect(() => {
    const nextData = {};
    selectedFields.forEach((field) => {
      nextData[field.key] = documentData[field.key] || '';
    });

    if (documentData.purpose) {
      nextData.purpose = documentData.purpose;
    }

    setDocumentData(nextData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestType]);

  const translateDocumentType = (type) => {
    const map = {
      'Birth Certificate': t('documentTypes.birthCertificate'),
      'Land Ownership Certificate': t('documentTypes.landOwnershipCertificate'),
      'Income Certificate': t('documentTypes.incomeCertificate'),
      'Building Approval': t('documentTypes.buildingApproval'),
      'Business License': t('documentTypes.businessLicense'),
      'New Water Connection': t('documentTypes.newWaterConnection'),
      'Electricity Connection': t('documentTypes.electricityConnection'),
    };

    return map[type] || type;
  };

  const translateFieldLabel = (label) => {
    const map = {
      'Child Name': t('submitDocument.fields.childName', 'Child Name'),
      'Parent Name': t('submitDocument.fields.parentName', 'Parent Name'),
      'Date of Birth': t('submitDocument.fields.dateOfBirth', 'Date of Birth'),
      'Gender': t('submitDocument.fields.gender', 'Gender'),
      'Hospital Name': t('submitDocument.fields.hospitalName', 'Hospital Name'),
      'Place of Birth': t('submitDocument.fields.placeOfBirth', 'Place of Birth'),
      'Address': t('submitDocument.fields.address', 'Address'),
      'Owner Name': t('submitDocument.fields.ownerName', 'Owner Name'),
      'Father / Mother Name': t('submitDocument.fields.fatherMotherName', 'Father / Mother Name'),
      'Survey Number': t('submitDocument.fields.surveyNumber', 'Survey Number'),
      'Land Location': t('submitDocument.fields.landLocation', 'Land Location'),
      'Taluk': t('submitDocument.fields.taluk', 'Taluk'),
      'District': t('submitDocument.fields.district', 'District'),
      'Area Size': t('submitDocument.fields.areaSize', 'Area Size'),
      'Patta Number': t('submitDocument.fields.pattaNumber', 'Patta Number'),
      'Applicant Name': t('submitDocument.fields.applicantName', 'Applicant Name'),
      'Annual Income': t('submitDocument.fields.annualIncome', 'Annual Income'),
      'Occupation': t('submitDocument.fields.occupation', 'Occupation'),
      'Family Members Count': t('submitDocument.fields.familyMembersCount', 'Family Members Count'),
      'Building Type': t('submitDocument.fields.buildingType', 'Building Type'),
      'Plot Number': t('submitDocument.fields.plotNumber', 'Plot Number'),
      'Street / Area': t('submitDocument.fields.streetArea', 'Street / Area'),
      'Land Area': t('submitDocument.fields.landArea', 'Land Area'),
      'Building Area': t('submitDocument.fields.buildingArea', 'Building Area'),
      'Business Name': t('submitDocument.fields.businessName', 'Business Name'),
      'Business Type': t('submitDocument.fields.businessType', 'Business Type'),
      'Registration Number': t('submitDocument.fields.registrationNumber', 'Registration Number'),
      'Shop / Office Address': t('submitDocument.fields.shopAddress', 'Shop / Office Address'),
      'Contact Number': t('submitDocument.fields.contactNumber', 'Contact Number'),
      'House Number': t('submitDocument.fields.houseNumber', 'House Number'),
      'Existing Water Source': t('submitDocument.fields.existingWaterSource', 'Existing Water Source'),
    };

    return map[label] || label;
  };

  const handleFieldChange = (key, value) => {
    setDocumentData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const predictDocumentType = async (text) => {
    const value = String(text || '').trim();

    if (!value) {
      setPredictionNote('');
      return;
    }

    try {
      setPredictingType(true);
      setPredictionNote('');

      const response = await requests.predictDocumentType({ text: value });
      const predictedType = response?.data?.predictedType || '';

      if (predictedType) {
        setRequestType(predictedType);
        setDocumentData((prev) => ({
          ...prev,
          purpose: value,
        }));
        setPredictionNote(`AI matched document type as: ${predictedType}`);
      } else {
        setPredictionNote('AI could not identify a document type. Please select manually.');
      }
    } catch (err) {
      setPredictionNote('AI prediction unavailable. Please select document type manually.');
    } finally {
      setPredictingType(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalDocumentData = {
        ...documentData,
        purpose: documentNeedText || documentData.purpose || '',
      };

      const { data } = await requests.createDocument({
        requestType,
        documentData: finalDocumentData,
        priority,
      });
      navigate(`/request/${data._id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <h1 className="text-3xl font-extrabold mb-6 tracking-wide">
        <span style={{ color: '#F39C12', textShadow: '0 0 10px #F39C12' }}>
          {t('submitDocument.headingApply')}
        </span>{' '}
        <span style={{ color: '#1FA463', textShadow: '0 0 10px #1FA463' }}>
          {t('submitDocument.headingFor')}
        </span>{' '}
        <span style={{ color: '#1D67B1', textShadow: '0 0 10px #1D67B1' }}>
          {t('submitDocument.headingDocument')}
        </span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* GREEN BOX */}
        <div className="border-2 border-[#1FA463] rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#1FA463] px-4 py-3 text-white font-semibold">
            {t('submitDocument.documentSelection')}
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-black">
                Describe Required Document for AI Suggestion
              </label>

              <input
                type="text"
                value={documentNeedText}
                onChange={(e) => setDocumentNeedText(e.target.value)}
                onBlur={() => predictDocumentType(documentNeedText)}
                className="w-full border border-[#1FA463] px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1FA463]/20"
                placeholder="Example: I need birth certificate"
              />

              <div className="mt-2 text-sm text-[#24384D]">
                {predictingType
                  ? 'AI is identifying document type...'
                  : predictionNote}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-black">
                {t('submitDocument.documentType')} *
              </label>

              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full border border-[#1FA463] px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1FA463]/20"
                required
              >
                <option value="">{t('submitDocument.selectDocument')}</option>
                {types.map((tp) => (
                  <option key={tp} value={tp}>
                    {translateDocumentType(tp)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DARK BLUE BOX */}
        <div className="border-2 border-[#1D4F88] rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#1D4F88] px-4 py-3 text-white font-semibold">
            {t('submitDocument.applicationPriority')}
          </div>

          <div className="p-4">
            <label className="block text-sm font-semibold mb-2 text-black">
              {t('submitDocument.priority')}
            </label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-[#1D4F88] px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#1D4F88]/20"
            >
              <option value="low">{t('priority.low')}</option>
              <option value="medium">{t('priority.medium')}</option>
              <option value="high">{t('priority.high')}</option>
              <option value="urgent">{t('priority.urgent')}</option>
            </select>
          </div>
        </div>

        {/* ORANGE DETAILS BOX */}
        {requestType && selectedFields.length > 0 && (
          <div className="border-2 border-[#F39C12] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#F39C12] px-4 py-3 text-white font-semibold">
              {t('submitDocument.documentDetails', 'Document Details')}
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedFields.map((field) => (
                <div
                  key={field.key}
                  className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                >
                  <label className="block text-sm font-semibold mb-2 text-black">
                    {translateFieldLabel(field.label)} {field.required ? '*' : ''}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      value={documentData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="w-full border border-[#F39C12] px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#F39C12]/20"
                      rows={4}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={documentData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="w-full border border-[#F39C12] px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#F39C12]/20"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('submitDocument.submitting') : t('submitDocument.submitButton')}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
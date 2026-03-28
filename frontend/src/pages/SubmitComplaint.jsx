import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { config, requests } from '../api/api';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [configData, setConfigData] = useState(null);
  const [form, setForm] = useState({
    requestType: '',
    location: '',
    area: '',
    ward: '',
    exactAddress: '',
    landmark: '',
    description: '',
    priority: 'medium',
    contactNumber: '',
    preferredInspectionTime: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictingType, setPredictingType] = useState(false);
  const [predictionNote, setPredictionNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    config
      .get()
      .then(({ data }) => setConfigData(data))
      .catch(() => setConfigData({ complaintTypes: [] }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('requestType', form.requestType);
    fd.append('location', form.location);
    fd.append('area', form.area);
    fd.append('ward', form.ward);
    fd.append('exactAddress', form.exactAddress);
    fd.append('landmark', form.landmark);
    fd.append('description', form.description);
    fd.append('priority', form.priority);
    fd.append('contactNumber', form.contactNumber);
    fd.append('preferredInspectionTime', form.preferredInspectionTime);
    if (image) fd.append('image', image);

    try {
      const { data } = await requests.createComplaint(fd);
      navigate(`/request/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || t('submitComplaint.failed'));
    } finally {
      setLoading(false);
    }
  };

  const types = configData?.complaintTypes || [
    'Water leakage',
    'Road damage',
    'Pothole',
    'Street light issue',
    'Garbage not collected',
    'Drainage blockage',
    'Tree fallen on road',
  ];

  const translateComplaintType = (type) => {
    const map = {
      'Water leakage': t('complaintTypes.waterLeakage'),
      'Road damage': t('complaintTypes.roadDamage'),
      Pothole: t('complaintTypes.pothole'),
      'Street light issue': t('complaintTypes.streetLightIssue'),
      'Garbage not collected': t('complaintTypes.garbageNotCollected'),
      'Drainage blockage': t('complaintTypes.drainageBlockage'),
      'Tree fallen on road': t('complaintTypes.treeFallenOnRoad'),
    };

    return map[type] || type;
  };

  const predictComplaintType = async (text) => {
    const value = String(text || '').trim();

    if (!value) {
      setPredictionNote('');
      return;
    }

    try {
      setPredictingType(true);
      setPredictionNote('');

      const response = await requests.predictComplaintType({ text: value });
      const predictedType = response?.data?.predictedType || '';

      if (predictedType) {
        setForm((prev) => ({
          ...prev,
          requestType: predictedType,
        }));
        setPredictionNote(`AI matched complaint type as: ${predictedType}`);
      } else {
        setPredictionNote('AI could not identify a complaint type. Please select manually.');
      }
    } catch (err) {
      setPredictionNote('AI prediction unavailable. Please select complaint type manually.');
    } finally {
      setPredictingType(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-2">
      <h1 className="text-3xl font-extrabold mb-6 tracking-wide">
        <span
          className="text-[#F39C12]"
          style={{ textShadow: '0 0 8px rgba(243, 156, 18, 0.45)' }}
        >
          {t('submitComplaint.headingSubmit')}
        </span>{' '}
        <span
          className="text-[#1FA463]"
          style={{ textShadow: '0 0 8px rgba(31, 164, 99, 0.45)' }}
        >
          {t('submitComplaint.headingA')}
        </span>{' '}
        <span
          className="text-[#1D67B1]"
          style={{ textShadow: '0 0 8px rgba(29, 103, 177, 0.45)' }}
        >
          {t('submitComplaint.headingComplaint')}
        </span>
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#D7DEE6] rounded-2xl shadow-sm p-6 space-y-5"
      >
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="border-2 border-[#F39C12] rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-[#F39C12] px-4 py-2 text-white font-semibold">
            {t('submitComplaint.complaintTypeSection')}
          </div>
          <div className="p-4">
            <label className="block text-sm font-semibold text-[#24384D] mb-2">
              {t('submitComplaint.complaintType')} *
            </label>
            <select
              value={form.requestType}
              onChange={(e) => setForm((f) => ({ ...f, requestType: e.target.value }))}
              className="w-full border border-[#F39C12] rounded-lg px-4 py-3 text-lg font-semibold text-[#24384D] bg-white outline-none"
              required
            >
              <option value="">{t('submitComplaint.selectType')}</option>
              {types.map((tpe) => (
                <option key={tpe} value={tpe}>
                  {translateComplaintType(tpe)}
                </option>
              ))}
            </select>

            {(predictingType || predictionNote) && (
              <div className="mt-2 text-sm text-[#24384D]">
                {predictingType
                  ? 'AI is identifying complaint type...'
                  : predictionNote}
              </div>
            )}
          </div>
        </div>

        <div className="border-2 border-[#1FA463] rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-[#1FA463] px-4 py-2 text-white font-semibold">
            {t('submitComplaint.locationDetails')}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                {t('submitComplaint.locationArea')} *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full border border-[#1FA463] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#1FA463]/20 focus:border-[#187B4B]"
                placeholder={t('submitComplaint.locationPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                Area *
              </label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                className="w-full border border-[#1FA463] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#1FA463]/20 focus:border-[#187B4B]"
                placeholder="Enter area"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                Ward *
              </label>
              <input
                type="text"
                value={form.ward}
                onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
                className="w-full border border-[#1FA463] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#1FA463]/20 focus:border-[#187B4B]"
                placeholder="Enter ward"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                {t('submitComplaint.exactAddress')} *
              </label>
              <input
                type="text"
                value={form.exactAddress}
                onChange={(e) => setForm((f) => ({ ...f, exactAddress: e.target.value }))}
                className="w-full border border-[#1FA463] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#1FA463]/20 focus:border-[#187B4B]"
                placeholder={t('submitComplaint.exactAddressPlaceholder')}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                {t('submitComplaint.nearestLandmark')} *
              </label>
              <input
                type="text"
                value={form.landmark}
                onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                className="w-full border border-[#1FA463] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#1FA463]/20 focus:border-[#187B4B]"
                placeholder={t('submitComplaint.landmarkPlaceholder')}
                required
              />
            </div>
          </div>
        </div>

        <div className="border-2 border-[#1D67B1] rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-[#1D67B1] px-4 py-2 text-white font-semibold">
            {t('submitComplaint.complaintDescription')}
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                {t('submitComplaint.description')} *
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                onBlur={() => predictComplaintType(form.description)}
                className="w-full border border-[#1D67B1] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#1D67B1]/20 focus:border-[#15528E]"
                rows={5}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                {t('submitComplaint.priority')}
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full border border-[#1D67B1] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#1D67B1]/20 focus:border-[#15528E]"
              >
                <option value="low">{t('priority.low')}</option>
                <option value="medium">{t('priority.medium')}</option>
                <option value="high">{t('priority.high')}</option>
                <option value="urgent">{t('priority.urgent')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                {t('submitComplaint.imageOptional')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0])}
                className="w-full border border-[#1D67B1] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#1D67B1]/20 focus:border-[#15528E]"
              />
            </div>
          </div>
        </div>

        <div className="border-2 border-[#8E44AD] rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-[#8E44AD] px-4 py-2 text-white font-semibold">
            {t('submitComplaint.contactSection')}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                {t('submitComplaint.citizenContactNumber')} *
              </label>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
                className="w-full border border-[#8E44AD] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#8E44AD]/20 focus:border-[#74358F]"
                placeholder={t('submitComplaint.contactNumberPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#24384D] mb-2">
                {t('submitComplaint.preferredInspectionTime')}
              </label>
              <select
                value={form.preferredInspectionTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, preferredInspectionTime: e.target.value }))
                }
                className="w-full border border-[#8E44AD] rounded-lg px-4 py-3 text-[#24384D] bg-white outline-none focus:ring-2 focus:ring-[#8E44AD]/20 focus:border-[#74358F]"
              >
                <option value="">{t('submitComplaint.selectPreferredInspectionTime')}</option>
                <option value="Morning">{t('submitComplaint.morning')}</option>
                <option value="Afternoon">{t('submitComplaint.afternoon')}</option>
                <option value="Evening">{t('submitComplaint.evening')}</option>
                <option value="Anytime">{t('submitComplaint.anytime')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('submitComplaint.submitting') : t('submitComplaint.submitButton')}
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
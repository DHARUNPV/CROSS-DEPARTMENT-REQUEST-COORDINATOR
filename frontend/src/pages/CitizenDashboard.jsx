import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { requests, certificates } from '../api/api';

import emblem from '../assets/emblem.png';
import bannerMain from '../assets/portal-banner-main.jpg';
import electricityImg from '../assets/portal-electricity.jpg';
import agricultureImg from '../assets/portal-agriculture.jpg';
import irrigationImg from '../assets/portal-irrigation.jpg';

export default function CitizenDashboard() {
  const { t, i18n } = useTranslation();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const resultsRef = useRef(null);

  const searchItems = [
    { label: 'Birth Certificate', category: 'document' },
    { label: 'Land Ownership Certificate', category: 'document' },
    { label: 'Income Certificate', category: 'document' },
    { label: 'Building Approval', category: 'document' },
    { label: 'Business License', category: 'document' },
    { label: 'New Water Connection', category: 'document' },
    { label: 'Electricity Connection', category: 'document' },
    { label: 'Water leakage', category: 'complaint' },
    { label: 'Road damage', category: 'complaint' },
    { label: 'Pothole', category: 'complaint' },
    { label: 'Street light issue', category: 'complaint' },
    { label: 'Garbage not collected', category: 'complaint' },
    { label: 'Drainage blockage', category: 'complaint' },
    { label: 'Tree fallen on road', category: 'complaint' },
  ];

  const filteredSuggestions =
    search.trim() === ''
      ? []
      : searchItems.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        );

  useEffect(() => {
    setLoading(true);
    requests.my({ ...filter, search: search || undefined })
      .then(({ data }) => {
        setList(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter.category, filter.status, search]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this complaint?'
    );

    if (!confirmDelete) return;

    try {
      await requests.deleteRequest(id);
      setList((prev) => prev.filter((item) => item._id !== id));
      alert('Complaint deleted successfully');
    } catch (error) {
      alert('Failed to delete complaint');
    }
  };

  const isDocumentDownloadReady = (req) =>
    req?.requestCategory === 'document' &&
    (
      req?.currentStage === 'Available for Download' ||
      req?.status === 'Available for Download'
    );

  const totalRequests = list.length;
  const complaintsCount = list.filter((req) => req.requestCategory === 'complaint').length;
  const documentsCount = list.filter((req) => req.requestCategory === 'document').length;
  const downloadReadyCount = list.filter((req) => isDocumentDownloadReady(req)).length;

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const applySuggestion = (item) => {
    setSearch(item.label);
    setFilter((f) => ({ ...f, category: item.category }));
    setShowSuggestions(false);
    scrollToResults();
  };

  const handleSearchSubmit = () => {
    const typedValue = search.trim();

    const matchedItem = searchItems.find(
      (item) => item.label.toLowerCase() === typedValue.toLowerCase()
    );

    setSearch(typedValue);

    if (matchedItem) {
      setFilter((f) => ({ ...f, category: matchedItem.category }));
    } else {
      setFilter((f) => ({ ...f, category: '' }));
    }

    setShowSuggestions(false);
    scrollToResults();
  };

  const statCards = [
    {
      label: t('dashboard.stats.totalRequests'),
      value: totalRequests,
      boxClass: 'border-2 border-[#D94A38] bg-white shadow-sm',
      headClass: 'bg-[#D94A38] text-white',
      valueClass: 'text-[#B33426]',
    },
    {
      label: t('dashboard.stats.complaints'),
      value: complaintsCount,
      boxClass: 'border-2 border-[#F39C12] bg-white shadow-sm',
      headClass: 'bg-[#F39C12] text-white',
      valueClass: 'text-[#C97A0A]',
    },
    {
      label: t('dashboard.stats.documents'),
      value: documentsCount,
      boxClass: 'border-2 border-[#1FA463] bg-white shadow-sm',
      headClass: 'bg-[#1FA463] text-white',
      valueClass: 'text-[#187B4B]',
    },
    {
      label: t('dashboard.stats.downloadReady'),
      value: downloadReadyCount,
      boxClass: 'border-2 border-[#8E44AD] bg-white shadow-sm',
      headClass: 'bg-[#8E44AD] text-white',
      valueClass: 'text-[#6F2F8E]',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F2F2F2] text-[#222] overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-center bg-cover bg-no-repeat opacity-[0.14] blur-[10px] scale-110"
        style={{ backgroundImage: `url(${bannerMain})` }}
      />
      <div className="absolute inset-0 z-0 bg-white/82" />

      <div className="relative z-10">
        <div className="bg-black text-white text-[11px]">
          <div className="max-w-[1280px] mx-auto px-4 py-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-white/20">f</span>
              <span className="w-5 h-5 flex items-center justify-center bg-white/20">t</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{t('topbar.signIn')}</span>
              <span>{t('topbar.register')}</span>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-black text-white border border-white/20 px-2 py-1 text-[11px] outline-none"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#ECECEC] border-b border-[#BCC7D3]">
          <div className="max-w-[1280px] mx-auto px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={emblem} alt="Emblem" className="h-20 w-auto" />
              <div>
                <h1 className="text-[#1E68B2] text-4xl font-bold leading-none">
                  {t('header.portalTitle')}
                </h1>
                <p className="text-[#4F78A8] text-lg mt-2">{t('header.portalSubtitle')}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-5 text-center text-xs text-[#5B6B7C]">
              {[
                t('header.topics'),
                t('header.services'),
                t('header.government'),
                t('header.groups'),
                t('header.aboutIndia'),
              ].map((item) => (
                <button key={item} type="button" className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-[#DCDCDC] flex items-center justify-center hover:bg-[#d4d4d4] transition">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#7A8898]" fill="none">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1F78D1] border-t border-b border-[#135DA4]">
          <div className="max-w-[1280px] mx-auto px-4 py-3">
            <div className="relative flex flex-1">
              <input
                type="text"
                placeholder={t('dashboard.searchBarPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (search.trim()) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                className="flex-1 h-11 px-4 text-sm text-[#24384D] border-none outline-none"
              />

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="bg-[#F0A11A] text-white px-5 text-sm font-semibold"
              >
                {t('common.search')}
              </button>

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-[98px] top-full z-20 bg-white border border-[#BCC7D3] shadow-md max-h-60 overflow-y-auto">
                  {filteredSuggestions.slice(0, 8).map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onMouseDown={() => applySuggestion(item)}
                      className="block w-full text-left px-4 py-2 text-sm text-[#24384D] hover:bg-[#F3F7FB]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 pt-4">
          <div className="border border-[#BCC7D3] bg-white shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] min-h-[280px]">
              <div className="relative">
                <img
                  src={bannerMain}
                  alt="Banner"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0C3B66]/30 to-transparent" />
                <div className="absolute bottom-6 left-6 bg-white/92 px-5 py-4 max-w-[420px] border border-[#D7DEE6] shadow-sm">
                  <h2 className="text-[#7A2D10] text-2xl font-bold leading-snug">
                    {t('dashboard.bannerTitle')}
                  </h2>
                  <p className="mt-2 text-sm text-[#34485E]">
                    {t('dashboard.bannerDescription')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3">
                {[electricityImg, agricultureImg, irrigationImg].map((img, i) => (
                  <div
                    key={i}
                    className="relative border-l border-white/30 min-h-[140px] sm:min-h-full"
                  >
                    <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              t('dashboard.sections.featuredServices'),
              t('dashboard.sections.requestedInfo'),
              t('dashboard.sections.activities'),
            ].map((title) => (
              <div key={title}>
                <div className="border-b border-[#BCC7D3] pb-2">
                  <h3 className="text-[#1F2F46] text-2xl font-serif font-semibold">{title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <div className="bg-white border-2 border-[#2A6EBB] shadow-sm">
            <div className="bg-[#EAF3FF] border-b border-[#2A6EBB] px-4 py-3 font-semibold text-[#173A5E]">
              {t('dashboard.citizenServices')}
            </div>
            <div className="divide-y divide-[#D7DEE6]">
              <Link
                to="/complaint"
                className="block px-4 py-3 text-[#24384D] hover:bg-[#F3F7FB] hover:text-[#0F4C81] transition"
              >
                {t('dashboard.links.submitComplaint')}
              </Link>

              <Link
                to="/document"
                className="block px-4 py-3 text-[#24384D] hover:bg-[#F3F7FB] hover:text-[#0F4C81] transition"
              >
                {t('dashboard.links.applyDocument')}
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white border-2 border-[#2A6EBB] shadow-sm">
              <div className="bg-[#2A6EBB] px-4 py-3 font-semibold text-white">
                {t('dashboard.searchFilterTitle')}
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder={t('dashboard.requestSearchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-[#2A6EBB] bg-white px-3 py-2 text-sm text-[#24384D] outline-none focus:border-[#1D4F88] focus:ring-2 focus:ring-[#2A6EBB]/15"
                />
                <select
                  value={filter.category}
                  onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
                  className="border border-[#2A6EBB] bg-white px-3 py-2 text-sm text-[#24384D] outline-none focus:border-[#1D4F88] focus:ring-2 focus:ring-[#2A6EBB]/15"
                >
                  <option value="">{t('dashboard.filters.allTypes')}</option>
                  <option value="complaint">{t('dashboard.filters.complaint')}</option>
                  <option value="document">{t('dashboard.filters.document')}</option>
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
                  className="border border-[#2A6EBB] bg-white px-3 py-2 text-sm text-[#24384D] outline-none focus:border-[#1D4F88] focus:ring-2 focus:ring-[#2A6EBB]/15"
                >
                  <option value="">{t('dashboard.filters.allStatus')}</option>
                  <option value="Submitted">{t('status.submitted')}</option>
                  <option value="Pending">{t('status.pending')}</option>
                  <option value="In Progress">{t('status.inProgress')}</option>
                  <option value="Under Review">{t('status.underReview')}</option>
                  <option value="Approved">{t('status.approved')}</option>
                  <option value="Rejected">{t('status.rejected')}</option>
                  <option value="Resolved">{t('status.resolved')}</option>
                  <option value="Certificate Generated">{t('status.certificateGenerated')}</option>
                  <option value="Available for Download">{t('status.availableForDownload')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className={`${card.boxClass} overflow-hidden`}
                >
                  <div className={`px-4 py-2 text-sm font-semibold ${card.headClass}`}>
                    {card.label}
                  </div>
                  <div className="p-5 text-center">
                    <div className={`text-4xl font-bold ${card.valueClass}`}>{card.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div ref={resultsRef} className="bg-white border-2 border-[#8E44AD] shadow-sm">
              <div className="bg-[#8E44AD] px-4 py-3 font-semibold text-white">
                {t('dashboard.myRequests')}
              </div>

              {loading ? (
                <div className="p-6 text-center text-[#4A5B6D]">{t('common.loadingRecords')}</div>
              ) : list.length === 0 ? (
                <div className="p-6 text-[#4A5B6D]">
                  {search ? (
                    filter.category === 'document' ? (
                      <span>{t('dashboard.noDocumentApplied', { search })}</span>
                    ) : filter.category === 'complaint' ? (
                      <span>{t('dashboard.noComplaintSubmitted', { search })}</span>
                    ) : (
                      <span>{t('dashboard.noMatchingRequest', { search })}</span>
                    )
                  ) : (
                    <span>{t('dashboard.noRequestsFound')}</span>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white">
                        <th className="px-4 py-3 bg-[#2A6EBB] text-left">{t('table.requestId')}</th>
                        <th className="px-4 py-3 bg-[#D94A38] text-left">{t('table.type')}</th>
                        <th className="px-4 py-3 bg-[#1FA463] text-left">{t('table.category')}</th>
                        <th className="px-4 py-3 bg-[#F39C12] text-left">{t('table.status')}</th>
                        <th className="px-4 py-3 bg-[#46627F] text-left">{t('table.date')}</th>
                        <th className="px-4 py-3 bg-[#8E44AD] text-left">{t('table.action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((req) => (
                        <tr key={req._id} className="border-b border-[#D7DEE6] hover:bg-[#F7FAFD]">
                          <td className="px-4 py-3 text-[#1D67B1] font-bold">
                            {req.requestId}
                          </td>
                          <td className="px-4 py-3 text-black font-bold">{req.requestType}</td>
                          <td className="px-4 py-3 text-black font-bold capitalize">
                            {req.requestCategory}
                          </td>
                          <td className="px-4 py-3 text-black font-bold">
                            {req.currentStage || req.status}
                          </td>
                          <td className="px-4 py-3 text-black font-bold">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {req.requestCategory === 'document' &&
                            isDocumentDownloadReady(req) ? (
                              <button
                                type="button"
                                onClick={() =>
                                  certificates
                                    .download(req._id)
                                    .catch(() => {
                                      alert('Failed to download certificate');
                                    })
                                }
                                className="bg-[#1D67B1] hover:bg-[#15528E] text-white px-3 py-1 text-xs font-semibold rounded-sm transition"
                              >
                                {t('common.download')}
                              </button>
                            ) : req.requestCategory === 'complaint' ? (
                              <div className="flex items-center gap-3">
                                <Link
                                  to={`/request/${req._id}`}
                                  className="text-[#1D67B1] font-bold hover:underline"
                                >
                                  {t('common.view')}
                                </Link>

                                {(req.status === 'Submitted' || req.status === 'Pending') && (
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(req._id)}
                                    className="text-[#D94A38] font-bold hover:underline"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            ) : (
                              <Link
                                to={`/request/${req._id}`}
                                className="text-[#1D67B1] font-bold hover:underline"
                              >
                                {t('common.view')}
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
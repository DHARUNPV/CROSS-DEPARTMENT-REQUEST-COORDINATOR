import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requests, config, auth } from '../api/api';
import { useAuth } from '../context/AuthContext';
import emblem from '../assets/emblem.png';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState({ complaint: [], document: [] });
  const [updating, setUpdating] = useState(null);
  const [members, setMembers] = useState([]);
  const [taskRemarks, setTaskRemarks] = useState({});
  const [selectedView, setSelectedView] = useState('allActive');

  const [selectedAnalyticsView, setSelectedAnalyticsView] = useState(null);
  const [complaintAnalytics, setComplaintAnalytics] = useState({
    totalComplaints: 0,
    topComplaintType: null,
    breakdown: [],
  });
  const [documentAnalytics, setDocumentAnalytics] = useState({
    totalDocuments: 0,
    topDocumentType: null,
    breakdown: [],
  });

  const [selectedStageByTask, setSelectedStageByTask] = useState({});
  const [selectedStatusByTask, setSelectedStatusByTask] = useState({});

  useEffect(() => {
    config.get()
      .then(({ data }) => {
        setStages({
          complaint: data.complaintStages || [],
          document: data.documentStages || [],
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    auth.officerDepartmentMembers()
      .then(({ data }) => setMembers(data.members || []))
      .catch(() => setMembers([]));
  }, []);

  useEffect(() => {
    requests.departmentTasks()
      .then(({ data }) => {
        setTasks(data);

        const initialRemarks = {};
        const initialSelectedStages = {};
        const initialSelectedStatuses = {};

        data.forEach(({ task, request }) => {
          if (task?._id) {
            initialRemarks[task._id] = task.remarks || task.inspectionNotes || '';
            initialSelectedStages[task._id] = request?.currentStage || request?.status || task.stage || '';
            initialSelectedStatuses[task._id] = task.status || 'pending';
          }
        });

        setTaskRemarks(initialRemarks);
        setSelectedStageByTask(initialSelectedStages);
        setSelectedStatusByTask(initialSelectedStatuses);
      })
      .catch(() => {
        setTasks([]);
        setTaskRemarks({});
        setSelectedStageByTask({});
        setSelectedStatusByTask({});
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    requests.complaintAnalytics()
      .then(({ data }) => {
        setComplaintAnalytics({
          totalComplaints: data.totalComplaints || 0,
          topComplaintType: data.topComplaintType || null,
          breakdown: Array.isArray(data.breakdown) ? data.breakdown : [],
        });
      })
      .catch(() => {
        setComplaintAnalytics({
          totalComplaints: 0,
          topComplaintType: null,
          breakdown: [],
        });
      });

    requests.documentAnalytics()
      .then(({ data }) => {
        setDocumentAnalytics({
          totalDocuments: data.totalDocuments || 0,
          topDocumentType: data.topDocumentType || null,
          breakdown: Array.isArray(data.breakdown) ? data.breakdown : [],
        });
      })
      .catch(() => {
        setDocumentAnalytics({
          totalDocuments: 0,
          topDocumentType: null,
          breakdown: [],
        });
      });
  }, []);

  const syncTasks = async () => {
    const { data } = await requests.departmentTasks();
    setTasks(data);

    const updatedRemarks = {};
    const updatedSelectedStages = {};
    const updatedSelectedStatuses = {};

    data.forEach(({ task, request }) => {
      if (task?._id) {
        updatedRemarks[task._id] = task.remarks || task.inspectionNotes || '';
        updatedSelectedStages[task._id] = request?.currentStage || request?.status || task.stage || '';
        updatedSelectedStatuses[task._id] = task.status || 'pending';
      }
    });

    setTaskRemarks(updatedRemarks);
    setSelectedStageByTask(updatedSelectedStages);
    setSelectedStatusByTask(updatedSelectedStatuses);
  };

  const updateTask = async (taskId, payload) => {
    setUpdating(taskId);
    try {
      await requests.updateTask(taskId, payload);
      await syncTasks();
    } catch (err) {
      alert(err?.response?.data?.message || 'Task update failed.');
    } finally {
      setUpdating(null);
    }
  };

  const archiveTask = async (taskId) => {
    setUpdating(taskId);
    try {
      await requests.archiveTask(taskId);
      await syncTasks();
    } catch (err) {
      alert(err?.response?.data?.message || 'Archive failed.');
    } finally {
      setUpdating(null);
    }
  };

  const unarchiveTask = async (taskId) => {
    setUpdating(taskId);
    try {
      await requests.unarchiveTask(taskId);
      await syncTasks();
    } catch (err) {
      alert(err?.response?.data?.message || 'Unarchive failed.');
    } finally {
      setUpdating(null);
    }
  };

  const isCompletedComplaint = (request) =>
    request?.requestCategory === 'complaint' &&
    (
      request?.currentStage === 'Closed' ||
      request?.status === 'Closed'
    );

  const isCompletedDocument = (request) =>
    request?.requestCategory === 'document' &&
    (
      request?.currentStage === 'Available for Download' ||
      request?.status === 'Available for Download'
    );

  const isCompletedRequest = (request) =>
    isCompletedComplaint(request) || isCompletedDocument(request);

  const isArchivedTask = (task) => !!task?.archivedForOfficer;

  const getPriorityStyles = (priority) => {
    const value = String(priority || '').toLowerCase();

    if (value === 'low') {
      return 'bg-[#EAF8F0] text-[#1FA463] border border-[#1FA463]';
    }

    if (value === 'medium') {
      return 'bg-[#E8F5E9] text-[#166534] border border-[#166534]';
    }

    if (value === 'high') {
      return 'bg-[#FFF4E5] text-[#E67E22] border border-[#E67E22]';
    }

    if (value === 'urgent') {
      return 'bg-[#FDECEC] text-[#DC2626] border border-[#DC2626]';
    }

    return 'bg-slate-100 text-slate-700 border border-slate-300';
  };

  const getOfficerIdValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value._id || value.id || '';
    return '';
  };

  const normalizeText = (value) => String(value || '').trim().toLowerCase();

  const isTaskAssignedToLoggedInOfficer = (task) => {
    const taskOfficerId = getOfficerIdValue(task?.assignedOfficerId);
    const userOfficerId = getOfficerIdValue(user?.officerId);

    if (taskOfficerId && userOfficerId) {
      return String(taskOfficerId) === String(userOfficerId);
    }

    const taskOfficerName = normalizeText(task?.assignedOfficerName);
    const userName = normalizeText(user?.name);

    if (taskOfficerName && userName) {
      return taskOfficerName === userName;
    }

    return false;
  };

  const validTaskItems = tasks.filter(({ task, request }) => task && request);

  const myTaskItems = validTaskItems.filter(({ task }) =>
    isTaskAssignedToLoggedInOfficer(task)
  );

  const activeComplaintItems = myTaskItems.filter(
    ({ task, request }) =>
      request.requestCategory === 'complaint' &&
      !isCompletedRequest(request) &&
      !isArchivedTask(task)
  );

  const activeDocumentItems = myTaskItems.filter(
    ({ task, request }) =>
      request.requestCategory === 'document' &&
      !isCompletedRequest(request) &&
      !isArchivedTask(task)
  );

  const completedComplaintItems = myTaskItems
    .filter(({ request }) => isCompletedComplaint(request))
    .sort((a, b) => new Date(b.request.updatedAt) - new Date(a.request.updatedAt));

  const completedDocumentItems = myTaskItems
    .filter(({ request }) => isCompletedDocument(request))
    .sort((a, b) => new Date(b.request.updatedAt) - new Date(a.request.updatedAt));

  const visibleTasks = (() => {
    switch (selectedView) {
      case 'activeComplaints':
        return activeComplaintItems;
      case 'activeDocuments':
        return activeDocumentItems;
      case 'completedComplaints':
        return completedComplaintItems;
      case 'completedDocuments':
        return completedDocumentItems;
      case 'allActive':
      default:
        return [...activeComplaintItems, ...activeDocumentItems];
    }
  })();

  const visibleTitle = (() => {
    switch (selectedView) {
      case 'activeComplaints':
        return 'Active Complaints';
      case 'activeDocuments':
        return 'Active Documents';
      case 'completedComplaints':
        return 'Completed Complaints';
      case 'completedDocuments':
        return 'Completed Documents';
      case 'allActive':
      default:
        return 'Active Tasks';
    }
  })();

  const summaryCards = [
    {
      key: 'allActive',
      title: 'All Active',
      count: activeComplaintItems.length + activeDocumentItems.length,
      border: 'border-[#1E3A5F]',
      bg: 'bg-white',
      text: 'text-[#1E3A5F]',
      header: 'bg-[#1E3A5F]',
    },
    {
      key: 'activeComplaints',
      title: 'Active Complaints',
      count: activeComplaintItems.length,
      border: 'border-[#E67E22]',
      bg: 'bg-white',
      text: 'text-[#A84300]',
      header: 'bg-[#E67E22]',
    },
    {
      key: 'activeDocuments',
      title: 'Active Documents',
      count: activeDocumentItems.length,
      border: 'border-[#2563EB]',
      bg: 'bg-white',
      text: 'text-[#1D4ED8]',
      header: 'bg-[#2563EB]',
    },
    {
      key: 'completedComplaints',
      title: 'Completed Complaints',
      count: completedComplaintItems.length,
      border: 'border-[#27AE60]',
      bg: 'bg-white',
      text: 'text-[#187B4B]',
      header: 'bg-[#27AE60]',
    },
    {
      key: 'completedDocuments',
      title: 'Completed Documents',
      count: completedDocumentItems.length,
      border: 'border-[#8E44AD]',
      bg: 'bg-white',
      text: 'text-[#6F2F8E]',
      header: 'bg-[#8E44AD]',
    },
  ];

  const complaintTypeColors = {
    'Water leakage': '#2563EB',
    'Road damage': '#DC2626',
    'Pothole': '#F59E0B',
    'Street light issue': '#7C3AED',
    'Garbage not collected': '#16A34A',
    'Drainage blockage': '#EA580C',
    'Tree fallen on road': '#0891B2',
  };

  const documentTypeColors = {
    'Birth Certificate': '#334155',
    'Land Ownership Certificate': '#8B5CF6',
    'Income Certificate': '#F59E0B',
    'Building Approval': '#0EA5E9',
    'Business License': '#EF4444',
    'New Water Connection': '#2563EB',
    'Electricity Connection': '#16A34A',
  };

  const fallbackColors = [
    '#2563EB',
    '#16A34A',
    '#DC2626',
    '#7C3AED',
    '#F59E0B',
    '#0891B2',
    '#EA580C',
    '#DB2777',
    '#475569',
    '#10B981',
  ];

  const getComplaintColor = (type, index = 0) =>
    complaintTypeColors[type] || fallbackColors[index % fallbackColors.length];

  const getDocumentColor = (type, index = 0) =>
    documentTypeColors[type] || fallbackColors[index % fallbackColors.length];

  const complaintChartData = complaintAnalytics.breakdown.map((item, index) => ({
    name: item.type,
    count: item.count,
    percentage: item.percentage,
    fill: getComplaintColor(item.type, index),
  }));

  const documentChartData = documentAnalytics.breakdown.map((item, index) => ({
    name: item.type,
    count: item.count,
    percentage: item.percentage,
    fill: getDocumentColor(item.type, index),
  }));

  const toggleAnalyticsView = (view) => {
    setSelectedAnalyticsView((prev) => (prev === view ? null : view));
  };

  const getCurrentStageIndex = (stageList, currentStageValue) => {
    const idx = stageList.indexOf(currentStageValue);
    return idx >= 0 ? idx : 0;
  };

  const getAllowedNextStages = (stageList, currentStageValue) => {
    const currentIndex = getCurrentStageIndex(stageList, currentStageValue);
    return stageList.filter((_, index) => index === currentIndex || index === currentIndex + 1);
  };

  const moveToNextStage = async (task, request, stageList, nextStageValue) => {
    const currentStageValue = request.currentStage || request.status || task.stage || '';
    const nextStage = nextStageValue || selectedStageByTask[task._id] || currentStageValue;
    const selectedStatus = selectedStatusByTask[task._id] || task.status || 'pending';
    const remarks = taskRemarks[task._id] ?? '';
  
    const currentIndex = getCurrentStageIndex(stageList, currentStageValue);
    const nextIndex = stageList.indexOf(nextStage);
  
    if (nextIndex === -1) {
      alert('Invalid stage selected.');
      return;
    }
  
    if (!(nextIndex === currentIndex || nextIndex === currentIndex + 1)) {
      alert('Stage must move one by one only.');
      return;
    }
  
    if (nextStage === currentStageValue) {
      setSelectedStageByTask((prev) => ({
        ...prev,
        [task._id]: currentStageValue,
      }));
      return;
    }
  
    setUpdating(task._id);
    try {
      await requests.updateTask(task._id, {
        status: selectedStatus,
        remarks,
        inspectionNotes: remarks,
      });
  
      if (
        request.requestCategory === 'document' &&
        (nextStage === 'Certificate Generated' || nextStage === 'Available for Download')
      ) {
        await requests.generateCertificate(request._id);
      }
  
      await requests.updateStage(request._id, {
        stage: nextStage,
        note: remarks || `Stage moved to ${nextStage}`,
      });
  
      await syncTasks();
    } catch (err) {
      alert(err?.response?.data?.message || 'Stage update failed.');
      setSelectedStageByTask((prev) => ({
        ...prev,
        [task._id]: currentStageValue,
      }));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white rounded-2xl border-2 border-[#D9E2EC] shadow-sm p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-[#0B6B7A]/10 border border-[#0B6B7A]/20 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-[#0B6B7A]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2a10 10 0 1 0 10 10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-4 text-[#0B2A3B] font-semibold">Loading department tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      <div className="bg-white border-b-4 border-[#1E3A5F] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={emblem} alt="Emblem" className="h-16 w-auto" />
              <div>
                <h1 className="text-black text-3xl sm:text-4xl font-bold leading-tight">
                  Officer Processing Dashboard
                </h1>
                <p className="text-[#374151] text-sm sm:text-base mt-1">
                  Review, verify and update requests assigned to your department
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border-2 border-[#D1D9E6] rounded-xl px-4 py-3 text-sm text-[#1F2937]">
              <p><span className="font-semibold text-[#0F766E]">Status:</span> Active Officer Panel</p>
              <p className="mt-1"><span className="font-semibold">Department:</span> {user?.department || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => toggleAnalyticsView('complaints')}
              className={`rounded-2xl border-2 shadow-sm overflow-hidden transition hover:shadow-md ${
                selectedAnalyticsView === 'complaints'
                  ? 'border-[#E67E22] ring-2 ring-[#F6C28B]'
                  : 'border-[#E67E22]'
              }`}
            >
              <div className="bg-[#E67E22] px-5 py-3 text-left">
                <h2 className="text-white font-bold text-lg">Complaint Analytics</h2>
              </div>
              <div className="bg-white px-5 py-4 text-left">
                <p className="text-sm text-slate-500">Overall complaint insights</p>
                <p className="mt-2 text-3xl font-bold text-[#A84300]">
                  {complaintAnalytics.totalComplaints}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleAnalyticsView('documents')}
              className={`rounded-2xl border-2 shadow-sm overflow-hidden transition hover:shadow-md ${
                selectedAnalyticsView === 'documents'
                  ? 'border-[#27AE60] ring-2 ring-[#A7E6C1]'
                  : 'border-[#27AE60]'
              }`}
            >
              <div className="bg-[#27AE60] px-5 py-3 text-left">
                <h2 className="text-white font-bold text-lg">Document Analytics</h2>
              </div>
              <div className="bg-white px-5 py-4 text-left">
                <p className="text-sm text-slate-500">Overall document request insights</p>
                <p className="mt-2 text-3xl font-bold text-[#187B4B]">
                  {documentAnalytics.totalDocuments}
                </p>
              </div>
            </button>
          </div>

          {selectedAnalyticsView === 'complaints' && (
            <div className="bg-white rounded-2xl border-2 border-[#E67E22] shadow-sm overflow-hidden mb-6">
              <div className="px-5 py-4 bg-[#E67E22]">
                <h2 className="text-white font-bold text-lg">Complaint Analytics Overview</h2>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                  <div className="rounded-2xl border border-[#F5CBA7] bg-[#FFF8F1] p-4">
                    <p className="text-sm text-slate-500">Total Complaints</p>
                    <p className="mt-2 text-3xl font-bold text-[#A84300]">
                      {complaintAnalytics.totalComplaints}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#F5CBA7] bg-[#FFF8F1] p-4 lg:col-span-2">
                    <p className="text-sm text-slate-500">Most Reported Complaint Type</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B2A3B]">
                      {complaintAnalytics.topComplaintType || 'No complaint data available'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] p-4 bg-white mb-6">
                  <h3 className="text-lg font-bold text-[#0B2A3B] mb-4">
                    Complaint Type Bar Chart
                  </h3>
                  <div className="w-full h-[340px]">
                    {complaintChartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        No complaint analytics data available.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={complaintChartData} margin={{ top: 10, right: 20, left: 10, bottom: 65 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }}
                            axisLine={{ stroke: '#334155' }}
                            tickLine={{ stroke: '#334155' }}
                            interval={0}
                            angle={-10}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }}
                            axisLine={{ stroke: '#334155' }}
                            tickLine={{ stroke: '#334155' }}
                          />
                          <Tooltip />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {complaintChartData.map((entry, index) => (
                              <Cell key={`complaint-cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] p-4 bg-white">
                  <h3 className="text-lg font-bold text-[#0B2A3B] mb-4">
                    Complaint Percentage Breakdown
                  </h3>

                  {complaintAnalytics.breakdown.length === 0 ? (
                    <div className="text-slate-500 text-sm">
                      No complaint percentage data available.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {complaintAnalytics.breakdown.map((item, index) => {
                        const itemColor = getComplaintColor(item.type, index);
                        return (
                          <div key={item.type}>
                            <div className="flex items-center justify-between mb-1 gap-3">
                              <span
                                className="text-sm font-semibold"
                                style={{ color: itemColor }}
                              >
                                {item.type}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: itemColor }}
                              >
                                {item.count} ({item.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.percentage}%`, backgroundColor: itemColor }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedAnalyticsView === 'documents' && (
            <div className="bg-white rounded-2xl border-2 border-[#27AE60] shadow-sm overflow-hidden mb-6">
              <div className="px-5 py-4 bg-[#27AE60]">
                <h2 className="text-white font-bold text-lg">Document Analytics Overview</h2>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                  <div className="rounded-2xl border border-[#BFE8CF] bg-[#F4FFF8] p-4">
                    <p className="text-sm text-slate-500">Total Document Requests</p>
                    <p className="mt-2 text-3xl font-bold text-[#187B4B]">
                      {documentAnalytics.totalDocuments}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#BFE8CF] bg-[#F4FFF8] p-4 lg:col-span-2">
                    <p className="text-sm text-slate-500">Most Requested Document Type</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B2A3B]">
                      {documentAnalytics.topDocumentType || 'No document data available'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] p-4 bg-white mb-6">
                  <h3 className="text-lg font-bold text-[#0B2A3B] mb-4">
                    Document Type Bar Chart
                  </h3>
                  <div className="w-full h-[340px]">
                    {documentChartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        No document analytics data available.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={documentChartData} margin={{ top: 10, right: 20, left: 10, bottom: 65 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }}
                            axisLine={{ stroke: '#334155' }}
                            tickLine={{ stroke: '#334155' }}
                            interval={0}
                            angle={-10}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }}
                            axisLine={{ stroke: '#334155' }}
                            tickLine={{ stroke: '#334155' }}
                          />
                          <Tooltip />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {documentChartData.map((entry, index) => (
                              <Cell key={`document-cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] p-4 bg-white">
                  <h3 className="text-lg font-bold text-[#0B2A3B] mb-4">
                    Document Percentage Breakdown
                  </h3>

                  {documentAnalytics.breakdown.length === 0 ? (
                    <div className="text-slate-500 text-sm">
                      No document percentage data available.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {documentAnalytics.breakdown.map((item, index) => {
                        const itemColor = getDocumentColor(item.type, index);
                        return (
                          <div key={item.type}>
                            <div className="flex items-center justify-between mb-1 gap-3">
                              <span
                                className="text-sm font-semibold"
                                style={{ color: itemColor }}
                              >
                                {item.type}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: itemColor }}
                              >
                                {item.count} ({item.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${item.percentage}%`, backgroundColor: itemColor }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-2xl border-2 border-[#E67E22] shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-[#E67E22] border-b-2 border-[#E67E22]">
                <h2 className="font-bold text-white text-lg">Officer Details</h2>
              </div>
              <div className="p-5 space-y-2 text-sm">
                <p><span className="text-slate-700 font-bold">Name:</span> {user.name}</p>
                <p><span className="text-slate-700 font-bold">Department:</span> {user.department}</p>
                <p><span className="text-slate-700 font-bold">Area:</span> {user.area || '-'}</p>
                <p><span className="text-slate-700 font-bold">Contact:</span> {user.contact || '-'}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[#F1C40F] shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-[#F1C40F] border-b-2 border-[#F1C40F]">
                <h2 className="font-bold text-[#5C4300] text-lg">Department Members</h2>
              </div>
              <div className="p-5">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-500">No members found.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {members.map((m) => (
                      <li
                        key={m.officerId}
                        className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
                      >
                        <span className="truncate text-[#0B2A3B] font-semibold">{m.name}</span>
                        <span className="text-slate-600">{m.contact}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[#27AE60] shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-[#27AE60] border-b-2 border-[#27AE60]">
                <h2 className="font-bold text-white text-lg">Work Distribution</h2>
              </div>
              <div className="p-5">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-500">No data.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {members.map((m) => (
                      <li
                        key={m.officerId}
                        className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
                      >
                        <span className="truncate text-[#0B2A3B] font-semibold">{m.name}</span>
                        <span className="font-bold text-[#0F766E]">{m.assignedTaskCount || 0} tasks</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          {summaryCards.map((card) => {
            const active = selectedView === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setSelectedView(card.key)}
                className={`rounded-2xl border-2 ${card.border} bg-white overflow-hidden shadow-sm transition hover:shadow-md ${
                  active ? 'ring-2 ring-slate-300 scale-[1.01]' : ''
                }`}
              >
                <div className={`${card.header} text-white px-4 py-2 text-sm font-bold`}>
                  {card.title}
                </div>
                <div className={`px-4 py-3 text-3xl font-bold ${card.text}`}>
                  {card.count}
                </div>
              </button>
            );
          })}
        </div>

        {visibleTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-[#D9E2EC] shadow-sm p-10 text-center text-slate-500">
            No tasks found in {visibleTitle.toLowerCase()}.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#D9E2EC] px-5 py-4 shadow-sm">
              <h2 className="text-xl font-bold text-[#0B2A3B]">{visibleTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Click the summary boxes above to switch between active and completed task views.
              </p>
            </div>

            {visibleTasks.map(({ task, request }) => {
              if (!request) return null;

              const isDocument = request.requestCategory === 'document';
              const stageList = isDocument ? stages.document : stages.complaint;
              const completedComplaint = isCompletedComplaint(request);
              const completedDocument = isCompletedDocument(request);
              const completed = completedComplaint || completedDocument;
              const archived = isArchivedTask(task);
              const currentStageValue = request.currentStage || request.status || task.stage || '';
              const allowedStageOptions = getAllowedNextStages(stageList, currentStageValue);
              const selectedStage = selectedStageByTask[task._id] || currentStageValue;
              const selectedStatus = selectedStatusByTask[task._id] || task.status || 'pending';

              return (
                <div
                  key={task._id}
                  className={`rounded-2xl p-[3px] shadow-md ${
                    archived
                      ? 'bg-[linear-gradient(90deg,#94A3B8_0%,#E2E8F0_50%,#94A3B8_100%)]'
                      : 'bg-[linear-gradient(90deg,#F39C12_0%,#F7F7F7_45%,#27AE60_100%)]'
                  }`}
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-[#D9E2EC]">
                    <div className="p-5 border-b border-[#D9E2EC]">
                      <div className="flex flex-wrap justify-between items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/request/${request._id}`}
                              className="font-mono text-[#2563EB] hover:underline font-bold"
                            >
                              {request.requestId}
                            </Link>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 capitalize">
                              {request.requestCategory}
                            </span>
                            {request.priority && (
                              <span className={`text-xs px-2 py-0.5 rounded font-bold capitalize ${getPriorityStyles(request.priority)}`}>
                                {request.priority}
                              </span>
                            )}
                            {archived && (
                              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-600">
                                Archived
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-[#0B2A3B] text-4xl mt-3 leading-tight">
                            {request.requestType}
                          </h3>

                          <p className="text-slate-700 mt-3 text-[22px] leading-9 font-medium">
                            {request.description || 'Document application'}
                          </p>

                          {task.assignedOfficerName && (
                            <p className="text-sm text-slate-500 mt-3">
                              Assigned: <span className="font-semibold text-[#0B2A3B]">{task.assignedOfficerName}</span>
                            </p>
                          )}
                        </div>

                        <div className="text-right flex flex-col gap-2 items-end">
                          <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-[#FFF4D6] text-[#B45309] border-2 border-[#F39C12] font-bold">
                            {currentStageValue}
                          </span>

                          {completed && !archived && (
                            <button
                              type="button"
                              onClick={() => archiveTask(task._id)}
                              disabled={!!updating}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#8E44AD] text-white text-sm font-bold hover:bg-[#6F2F8E] transition disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {updating === task._id ? 'Archiving...' : 'Archive Task'}
                            </button>
                          )}

                          {completed && archived && (
                            <button
                              type="button"
                              onClick={() => unarchiveTask(task._id)}
                              disabled={!!updating}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-bold hover:bg-[#1D4ED8] transition disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {updating === task._id ? 'Unarchiving...' : 'Unarchive Task'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="rounded-2xl border-2 border-[#E74C3C] bg-white shadow-sm overflow-hidden">
                          <div className="px-4 py-3 bg-[#E74C3C] text-white font-bold text-sm">
                            Task Status
                          </div>
                          <div className="p-4">
                            <select
                              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-slate-200"
                              value={selectedStatus}
                              onChange={(e) =>
                                setSelectedStatusByTask((prev) => ({
                                  ...prev,
                                  [task._id]: e.target.value,
                                }))
                              }
                              disabled={!!updating || archived}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>

                        <div className="rounded-2xl border-2 border-[#F1C40F] bg-white shadow-sm overflow-hidden">
                          <div className="px-4 py-3 bg-[#F1C40F] text-[#5C4300] font-bold text-sm">
                            Update Stage
                          </div>
                          <div className="p-4">
                            <select
                              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-slate-200"
                              value={selectedStage}
                              onChange={(e) => {
                                const nextValue = e.target.value;
                                setSelectedStageByTask((prev) => ({
                                  ...prev,
                                  [task._id]: nextValue,
                                }));
                                moveToNextStage(task, request, stageList, nextValue);
                              }}
                              disabled={!!updating || archived}
                            >
                              {allowedStageOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-2">
                              Stage moves one by one only.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border-2 border-[#27AE60] bg-white shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-[#27AE60] text-white font-bold text-sm">
                          Remarks / Inspection Notes
                        </div>
                        <div className="p-4">
                          <textarea
                            className="w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-slate-200"
                            rows={4}
                            placeholder="Add remarks..."
                            value={taskRemarks[task._id] ?? task.remarks ?? task.inspectionNotes ?? ''}
                            onChange={(e) =>
                              setTaskRemarks((prev) => ({
                                ...prev,
                                [task._id]: e.target.value,
                              }))
                            }
                            disabled={!!updating || archived}
                          />

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-[#1FA463] text-white text-sm font-bold hover:bg-[#187B4B] transition disabled:opacity-70 disabled:cursor-not-allowed"
                              disabled={!!updating || archived}
                              onClick={() => {
                                const v = (taskRemarks[task._id] ?? '').trim();
                                updateTask(task._id, { remarks: v, inspectionNotes: v });
                              }}
                            >
                              {updating === task._id ? 'Saving...' : 'Save Remarks'}
                            </button>
                            <span className="text-sm text-slate-500">
                              Remarks are saved only when you click <span className="font-semibold text-[#0B2A3B]">Save Remarks</span>.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
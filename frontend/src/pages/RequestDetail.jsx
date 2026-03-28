import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requests, certificates } from '../api/api';
import { config } from '../api/api';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState('');
  const [cert, setCert] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequestDetail = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);

    try {
      const [res, configRes] = await Promise.all([
        requests.get(id),
        config.get().catch(() => ({ data: {} })),
      ]);

      const { request, departmentTasks } = res.data;
      setData({ request, departmentTasks });

      const stagesList = request.requestCategory === 'complaint'
        ? (configRes.data?.complaintStages || [
            'Submitted',
            'Under Review',
            'Inspection Scheduled',
            'Work In Progress',
            'Resolved',
            'Closed',
          ])
        : (configRes.data?.documentStages || [
            'Application Submitted',
            'Document Verification',
            'Department Approval',
            'Certificate Generated',
            'Available for Download',
          ]);

      setStages(stagesList);

      if (request.requestCategory === 'document') {
        try {
          const certRes = await certificates.getByRequest(id);
          setCert(certRes.data);
        } catch {
          setCert(null);
        }
      } else {
        setCert(null);
      }
    } catch {
      setData(null);
      setCert(null);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequestDetail(true);
  }, [fetchRequestDetail]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequestDetail(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchRequestDetail]);

  const addComment = () => {
    if (!comment.trim()) return;
    requests.addComment(id, comment.trim())
      .then(() => {
        setComment('');
        return fetchRequestDetail(false);
      })
      .catch(() => {});
  };

  const currentIndex = data?.request ? stages.indexOf(data.request.currentStage) : -1;

  if (loading) return <div className="card text-center py-12">Loading...</div>;
  if (!data?.request) return <div className="card text-center py-12 text-red-600">Request not found.</div>;

  const { request, departmentTasks } = data;
  const isCitizen = user?.role === 'citizen';
  const isOfficer = user?.role === 'officer';
  const isAdmin = user?.role === 'admin';
  const canComment = isOfficer || isAdmin;

  const timelineColors = {
    Submitted: 'bg-red-500',
    'Under Review': 'bg-orange-500',
    'Inspection Scheduled': 'bg-yellow-500',
    'Work In Progress': 'bg-blue-500',
    Resolved: 'bg-green-500',
    Closed: 'bg-purple-500',
    'Application Submitted': 'bg-red-500',
    'Document Verification': 'bg-orange-500',
    'Department Approval': 'bg-blue-500',
    'Certificate Generated': 'bg-green-500',
    'Available for Download': 'bg-purple-500',
  };

  const timelinePanelColors = {
    Submitted: 'from-red-50 to-white',
    'Under Review': 'from-orange-50 to-white',
    'Inspection Scheduled': 'from-yellow-50 to-white',
    'Work In Progress': 'from-blue-50 to-white',
    Resolved: 'from-green-50 to-white',
    Closed: 'from-purple-50 to-white',
    'Application Submitted': 'from-red-50 to-white',
    'Document Verification': 'from-orange-50 to-white',
    'Department Approval': 'from-blue-50 to-white',
    'Certificate Generated': 'from-green-50 to-white',
    'Available for Download': 'from-purple-50 to-white',
  };

  const normalizedPriority = String(request.priority || '').toLowerCase();
  const priorityBadgeClass =
    normalizedPriority === 'high'
      ? 'bg-red-100 text-red-700'
      : normalizedPriority === 'medium'
      ? 'bg-amber-100 text-amber-700'
      : normalizedPriority === 'urgent'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-emerald-100 text-emerald-700';

  const getTaskStatusClass = (status) => {
    const value = String(status || '').toLowerCase();

    if (value === 'approved') return 'bg-emerald-100/80 text-emerald-700';
    if (value === 'in_progress') return 'bg-blue-100/80 text-blue-700';
    if (value === 'pending') return 'bg-amber-100/80 text-amber-700';
    if (value === 'rejected') return 'bg-red-100/80 text-red-700';

    return 'bg-slate-200 text-slate-700';
  };

  const formatLabel = (key) => {
    const labels = {
      requestType: 'Complaint Type',
      location: 'Location',
      area: 'Location / Area',
      ward: 'Ward',
      exactAddress: 'Exact Address',
      landmark: 'Nearest Landmark',
      description: 'Complaint Description',
      priority: 'Priority',
      imageUrl: 'Image',
      contactNumber: 'Citizen Contact Number',
      preferredInspectionTime: 'Preferred Inspection Time',
    };

    if (labels[key]) return labels[key];

    return String(key || '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div>
          <Link
            to={isCitizen ? '/dashboard' : isOfficer ? '/officer' : '/admin'}
            className="text-gov-blue text-sm hover:underline"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gov-navy mt-1">{request.requestId}</h1>
          <p className="text-slate-600">{request.requestType} · {request.requestCategory}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          request.currentStage === 'Available for Download' || request.currentStage === 'Closed'
            ? 'bg-green-100 text-green-800'
            : request.currentStage === 'Resolved' || request.currentStage === 'Certificate Generated'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {request.currentStage || request.status}
        </span>
      </div>

      <div className="card border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <h2 className="font-semibold text-gov-navy mb-5">Timeline</h2>
        <div className="overflow-x-auto">
          <div className="flex items-start gap-3 min-w-max pb-2">
            {stages.map((stage, i) => {
              const isCompleted = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isDoneOrCurrent = i <= currentIndex;

              return (
                <React.Fragment key={stage}>
                  <div
                    className={`rounded-xl border px-4 py-3 min-w-[150px] text-center shadow-sm bg-gradient-to-b ${
                      isDoneOrCurrent
                        ? timelinePanelColors[stage] || 'from-slate-50 to-white'
                        : 'from-slate-50 to-white'
                    } ${isDoneOrCurrent ? 'border-slate-200' : 'border-slate-300'}`}
                  >
                    <div
                      className={`mx-auto w-16 h-16 rounded-full border-2 flex items-center justify-center text-base font-bold ${
                        isDoneOrCurrent
                          ? `${timelineColors[stage] || 'bg-blue-500'} border-white text-white`
                          : 'bg-slate-200 border-slate-300 text-slate-500'
                      }`}
                      style={isDoneOrCurrent ? { boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.45), 0 8px 16px rgba(15,23,42,0.22)' } : undefined}
                    >
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <p className={`mt-3 text-sm font-semibold ${isDoneOrCurrent ? 'text-gov-navy' : 'text-slate-500'}`}>
                      {stage}
                    </p>
                    <p className={`mt-1 text-xs ${isDoneOrCurrent ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isCompleted ? 'Completed' : isCurrent ? 'Current Step' : 'Upcoming'}
                    </p>
                  </div>
                  {i < stages.length - 1 && (
                    <div className={`pt-8 text-2xl font-bold ${i < currentIndex ? 'text-slate-600' : 'text-slate-300'}`}>
                      →
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {request.timeline?.length > 0 && (
        <div className="card border border-slate-200 bg-gradient-to-br from-white to-slate-50">
          <h2 className="font-semibold text-gov-navy mb-4">Stage Update History</h2>
          <div className="space-y-3">
            {[...request.timeline].reverse().map((item, index) => (
              <div
                key={`${item.stage}-${index}-${item.createdAt || item.updatedAt || item.timestamp || index}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gov-navy">{item.stage}</p>
                    <p className="text-sm text-slate-700 mt-1">{item.note || 'Stage updated'}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {item.createdAt || item.updatedAt || item.timestamp
                      ? new Date(item.createdAt || item.updatedAt || item.timestamp).toLocaleString()
                      : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card border-l-4 border-l-blue-500 bg-blue-50/60">
          <h2 className="font-semibold text-gov-navy mb-4">Details</h2>

          {request.requestCategory === 'complaint' && (
            <div className="space-y-3">
              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Complaint Type:</span> {request.requestType || '-'}
              </p>

              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Location / Area:</span> {request.location || request.area || '-'}
              </p>

              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Ward:</span> {request.ward || '-'}
              </p>

              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Exact Address:</span> {request.exactAddress || '-'}
              </p>

              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Nearest Landmark:</span> {request.landmark || '-'}
              </p>

              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Complaint Description:</span> {request.description || '-'}
              </p>

              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Priority:</span> {request.priority || '-'}
              </p>

              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Citizen Contact Number:</span> {request.contactNumber || '-'}
              </p>

              <p className="text-slate-800 leading-relaxed">
                <span className="text-slate-600 font-medium">Preferred Inspection Time:</span> {request.preferredInspectionTime || '-'}
              </p>

              {request.imageUrl && (
                <img
                  src={request.imageUrl.startsWith('http') ? request.imageUrl : `${import.meta.env.VITE_API_BASE_URL || window.location.origin}${request.imageUrl}`}
                  alt="Complaint"
                  className="mt-2 rounded-lg border border-blue-100 max-h-40 object-cover"
                />
              )}
            </div>
          )}

          {request.requestCategory === 'document' && request.documentData && (
            <ul className="space-y-2">
              {Object.entries(request.documentData).map(([k, v]) => (
                <li key={k} className="text-slate-800 leading-relaxed">
                  <span className="text-slate-600 capitalize font-medium">{formatLabel(k)}:</span> {String(v)}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityBadgeClass}`}>
              Priority: {request.priority}
            </span>
            <span>Created {new Date(request.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="card border border-slate-300 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
          <h2 className="font-semibold text-gov-navy mb-4">Department Tasks</h2>
          <ul className="space-y-3">
            {departmentTasks?.map((t) => (
              <li
                key={t._id}
                className="rounded-lg border border-slate-300 bg-slate-50/90 px-3 py-3"
              >
                <div className="flex justify-between items-start gap-3 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium text-slate-700">{t.department}</span>
                    {t.stage && (
                      <p className="text-xs text-slate-500 mt-1">{t.stage}</p>
                    )}
                    {(t.assignedOfficerName || t.assignedOfficerId) && (
                      <p className="text-xs text-slate-500 mt-1">
                        Officer: {t.assignedOfficerName || t.assignedOfficerId}
                      </p>
                    )}
                    {(t.remarks || t.inspectionNotes) && (
                      <p className="text-xs text-slate-600 mt-2">
                        {t.remarks || t.inspectionNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTaskStatusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {request.requestCategory === 'document' && cert && (
        <div className="card flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-gov-navy">Certificate Ready</h2>
            <p className="text-sm text-slate-600">ID: {cert.certificateId}</p>
          </div>
          <button
            type="button"
            onClick={() => certificates.download(id).catch(() => {})}
            className="btn-primary"
          >
            Download Certificate
          </button>
        </div>
      )}

      <div className="card border border-slate-200 bg-gradient-to-br from-white to-slate-50">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-semibold text-gov-navy">Officer Comments</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">Official Notes</span>
        </div>
        {(() => {
          const taskComments = (departmentTasks || []).flatMap((t) => {
            const items = [];
            const remarks = t?.remarks != null ? String(t.remarks).trim() : '';
            const inspectionNotes = t?.inspectionNotes != null ? String(t.inspectionNotes).trim() : '';
            const when = t?.updatedAt || t?.completedAt || t?.createdAt || null;

            if (remarks) {
              items.push({
                source: 'task',
                kind: 'Remarks',
                department: t?.department,
                status: t?.status,
                text: remarks,
                createdAt: when,
              });
            }

            if (inspectionNotes) {
              items.push({
                source: 'task',
                kind: 'Inspection Notes',
                department: t?.department,
                status: t?.status,
                text: inspectionNotes,
                createdAt: when,
              });
            }

            return items;
          });

          const hasAny = (request.officerComments?.length || 0) > 0 || taskComments.length > 0;

          if (!hasAny) {
            return <p className="text-slate-500 text-sm mb-4 italic">No official comments recorded yet.</p>;
          }

          return (
            <ul className="space-y-3 mb-4">
              {taskComments.map((c, i) => (
                <li key={`task-${i}`} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gov-navy">
                          {c.department || 'Department Task'}
                          <span className="ml-2 text-xs font-medium text-slate-600">· {c.kind}</span>
                        </p>
                        <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">{c.text}</p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                        {c.status || 'Updated'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Source: Department task{c.createdAt ? ` · ${new Date(c.createdAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                </li>
              ))}

              {request.officerComments?.map((c, i) => (
                <li key={`comment-${i}`} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-gov-navy">Officer Comment</p>
                    <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">{c.text}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {c.authorName || 'Officer'}
                      {c.createdAt ? ` · ${new Date(c.createdAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}
        {canComment && (
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="input-field flex-1"
            />
            <button type="button" onClick={addComment} className="btn-primary">Add</button>
          </div>
        )}
      </div>
    </div>
  );
}
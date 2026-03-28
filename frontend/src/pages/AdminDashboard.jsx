import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requests, users, departments } from '../api/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [requestList, setRequestList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [tab, setTab] = useState('overview');
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [newOfficer, setNewOfficer] = useState({ name: '', email: '', password: '', department: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      requests.analytics().then(({ data }) => data).catch(() => null),
      requests.all().then(({ data }) => data).catch(() => []),
      users.list().then(({ data }) => data).catch(() => []),
      departments.list().then(({ data }) => data).catch(() => []),
    ]).then(([a, r, u, d]) => {
      setAnalytics(a);
      setRequestList(r);
      setUserList(u);
      setDeptList(d);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    departments.create(newDept).then(() => {
      setNewDept({ name: '', description: '' });
      return departments.list();
    }).then(({ data }) => setDeptList(data)).catch(() => {});
  };

  const handleCreateOfficer = (e) => {
    e.preventDefault();
    if (!newOfficer.name || !newOfficer.email || !newOfficer.password || !newOfficer.department) return;
    users.createOfficer(newOfficer).then(() => {
      setNewOfficer({ name: '', email: '', password: '', department: '' });
      return users.list();
    }).then(({ data }) => setUserList(data)).catch(() => {});
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gov-navy mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2 font-medium ${tab === 'overview' ? 'text-gov-blue border-b-2 border-gov-blue' : 'text-slate-600'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('departments')}
          className={`px-4 py-2 font-medium ${tab === 'departments' ? 'text-gov-blue border-b-2 border-gov-blue' : 'text-slate-600'}`}
        >
          Departments
        </button>
        <button
          onClick={() => setTab('officers')}
          className={`px-4 py-2 font-medium ${tab === 'officers' ? 'text-gov-blue border-b-2 border-gov-blue' : 'text-slate-600'}`}
        >
          Officers
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2 font-medium ${tab === 'requests' ? 'text-gov-blue border-b-2 border-gov-blue' : 'text-slate-600'}`}
        >
          All Requests
        </button>
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-slate-600 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-gov-navy">{analytics?.total ?? 0}</p>
            </div>
            <div className="card">
              <p className="text-slate-600 text-sm">By Category</p>
              <ul className="mt-2 text-sm">
                {(analytics?.byCategory || []).map((c) => (
                  <li key={c._id}>{c._id}: {c.count}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <p className="text-slate-600 text-sm">By Status</p>
              <ul className="mt-2 text-sm">
                {(analytics?.byStatus || []).slice(0, 5).map((s) => (
                  <li key={s._id}>{s._id}: {s.count}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold text-gov-navy mb-3">Recent Requests</h2>
            <ul className="space-y-2">
              {(analytics?.recent || []).map((r) => (
                <li key={r._id}>
                  <Link to={`/request/${r._id}`} className="text-gov-blue hover:underline font-mono text-sm">{r.requestId}</Link>
                  {' '}{r.requestType} · {r.userId?.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'departments' && (
        <div className="space-y-6">
          <form onSubmit={handleAddDepartment} className="card flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
              <input
                type="text"
                value={newDept.name}
                onChange={(e) => setNewDept((d) => ({ ...d, name: e.target.value }))}
                className="input-field w-64"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={newDept.description}
                onChange={(e) => setNewDept((d) => ({ ...d, description: e.target.value }))}
                className="input-field w-64"
              />
            </div>
            <button type="submit" className="btn-primary">Add Department</button>
          </form>
          <ul className="card divide-y">
            {deptList.map((d) => (
              <li key={d._id} className="py-2 flex justify-between">
                <span className="font-medium">{d.name}</span>
                <span className="text-slate-500 text-sm">{d.code}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'officers' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateOfficer} className="card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={newOfficer.name}
                onChange={(e) => setNewOfficer((o) => ({ ...o, name: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newOfficer.email}
                onChange={(e) => setNewOfficer((o) => ({ ...o, email: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={newOfficer.password}
                onChange={(e) => setNewOfficer((o) => ({ ...o, password: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                value={newOfficer.department}
                onChange={(e) => setNewOfficer((o) => ({ ...o, department: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Select</option>
                {deptList.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <button type="submit" className="btn-primary">Create Officer</button>
            </div>
          </form>
          <div className="card">
            <h2 className="font-semibold text-gov-navy mb-3">Officers</h2>
            <ul className="divide-y">
              {userList.filter((u) => u.role === 'officer').map((u) => (
                <li key={u._id} className="py-2 flex justify-between items-center">
                  <span>{u.name} · {u.email}</span>
                  <span className="text-sm text-slate-500">{u.department}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-4">
          {requestList.map((req) => (
            <Link key={req._id} to={`/request/${req._id}`} className="card block hover:shadow-md transition">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <span className="font-mono text-sm text-gov-blue">{req.requestId}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-200">{req.requestCategory}</span>
                  <h3 className="font-semibold mt-1">{req.requestType}</h3>
                  <p className="text-sm text-slate-600">{req.userId?.name}</p>
                </div>
                <span className="px-2 py-1 rounded text-sm bg-amber-100 text-amber-800">{req.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

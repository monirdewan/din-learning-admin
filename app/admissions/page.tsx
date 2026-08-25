'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface Application {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  sessionId: number;
  sessionName: string;
  courseName: string;
  selectedTeacherId: number | null;
  status: string;
  applicationDate: string;
}

export default function AdmissionsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sessionId, setSessionId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchApplications = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sessionId) params.set('sessionId', sessionId);
    if (statusFilter) params.set('status', statusFilter);
    api<{ list: Application[] }>(`/api/admission-applications?${params.toString()}`)
      .then((res) => setApplications(res.data?.list || []))
      .catch((err) => setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load applications' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, statusFilter]);

  const approvable = applications.filter((a) => a.status === 'TEACHER_APPROVED');

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllApprovable = () => {
    setSelected(new Set(approvable.map((a) => a.id)));
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selected);
    try {
      const res = await api<{ results: { id: number; success: boolean; error?: string }[] }>('/api/admission-applications/bulk-approve', {
        method: 'POST',
        body: JSON.stringify({ applicationIds: ids }),
      });
      const results = res.data?.results || [];
      const success = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      setToast({
        type: failed === 0 ? 'success' : 'error',
        message: `Approved ${success} application(s)${failed ? `, ${failed} failed` : ''}.`,
      });
      setSelected(new Set());
      setBulkConfirm(false);
      fetchApplications();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Bulk approval failed' });
    }
  };

  const handleSingle = async (id: number, status: 'ADMITTED' | 'REJECTED') => {
    try {
      await api(`/api/admission-applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setToast({ type: 'success', message: status === 'ADMITTED' ? 'Student admitted.' : 'Application rejected.' });
      fetchApplications();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Action failed' });
    }
  };

  const statusTone = (s: string) => {
    switch (s) {
      case 'ADMITTED': return 'bg-green-100 text-green-700';
      case 'TEACHER_APPROVED': return 'bg-blue-100 text-blue-700';
      case 'TEACHER_REJECTED': return 'bg-red-100 text-red-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Layout>
      {toast && (
        <div className={`mb-4 rounded-md px-4 py-3 text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Admissions</h2>
        {selected.size > 0 && (
          <button onClick={() => setBulkConfirm(true)} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            Bulk Approve ({selected.size})
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All Sessions</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="TEACHER_APPROVED">Teacher Approved</option>
          <option value="TEACHER_REJECTED">Teacher Rejected</option>
          <option value="ADMITTED">Admitted</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button onClick={selectAllApprovable} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Select all teacher-approved
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No admission applications found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) selectAllApprovable();
                      else setSelected(new Set());
                    }}
                    checked={selected.size > 0 && approvable.every((a) => selected.has(a.id))}
                  />
                </th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    {a.status === 'TEACHER_APPROVED' && (
                      <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{a.studentName}</div>
                    <div className="text-xs text-slate-500">{a.studentEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.sessionName}</td>
                  <td className="px-4 py-3 text-slate-600">{a.courseName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusTone(a.status)}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {a.status === 'TEACHER_APPROVED' && (
                      <>
                        <button onClick={() => handleSingle(a.id, 'ADMITTED')} className="mr-2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                          Approve
                        </button>
                        <button onClick={() => handleSingle(a.id, 'REJECTED')} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Approve {selected.size} selected applications?</h3>
            <p className="mt-2 text-sm text-slate-500">This will admit the selected students and create their enrollments.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setBulkConfirm(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleBulkApprove} className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">Approve</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

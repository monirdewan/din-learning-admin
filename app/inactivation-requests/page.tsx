'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface InactivationRequest {
  id: number;
  teacherId: number;
  reason: string;
  status: string;
  createdAt: string;
  teacherName: string;
  teacherEmail: string;
  approvalStatus: string;
}

export default function InactivationRequestsPage() {
  const [requests, setRequests] = useState<InactivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchRequests = () => {
    setLoading(true);
    api<{ list: InactivationRequest[] }>('/api/teacher-inactivation')
      .then((res) => setRequests(res.data?.list || []))
      .catch((err) => setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load requests' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const process = async (id: number, action: 'approve' | 'reject') => {
    try {
      await api(`/api/teacher-inactivation/${id}/process`, { method: 'POST', body: JSON.stringify({ action }) });
      setToast({ type: 'success', message: `Request ${action}d.` });
      fetchRequests();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Action failed' });
    }
  };

  return (
    <Layout>
      {toast && (
        <div className={`mb-4 rounded-md px-4 py-3 text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Teacher Inactivation Requests</h2>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No inactivation requests.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Teacher</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{r.teacherName}</div>
                    <div className="text-xs text-slate-500">{r.teacherEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.reason || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'PENDING' && (
                      <>
                        <button onClick={() => process(r.id, 'approve')} className="mr-2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">Approve</button>
                        <button onClick={() => process(r.id, 'reject')} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

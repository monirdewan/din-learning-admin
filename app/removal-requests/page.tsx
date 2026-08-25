'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface RemovalRequest {
  id: number;
  status: string;
  reason?: string;
  createdAt: string;
  processedAt?: string;
  student: { id: number; fullName: string; email: string };
  teacher: { id: number; fullName: string; email: string };
}

const statusTone: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-100 text-slate-700',
};

export default function RemovalRequestsPage() {
  const [requests, setRequests] = useState<RemovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchRequests = () => {
    setLoading(true);
    api<{ requests: RemovalRequest[] }>('/api/admin/removal-requests')
      .then((res) => setRequests(res.data?.requests || []))
      .catch((err) => setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load requests' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async (id: number, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      await api(`/api/admin/removal-requests/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      setToast({ type: 'success', message: `Removal request ${action}d.` });
      fetchRequests();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to process request' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Layout>
      {toast && (
        <div className={`mb-4 rounded-md px-4 py-3 text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Teacher Removal Requests</h2>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No removal requests.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Teacher</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{r.student.fullName}</div>
                    <div className="text-xs text-slate-500">{r.student.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{r.teacher.fullName}</div>
                    <div className="text-xs text-slate-500">{r.teacher.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.reason || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusTone[r.status] || 'bg-slate-100 text-slate-700'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleProcess(r.id, 'approve')}
                          disabled={processingId === r.id}
                          className="mr-2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcess(r.id, 'reject')}
                          disabled={processingId === r.id}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">Processed</span>
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

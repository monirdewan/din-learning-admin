'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  experienceYears: number;
  institution: string;
  subjects: string[];
  classLevels: string[];
  approvalStatus: string;
  rejectionReason: string;
  createdAt: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchTeachers = () => {
    setLoading(true);
    api<{ teachers: Teacher[] }>('/api/admin/teachers')
      .then((res) => setTeachers(res.data?.teachers || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleApprove = async (id: number) => {
    await api(`/api/admin/teachers/${id}/approve`, { method: 'POST' });
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, approvalStatus: 'APPROVED' } : t)));
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    await api(`/api/admin/teachers/${rejectId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: rejectReason }),
    });
    setTeachers((prev) => prev.map((t) => (t.id === rejectId ? { ...t, approvalStatus: 'REJECTED', rejectionReason: rejectReason } : t)));
    setRejectId(null);
    setRejectReason('');
  };

  const handleBlock = async (id: number) => {
    await api(`/api/admin/teachers/${id}/block`, { method: 'POST' });
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, approvalStatus: 'BLOCKED' } : t)));
  };

  const handleUnblock = async (id: number) => {
    await api(`/api/admin/teachers/${id}/unblock`, { method: 'POST' });
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, approvalStatus: 'APPROVED' } : t)));
  };

  const filteredTeachers = filter === 'ALL' ? teachers : teachers.filter((t) => t.approvalStatus === filter);

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Teacher Applications</h2>
      <div className="mb-6">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : filteredTeachers.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No teacher applications found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Qualification</th>
                <th className="px-4 py-3 font-medium">Subjects</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{t.fullName}</div>
                    <div className="text-xs text-slate-500">{t.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.qualification}</td>
                  <td className="px-4 py-3 text-slate-600">{t.subjects?.join(', ') || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      t.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      t.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      t.approvalStatus === 'BLOCKED' ? 'bg-slate-100 text-slate-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{t.approvalStatus}</span>
                    {t.rejectionReason && <div className="mt-1 text-xs text-red-600">{t.rejectionReason}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {t.approvalStatus === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(t.id)} className="mr-2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                          Approve
                        </button>
                        <button onClick={() => setRejectId(t.id)} className="mr-2 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                          Reject
                        </button>
                      </>
                    )}
                    {(t.approvalStatus === 'APPROVED' || t.approvalStatus === 'REJECTED') && (
                      <button onClick={() => handleBlock(t.id)} className="rounded-md bg-slate-600 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700">
                        Block
                      </button>
                    )}
                    {t.approvalStatus === 'BLOCKED' && (
                      <button onClick={() => handleUnblock(t.id)} className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700">
                        Unblock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Reject Teacher</h3>
            <p className="mt-2 text-sm text-slate-500">Please provide a rejection reason.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Reason for rejection"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setRejectId(null)} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

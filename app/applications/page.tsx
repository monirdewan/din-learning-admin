'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface TeacherApplication {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  experienceYears: number;
  institution: string;
  subjects: string[];
  classLevels: string[];
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchApplications = () => {
    setLoading(true);
    api<{ teachers: TeacherApplication[] }>('/api/admin/teachers/pending')
      .then((res) => setApplications(res.data?.teachers || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: number) => {
    await api(`/api/admin/teachers/${id}/approve`, { method: 'POST' });
    setApplications((prev) => prev.filter((t) => t.id !== id));
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    await api(`/api/admin/teachers/${rejectId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: rejectReason }),
    });
    setApplications((prev) => prev.filter((t) => t.id !== rejectId));
    setRejectId(null);
    setRejectReason('');
  };

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Applications</h2>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No pending applications.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Qualification</th>
                <th className="px-4 py-3 font-medium">Experience</th>
                <th className="px-4 py-3 font-medium">Institution</th>
                <th className="px-4 py-3 font-medium">Subjects</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{t.fullName}</div>
                    <div className="text-xs text-slate-500">{t.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.qualification || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.experienceYears ?? '-'} yrs</td>
                  <td className="px-4 py-3 text-slate-600">{t.institution || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{t.subjects?.join(', ') || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleApprove(t.id)} className="mr-2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                      Approve
                    </button>
                    <button onClick={() => setRejectId(t.id)} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                      Reject
                    </button>
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
            <h3 className="text-lg font-semibold text-slate-900">Reject Application</h3>
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

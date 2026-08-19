'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface LiveClass {
  id: number;
  teacherId: number;
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  meetingUrl: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = () => {
    setLoading(true);
    api<{ list: LiveClass[] }>('/api/admin/live-classes')
      .then((res) => setClasses(res.data?.list || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this live class?')) return;
    await api(`/api/admin/live-classes/${id}`, { method: 'DELETE' });
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Live Classes</h2>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No live classes found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Teacher ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                  <td className="px-4 py-3 text-slate-600">{c.teacherId}</td>
                  <td className="px-4 py-3 text-slate-600">{c.scheduledDate}</td>
                  <td className="px-4 py-3 text-slate-600">{c.startTime} - {c.endTime}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      c.status === 'LIVE' ? 'bg-green-100 text-green-700' :
                      c.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      c.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c.id)} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                      Delete
                    </button>
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

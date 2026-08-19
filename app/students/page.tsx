'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface Student {
  id: number;
  fullName: string;
  email: string;
  status: string;
  phone: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('role', 'STUDENT');
    if (search) params.set('search', search);
    api<{ list: Student[] }>(`/api/users?${params.toString()}`)
      .then((res) => setStudents(res.data?.list || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleStatus = async (id: number, status: string) => {
    await api(`/api/admin/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Students</h2>
      <input
        type="text"
        placeholder="Search students"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full rounded-md border border-slate-300 px-3 py-2 text-sm sm:w-64"
      />
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{s.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{s.email}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      s.status === 'BLOCKED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {s.status !== 'BLOCKED' && (
                      <button onClick={() => handleStatus(s.id, 'BLOCKED')} className="mr-2 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                        Block
                      </button>
                    )}
                    {s.status === 'BLOCKED' && (
                      <button onClick={() => handleStatus(s.id, 'ACTIVE')} className="mr-2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                        Unblock
                      </button>
                    )}
                    {s.status !== 'DEACTIVATED' && (
                      <button onClick={() => handleStatus(s.id, 'DEACTIVATED')} className="rounded-md bg-slate-600 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700">
                        Deactivate
                      </button>
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

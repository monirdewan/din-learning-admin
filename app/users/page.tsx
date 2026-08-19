'use client';

import { useCallback, useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    const res = await api<{ list: User[] }>(`/api/users?${params.toString()}`);
    setUsers(res.data?.list || []);
    setLoading(false);
  }, [search, role]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleStatus = async (id: number, status: string) => {
    await api(`/api/admin/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  };

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Users</h2>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm sm:w-64"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.phone || '-'}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'ADMIN' && u.status !== 'BLOCKED' && (
                      <button onClick={() => handleStatus(u.id, 'BLOCKED')} className="mr-2 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                        Block
                      </button>
                    )}
                    {u.role !== 'ADMIN' && u.status === 'BLOCKED' && (
                      <button onClick={() => handleStatus(u.id, 'ACTIVE')} className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
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
    </Layout>
  );
}

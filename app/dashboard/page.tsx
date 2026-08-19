'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  pendingApplications: number;
  activeTeachers: number;
  blockedTeachers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<DashboardStats>('/api/admin/dashboard')
      .then((res) => setStats(res.data || null))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers },
    { label: 'Students', value: stats?.totalStudents },
    { label: 'Teachers', value: stats?.totalTeachers },
    { label: 'Pending Applications', value: stats?.pendingApplications },
    { label: 'Active Teachers', value: stats?.activeTeachers },
    { label: 'Blocked Teachers', value: stats?.blockedTeachers },
  ];

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h2>
      {loading && <div className="text-slate-500">Loading...</div>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">{card.label}</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{loading ? '-' : card.value}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

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
  admission: {
    activeSessions: number;
    pending: number;
    approved: number;
    interview: number;
    rejected: number;
    totalEnrollments: number;
  };
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
    { label: 'Pending Teacher Apps', value: stats?.pendingApplications },
    { label: 'Active Teachers', value: stats?.activeTeachers },
    { label: 'Blocked Teachers', value: stats?.blockedTeachers },
  ];

  const admissionCards = [
    { label: 'Active Sessions', value: stats?.admission.activeSessions },
    { label: 'Pending Applications', value: stats?.admission.pending },
    { label: 'Teacher Approved', value: stats?.admission.approved },
    { label: 'Interview', value: stats?.admission.interview },
    { label: 'Rejected', value: stats?.admission.rejected },
    { label: 'Total Enrollments', value: stats?.admission.totalEnrollments },
  ];

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h2>
      {loading && <div className="text-slate-500">Loading...</div>}
      <h3 className="mb-4 text-lg font-semibold text-slate-800">Platform Overview</h3>
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">{card.label}</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{loading ? '-' : card.value}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-4 text-lg font-semibold text-slate-800">Admission Overview</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {admissionCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">{card.label}</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{loading ? '-' : card.value}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

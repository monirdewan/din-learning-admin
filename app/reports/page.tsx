'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface Report {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  pendingTeachers: number;
  approvedTeachers: number;
  rejectedTeachers: number;
  blockedTeachers: number;
  totalClasses: number;
  totalLiveClasses: number;
}

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Report>('/api/admin/reports')
      .then((res) => setReport(res.data || null))
      .finally(() => setLoading(false));
  }, []);

  const items = report
    ? [
        { label: 'Total Users', value: report.totalUsers },
        { label: 'Students', value: report.totalStudents },
        { label: 'Teachers', value: report.totalTeachers },
        { label: 'Pending Teachers', value: report.pendingTeachers },
        { label: 'Approved Teachers', value: report.approvedTeachers },
        { label: 'Rejected Teachers', value: report.rejectedTeachers },
        { label: 'Blocked Teachers', value: report.blockedTeachers },
        { label: 'Class Posts', value: report.totalClasses },
        { label: 'Live Classes', value: report.totalLiveClasses },
      ]
    : [];

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Reports</h2>
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">{item.label}</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

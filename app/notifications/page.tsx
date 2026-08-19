'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  targetType: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<{ list: Notification[] }>('/api/admin/notifications')
      .then((res) => setNotifications(res.data?.list || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
        <Link
          href="/notifications/post"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Notification
        </Link>
      </div>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No notifications found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{n.title}</td>
                  <td className="px-4 py-3 text-slate-600">{n.message}</td>
                  <td className="px-4 py-3 text-slate-600">{n.targetType}</td>
                  <td className="px-4 py-3 text-slate-600">{n.priority}</td>
                  <td className="px-4 py-3 text-slate-600">{n.status}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(n.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

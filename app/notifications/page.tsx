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
  const [viewId, setViewId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchNotifications = () => {
    setLoading(true);
    api<{ list: Notification[] }>('/api/admin/notifications')
      .then((res) => setNotifications(res.data?.list || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await api(`/api/notifications/${deleteId}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n.id !== deleteId));
    setDeleteId(null);
  };

  const viewed = notifications.find((n) => n.id === viewId);

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
                <th className="px-4 py-3 font-medium">Actions</th>
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
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewId(n.id)}
                      className="mr-2 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setDeleteId(n.id)}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewId && viewed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setViewId(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">{viewed.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{viewed.message}</p>
            <div className="mt-4 text-xs text-slate-500">
              <div>Target: {viewed.targetType}</div>
              <div>Priority: {viewed.priority}</div>
              <div>Status: {viewed.status}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewId(null)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Delete Notification?</h3>
            <p className="mt-2 text-sm text-slate-500">Are you sure you want to permanently delete this notification?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

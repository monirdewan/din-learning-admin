'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

const emptyForm = { title: '', message: '', targetType: 'ALL', priority: 'MEDIUM' };

export default function PostNotificationPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push('/notifications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm';

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Create Notification</h2>
        <Link href="/notifications" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Back
        </Link>
      </div>

      <div className="max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Notification title"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={inputClass}
              rows={4}
              placeholder="Notification message"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Target</label>
              <select
                value={form.targetType}
                onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                className={inputClass}
              >
                <option value="ALL">All Users</option>
                <option value="STUDENTS">Students</option>
                <option value="TEACHERS">Teachers</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className={inputClass}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

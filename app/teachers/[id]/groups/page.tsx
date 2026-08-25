'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface GroupLink {
  id: number;
  teacherId: number;
  sessionId: number | null;
  courseId: number | null;
  platform: string;
  groupName: string;
  groupUrl: string;
  status: string;
  createdAt: string;
  teacherName?: string;
}

interface Course {
  id: number;
  name: string;
}

interface Session {
  id: number;
  name: string;
}

export default function TeacherGroupsPage() {
  const params = useParams();
  const teacherId = Number(params.id);
  const [links, setLinks] = useState<GroupLink[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GroupLink | null>(null);
  const [form, setForm] = useState({
    platform: 'TELEGRAM',
    groupName: '',
    groupUrl: '',
    sessionId: '',
    courseId: '',
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchLinks = () => {
    setLoading(true);
    api<{ list: GroupLink[] }>('/api/group-links')
      .then((res) => setLinks((res.data?.list || []).filter((l) => l.teacherId === teacherId)))
      .catch((err) => setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load group links' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinks();
    api<{ list: Course[] }>('/api/courses').then((res) => setCourses(res.data?.list || [])).catch(() => {});
    api<{ list: Session[] }>('/api/admission-sessions').then((res) => setSessions(res.data?.list || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ platform: 'TELEGRAM', groupName: '', groupUrl: '', sessionId: '', courseId: '', status: 'ACTIVE' });
    setShowForm(true);
  };

  const openEdit = (l: GroupLink) => {
    setEditing(l);
    setForm({
      platform: l.platform,
      groupName: l.groupName,
      groupUrl: l.groupUrl,
      sessionId: l.sessionId ? String(l.sessionId) : '',
      courseId: l.courseId ? String(l.courseId) : '',
      status: l.status,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      teacherId,
      platform: form.platform,
      groupName: form.groupName,
      groupUrl: form.groupUrl,
      sessionId: form.sessionId ? parseInt(form.sessionId, 10) : null,
      courseId: form.courseId ? parseInt(form.courseId, 10) : null,
      status: form.status,
    };
    try {
      if (editing) {
        await api(`/api/group-links/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        setToast({ type: 'success', message: 'Group link updated.' });
      } else {
        await api('/api/group-links', { method: 'POST', body: JSON.stringify(body) });
        setToast({ type: 'success', message: 'Group link added.' });
      }
      setShowForm(false);
      fetchLinks();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save group link' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this group link?')) return;
    await api(`/api/group-links/${id}`, { method: 'DELETE' });
    fetchLinks();
  };

  const toggleStatus = async (l: GroupLink) => {
    await api(`/api/group-links/${l.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: l.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
    });
    fetchLinks();
  };

  const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm';

  return (
    <Layout>
      {toast && (
        <div className={`mb-4 rounded-md px-4 py-3 text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/teachers" className="text-sm text-slate-500 hover:text-slate-700">← Back to Teachers</Link>
          <h2 className="text-2xl font-bold text-slate-900">Teacher Group Links</h2>
        </div>
        <button onClick={openCreate} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add Group Link
        </button>
      </div>

      {showForm && (
        <div className="mb-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{editing ? 'Edit Group Link' : 'Add Group Link'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Platform *</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={inputClass}>
                <option value="TELEGRAM">Telegram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Group Name *</label>
              <input value={form.groupName} onChange={(e) => setForm({ ...form, groupName: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Group Link *</label>
              <input type="url" value={form.groupUrl} onChange={(e) => setForm({ ...form, groupUrl: e.target.value })} className={inputClass} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Session</label>
                <select value={form.sessionId} onChange={(e) => setForm({ ...form, sessionId: e.target.value })} className={inputClass}>
                  <option value="">None</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Course</label>
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={inputClass}>
                  <option value="">None</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : links.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No group links for this teacher.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Group Name</th>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {links.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">{l.platform}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{l.groupName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <a href={l.groupUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{l.groupUrl}</a>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(l)} className={`rounded-full px-2 py-1 text-xs font-medium ${l.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {l.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(l)} className="mr-2 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                    <button onClick={() => handleDelete(l.id)} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">Delete</button>
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

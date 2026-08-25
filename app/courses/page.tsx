'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface Course {
  id: number;
  name: string;
  subject: string;
  description: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchCourses = () => {
    setLoading(true);
    api<{ list: Course[] }>('/api/courses')
      .then((res) => setCourses(res.data?.list || []))
      .catch((err) => setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load courses' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', subject: '', description: '' });
    setShowCreate(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ name: c.name, subject: c.subject || '', description: c.description || '' });
    setShowCreate(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api(`/api/courses/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        setToast({ type: 'success', message: 'Course updated.' });
      } else {
        await api('/api/courses', { method: 'POST', body: JSON.stringify(form) });
        setToast({ type: 'success', message: 'Course created.' });
      }
      setShowCreate(false);
      fetchCourses();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save course' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api(`/api/courses/${id}`, { method: 'DELETE' });
      setToast({ type: 'success', message: 'Course deleted.' });
      fetchCourses();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete course' });
    }
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
        <h2 className="text-2xl font-bold text-slate-900">Courses</h2>
        <button onClick={openCreate} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Create Course
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 max-w-xl rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{editing ? 'Edit Course' : 'Create Course'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No courses found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.subject || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.description || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(c)} className="mr-2 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      Edit
                    </button>
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

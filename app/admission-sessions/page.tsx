'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface Course {
  id: number;
  name: string;
  subject: string;
}

interface AdmissionSession {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  startDate: string;
  endDate: string;
  studentApplicationEnabled: boolean;
  teacherApplicationEnabled: boolean;
  maxStudentsPerTeacher: number;
  status: string;
}

interface SessionTeacher {
  id: number;
  fullName: string;
  email: string;
  maxStudents: number | null;
  currentStudents: number;
  booked: boolean;
}

export default function AdmissionSessionsPage() {
  const [sessions, setSessions] = useState<AdmissionSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdmissionSession | null>(null);
  const [managing, setManaging] = useState<AdmissionSession | null>(null);
  const [sessionTeachers, setSessionTeachers] = useState<SessionTeacher[]>([]);
  const [allTeachers, setAllTeachers] = useState<{ id: number; fullName: string }[]>([]);
  const [newTeacherId, setNewTeacherId] = useState('');
  const [form, setForm] = useState({
    name: '',
    courseId: '',
    startDate: '',
    endDate: '',
    studentApplicationEnabled: true,
    teacherApplicationEnabled: true,
    maxStudentsPerTeacher: 30,
    status: 'OPEN',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchSessions = () => {
    setLoading(true);
    api<{ list: AdmissionSession[] }>('/api/admission-sessions')
      .then((res) => setSessions(res.data?.list || []))
      .catch((err) => setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load sessions' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
    api<{ list: Course[] }>('/api/courses').then((res) => setCourses(res.data?.list || [])).catch(() => {});
    api<{ teachers: { id: number; fullName: string }[] }>('/api/admin/teachers')
      .then((res) => setAllTeachers(res.data?.teachers || []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', courseId: '', startDate: '', endDate: '', studentApplicationEnabled: true, teacherApplicationEnabled: true, maxStudentsPerTeacher: 30, status: 'OPEN' });
    setShowCreate(true);
  };

  const openEdit = (s: AdmissionSession) => {
    setEditing(s);
    setForm({
      name: s.name,
      courseId: String(s.courseId),
      startDate: s.startDate || '',
      endDate: s.endDate || '',
      studentApplicationEnabled: s.studentApplicationEnabled,
      teacherApplicationEnabled: s.teacherApplicationEnabled,
      maxStudentsPerTeacher: s.maxStudentsPerTeacher,
      status: s.status,
    });
    setShowCreate(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name,
      courseId: parseInt(form.courseId, 10),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      studentApplicationEnabled: form.studentApplicationEnabled,
      teacherApplicationEnabled: form.teacherApplicationEnabled,
      maxStudentsPerTeacher: form.maxStudentsPerTeacher,
      status: form.status,
    };
    try {
      if (editing) {
        await api(`/api/admission-sessions/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        setToast({ type: 'success', message: 'Session updated.' });
      } else {
        await api('/api/admission-sessions', { method: 'POST', body: JSON.stringify(body) });
        setToast({ type: 'success', message: 'Session created.' });
      }
      setShowCreate(false);
      fetchSessions();
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save session' });
    } finally {
      setSaving(false);
    }
  };

  const openManage = async (s: AdmissionSession) => {
    setManaging(s);
    setNewTeacherId('');
    const res = await api<{ list: SessionTeacher[] }>(`/api/admission-sessions/${s.id}/teachers`);
    setSessionTeachers(res.data?.list || []);
  };

  const addTeacher = async () => {
    if (!managing || !newTeacherId) return;
    try {
      await api(`/api/admission-sessions/${managing.id}/teachers`, {
        method: 'POST',
        body: JSON.stringify({ teacherId: parseInt(newTeacherId, 10) }),
      });
      setToast({ type: 'success', message: 'Teacher added.' });
      openManage(managing);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add teacher' });
    }
  };

  const removeTeacher = async (teacherId: number) => {
    if (!managing) return;
    if (!window.confirm('Remove this teacher from the session?')) return;
    await api(`/api/admission-sessions/${managing.id}/teachers/${teacherId}`, { method: 'DELETE' });
    openManage(managing);
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
        <h2 className="text-2xl font-bold text-slate-900">Admission Sessions</h2>
        <button onClick={openCreate} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Create Session
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 max-w-2xl rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{editing ? 'Edit Session' : 'Create Session'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Course *</label>
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={inputClass} required>
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Max Students Per Teacher</label>
                <input type="number" min={1} value={form.maxStudentsPerTeacher} onChange={(e) => setForm({ ...form, maxStudentsPerTeacher: parseInt(e.target.value, 10) })} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.studentApplicationEnabled} onChange={(e) => setForm({ ...form, studentApplicationEnabled: e.target.checked })} />
                Student Application
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.teacherApplicationEnabled} onChange={(e) => setForm({ ...form, teacherApplicationEnabled: e.target.checked })} />
                Teacher Application
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No admission sessions found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.courseName}</td>
                  <td className="px-4 py-3 text-slate-600">{s.startDate || '-'} → {s.endDate || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.maxStudentsPerTeacher}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${s.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openManage(s)} className="mr-2 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Teachers</button>
                    <button onClick={() => openEdit(s)} className="mr-2 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {managing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setManaging(null)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">Teachers — {managing.name}</h3>
            <div className="mt-4 flex gap-2">
              <select value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)} className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Select teacher</option>
                {allTeachers.filter((t) => !sessionTeachers.some((st) => st.id === t.id)).map((t) => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
              <button onClick={addTeacher} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Add</button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-2 font-medium">Teacher</th>
                    <th className="px-4 py-2 font-medium">Capacity</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionTeachers.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-2 font-medium text-slate-900">{t.fullName}</td>
                      <td className="px-4 py-2 text-slate-600">{t.currentStudents} / {t.maxStudents ?? 'default'} {t.booked ? '• BOOKED' : ''}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => removeTeacher(t.id)} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setManaging(null)} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

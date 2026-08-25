'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [maxTeachers, setMaxTeachers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    api<{ maxTeachersPerStudent: number }>('/api/admin/settings')
      .then((res) => setMaxTeachers(res.data?.maxTeachersPerStudent ?? 1))
      .catch((err) => setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load settings' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (maxTeachers === null || maxTeachers < 1) {
      setToast({ type: 'error', message: 'Enter a valid teacher limit.' });
      return;
    }
    setSaving(true);
    try {
      await api('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ maxTeachersPerStudent: maxTeachers }),
      });
      setToast({ type: 'success', message: 'Settings saved.' });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      {toast && (
        <div className={`mb-4 rounded-md px-4 py-3 text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Settings</h2>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : (
        <div className="max-w-xl rounded-xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">Maximum teachers per student</label>
          <p className="mt-1 text-sm text-slate-500">Controls how many active teachers each student can be connected to.</p>
          <select
            value={maxTeachers ?? 1}
            onChange={(e) => setMaxTeachers(parseInt(e.target.value, 10))}
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm sm:w-64"
          >
            <option value={1}>1 teacher</option>
            <option value={2}>2 teachers</option>
            <option value={3}>3 teachers</option>
            <option value={4}>4 teachers</option>
            <option value={5}>5 teachers</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </Layout>
  );
}

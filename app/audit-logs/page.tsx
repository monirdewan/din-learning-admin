'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ list: AuditLog[] }>('/api/admin/audit-logs')
      .then((res) => setLogs(res.data?.list || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Audit Logs</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">IP Address</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600">{log.entityType}</td>
                  <td className="px-4 py-3 text-slate-600">{log.description}</td>
                  <td className="px-4 py-3 text-slate-600">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

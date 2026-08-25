'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface Certificate {
  id: number;
  certificateId: string;
  studentId: number;
  studentName: string;
  courseName: string;
  sessionName: string;
  result: string;
  issuedAt: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ list: Certificate[] }>('/api/certificates')
      .then((res) => setCertificates(res.data?.list || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Certificates</h2>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : certificates.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No certificates issued yet.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Certificate ID</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-slate-900">{c.certificateId}</td>
                  <td className="px-4 py-3 text-slate-600">{c.studentName}</td>
                  <td className="px-4 py-3 text-slate-600">{c.courseName}</td>
                  <td className="px-4 py-3 text-slate-600">{c.sessionName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">{c.result}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(c.issuedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

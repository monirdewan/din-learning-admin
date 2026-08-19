'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';

interface ClassPost {
  id: number;
  teacherId: number;
  title: string;
  content: string;
  subject: string;
  classLevel: string;
  visibility: string;
  status: string;
  postType: string;
  createdAt: string;
}

export default function ClassesPage() {
  const [posts, setPosts] = useState<ClassPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    api<{ list: ClassPost[] }>('/api/admin/classes')
      .then((res) => setPosts(res.data?.list || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this class post?')) return;
    await api(`/api/admin/classes/${id}`, { method: 'DELETE' });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Layout>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Class Posts</h2>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="text-slate-500">No class posts found.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Teacher ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Visibility</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{post.title}</td>
                  <td className="px-4 py-3 text-slate-600">{post.teacherId}</td>
                  <td className="px-4 py-3 text-slate-600">{post.postType}</td>
                  <td className="px-4 py-3 text-slate-600">{post.visibility}</td>
                  <td className="px-4 py-3 text-slate-600">{post.status}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(post.id)} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
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

import { dynamic } from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/app/admin/page').then(mod => mod.default), {
  ssr: false,
  loading: () => <div>Loading admin dashboard...</div>
});

export default function AdminPage() {
  return <AdminDashboard />;
}
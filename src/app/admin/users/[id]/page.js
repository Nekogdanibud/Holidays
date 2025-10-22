import UserDetail from '../../../../components/admin/UserDetail';
import AdminLayout from '../../../../components/admin/AdminLayout';

export default async function UserDetailPage({ params }) {
  // Ожидаем параметры
  const { id } = await params;
  
  return (
    <AdminLayout>
      <UserDetail userId={id} />
    </AdminLayout>
  );
}

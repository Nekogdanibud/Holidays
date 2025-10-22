import GroupDetail from '../../../../components/admin/GroupDetail';
import AdminLayout from '../../../../components/admin/AdminLayout';

export default async function GroupDetailPage({ params }) {
  // Ожидаем параметры
  const { id } = await params;
  
  return (
    <AdminLayout>
      <GroupDetail groupId={id} />
    </AdminLayout>
  );
}

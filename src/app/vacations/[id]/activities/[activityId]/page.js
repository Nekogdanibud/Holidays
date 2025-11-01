'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  ActivityHeader,
  ActivityTabs,
  ActivityInfoTab,
  ActivityGalleryTab,
  ActivityParticipantsTab,
  ActivityEditTab
} from '@/components/activities';
import toast from 'react-hot-toast';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isParticipationLoading, setIsParticipationLoading] = useState(false);
  const [userParticipation, setUserParticipation] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [initialForm, setInitialForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerRemoved, setBannerRemoved] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // URL → activeTab
  const urlTab = searchParams.get('tab');
  const validTabs = ['info', 'gallery', 'participants', 'edit'];
  const [activeTab, setActiveTab] = useState('info');

  // canEdit: показываем сразу, если user есть
  const canEdit = useMemo(() => {
    if (!user) return false;
    if (!activity) return true; // ← ВАЖНО: показываем вкладку ДО загрузки
    const isOwner = activity.vacation?.userId === user.id;
    const isCoOrganizer = activity.vacation?.members?.some(
      m => m.userId === user.id && m.role === 'CO_ORGANIZER'
    );
    return isOwner || isCoOrganizer;
  }, [activity, user]);

  // Синхронизация URL → activeTab
  useEffect(() => {
    if (!urlTab) {
      setActiveTab('info');
      return;
    }
    if (validTabs.includes(urlTab) && (urlTab !== 'edit' || canEdit)) {
      setActiveTab(urlTab);
    } else if (urlTab === 'edit' && !canEdit) {
      router.replace('', { scroll: false });
    }
  }, [urlTab, canEdit, router]);

  // Загрузка активности
  useEffect(() => {
    if (params.id && params.activityId) {
      fetchActivity();
    }
  }, [params.id, params.activityId]);

  const fetchActivity = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`/api/activities/${params.activityId}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 404) setError('Активность не найдена');
        else if (response.status === 403) setError('Нет доступа');
        else setError(data.message || 'Ошибка загрузки');
        return;
      }

      const data = await response.json();
      setActivity(data);
      initializeForm(data);
      const userPart = data.participants?.find(p => p.user.id === user?.id);
      setUserParticipation(userPart);
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeForm = (data) => {
    const form = {
      title: data.title || '',
      description: data.description || '',
      date: data.date.split('T')[0],
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      type: data.type,
      status: data.status,
      priority: data.priority,
      cost: data.cost || '',
      notes: data.notes || '',
      locationName: data.location?.name || '',
      locationAddress: data.location?.address || '',
    };
    setEditForm(form);
    setInitialForm(form);
    setBannerFile(null);
    setBannerRemoved(false);
    setBannerPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleParticipation = async (going) => {
    if (isParticipationLoading || !user) return;
    setIsParticipationLoading(true);
    try {
      const response = await fetch(`/api/activities/${params.activityId}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ going }),
        credentials: 'include'
      });

      if (response.ok) {
        const { participation } = await response.json();
        setUserParticipation(participation);
        setActivity(prev => ({
          ...prev,
          participants: prev.participants
            .filter(p => p.user.id !== user.id)
            .concat(participation)
        }));
        toast.success(going ? 'Вы участвуете!' : 'Вы отказались');
      }
    } catch (err) {
      toast.error('Ошибка участия');
    } finally {
      setIsParticipationLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editForm.title.trim()) errors.title = 'Название обязательно';
    if (editForm.cost && (isNaN(editForm.cost) || editForm.cost < 0)) {
      errors.cost = 'Некорректная стоимость';
    }
    const hasName = editForm.locationName.trim();
    const hasAddr = editForm.locationAddress.trim();
    if (hasName && !hasAddr) errors.locationAddress = 'Адрес обязателен';
    if (!hasName && hasAddr) errors.locationName = 'Название места обязательно';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(editForm) !== JSON.stringify(initialForm) ||
           bannerFile || bannerRemoved;
  }, [editForm, initialForm, bannerFile, bannerRemoved]);

  const handleEditSubmit = async () => {
    if (isSaving || !hasChanges) return;
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => formData.append(k, v));
      if (bannerFile) formData.append('bannerImage', bannerFile);
      else if (bannerRemoved) formData.append('bannerImage', 'remove');

      const response = await fetch(`/api/activities/${params.activityId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const updated = await response.json();
        setActivity(updated);
        initializeForm(updated);
        const userPart = updated.participants?.find(p => p.user.id === user?.id);
        setUserParticipation(userPart);
        toast.success('Изменения сохранены!');

        // ОСТАЁМСЯ НА РЕДАКТИРОВАНИИ
        setActiveTab('edit');
        router.push(`?tab=edit`, { scroll: false });
      } else {
        const err = await response.json();
        setFormErrors({ submit: err.message || 'Ошибка сохранения' });
        toast.error('Ошибка сохранения');
      }
    } catch (err) {
      setFormErrors({ submit: 'Ошибка сети' });
      toast.error('Ошибка сети');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'info') {
      router.push('', { scroll: false });
    } else {
      router.push(`?tab=${tab}`, { scroll: false });
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'bannerImage' && files[0]) {
      const file = files[0];
      setBannerFile(file);
      setBannerRemoved(false);
      const reader = new FileReader();
      reader.onload = e => setBannerPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveBanner = () => {
    setBannerRemoved(true);
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelEdit = () => {
    initializeForm(activity);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !activity) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              Error
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h2>
            <p className="text-gray-600 mb-6">{error || 'Активность не найдена'}</p>
            <button 
              onClick={() => router.push(`/vacations/${params.id}`)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
            >
              Назад
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ActivityHeader 
          activity={activity} 
          onBack={() => router.push(`/vacations/${params.id}`)}
          canEdit={canEdit}
        />

        <ActivityTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activity={activity}
          canEdit={canEdit}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'info' && (
            <ActivityInfoTab
              activity={activity}
              userParticipation={userParticipation}
              onParticipation={handleParticipation}
              isParticipationLoading={isParticipationLoading}
            />
          )}

          {activeTab === 'gallery' && (
            <ActivityGalleryTab
              activity={activity}
              vacationId={params.id}
              activityId={params.activityId}
              onRefresh={fetchActivity}
            />
          )}

          {activeTab === 'participants' && (
            <ActivityParticipantsTab
              activity={activity}
              userParticipation={userParticipation}
              onParticipation={handleParticipation}
              isParticipationLoading={isParticipationLoading}
            />
          )}

          {activeTab === 'edit' && canEdit && (
            <ActivityEditTab
              activity={activity}
              editForm={editForm}
              onEditChange={handleEditChange}
              onSave={handleEditSubmit}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
              formErrors={formErrors}
              bannerPreview={bannerPreview}
              onRemoveBanner={handleRemoveBanner}
              hasChanges={hasChanges}
              fileInputRef={fileInputRef}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

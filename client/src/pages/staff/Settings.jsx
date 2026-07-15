import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { User, Lock, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/user.api';
import { settingsApi } from '../../api/settings.api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import '../user/Settings.css';

export default function StaffSettings() {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Staff Settings</h1>
      <div className="settings-grid">
        <StaffProfileForm user={user} />
        <PasswordForm />
      </div>
    </div>
  );
}

function StaffProfileForm({ user }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      nickname: user?.nickname || '',
    },
  });

  const { data: nicknames } = useQuery({
    queryKey: ['nicknames'],
    queryFn: async () => {
      const { data } = await settingsApi.getPublic();
      return data.data?.nicknames || [];
    },
  });

  const nicknameOptions = (nicknames || []).map((n) => ({ value: n, label: n }));

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await userApi.updateProfile(values);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="settings-card-header">
        <User size={20} />
        <h2>Profile</h2>
      </div>
      <form className="settings-form" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full Name" error={errors.fullName?.message} {...register('fullName', { required: 'Required' })} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
        <Input label="Phone" placeholder="09XX XXX XXXX" {...register('phone')} />
        <Select
          label="Nickname / Title"
          options={nicknameOptions}
          placeholder="Select a title"
          {...register('nickname')}
        />
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="settings-card-header">
        <Lock size={20} />
        <h2>Change Password</h2>
      </div>
      <form className="settings-form" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Current Password"
          type="password"
          error={errors.currentPassword?.message}
          {...register('currentPassword', { required: 'Required' })}
        />
        <Input
          label="New Password"
          type="password"
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'Required',
            minLength: { value: 6, message: 'At least 6 characters' },
          })}
        />
        <Input
          label="Confirm New Password"
          type="password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword', {
            required: 'Required',
            validate: (v) => v === newPassword || 'Passwords do not match',
          })}
        />
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</Button>
      </form>
    </Card>
  );
}

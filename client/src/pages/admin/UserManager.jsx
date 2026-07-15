import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Search, Percent } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { settingsApi } from '../../api/settings.api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import './UserManager.css';

export default function UserManager() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [discountTarget, setDiscountTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', role, search, page],
    queryFn: async () => {
      const params = { page, limit: 20 };
      if (role) params.role = role;
      if (search) params.search = search;
      const { data } = await adminApi.getUsers(params);
      return data.data;
    },
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
  }, [queryClient]);

  const handleDelete = async () => {
    try {
      await adminApi.deleteUser(deleteTarget._id);
      toast.success('User deleted');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'fullName', label: 'Name', render: (v, row) => (
      <div className="um-user-cell">
        <strong>{v}</strong>
        <span>{row.email}</span>
      </div>
    )},
    { key: 'role', label: 'Role', render: (v) => (
      <Badge variant={v === 'admin' ? 'accent' : v === 'staff' ? 'info' : 'default'}>{v}</Badge>
    )},
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: '_actions', label: '', width: '140px', render: (_, row) => (
      <div className="um-actions">
        <button className="um-action-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditTarget(row); }}>
          <Pencil size={14} />
        </button>
        <button className="um-action-btn um-action-btn--danger" title="Delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="um-page">
      <div className="um-header">
        <h1 className="um-title">User Manager</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="um-filters">
        <div className="um-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Card padding={false}>
        <div className="um-table-wrap">
          <DataTable
            columns={columns}
            data={users}
            loading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyTitle="No users found"
          />
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <UserFormModal
        open={createOpen || !!editTarget}
        user={editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        onSaved={() => { setCreateOpen(false); setEditTarget(null); refresh(); }}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function UserFormModal({ open, user, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!user;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: user || { role: 'user' },
  });

  const role = watch('role');

  // Reset form when user changes
  useState(() => {
    if (user) {
      reset(user);
    } else {
      reset({ role: 'user' });
    }
  }, [user]);

  const { data: nicknames } = useQuery({
    queryKey: ['nicknames'],
    queryFn: async () => {
      const { data } = await settingsApi.getPublic();
      return data.data?.nicknames || [];
    },
    enabled: open,
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await adminApi.updateUser(user._id, values);
        toast.success('User updated');
      } else {
        await adminApi.createUser(values);
        toast.success('User created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Create User'}>
      <form className="um-form" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full Name" error={errors.fullName?.message} {...register('fullName', { required: 'Required' })} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
        <Input label="Phone" {...register('phone')} />
        <Select
          label="Role"
          options={[
            { value: 'user', label: 'User' },
            { value: 'staff', label: 'Staff' },
            { value: 'admin', label: 'Admin' },
          ]}
          {...register('role', { required: 'Required' })}
        />
        {role === 'staff' && (
          <Select
            label="Nickname / Title"
            options={(nicknames || []).map((n) => ({ value: n, label: n }))}
            placeholder="Select a title"
            {...register('nickname')}
          />
        )}
        {!isEdit && (
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password', { required: !isEdit ? 'Required' : false, minLength: { value: 6, message: 'Min 6 chars' } })}
          />
        )}
        <div className="um-form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create User')}</Button>
        </div>
      </form>
    </Modal>
  );
}

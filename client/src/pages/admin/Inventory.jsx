import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Scissors, Sparkles, Upload } from 'lucide-react';
import { inventoryApi } from '../../api/inventory.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import { formatMoney } from '../../utils/formatMoney';
import toast from 'react-hot-toast';
import './Inventory.css';

export default function AdminInventory() {
  const [tab, setTab] = useState('services');

  return (
    <div className="inv-page">
      <h1 className="inv-title">Inventory</h1>
      <div className="inv-tabs">
        <button className={`inv-tab ${tab === 'services' ? 'inv-tab--active' : ''}`} onClick={() => setTab('services')}>
          <Scissors size={16} /> Services
        </button>
        <button className={`inv-tab ${tab === 'extras' ? 'inv-tab--active' : ''}`} onClick={() => setTab('extras')}>
          <Sparkles size={16} /> Extras
        </button>
      </div>
      {tab === 'services' ? <ServicesTab /> : <ExtrasTab />}
    </div>
  );
}

function ServicesTab() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ['adminServices'],
    queryFn: async () => {
      const { data } = await inventoryApi.getServices();
      return data.data;
    },
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['adminServices'] });
    queryClient.invalidateQueries({ queryKey: ['publicSettings'] });
  }, [queryClient]);

  const handleDelete = async () => {
    try {
      await inventoryApi.deleteService(deleteTarget._id);
      toast.success('Service deleted');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggle = async (svc) => {
    try {
      const fd = new FormData();
      fd.append('isActive', !svc.isActive);
      await inventoryApi.updateService(svc._id, fd);
      toast.success(svc.isActive ? 'Service hidden' : 'Service activated');
      refresh();
    } catch (err) {
      toast.error('Toggle failed');
    }
  };

  if (isLoading) return <div className="inv-loading"><Spinner size={28} /></div>;

  return (
    <>
      <div className="inv-toolbar">
        <span className="inv-count">{services?.length || 0} services</span>
        <Button size="sm" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus size={16} /> Add Service
        </Button>
      </div>

      <div className="inv-grid">
        {services?.map((svc) => {
          const imgSrc = svc.image || null;
          return (
            <Card key={svc._id} className={`inv-card ${!svc.isActive ? 'inv-card--inactive' : ''}`}>
              <div className="inv-card-img">
                {imgSrc ? <img src={imgSrc} alt={svc.name} /> : <Scissors size={28} strokeWidth={1} />}
              </div>
              <div className="inv-card-body">
                <div className="inv-card-header">
                  <strong>{svc.name}</strong>
                  <span className="inv-card-cat">{svc.category}</span>
                </div>
                <p className="inv-card-price">{formatMoney(svc.price)} · {svc.durationMinutes}min</p>
                {svc.description && <p className="inv-card-desc">{svc.description}</p>}
                <div className="inv-card-actions">
                  <button className="inv-toggle-btn" onClick={() => handleToggle(svc)}>
                    {svc.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button className="inv-action-btn" onClick={() => { setEditTarget(svc); setFormOpen(true); }}>
                    <Pencil size={14} />
                  </button>
                  <button className="inv-action-btn inv-action-btn--danger" onClick={() => setDeleteTarget(svc)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ServiceFormModal
        open={formOpen}
        service={editTarget}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={() => { setFormOpen(false); setEditTarget(null); refresh(); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service"
        message={`Delete "${deleteTarget?.name}"? Existing appointments keep their snapshot.`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}

function ServiceFormModal({ open, service, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const isEdit = !!service;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useState(() => {
    if (service) {
      reset({
        name: service.name,
        category: service.category,
        description: service.description || '',
        price: service.price,
        durationMinutes: service.durationMinutes,
      });
    } else {
      reset({ category: 'haircut', durationMinutes: 30 });
      setImageFile(null);
    }
  }, [service]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', values.name);
      fd.append('category', values.category);
      fd.append('description', values.description || '');
      fd.append('price', values.price);
      fd.append('durationMinutes', values.durationMinutes);
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) {
        await inventoryApi.updateService(service._id, fd);
        toast.success('Service updated');
      } else {
        await inventoryApi.createService(fd);
        toast.success('Service created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Service' : 'Add Service'}>
      <form className="inv-form" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
        <Select
          label="Category"
          options={[
            { value: 'haircut', label: 'Haircut' },
            { value: 'salon', label: 'Salon' },
          ]}
          {...register('category')}
        />
        <Input label="Description" {...register('description')} />
        <Input label="Price (PHP)" type="number" step="0.01" error={errors.price?.message} {...register('price', { required: 'Required', min: { value: 0, message: 'Min 0' } })} />
        <Input label="Duration (minutes)" type="number" error={errors.durationMinutes?.message} {...register('durationMinutes', { required: 'Required', min: { value: 1, message: 'Min 1' } })} />
        <div className="inv-file-input">
          <label className="inv-file-label">
            <Upload size={16} />
            <span>{imageFile ? imageFile.name : 'Upload image (optional)'}</span>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
        </div>
        <div className="inv-form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Save' : 'Create')}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ExtrasTab() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: extras, isLoading } = useQuery({
    queryKey: ['adminExtras'],
    queryFn: async () => {
      const { data } = await inventoryApi.getExtras();
      return data.data;
    },
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['adminExtras'] });
    queryClient.invalidateQueries({ queryKey: ['publicSettings'] });
  }, [queryClient]);

  const handleDelete = async () => {
    try {
      await inventoryApi.deleteExtra(deleteTarget._id);
      toast.success('Extra deleted');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (isLoading) return <div className="inv-loading"><Spinner size={28} /></div>;

  return (
    <>
      <div className="inv-toolbar">
        <span className="inv-count">{extras?.length || 0} extras</span>
        <Button size="sm" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus size={16} /> Add Extra
        </Button>
      </div>

      <div className="inv-extras-list">
        {extras?.map((ext) => (
          <Card key={ext._id} className={`inv-extra-card ${!ext.isActive ? 'inv-extra-card--inactive' : ''}`}>
            <div className="inv-extra-info">
              <strong>{ext.name}</strong>
              <span>{formatMoney(ext.price)} · {ext.durationMinutes || 0}min</span>
            </div>
            <div className="inv-card-actions">
              <button className="inv-action-btn" onClick={() => { setEditTarget(ext); setFormOpen(true); }}>
                <Pencil size={14} />
              </button>
              <button className="inv-action-btn inv-action-btn--danger" onClick={() => setDeleteTarget(ext)}>
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <ExtraFormModal
        open={formOpen}
        extra={editTarget}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={() => { setFormOpen(false); setEditTarget(null); refresh(); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Extra"
        message={`Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}

function ExtraFormModal({ open, extra, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!extra;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useState(() => {
    if (extra) {
      reset({ name: extra.name, price: extra.price, durationMinutes: extra.durationMinutes || 0 });
    } else {
      reset({ durationMinutes: 0 });
    }
  }, [extra]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await inventoryApi.updateExtra(extra._id, values);
        toast.success('Extra updated');
      } else {
        await inventoryApi.createExtra(values);
        toast.success('Extra created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Extra' : 'Add Extra'}>
      <form className="inv-form" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
        <Input label="Price (PHP)" type="number" step="0.01" error={errors.price?.message} {...register('price', { required: 'Required', min: { value: 0, message: 'Min 0' } })} />
        <Input label="Duration (minutes)" type="number" {...register('durationMinutes')} />
        <div className="inv-form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Save' : 'Create')}</Button>
        </div>
      </form>
    </Modal>
  );
}

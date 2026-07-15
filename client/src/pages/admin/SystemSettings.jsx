import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Globe, Clock, Tag, MapPin, Plus, X } from 'lucide-react';
import { settingsApi } from '../../api/settings.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import './SystemSettings.css';

const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

export default function SystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const { data } = await settingsApi.getSettings();
      return data.data;
    },
  });

  if (isLoading) return <div className="sys-loading"><Spinner size={32} /></div>;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['adminSettings', 'publicSettings'] });

  return (
    <div className="sys-page">
      <h1 className="sys-title">System Settings</h1>
      <div className="sys-grid">
        <ModeSection settings={settings} onSaved={refresh} />
        <GeneralSection settings={settings} onSaved={refresh} />
        <HoursSection settings={settings} onSaved={refresh} />
        <NicknameSection settings={settings} onSaved={refresh} />
        <ShopInfoSection settings={settings} onSaved={refresh} />
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <Card>
      <div className="sys-section-header">
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function ModeSection({ settings, onSaved }) {
  const [mode, setMode] = useState(settings?.systemMode || 'online');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsApi.updateSettings({ systemMode: mode });
      toast.success('System mode updated');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const modeInfo = {
    online: 'Everyone can access the system.',
    maintenance: 'Only admin and staff can log in. Users see a maintenance screen.',
    offline: 'Only admin can log in. Staff and users are blocked.',
  };

  return (
    <SectionCard icon={Settings} title="System Mode">
      <div className="sys-mode-grid">
        {['online', 'maintenance', 'offline'].map((m) => (
          <button
            key={m}
            type="button"
            className={`sys-mode-btn ${mode === m ? 'sys-mode-btn--active' : ''} sys-mode-btn--${m}`}
            onClick={() => setMode(m)}
          >
            <span className="sys-mode-name">{m}</span>
          </button>
        ))}
      </div>
      <p className="sys-mode-info">{modeInfo[mode]}</p>
      <Button size="sm" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Mode'}</Button>
    </SectionCard>
  );
}

function GeneralSection({ settings, onSaved }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settings) {
      reset({
        timezone: settings.timezone || 'Asia/Manila',
        region: settings.region || 'PH',
        country: settings.country || 'PH',
        currency: settings.currency || 'PHP',
        taxRate: settings.taxRate || 0,
        slotStepMinutes: settings.slotStepMinutes || 30,
      });
    }
  }, [settings]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await settingsApi.updateSettings(values);
      toast.success('Settings saved');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard icon={Globe} title="General">
      <form className="sys-form" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Timezone" {...register('timezone')} />
        <div className="sys-form-row">
          <Input label="Region" {...register('region')} />
          <Input label="Country" {...register('country')} />
        </div>
        <div className="sys-form-row">
          <Input label="Currency" {...register('currency')} />
          <Input label="Tax Rate" type="number" step="0.01" {...register('taxRate')} />
        </div>
        <Input label="Slot Step (minutes)" type="number" {...register('slotStepMinutes')} />
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </form>
    </SectionCard>
  );
}

function HoursSection({ settings, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState({});

  useEffect(() => {
    if (settings?.storeHours) {
      setHours(settings.storeHours);
    }
  }, [settings]);

  const updateDay = (day, field, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsApi.updateSettings({ storeHours: hours });
      toast.success('Store hours saved');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard icon={Clock} title="Store Hours">
      <div className="sys-hours-grid">
        {WEEK_DAYS.map((day) => {
          const h = hours[day] || {};
          return (
            <div key={day} className="sys-hours-row">
              <label className="sys-hours-day">
                <input
                  type="checkbox"
                  checked={!h.closed}
                  onChange={(e) => updateDay(day, 'closed', !e.target.checked)}
                />
                {DAY_LABELS[day]}
              </label>
              {!h.closed && (
                <div className="sys-hours-times">
                  <input type="time" value={h.open || '09:00'} onChange={(e) => updateDay(day, 'open', e.target.value)} />
                  <span>to</span>
                  <input type="time" value={h.close || '20:00'} onChange={(e) => updateDay(day, 'close', e.target.value)} />
                </div>
              )}
              {h.closed && <span className="sys-hours-closed">Closed</span>}
            </div>
          );
        })}
      </div>
      <Button size="sm" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Hours'}</Button>
    </SectionCard>
  );
}

function NicknameSection({ settings, onSaved }) {
  const [nicknames, setNicknames] = useState([]);
  const [newNick, setNewNick] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings?.nicknames) setNicknames(settings.nicknames);
  }, [settings]);

  const handleAdd = async () => {
    if (!newNick.trim()) return;
    setLoading(true);
    try {
      await settingsApi.addNickname(newNick.trim());
      setNicknames((prev) => [...prev, newNick.trim()]);
      setNewNick('');
      toast.success('Nickname added');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (nick) => {
    try {
      await settingsApi.deleteNickname(nick);
      setNicknames((prev) => prev.filter((n) => n !== nick));
      toast.success('Nickname removed');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed');
    }
  };

  return (
    <SectionCard icon={Tag} title="Staff Nicknames">
      <div className="sys-nicks-list">
        {nicknames.map((nick) => (
          <span key={nick} className="sys-nick-chip">
            {nick}
            <button onClick={() => handleRemove(nick)}><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="sys-nick-add">
        <input
          type="text"
          placeholder="New nickname"
          value={newNick}
          onChange={(e) => setNewNick(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd} disabled={loading || !newNick.trim()}>
          <Plus size={14} /> Add
        </Button>
      </div>
    </SectionCard>
  );
}

function ShopInfoSection({ settings, onSaved }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settings?.shopInfo) {
      reset({
        shopName: settings.shopInfo.name || '',
        tagline: settings.shopInfo.tagline || '',
        phone: settings.shopInfo.phone || '',
        email: settings.shopInfo.email || '',
        address: settings.shopInfo.address || '',
        mapEmbedUrl: settings.shopInfo.mapEmbedUrl || '',
        facebook: settings.shopInfo.socials?.facebook || '',
        instagram: settings.shopInfo.socials?.instagram || '',
        tiktok: settings.shopInfo.socials?.tiktok || '',
      });
    }
  }, [settings]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await settingsApi.updateSettings({
        shopInfo: {
          name: values.shopName,
          tagline: values.tagline,
          phone: values.phone,
          email: values.email,
          address: values.address,
          mapEmbedUrl: values.mapEmbedUrl,
          socials: {
            facebook: values.facebook,
            instagram: values.instagram,
            tiktok: values.tiktok,
          },
        },
      });
      toast.success('Shop info saved');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard icon={MapPin} title="Shop Info">
      <form className="sys-form" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Shop Name" {...register('shopName')} />
        <Input label="Tagline" {...register('tagline')} />
        <div className="sys-form-row">
          <Input label="Phone" {...register('phone')} />
          <Input label="Email" type="email" {...register('email')} />
        </div>
        <Input label="Address" {...register('address')} />
        <Input label="Map Embed URL" {...register('mapEmbedUrl')} />
        <Input label="Facebook URL" {...register('facebook')} />
        <Input label="Instagram URL" {...register('instagram')} />
        <Input label="TikTok URL" {...register('tiktok')} />
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Save Shop Info'}</Button>
      </form>
    </SectionCard>
  );
}

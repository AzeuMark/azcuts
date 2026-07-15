import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, DollarSign, Calendar, Users, TrendingUp, Download } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import { LineChartPanel, BarChartPanel, PieChartPanel } from '../../components/ChartPanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatMoney } from '../../utils/formatMoney';
import toast from 'react-hot-toast';
import './Analytics.css';

const RANGES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'all', label: 'All Time' },
];

export default function AdminAnalytics() {
  const [range, setRange] = useState('daily');

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analyticsSummary', range],
    queryFn: async () => {
      const { data } = await analyticsApi.getSummary(range);
      return data.data;
    },
  });

  const { data: sales, isLoading: loadingSales } = useQuery({
    queryKey: ['analyticsSales', range],
    queryFn: async () => {
      const { data } = await analyticsApi.getSales(range);
      return data.data;
    },
  });

  const handleExport = async (format) => {
    try {
      const { data } = await analyticsApi.getReport(range, format);
      if (format === 'csv') {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `azcuts-report-${range}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `azcuts-report-${range}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const isLoading = loadingSummary || loadingSales;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics</h1>
        <div className="analytics-export">
          <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
            <Download size={14} /> CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>
            <Download size={14} /> JSON
          </Button>
        </div>
      </div>

      {/* Range Tabs */}
      <div className="analytics-ranges">
        {RANGES.map((r) => (
          <button
            key={r.key}
            className={`analytics-range ${range === r.key ? 'analytics-range--active' : ''}`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="analytics-loading"><Spinner size={32} /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="analytics-kpis">
            <KpiCard icon={DollarSign} label="Total Revenue" value={formatMoney(summary?.totalRevenue || 0)} color="green" />
            <KpiCard icon={Calendar} label="Total Appointments" value={summary?.totalAppointments || 0} color="blue" />
            <KpiCard icon={Users} label="Unique Customers" value={summary?.uniqueCustomers || 0} color="indigo" />
            <KpiCard icon={TrendingUp} label="Avg per Appointment" value={formatMoney(summary?.avgPerAppointment || 0)} color="amber" />
          </div>

          {/* Charts */}
          <div className="analytics-charts">
            {sales?.salesOverTime?.length > 0 && (
              <LineChartPanel
                data={sales.salesOverTime}
                xKey="label"
                yKey="total"
                title="Sales Over Time"
              />
            )}

            {sales?.topServices?.length > 0 && (
              <BarChartPanel
                data={sales.topServices}
                xKey="name"
                yKey="count"
                title="Top Services"
              />
            )}

            {sales?.statusSplit?.length > 0 && (
              <PieChartPanel
                data={sales.statusSplit}
                nameKey="status"
                valueKey="count"
                title="Appointment Status Split"
              />
            )}

            {sales?.revenueByStaff?.length > 0 && (
              <BarChartPanel
                data={sales.revenueByStaff}
                xKey="name"
                yKey="revenue"
                title="Revenue by Staff"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="kpi-card">
      <div className={`kpi-icon kpi-icon--${color}`}>
        <Icon size={22} />
      </div>
      <div className="kpi-body">
        <span className="kpi-value">{value}</span>
        <span className="kpi-label">{label}</span>
      </div>
    </Card>
  );
}

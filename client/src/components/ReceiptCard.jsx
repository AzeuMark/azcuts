import { useRef } from 'react';
import { Scissors, Download } from 'lucide-react';
import { formatMoney } from '../utils/formatMoney';
import { formatDateTime } from '../utils/datetime';
import { downloadReceiptPng } from '../utils/receiptPng';
import { STATUS_LABELS } from '../utils/constants';
import Button from './ui/Button';
import './ReceiptCard.css';

export default function ReceiptCard({ appointment }) {
  const ref = useRef(null);
  const snap = appointment.priceSnapshot || {};

  return (
    <div className="receipt-wrap">
      <div className="receipt" ref={ref}>
        <div className="receipt-header">
          <Scissors size={24} />
          <h2>AzCuts</h2>
        </div>

        <div className="receipt-meta">
          <div className="receipt-meta-row">
            <span>Receipt No.</span>
            <strong>{appointment.receiptNo}</strong>
          </div>
          <div className="receipt-meta-row">
            <span>Date</span>
            <span>{formatDateTime(appointment.createdAt)}</span>
          </div>
          <div className="receipt-meta-row">
            <span>Status</span>
            <span className={`receipt-status receipt-status--${appointment.status}`}>
              {STATUS_LABELS[appointment.status] || appointment.status}
            </span>
          </div>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-section">
          <h4>Service</h4>
          <p>{appointment.service?.name || '—'}</p>
        </div>

        {appointment.extras?.length > 0 && (
          <div className="receipt-section">
            <h4>Extras</h4>
            <ul className="receipt-extras">
              {appointment.extras.map((ext, i) => (
                <li key={ext._id || i}>
                  <span>{ext.name || snap.extras?.[i]?.name}</span>
                  <span>{formatMoney(snap.extras?.[i]?.price || ext.price || 0)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="receipt-section">
          <h4>Schedule</h4>
          <p>{formatDateTime(appointment.scheduledStart)}</p>
        </div>

        <div className="receipt-section">
          <h4>Staff</h4>
          <p>{appointment.assignedStaff?.fullName || 'Pending assignment'}</p>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-totals">
          <div className="receipt-total-row">
            <span>Subtotal</span>
            <span>{formatMoney(snap.subtotal || 0)}</span>
          </div>
          {snap.discountPercent > 0 && (
            <div className="receipt-total-row receipt-total-row--discount">
              <span>Discount ({snap.discountPercent}%)</span>
              <span>-{formatMoney(snap.discountAmount || 0)}</span>
            </div>
          )}
          {snap.taxAmount > 0 && (
            <div className="receipt-total-row">
              <span>Tax</span>
              <span>{formatMoney(snap.taxAmount || 0)}</span>
            </div>
          )}
          <div className="receipt-total-row receipt-total-row--final">
            <strong>Total</strong>
            <strong>{formatMoney(snap.total || 0)}</strong>
          </div>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-section">
          <h4>Payment</h4>
          <p style={{ textTransform: 'uppercase' }}>{appointment.paymentMethod || 'Cash'}</p>
        </div>

        <div className="receipt-footer">
          <p>Thank you for choosing AzCuts!</p>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => downloadReceiptPng(ref.current, `${appointment.receiptNo}.png`)}
        className="receipt-download-btn"
      >
        <Download size={16} /> Download PNG
      </Button>
    </div>
  );
}

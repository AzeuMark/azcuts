import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    byRole: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, unique: true, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    extras: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Extra' }],
    priceSnapshot: {
      base: { type: Number, default: 0 },
      extras: [{ id: mongoose.Schema.Types.ObjectId, name: String, price: Number }],
      subtotal: { type: Number, default: 0 },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      taxRate: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      currency: { type: String, default: 'PHP' },
    },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_service', 'done', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],
    paymentMethod: { type: String, enum: ['cash', 'gcash'], default: 'cash' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    cancelReason: { type: String },
    cancelledBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String },
    },
    rating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' },
      ratedAt: { type: Date },
    },
    autoAssigned: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

appointmentSchema.index({ customer: 1, createdAt: -1 });
appointmentSchema.index({ assignedStaff: 1, scheduledStart: 1 });
appointmentSchema.index({ status: 1, scheduledStart: 1 });

export default mongoose.model('Appointment', appointmentSchema);

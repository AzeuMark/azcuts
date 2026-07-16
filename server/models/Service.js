import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['haircut', 'salon'], default: 'haircut' },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, default: 30, min: 1 },
    image: { type: String, default: '' },
    imageData: { type: Buffer, select: false },
    imageContentType: { type: String, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1, isActive: 1 });

export default mongoose.model('Service', serviceSchema);

import mongoose from 'mongoose';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const AES_KEY = process.env.AES_KEY || 'azeumark';
const IV_LENGTH = 16;

const encrypt = (text) => { 
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(AES_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(AES_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    nickname: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'inactive', 'in_service'], default: 'active' },
    isApproved: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    totalServed: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = encrypt(this.password);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return decrypt(this.password) === candidatePassword;
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export { encrypt, decrypt };
export default mongoose.model('User', userSchema);

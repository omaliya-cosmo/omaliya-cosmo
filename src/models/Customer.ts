import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String },
  password_hash: { type: String, required: true },
  address: { type: String },
  country: { type: String },
  is_registered: { type: Boolean, default: false },
  registered_date: { type: Date },
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
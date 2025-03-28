import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true }
  }],
  order_date: { type: Date, default: Date.now },
  delivered_date: Date,
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'delivered', 'returned', 'cancelled'], default: 'pending' },
  notes: String,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../lib/db';
import Cart from '../../models/Cart';
import Product from '../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getSession({ req });
    const userId = session?.user?.id || 'guest';

    // Connect to database
    await connectDB();

    // Find user's cart or create an empty one
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: Product,
      select: 'name price image category_id',
    });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    // Transform the data to match the frontend CartItem interface
    const items = cart.items.map((item: { _id: string; productId: { _id: string; name: string; price: number; image: string; category_id: string }; quantity: number }) => ({
      _id: item._id.toString(),
      productId: item.productId._id.toString(),
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.image,
      category_id: item.productId.category_id,
    }));

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ message: 'Failed to fetch cart' });
  }
}
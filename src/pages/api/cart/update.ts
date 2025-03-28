import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../../lib/db';
import Cart from '../../../models/Cart';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get request data
    const { itemId, quantity } = req.body;

    if (!itemId || typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Get user session
    const session = await getSession({ req });
    const userId = session?.user?.id || 'guest';

    // Connect to database
    await connectDB();

    // Update the item quantity
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, 'items._id': itemId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: 'Cart or item not found' });
    }

    return res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ message: 'Failed to update cart' });
  }
}
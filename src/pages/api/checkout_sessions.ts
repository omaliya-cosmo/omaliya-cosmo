import type { NextApiRequest, NextApiResponse } from 'next';
import { CheckoutItem } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { items } = req.body as { items: CheckoutItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty cart items' });
    }

    // Simulate payment processing (e.g., delay to mimic network call)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate a dummy session ID
    const sessionId = `dummy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Simulate successful payment
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log(`Dummy payment processed: $${total.toFixed(2)} for ${items.length} items`);

    return res.status(200).json({
      id: sessionId,
      success: true,
      message: 'Payment processed successfully (dummy gateway)',
    });
  } catch (error) {
    console.error('Dummy payment error:', error);
    return res.status(500).json({ error: 'Failed to process payment' });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db';
import PromoCode from '../../../models/PromoCode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get request data
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Valid promo code is required' });
    }

    // Connect to database
    await connectDB();

    // Find the promo code (case insensitive)
    const promo = await PromoCode.findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') },
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid or expired promo code' });
    }

    // Return discount information
    return res.status(200).json({
      message: 'Promo code applied successfully',
      discount: promo.discountAmount,
      discountType: promo.discountType, // 'percentage' or 'fixed'
      code: promo.code,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return res.status(500).json({ message: 'Failed to validate promo code' });
  }
}
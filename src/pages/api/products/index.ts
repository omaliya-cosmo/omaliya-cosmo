import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import { Product } from '../../../types';

const mockProducts: Product[] = [
  { _id: '1', name: 'Lipstick', price: 15.99, category_id: 'cosmetics' },
  { _id: '2', name: 'Foundation', price: 25.99, category_id: 'cosmetics' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    return res.status(200).json(mockProducts);
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  currency: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function ProfileOrders({ userData }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, processing, delivered, canceled

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/orders');
        // const data = await response.json();
        
        // Using dummy data for demo purposes
        const dummyData: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-12345',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            status: 'delivered',
            total: 89.99,
            currency: 'USD',
            items: [
              { id: '1', productName: 'Vitamin C Serum', quantity: 1, price: 39.99 },
              { id: '2', productName: 'Hyaluronic Acid Moisturizer', quantity: 2, price: 24.99 }
            ]
          },
          {
            id: '2',
            orderNumber: 'ORD-12346',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            status: 'processing',
            total: 65.50,
            currency: 'USD',
            items: [
              { id: '3', productName: 'Retinol Night Cream', quantity: 1, price: 65.50 }
            ]
          },
          {
            id: '3',
            orderNumber: 'ORD-12347',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            status: 'canceled',
            total: 120.00,
            currency: 'USD',
            items: [
              { id: '4', productName: 'Complete Skincare Set', quantity: 1, price: 120.00 }
            ]
          }
        ];
        
        setOrders(dummyData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">My Orders</h2>
      </div>

      {/* Tab selector */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-grow text-center py-2 px-4 text-sm font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`flex-grow text-center py-2 px-4 text-sm font-medium ${
            activeTab === 'processing'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          Processing
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`flex-grow text-center py-2 px-4 text-sm font-medium ${
            activeTab === 'delivered'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          Delivered
        </button>
        <button
          onClick={() => setActiveTab('canceled')}
          className={`flex-grow text-center py-2 px-4 text-sm font-medium ${
            activeTab === 'canceled'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          Canceled
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200">
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-bold text-gray-700 mr-2">Order #{order.orderNumber}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')} • {order.items.length} item(s) • ${order.total.toFixed(2)}
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link href={`/profile/orders/${order.id}`} className="inline-flex items-center text-sm font-medium text-purple-600">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded-md flex-shrink-0"></div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-700">{item.productName}</p>
                          <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Order Total:</p>
                  <p className="text-base font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                </div>
                {order.status === 'delivered' && (
                  <button className="inline-flex items-center px-3 py-1.5 border border-purple-300 text-xs font-medium rounded-full text-purple-700 bg-white hover:bg-purple-50 focus:outline-none">
                    Buy Again
                  </button>
                )}
                {order.status === 'processing' && (
                  <button className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-full text-red-700 bg-white hover:bg-red-50 focus:outline-none">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
          <div className="mt-6">
            <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none">
              Shop Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
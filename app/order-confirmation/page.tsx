'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCountry } from '../lib/hooks/useCountry';

const OrderConfirmationPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { country } = useCountry();

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('No order ID found');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${orderId}`);
        console.log("API response:", data); // Log the data to see its structure
        if (data.success && data.order) {
          // Transform API data to match our display structure
          const transformedData = {
            orderId: data.order.id,
            date: new Date(data.order.orderDate).toLocaleDateString(),
            status: data.order.status,
            paymentMethod: data.order.notes?.includes('PayHere') ? 'PayHere' : 
                          data.order.notes?.includes('KOKO') ? 'KOKO Payment' : 'Online Payment',
            items: data.order.products?.map(item => ({
              id: item.id,
              name: item.product?.name || 'Product',
              price: country === 'LK' ? (item.product?.priceLKR || 0) : (item.product?.priceUSD || 0),
              quantity: item.quantity || 1,
              image: item.product?.image || '/images/product-placeholder.jpg'
            })) || [],
            subtotal: data.order.total ? data.order.total * 0.93 : 0, // Estimate subtotal as 93% of total
            tax: data.order.total ? data.order.total * 0.07 : 0, // Estimate tax as 7% of total
            shipping: 0,
            total: data.order.total || 0,
            shippingAddress: {
              name: `${data.order.customer?.firstName || ''} ${data.order.customer?.lastName || ''}`,
              address: data.order.customer?.addressLine1 || '',
              city: data.order.customer?.city || '',
              postalCode: data.order.customer?.postalCode || '',
              country: data.order.customer?.country || ''
            }
          };
          setOrderDetails(transformedData);
        } else {
          throw new Error('Invalid order data received');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Unable to fetch order details. Please contact customer support.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, country]);

  // If we don't have actual order data yet, we can use mock data for display
  const mockOrderData = {
    orderId: orderId || 'ORD-12345678',
    date: new Date().toLocaleDateString(),
    status: 'Processing',
    paymentMethod: 'PayHere',
    items: [
      {
        id: '1',
        name: 'Facial Serum',
        price: country === 'LK' ? 2500 : 12.99,
        quantity: 1,
        image: '/images/product-placeholder.jpg'
      },
      {
        id: '2',
        name: 'Moisturizing Cream',
        price: country === 'LK' ? 3200 : 15.99,
        quantity: 2,
        image: '/images/product-placeholder.jpg'
      }
    ],
    subtotal: country === 'LK' ? 8900 : 44.97,
    tax: country === 'LK' ? 623 : 3.15,
    shipping: 0,
    total: country === 'LK' ? 9523 : 48.12,
    shippingAddress: {
      name: 'Jane Doe',
      address: '123 Main St, Apt 4B',
      city: 'Colombo',
      postalCode: '10100',
      country: 'Sri Lanka'
    }
  };

  const displayData = orderDetails || mockOrderData;
  
  // Make sure we have all required values
  const formatAmount = (amount) => {
    const value = amount || 0;
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading your order confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-6 px-8">
              <h1 className="text-3xl font-bold text-white">Order Error</h1>
            </div>
            
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              
              <Link href="/" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ToastContainer />
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-8 px-8 text-center">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-purple-100">Thank you for your purchase</p>
          </div>
          
          {/* Order Info */}
          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-8 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-lg font-semibold text-gray-800">{displayData.orderId}</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="text-lg font-semibold text-gray-800">{displayData.date}</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {displayData.status}
                </span>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {displayData?.items?.map((item) => (
                  <div key={item.id} className="flex items-center border border-gray-200 rounded-lg p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.image && (
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {country === 'LK' 
                          ? `Rs ${(item.price * item.quantity).toFixed(2)}` 
                          : `$${(item.price * item.quantity).toFixed(2)}`
                        }
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    No items found in this order
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">
                      {country === 'LK' 
                        ? `Rs ${formatAmount(displayData.subtotal)}` 
                        : `$${formatAmount(displayData.subtotal)}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-800">
                      {country === 'LK' 
                        ? `Rs ${formatAmount(displayData.tax)}` 
                        : `$${formatAmount(displayData.tax)}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800">Total</span>
                      <span className="font-bold text-purple-700">
                        {country === 'LK' 
                          ? `Rs ${formatAmount(displayData.total)}` 
                          : `$${formatAmount(displayData.total)}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shipping Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Information</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="font-medium text-gray-800">{displayData.shippingAddress.name}</p>
                <p className="text-gray-600">{displayData.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {displayData.shippingAddress.city}, {displayData.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{displayData.shippingAddress.country}</p>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-800">{displayData.paymentMethod}</p>
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">What's Next?</h3>
              <p className="text-purple-700 mb-4">
                We're preparing your order for shipment. You'll receive an email when your order ships with tracking information.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link 
                  href="/account/orders" 
                  className="inline-flex items-center justify-center px-5 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                >
                  Track Order
                </Link>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
                >
                  Need Help?
                </Link>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Link 
                href="/" 
                className="flex-1 inline-block bg-purple-600 hover:bg-purple-700 text-white text-center font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
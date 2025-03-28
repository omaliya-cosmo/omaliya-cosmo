import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [orderNumber, setOrderNumber] = useState("OM-" + Math.floor(10000 + Math.random() * 90000));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get order details
    if (session_id) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [session_id]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              OMALIYA
            </h1>
            <p className="mt-1 text-sm text-gray-500">PREMIUM COSMETICS</p>
          </Link>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Top header with success message */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-6 px-8 text-center">
            <div className="flex justify-center mb-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-purple-200">Thank you for shopping with Omaliya Cosmetics</p>
          </div>

          {/* Order details */}
          <div className="p-6 md:p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Retrieving your order details...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Order #{orderNumber}</h2>
                  <p className="text-gray-600">A confirmation email has been sent to your email address</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-md font-medium text-gray-800 mb-4">Order Summary</h3>
                  
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">$79.95</span>
                  </div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">$7.20</span>
                  </div>
                  
                  <div className="border-t border-gray-200 my-3"></div>
                  
                  <div className="flex justify-between text-md font-semibold">
                    <span>Total</span>
                    <span>$87.15</span>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-2">Delivery Information</h3>
                      <p className="text-sm text-gray-600 mb-1">Your order will be processed within 24 hours</p>
                      <p className="text-sm text-gray-600">Estimated delivery: <span className="font-medium">April 3 - April 5, 2025</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-8">
                  <Link href="/" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-medium text-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150">
                    Continue Shopping
                  </Link>
                  <Link href="/account/orders" className="bg-white border border-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors">
                    View Order History
                  </Link>
                </div>
              </>
            )}

            {/* Social sharing and session ID hidden for cleaner UX */}
            {session_id && (
              <div className="border-t border-gray-200 pt-6 mt-2">
                <p className="text-xs text-gray-500">Order Reference: {session_id}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Promotional Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Join our Beauty Community</h3>
            <p className="text-gray-600 mb-4">Get 10% off your next order and beauty tips delivered to your inbox</p>
            
            <div className="flex max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-r-lg hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Customer Support Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Questions about your order? <a href="/contact" className="text-purple-600 hover:text-purple-500">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
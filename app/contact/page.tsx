"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

  useEffect(() => {
    // Simple scroll reveal animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeIn');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
    <section className="relative py-24 px-4 bg-[url('/images/contact-bg.jpg')] bg-cover bg-center bg-fixed">
      {/* Overlay with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-600/90 animate-gradient-x"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-float"></div>
      </div>
      
      {/* Content */}
      <div className="relative max-w-6xl mx-auto text-center py-12">
        {/* Breadcrumbs */}
        <nav className="flex justify-center items-center space-x-2 mb-8 reveal">
        <Link href="/" className="text-pink-200 hover:text-white transition-colors">
          Home
        </Link>
        <span className="text-pink-200/70">/</span>
        <span className="text-white">Contact</span>
        </nav>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 reveal">
        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-violet-200 animate-shimmer">Touch</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed mb-10 reveal">
        We'd love to hear from you. Send us a message and our team will respond as soon as possible.
        </p>
        
        {/* Quick contact buttons */}
        <div className="flex flex-wrap justify-center gap-4 reveal">
        <a href="tel:+18005551234" className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all transform hover:-translate-y-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Us
        </a>
        <a href="mailto:info@omaliyacosmo.com" className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all transform hover:-translate-y-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Us
        </a>
        </div>
      </div>
      
      {/* Scroll down indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="reveal">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Send a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p>Your message has been sent successfully! We'll be in touch soon.</p>
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p>There was an error sending your message. Please try again later.</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Return Request">Return Request</option>
                    <option value="Partnership Opportunity">Partnership Opportunity</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-all hover:scale-[1.02] flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800 reveal">Contact Information</h2>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl shadow-lg reveal">
                <div className="space-y-8">
                  {/* Location */}
                  <div className="flex items-start">
                    <div className="bg-white p-3 rounded-full shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Our Location</h3>
                      <p className="text-gray-600">
                        123 Beauty Avenue, Suite 200<br />
                        New York, NY 10001<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start">
                    <div className="bg-white p-3 rounded-full shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Email Us</h3>
                      <a href="mailto:info@omaliyacosmo.com" className="text-purple-600 hover:text-purple-800 transition-colors">
                        info@omaliyacosmo.com
                      </a>
                      <p className="text-gray-600 mt-1">
                        For customer support:<br />
                        <a href="mailto:support@omaliyacosmo.com" className="text-purple-600 hover:text-purple-800 transition-colors">
                          support@omaliyacosmo.com
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="flex items-start">
                    <div className="bg-white p-3 rounded-full shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Call Us</h3>
                      <a href="tel:+18005551234" className="text-purple-600 hover:text-purple-800 transition-colors">
                        +1 (800) 555-1234
                      </a>
                      <p className="text-gray-600 mt-1">
                        Mon-Fri: 9:00 AM - 6:00 PM EST<br />
                        Sat: 10:00 AM - 4:00 PM EST
                      </p>
                    </div>
                  </div>
                  
                  {/* Social Media */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Connect With Us</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="bg-white p-3 rounded-full shadow-md hover:shadow-lg transform transition hover:-translate-y-1">
                        <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                        </svg>
                      </a>
                      <a href="#" className="bg-white p-3 rounded-full shadow-md hover:shadow-lg transform transition hover:-translate-y-1">
                        <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                      <a href="#" className="bg-white p-3 rounded-full shadow-md hover:shadow-lg transform transition hover:-translate-y-1">
                        <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </a>
                      <a href="#" className="bg-white p-3 rounded-full shadow-md hover:shadow-lg transform transition hover:-translate-y-1">
                        <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="mt-8 rounded-xl overflow-hidden shadow-lg reveal">
                <div className="relative h-80 bg-gray-200">
                  <Image
                    src="/map-placeholder.jpg"
                    alt="Office Location Map"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML = `
                        <div class="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-pink-100">
                          <div class="text-center p-6">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-purple-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p class="text-lg font-medium text-gray-800">Omaliya Cosmo Headquarters</p>
                            <p class="text-sm text-gray-600">123 Beauty Avenue, New York, NY</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-800 reveal">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                question: "What are your shipping options and delivery times?",
                answer: "We offer standard shipping (5-7 business days), expedited shipping (2-3 business days), and overnight delivery options. Delivery times may vary depending on your location. International shipping is available to select countries."
              },
              {
                question: "Do you offer samples with orders?",
                answer: "Yes! Orders over $50 qualify for two free samples of your choice. You can select your samples at checkout from our available selection."
              },
              {
                question: "What is your return policy?",
                answer: "We accept returns within 30 days of purchase for unused and unopened products. Please contact our customer service team to initiate a return or exchange."
              },
              {
                question: "Are your products cruelty-free and vegan?",
                answer: "All of our products are cruelty-free. Most products are vegan, but some may contain ingredients like honey or beeswax. Vegan products are clearly labeled on our website."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md text-left reveal"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 reveal">
            <p className="text-lg text-gray-700 mb-4">Still have questions?</p>
            <Link
              href="/faq"
              className="px-6 py-3 bg-white text-purple-700 font-medium rounded-lg shadow-md hover:shadow-lg border border-purple-200 transition-all hover:bg-purple-50"
            >
              Visit our full FAQ page
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-purple-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 reveal">Stay Updated</h2>
          <p className="text-xl text-gray-600 mb-8 reveal">Subscribe to our newsletter for the latest product updates, beauty tips, and exclusive offers.</p>
          
          <form className="flex flex-col md:flex-row gap-4 reveal">
            <input
              type="email"
              className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Your email address"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition hover:scale-105"
            >
              Subscribe
            </button>
          </form>
          
          <p className="mt-4 text-sm text-gray-500 reveal">By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.</p>
        </div>
      </section>
    </main>
  );
}
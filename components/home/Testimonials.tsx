import React, { useState } from 'react';
import Image from 'next/image';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Samantha Lee',
      location: 'Colombo, Sri Lanka',
      image: '/images/testimonials/customer-1.jpg',
      quote: 'Ive been using the Miracle Glow Serum for just three weeks and my skin is already transformed! My dark spots have faded and my friends keep asking what Im doing differently.',
      rating: 5,
      product: 'Miracle Glow Serum'
    },
    {
      id: 2,
      name: 'Michelle Taylor',
      location: 'New York, USA',
      image: '/images/testimonials/customer-2.jpg',
      quote: 'As someone with sensitive skin, Ive always struggled to find products that dont cause irritation. The Gentle Cleansing Balm is a game-changer - it removes all my makeup without any redness or reaction.',
      rating: 5,
      product: 'Gentle Cleansing Balm'
    },
    {
      id: 3,
      name: 'Priya Sharma',
      location: 'Mumbai, India',
      image: '/images/testimonials/customer-3.jpg',
      quote: 'The Hydrating Night Cream has completely eliminated my dry patches, even in air-conditioned environments. I wake up with plump, moisturized skin every morning. Worth every penny!',
      rating: 4,
      product: 'Hydrating Night Cream'
    },
    {
      id: 4,
      name: 'David Chen',
      location: 'Singapore',
      image: '/images/testimonials/customer-4.jpg',
      quote: 'My wife bought me the Mens Essentials Kit and I was skeptical at first. Now Im a convert! My skin feels healthier and the products are simple to use - perfect for my minimal skincare routine.',
      rating: 5,
      product: 'Mens Essentials Kit'
    }
  ];

  const handlePrev = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i}
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real results from real people. Discover how Omaliya products have transformed our customers' skincare routines.
          </p>
        </div>

        {/* Large Quote Mark */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -top-6 -left-4 text-purple-200 opacity-50">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.9999 14.1999H6.9999C6.9999 9.99993 8.9999 8.99993 10.1999 8.39993C10.4999 8.19993 10.7999 7.99993 10.7999 7.69993C10.7999 7.49993 10.6999 7.19993 10.4999 6.99993C9.7999 6.39993 8.3999 6.09993 6.8999 6.89993C5.9999 7.39993 4.9999 8.39993 4.9999 10.1999V16.7999C4.9999 17.9999 5.9999 18.9999 7.1999 18.9999H11.9999C13.0999 18.9999 13.9999 18.0999 13.9999 16.9999C13.9999 15.8999 13.0999 14.1999 11.9999 14.1999Z" />
              <path d="M19.9999 14.1999H14.9999C14.9999 9.99993 16.9999 8.99993 18.1999 8.39993C18.4999 8.19993 18.7999 7.99993 18.7999 7.69993C18.7999 7.49993 18.6999 7.19993 18.4999 6.99993C17.7999 6.39993 16.3999 6.09993 14.8999 6.89993C13.9999 7.39993 12.9999 8.39993 12.9999 10.1999V16.7999C12.9999 17.9999 13.9999 18.9999 15.1999 18.9999H19.9999C21.0999 18.9999 21.9999 18.0999 21.9999 16.9999C21.9999 15.8999 21.0999 14.1999 19.9999 14.1999Z" />
            </svg>
          </div>

          {/* Testimonial Slider */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              {/* Image Side */}
              <div className="md:w-1/3 relative bg-gradient-to-br from-purple-100 to-pink-100 hidden md:block">
                <div className="absolute inset-0">
                  <Image
                    src={testimonials[activeIndex].image || "/images/testimonials/default-avatar.jpg"}
                    alt={testimonials[activeIndex].name}
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Content Side */}
              <div className="md:w-2/3 p-8">
                <div className="flex items-center mb-4">
                  {/* Mobile Image */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 md:hidden">
                    <Image
                      src={testimonials[activeIndex].image || "/images/testimonials/default-avatar.jpg"}
                      alt={testimonials[activeIndex].name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {testimonials[activeIndex].name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {testimonials[activeIndex].location}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-6">
                  {renderStars(testimonials[activeIndex].rating)}
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 italic leading-relaxed">
                    "{testimonials[activeIndex].quote}"
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium">
                    Product:
                  </span>
                  <span className="text-sm text-purple-600 ml-2">
                    {testimonials[activeIndex].product}
                  </span>
                </div>
                
                {/* Navigation Dots */}
                <div className="flex items-center justify-between mt-8">
                  <div className="flex space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === activeIndex ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-full bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600 transition-colors"
                      aria-label="Previous testimonial"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-full bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600 transition-colors"
                      aria-label="Next testimonial"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">2,500+</div>
            <p className="text-gray-600 text-sm">Happy Customers</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
            <p className="text-gray-600 text-sm">Average Rating</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <p className="text-gray-600 text-sm">Would Recommend</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">30-Day</div>
            <p className="text-gray-600 text-sm">Money-Back Guarantee</p>
          </div>
        </div>
      </div>
    </section>
  );
}
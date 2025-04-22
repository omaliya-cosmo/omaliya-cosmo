"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  // Fetch necessary data for header
  useEffect(() => {
    // Simple scroll reveal animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("opacity-0");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center bg-fixed">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-pink-600/80 backdrop-filter backdrop-blur-sm"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight reveal">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-violet-200 animate-pulse">
              Omaliya Cosmo
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed reveal"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            We are dedicated to bringing you the finest cosmetic products that
            enhance your natural beauty while caring for your skin with
            science-backed formulations.
          </p>
          <div
            className="mt-12 reveal"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-purple-800 bg-white rounded-full shadow-xl hover:bg-purple-50 transition duration-300 transform hover:scale-105 hover:shadow-pink-300/30"
            >
              Discover Our Products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2 animate-bounce"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {[
            { number: "10+", label: "Years Experience", color: "purple" },
            { number: "50+", label: "Products", color: "pink" },
            { number: "99%", label: "Customer Satisfaction", color: "blue" },
            { number: "20+", label: "Countries", color: "pink" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${stat.color}-100 flex items-center justify-center group-hover:bg-${stat.color}-200 transition-colors duration-300`}
              >
                <span className={`text-2xl font-bold text-${stat.color}-500`}>
                  {stat.number.charAt(0)}
                </span>
              </div>
              <p
                className={`text-4xl font-black text-${stat.color}-600 mb-2 transition-transform duration-500 group-hover:scale-110`}
              >
                {stat.number}
              </p>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="mb-8 inline-block">
                <span className="text-sm uppercase tracking-wider text-purple-600 font-semibold">
                  Our journey
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold mb-2 text-gray-800 relative reveal">
                  Our Story
                </h2>
                <span className="block w-20 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></span>
              </div>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed reveal">
                Omaliya was founded in 2020 with a vision to make quality and
                stylish products accessible to everyone. What began as a small
                online store quickly grew into a trusted name in eCommerce,
                thanks to our commitment to customer satisfaction and attention
                to detail.
              </p>
              <p className="text-xl text-gray-600 leading-relaxed reveal">
                Driven by passion and inspired by our community, we continue to
                evolve—expanding our collections, improving our service, and
                staying true to our values. At Omaliya, every product tells a
                story, and we’re proud to be part of yours.
              </p>
              <div className="mt-10 flex items-center p-4 rounded-xl bg-white shadow-lg max-w-md reveal">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0">
                  {/* Replace with actual founder image */}
                  <Image
                    src="/founder.jpg"
                    alt="Jane Smith, Founder"
                    width={64}
                    height={64}
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23f3e8ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%238b5cf6'%3EJS%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">Jane Smith</p>
                  <p className="text-purple-600 font-medium">Founder & CEO</p>
                  <div className="flex mt-2 space-x-2">
                    <a
                      href="#"
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative reveal">
                <div className="rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
                  <div className="relative h-96 w-full bg-gradient-to-tr from-purple-200 to-pink-200">
                    <Image
                      src="https://res.cloudinary.com/omaliya/image/upload/v1745244828/happy-customer_m0groh.jpg"
                      alt="Omaliya Cosmo Company"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-pink-500 rounded-xl -z-10 animate-pulse"></div>
                <div className="absolute -top-5 -right-5 w-20 h-20 bg-purple-500 rounded-full -z-10 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-24 px-4 bg-purple-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-800 reveal">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto reveal">
            We're committed to creating products that not only make you look
            beautiful but also support your skin's health naturally.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-2xl shadow-lg transform transition duration-500 hover:-translate-y-2 hover:shadow-xl reveal">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Quality
              </h3>
              <p className="text-gray-600 text-lg">
                We are committed to creating products of the highest quality
                that deliver on their promises, using only premium ingredients.
              </p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-lg transform transition duration-500 hover:-translate-y-2 hover:shadow-xl reveal">
              <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Sustainability
              </h3>
              <p className="text-gray-600 text-lg">
                We strive to minimize our environmental footprint through
                sustainable practices, ethical sourcing and eco-friendly
                packaging.
              </p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-lg transform transition duration-500 hover:-translate-y-2 hover:shadow-xl reveal">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Inclusivity
              </h3>
              <p className="text-gray-600 text-lg">
                We create products for everyone, embracing diversity and
                catering to all skin types, tones, and beauty preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 reveal">
              Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto reveal">
              Meet the talented individuals behind Omaliya Cosmo who work
              tirelessly to bring your beauty dreams to life.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-10">
            {[
              {
                name: "Kasun Shaluka",
                position: "CEO / Founder",
                image: "/team1.jpg",
              },
              {
                name: "Pamodani Hansika",
                position: "Co Founder",
                image: "/team2.jpg",
              },
            ].map((member, index) => (
              <div key={index} className="group reveal">
                <div className="bg-purple-50 rounded-2xl p-6 text-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100 group-hover:shadow-xl">
                  <div className="w-48 h-48 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white shadow-md group-hover:shadow-lg transition-all duration-300">
                    {/* Team member image placeholder */}
                    <div className="bg-gradient-to-tr from-purple-300 to-pink-300 h-full w-full flex items-center justify-center text-white font-medium">
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-1 group-hover:text-purple-700">
                    {member.name}
                  </h3>
                  <p className="text-purple-600 font-medium mb-3">
                    {member.position}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16 reveal">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                text: "Omaliya's products have completely elevated my self-care routine. I've never felt more refreshed!",
                name: "Nadeesha K.",
                location: "Colombo",
              },
              {
                text: "I love that these products are eco-friendly and genuinely effective. I've seen such a positive change!",
                name: "Tharindu S.",
                location: "Kandy",
              },
              {
                text: "Finally found products that suit me perfectly. Thank you for understanding real needs!",
                name: "Dilani R.",
                location: "Galle",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg reveal"
              >
                <div className="flex items-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-gray-800">
                    {testimonial.name}
                  </p>
                  <p className="text-purple-600 text-sm">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer World Map Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 reveal">
              Our Global Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto reveal">
              Omaliya Cosmo products are loved by customers around the world.
              Explore our growing global footprint.
            </p>
          </div>

          <div className="relative bg-gradient-to-b from-purple-50 to-pink-50 p-8 rounded-3xl shadow-lg overflow-hidden reveal">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-200 rounded-full opacity-30 blur-2xl"></div>

            {/* World Map SVG */}
            <div className="relative h-[500px] w-full">
              <svg
                viewBox="0 0 1000 500"
                className="w-full h-full"
                style={{
                  filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))",
                }}
              >
                <path
                  d="M181.7,102.4c-2.8,0.4-5.6,0.7-8.5,0.9c-3.2,4.7-8.5,6.5-14.1,4.4c-5.2,0.7-9.8,2.2-8.9,8.9 c-4.9,0.4-4.4,5.5-6.3,8.5c-3.2,0.5-4.1,2.2-3.5,5.6c-1.4,2.5-5.4,0.8-6.4,4.1c-3.6,0.9-6.9-0.4-10.2-1.4c-3.9-1.1-7.4-3.4-11.7-3 c-7.6,0.7-14.1,5.4-21.9,5.1c-0.6,3-2.8,4.5-5.5,5.5c-1.5,0.6-3,1.1-4.6,1.7c-1.2,0.4-2.4,0.8-3.2,1.8c-1.2,1.5-0.4,3.5,0,5.1 c0.3,1,0.7,2,1.3,2.9c3.6,5,3.1,11.2,4.8,16.9c6.1,1.4,11.2-2.7,17-3c1.4,7.5,11.1,8.1,14.4,14.3c1,1.9,0.1,4-0.7,5.8 c-0.1,0.2-0.2,0.4-0.3,0.6c-1.8,3.9-3.6,7.8-5.4,11.7c-0.2,0.8-0.5,1.5-0.9,2.3c-0.9,1.8-2.1,3.4-3.7,4.7c-3.1,2.5-5.5,5.6-8.4,8.3 c-1.4,1.3-2.8,2.6-4.3,3.8c-0.5,0.4-1,0.7-1.6,1c-1.9,1.1-4.1,1.2-6.3,1.4h-0.1c-2.7,0.2-5.3,0.8-7.6,2.3c-1.5,1-2.6,2.3-3.3,3.9 c-1,2-1,4.3-1.5,6.4c-0.5,2.1-1.6,4.1-3.5,5c-1,0.5-2.1,0.7-3.2,0.7c-3.5,0.1-7.1-1.2-9.7-3.4c-1.3-1.1-2.3-2.4-3.5-3.5 c-1.6-1.5-3.5-2.7-5.6-3.6c-0.9-0.4-1.8-0.7-2.7-0.7c-2.4,0-4.2,2.1-5.8,3.8c-2.4,2.7-4.7,5.4-7.1,8.1c-1.1,1.3-2.2,2.6-3.3,3.9 c-0.4,0.5-0.9,1.1-1.5,1.5c-0.6,0.4-1.3,0.7-2,0.9c-3.5,0.8-7.3-0.3-10-2.6c-1.4-1.2-2.5-2.6-3.6-4c-0.8-1-1.6-2-2.4-2.9 c-0.9-1-2-1.8-3.2-2.4c-2-0.9-4.3-0.8-6.4-0.3c-3.1,0.7-6,2.4-8.8,3.9c-0.1,1.6,0.2,3.3,0.8,4.8c1.4,3.3,4.4,5.6,7.5,7.3 c3.1,1.7,6.5,2.9,9.8,4.2c6.9,2.7,13.7,5.7,20.1,9.3c3.2,1.8,6.2,3.8,9,6c5.6,4.5,10,10,14.3,15.6c0.9,1.2,1.8,2.4,3,3.3 c0.2,0.2,0.4,0.3,0.6,0.4c1.6,1,3.7,0.6,5-0.7c0.7-0.7,1.2-1.5,1.6-2.4c1.2-2.5,1.9-5.2,2.8-7.8c0.2-0.5,0.3-1,0.6-1.5 c0.9-1.9,3.5-2.6,5.4-1.9c2,0.7,3.5,2.2,5.2,3.4c3.3,2.3,7.3,3.6,11.3,3.7c1,0,2,0,2.9-0.3c0.9-0.3,1.7-0.8,2.4-1.4 c5.5-5.1,4.3-15.5,11.7-18.5"
                  fill="#e2e8f0"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                {/* More path elements for world map would go here */}

                {/* Customer location markers */}
                <circle
                  cx="200"
                  cy="150"
                  r="8"
                  fill="#c084fc"
                  className="animate-ping"
                  style={{ animationDuration: "3s" }}
                />
                <circle
                  cx="450"
                  cy="180"
                  r="10"
                  fill="#db2777"
                  className="animate-ping"
                  style={{ animationDuration: "2.5s" }}
                />
                <circle
                  cx="350"
                  cy="240"
                  r="7"
                  fill="#8b5cf6"
                  className="animate-ping"
                  style={{ animationDuration: "3.5s" }}
                />
                <circle
                  cx="710"
                  cy="210"
                  r="9"
                  fill="#ec4899"
                  className="animate-ping"
                  style={{ animationDuration: "4s" }}
                />
                <circle
                  cx="850"
                  cy="180"
                  r="8"
                  fill="#8b5cf6"
                  className="animate-ping"
                  style={{ animationDuration: "2.8s" }}
                />
                <circle
                  cx="640"
                  cy="310"
                  r="6"
                  fill="#db2777"
                  className="animate-ping"
                  style={{ animationDuration: "3.2s" }}
                />
                <circle
                  cx="500"
                  cy="150"
                  r="7"
                  fill="#c084fc"
                  className="animate-ping"
                  style={{ animationDuration: "2.7s" }}
                />

                {/* Add static circles underneath the animated ones */}
                <circle cx="200" cy="150" r="5" fill="#c084fc" />
                <circle cx="450" cy="180" r="5" fill="#db2777" />
                <circle cx="350" cy="240" r="5" fill="#8b5cf6" />
                <circle cx="710" cy="210" r="5" fill="#ec4899" />
                <circle cx="850" cy="180" r="5" fill="#8b5cf6" />
                <circle cx="640" cy="310" r="5" fill="#db2777" />
                <circle cx="500" cy="150" r="5" fill="#c084fc" />

                {/* Country labels */}
                <text
                  x="200"
                  y="140"
                  fontSize="12"
                  fill="#4b5563"
                  fontWeight="500"
                >
                  USA
                </text>
                <text
                  x="450"
                  y="170"
                  fontSize="12"
                  fill="#4b5563"
                  fontWeight="500"
                >
                  UK
                </text>
                <text
                  x="320"
                  y="220"
                  fontSize="24"
                  fill="#4b5563"
                  fontWeight="500"
                >
                  Sri Lanka
                </text>
                <text
                  x="710"
                  y="200"
                  fontSize="12"
                  fill="#4b5563"
                  fontWeight="500"
                >
                  India
                </text>
                <text
                  x="850"
                  y="170"
                  fontSize="12"
                  fill="#4b5563"
                  fontWeight="500"
                >
                  Japan
                </text>
                <text
                  x="640"
                  y="300"
                  fontSize="12"
                  fill="#4b5563"
                  fontWeight="500"
                >
                  Australia
                </text>
                <text
                  x="500"
                  y="140"
                  fontSize="12"
                  fill="#4b5563"
                  fontWeight="500"
                >
                  France
                </text>
              </svg>
            </div>

            {/* Customer Word Cloud */}
            <div className="mt-12 relative h-[180px] reveal">
              <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                What customers around the world say about us
              </h3>
              <div className="absolute w-full h-full flex items-center justify-center">
                <span
                  className="text-5xl text-purple-600 font-bold absolute"
                  style={{
                    left: "25%",
                    top: "20%",
                    transform: "rotate(-5deg)",
                  }}
                >
                  Radiant
                </span>
                <span
                  className="text-4xl text-pink-500 font-bold absolute"
                  style={{ left: "60%", top: "40%", transform: "rotate(3deg)" }}
                >
                  Natural
                </span>
                <span
                  className="text-3xl text-violet-500 font-bold absolute"
                  style={{ left: "15%", top: "65%", transform: "rotate(2deg)" }}
                >
                  Hydrating
                </span>
                <span
                  className="text-2xl text-fuchsia-500 font-bold absolute"
                  style={{
                    left: "45%",
                    top: "15%",
                    transform: "rotate(-3deg)",
                  }}
                >
                  Gentle
                </span>
                <span
                  className="text-4xl text-purple-500 font-bold absolute"
                  style={{ left: "75%", top: "25%", transform: "rotate(4deg)" }}
                >
                  Effective
                </span>
                <span
                  className="text-3xl text-pink-600 font-bold absolute"
                  style={{
                    left: "35%",
                    top: "60%",
                    transform: "rotate(-2deg)",
                  }}
                >
                  Luxurious
                </span>
                <span
                  className="text-2xl text-violet-600 font-bold absolute"
                  style={{ left: "65%", top: "65%", transform: "rotate(5deg)" }}
                >
                  Transformative
                </span>
              </div>
            </div>
          </div>

          {/* Global statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              {
                number: "20+",
                label: "Countries",
                icon: "M3 21.5l2.75-3.22 2.75 3.22L11.25 17l2.75 4.5 2.75-4.5 2.75 4.5 2.75-4.5",
              },
              {
                number: "100K+",
                label: "Happy Customers",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
              },
              {
                number: "5+",
                label: "Distribution Centers",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              },
              {
                number: "24/7",
                label: "Global Support",
                icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center transform transition-all hover:scale-105 hover:shadow-lg reveal"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={stat.icon}
                    />
                  </svg>
                </div>
                <p className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  {stat.number}
                </p>
                <p className="text-gray-700 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg
            className="opacity-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0,0 L100,0 L100,100 Z" fill="white" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold mb-6 text-white reveal">
            Join Our Beauty Journey
          </h2>
          <p className="text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-light reveal">
            Discover the difference of Omaliya Cosmo products and become part of
            our growing community.
          </p>
          <div className="flex flex-wrap justify-center gap-4 reveal">
            <Link
              href="/contact"
              className="inline-flex items-center bg-white text-purple-600 font-bold py-4 px-8 rounded-full hover:bg-purple-50 transition duration-300 shadow-lg transform hover:scale-105"
            >
              Get In Touch
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

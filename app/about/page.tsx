"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import globe component with no SSR
const World = dynamic(
  () => import("@/components/ui/globe").then((mod) => mod.World),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
      </div>
    ),
  }
);

export default function AboutPage() {
  // Globe data state with expanded connections and volume indicators
  const [globeData, setGlobeData] = useState([
    // Major markets
    {
      order: 1,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 36.2048,
      endLng: 138.2529, // Japan
      arcAlt: 0.4,
      color: "#9333ea", // purple-600
      volume: 27500,
      name: "Japan",
    },
    {
      order: 2,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 37.0902,
      endLng: -95.7129, // USA
      arcAlt: 0.8,
      color: "#db2777", // pink-600
      volume: 35000,
      name: "United States",
    },
    {
      order: 3,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 51.5074,
      endLng: -0.1278, // UK
      arcAlt: 0.6,
      color: "#4f46e5", // indigo-600
      volume: 18000,
      name: "United Kingdom",
    },
    {
      order: 4,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 25.2744,
      endLng: 55.3047, // UAE
      arcAlt: 0.3,
      color: "#c026d3", // fuchsia-600
      volume: 12500,
      name: "UAE",
    },
    {
      order: 5,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: -25.2744,
      endLng: 133.7751, // Australia
      arcAlt: 0.5,
      color: "#f97316", // orange-500
      volume: 8500,
      name: "Australia",
    },
    {
      order: 6,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 20.5937,
      endLng: 78.9629, // India
      arcAlt: 0.2,
      color: "#ec4899", // pink-500
      volume: 42000,
      name: "India",
    },
    // Secondary markets
    {
      order: 7,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 56.1304,
      endLng: -106.3468, // Canada
      arcAlt: 0.75,
      color: "#8b5cf6", // violet-500
      volume: 7200,
      name: "Canada",
    },
    {
      order: 8,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 35.8617,
      endLng: 104.1954, // China
      arcAlt: 0.4,
      color: "#06b6d4", // cyan-500
      volume: 15000,
      name: "China",
    },
    {
      order: 9,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 60.1282,
      endLng: 18.6435, // Sweden
      arcAlt: 0.6,
      color: "#14b8a6", // teal-500
      volume: 5800,
      name: "Sweden",
    },
    {
      order: 10,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 23.6345,
      endLng: -102.5528, // Mexico
      arcAlt: 0.85,
      color: "#f43f5e", // rose-500
      volume: 4900,
      name: "Mexico",
    },
    {
      order: 11,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: -14.235,
      endLng: -51.9253, // Brazil
      arcAlt: 0.75,
      color: "#0ea5e9", // sky-500
      volume: 6700,
      name: "Brazil",
    },
    {
      order: 12,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 4.5709,
      endLng: -74.2973, // Colombia
      arcAlt: 0.7,
      color: "#a855f7", // purple-500
      volume: 3500,
      name: "Colombia",
    },
    {
      order: 13,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 61.524,
      endLng: 105.3188, // Russia
      arcAlt: 0.5,
      color: "#d946ef", // fuchsia-500
      volume: 2900,
      name: "Russia",
    },
    {
      order: 14,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: -30.5595,
      endLng: 22.9375, // South Africa
      arcAlt: 0.4,
      color: "#10b981", // emerald-500
      volume: 3800,
      name: "South Africa",
    },
    // Growing markets
    {
      order: 15,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: -40.9006,
      endLng: 174.886, // New Zealand
      arcAlt: 0.5,
      color: "#f59e0b", // amber-500
      volume: 2200,
      name: "New Zealand",
    },
    {
      order: 16,
      startLat: 7.8731,
      startLng: 80.7718, // Sri Lanka
      endLat: 1.3521,
      endLng: 103.8198, // Singapore
      arcAlt: 0.25,
      color: "#ef4444", // red-500
      volume: 5100,
      name: "Singapore",
    },
  ]);

  // Enhanced globe configuration with richer visual effects
  const globeConfig = {
    pointSize: 2.5,
    globeColor: "#0f172a", // slate-900, richer darker base
    showAtmosphere: true,
    atmosphereColor: "#c4b5fd", // violet-300, gives a magical glow
    atmosphereAltitude: 0.2,
    emissive: "#2d1d5a", // deep purple emissive
    emissiveIntensity: 0.2,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#ffffff",
    directionalLeftLight: "#f0abfc", // fuchsia-300, gives warm side light
    directionalTopLight: "#818cf8", // indigo-300, cool top light
    pointLight: "#ffffff",
    arcTime: 3000, // slower animation for more fluid motion
    arcLength: 0.9,
    rings: 3,
    maxRings: 5,
    autoRotate: true,
    autoRotateSpeed: 0.7, // slightly slower for smoother rotation
  };

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
                    src="https://res.cloudinary.com/omaliya/image/upload/v1745603277/454006821_7680864805347803_4495142905038263634_n_qgrldy.jpg"
                    alt="Kasun Shaluka, Founder"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">Jane Smith</p>
                  <p className="text-purple-600 font-medium">Founder & Owner</p>
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
                position: "Founder / Owner",
                image:
                  "https://res.cloudinary.com/omaliya/image/upload/v1745603277/454006821_7680864805347803_4495142905038263634_n_qgrldy.jpg",
              },
              {
                name: "Pamodani Hansika",
                position: "Co-Owner",
                image:
                  "https://res.cloudinary.com/omaliya/image/upload/v1745603605/488537653_9160081904092745_7792472065025335707_n_rsgcgg.jpg",
              },
            ].map((member, index) => (
              <div key={index} className="group reveal">
                <div className="bg-purple-50 rounded-2xl p-6 text-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100 group-hover:shadow-xl">
                  <div className="w-48 h-48 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white shadow-md group-hover:shadow-lg transition-all duration-300">
                    {/* Team member image placeholder */}
                    <div
                      className="bg-gradient-to-tr from-purple-300 to-pink-300 h-full w-full flex items-center justify-center text-white font-medium"
                      style={{
                        backgroundImage: `url(${member.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
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

      {/* Advanced Customer World Map Section */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/dot-pattern.png')] bg-repeat opacity-5"></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4 reveal">
              Global Impact
            </span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4 reveal">
              Our Global Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto reveal">
              Omaliya Cosmo products are loved by customers across continents,
              creating beautiful experiences worldwide.
            </p>
          </div>

          {/* 3D Globe Visualization */}
          <div className="relative h-[600px] mb-16 reveal perspective-1000">
            <World globeConfig={globeConfig} data={globeData} />
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
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
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">Global Reach</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Our products are available in over 20 countries, bringing the
                best of Sri Lankan beauty to the world.
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Countries</div>
                <div className="text-lg font-bold text-purple-600">20+</div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">Customer Base</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Our growing community includes customers from diverse
                backgrounds across continents.
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Active Customers</div>
                <div className="text-lg font-bold text-pink-600">100K+</div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">Annual Growth</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Year over year, our global customer base continues to grow as we
                expand to new markets.
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">YoY Growth</div>
                <div className="text-lg font-bold text-indigo-600">42%</div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Customer Testimonials By Region */}
          <div className="mt-16 reveal">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              Voices From Around The World
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  quote:
                    "The natural ingredients in these products have transformed my skincare routine completely!",
                  name: "Jessica M.",
                  location: "United States",
                  image:
                    "https://res.cloudinary.com/omaliya/image/upload/v1746123546/istockphoto-986662114-612x612_dnytym_lqiocl.jpg",
                  stars: 5,
                },
                {
                  quote:
                    "Finally found products that work perfectly with my sensitive skin. The quality is unmatched!",
                  name: "Priya S.",
                  location: "India",
                  image:
                    "https://res.cloudinary.com/omaliya/image/upload/v1746123546/istockphoto-986662114-612x612_dnytym_lqiocl.jpg",
                  stars: 5,
                },
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-purple-100 flex flex-col md:flex-row"
                >
                  <div className="md:w-1/3 relative h-48 md:h-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-90"></div>
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${testimonial.image})`,
                        opacity: 0.35,
                      }}
                    ></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-white/90">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <div className="flex mb-3">
                        {Array(testimonial.stars)
                          .fill(0)
                          .map((_, i) => (
                            <svg
                              key={i}
                              className="w-5 h-5 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                      </div>
                      <p className="text-gray-600 italic">
                        "‍{testimonial.quote}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

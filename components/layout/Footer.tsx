"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<
    null | "success" | "error"
  >(null);

  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isLogin =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPasswordReset = pathname.startsWith("/password-reset");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setSubscribeStatus("error");
      return;
    }

    try {
      // Replace with actual API call when ready
      // await axios.post('/api/subscribe', { email });
      setSubscribeStatus("success");
      setEmail("");
      setTimeout(() => setSubscribeStatus(null), 3000);
    } catch (error) {
      setSubscribeStatus("error");
    }
  };

  return (
    <>
      {!isAdmin && !isLogin && !isPasswordReset && (
        <footer className="bg-gray-50 border-t border-gray-200 px-10">
          {/* Main Footer */}
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Column 1: About & Contact */}
              <div>
                <div className="mb-4">
                  <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                      OMALIYA
                    </span>
                  </Link>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Premium, high-quality products designed to enhance your
                  everyday life, made with care and natural ingredients.
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    3A Mabulgoda, Pannipitiya 10230,
                    <br />
                    Sri Lanka
                  </p>
                  <p className="text-gray-600 text-sm flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    omaliyaimportes@gmail.com
                  </p>
                  <p className="text-gray-600 text-sm flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    +94 75 205 2050
                    <br />
                    +94 75 537 2920
                    <br />
                    +94 75 679 4690
                  </p>
                </div>
              </div>

              {/* Column 2: Quick Links */}
              <div>
                <h3 className="text-gray-800 font-semibold mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Home Page
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Profile
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Policies */}
              <div>
                <h3 className="text-gray-800 font-semibold mb-4">Policies</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Shipping Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Returns & Exchanges
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/warranty"
                      className="text-gray-600 hover:text-purple-600 text-sm"
                    >
                      Warranty Information
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Newsletter */}
              <div>
                <h3 className="text-gray-800 font-semibold mb-4">
                  Join Our Newsletter
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Stay updated with our latest products, offers, and beauty
                  tips.
                </p>
                <form onSubmit={handleSubscribe}>
                  <div className="flex flex-col sm:flex-row">
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow px-4 py-2 rounded-l-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    />
                    <button
                      type="submit"
                      className="mt-2 sm:mt-0 bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Subscribe
                    </button>
                  </div>
                  {subscribeStatus === "success" && (
                    <p className="mt-2 text-green-600 text-xs">
                      Thank you for subscribing!
                    </p>
                  )}
                  {subscribeStatus === "error" && (
                    <p className="mt-2 text-red-600 text-xs">
                      Please enter a valid email address.
                    </p>
                  )}
                </form>

                <div className="mt-6">
                  <h4 className="text-gray-800 font-semibold mb-2 text-sm">
                    Follow Us
                  </h4>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.facebook.com/omaliya.lk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-purple-600"
                    >
                      <span className="sr-only">Facebook</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://www.facebook.com/p/Karseell-Official-Store-Srilanka-61557197364358/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-purple-600"
                    >
                      <span className="sr-only">Facebook</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/omaliya_cosmo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-purple-600"
                    >
                      <span className="sr-only">Instagram</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://www.tiktok.com/@omaliyacosmo?is_from_webapp=1&sender_device=pc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-purple-600"
                    >
                      <span className="sr-only">Tiktok</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V15a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-gray-200 py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center items-center gap-4">
                <span className="text-gray-500 text-sm">We accept:</span>
                <div className="flex space-x-4">
                  <img
                    src="https://res.cloudinary.com/omaliya/image/upload/v1745201619/VISA-logo_aehekz.png"
                    alt="Visa"
                    className="h-8 w-12 object-contain"
                  />
                  <img
                    src="https://res.cloudinary.com/omaliya/image/upload/v1745201619/MAINLogo-HD_H_21.01.05_navu1g.webp"
                    alt="KOKO"
                    className="h-8 w-12 object-contain"
                  />
                  <img
                    src="https://res.cloudinary.com/omaliya/image/upload/v1745201619/American-Express-Color_ga7hmr.png"
                    alt="American Express"
                    className="h-8 w-12 object-contain"
                  />
                  <img
                    src="https://res.cloudinary.com/omaliya/image/upload/v1745201618/mastercard-logo_p8qlfa.png"
                    alt="Mastercard"
                    className="h-8 w-12 object-contain"
                  />
                  <img
                    src="https://res.cloudinary.com/omaliya/image/upload/v1745201618/PayHere-Logo_brngkl.png"
                    alt="PayHere"
                    className="h-8 w-12 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className=" py-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-600 text-sm">
                  &copy; {new Date().getFullYear()} Omaliya Cosmetics. All
                  rights reserved. • Powered by{" "}
                  <a
                    href="https://enshift.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-600"
                  >
                    Enshift Online
                  </a>
                </p>
                <div className="mt-2 md:mt-0">
                  <ul className="flex space-x-4">
                    <li>
                      <Link
                        href="#"
                        className="text-gray-600 hover:text-purple-600 text-sm"
                      >
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-gray-600 hover:text-purple-600 text-sm"
                      >
                        Terms
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-gray-600 hover:text-purple-600 text-sm"
                      >
                        Sitemap
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}

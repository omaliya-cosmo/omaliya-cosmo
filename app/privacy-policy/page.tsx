import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Cookie,
  Server,
  Share2,
  Mail,
  Phone,
  HelpCircle,
  Database,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Omaliya Cosmetics",
  description:
    "Omaliya Cosmetics Privacy Policy. Learn how we collect, protect, use, and respect your personal data and online transaction information in Sri Lanka.",
  openGraph: {
    title: "Privacy Policy | Omaliya Cosmetics",
    description:
      "Understand how your personal data and online purchases are secured with Omaliya Cosmetics.",
    type: "website",
    url: "https://omaliya.lk/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 2025";

  const securityPillars = [
    {
      icon: <Lock className="w-6 h-6 text-purple-600" />,
      title: "Bank-Grade Encryption",
      description:
        "All transactions and checkout sessions are protected with industry-standard 256-bit SSL encryption.",
    },
    {
      icon: <Eye className="w-6 h-6 text-pink-600" />,
      title: "Zero Data Selling",
      description:
        "We never sell, rent, or trade your personal data to third-party brokers or advertisers.",
    },
    {
      icon: <Server className="w-6 h-6 text-purple-600" />,
      title: "Secure Payment Gateways",
      description:
        "Payments are processed directly via PCI-DSS compliant providers (OnePay, PayHere) without storing raw card numbers.",
    },
    {
      icon: <UserCheck className="w-6 h-6 text-pink-600" />,
      title: "Your Rights & Control",
      description:
        "You can request access, corrections, or total deletion of your account data anytime via our support team.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-gray-800">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-700 text-white py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center space-x-2 text-sm text-purple-200 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Privacy Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-pink-200 mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Protection & Transparency</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-purple-200">
              Policy
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-purple-100 text-base sm:text-lg leading-relaxed font-light">
            Your privacy and trust are paramount to Omaliya Cosmetics. This
            policy explains how we collect, use, safeguard, and disclose your
            information when you interact with our website and services.
          </p>

          <div className="mt-6 text-xs sm:text-sm text-purple-200/80">
            Last Updated: <span className="font-semibold text-white">{lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Security Pillars Grid */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {securityPillars.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-purple-900/5 border border-purple-100/80 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm border border-gray-200/80 space-y-12">
          {/* Section 1: Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                01
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Introduction & Scope
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Omaliya Cosmetics (&ldquo;Omaliya&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website{" "}
              <strong className="text-gray-900">omaliya.lk</strong>. This Privacy Policy describes how your personal data is collected, processed, and maintained when you browse our platform, create an account, make a purchase, or communicate with our support personnel.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using our website, you acknowledge that you have read, understood, and agreed to the practices outlined in this Privacy Policy.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Information We Collect */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                02
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Information We Collect
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We collect information that you directly provide to us, as well as data gathered automatically when you navigate our website:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-950">
                  <Database className="w-5 h-5 text-purple-600" />
                  Personal Information You Provide
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                  <li><strong>Account Details:</strong> Full name, email address, contact telephone numbers, and secure passwords.</li>
                  <li><strong>Shipping & Billing:</strong> Delivery address, city, postal code, and recipient instructions.</li>
                  <li><strong>Customer Inquiries:</strong> Messages, feedback, reviews, and support ticket attachments.</li>
                  <li><strong>Order History:</strong> Products viewed, cart additions, and order transaction logs.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-2">
                <div className="flex items-center gap-2 font-bold text-pink-950">
                  <Cookie className="w-5 h-5 text-pink-600" />
                  Automatically Collected Information
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                  <li><strong>Device & Browser Data:</strong> IP address, operating system, browser type, and language preference.</li>
                  <li><strong>Browsing Patterns:</strong> Pages viewed, time spent on site, referring URLs, and bounce rates.</li>
                  <li><strong>Cookies & Session Storage:</strong> Session authentication tokens, active cart contents, and regional settings.</li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: How We Use Your Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                03
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                How We Use Your Information
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We process your personal information strictly for legitimate commercial and operational purposes, including:
            </p>

            <div className="space-y-3">
              {[
                {
                  title: "Fulfilling Orders & Logistics",
                  desc: "To process your payments, prepare items at our Pannipitiya warehouse, generate invoices, and route deliveries through domestic courier services.",
                },
                {
                  title: "Customer Support & Notifications",
                  desc: "To provide real-time updates regarding order status, tracking links, respond to service inquiries, and resolve returns or warranty issues.",
                },
                {
                  title: "Security & Fraud Prevention",
                  desc: "To verify online transactions, identify abnormal activities, and prevent fraudulent checkouts or account compromises.",
                },
                {
                  title: "Personalized Experience & Marketing",
                  desc: "To display relevant beauty bundles, recommend skin care products, and send promotional newsletters (only if you have opted in, with easy 1-click unsubscribe).",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 block text-sm font-semibold">
                      {item.title}
                    </strong>
                    <span className="text-gray-600 text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4: Payment Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                04
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Processing & Security
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Omaliya prioritizes your financial security. We partner exclusively with accredited, PCI-DSS compliant payment gateways, including{" "}
              <strong>OnePay</strong>, <strong>PayHere</strong>, and <strong>KOKO</strong>.
            </p>
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2 text-sm text-gray-700">
              <p>
                <strong>We do NOT store your sensitive card details:</strong> When you complete an online payment, your debit/credit card numbers and CVV codes are directly transmitted over encrypted protocols to authorized banking servers. Omaliya only receives cryptographic transaction tokens and confirmation statuses.
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 5: Third-Party Disclosures */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                05
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Information Sharing & Third Parties
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We never sell or commercialize your personal information. We disclose limited customer data only to trusted partners required to operate our business:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <li><strong>Courier & Courier Services:</strong> Sharing your name, delivery address, and contact number so delivery riders can reach you safely.</li>
              <li><strong>Payment Processors:</strong> Relaying payment requests securely via OnePay, PayHere, and KOKO.</li>
              <li><strong>Cloud & IT Infrastructure:</strong> Secure cloud servers, databases, and transactional email providers adhering to rigorous data security.</li>
              <li><strong>Legal Compliance:</strong> When mandated by Sri Lankan law, court subpoenas, or to defend our legal rights against fraudulent misconduct.</li>
            </ul>
          </div>

          <hr className="border-gray-100" />

          {/* Section 6: Cookies & Tracking */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                06
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Cookies & Tracking Technologies
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Our website uses cookies and similar storage technologies to remember items in your shopping cart, authenticate your logged-in session, and understand how visitors interact with our pages. You may disable cookies through your browser settings, though certain dynamic features (such as persistent shopping carts) may not function properly without them.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 7: User Rights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                07
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Data Rights & Control
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              You maintain full control over your personal data. You have the right to:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm text-gray-700">
              <li className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Access copies of your stored personal data.
              </li>
              <li className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Update or rectify inaccurate profile details.
              </li>
              <li className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Request complete erasure of your account.
              </li>
              <li className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Opt out of promotional emails at any time.
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Support Banner */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-pink-200 text-sm font-semibold">
              <HelpCircle className="w-5 h-5" />
              <span>Have Privacy Questions?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              Contact our Data Privacy Officer
            </h3>
            <p className="text-purple-100 text-sm max-w-xl">
              For any questions regarding your personal information, or to request data modification or deletion, please email us directly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <a
              href="mailto:omaliyaimportes@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-purple-700 font-bold text-sm shadow-md hover:bg-purple-50 transition-all text-center"
            >
              Email Privacy Team
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-purple-900/40 border border-white/20 text-white font-semibold text-sm hover:bg-purple-900/60 transition-all text-center"
            >
              Contact Page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

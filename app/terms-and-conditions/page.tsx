import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText,
  Scale,
  ShieldCheck,
  CreditCard,
  Truck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions | Omaliya Cosmetics",
  description:
    "Read the terms and conditions for using the Omaliya Cosmetics online store in Sri Lanka. Covering orders, payments, warranties, shipping, and user obligations.",
  openGraph: {
    title: "Terms and Conditions | Omaliya Cosmetics",
    description:
      "Comprehensive terms of service and conditions for shoppers at Omaliya Cosmetics Sri Lanka.",
    type: "website",
    url: "https://omaliya.lk/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "September 2025";

  const keyPrinciples = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      title: "100% Genuine Products",
      description:
        "All cosmetics, hair care treatments, and bundles sold on Omaliya are guaranteed 100% original and authentic.",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-pink-600" />,
      title: "Transparent Pricing",
      description:
        "Prices listed in Sri Lankan Rupees (LKR). No hidden surcharges or surprise fees at final checkout.",
    },
    {
      icon: <Truck className="w-6 h-6 text-purple-600" />,
      title: "Reliable Island-Wide Delivery",
      description:
        "Fast, insured door-to-door courier dispatch across all provinces and cities in Sri Lanka.",
    },
    {
      icon: <Scale className="w-6 h-6 text-pink-600" />,
      title: "Sri Lankan Jurisdiction",
      description:
        "All transactions, terms, and agreements are governed under the laws of the Democratic Socialist Republic of Sri Lanka.",
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
            <span className="text-white font-medium">Terms and Conditions</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-pink-200 mb-4">
            <FileText className="w-4 h-4" />
            <span>Legal Agreement & User Terms</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Terms &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-purple-200">
              Conditions
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-purple-100 text-base sm:text-lg leading-relaxed font-light">
            Please read these terms and conditions carefully before using our
            website or ordering our cosmetic and personal care products.
          </p>

          <div className="mt-6 text-xs sm:text-sm text-purple-200/80">
            Last Updated: <span className="font-semibold text-white">{lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {keyPrinciples.map((item, index) => (
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

      {/* Main Legal Content */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm border border-gray-200/80 space-y-12">
          {/* Section 1: Agreement to Terms */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                01
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Agreement to Terms
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&ldquo;you&rdquo;) and{" "}
              <strong className="text-gray-900">Omaliya Cosmetics</strong> (&ldquo;Omaliya&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), concerning your access to and use of the{" "}
              <strong>omaliya.lk</strong> website and online purchase platform.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By accessing the Site and/or purchasing products from Omaliya, you agree that you have read, understood, and agreed to be bound by all of these Terms and Conditions. If you do not agree with all of these terms, you are expressly prohibited from using the site and must discontinue use immediately.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Products & Pricing */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                02
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Products, Pricing & Availability
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We make every effort to display as accurately as possible the colors, features, specifications, and details of the cosmetic and personal care products available on the Site.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
              <li><strong>Currency:</strong> All prices displayed on our website are stated in Sri Lankan Rupees (LKR) unless explicitly converted via our regional currency selector.</li>
              <li><strong>Price Modifications:</strong> Prices for our products are subject to change without prior notice. Special bundle promotions and discount coupons are valid only for specified promotional periods.</li>
              <li><strong>Product Authenticity:</strong> All items, including Karseell hair treatments, serums, and masks, are 100% genuine and verified from authorized distribution channels.</li>
              <li><strong>Stock Availability:</strong> All product orders are subject to availability. We reserve the right to limit the sales of our products or services to any person, geographic region, or jurisdiction.</li>
            </ul>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Orders & Acceptance */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                03
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Order Placement & Acceptance
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              When you place an order on our platform, you will receive an automatic confirmation email or SMS acknowledging receipt of your order.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              This acknowledgment does not signify our final acceptance of your order. A sales contract is finalized only when your order has been verified, packed, and dispatched from our Pannipitiya facility. We reserve the right to cancel or refuse any order due to product unavailability, inaccuracies in pricing information, or suspicion of fraudulent activity.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4: Payments */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                04
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Methods & Security
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We offer multiple convenient and highly secure payment options for our customers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Online Card Payments
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Processed securely via OnePay and PayHere supporting Visa, Mastercard, and American Express.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  KOKO (Buy Now Pay Later)
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Split your cosmetic purchases into 3 interest-free installments according to KOKO terms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  Cash on Delivery (COD)
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Pay cash directly to the courier agent upon parcel delivery anywhere in Sri Lanka.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-pink-600" />
                  Bank Transfer / Deposit
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Direct bank deposit into our verified corporate bank accounts with slip upload verification.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 5: Shipping & Delivery */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                05
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Shipping, Delivery & Risk of Loss
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We dispatch orders across Sri Lanka through trusted domestic courier services. Standard delivery within the Colombo district typically takes 1 to 2 working days, while other regional destinations take 2 to 4 working days.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              All risk of loss and title for items purchased pass to you upon delivery to the carrier. If your parcel is lost or damaged during transit, Omaliya will liaise directly with the courier to ensure your items are replaced or refunded promptly.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 6: Product Usage & Allergy Disclaimer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                06
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Cosmetic Usage & Patch-Testing Advisory
              </h2>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 space-y-2">
                <p className="font-semibold">Health & Safety Disclaimer:</p>
                <p className="text-amber-800 leading-relaxed">
                  Individual results may vary based on skin and hair type. We strongly recommend performing a 24-hour patch test before full application of any new cosmetic, hair mask, serum, or skincare product. If irritation, rash, or allergic reaction occurs, discontinue use immediately and consult a healthcare professional. Omaliya is not liable for adverse allergic reactions resulting from personal sensitivities.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 7: Returns & Refunds */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                07
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Returns, Exchanges & Cancellations
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              All return and refund requests are governed by our dedicated{" "}
              <Link
                href="/refund-policy"
                className="text-purple-600 font-semibold underline hover:text-purple-800"
              >
                Refund & Return Policy
              </Link>
              . Returns must be requested within 7 days of delivery and items must remain unopened and untampered with for hygiene reasons.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 8: Intellectual Property */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                08
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Intellectual Property Rights
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              Unless otherwise indicated, the Site, logo, graphical assets, UI components, images, software code, and all content on{" "}
              <strong>omaliya.lk</strong> are our proprietary property or licensed to us, and are protected by copyright and trademark laws. You are granted a limited license to access and make personal, non-commercial use of the website.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 9: Governing Law */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                09
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Governing Law & Dispute Resolution
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              These Terms and Conditions shall be governed by and defined following the laws of the Democratic Socialist Republic of Sri Lanka. Omaliya Cosmetics and you irrevocably consent that the courts of Sri Lanka shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>
          </div>
        </div>

        {/* Support Banner */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-pink-200 text-sm font-semibold">
              <HelpCircle className="w-5 h-5" />
              <span>Questions about our Terms?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              We’re here to help clarify any detail
            </h3>
            <p className="text-purple-100 text-sm max-w-xl">
              Feel free to reach out to our legal and customer operations desk at 3A Mabulgoda, Pannipitiya 10230, Sri Lanka.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-purple-700 font-bold text-sm shadow-md hover:bg-purple-50 transition-all text-center"
            >
              Contact Support
            </Link>
            <Link
              href="/refund-policy"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-purple-900/40 border border-white/20 text-white font-semibold text-sm hover:bg-purple-900/60 transition-all text-center"
            >
              View Refund Policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

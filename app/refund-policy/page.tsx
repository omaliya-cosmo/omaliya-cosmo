import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  RotateCcw,
  ShieldCheck,
  Clock,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  HelpCircle,
  PackageX,
  CreditCard,
  FileCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Return Policy | Omaliya Cosmetics",
  description:
    "Learn about Omaliya Cosmetics refund, return, and exchange policies. Clear guidelines on returns, damaged goods, refund timelines, and customer support in Sri Lanka.",
  openGraph: {
    title: "Refund & Return Policy | Omaliya Cosmetics",
    description:
      "Clear, fair, and transparent refund and return terms for Omaliya Cosmetics customers across Sri Lanka.",
    type: "website",
    url: "https://omaliya.lk/refund-policy",
  },
};

export default function RefundPolicyPage() {
  const lastUpdated = "September 2025";

  const keyHighlights = [
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "7-Day Return Window",
      description:
        "Request returns or exchanges within 7 days from the delivery date for eligible items.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-pink-600" />,
      title: "100% Authentic Guarantee",
      description:
        "If you receive a defective or incorrect item, we replace it or issue a full refund at zero extra cost.",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-purple-600" />,
      title: "5–10 Day Processing",
      description:
        "Refunds are credited back to your original payment method within 5 to 10 business days after inspection.",
    },
    {
      icon: <Truck className="w-6 h-6 text-pink-600" />,
      title: "Island-Wide Support",
      description:
        "Easy return pickup coordination across all districts in Sri Lanka with dedicated customer care.",
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
            <span className="text-white font-medium">Refund Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-pink-200 mb-4">
            <RotateCcw className="w-4 h-4" />
            <span>Customer Satisfaction & Assurance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Refund & Return{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-purple-200">
              Policy
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-purple-100 text-base sm:text-lg leading-relaxed font-light">
            At Omaliya Cosmetics, we stand behind the quality of our premium
            beauty and hair care products. Here is everything you need to know
            about our returns, refunds, and exchange process.
          </p>

          <div className="mt-6 text-xs sm:text-sm text-purple-200/80">
            Last Updated: <span className="font-semibold text-white">{lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {keyHighlights.map((item, index) => (
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

      {/* Content Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm border border-gray-200/80 space-y-12">
          {/* Section 1: Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                01
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Overview & Eligibility
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We want you to be completely satisfied with your purchase from{" "}
              <strong className="text-gray-900">Omaliya Cosmetics</strong>. Because cosmetics,
              hair treatments, and personal care products directly contact the skin and hair,
              strict health and safety regulations apply. To qualify for a return or exchange:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
                <div className="flex items-center gap-2 font-semibold text-purple-900 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  Eligible for Return
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                  <li>Item arrived damaged or leaking in transit.</li>
                  <li>Incorrect product or bundle sent by error.</li>
                  <li>Product is defective or past expiry upon delivery.</li>
                  <li>Unopened item with original tamper seal intact.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-pink-50/70 border border-pink-100">
                <div className="flex items-center gap-2 font-semibold text-pink-900 mb-2">
                  <PackageX className="w-5 h-5 text-pink-600" />
                  Non-Returnable Items
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                  <li>Opened, unsealed, or used cosmetic products.</li>
                  <li>Items reported after the 7-day delivery window.</li>
                  <li>Products purchased on final clearance or flash sales.</li>
                  <li>Gift cards, promotional giveaways, and samples.</li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Damaged, Defective or Wrong Items */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                02
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Damaged, Defective, or Incorrect Deliveries
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              If your package arrives damaged, incomplete, or with an incorrect item, please notify us within{" "}
              <strong className="text-gray-900">48 hours of delivery</strong> so we can resolve the issue immediately.
            </p>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 space-y-1">
                <p className="font-semibold">Important Proof Requirement:</p>
                <p className="text-amber-800">
                  Please take clear photos or a short video showing the outer package, the shipping label, and the damaged or wrong product before disposing of any packaging materials.
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              For confirmed damaged or incorrectly delivered items, Omaliya will provide an immediate replacement or full refund, including all shipping charges.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Step-by-Step Return Process */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                03
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                How to Request a Return or Exchange
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Returning an item with Omaliya is quick and hassle-free. Follow these three steps:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mb-4">
                    1
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Contact Support
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Reach out via WhatsApp or email with your Order ID, proof of purchase, and reason for return.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-xs text-purple-600 font-medium">
                  WhatsApp: +94 75 205 2050
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mb-4">
                    2
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Verification & Approval
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Our customer care team reviews your request within 24 business hours and provides return authorization instructions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-xs text-purple-600 font-medium">
                  Review time: &lt; 24 Hours
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mb-4">
                    3
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Pickup & Refund
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Hand over the safely packed parcel to our courier partner or send it to our warehouse. Once inspected, refund is released.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-xs text-purple-600 font-medium">
                  Payout: 5–10 Business Days
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4: Refund Methods & Timelines */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                04
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Refund Methods & Processing Timelines
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Once your returned item is received and inspected at our distribution facility in Pannipitiya, we will send you an email confirmation regarding your refund status.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-purple-50/75 text-purple-950 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Refund Method</th>
                    <th className="p-4">Estimated Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">
                      Credit / Debit Card (OnePay / PayHere)
                    </td>
                    <td className="p-4">Reversal to original card account</td>
                    <td className="p-4">5 – 10 business days (Bank dependent)</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">
                      KOKO (Buy Now Pay Later)
                    </td>
                    <td className="p-4">Adjusted / Refunded via KOKO app</td>
                    <td className="p-4">3 – 5 business days</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">
                      Cash on Delivery (COD)
                    </td>
                    <td className="p-4">Direct Bank Transfer or Store Credit</td>
                    <td className="p-4">2 – 4 business days after details provided</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">
                      Bank Deposit / Transfer
                    </td>
                    <td className="p-4">Bank Transfer to verified account</td>
                    <td className="p-4">2 – 3 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 5: Order Cancellations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                05
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Order Cancellations
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              You may cancel your order free of charge at any point <strong>prior to order dispatch</strong>. Once your order has been packaged and handed over to our courier partners for delivery, the order cannot be cancelled directly and must follow the standard return procedure upon delivery.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              To request an immediate cancellation before shipment, please call or WhatsApp our helpline at{" "}
              <a
                href="tel:+94752052050"
                className="text-purple-600 font-semibold hover:underline"
              >
                +94 75 205 2050
              </a>{" "}
              with your order reference.
            </p>
          </div>
        </div>

        {/* Support Banner */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-pink-200 text-sm font-semibold">
              <HelpCircle className="w-5 h-5" />
              <span>Need help with a return?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              We’re here to assist you every step of the way
            </h3>
            <p className="text-purple-100 text-sm max-w-xl">
              Have questions about your order or our policies? Contact our dedicated support team Monday through Saturday (9:00 AM – 6:00 PM SLST).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-purple-700 font-bold text-sm shadow-md hover:bg-purple-50 transition-all text-center"
            >
              Contact Support
            </Link>
            <a
              href="https://wa.me/94752052050"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-purple-900/40 border border-white/20 text-white font-semibold text-sm hover:bg-purple-900/60 transition-all text-center"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <a className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 mb-4">
              ← Back to Home
            </a>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 27, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using SCHROOL's online mathematics education platform ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              SCHROOL provides online mathematics education services for students in Years 5-9, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Pre-recorded video lessons and interactive exercises</li>
              <li>Progress tracking and performance analytics</li>
              <li>One-on-one tutoring sessions via Zoom (Premium Elite tier only)</li>
              <li>Phone tutor support (Standard tier)</li>
              <li>Access to downloadable course materials and resources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To access our Service, you must:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be at least 13 years of age, or have parental/guardian consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment and Refund Policy</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.1 Payment Terms</h3>
                <p className="text-gray-700 leading-relaxed">
                  All fees are quoted in Australian Dollars (AUD). Payment can be made via credit card, debit card, or payment plan as specified during enrollment. Payment plans are subject to additional fees as disclosed at checkout.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.2 Refund Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  We offer a 14-day money-back guarantee from the date of purchase. To request a refund, contact support@schrool.com with your enrollment details. Refunds are processed within 7-10 business days. After 14 days, all sales are final.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Course Access and Duration</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.1 Standard Tier</h3>
                <p className="text-gray-700 leading-relaxed">
                  12 months of self-paced access to video lessons, exercises, and course materials from the date of enrollment.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.2 Premium Elite Tier</h3>
                <p className="text-gray-700 leading-relaxed">
                  24+ weeks of access including twice-weekly one-on-one Zoom tutoring sessions. Sessions must be scheduled in advance and are subject to teacher availability.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Acceptable Use Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Share your account credentials with others</li>
              <li>Reproduce, distribute, or commercially exploit course content</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Harass, abuse, or harm teachers or other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All course content, including videos, exercises, worksheets, and materials, are the intellectual property of SCHROOL and are protected by Australian and international copyright laws. You are granted a limited, non-exclusive, non-transferable license to access and use the content for personal educational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              SCHROOL provides educational services "as is" without warranties of any kind. We do not guarantee specific academic outcomes. To the maximum extent permitted by law, SCHROOL shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms. Upon termination, your right to access the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of New South Wales, Australia. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of New South Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> support@schrool.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +61 499 989 179</p>
              <p className="text-gray-700"><strong>Address:</strong> Sydney, NSW, Australia</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/privacy">
            <a className="text-blue-600 hover:text-blue-700 font-medium">
              View Privacy Policy →
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Link } from "wouter";

export default function Privacy() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 27, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              SCHROOL ("we", "our", or "us") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our online mathematics education platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">2.1 Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We collect personal information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Student name, email address, and year level</li>
                  <li>Parent/guardian name, email address, and phone number</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Timezone and scheduling preferences (Premium Elite tier)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">2.2 Usage Data</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We automatically collect certain information when you use our Service:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Lesson completion progress and quiz scores</li>
                  <li>Time spent on lessons and exercises</li>
                  <li>Login dates and times</li>
                  <li>Device information and IP address</li>
                  <li>Browser type and operating system</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">2.3 Communications</h3>
                <p className="text-gray-700 leading-relaxed">
                  Messages exchanged between students, parents, and teachers through our platform are stored securely to facilitate educational support and maintain service quality.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide, maintain, and improve our educational services</li>
              <li>Process payments and manage enrollments</li>
              <li>Schedule and conduct tutoring sessions (Premium Elite tier)</li>
              <li>Track student progress and generate performance reports</li>
              <li>Communicate with students and parents about courses and support</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Send administrative information, updates, and security alerts</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.1 With Your Consent</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may share your information with third parties when you give us explicit consent to do so.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.2 Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We share information with trusted third-party service providers who assist us in operating our platform:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                  <li><strong>Zoom:</strong> Video conferencing for tutoring sessions</li>
                  <li><strong>Cloud hosting providers:</strong> Data storage and platform infrastructure</li>
                  <li><strong>Email service providers:</strong> Transactional and support communications</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.3 Teachers</h3>
                <p className="text-gray-700 leading-relaxed">
                  For Premium Elite tier students, assigned teachers have access to student names, progress data, and parent contact information to provide personalized instruction and support.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.4 Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose your information if required by law, court order, or government regulation, or to protect the rights, property, or safety of SCHROOL, our users, or others.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.5 What We Don't Do</h3>
                <p className="text-gray-700 leading-relaxed">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and updates</li>
              <li>PCI-DSS compliant payment processing through Stripe</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. Student progress data is retained for the duration of enrollment plus 12 months to support continuity if students re-enroll. After this period, personal information is securely deleted or anonymized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is designed for students aged 10-15 years. We collect only the minimum necessary information from students and require parental/guardian consent during enrollment. Parents have the right to review, update, or request deletion of their child's information by contacting us at support@schrool.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under Australian privacy law, you have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your information (subject to legal obligations)</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data portability:</strong> Request your data in a portable format</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact us at support@schrool.com. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage and performance</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service may contain links to third-party websites (e.g., Zoom for tutoring sessions). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. For significant changes, we will notify you via email. Your continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> support@schrool.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +61 499 989 179</p>
              <p className="text-gray-700"><strong>Address:</strong> Sydney, NSW, Australia</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              For privacy complaints, you may also contact the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/terms">
            <a className="text-blue-600 hover:text-blue-700 font-medium">
              View Terms of Service →
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';

const TermsOfServiceView: React.FC<NavProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation onNavigate={onNavigate} />
      <main className="pt-16 px-6">
        <div className="max-w-4xl mx-auto py-12">
          <button
            onClick={() => onNavigate(ViewState.LANDING)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-white/60 mb-12">Last Updated: December 2024</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-white/80 leading-relaxed">
                By accessing or using AIBC Media, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                You may use our service for lawful purposes only. You are responsible for all content you create using our platform. You agree not to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Account Responsibilities</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your account information is accurate and up-to-date</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                Content you create using AIBC Media belongs to you. However, by using our service, you grant us a license to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Store, process, and display your content as necessary to provide the service</li>
                <li>Use your content for service improvement and analytics</li>
                <li>Display your content to other users when you choose to share it</li>
              </ul>
              <p className="text-white/80 leading-relaxed mt-4">
                Our platform, including its design, technology, and proprietary algorithms, remains our intellectual property and is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                Paid subscriptions are billed in advance on a monthly or annual basis. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Pay all fees associated with your subscription</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Price changes with 30 days notice</li>
                <li>No refunds for partial billing periods unless required by law</li>
              </ul>
              <p className="text-white/80 leading-relaxed mt-4">
                Refunds are available within 14 days of purchase for annual plans. Contact us at <a href="mailto:billing@aibcmedia.com" className="text-orange-500 hover:text-orange-400">billing@aibcmedia.com</a> for refund requests.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-white/80 leading-relaxed">
                AIBC Media is provided "as is" without warranties of any kind, either express or implied. We are not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We reserve the right to suspend or terminate accounts that:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Fail to pay subscription fees</li>
                <li>Abuse or misuse the service</li>
              </ul>
              <p className="text-white/80 leading-relaxed mt-4">
                You may cancel your account at any time through your account settings or by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-white/80 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p className="text-white/80 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p className="text-white/80 leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-white/80 leading-relaxed mt-2">
                Email: <a href="mailto:legal@aibcmedia.com" className="text-orange-500 hover:text-orange-400">legal@aibcmedia.com</a><br />
                Address: AIBC Media Inc., 852 Lagoon Road, Majuro, Marshall Islands MH 96960
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default TermsOfServiceView;


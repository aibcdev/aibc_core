import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';

const PrivacyPolicyView: React.FC<NavProps> = ({ onNavigate }) => {
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

          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-white/60 mb-12">Last Updated: December 2024</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Account information (name, email address, password)</li>
                <li>Profile information and preferences</li>
                <li>Content you create using our platform</li>
                <li>Payment and billing information</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Personalize and improve your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We do not sell or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Service providers who assist us in operating our platform</li>
                <li>Business partners for joint services or features</li>
                <li>Legal authorities when required by law or to protect our rights</li>
                <li>Other users when you choose to share content publicly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-white/80 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your personal information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-white/80 leading-relaxed mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@aibcmedia.com" className="text-orange-500 hover:text-orange-400">privacy@aibcmedia.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
              <p className="text-white/80 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
              <p className="text-white/80 leading-relaxed">
                Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="text-white/80 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-white/80 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-white/80 leading-relaxed mt-2">
                Email: <a href="mailto:privacy@aibcmedia.com" className="text-orange-500 hover:text-orange-400">privacy@aibcmedia.com</a><br />
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

export default PrivacyPolicyView;


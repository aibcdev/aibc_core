import React, { useState } from 'react';
import { X } from 'lucide-react';

const Footer: React.FC = () => {
  const [showModal, setShowModal] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  const modalContent = {
    privacy: {
      title: 'Privacy Policy',
      content: `AIBC Media Privacy Policy

Last Updated: December 2024

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.

3. Information Sharing
We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in operating our platform.

4. Data Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Your Rights
You have the right to access, correct, or delete your personal information. Contact us at privacy@aibcmedia.com for any requests.

6. Contact Us
For any questions about this Privacy Policy, please contact us at privacy@aibcmedia.com.`
    },
    terms: {
      title: 'Terms of Service',
      content: `AIBC Media Terms of Service

Last Updated: December 2024

1. Acceptance of Terms
By accessing or using AIBC Media, you agree to be bound by these Terms of Service.

2. Use of Service
You may use our service for lawful purposes only. You are responsible for all content you create using our platform.

3. Account Responsibilities
You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

4. Intellectual Property
Content you create using AIBC Media belongs to you. Our platform, including its design and technology, remains our intellectual property.

5. Subscription and Payments
Paid subscriptions are billed in advance. Refunds are available within 14 days of purchase for annual plans.

6. Limitation of Liability
AIBC Media is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages.

7. Termination
We reserve the right to suspend or terminate accounts that violate these terms.

8. Contact
For questions about these Terms, contact us at legal@aibcmedia.com.`
    },
    cookies: {
      title: 'Cookie Settings',
      content: `AIBC Media Cookie Policy

We use cookies to enhance your experience on our platform.

Essential Cookies (Required)
These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.

Analytics Cookies
We use analytics cookies to understand how visitors interact with our website. This helps us improve our services.

Marketing Cookies
These cookies are used to track visitors across websites to display relevant advertisements.

Managing Cookies
You can manage your cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.

Contact
For questions about our cookie practices, contact us at privacy@aibcmedia.com.`
    }
  };

  return (
    <>
      <footer className="py-12 border-t border-white/5 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white">AIBC</span>
              <span className="text-lg font-normal text-white">MEDIA</span>
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              <button onClick={() => setShowModal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => setShowModal('terms')} className="hover:text-white transition-colors">Terms of Service</button>
              <button onClick={() => setShowModal('cookies')} className="hover:text-white transition-colors">Cookie Settings</button>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-white/30">
            © {new Date().getFullYear()} AIBC Media. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{modalContent[showModal].title}</h2>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-white/70 font-sans leading-relaxed">
                {modalContent[showModal].content}
              </pre>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setShowModal(null)}
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;





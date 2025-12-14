import React, { useState } from 'react';
import { ViewState } from '../../types';

interface FooterProps {
  onNavigate?: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [showModal, setShowModal] = useState<'cookies' | null>(null);

  const modalContent = {
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
      <footer className="w-full bg-black border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo and Copyright */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-black">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight text-white">AIBC Media</span>
              <span className="text-sm text-white/40">© {new Date().getFullYear()}</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
              <button 
                onClick={() => onNavigate?.(ViewState.PRIVACY_POLICY)} 
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => onNavigate?.(ViewState.TERMS_OF_SERVICE)} 
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => setShowModal('cookies')} 
                className="hover:text-white transition-colors"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{modalContent[showModal].title}</h2>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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

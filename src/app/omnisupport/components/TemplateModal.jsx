"use client"; // This directive is ESSENTIAL for App Router client components

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, BotMessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // For smooth animations

// Template names taken directly from your screenshot
const TEMPLATES = [
  'welcome_dormant',
  'welcome_basics',
  'welcome_active',
  'potential_user',
  'welcome_decline',
  'welcome_leads',
  'country_updates'
];

// Storing the content for each template (no changes here)
const TEMPLATE_CONTENT = {
  potential_user: {
    header: "Karibu Tuma!",
    body: `Hey!💫
Thank you for your interest in Tuma! 💙
Tuma is a fast, secure, and simple way to send money back home to Africa from the UK– best exchange rates in the market, no hidden fees, no stress. 💸
Thanks for choosing Tuma🌍📲
 #TumaNaTuma
Cheers!🥂
Tuma Team.`
  },
  welcome_leads: {
    header: "Karibu Tuma!",
    body: `Hey!💫
A hearty Welcome to the Tuma family💙, where every transaction is more than money — it’s connection, care, and love. 💙💸
We saw you downloaded Tuma (nice move! 😎) – but you didn’t finish setting things up.
Don’t leave us hanging! 💔 You're just one step away from sending money the smart, simple, and affordable way. 💸📲
Hit the app, finish onboarding, and let’s get you started! Need help? Just reply — we’re here 24/7. 
Thanks for choosing Tuma🌍📲
 #TumaNaTuma
Cheers!🥂
Tuma Team.`
  },
  welcome_basics: {
    header: "Karibu Tuma!",
    body: `Hi! 💫
A hearty Welcome to Tuma, we’re thrilled to have you join our growing community!💙💸
From now on, sending money home will be fast, simple, and full of heart 💖🏠
You've already created your account, now it's time to make your first transaction and enjoy the full Tuma experience — best exchange rates in the market, no hidden fees, no stress!💸
Got questions or need a hand? Just reply — we’re always here for you, 24/7.
Thanks for choosing Tuma🌍📲 
#TumaNaTuma

Cheers!🥂
Tuma Team.`
  },
  welcome_active: {
    header: "Karibu Tuma!",
    body: `Hi,
A hearty thank you for joining Tuma and for being an active part of the Tuma family! 
We're thrilled to see you transacting and trusting us with your transfers. Tuma was built with you in mind – an Africa-first app that makes sending money fast, secure, and stress-free.
Thanks for choosing Tuma – we’re just getting started! 
With love,
Team Tuma.`
  },
  welcome_decline: {
    header: "Oops!",
    body: `Hi ,

Thanks for signing up with Tuma.

We’ve reviewed your verification documents and, unfortunately, some of the details provided do not meet our internal risk and compliance policies.

As a result, we’re unable to proceed with offering our services at this time.

We appreciate your interest in Tuma and wish you all the best.

Kind regards,
Tuma Team`
  },
  welcome_dormant: {
    header: "We Miss You!🥹",
    body: `Hi! 👋🏾
We noticed it’s been a while since your last transaction with Tuma — we miss you! 💙
Don’t forget, Tuma still offers:
 ✅ Great exchange rates
 ✅ Zero hidden fees
 ✅ Fast & secure delivery to Africa 💸
If there’s anything we can do to help or improve your experience, just let us know. We’re here for you!
Karibu tena to Tuma — we’d love to serve you again. 🙌🏾
With love,
Team Tuma.`
  },
  country_updates:{
    header: "Tuma just got better!",
    body: `
    Hi,👋🏽 

 🌍 Send money to 12 more African countries
 🔔 Get instant in-app updates
 🔒 Enjoy stronger security

Update Tuma app now to enjoy the improved experience:
    `
  }
};


export default function TemplateModal({ closeModal, onSelectTemplate, userName }) {
  const [sendingTemplate, setSendingTemplate] = useState(null);
  // State to hold the name of the template currently being hovered over
  const [hoveredTemplateName, setHoveredTemplateName] = useState(null);

  const handleSelect = async (templateName) => {
    setSendingTemplate(templateName);
    await onSelectTemplate(templateName);
    setSendingTemplate(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-full">
            <BotMessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Send a Template</h2>
            <p className="text-sm text-gray-500">Choose a template to send to {userName}.</p>
          </div>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {TEMPLATES.map((name) => {
            const isHovered = hoveredTemplateName === name;
            const content = TEMPLATE_CONTENT[name];
            const messageBody = content.body.replace(/\[(First Name|Client’s Name)\]/g, userName);

            return (
              <div
                key={name}
                onMouseEnter={() => setHoveredTemplateName(name)}
                onMouseLeave={() => setHoveredTemplateName(null)}
                className="border border-gray-100 rounded-lg overflow-hidden transition-all duration-300"
              >
                {/* --- Always Visible Header --- */}
                <div className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50">
                  <span className="flex-grow font-medium text-gray-700 capitalize">
                    {name.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => handleSelect(name)}
                    disabled={!!sendingTemplate}
                    className="flex-shrink-0 ml-4 text-xs text-white bg-green-500 font-semibold px-3 py-1.5 rounded-full transition-colors hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {sendingTemplate === name ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "SEND"
                    )}
                  </button>
                </div>
                
                {/* --- Animated Preview Section --- */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="bg-gray-50 border-t border-gray-200"
                    >
                      <div className="p-4 space-y-3">
                        <p className="font-bold text-gray-800">{content.header}</p>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{messageBody}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

TemplateModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onSelectTemplate: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
};
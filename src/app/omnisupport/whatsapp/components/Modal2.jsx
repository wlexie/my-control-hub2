import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaEnvelope, FaSms } from 'react-icons/fa';
import { BsPhone } from 'react-icons/bs';
import Modal3 from './Modal3'; // Import the new Modal3

// Template names taken directly from your screenshot and new additions
const TEMPLATES = [
  'welcome_dormant',
  'welcome_basics',
  'welcome_active',
  'potential_user',
  'welcome_decline',
  'welcome_leads',
  'country_updates',
  'insufficient_funds',
  'bank_restriction',
  'Paybill_Transaction',
  'pending_transaction',
  'error_help',
  'something_bigg', // New template
  'hint_teaser',   // New template
  'pre_announcement', // New template
 // 'flash_announcement', // New template
//  'flashhour_alert', // New template
    'flashh_hour',
    'flash_alert',
    'complete_ver',
    'test',
    'flash_live1',
    'after',
    'after_hour1',
    'apology5',
    'make_up',
        'redone',
  '5_days', 
  'tomorrow', 
    'lead_clients',
    '3_dayss',       // New template
  '3_days',       // New template
  'eve_reminder', // New template
  '4_hours',      // New template
  '1_hour',       // New template
  'flash_hour',   // New template
  'after_sale',   // New template
];

// Storing the content for each template
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
    make_up: {
    header: "Karibu Tuma!",
    body: `Hey!💫
Thank you for your interest in Tuma! 💙
Tuma is a fast, secure, and simple way to send money back home to Africa from the UK– best exchange rates in the market, no hidden fees, no stress. 💸
Thanks for choosing Tuma🌍📲

 #TumaNaTuma
Cheers!🥂
Tuma Team.`
  },
  redone: {
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
Don’t leave us hanging!💔 You're just one step away from sending money the smart, simple, and affordable way. 💸📲
Hit the app, finish onboarding, and let’s get you started! Need help? Just reply — we’re here 24/7.
Thanks for choosing Tuma🌍📲
 #TumaNaTuma
Cheers!🥂
Tuma Team.`
  },
   after: {
    header: "Karibu Tuma!",
    body: `Thank you so much for being part of our Flash Hour today! 🙌
We truly appreciate the support and excitement.
We did experience some technical issues due to the high traffic.
If you tried to transact but couldn’t, don’t worry — we’ll reach out and offer you a special rate just for you. Our team is already on it ✅
We’re grateful for your patience and trust as we continue building a more seamless TUMA experience for you. 
For now as Tuma, we say thank you for the amazing turnout! 💙
More exciting offers coming soon!
`
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
   make_up: {
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
    flash_hour1: {
    header: "🚨 IT’S LIVE — TUMA FLASH HOUR 💥",
    body: `
    💸 IT’S GO TIME!
For the next ONE HOUR only: 5PM–6PM UK ⏰
💷 1 GBP = 200 KES 💷
No fees. Just the best rate in history! 🤯
Send to mum, shosh, mjengo, or savings — make it count before 6PM (UK)!
`
    },
    tomorrow: {
    header: "Tomorrow it’s raining money 🌧️💷",
    body: `Hi 👋
Are you ready? It's tomorrow!
1 GBP = 200 KES | 31 Oct, 5–6PM UK!
Finish that mjengo, buy that shamba, support mum & shosh, or stack up for savings and investments 💚
Is your App ready? Card added? Be there when the clock hits 5 to TUMA fast! ⏰
`  
      },
        apology5: {
    header: "Tomorrow it’s raining money 🌧️💷",
    body: `We owe you a BIG apology 😔
Flash Hour got too lit — traffic went crazy and caused a technical hiccup. We know that was annoying, and we’re really sorry.

The good news: everything is fixed now ✅
To make it right, we’d love to offer you a personal rat  e of 1 GBP - KES 200 tomorrow from 5–6pm UK time, just like Flash Hour — exclusively for you 💙 No crowd. No chaos.
Hope you can give us another shot 🙏
We appreciate you & we’re glad you’re part of Tuma 
`
  },
   after_hour1: {
    header: "after hour",
    body: `Hi {{1}},

Flash Hour Wrapped! 💙

Thank you so much for being part of our Flash Hour today! 🙌We truly appreciate the support and excitement.

We did experience some technical issues due to the high traffic.

If you tried to transact but couldn’t, don’t worry — we’ll reach out and offer you a special rate just for you. Our team is already on it ✅

We’re grateful for your patience and trust as we continue building a more seamless TUMA experience for you. 

For now as Tuma, we say thank you for the amazing turnout! 💙

More exciting offers coming soon!

`
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
   complete_ver: {
    header: "ID Re-upload Needed 🔁",
    body: `Hi 👋

Thank you for submitting your documents to Tuma! Since you’re signing up from the UK, we’ll need a UK-issued Identification document to complete your verification.

Please upload any one clear document below at your earliest convenience:
✅ UK Passport, or
✅ UK Driving Licence, or 
✅ Biometric Residence Permit (BRP)

Use this link to re-submit:
🔗 https://eu.onfido.app/f/7ce8946f-e6eb-414c-a2c5-3bc78638c86f 
If you have an e-visa, please send a screenshot to this chat.
We’ll verify your account right away so you can start sending money seamlessly✅
Thanks!

~ Team Tuma 💙
`
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
 🔒 Enjoy stronger securities

Update Tuma app now to enjoy the improved experience:
    `
  },
  insufficient_funds:{
    header: "💸Top up your account💸",
    body: `
  Hi😊

We noticed your transaction didn’t go through due to insufficient funds.
You can try topping up your account or use a different card 💳.
Let us know if you need any help!💬
With 💙,
Team Tuma.
    `
  },
    bank_restriction:{
    header: "Bank authorization💳",
    body: `
   Hi 😊

We noticed your transaction was unsuccessful due to a restriction placed by your bank — this often happens when using a new card 💳 or trying a larger transaction for the first time on Tuma💸.
Kindly contact your bank to authorize the transaction✅.

Once that’s done, just let us know and we’ll help reactivate your Tuma account 🚀
With 💙,
Team Tuma.
    `
  },
    Paybill_Transaction:{
    header: "Hang Tight 🤗",
    body: `
   Hi 😊

Your paybill payment was received. We’re completing the service and will confirm once it’s done. Thank you for your patience."
With 💙,
Team Tuma.
    `
  },
    pending_transaction:{
    header: "Transaction in Progress 🔄",
    body: `
  Hi 😊
  Your transaction is processing and will be completed soon⏳💸. We’ll notify you as soon as it’s done.

  Thanks for bearing with us!"

  With 💙,
  Team Tuma.
    `
  },
    flash_announcement:{
    header: "🚨 TUMA FLASH HOUR ALERT!🚨",
    body: `
 It’s official fam💥  — Tuma Flash Hour is going LIVE!

On 31st of October 2025, 5PM - 6PM UK time, Tuma customers will be able to send money at the highest rate ever seen in the market : 1 GBP = 200 KES
 
Only 1 hour to grab the best exchange rate in history — with zero fees! 🎉💰
👀 Ready your app. Get your wallet ready — it’s about to go down! 💣
💸 Don’t just hear about it… be part of it!
    `
  },
    flashhour_alert:{
    header: "🚨 TUMA FLASH HOUR ALERT!🚨",
    body: `
 It’s official fam💥  — Tuma Flash Hour is going LIVE!

On 31st of October 2025, 5PM - 6PM UK time, Tuma customers will be able to send money at the highest rate ever seen in the market : 1 GBP = 200 KES
 
Only 1 hour to grab the best exchange rate in history — with zero fees! 🎉💰
👀 Ready your app. Get your wallet ready — it’s about to go down! 💣
💸 Don’t just hear about it… be part of it!
    `
  },
    flash_alert:{
    header: "⏰ 200 Reasons to Use Tuma!",
    body: `
Did you hear it? 👀 Tuma is making history! 
🗓️ Friday, 31 Oct — 5 - 6PM (UK)
💷 1GBP = 200 KES — one hour only!
🔥 Best exchange rate ever. Zero fees.
💥 Keep your app close, and your card ready! 💨
💬 Don’t gatekeep — share with your people before they say “ulichelewa bro!” 😅
👉 Learn more: https://tuma.com/ 
    `
  },
      flashh_hour:{
    header: "🚨 TUMA FLASH HOUR ALERT!🚨",
    body: `
 It’s official fam💥  — Tuma Flash Hour is going LIVE!

On 31st of October 2025, 5PM - 6PM UK time, Tuma customers will be able to send money at the highest rate ever seen in the market : 1 GBP = 200 KES
 
Only 1 hour to grab the best exchange rate in history — with zero fees! 🎉💰
👀 Ready your app. Get your wallet ready — it’s about to go down! 💣
💸 Don’t just hear about it… be part of it!
    `
  },
    error_help:{
    header: "Let’s Sort This Out 🤝",
    body: `
  Hi 😊
  We understand you may have run into an issue. Could you please share a screenshot 📸 and a short description of the error you’re seeing? This will help us sort it out for you quickly ✅"

  With 💙,
  Team Tuma.
    `
  },
  // New Templates
  something_bigg: {
    header: "👀 Something’s Coming...",
    body: `Hi [Name]😊
Shhh 🤫… we can’t say much yet, but something wild is about to drop on Tuma!
Keep your eyes peeled 👀 — the group chats will go wild soon 😎
We’re about to drop a deal that’ll make you say “Aki Tuma mko serious?!”
History’s about to be made 💸
Follow us for the thrill and exclusive hints, don’t say we didn’t tell you 👀🔥
IG: instagram.com/tuma_app
FB: facebook.com/share/19E5CiZnAF/?mibextid=wwXIfr`
  },
  hint_teaser: {
    header: "Blink and you’ll miss it!",
    body: `A Tuma surprise is on the way 💥
Unaeza guess ni nini?
It’s short, fast, hot, and might just make your transfers worth double 👀— and if you blink, utamiss! Na ukimiss, that’s on you 🤫
Follow us for the full reveal — and share the secret before it drops!
#KaaRada
Call to action Buttons:
Tell a Friend
Follow us on IG: instagram.com/tuma_app
Follow us on FB: facebook.com/share/19E5CiZnAF/?mibextid=wwXIfr`
  },
  pre_announcement: {
    header: "🤫 We can’t hold it in much longer…",
    body: `Your pounds are about to stretch further than your jeans after Christmas dinner 💷🔥
Ready your app. Load your wallet. Tell your people🥳.

Stay tuned — reveal drops tomorrow 🔥
Call to action Buttons:
👀 Tell a friend (before they blame you later!)
Follow us on IG: instagram.com/tuma_app
Follow us on FB: facebook.com/share/19E5CiZnAF/?mibextid=wwXIfr`
  },
  flash_announcement: {
    header: "🚨 FLASH SALE ALERT!🚨",
    body: `It’s official fam💥 — Tuma Flash Sale is going LIVE!

On 31st of October 2025, between 5PM and 6PM UK time, Tuma customers will be able to send money at the highest rate ever seen in the market : 1 GBP = 200 KES

Only 1 hour to grab the best exchange rate in history — with zero fees! 🎉💰
👀 Ready your app. Get your wallet ready — it’s about to go down! 💣
💸 Don’t just hear about it… be part of it!
Learn About the Flash Sale → https://tuma.com/flashsale (precise link to be provided later)`
  },
  '5_days': { // Using string literal for template names that start with a number
    header: "⏰ 200 Reasons to use Tuma!",
    body: `In just 5 days, the game changes.
Mark your calendar!
🗓️ Friday 31 Oct, 5PM (UK)
💷 Be ready or utachekwa later 😅
🔥 The best exchange rate in history is coming… and it’s waiting for you!
💸1GBP = 200 KES for just 1 hour
💥 Keep your app close, and your wallet closer 💨
💬 Don’t gatekeep this one. Share it with your people!
Call to action Buttons:
📱 Open Tuma App (iOS)
🤖 Open Tuma App (Android)`
  },
  '3_days': { // Using string literal
    header: "⏳ 3 DAYS TO GO!",
    body: `The Tuma Flash Sale lands this Friday at 5PM (UK) 💥
Best rate ever. Zero fees. 1 GBP = 200 KES for one hour only.
Before the clock hits 5PM…
🛠️ Update your app
🪪 Complete your verification
💰 Load up and get ready to send
💸 Don’t fumble the bag, champ 😅
Call to action Buttons:
📱 Open Tuma App (iOS)
🤖 Open Tuma App (Android)`
  },
    '3_dayss': { // Using string literal
    header: "⏳ 3 DAYS TO GO!",
    body: `The Tuma Flash Sale lands this Friday at 5PM (UK) 💥
Best rate ever. Zero fees. 1 GBP = 200 KES for one hour only.
Before the clock hits 5PM…
🛠️ Update your app
🪪 Complete your verification
💰 Load up and get ready to send
💸 Don’t fumble the bag, champ 😅
Call to action Buttons:
📱 Open Tuma App (iOS)
🤖 Open Tuma App (Android)`
  },
  eve_reminder: {
    header: "🚨 Tomorrow. One Hour. One Legendary Rate. 🚨",
    body: `It’s finally here — the Tuma Flash Sale!
💷 1 GBP = 200 KES — yes, you read that right! The best exchange rate in history! 🤯
🗓️ Date: Friday, 31 Oct
🕔 Time: 5PM–6PM UK / 7PM–8PM EAT
✅ Update your app
✅ Verify your account
✅ Get ready to hit “Send” the moment the sale starts!
Call to action Buttons:
📱 Open Tuma App (iOS)
🤖 Open Tuma App (Android)`
  },
  '4_hours': { // Using string literal
    header: "⏰ 4 HOURS TO HISTORY! 💷",
    body: `We’re just hours away from the Tuma Flash Sale — and the record-breaking rate of 1 GBP = 200 KES 🤯

One hour only. Zero fees. Maximum value.
🕔 5PM–6PM UK TIME

Call to action buttons
📱 Open Tuma App (iOS)
🤖 Open Tuma App (Android)`
  },
  '1_hour': { // Using string literal
    header: "🚀 T-MINUS 1 HOUR — LET’S GO! 💸",
    body: `The countdown is real!
In just 1 hour, you can send money at the best rate ever — 1 GBP = 200 KES!
💰 Zero fees. One hour only.
📲 Open your Tuma App, make sure it’s updated, and be ready to tap “Send.”
🎯 Set your timer — it’s go-time at 5PM UK TIME

Call to action buttons
📱 Open Tuma App (iOS)
🤖 Open Tuma App (Android)`
  },
  flash_hour: {
    header: "💥IT’S LIVE! 🚨 — 1 GBP = 200 KES 💷 💥",
    body: `💸 IT’S GO TIME!
Flash Sale is LIVE — 5PM–6PM UK ⏰
Send NOW and get the best exchange rate ever + zero fees 💚
📲 Open your Tuma App NOW and send before the clock runs out!
Don’t miss the biggest deal in remittance history.
Call to action Buttons:
📱 Send Money (iOS)
🤖 Send Money (Android)`
  },
    lead_clients: {
    header: "3 Minutes & You’re In! ✨",
    body: `Hi 👋
Welcome to Tuma!
You’re just a few minutes away from activating your account to enjoy Tuma’s special rate this Friday of 200 bob! 
The verification is super simple — it takes less than 3 minutes.
See the video above for a step-by-step guide to get verified 🎥
Once done, your account will be activated and ready for Flash Hour.
 If you need help, just reply — we’re here for you 💙
~ Team Tuma
`
  },
  after_sale: {
    header: "💥 What. A. Sale! 💥",
    body: `You guys showed up BIG! 🙌

Thank you to everyone who joined our first-ever Tuma Flash Sale 🎉
The love was unreal — best rate, best fam, best vibes 💷 — and wow, what a ride! 💸
Those who sent at 200 KES know the feeling 😎

Keep your eyes peeled for what’s coming next 👀

👉 Follow for the next surprise
IG: instagram.com/tuma_app
FB: facebook.com/share/19E5CiZnAF/?mibextid=wwXIfr`
  }
};


const Modal2 = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [channel, setChannel] = useState('WhatsApp');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplateName, setSelectedTemplateName] = useState(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  // State for Modal3 visibility and data
  const [isModal3Open, setIsModal3Open] = useState(false);
  const [templateDataForModal3, setTemplateDataForModal3] = useState({
    name: '',
    subject: '',
    body: '',
  });


  // Filtered templates based on search term
  const filteredTemplates = TEMPLATES.filter(template =>
    template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Effect to update subject and body when a template is selected
  useEffect(() => {
    if (selectedTemplateName && TEMPLATE_CONTENT[selectedTemplateName]) {
      // Use the header from TEMPLATE_CONTENT, if available, otherwise default to template name
      setMessageSubject(TEMPLATE_CONTENT[selectedTemplateName].header || selectedTemplateName);
      setMessageBody(TEMPLATE_CONTENT[selectedTemplateName].body);
    } else {
      setMessageSubject('');
      setMessageBody('');
    }
  }, [selectedTemplateName]);

  const handleTemplateSelect = (templateName) => {
    setSelectedTemplateName(templateName);
  };

  const handleSendToModal3 = () => {
    if (selectedTemplateName) {
      setTemplateDataForModal3({
        name: selectedTemplateName,
        subject: messageSubject, // Pass the already set subject
        body: messageBody,      // Pass the already set body
      });
      setIsModal3Open(true);
      // Optionally, you might want to close Modal2 here or keep it open.
      // For now, let's keep Modal2 open in the background until Modal3 is closed.
    } else {
      alert("Please select a template first!");
    }
  };

  const closeModal3 = () => {
    setIsModal3Open(false);
    // When Modal3 closes, you might want to reset selected template in Modal2 or close Modal2
    // For this example, let's just close Modal3 and leave Modal2 as is.
  };

  return (
    <>
    
      <div className="fixed inset-0 bg-black/50 z-20 flex items-center  justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[95vh] overflow-y-auto"> {/* Added max-h-[95vh] and overflow-y-auto here */}
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Templates</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6"> {/* This div will now scroll within the max-height container */}
            {/* Channel Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Channel</h3>
              <div className="grid grid-cols-4 gap-3">
                <button
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors duration-200 ${
                    channel === 'WhatsApp'
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setChannel('WhatsApp')}
                >
                  <FaWhatsapp className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors duration-200 ${
                    channel === 'Email'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setChannel('Email')}
                >
                  <FaEnvelope className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Email</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors duration-200 ${
                    channel === 'SMS'
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setChannel('SMS')}
                >
                  <FaSms className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">SMS</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors duration-200 ${
                    channel === 'In-App'
                      ? 'bg-purple-100 border-purple-500 text-purple-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setChannel('In-App')}
                >
                  <BsPhone className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">In-App</span>
                </button>
              </div>
            </div>

            {/* Template Search and List */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Search Templates</h3>
              <div className="relative  mb-4">
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>

              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((templateName) => (
                    <div
                      key={templateName}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        selectedTemplateName === templateName ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-800'
                      }`}
                      onClick={() => handleTemplateSelect(templateName)}
                    >
                      {templateName}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No templates found.</div>
                )}
              </div>
            </div>

            {/* Subject (Template Name/Header) */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Subject</h3>
              <input
                type="text"
                placeholder="Select a template to prefill subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                value={messageSubject}
                readOnly // Non-editable
              />
            </div>

            {/* Message (Template Body) */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Message</h3>
              <textarea
                placeholder="Select a template to prefill message body"
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none resize-y"
                value={messageBody}
                readOnly // Non-editable
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Save Draft
            </button>
            <button
              onClick={handleSendToModal3} // Changed handler
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Render Modal3 here */}
      <Modal3
        isOpen={isModal3Open}
        onClose={closeModal3}
        templateName={templateDataForModal3.name}
        templateSubject={templateDataForModal3.subject}
        templateBody={templateDataForModal3.body}
        selectedChannel={channel} // Pass the selected channel from Modal2
      />
    </>
  );
};

export default Modal2;
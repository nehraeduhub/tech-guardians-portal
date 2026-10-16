import { readSetting, publishSetting } from '@/lib/shared-settings';
export interface TGBlog {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  image: string;
  date: string;
  enabled: boolean;
  language: 'en' | 'hi';
}

export const BLOGS_KEY = 'tg_blogs';

export const DEFAULT_BLOGS: TGBlog[] = [
  {
    id: 'b1',
    title: 'Phishing in 2026: The Scams That Still Work',
    category: 'Awareness',
    summary:
      'Fake delivery slips, KYC expiry alerts and job offers keep draining Indian bank accounts. Learn the four checks that stop them.',
    body:
      'Phishing is no longer a badly written email. Today it arrives as a courier "address correction" link, a bank KYC expiry SMS, or a WhatsApp job offer with a polished landing page.\n\nFour checks before you tap anything:\n1. Read the domain from right to left — the real brand name must sit immediately before the .com or .in.\n2. Never open a payment or login page from a message; open the official app yourself.\n3. Money never comes to you for "processing fees". Any request to pay first is fraud.\n4. Turn on two-factor authentication so a stolen password alone is useless.\n\nIf you already entered details, change the password on that account and every account reusing it, then call 1930 within the first hour if money moved.',
    image: '/images/cyber-lock.svg',
    date: '2026-08-28',
    enabled: true,
    language: 'en',
  },
  {
    id: 'b2',
    title: 'Password Hygiene: From "rahul@123" to Unbreakable',
    category: 'Best Practices',
    summary:
      'Most breaches begin with one weak or reused password. Here is a system that is both strong and easy to remember.',
    body:
      'In our live demos a password like "rahul@123" falls in under a second. Length beats complexity: a four-word passphrase such as "orange-tractor-lamp-river" takes centuries to crack and is easy to recall.\n\nBuild the habit:\n• One unique passphrase per important account — email first, because email resets everything else.\n• Use a password manager so you only remember one master phrase.\n• Enable 2FA with an authenticator app rather than SMS wherever possible.\n• Check your email on a breach-notification service every few months and rotate anything exposed.\n\nStrong passwords are not about memory tricks. They are about removing reuse.',
    image: '/images/cyber-shield.svg',
    date: '2026-08-20',
    enabled: true,
    language: 'en',
  },
  {
    id: 'b3',
    title: 'UPI Fraud: What To Do in the First 60 Minutes',
    category: 'Cyber Crime',
    summary:
      'Speed decides recovery. A practical, hour-by-hour response plan for UPI and net-banking fraud in India.',
    body:
      'Recovery odds fall sharply after the first hour, so treat UPI fraud like a medical emergency.\n\nMinute 0–10: Call your bank and freeze the account or card. Screenshot the transaction, the UTR and any chat with the fraudster.\n\nMinute 10–30: Call the national helpline 1930 and file on cybercrime.gov.in. Quote the UTR — it is what lets banks trace and hold the money downstream.\n\nMinute 30–60: Email your bank the complaint acknowledgement number. Report the UPI ID or number inside the payment app so it is flagged for other users.\n\nAfterwards: never share OTPs, never install remote-access apps such as screen-sharing tools during a "support call", and set a daily transfer limit that matches your real spending.',
    image: '/images/cyber-network.svg',
    date: '2026-08-12',
    enabled: true,
    language: 'en',
  },
  {
    id: 'b4',
    title: 'Social Media Privacy Settings You Should Fix Today',
    category: 'Privacy',
    summary:
      'Your public profile is an attacker\u2019s research file. Ten minutes of settings work removes most of the exposure.',
    body:
      'Before a targeted attack, criminals build a profile: your workplace, your family names, your travel, your pet — the same answers used in security questions.\n\nDo this in ten minutes:\n• Set old posts to friends-only in bulk (Facebook and Instagram both support it).\n• Remove your phone number and birth year from public view.\n• Turn off location tagging and review which apps still have account access.\n• Lock down who can find you by phone number or email.\n• Review active login sessions and remove devices you no longer use.\n\nLess public data means fewer convincing scams aimed at you and at your family.',
    image: '/images/cyber-lock.svg',
    date: '2026-08-04',
    enabled: true,
    language: 'en',
  },
  {
    id: 'b5',
    title: 'Digital Forensics Basics: Preserving Evidence Correctly',
    category: 'Forensics',
    summary:
      'What victims and first responders should never do with a compromised phone or laptop — and what to capture instead.',
    body:
      'Most cases weaken because evidence is destroyed by the victim, not the attacker.\n\nDo not: factory reset the device, delete the fraudulent chats, keep transacting from the same account, or install "recovery" software from an unknown source.\n\nDo: photograph the screen showing the full message with the sender ID and timestamp, export the chat with media, note the exact time and time zone, and record UTR or transaction references. Keep the device charged and offline if you suspect malware.\n\nInvestigators work with hashes and timelines. Clean, unaltered copies of the original evidence — captured early — are what turn a complaint into a solvable case.',
    image: '/images/cyber-shield.svg',
    date: '2026-07-25',
    enabled: true,
    language: 'en',
  },
  {
    id: 'b1-hi',
    title: 'फ़िशिंग से बचाव: चार आसान जाँच',
    category: 'जागरूकता',
    summary: 'डिलीवरी, KYC और नौकरी के नाम पर आने वाले नकली संदेशों को पहचानने के आसान तरीके।',
    body: 'फ़िशिंग संदेश अब बहुत असली दिखते हैं। किसी लिंक पर क्लिक करने से पहले वेबसाइट का सही पता जाँचें और बैंक या भुगतान ऐप को हमेशा उसके आधिकारिक ऐप से खोलें।\n\nचार जरूरी कदम:\n1. संदेश से मिले लिंक पर लॉगिन न करें।\n2. OTP, PIN और स्क्रीन शेयर कभी न करें।\n3. हर जरूरी खाते पर अलग पासवर्ड और 2FA लगाएँ।\n4. पैसे चले जाएँ तो तुरंत 1930 पर कॉल करें और cybercrime.gov.in पर शिकायत दर्ज करें।',
    image: '/images/cyber-lock.svg',
    date: '2026-08-28',
    enabled: true,
    language: 'hi',
  },
  {
    id: 'b2-hi',
    title: 'मजबूत पासवर्ड बनाने की सही आदत',
    category: 'सुरक्षा अभ्यास',
    summary: 'एक कमजोर या दोबारा इस्तेमाल किया गया पासवर्ड कई खातों को खतरे में डाल सकता है।',
    body: 'लंबा पासफ़्रेज़ छोटे और जटिल दिखने वाले पासवर्ड से अधिक सुरक्षित होता है। हर जरूरी खाते के लिए अलग पासफ़्रेज़ रखें और पासवर्ड मैनेजर का उपयोग करें।\n\nसबसे पहले ईमेल खाते को सुरक्षित करें, क्योंकि उसी से दूसरे खातों के पासवर्ड रीसेट होते हैं। जहाँ संभव हो, SMS के बजाय authenticator app वाला 2FA चालू करें।',
    image: '/images/cyber-shield.svg',
    date: '2026-08-20',
    enabled: true,
    language: 'hi',
  },
  {
    id: 'b3-hi',
    title: 'UPI धोखाधड़ी के बाद पहले 60 मिनट',
    category: 'साइबर अपराध',
    summary: 'तेजी से की गई शिकायत पैसे रोकने और वापस पाने की संभावना बढ़ाती है।',
    body: 'धोखाधड़ी होते ही बैंक को कॉल करके खाता या कार्ड सुरक्षित करें। लेनदेन, UTR और बातचीत के स्क्रीनशॉट रखें।\n\nतुरंत 1930 पर कॉल करें और cybercrime.gov.in पर शिकायत दर्ज करें। शिकायत संख्या बैंक को दें। कोई भी व्यक्ति पैसे वापस दिलाने के नाम पर OTP, PIN या रिमोट-एक्सेस ऐप माँगे तो जानकारी साझा न करें।',
    image: '/images/cyber-network.svg',
    date: '2026-08-12',
    enabled: true,
    language: 'hi',
  },
  {
    id: 'b4-hi',
    title: 'सोशल मीडिया की प्राइवेसी आज ही ठीक करें',
    category: 'गोपनीयता',
    summary: 'सार्वजनिक प्रोफ़ाइल से अपराधी आपकी पहचान और सुरक्षा सवालों की जानकारी जुटा सकते हैं।',
    body: 'पुरानी पोस्ट को friends-only करें, फोन नंबर और जन्म वर्ष सार्वजनिक प्रोफ़ाइल से हटाएँ, location tagging बंद करें और जुड़े हुए apps की समीक्षा करें।\n\nअपने खाते के active sessions देखें और अनजान डिवाइस हटाएँ। कम सार्वजनिक जानकारी का मतलब है आपके और आपके परिवार के खिलाफ कम भरोसेमंद दिखने वाले घोटाले।',
    image: '/images/cyber-lock.svg',
    date: '2026-08-04',
    enabled: true,
    language: 'hi',
  },
  {
    id: 'b5-hi',
    title: 'डिजिटल सबूत को सही तरीके से सुरक्षित रखें',
    category: 'फॉरेंसिक',
    summary: 'धोखाधड़ी के बाद फोन या लैपटॉप से महत्वपूर्ण सबूत मिटने न दें।',
    body: 'डिवाइस को factory reset न करें, संदेश न मिटाएँ और अनजान recovery software इंस्टॉल न करें। पूरी स्क्रीन, sender ID, तारीख और समय के साथ फोटो लें। चैट को media सहित export करें और UTR या transaction reference नोट करें।\n\nमूल सबूत को बिना बदले सुरक्षित रखना जाँच और शिकायत दोनों को मजबूत बनाता है।',
    image: '/images/cyber-shield.svg',
    date: '2026-07-25',
    enabled: true,
    language: 'hi',
  },
];

export const loadBlogs = (): TGBlog[] => readSetting(BLOGS_KEY, DEFAULT_BLOGS).map(blog => ({ ...blog, language: blog.language || 'en' }));
export const saveBlogs = (rows: TGBlog[]) => publishSetting(BLOGS_KEY, rows);

export const emptyBlog = (): TGBlog => ({
  id: `b${Date.now()}`,
  title: '',
  category: 'Awareness',
  summary: '',
  body: '',
  image: '/images/cyber-shield.svg',
  date: new Date().toISOString().slice(0, 10),
  enabled: true,
  language: 'en',
});

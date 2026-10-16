import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

// Terms & Conditions, privacy note and refund policy (Manage → Terms & Privacy).
// Section text format: blank line = new paragraph, "- " = bullet point,
// **text** = bold, {whatsapp} = the site WhatsApp number.

export const LEGAL_KEY = 'tg_legal';

export interface LegalSection { id: string; title: string; body: string; visible: boolean }
export interface LegalContent {
  updated: string;
  intro: string;
  /** Short privacy note shown at checkout, registration and in the PDF store. */
  note: string;
  sections: LegalSection[];
}

export const DEFAULT_LEGAL: LegalContent = {
  updated: '16 October 2026',
  intro: 'These terms apply when you use the Tech Guardians website, create a student account, or buy a training program, PDF book, product or service from us.',
  note: 'You don’t need to give real personal details. You may use a nickname, an alias email and any 10-digit number. Keep a note of what you enter and use the same details for your student account — that is how your purchase is linked to you for future login and support. We collect only what is needed, in line with the IT Act, 2000, the IT Rules, 2011 and the DPDP Act, 2023.',
  sections: [
    {
      id: 'privacy', visible: true, title: 'Your data — use dummy details if you prefer',
      body: `**You do not need to give us your real personal data.** To register a student account or to buy, you may use a nickname, an alias email address and any number in the phone field. We only need details that let us match your payment to your account and send you access.

**Keep a note of the details you use.** Use the **same** name, email and phone when you pay and when you register, and keep them safe. They are how you sign in later, how your purchases appear in My Account, and how we find your order if you need help. We cannot recover an account if you forget made-up details.

We follow the principle of **data minimisation** under the Information Technology Act, 2000, the IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 and the Digital Personal Data Protection Act, 2023: we ask only for what is needed, we never ask for passwords of other services, Aadhaar, PAN or bank details, and we do not sell or share your data for marketing.

What we store: the name, email and phone you enter, your order details, the UPI transaction ID and any payment screenshot you upload. Passwords are stored only in scrambled (hashed) form. You can ask us to delete your account and records at any time on WhatsApp.`,
    },
    {
      id: 'account', visible: true, title: 'Student accounts',
      body: `- Accounts are opened after Tech Guardians approves the request. We may refuse or disable an account that is misused.
- You are responsible for keeping your user ID and password secret. Do not share your account; course material and PDF links are for your own use.
- We cannot reset a password unless you can show that the account is yours (for example, the details you registered with and your payment transaction ID).`,
    },
    {
      id: 'payments', visible: true, title: 'Payments',
      body: `- Payments are made by UPI directly to the account shown on the checkout page. Always check the payee name before you pay.
- The price you pay is the price shown at checkout. Your order is confirmed after we match your UPI transaction ID with our records, usually within a few hours.
- Never pay anyone who contacts you claiming to be Tech Guardians from an unknown number. Our official WhatsApp is +{whatsapp}.
- Submitting a false transaction ID, or a payment made with someone else's account without permission, is an offence and will be reported.`,
    },
    {
      id: 'refunds', visible: true, title: 'Refunds and cancellations',
      body: `- **PDF books and digital downloads:** not refundable once the download link has been delivered, because the content cannot be returned. If a file is damaged or missing, we will replace it.
- **Training programs and sessions:** you may ask for a full refund before the first live class or session. After that, refunds are not given, but you may move to a later batch once.
- **Payment not verified:** if we cannot match your payment, contact us with the screenshot and we will resolve it or refund the amount we received.
- Approved refunds are sent back to the same UPI account within 7 working days.`,
    },
    {
      id: 'use', visible: true, title: 'Use of training content and tools',
      body: `- All books, videos, course material and tools are © Tech Guardians and are licensed for your personal learning only. Do not copy, resell, upload or share them.
- Ethical hacking techniques are taught **only for learning and for systems you own or are authorised to test**. Using them against others is a crime under the IT Act, 2000 (including Sections 43 and 66). Tech Guardians is not responsible for misuse.
- Free tools and portals are provided “as is” for awareness. For real incidents, report on **1930** or https://cybercrime.gov.in/`,
    },
    {
      id: 'law', visible: true, title: 'Governing law and contact',
      body: `These terms are governed by the laws of India. Any dispute will be handled by the competent courts at the place where Tech Guardians (Ms Seth Enterprises) is registered. We may update these terms; the date at the top shows the latest version.

Questions, data requests or complaints: WhatsApp **+{whatsapp}** or email ittechguardians@gmail.com`,
    },
  ],
};

export const loadLegal = (): LegalContent => {
  const saved = readSetting<Partial<LegalContent> | null>(LEGAL_KEY, null) || {};
  return {
    ...DEFAULT_LEGAL,
    ...saved,
    sections: Array.isArray(saved.sections) && saved.sections.length ? saved.sections : DEFAULT_LEGAL.sections,
  };
};

export const saveLegal = (content: LegalContent) => publishSetting(LEGAL_KEY, content);

export const useLegal = () => {
  const [legal, setLegal] = useState(loadLegal);
  useEffect(() => {
    const refresh = () => setLegal(loadLegal());
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  return legal;
};

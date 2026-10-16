import { FileText, Lock, RefreshCw, Scale, ShieldCheck, UserCheck } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import { getWhatsAppNumber } from '@/lib/site-settings';

// Terms & Conditions, privacy and refund policy. Linked from the checkout,
// the student account page, the PDF store and the footer.

const UPDATED = '16 October 2026';

const Block = ({ id, icon: Icon, title, children }: { id: string; icon: typeof FileText; title: string; children: React.ReactNode }) => (
  <ScrollReveal>
    <section id={id} className="glass-card scroll-mt-28 p-6 md:p-8">
      <h2 className="flex items-center gap-3 font-display text-xl font-bold text-foreground"><Icon className="h-6 w-6 text-primary" />{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground [&_b]:text-foreground [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </section>
  </ScrollReveal>
);

const Terms = () => {
  const wa = getWhatsAppNumber();
  return (
    <SiteFrame mainClassName="pt-24">
      <section className="section-padding pb-8">
        <div className="container mx-auto max-w-4xl">
          <span className="rl-eyebrow">Legal</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-5xl">Terms &amp; Conditions</h1>
          <p className="mt-4 text-muted-foreground">These terms apply when you use the Tech Guardians website, create a student account, or buy a training program, PDF book, product or service from us. Last updated: {UPDATED}.</p>
          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-xs">
            {[['privacy', 'Your data'], ['account', 'Student accounts'], ['payments', 'Payments'], ['refunds', 'Refunds'], ['use', 'Use of content'], ['law', 'Law & contact']].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-primary/30 px-3 py-1.5 text-primary hover:bg-primary/10">{label}</a>
            ))}
          </nav>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl space-y-6 px-4 pb-24 md:px-8">
        <Block id="privacy" icon={Lock} title="1. Your data — use dummy details if you prefer">
          <p><b>You do not need to give us your real personal data.</b> To register a student account or to buy, you may use a nickname, an alias email address and any number in the phone field. We only need details that let us match your payment to your account and send you access.</p>
          <p><b>Keep a note of the details you use.</b> Use the <b>same</b> name, email and phone when you pay and when you register, and keep them safe. They are how you sign in later, how your purchases appear in My Account, and how we find your order if you need help. We cannot recover an account if you forget made-up details.</p>
          <p>We follow the principle of <b>data minimisation</b> under the Information Technology Act, 2000, the IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 and the Digital Personal Data Protection Act, 2023: we ask only for what is needed, we never ask for passwords of other services, Aadhaar, PAN or bank details, and we do not sell or share your data for marketing.</p>
          <p>What we store: the name, email and phone you enter, your order details, the UPI transaction ID and any payment screenshot you upload. Passwords are stored only in scrambled (hashed) form. You can ask us to delete your account and records at any time on WhatsApp.</p>
        </Block>

        <Block id="account" icon={UserCheck} title="2. Student accounts">
          <ul>
            <li>Accounts are opened after Tech Guardians approves the request. We may refuse or disable an account that is misused.</li>
            <li>You are responsible for keeping your user ID and password secret. Do not share your account; course material and PDF links are for your own use.</li>
            <li>We cannot reset a password unless you can show that the account is yours (for example, the details you registered with and your payment transaction ID).</li>
          </ul>
        </Block>

        <Block id="payments" icon={ShieldCheck} title="3. Payments">
          <ul>
            <li>Payments are made by UPI directly to the account shown on the checkout page. Always check the payee name before you pay.</li>
            <li>The price you pay is the price shown at checkout. Your order is confirmed after we match your UPI transaction ID with our records, usually within a few hours.</li>
            <li>Never pay anyone who contacts you claiming to be Tech Guardians from an unknown number. Our official WhatsApp is +{wa}.</li>
            <li>Submitting a false transaction ID, or a payment made with someone else's account without permission, is an offence and will be reported.</li>
          </ul>
        </Block>

        <Block id="refunds" icon={RefreshCw} title="4. Refunds and cancellations">
          <ul>
            <li><b>PDF books and digital downloads:</b> not refundable once the download link has been delivered, because the content cannot be returned. If a file is damaged or missing, we will replace it.</li>
            <li><b>Training programs and sessions:</b> you may ask for a full refund before the first live class or session. After that, refunds are not given, but you may move to a later batch once.</li>
            <li><b>Payment not verified:</b> if we cannot match your payment, contact us with the screenshot and we will resolve it or refund the amount we received.</li>
            <li>Approved refunds are sent back to the same UPI account within 7 working days.</li>
          </ul>
        </Block>

        <Block id="use" icon={FileText} title="5. Use of training content and tools">
          <ul>
            <li>All books, videos, course material and tools are © Tech Guardians and are licensed for your personal learning only. Do not copy, resell, upload or share them.</li>
            <li>Ethical hacking techniques are taught <b>only for learning and for systems you own or are authorised to test</b>. Using them against others is a crime under the IT Act, 2000 (including Sections 43 and 66). Tech Guardians is not responsible for misuse.</li>
            <li>Free tools and portals are provided “as is” for awareness. For real incidents, report on <b>1930</b> or <a className="text-primary underline" href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">cybercrime.gov.in</a>.</li>
          </ul>
        </Block>

        <Block id="law" icon={Scale} title="6. Governing law and contact">
          <p>These terms are governed by the laws of India. Any dispute will be handled by the competent courts at the place where Tech Guardians (Ms Seth Enterprises) is registered. We may update these terms; the date at the top shows the latest version.</p>
          <p>Questions, data requests or complaints: WhatsApp <b>+{wa}</b> or email <a className="text-primary underline" href="mailto:ittechguardians@gmail.com">ittechguardians@gmail.com</a>.</p>
        </Block>
      </div>
    </SiteFrame>
  );
};

export default Terms;

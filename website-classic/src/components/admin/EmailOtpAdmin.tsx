import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Mail, Save, Send, ShieldCheck, TriangleAlert } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;
interface MailSettings {
  otpEnabled: boolean; method: 'smtp' | 'mail'; fromEmail: string; fromName: string;
  smtpHost: string; smtpPort: number; smtpSecure: 'ssl' | 'tls'; smtpUser: string; hasPass: boolean; ready: boolean;
}

const input = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';
const label = 'block text-xs font-semibold text-muted-foreground';

/** Manage → Email & OTP Login: how the site sends email, and whether students may sign in with an email code. */
const EmailOtpAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [s, setS] = useState<MailSettings | null>(null);
  const [pass, setPass] = useState('');
  const [testTo, setTestTo] = useState('');
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    apiGet<MailSettings>('users.php?action=mail_settings').then((d) => { setS(d); setError(''); }, (e: Error) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!s) return <p className="flex items-center gap-2 text-sm text-muted-foreground">{error || <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>}</p>;
  const set = (patch: Partial<MailSettings>) => setS({ ...s, ...patch });
  const save = (extra: Partial<MailSettings> = {}) => {
    setError('');
    const body = { ...s, ...extra, smtpPass: pass };
    void onPublish(apiPost<MailSettings>('users.php?action=mail_settings', body).then((d) => { setS(d); setPass(''); }), undefined);
  };
  const sendTest = async () => {
    setTesting(true); setTest(null);
    try {
      await apiPost('users.php?action=mail_test', { to: testTo });
      setTest({ ok: true, text: `Sent. Check the inbox (and spam folder) of ${testTo}.` });
    } catch (e) {
      setTest({ ok: false, text: e instanceof Error ? e.message : 'The test email could not be sent.' });
    } finally { setTesting(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Mail className="h-5 w-5 text-primary" /> Email &amp; OTP Login</h2>
        <p className="text-sm text-muted-foreground">Let students sign in with a 6-digit code sent to their account email, as well as with their password. Set up how the website sends email first, send yourself a test, then switch the option on.</p>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 ${s.otpEnabled ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-card/70'}`}>
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-primary" /> Sign in with an email code</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {s.otpEnabled ? 'On — students see “Sign in with an email code” on the My Account page.' : 'Off — students sign in with their user ID and password only.'}
            {' '}Codes are valid for 10 minutes; 5 wrong tries cancel a code; one code per minute and 5 per hour per email.
          </p>
          {!s.ready && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600"><TriangleAlert className="h-4 w-4" /> Fill in and save the email settings below before switching this on.</p>}
        </div>
        <button onClick={() => save({ otpEnabled: !s.otpEnabled })} disabled={!s.ready && !s.otpEnabled}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50 ${s.otpEnabled ? 'border border-border hover:bg-muted' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
          {s.otpEnabled ? 'Turn off' : 'Turn on'}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-semibold">How the website sends email</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {([['smtp', 'SMTP (recommended)', 'Your mailbox login, e.g. Hostinger email. Most reliable — codes reach the inbox.'],
            ['mail', 'Hosting mail()', 'No login needed, but emails often land in spam or are blocked.']] as const).map(([v, t, h]) => (
            <label key={v} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${s.method === v ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <input type="radio" name="mail-method" checked={s.method === v} onChange={() => set({ method: v })} className="mt-1 accent-primary" />
              <span><span className="block text-sm font-semibold">{t}</span><span className="block text-xs text-muted-foreground">{h}</span></span>
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5"><span className={label}>Send from (email address)</span>
            <input className={input} type="email" placeholder="no-reply@techguardians.in" value={s.fromEmail} onChange={(e) => set({ fromEmail: e.target.value.trim() })} /></label>
          <label className="space-y-1.5"><span className={label}>Sender name</span>
            <input className={input} value={s.fromName} onChange={(e) => set({ fromName: e.target.value })} /></label>
        </div>

        {s.method === 'smtp' && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5"><span className={label}>SMTP server</span>
              <input className={input} placeholder="smtp.hostinger.com" value={s.smtpHost} onChange={(e) => set({ smtpHost: e.target.value.trim() })} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5"><span className={label}>Security</span>
                <select className={input} value={s.smtpSecure} onChange={(e) => { const v = e.target.value === 'tls' ? 'tls' : 'ssl'; set({ smtpSecure: v, smtpPort: v === 'tls' ? 587 : 465 }); }}>
                  <option value="ssl">SSL (port 465)</option><option value="tls">STARTTLS (port 587)</option>
                </select></label>
              <label className="space-y-1.5"><span className={label}>Port</span>
                <input className={input} inputMode="numeric" value={String(s.smtpPort)} onChange={(e) => set({ smtpPort: Number(e.target.value.replace(/\D/g, '').slice(0, 5)) || 0 })} /></label>
            </div>
            <label className="space-y-1.5"><span className={label}>SMTP username (usually the full email address)</span>
              <input className={input} autoComplete="off" value={s.smtpUser} onChange={(e) => set({ smtpUser: e.target.value.trim() })} /></label>
            <label className="space-y-1.5"><span className={label}>SMTP password {s.hasPass && <span className="font-normal">— saved; leave empty to keep it</span>}</span>
              <input className={input} type="password" autoComplete="new-password" placeholder={s.hasPass ? '••••••••' : ''} value={pass} onChange={(e) => setPass(e.target.value)} /></label>
            <p className="text-xs text-muted-foreground md:col-span-2">Hostinger: create a mailbox in hPanel → Emails (e.g. no-reply@techguardians.in), then use <b>smtp.hostinger.com</b>, SSL, port <b>465</b>, the full email as username and that mailbox's password. The password is stored only on your server and is never shown here again.</p>
          </div>
        )}

        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={() => save()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Save email settings</button>
          {s.ready ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Ready to send</span>
            : <span className="text-xs text-muted-foreground">Not complete yet</span>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-semibold">Send a test email</h3>
        <p className="mt-1 text-sm text-muted-foreground">Save the settings first, then send yourself a test. If it fails, the reason is shown here.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className={`${input} max-w-sm`} type="email" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value.trim())} />
          <button onClick={() => void sendTest()} disabled={testing || !testTo} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send test
          </button>
        </div>
        {test && <p role="status" className={`mt-3 text-sm ${test.ok ? 'text-emerald-600' : 'text-destructive'}`}>{test.text}</p>}
      </div>
    </div>
  );
};

export default EmailOtpAdmin;

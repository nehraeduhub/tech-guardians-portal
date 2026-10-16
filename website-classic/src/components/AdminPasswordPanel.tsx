import { FormEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { changeAdminPassword } from '@/lib/api';

const inputClass = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';

const AdminPasswordPanel = ({ onChanged }: { onChanged?: () => void } = {}) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (next.length < 12) { setError('New password must be at least 12 characters.'); return; }
    if (next !== confirm) { setError('The new passwords do not match.'); return; }
    setBusy(true);
    try {
      await changeAdminPassword(current, next);
      setCurrent(''); setNext(''); setConfirm('');
      setMessage('Password changed. Use the new password next time you sign in.');
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change the password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      <h2 className="font-display text-lg font-semibold">Change admin password</h2>
      <input id="admin-current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" className={inputClass} required />
      <input id="admin-new-password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password (12+ characters)" className={inputClass} required />
      <input id="admin-confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" className={inputClass} required />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-cyber-green">{message}</p>}
      <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        <KeyRound className="h-4 w-4" /> {busy ? 'Saving…' : 'Change Password'}
      </button>
    </form>
  );
};

export default AdminPasswordPanel;

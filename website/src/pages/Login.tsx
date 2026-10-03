import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, LogIn } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import tgLogo from '@/assets/tg-logo.png';
import { adminSignIn } from '@/lib/api';

// Member login — admin credentials open the events & payment manager.
const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    try {
      await adminSignIn(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Check your username and password.');
      return;
    }
    navigate('/manage');
  };

  return (
    <SiteFrame mainClassName="pt-24">
      <section className="section-padding relative">
        <div className="container mx-auto max-w-md">
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur shadow-[0_20px_60px_-20px_rgba(30,64,175,0.25)] p-8 md:p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <img src={tgLogo} alt="Tech Guardians" className="w-12 h-12 rounded-lg object-contain mb-4" />
              <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted-foreground mb-2">Member Access</span>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                Sign in to <span className="text-primary">Tech Guardians</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">Sign in to manage the website.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white text-sm font-semibold px-5 py-3 hover:bg-primary/90 transition-colors"
              >
                <LogIn className="w-4 h-4" /> Sign in
              </button>

              <div className="flex items-center gap-2 justify-center text-[11px] text-muted-foreground pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Manager access is verified securely.
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            New here? <a href="/#courses" className="text-primary hover:underline">Browse courses</a> or{' '}
            <a href="/courses/awareness-booking.html" className="text-primary hover:underline">book an awareness session</a>.
          </p>
        </div>
      </section>
    </SiteFrame>
  );
};

export default Login;


import React, { useState } from 'react';
import { signUp } from '../services/authService';
import { Mail, Lock, User } from 'lucide-react';
import M3Button from './M3Button';

const SignUp = ({ setAuthLoadingMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthLoadingMessage('Creating account...');
    setError(null);
    try {
      await signUp(email, password);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setAuthLoadingMessage(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]/50" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-[var(--md-sys-color-surface-variant)]/40 text-[var(--md-sys-color-on-surface-variant)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/50 border-2 border-transparent focus:border-[var(--md-sys-color-primary)] focus:ring-0 rounded-2xl py-3 pl-12 pr-4 transition-colors"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]/50" size={20} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-[var(--md-sys-color-surface-variant)]/40 text-[var(--md-sys-color-on-surface-variant)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/50 border-2 border-transparent focus:border-[var(--md-sys-color-primary)] focus:ring-0 rounded-2xl py-3 pl-12 pr-4 transition-colors"
          />
        </div>
        <M3Button type="submit" fullWidth>
          Sign Up
        </M3Button>
        {error && (
          <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</p>
        )}
      </form>
    </div>
  );
};

export default SignUp;

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkEmailVerification = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsEmailVerified(false); // Or redirect to login if you prefer
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user data.');

        const data = await res.json();
        setIsEmailVerified(data.email_verified ?? false);
      } catch {
        setIsEmailVerified(false);
      }
    };

    checkEmailVerification();
  }, []);

  const handleResend = async () => {
    setStatus('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setStatus('❌ No auth token found. Please login again.');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:8000/user/email/send', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to resend verification email');
      }

      setStatus('✅ Verification email resent successfully!');
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isEmailVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#221633] text-white font-mono">
        <p>Loading verification status...</p>
      </div>
    );
  }

  if (isEmailVerified) {
    return (
      <div className="min-h-screen bg-[#221633] text-white font-mono flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl mb-6 text-[#3BF15C] flex items-center justify-center gap-2">
          ✅ Email Verified!
        </h1>
        <p className="mb-6 text-gray-300 max-w-md">
          Your email has been successfully verified. You can now proceed to login.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-[#0F909C] px-6 py-3 rounded-lg font-semibold hover:bg-[#095157] transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Email not verified UI (your original resend UI)
  return (
    <div className="min-h-screen bg-[#221633] text-white font-mono">
      <main className="max-w-3xl mx-auto mt-15 px-6 text-center">
        <h1 className="text-4xl mt-7 mb-8 text-[#3BF15C] flex items-center justify-center gap-2">
          <span>📧</span> Email Verification
        </h1>

        <p className="mb-10 whitespace-pre-line text-gray-300 leading-relaxed">
          We've sent a confirmation email to your email address.{'\n\n'}
          Please click the link in that email to confirm your account.{'\n\n'}
          If the email doesn’t arrive, check your spam folder or contact an administrator to manually verify your account.
        </p>

        <hr className="border-gray-600 mb-12 border-t-2" />

        <div className="flex justify-center gap-8">
          <button
            onClick={handleResend}
            disabled={loading}
            className="bg-[#0F909C] px-6 py-3 rounded-lg font-semibold hover:bg-[#095157] transition"
          >
            {loading ? 'Sending...' : 'Resend Confirmation Email'}
          </button>
        </div>

        {status && (
          <p className={`mt-4 text-center ${status.startsWith('❌') ? 'text-red-500' : 'text-green-500'}`}>
            {status}
          </p>
        )}
      </main>
    </div>
  );
}

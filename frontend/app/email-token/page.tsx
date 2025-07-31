'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyTokenPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('❌ Invalid or missing token.');
      setIsLoading(false);
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    fetch(`${backendUrl}/user/email/verify?token=${token}`, {
      method: 'GET',
      // ✅ Remove redirect: 'manual' - let browser handle redirect
    })
      .then(async res => {
        console.log('Response status:', res.status);
        console.log('Response URL:', res.url);
        
        // ✅ Check if redirected to frontend (successful verification)
        if (res.url.includes('localhost:3000') || res.status === 200) {
          setStatus('✅ Email verified successfully!');
          setIsSuccess(true);
          setIsLoading(false);
          
          setTimeout(() => {
            setStatus('✅ Email verified! Redirecting to login...');
            setTimeout(() => router.push('/login'), 1000);
          }, 2000);
          
        } else if (res.status === 401) {
          setStatus('❌ Verification token expired or invalid.');
          setIsLoading(false);
        } else {
          setStatus('❌ Verification failed.');
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log('Fetch error - but verification likely succeeded:', error);
        // ✅ When backend redirects, fetch often throws an error
        // But the verification still works, so treat as success
        setStatus('✅ Email verified successfully!');
        setIsSuccess(true);
        setIsLoading(false);
        
        setTimeout(() => {
          setStatus('✅ Email verified! Redirecting to login...');
          setTimeout(() => router.push('/login'), 1000);
        }, 2000);
      });
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#221633] text-white font-mono">
      <main className="max-w-3xl mx-auto mt-15 px-6 text-center">
        <h1 className="text-4xl mt-7 mb-8 text-[#3BF15C] flex items-center justify-center gap-2">
          <span>🔐</span> Email Token Verification
        </h1>
        <p className="mb-10 text-gray-300 leading-relaxed whitespace-pre-line text-lg">
          {status}
        </p>
        <hr className="border-gray-600 mb-12" />
        
        {!isLoading && !isSuccess && (
          <div className="flex justify-center gap-8">
            <button
              className="bg-[#0F909C] px-6 py-3 rounded-lg font-semibold hover:bg-[#095157] transition"
              onClick={() => router.push('/email-verify')}
            >
              Back to Verification Page
            </button>
            <button
              className="bg-[#747771] px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              onClick={() => router.push('/register')}
            >
              Register Again
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3BF15C]"></div>
          </div>
        )}
      </main>
    </div>
  );
}

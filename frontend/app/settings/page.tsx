'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Jaini_Purva } from 'next/font/google';

const jainiPurva = Jaini_Purva({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jaini-purva',
});

interface UserFormData {
  username: string;
  email: string;
  language: string;
  currentPassword: string;
  newPassword: string;
  country: string;
  university: string;
}

export default function SettingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string>(''); // To track email changes
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false); // New state for email verification status

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    language: '',
    currentPassword: '',
    newPassword: '',
    country: '',
    university: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user data. Please log in again.');
        }

        const userData = await res.json();
        setOriginalEmail(userData.email || '');
        // Assuming your backend returns 'email_verified' status
        setIsEmailVerified(userData.email_verified || false);

        setFormData({
          username: userData.username || userData.name || '',
          email: userData.email || '',
          language: userData.language || '',
          country: userData.country || '',
          university: userData.school || '',
          newPassword: '',
          currentPassword: '',
        });

      } catch (err: any) {
        setError(err.message);
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const sendVerificationEmail = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("You are not logged in. Please log in to send verification email.");
      return;
    }

    setSuccess(null); // Clear previous success messages
    setError(null); // Clear previous error messages

    try {
      const res = await fetch('http://localhost:8000/user/email/send', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // Specific handling for 401, likely means email is not verified yet on backend
        setError('Email is not verified. Please verify your email before requesting another link, or check your new email inbox.');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : 'Could not send verification email. Please try again.';
        throw new Error(errorMessage);
      }

      const message = await res.json();
      setSuccess((prev) => `${prev ?? ''} Email verification sent! Check your inbox.`);

    } catch (e: any) {
      setError(e.message || 'Failed to send verification email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const payload: { username: string; email: string; password?: string } = {
      username: formData.username,
      email: formData.email,
    };

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError("Please enter your current password to set a new one.");
        setIsLoading(false);
        return;
      }
      payload.password = formData.newPassword;
    }

    try {
      const res = await fetch('http://localhost:8000/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
        throw new Error(errorMessage || 'Failed to update settings.');
      }

      setSuccess('Settings updated successfully!');
      setFormData(prev => ({ ...prev, newPassword: '', currentPassword: '' }));

      // If email changed, the backend likely unverified it.
      // Attempt to send verification, and update client state to reflect unverified.
      if (formData.email !== originalEmail) {
        setIsEmailVerified(false); // New email is now unverified
        setOriginalEmail(formData.email); // Update original email for future comparisons
        await sendVerificationEmail(); // Try to send new verification email
      } else {
        // If email didn't change, but it was unverified, still give option to send.
        // This handles cases where user's email was already unverified and they just updated other fields.
        if (!isEmailVerified) {
          setSuccess((prev) => `${prev ?? ''} Your email is still unverified. You can resend verification below.`);
        }
      }


    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    { label: 'User Name', id: 'username', type: 'text' },
    { label: 'E-mail', id: 'email', type: 'email' },
    { label: 'Language', id: 'language', type: 'text', placeholder: 'e.g. English' },
    { label: 'Current Password', id: 'currentPassword', type: 'password' },
    { label: 'New Password', id: 'newPassword', type: 'password' },
    { label: 'Country', id: 'country', type: 'text', placeholder: 'Your country' },
    { label: 'University', id: 'university', type: 'text', placeholder: 'Your university' },
  ];

  if (isLoading && !formData.username) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Settings...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10 py-10 flex justify-between">
      {/* Left Panel */}
      <div className="w-[300px] flex justify-center">
        <div className="bg-[#ee4f09] text-[#00FF00]/80 text-[2rem] w-[400px] h-[60px] mt-10 ml-2 mr-24 rounded-lg flex items-center justify-center font-['Jaini_Purva']">
          Settings
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 pl-[60px] tracking-wider ">
        <form className="profile-form space-y-5" onSubmit={handleSubmit}>
          {formFields.map(({ label, id, type, placeholder }) => (
            <div className="form-group" key={id}>
              <label htmlFor={id} className="block mb-2 text-xl text-[#29C48E] font-['Jaini_Purva']">
                {label}
              </label>
              <input
                id={id}
                type={type}
                placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                value={formData[id as keyof UserFormData]}
                onChange={handleChange}
                className="w-full p-3 text-base rounded-md bg-[#e0e0e0] text-black"
              />
            </div>
          ))}

          {/* Email Verification Status */}
          <div className="form-group">
            <label className="block mb-2 text-xl text-[#29C48E] font-['Jaini_Purva']">
              Email Status:
            </label>
            {isEmailVerified ? (
              <span className="text-green-600 font-semibold">Verified</span>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-red-500 font-semibold">Not Verified</span>
                <button
                  type="button"
                  onClick={sendVerificationEmail}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-wait"
                >
                  Resend Verification Email
                </button>
              </div>
            )}
          </div>

          {error && <div className="text-red-500 bg-red-100 p-3 rounded-md border border-red-300">{error}</div>}
          {success && <div className="text-green-700 bg-green-100 p-3 rounded-md border border-green-300">{success}</div>}

          <div className="text-right">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-400 hover:bg-[#EE4F09] text-[#137750] hover:text-[#00FF00] text-xl px-5 py-2 rounded-lg font-['Fira_Code'] font-extrabold disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Jaini_Purva } from 'next/font/google';

const jainiPurva = Jaini_Purva({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jaini-purva',
});

// Define a type for our form data, including all fields
interface UserFormData {
  username: string;
  email: string;
  language: string;
  currentPassword: string;
  newPassword: string;
  country: string;
  school: string;
}

export default function SettingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    language: '',
    currentPassword: '',
    newPassword: '',
    country: '',
    school: '',
  });

  // Fetch user data on initial load
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
        
        // Populate form with data from the API.
        // If a field doesn't exist in the API response, it will default to a blank string.
        setFormData({
          username: userData.username || userData.name || '',
          email: userData.email || '',
          language: userData.language || '', // Will be blank unless API provides it
          country: userData.country || '',     // Will be blank unless API provides it
          school: userData.school || '',       // Will be blank unless API provides it
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
    
    // The payload only includes fields the backend API can accept.
    // 'school', 'country', etc., are ignored here.
    const payload: { username: string; email: string; password?: string } = {
      username: formData.username,
      email: formData.email,
    };
    
    // Only attempt a password update if both password fields are filled
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
        // The backend might return a simple string or a detailed object
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail);
        throw new Error(errorMessage || 'Failed to update settings.');
      }
      
      setSuccess('Settings updated successfully!');
      setFormData(prev => ({ ...prev, newPassword: '', currentPassword: ''}));

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
    { label: 'School (Optional)', id: 'school', type: 'text', placeholder: 'Your school' },
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
              <label htmlFor={id} className="block mb-2 text-xl text-[#29C48E] font-['Jaini_Purva'] ">{label}</label>
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

          {/* Feedback Messages */}
          {error && <div className="text-red-500 bg-red-100 p-3 rounded-md border border-red-300">{error}</div>}
          {success && <div className="text-green-700 bg-green-100 p-3 rounded-md border border-green-300">{success}</div>}

          <div className="text-right">
            <button type="submit" disabled={isLoading} className="bg-orange-400 hover:bg-[#EE4F09] text-[#137750] hover:text-[#00FF00] text-xl px-5 py-2 rounded-lg font-['Fira_Code'] font-extrabold disabled:opacity-50 disabled:cursor-wait">
              {isLoading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

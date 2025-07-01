'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Jaini_Purva } from 'next/font/google';

const jainiPurva = Jaini_Purva({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jaini-purva',
});

export default function SettingPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else setAuthorized(true);
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        Verifying access...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10 py-10 flex justify-between">
        {/* Left Panel */}
        <div className="w-[300px] flex justify-center">
          <button className="bg-[#ee4f09] text-[#00FF00]/80 text-[2rem] w-[400px] h-[60px] mt-10 ml-2 mr-24 rounded-lg overflow-hidden font-['Jaini_Purva']">
            Settings
          </button>
        </div>

        {/* Right Panel */}
        <div className="flex-1 pl-[60px] tracking-wider ">
          <form className="profile-form space-y-5">
            {[ 
              { label: 'User Name', id: 'username', type: 'text', placeholder: 'Enter your username' },
              { label: 'E-mail', id: 'email', type: 'email', placeholder: 'Enter your email' },
              { label: 'Language', id: 'language', type: 'text', placeholder: 'e.g. English' },
              { label: 'Current Password', id: 'current-password', type: 'password' },
              { label: 'Password', id: 'new-password', type: 'password' },
              { label: 'Country', id: 'country', type: 'text', placeholder: 'Your country' },
              { label: 'School (Optional)', id: 'school', type: 'text', placeholder: 'Your school' },
            ].map(({ label, id, type, placeholder }) => (
              <div className="form-group" key={id}>
                <label htmlFor={id} className="block mb-2 text-xl text-[#29C48E] font-['Jaini_Purva'] ">{label}</label>
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  className="w-full p-3 text-base rounded-md bg-[#e0e0e0]"
                />
              </div>
            ))}

            <div className="text-right">
              <button type="submit" className="bg-orange-400 hover:bg-[#EE4F09] text-[#137750] hover:text-[#00FF00] text-xl px-5 py-2 rounded-lg font-['Fira_Code'] font-extrabold">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#221633] text-white font-mono">
      {/* Main content */}
      <main className="max-w-3xl mx-auto mt-15 px-6 text-center">
        <h1 className="text-4xl mt-7 mb-8 text-[#3BF15C] flex items-center justify-center gap-2 Fonda-font">
          <span>📧</span> Email Verification
        </h1>

        <p className="mb-10 whitespace-pre-line text-gray-300 leading-relaxed fira-font">
          We've sent a confirmation email to your email address.{"\n\n"}
          Please click the link in that email to confirm your account.{"\n\n"}
          If the email doesn’t arrive, check your spam folder or contact an administrator to manually verify your account.
        </p>

        <hr className="border-gray-600 mb-12 border-t-2" />

        <div className="flex justify-center gap-8">
          <button className="bg-[#0F909C] px-6 py-3 rounded-lg font-semibold hover:bg-[#095157] transition finger-font but">
            Resend Confirmation Email
          </button>
          <button className="bg-[#747771] px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition finger-font but">
            Change Email Address
          </button>
        </div>
      </main>
    </div>
  );
}

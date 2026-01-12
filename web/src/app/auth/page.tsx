import { SignInForm } from "@/components/SignInForm";

export default function AuthPage() {
  return (
    <div className="py-20">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h1>
        <SignInForm />
      </div>
    </div>
  );
}

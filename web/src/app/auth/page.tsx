import { SignInForm } from "@components/SignInForm";

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight">
            Sign In
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your government or agency dashboard
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}

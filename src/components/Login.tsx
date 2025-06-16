import React, { useState } from "react";
import { GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import {AuthProvider} from "@firebase/auth";
import { FaGoogle, FaGithub } from "react-icons/fa";

interface LoginProps {
  onSignIn: (provider: AuthProvider) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onSignIn }) => {
  const [error, setError] = useState<string | null>(null);

  const handleSignInClick = async (provider: AuthProvider): Promise<void> => {
    try {
      setError(null);
      await onSignIn(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <main className="p-8 min-h-screen text-white bg-neutral-900 flex justify-center items-center">
      <div className="p-8 rounded-3xl border border-solid bg-white bg-opacity-10 border-white border-opacity-10 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Welcome to Weight Tracker</h1>
        <p className="text-neutral-400 mb-8">Please sign in to continue</p>
        {error && (
          <div className="p-4 mb-4 text-sm text-red-300 bg-red-800 bg-opacity-30 rounded-lg" role="alert">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSignInClick(new GoogleAuthProvider())}
            className="w-full px-4 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-blue-500 flex items-center justify-center gap-3"
          >
            <FaGoogle className="text-xl" />
            Sign in with Google
          </button>
          <button
            onClick={() => handleSignInClick(new GithubAuthProvider())}
            className="w-full px-4 py-3 text-lg font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-gray-500 flex items-center justify-center gap-3"
          >
            <FaGithub className="text-xl" />
            Sign in with GitHub
          </button>
        </div>
      </div>
    </main>
  );
};

export default Login; 
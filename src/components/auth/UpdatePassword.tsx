import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function UpdatePassword({ isFirstLogin = false }: { isFirstLogin?: boolean }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
      data: { requires_password_change: false } // clear the flag
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      if (!isFirstLogin) {
        navigate('/');
      } else {
        // If it was a first login pop-up, it will unmount automatically because 
        // the AuthContext's requiresPasswordChange will become false
        window.location.reload(); 
      }
    }
    setLoading(false);
  };

  return (
    <div className={`w-full max-w-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 ${!isFirstLogin && 'mt-8 sm:mx-auto'}`}>
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          {isFirstLogin ? 'Welcome! Please change your password' : 'Set New Password'}
        </h2>
        {isFirstLogin && (
          <p className="mt-2 text-center text-sm text-gray-600">
            For security reasons, you must change the temporary password provided by the administrator.
          </p>
        )}
      </div>

      <form className="space-y-6" onSubmit={handleUpdate}>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <div className="mt-1">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <div className="mt-1">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Wrapper for the standalone page
export function UpdatePasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <UpdatePassword isFirstLogin={false} />
    </div>
  );
}

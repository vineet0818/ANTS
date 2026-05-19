/**
 * SSOCallback.tsx
 *
 * Landing page after a successful (or failed) Microsoft SSO redirect.
 * The backend appends the JWT and user details as URL query params:
 *   /auth/callback?token=...&user_id=...&role=...&full_name=...
 * or on error:
 *   /auth/callback?error=...&error_description=...
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function SSOCallback() {
  const [searchParams] = useSearchParams();
  const { setUserFromSSO } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const role = searchParams.get('role');
    const full_name = decodeURIComponent(searchParams.get('full_name') ?? '');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      const message =
        errorDescription ||
        'SSO authentication failed. Please try again or contact your administrator.';
      setErrorMsg(decodeURIComponent(message));
      return;
    }

    if (!token || !userId || !role) {
      setErrorMsg('Incomplete SSO response. Please try signing in again.');
      return;
    }

    // Persist the session
    setUserFromSSO({ token, userId: Number(userId), role, full_name });

    // Route the user to the correct page
    if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      api
        .get('/roadmap/')
        .then(() => navigate('/roadmap', { replace: true }))
        .catch(() => navigate('/select-profile', { replace: true }));
    }
  }, []);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <h1 className="text-xl font-semibold text-red-600">Sign-in failed</h1>
          <p className="text-sm text-slate-600">{errorMsg}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-8 w-8 text-sky-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm text-slate-500">Completing sign-in, please wait…</p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Input } from '../../components/forms/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ROUTES } from '../../constants/routes.js';
import { validateEmail } from '../../utils/validators.js';
import api from '../../services/api.js';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [state, setState] = useState('idle'); const [message, setMessage] = useState('');
  const submit = async (event) => { event.preventDefault(); if (!validateEmail(email)) { setState('error'); setMessage('Enter the email address registered to your account.'); return; } setState('loading'); try { await api.post('/auth/forgot-password', { email }); setState('success'); setMessage('If this address is registered, a reset link will be sent.'); } catch (error) { setState('error'); setMessage(error.response?.data?.error?.message || 'Password recovery is not available from this server yet.'); } };
  return <div><h2 className="font-headings text-2xl font-bold">Reset your password</h2><p className="mt-2 text-sm text-muted-foreground">Enter your registered email. We will request a password-reset link.</p>{state !== 'idle' && <div className={`mt-5 flex gap-2 rounded-md border p-3 text-sm ${state === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-error/30 bg-error/10 text-error'}`}><Icon icon={state === 'success' ? 'lucide:check-circle-2' : 'lucide:alert-circle'} className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>}<form onSubmit={submit} className="mt-6 space-y-4"><Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /><Button type="submit" className="w-full" isLoading={state === 'loading'}>Request reset link</Button></form><p className="mt-6 text-center text-sm text-muted-foreground"><Link className="font-medium text-primary hover:underline" to={ROUTES.LOGIN}>Back to sign in</Link></p></div>;
}

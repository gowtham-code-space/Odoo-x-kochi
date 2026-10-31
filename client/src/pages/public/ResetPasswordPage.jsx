import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '../../components/forms/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ROUTES } from '../../constants/routes.js';
import { validatePassword } from '../../utils/validators.js';
import api from '../../services/api.js';

export function ResetPasswordPage() {
  const [params] = useSearchParams(); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [state, setState] = useState('idle'); const [message, setMessage] = useState('');
  const submit = async (event) => { event.preventDefault(); if (!params.get('token')) { setState('error'); setMessage('This reset link is missing its token. Request a new link.'); return; } if (!validatePassword(password)) { setState('error'); setMessage('Use more than 8 characters with uppercase, lowercase, and a special character.'); return; } if (password !== confirm) { setState('error'); setMessage('Passwords do not match.'); return; } setState('loading'); try { await api.post('/auth/reset-password', { token: params.get('token'), password }); setState('success'); setMessage('Password reset complete. You can now sign in.'); } catch (error) { setState('error'); setMessage(error.response?.data?.error?.message || 'This reset link could not be completed.'); } };
  return <div><h2 className="font-headings text-2xl font-bold">Choose a new password</h2><p className="mt-2 text-sm text-muted-foreground">Use more than 8 characters, including uppercase, lowercase, and a special character.</p>{state === 'success' ? <div className="mt-6 space-y-4"><p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">{message}</p><Link to={ROUTES.LOGIN}><Button className="w-full">Sign in</Button></Link></div> : <form onSubmit={submit} className="mt-6 space-y-4"><Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /><Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />{state === 'error' && <p className="text-sm text-error">{message}</p>}<Button type="submit" className="w-full" isLoading={state === 'loading'}>Reset password</Button></form>}</div>;
}

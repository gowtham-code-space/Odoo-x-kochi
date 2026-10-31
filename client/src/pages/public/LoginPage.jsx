import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { Input } from '../../components/forms/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { validateEmail } from '../../utils/validators.js';
import { useToast } from '../../hooks/useToast.js';
import { Icon } from '@iconify/react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Corporate email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid corporate email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email, password });
      addToast({
        type: 'success',
        title: 'Authentication verified',
        message: 'Welcome back to your workspace.',
      });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid email or password.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h2 className="font-headings text-2xl font-bold text-foreground tracking-tight">
          Sign In
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Access your enterprise workspace, tenancy, and analytics.
        </p>
      </div>

      {/* Error alert */}
      {serverError && (
        <div className="mb-6 p-3.5 rounded-lg border border-error/30 bg-error/10 text-error text-xs flex items-start gap-2.5 leading-relaxed">
          <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Corporate Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="engineer@enterprise.io"
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="w-full h-11 text-sm font-semibold rounded-lg shadow-md shadow-primary/20 mt-2"
        >
          Sign In to Workspace
        </Button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-primary hover:underline">Forgot password?</Link>
        <span className="mx-2">·</span>
        Need a new organization workspace?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="text-foreground font-semibold hover:text-primary transition-colors underline underline-offset-4"
        >
          Register here
        </Link>
      </div>
    </div>
  );
}

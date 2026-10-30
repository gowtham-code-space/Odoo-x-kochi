import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import { Input } from '../../components/forms/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { validateEmail, validatePassword } from '../../utils/validators.js';
import { useToast } from '../../hooks/useToast.js';
import { Icon } from '@iconify/react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!email) {
      newErrors.email = 'Corporate email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid corporate email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register({ name, email, password });
      addToast({
        type: 'success',
        title: 'Account created',
        message: 'Welcome! Provision your first organization workspace.',
      });
      navigate(ROUTES.ORGANIZATIONS_NEW, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="font-headings text-2xl font-bold text-foreground tracking-tight">
          Create Account
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Set up your engineer profile to provision enterprise workspaces.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-3.5 rounded-lg border border-error/30 bg-error/10 text-error text-xs flex items-start gap-2.5 leading-relaxed">
          <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="e.g. Vikram Seth"
          required
        />

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
          placeholder="Min 8 characters"
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          placeholder="Repeat password"
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="w-full h-11 text-sm font-semibold rounded-lg shadow-md shadow-primary/20 mt-3"
        >
          Create Workspace Profile
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="text-foreground font-semibold hover:text-primary transition-colors underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

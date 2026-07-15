import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [modeBlock, setModeBlock] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setModeBlock(null);
    try {
      const user = await login(email, password);
      const dest = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/app';
      const from = location.state?.from?.pathname;
      navigate(from && from !== '/login' ? from : dest, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Login failed';
      if (status === 503) {
        setModeBlock(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <PublicNavbar />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-sub">Sign in to your AzCuts account</p>

          {modeBlock && (
            <div className="auth-alert auth-alert--warning">
              <AlertTriangle size={18} />
              <span>{modeBlock}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <Button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

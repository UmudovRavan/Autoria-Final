import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import { Gavel, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'Member', // Changed default role
    acceptTerms: false,
    phone: '',
    dateOfBirth: '',
    allowMarketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const passwordRequirements = [
    { label: 'At least 8 characters', check: (pwd: string) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', check: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', check: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'Contains number', check: (pwd: string) => /\d/.test(pwd) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every(req => req.check(formData.password))) {
      setError('Password does not meet all requirements');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        acceptTerms: formData.acceptTerms,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        allowMarketing: formData.allowMarketing,
      });
      setToast(`Confirmation email sent to ${formData.email}`);
      setTimeout(() => {
        setToast(null);
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Gavel className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join the auction and start bidding
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First name</label>
            <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Your first name" />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
            <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Your last name" />
          </div>

          <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                value={formData.userName}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="Member"
                    checked={formData.role === 'Member'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Member</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="Seller"
                    checked={formData.role === 'Seller'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Seller</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <Check 
                        className={`h-3 w-3 mr-2 ${
                          requirement.check(formData.password) 
                            ? 'text-green-500' 
                            : 'text-gray-300'
                        }`}
                      />
                      <span 
                        className={
                          requirement.check(formData.password)
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }
                      >
                        {requirement.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
          </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="acceptTerms" name="acceptTerms" type="checkbox" checked={formData.acceptTerms} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                I agree to the Terms and Privacy Policy
              </label>
            </div>
            <div className="flex items-center">
              <input id="allowMarketing" name="allowMarketing" type="checkbox" checked={formData.allowMarketing} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
              <label htmlFor="allowMarketing" className="ml-2 block text-sm text-gray-700">
                Receive updates and marketing emails
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Optional phone" />
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
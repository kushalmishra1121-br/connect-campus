import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, key, ArrowRight, AlertCircle, CheckCircle, Key } from 'lucide-react';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email });
            setStep(2);
            setSuccessMessage(`Verification code sent to ${email}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send code. Please check email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/reset-password`, {
                email,
                code,
                newPassword
            });
            setSuccessMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-purple/20 rounded-full blur-[120px] animate-blob"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-glow rounded-full blur-[120px] animate-blob animation-delay-2000"></div>

            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 border border-white/10 transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-purple via-accent-purple/80 to-accent-emerald shadow-lg shadow-primary/30">
                            <Key className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                    </h1>
                    <p className="text-text-secondary">
                        {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code sent to your email'}
                    </p>
                </div>

                {error && (
                    <div className="bg-status-error/10 border border-status-error/30 text-status-error p-3 rounded-lg mb-6 flex items-center gap-2 text-sm backdrop-blur-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-status-success/10 border border-status-success/30 text-status-success p-3 rounded-lg mb-6 flex items-center gap-2 text-sm backdrop-blur-sm">
                        <CheckCircle size={16} />
                        {successMessage}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="student@uni.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 group bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 text-white font-medium transition-all"
                        >
                            {loading ? 'Sending Code...' : 'Send Verification Code'}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Verification Code</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all font-mono tracking-widest text-center text-lg"
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="New secure password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 group bg-accent-purple hover:bg-accent-purple/90 shadow-lg shadow-accent-purple/20 text-white font-medium transition-all"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-text-tertiary hover:text-white transition-colors"
                            >
                                Use a different email
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 text-center text-sm text-text-secondary">
                    Remember your password?{' '}
                    <Link to="/login" className="text-primary-light font-medium hover:text-white transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

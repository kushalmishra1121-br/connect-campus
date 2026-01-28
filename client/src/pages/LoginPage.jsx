import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const [loginRole, setLoginRole] = useState('student'); // 'student' or 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuth(); // Need logout to clear state if role mismatch
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);

            // Enforce Role Check
            if (loginRole === 'admin' && data.user.role !== 'admin') {
                logout(); // Clear token immediately
                setError('Access Denied: This account does not have administrator privileges.');
                return;
            }

            // Optional: Prevent admins from logging in as students if desired, 
            // but usually admins can do anything. For clarity, let's allow it or warn.
            // Let's enforce strict login to avoid confusion.
            if (loginRole === 'student' && data.user.role === 'admin') {
                // Technically an admin is a user too, but let's redirect them to admin dashboard anyway
                // OR tell them to use Admin login.
                // For smooth UX, let's just allow it but redirect to admin dashboard if they are actually admin.
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-blob ${loginRole === 'admin' ? 'bg-accent-purple/30' : 'bg-primary-glow'}`}></div>
            <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-blob animation-delay-2000 ${loginRole === 'admin' ? 'bg-accent-emerald/30' : 'bg-secondary-glow'}`}></div>

            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 border border-white/10">

                {/* Role Toggles */}
                <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/10">
                    <button
                        onClick={() => setLoginRole('student')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${loginRole === 'student' ? 'bg-primary text-white shadow-lg' : 'text-text-tertiary hover:text-white'}`}
                    >
                        <GraduationCap size={16} /> Student
                    </button>
                    <button
                        onClick={() => setLoginRole('admin')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${loginRole === 'admin' ? 'bg-accent-purple text-white shadow-lg' : 'text-text-tertiary hover:text-white'}`}
                    >
                        <ShieldCheck size={16} /> Admin
                    </button>
                </div>

                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-2xl shadow-lg shadow-primary/30 transition-colors duration-500 ${loginRole === 'admin' ? 'bg-gradient-to-br from-accent-purple via-accent-purple/80 to-accent-emerald' : 'bg-gradient-to-br from-primary via-primary-hover to-secondary'}`}>
                            {loginRole === 'admin' ? <ShieldCheck className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {loginRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
                    </h1>
                    <p className="text-text-secondary">
                        {loginRole === 'admin' ? 'Manage system and resolve issues' : 'Enter the portal to track your progress'}
                    </p>
                </div>

                {error && (
                    <div className="bg-status-error/10 border border-status-error/30 text-status-error p-3 rounded-lg mb-6 flex items-center gap-2 text-sm shadow-sm backdrop-blur-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="email"
                                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder={loginRole === 'admin' ? "admin@stitch.edu" : "student@uni.edu"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-text-secondary">Password</label>
                            <a href="#" className="text-xs text-primary-light hover:text-primary hover:underline transition-colors">Forgot password?</a>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="password"
                                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300 font-medium text-white shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                            } ${loginRole === 'admin' ? 'bg-accent-purple hover:bg-accent-purple/90 shadow-accent-purple/20' : 'bg-primary hover:bg-primary-hover shadow-primary/20'}`}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                {loginRole === 'student' && (
                    <div className="mt-8 text-center text-sm text-text-secondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-light font-medium hover:text-white transition-colors">
                            Create Account
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;

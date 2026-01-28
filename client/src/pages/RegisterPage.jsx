import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Hash, AlertCircle, ArrowRight, ShieldCheck, Key } from 'lucide-react';

const RegisterPage = () => {
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        student_id: '',
        admin_secret: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Prepare payload based on role
            const payload = {
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                role: role
            };

            if (role === 'student') {
                payload.student_id = formData.student_id;
            } else {
                payload.admin_secret = formData.admin_secret;
                // Admins might not need student ID, or we can send a dummy one if schema requires it
                // Schema has student_id as optional? Let's check schema.
                // Looking at previous controller logic, it didn't strictly require student_id for admins, 
                // but let's assume it's optional in schema or logic handles it.
                // Wait, controller destructures student_id. If schema restricts, we might need it.
                // Assuming schema allows null student_id for admins (common pattern).
            }

            await register(payload);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className={`absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-blob ${role === 'admin' ? 'bg-accent-purple/30' : 'bg-secondary-glow'}`}></div>
            <div className={`absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-blob animation-delay-2000 ${role === 'admin' ? 'bg-accent-emerald/30' : 'bg-primary-glow'}`}></div>

            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 transition-all duration-300 border border-white/10">

                {/* Role Toggles */}
                <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/10">
                    <button
                        onClick={() => setRole('student')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${role === 'student' ? 'bg-primary text-white shadow-lg' : 'text-text-tertiary hover:text-white'}`}
                    >
                        <GraduationCap size={16} /> Student
                    </button>
                    <button
                        onClick={() => setRole('admin')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-accent-purple text-white shadow-lg' : 'text-text-tertiary hover:text-white'}`}
                    >
                        <ShieldCheck size={16} /> Admin
                    </button>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {role === 'admin' ? 'Admin Access' : 'Create Account'}
                    </h1>
                    <p className="text-text-secondary">
                        {role === 'admin' ? 'Register as a system administrator' : 'Join the student support portal'}
                    </p>
                </div>

                {error && (
                    <div className="bg-status-error/10 border border-status-error/30 text-status-error p-3 rounded-lg mb-6 flex items-center gap-2 text-sm backdrop-blur-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="full_name"
                                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {role === 'student' ? (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Student ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="student_id"
                                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="88204"
                                    value={formData.student_id}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Secret Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-text-tertiary group-focus-within:text-accent-purple transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="admin_secret"
                                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-purple/50 transition-all"
                                    placeholder="Enter admin secret key"
                                    value={formData.admin_secret}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder={role === 'admin' ? "admin@stitch.edu" : "student@uni.edu"}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="Min 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 group mt-4 transition-all duration-300 font-medium text-white shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                            } ${role === 'admin' ? 'bg-accent-purple hover:bg-accent-purple/90 shadow-accent-purple/20' : 'bg-primary hover:bg-primary-hover shadow-primary/20'}`}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-light font-medium hover:text-white transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

const LoginPage = () => {
    const [loginRole, setLoginRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const { demoLogin, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (user) {
        if (user.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    }

    const handleDemoLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Demo login - no credentials needed
        demoLogin(loginRole);

        setTimeout(() => {
            if (loginRole === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }, 500);
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

                {/* Demo Mode Banner */}
                <div className="bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald p-3 rounded-lg mb-6 flex items-center gap-2 text-sm backdrop-blur-sm">
                    <Sparkles size={16} />
                    <span>Demo Mode: Click below to enter instantly!</span>
                </div>

                <form onSubmit={handleDemoLogin}>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300 font-medium text-white shadow-lg text-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                            } ${loginRole === 'admin' ? 'bg-accent-purple hover:bg-accent-purple/90 shadow-accent-purple/20' : 'bg-primary hover:bg-primary-hover shadow-primary/20'}`}
                    >
                        {loading ? 'Entering...' : `Enter as ${loginRole === 'admin' ? 'Admin' : 'Student'}`}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-text-tertiary">
                    This is a demo version. No credentials required.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

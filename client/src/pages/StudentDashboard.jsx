import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import ActiveIssueCard from '../components/dashboard/ActiveIssueCard';
import HistoryCard from '../components/dashboard/HistoryCard';
import ReportIssueModal from '../components/dashboard/ReportIssueModal';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Zap } from 'lucide-react';
import api from '../services/api';

const StudentDashboard = () => {
    const { user, getSocket } = useAuth();
    const [activeIssue, setActiveIssue] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/issues');
            const issues = res.data.issues;

            // Find the most recent active issue for the Active Card
            const active = issues.find(i => ['submitted', 'in_review', 'in_progress'].includes(i.status));

            if (active) {
                try {
                    // Fetch full details including updates
                    const detailRes = await api.get(`/issues/${active.id}`);
                    setActiveIssue(detailRes.data.issue);
                } catch (e) {
                    console.error("Failed to fetch active issue details", e);
                    setActiveIssue(active); // Fallback to basic info
                }
            } else {
                setActiveIssue(null);
            }

            // Set history
            setHistory(issues);

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Socket Listener
        const socket = getSocket();
        if (socket) {
            socket.on('issue_updated', (data) => {
                console.log("Real-time update received:", data);
                fetchDashboardData();
            });

            return () => {
                socket.off('issue_updated');
            };
        }
    }, []);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans relative overflow-hidden">
            {/* Background ambients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>

            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                {/* Hero Section */}
                <section className="glass-panel rounded-2xl p-10 mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium mb-4">
                            <Zap size={16} />
                            <span>AI-Powered Issue Tracking</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light">{user?.full_name?.split(' ')[0] || 'Student'}</span>
                        </h1>
                        <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                            Experience seamless campus support. Submit requests, track real-time progress, and stay updated with our intelligent reporting system.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="glass-button px-8 py-4 rounded-xl font-bold text-base inline-flex items-center gap-3 hover:-translate-y-1 shadow-lg shadow-primary/25"
                        >
                            <PlusCircle size={20} />
                            <span>Report New Issue</span>
                        </button>
                    </div>
                </section>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Active Issue */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-white">Active Request</h2>
                            {activeIssue && <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>}
                        </div>
                        <ActiveIssueCard issue={activeIssue} />
                    </div>

                    {/* Right Column: History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-white">Recent History</h2>
                        </div>
                        <div className="h-full">
                            <HistoryCard issues={history} />
                        </div>
                    </div>
                </div>
            </main>

            <ReportIssueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchDashboardData}
            />
        </div>
    );
};

export default StudentDashboard;

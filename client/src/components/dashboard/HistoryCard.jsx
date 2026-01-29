import { useState, useMemo } from "react";
import { clsx } from "clsx";

const HistoryCard = ({ issues = [] }) => {
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'resolved'

    const filteredIssues = useMemo(() => {
        if (filter === 'all') return issues;
        if (filter === 'active') {
            return issues.filter(i => ['submitted', 'in_review', 'in_progress'].includes(i.status));
        }
        if (filter === 'resolved') {
            return issues.filter(i => ['resolved', 'closed'].includes(i.status));
        }
        return issues;
    }, [issues, filter]);

    return (
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex bg-white/5 p-1 rounded-lg gap-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={clsx(
                            "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                            filter === 'all'
                                ? "text-white bg-primary/20 shadow-sm border border-primary/20"
                                : "text-text-tertiary hover:text-white"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={clsx(
                            "px-4 py-1.5 text-xs font-semibold rounded-md transition-colors",
                            filter === 'active'
                                ? "text-white bg-primary/20 shadow-sm border border-primary/20"
                                : "text-text-tertiary hover:text-white"
                        )}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('resolved')}
                        className={clsx(
                            "px-4 py-1.5 text-xs font-semibold rounded-md transition-colors",
                            filter === 'resolved'
                                ? "text-white bg-primary/20 shadow-sm border border-primary/20"
                                : "text-text-tertiary hover:text-white"
                        )}
                    >
                        Resolved
                    </button>
                </div>
            </div>

            {/* Table Header (Desktop) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 border-b border-border/50">
                <div className="col-span-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">ID</div>
                <div className="col-span-5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Issue Category</div>
                <div className="col-span-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Date</div>
                <div className="col-span-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider text-right">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border/30 flex-1 overflow-y-auto custom-scrollbar">
                {filteredIssues.length === 0 ? (
                    <div className="p-12 text-center text-text-muted text-sm flex flex-col items-center justify-center h-full">
                        <p>No {filter !== 'all' ? filter : ''} history found.</p>
                    </div>
                ) : (
                    filteredIssues.map((issue) => (
                        <div key={issue.id} className="grid sm:grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer items-center group">
                            <div className="col-span-2">
                                <span className="text-sm font-mono font-medium text-primary-light group-hover:text-primary transition-colors">#{issue.issue_number || issue.id}</span>
                            </div>
                            <div className="col-span-5">
                                <p className="text-sm font-medium text-text-primary truncate group-hover:text-white transition-colors">{issue.title}</p>
                            </div>
                            <div className="col-span-3 text-sm text-text-secondary">
                                {new Date(issue.created_at).toLocaleDateString()}
                            </div>
                            <div className="col-span-2 text-right">
                                <StatusBadge status={issue.status} />
                            </div>
                        </div>
                    ))
                )}
            </div>


        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        in_review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        closed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    const labels = {
        submitted: "Open",
        in_review: "Review",
        in_progress: "In Progress",
        resolved: "Resolved",
        closed: "Closed"
    }

    return (
        <span className={clsx(
            "inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm",
            styles[status] || styles.closed
        )}>
            {labels[status] || status}
        </span>
    );
};

export default HistoryCard;

import { Check, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const ActiveIssueCard = ({ issue }) => {
    if (!issue) {
        return (
            <div className="glass-panel rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="bg-white/5 p-4 rounded-full mb-4 border border-white/10 shadow-inner">
                    <Check className="w-8 h-8 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Active Issues</h3>
                <p className="text-sm text-text-secondary">You don't have any ongoing issues reported.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">Active Issue</h2>
                <span className="bg-primary/20 text-primary-light px-3 py-1 rounded-full text-xs font-bold border border-primary/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    #{issue.issue_number || issue.id}
                </span>
            </div>

            {/* Issue Title Section */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">{issue.title}</h3>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5">{issue.location}</span>
                    <span>•</span>
                    <span>Updated {new Date(issue.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-8 mb-8 flex-1">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-3 bottom-8 w-[2px] bg-white/10"></div>

                {/* Timeline Items */}
                <div className="space-y-8">
                    {issue.updates && issue.updates.length > 0 ? (
                        // Sort updates by date ascending for timeline flow
                        [...issue.updates].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((update, index) => (
                            <TimelineItem
                                key={update.id}
                                status={update.new_status}
                                currentStatus={issue.status}
                                label={update.new_status.replace('_', ' ')} // Simple formatting
                                date={update.created_at}
                                comment={update.comment}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-text-tertiary italic">No updates yet. We are reviewing your request.</p>
                    )}
                </div>
            </div>

            {/* Contact Support Button */}
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-text-secondary font-semibold text-sm hover:bg-white/10 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 mt-auto">
                <AlertCircle size={16} />
                Contact Support
            </button>
        </div>
    );
};

const TimelineItem = ({ status, currentStatus, label, date, comment }) => {
    // For the dynamic list, we assume all items passed are 'completed' or 'active' (the latest one)
    // But since we map through history, they are all technically "past events".
    // We can style them all as 'completed' points in time.

    // Check if this is the MOST RECENT update matching the current status of the issue
    // Actually, simpler approach for history log: Just show them as timeline points.

    return (
        <div className="relative group">
            {/* Marker */}
            <div className={clsx(
                "absolute -left-[32px] w-6 h-6 rounded-full border-[3px] z-10 flex items-center justify-center transition-all duration-300",
                "bg-[#020617] border-primary shadow-[0_0_10px_rgba(99,102,241,0.4)]"
            )}>
                <div className="w-1.5 h-1.5 bg-primary-light rounded-full"></div>
            </div>

            {/* Content */}
            <div className="group-hover:translate-x-1 transition-transform duration-300">
                <p className={clsx(
                    "text-sm font-bold mb-0.5 capitalize text-primary-light",
                )}>
                    {label}
                </p>
                {date && (
                    <p className="text-xs text-text-tertiary">{new Date(date).toLocaleString()}</p>
                )}
                {comment && <p className="text-xs text-text-secondary mt-2 p-3 bg-white/5 rounded-lg border border-white/5 italic">{comment}</p>}
            </div>
        </div>
    )
}

export default ActiveIssueCard;

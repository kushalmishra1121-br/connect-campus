import { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';

const ReportIssueModal = ({ isOpen, onClose, onSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        category_id: '',
        location: '',
        title: '',
        description: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            // Reset form on open
            setFormData({ category_id: '', location: '', title: '', description: '' });
            setError('');
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        const defaultCategories = [
            { id: 1, name: 'Infrastructure', description: 'Buildings, roads, facilities' },
            { id: 2, name: 'IT Services', description: 'WiFi, computers, software' },
            { id: 3, name: 'Hostel', description: 'Hostel related issues' },
            { id: 4, name: 'Academic', description: 'Classrooms, labs, library' },
            { id: 5, name: 'Cafeteria', description: 'Food and dining services' },
            { id: 6, name: 'Security', description: 'Safety and security concerns' },
            { id: 7, name: 'Other', description: 'Other issues' }
        ];

        try {
            setLoading(true);
            const res = await api.get('/categories');
            setCategories(res.data && res.data.length > 0 ? res.data : defaultCategories);
        } catch (err) {
            console.error('Failed to fetch categories, using defaults', err);
            setCategories(defaultCategories);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.post('/issues', formData);
            onSuccess(); // Refresh dashboard
            onClose(); // Close modal
        } catch (err) {
            console.error('Submit issue error', err);
            setError(err.response?.data?.message || 'Failed to submit issue');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300 rounded-2xl border border-white/10">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#020617]/90 backdrop-blur-md z-10">
                    <h2 className="text-2xl font-bold text-white">Report an Issue</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="bg-status-error/10 border border-status-error/30 text-status-error p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2">Issue Category</label>
                            <div className="relative">
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                    className="glass-input w-full h-12 px-4 rounded-xl appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-[#0f172a]">Select a category...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-[#0f172a]">{cat.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2">Issue Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Brief summary of the issue"
                                className="glass-input w-full h-12 px-4 rounded-xl"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2">Location / Building</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Library 2nd Floor"
                                className="glass-input w-full h-12 px-4 rounded-xl"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                minLength={20}
                                placeholder="Please provide details about the issue..."
                                className="glass-input w-full min-h-[120px] p-4 rounded-xl resize-y"
                            />
                            <p className="text-right text-xs text-text-tertiary mt-1">
                                {formData.description.length} characters
                            </p>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2">Photos (Optional)</label>

                            {formData.image_url ? (
                                <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                                    <img
                                        src={`http://localhost:5000${formData.image_url}`}
                                        alt="Preview"
                                        className="w-full h-48 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image_url: '' })}
                                        className="absolute top-2 right-2 bg-status-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer group relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            try {
                                                setLoading(true);
                                                const uploadData = new FormData();
                                                uploadData.append('image', file);

                                                const res = await api.post('/upload', uploadData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });

                                                setFormData({ ...formData, image_url: res.data.filePath });
                                            } catch (err) {
                                                console.error("Upload failed", err);
                                                setError("Failed to upload image. Please try again.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload size={32} className="mx-auto text-text-tertiary group-hover:text-primary mb-2 transition-colors" />
                                    <p className="text-sm text-primary-light font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-xs text-text-tertiary mt-1">SVG, PNG, JPG (MAX. 5MB)</p>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting || loading}
                            className="glass-button w-full h-12 rounded-xl text-lg shadow-lg"
                        >
                            {submitting ? 'Submitting...' : 'Submit Issue'}
                        </button>

                        <p className="text-[11px] text-text-tertiary text-center leading-relaxed">
                            By submitting this form, you agree that the information provided is accurate and relates to a genuine university issue.
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportIssueModal;

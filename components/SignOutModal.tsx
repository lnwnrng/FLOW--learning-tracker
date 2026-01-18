import React from 'react';
import { LogOut, X } from 'lucide-react';

interface SignOutModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const SignOutModal: React.FC<SignOutModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
            onClick={onCancel}
        >
            <div
                className="relative w-full max-w-sm rounded-3xl p-6 animate-fade-in"
                style={{
                    background: 'rgba(248, 250, 252, 0.85)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    boxShadow: `
                        0 25px 70px -30px rgba(100, 116, 139, 0.25),
                        inset 0 1px 2px rgba(255, 255, 255, 0.5)
                    `,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        <LogOut size={28} className="text-violet-500" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                    Sign Out
                </h3>

                {/* Description */}
                <p className="text-center text-slate-500 text-sm mb-6">
                    Are you sure you want to sign out? You can sign back in anytime to access your data.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            color: 'white',
                            boxShadow: '0 4px 20px -4px rgba(139, 92, 246, 0.4)',
                        }}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'rgba(241, 245, 249, 0.9)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            color: '#64748b',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignOutModal;

import React from 'react';
import { LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 flow-backdrop-strong"
            onClick={onCancel}
        >
            <div
                className="relative w-full max-w-sm rounded-3xl p-6 animate-fade-in flow-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden flow-modal-highlight" />
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/20 transition-all"
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
                    {t('signOut.title')}
                </h3>

                {/* Description */}
                <p className="text-center text-slate-500 text-sm mb-6">
                    {t('signOut.description')}
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
                        {t('signOut.confirm')}
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
                        {t('signOut.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignOutModal;

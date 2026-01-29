import React, { useState, useRef } from 'react';
import {
    Camera,
    Edit3,
    Trophy,
    Flame,
    Clock,
    Target,
    ChevronRight,
    Crown,
    Check,
    X,
    Settings,
    LogOut
} from 'lucide-react';
import { User, UserStats } from '../types';
import SignOutModal from './SignOutModal';

interface UserProfileProps {
    user: User;
    stats: UserStats;
    unseenAchievementsCount?: number;
    onUpdateUser: (user: Partial<User>) => void;
    onSignOut: () => void | Promise<void>;
    onNavigate?: (page: 'achievements' | 'settings' | 'premium') => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
    user,
    stats,
    unseenAchievementsCount = 0,
    onUpdateUser,
    onSignOut,
    onNavigate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user.name);
    const [editEmail, setEditEmail] = useState(user.email ?? '');
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        onUpdateUser({ name: editName, email: editEmail });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditName(user.name);
        setEditEmail(user.email ?? '');
        setIsEditing(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateUser({ avatarPath: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const statCards = [
        {
            icon: Clock,
            label: 'Focus Time',
            value: formatTime(stats.totalFocusTime),
            color: 'from-violet-500 to-purple-600',
            bgColor: 'bg-violet-50',
        },
        {
            icon: Flame,
            label: 'Current Streak',
            value: `${stats.currentStreak} days`,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-50',
        },
        {
            icon: Trophy,
            label: 'Sessions',
            value: stats.totalSessions.toString(),
            color: 'from-amber-500 to-yellow-500',
            bgColor: 'bg-amber-50',
        },
        {
            icon: Target,
            label: 'Tasks Done',
            value: stats.tasksCompleted.toString(),
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-emerald-50',
        },
    ];

    const menuItems = [
        {
            label: 'Achievements',
            icon: Trophy,
            badge: unseenAchievementsCount > 0 ? `${unseenAchievementsCount} new` : undefined,
            action: 'achievements' as const
        },
        { label: 'Settings', icon: Settings, action: 'settings' as const },
        {
            label: user.isPremium ? 'Premium Active' : 'Upgrade to Premium',
            icon: Crown,
            highlight: !user.isPremium,
            action: 'premium' as const
        },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            {/* Profile Header Card */}
            <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 rounded-3xl p-6 pt-16 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* Avatar with rainbow ring */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3">
                    <div className="relative">
                        {/* Rainbow ring */}
                        <div
                            className="absolute inset-0 rounded-full p-1"
                            style={{
                                background: 'conic-gradient(from 0deg, #f472b6, #c084fc, #60a5fa, #34d399, #fbbf24, #fb923c, #f472b6)',
                            }}
                        >
                            <div className="w-full h-full rounded-full bg-violet-500" />
                        </div>

                        {/* Avatar container */}
                        <div className="relative w-28 h-28 rounded-full p-1.5" style={{
                            background: 'conic-gradient(from 0deg, #f472b6, #c084fc, #60a5fa, #34d399, #fbbf24, #fb923c, #f472b6)',
                        }}>
                            <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden">
                                {user.avatarPath ? (
                                    <img
                                        src={user.avatarPath}
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-400">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Camera button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <Camera size={16} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Premium badge */}
                        {user.isPremium && (
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                <Crown size={14} className="text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* User info */}
                <div className="text-center mt-12">
                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full text-center text-xl font-bold bg-white/20 text-white placeholder:text-white/60 rounded-xl px-4 py-2 border border-white/30 focus:outline-none focus:border-white/60"
                                placeholder="Your name"
                            />
                            <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full text-center text-sm bg-white/20 text-white/90 placeholder:text-white/60 rounded-xl px-4 py-2 border border-white/30 focus:outline-none focus:border-white/60"
                                placeholder="your@email.com"
                            />
                            <div className="flex gap-2 justify-center pt-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center gap-1"
                                >
                                    <X size={16} /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-white text-violet-600 rounded-xl hover:bg-white/90 transition-colors font-semibold flex items-center gap-1"
                                >
                                    <Check size={16} /> Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                {user.isPremium && (
                                    <span
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-50"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.98), rgba(245, 158, 11, 0.98))',
                                            border: '1px solid rgba(245, 158, 11, 0.75)',
                                            boxShadow: '0 10px 24px -14px rgba(245, 158, 11, 0.9)',
                                        }}
                                    >
                                        <Crown size={12} />
                                        Premium
                                    </span>
                                )}
                            </div>
                            <p className="text-white/70 text-sm mt-1">{user.email}</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-3 px-4 py-1.5 bg-white/20 text-white text-sm rounded-full hover:bg-white/30 transition-colors inline-flex items-center gap-1.5"
                            >
                                <Edit3 size={14} /> Edit Profile
                            </button>
                        </>
                    )}
                </div>

                {/* Member since */}
                <p className="text-center text-white/50 text-xs mt-4">
                    Member since {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    // Map bgColor to glass-card color variant
                    const glassColorClass = stat.bgColor === 'bg-violet-50' ? 'glass-card-violet'
                        : stat.bgColor === 'bg-orange-50' ? 'glass-card-amber'
                            : stat.bgColor === 'bg-amber-50' ? 'glass-card-amber'
                                : 'glass-card-emerald';
                    return (
                        <div
                            key={index}
                            className={`glass-card ${glassColorClass} rounded-2xl p-4 ring-1 ring-white/10`}
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <p className="text-2xl font-bold stat-number">{stat.value}</p>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Links */}
            <div className="glass-card rounded-2xl overflow-hidden ring-1 ring-white/10">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={() => onNavigate?.(item.action)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-white/30 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-white/20' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.highlight ? 'user-menu-icon-wrap user-menu-icon-wrap--highlight' : 'user-menu-icon-wrap'}`}>
                                    <Icon size={20} className={item.highlight ? 'user-menu-icon-highlight' : 'user-menu-icon'} />
                                </div>
                                <span className={`font-semibold ${item.highlight ? 'user-menu-text-highlight' : 'user-menu-text'}`}>
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.badge && (
                                    <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-xs font-semibold rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronRight size={20} className="user-menu-chevron" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Sign Out Button */}
            <button
                onClick={() => setShowSignOutModal(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] font-semibold signout-button"
            >
                <LogOut size={20} />
                Sign Out
            </button>

            {/* Sign Out Modal */}
            <SignOutModal
                isOpen={showSignOutModal}
                onCancel={() => setShowSignOutModal(false)}
                onConfirm={() => {
                    setShowSignOutModal(false);
                    onSignOut();
                }}
            />
        </div>
    );
};

export default UserProfile;

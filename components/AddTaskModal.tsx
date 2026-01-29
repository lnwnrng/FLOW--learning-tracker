import React, { useState } from 'react';
import { X, Clock, Calendar, Bell, CheckSquare } from 'lucide-react';
import { Task } from '../types';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastNotification';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id' | 'completed'>) => void;
    selectedDate: Date;
}

const categories = [
    {
        id: 'Reminder' as const,
        icon: Bell,
        labelKey: 'tasks.categories.reminder',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
        activeColor: 'bg-sky-500',
        textColor: 'text-sky-600',
    },
    {
        id: 'To Do' as const,
        icon: CheckSquare,
        labelKey: 'tasks.categories.todo',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        activeColor: 'bg-emerald-500',
        textColor: 'text-emerald-600',
    },
    {
        id: 'Event' as const,
        icon: Calendar,
        labelKey: 'tasks.categories.event',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        activeColor: 'bg-violet-500',
        textColor: 'text-violet-600',
    },
] as const;

const AddTaskModal: React.FC<AddTaskModalProps> = ({
    isOpen,
    onClose,
    onSave,
    selectedDate
}) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Task['category']>('To Do');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const { showToast } = useToast();

    const selectedCategoryInfo = categories.find(c => c.id === category);

    const handleSave = () => {
        if (!title.trim()) return;

        // Use local date components to avoid timezone issues with toISOString()
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        onSave({
            title: title.trim(),
            category,
            date: dateStr,
            startTime,
            endTime,
        });

        // Reset form
        setTitle('');
        setCategory('To Do');
        setStartTime('09:00');
        setEndTime('10:00');
        onClose();

        // Show success toast
        showToast({
            type: 'success',
            title: t('tasks.toast.createdTitle'),
            message: t('tasks.toast.addedToSchedule', { title: title.trim() }),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 flow-backdrop"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="
        relative w-full md:w-[400px] 
        flow-sheet rounded-t-[2rem] md:rounded-[2rem]
        max-h-[90vh] overflow-y-auto
        animate-fade-in
      ">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                    <h2 className="text-xl font-bold text-slate-800">{t('tasks.newTask')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="px-6 pb-6 space-y-5">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">
                            {t('tasks.taskTitle')}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('tasks.taskTitlePlaceholder')}
                            className="
                w-full px-4 py-3.5 rounded-2xl 
                bg-slate-50 border-2 border-slate-100
                text-slate-800 placeholder:text-slate-400
                focus:outline-none focus:border-violet-400 focus:bg-white
                transition-all text-[15px]
              "
                            autoFocus
                        />
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">
                            {t('tasks.category')}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = category === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`
                      flex flex-col items-center justify-center gap-2 py-4 rounded-2xl
                      border-2 transition-all duration-200
                      ${isSelected
                                                ? `${cat.bgColor} ${cat.borderColor}`
                                                : 'bg-white/70 border-slate-100 hover:border-slate-200'
                                            }
                    `}
                                    >
                                        <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      ${isSelected ? cat.activeColor : 'bg-slate-100'}
                    `}>
                                            <Icon size={20} className={isSelected ? 'text-white' : 'text-slate-500'} />
                                        </div>
                                        <span className={`text-sm font-medium ${isSelected ? cat.textColor : 'text-slate-500'}`}>
                                            {t(cat.labelKey)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">
                            <Clock size={14} className="inline mr-1.5 -mt-0.5" />
                            {t('tasks.time')}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="
                  flex-1 px-4 py-3 rounded-xl 
                  bg-slate-50 border-2 border-slate-100
                  text-slate-800 text-center
                  focus:outline-none focus:border-violet-400 focus:bg-white
                  transition-all
                "
                            />
                            <span className="text-slate-400 font-medium">{t('tasks.to')}</span>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="
                  flex-1 px-4 py-3 rounded-xl 
                  bg-slate-50 border-2 border-slate-100
                  text-slate-800 text-center
                  focus:outline-none focus:border-violet-400 focus:bg-white
                  transition-all
                "
                            />
                        </div>
                    </div>

                    {/* Preview Card */}
                    {title && (
                        <div className={`
              p-4 rounded-2xl border-2 
              ${selectedCategoryInfo?.bgColor} ${selectedCategoryInfo?.borderColor}
            `}>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{t('tasks.preview')}</p>
                            <p className="font-bold text-slate-800">{title}</p>
                            <p className={`text-sm ${selectedCategoryInfo?.textColor} font-medium`}>{getCategoryLabel(category, t)}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-2">
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="
              w-full py-4 rounded-2xl
              bg-violet-500 text-white font-bold text-[15px]
              hover:bg-violet-600 active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
              shadow-lg shadow-violet-500/30
            "
                    >
                        {t('tasks.addTask')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;

function getCategoryLabel(category: Task['category'], t: (key: string) => string) {
    switch (category) {
        case 'Reminder':
            return t('tasks.categories.reminder');
        case 'To Do':
            return t('tasks.categories.todo');
        case 'Event':
            return t('tasks.categories.event');
        default:
            return category;
    }
}

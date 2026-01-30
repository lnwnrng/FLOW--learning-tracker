import React from 'react';
import { Circle, Calendar, Bell, Plus, ChevronDown, Clock } from 'lucide-react';
import { Task } from '../types';
import { useTranslation } from 'react-i18next';
import { languageToLocale, normalizeLanguage } from '../i18n';
import { triggerFeedback } from '../services/feedbackService';

interface TaskListProps {
  tasks?: Task[];
  onAddTask?: () => void;
  onAddTaskDisabled?: () => void;
  canAddTask?: boolean;
  onToggleTask?: (taskId: string) => void;
}

// Color theme based on category
const categoryColors = {
  'Reminder': {
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    text: 'text-sky-600',
    icon: 'text-sky-500',
    dot: 'bg-sky-400',
  },
  'To Do': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
    icon: 'text-emerald-500',
    dot: 'bg-emerald-400',
  },
  'Event': {
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    text: 'text-violet-600',
    icon: 'text-violet-500',
    dot: 'bg-violet-400',
  },
};

const TaskList: React.FC<TaskListProps> = ({
  tasks = [],
  onAddTask,
  onAddTaskDisabled,
  canAddTask = true,
  onToggleTask
}) => {
  const { t, i18n } = useTranslation();
  const language = normalizeLanguage(i18n.language);
  const locale = languageToLocale(language);

  const getCategoryIcon = (category: Task['category'], colorClass: string) => {
    const iconProps = { size: 22, className: colorClass, strokeWidth: 1.5 };
    switch (category) {
      case 'Reminder':
        return <Bell {...iconProps} />;
      case 'To Do':
        return <Circle {...iconProps} />;
      case 'Event':
        return <Calendar {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  const getCategoryLabel = (category: Task['category']) => {
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
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map((v) => parseInt(v, 10));
    const date = new Date(2021, 0, 1, hours, minutes);
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: language === 'en',
    }).format(date);
  };

  // Sort tasks by start time
  const sortedTasks = [...tasks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="w-full mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button className="flex items-center gap-2 group">
          <h3 className="text-xl font-bold text-slate-800">{t('tasks.todaysTask')}</h3>
          <ChevronDown size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>
        <button
          onClick={() => {
            if (!canAddTask) {
              onAddTaskDisabled?.();
              return;
            }
            triggerFeedback('tap');
            onAddTask?.();
          }}
          title={canAddTask ? t('tasks.addTask') : t('tasks.toast.pastDateMessage')}
          aria-label={t('tasks.addTask')}
          aria-disabled={!canAddTask}
          className={`
            relative overflow-hidden
            w-11 h-11 flex items-center justify-center rounded-2xl
            transition-all duration-300 ease-out
            ${canAddTask
              ? `
                group
                bg-gradient-to-br from-violet-500 via-sky-500 to-cyan-400
                ring-1 ring-white/20
                shadow-lg shadow-violet-500/25
                hover:shadow-xl hover:shadow-sky-500/25 hover:scale-[1.03]
                active:scale-95
              `
              : `
                bg-white/60 ring-1 ring-white/10 shadow-sm
                cursor-not-allowed
              `
            }
          `}
        >
          {canAddTask && (
            <>
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle at 25% 20%, rgba(255, 255, 255, 0.55), transparent 55%)',
                }}
              />
              <span
                aria-hidden="true"
                className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle at 70% 80%, rgba(56, 189, 248, 0.35), transparent 60%)',
                }}
              />
            </>
          )}
          <Plus
            size={20}
            className={`relative drop-shadow-sm transition-transform duration-300 ${canAddTask ? 'text-white group-hover:rotate-90' : 'text-slate-400'
              }`}
          />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="py-16 text-center rounded-2xl glass-card ring-1 ring-white/10">
            <div className="w-14 h-14 bg-white/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <Calendar size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">{t('tasks.noTasks')}</p>
            <p className="text-slate-400 text-sm mt-1">{t('tasks.tapToAdd')}</p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const colors = categoryColors[task.category];

            return (
              <div
                key={task.id}
                className={`
                  p-4 rounded-2xl glass-card ring-1 ring-white/10 transition-all duration-200
                  ${task.completed ? 'opacity-50' : 'hover:shadow-lg'}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-[15px] font-bold text-slate-800 leading-tight ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    <p className={`text-xs font-semibold mt-1.5 ${colors.text}`}>
                      {getCategoryLabel(task.category)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5 text-slate-500">
                      <Clock size={14} strokeWidth={2} />
                      <span className="text-sm font-medium">
                        {formatTime(task.startTime)} - {formatTime(task.endTime)}
                      </span>
                    </div>
                  </div>

                  {/* Category Icon */}
                  <button
                    onClick={() => {
                      triggerFeedback(task.completed ? 'toggleOff' : 'toggleOn');
                      onToggleTask?.(task.id);
                    }}
                    className="flex-shrink-0"
                  >
                    {task.completed ? (
                      <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    ) : (
                      getCategoryIcon(task.category, colors.icon)
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskList;

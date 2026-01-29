import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { languageToLocale, normalizeLanguage } from '../i18n';

interface CalendarEvent {
  date: string; // YYYY-MM-DD format to match task date
  color: string; // Tailwind color class like 'bg-violet-400'
}

interface CalendarProps {
  events?: CalendarEvent[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  selectedDate,
  onSelectDate
}) => {
  const { t, i18n } = useTranslation();
  const language = normalizeLanguage(i18n.language);
  const locale = languageToLocale(language);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const weekDays = useMemo(() => {
    const weekdayStyle: Intl.DateTimeFormatOptions['weekday'] = language === 'en' ? 'short' : 'narrow';
    const formatter = new Intl.DateTimeFormat(locale, { weekday: weekdayStyle });
    const base = new Date(2021, 7, 1, 12); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(base);
      date.setDate(base.getDate() + i);
      return formatter.format(date);
    });
  }, [language, locale]);

  // Calculate days in the current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: number; isCurrentMonth: boolean; fullDate: Date }[] = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }

    // Next month's days to fill the grid (5 rows max for cleaner look)
    const totalDays = Math.ceil(days.length / 7) * 7;
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }

    return days;
  }, [currentMonth]);

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : isToday(date);
  };

  // Find event for a specific date using YYYY-MM-DD format
  const getEventForDate = (fullDate: Date) => {
    const year = fullDate.getFullYear();
    const month = String(fullDate.getMonth() + 1).padStart(2, '0');
    const day = String(fullDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return events.find(e => e.date === dateStr);
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatHeader = () => {
    // Show the current viewing month, not the selected date
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentMonth);
  };

  return (
    <div className="
      calendar-surface w-full rounded-3xl p-6 
      backdrop-blur-sm
    ">
      {/* Header with date and navigation */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
          {formatHeader()}
        </h2>
        <div className="flex gap-0.5">
          <button
            onClick={goToPrevMonth}
            aria-label={t('calendar.prevMonth')}
            className="p-2 hover:bg-white/80 rounded-xl text-slate-400 hover:text-slate-700 transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNextMonth}
            aria-label={t('calendar.nextMonth')}
            className="p-2 hover:bg-white/80 rounded-xl text-slate-400 hover:text-slate-700 transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {calendarDays.map((day, index) => {
          const event = getEventForDate(day.fullDate);
          const selected = isSelected(day.fullDate);

          return (
            <div key={index} className="flex flex-col items-center justify-center py-1.5">
              <button
                onClick={() => day.isCurrentMonth && onSelectDate?.(day.fullDate)}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-600'}
                  ${selected
                    ? 'bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-md shadow-violet-300/50'
                    : day.isCurrentMonth
                      ? 'hover:bg-white/80 hover:shadow-sm'
                      : ''
                  }
                `}
              >
                {day.date}
              </button>

              {/* Event Dot */}
              <div className="h-1.5 mt-0.5">
                {event && !selected && (
                  <span className={`block w-1 h-1 rounded-full ${event.color}`}></span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;

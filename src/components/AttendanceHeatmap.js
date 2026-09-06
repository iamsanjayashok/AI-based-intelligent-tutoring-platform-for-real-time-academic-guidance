import React, { useState } from 'react';
import { Calendar, Flame, Info } from 'lucide-react';
import { getLocalDateString } from '../services/userService';

/**
 * LeetCode-style Attendance Heatmap Component
 * Displays activity density across 7-day columns over recent months.
 */
export default function AttendanceHeatmap({ attendanceLog = {} }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate date grid for past 28 weeks (approx 6.5 months) up to today
  const weeksCount = 28;
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat

  // Calculate the start date (Sunday of 27 weeks ago)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (weeksCount - 1) * 7 - dayOfWeek);

  // Build 2D array: weeks[weekIndex][dayIndex 0..6]
  const weeks = [];
  const monthLabels = [];
  let currentMonth = -1;

  for (let w = 0; w < weeksCount; w++) {
    const weekDays = [];
    let weekMonth = -1;

    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + (w * 7 + d));
      
      const isFuture = cellDate > today;
      const dateKey = getLocalDateString(cellDate);
      const record = attendanceLog[dateKey] || null;

      if (cellDate.getMonth() !== currentMonth && d === 0) {
        currentMonth = cellDate.getMonth();
        weekMonth = currentMonth;
      }

      weekDays.push({
        date: cellDate,
        dateKey,
        isFuture,
        record,
        count: record?.count || 0,
        minutes: record?.minutes || 0
      });
    }

    weeks.push(weekDays);
    monthLabels.push(weekMonth);
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Activity level color function
  const getColorClass = (count, minutes, isFuture) => {
    if (isFuture) return 'bg-transparent border border-transparent';
    if (!count && !minutes) return 'bg-slate-100 hover:bg-slate-200 border-slate-200/60';
    
    // Level 1
    if (minutes <= 20 || count === 1) {
      return 'bg-emerald-200 hover:bg-emerald-300 border-emerald-300';
    }
    // Level 2
    if (minutes <= 45 || count === 2) {
      return 'bg-emerald-400 hover:bg-emerald-500 border-emerald-500';
    }
    // Level 3
    if (minutes <= 80 || count === 3) {
      return 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600';
    }
    // Level 4
    return 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800';
  };

  const totalActiveDaysLogged = Object.keys(attendanceLog).filter(
    k => attendanceLog[k] && (attendanceLog[k].count > 0 || attendanceLog[k].minutes > 0)
  ).length;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-5">
      {/* Header & Activity Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Attendance & Study Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual record of daily attendance logins, study sessions, and tutor dialogue.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Active Days in Period</span>
            <span className="text-slate-900 font-bold font-mono text-sm">{totalActiveDaysLogged} days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Frame */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="min-w-[660px]">
          {/* Month Labels Bar */}
          <div className="flex text-[11px] font-medium text-slate-400 mb-2 pl-7">
            {monthLabels.map((mIdx, wIdx) => (
              <div key={wIdx} className="w-4 mr-1 text-left shrink-0">
                {mIdx !== -1 && mIdx !== null ? monthNames[mIdx] : ''}
              </div>
            ))}
          </div>

          {/* Grid Rows: 7 rows for Sun..Sat */}
          <div className="flex items-start">
            {/* Day of Week labels on left */}
            <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-400 pr-2 pt-0.5 shrink-0 select-none">
              <span className="h-3.5 flex items-center">Sun</span>
              <span className="h-3.5 flex items-center">Mon</span>
              <span className="h-3.5 flex items-center">Tue</span>
              <span className="h-3.5 flex items-center">Wed</span>
              <span className="h-3.5 flex items-center">Thu</span>
              <span className="h-3.5 flex items-center">Fri</span>
              <span className="h-3.5 flex items-center">Sat</span>
            </div>

            {/* Columns of Weeks */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() => !day.isFuture && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 rounded-[3px] border transition-all cursor-pointer relative ${getColorClass(
                        day.count,
                        day.minutes,
                        day.isFuture
                      )}`}
                      title={!day.isFuture ? `${day.dateKey}: ${day.count} activities, ${day.minutes} mins studied` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Information Banner / Legend */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 gap-3">
        {/* Hover detail box */}
        <div className="min-h-[22px] flex items-center">
          {hoveredDay ? (
            <span className="font-medium text-slate-800">
              <strong className="text-emerald-700">{hoveredDay.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>: {hoveredDay.count > 0 ? `${hoveredDay.count} login/session(s) (${hoveredDay.minutes} mins study time)` : 'No activity recorded'}
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1.5">
              <Info size={13} />
              <span>Hover over any tile to view attendance and study log details</span>
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 select-none">
          <span>Less</span>
          <span className="w-3 h-3 rounded-[2px] bg-slate-100 border border-slate-200/60 inline-block" />
          <span className="w-3 h-3 rounded-[2px] bg-emerald-200 border border-emerald-300 inline-block" />
          <span className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-500 inline-block" />
          <span className="w-3 h-3 rounded-[2px] bg-emerald-500 border border-emerald-600 inline-block" />
          <span className="w-3 h-3 rounded-[2px] bg-emerald-700 border border-emerald-800 inline-block" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

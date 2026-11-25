export interface HeroTimeSlot {
  id: string;
  dateKey: string;
  shortLabel: string; // e.g. "Thu, 9:30 AM"
  fullLabel: string;  // e.g. "Nov 26 • Thu, 9:30 AM"
  timeLabel: string;  // e.g. "9:30 AM"
}

export interface HeroCalendarCell {
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isClosedDay: boolean;
}

export interface HeroScheduleAvailability {
  status: 'open' | 'after_hours' | 'closed_day' | 'past';
  selectedDateKey: string;
  effectiveDateKey: string;
  promptText: string;
  statusNote: string;
  slots: HeroTimeSlot[];
}

const WEEKDAY_TEMPLATES: Record<number, Array<{ h: number; m: number }>> = {
  0: [], // Sunday closed
  1: [{ h: 9, m: 30 }, { h: 11, m: 0 }, { h: 14, m: 0 }, { h: 16, m: 30 }, { h: 18, m: 30 }],
  2: [{ h: 10, m: 0 }, { h: 11, m: 30 }, { h: 14, m: 0 }, { h: 16, m: 0 }, { h: 18, m: 0 }],
  3: [{ h: 9, m: 30 }, { h: 11, m: 0 }, { h: 14, m: 0 }, { h: 16, m: 30 }, { h: 18, m: 30 }],
  4: [{ h: 10, m: 0 }, { h: 12, m: 0 }, { h: 14, m: 30 }, { h: 16, m: 30 }, { h: 18, m: 0 }],
  5: [{ h: 9, m: 30 }, { h: 11, m: 30 }, { h: 14, m: 0 }, { h: 16, m: 0 }, { h: 17, m: 30 }],
  6: [{ h: 10, m: 0 }, { h: 12, m: 30 }, { h: 15, m: 0 }],
};

export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

export function formatShortWeekdayDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatMonthYear(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatMonthOnly(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'long',
  });
}

export function formatClock24(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function format12hTime(h: number, m: number): string {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function buildSlotsForDay(date: Date, minTimestampMs: number): HeroTimeSlot[] {
  const dow = date.getDay();
  const template = WEEKDAY_TEMPLATES[dow] || [];
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateKey = toLocalDateKey(date);

  const valid: HeroTimeSlot[] = [];
  for (const t of template) {
    const slotDt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), t.h, t.m, 0, 0);
    if (slotDt.getTime() > minTimestampMs) {
      const timeLabel = format12hTime(t.h, t.m);
      const shortLabel = `${weekday}, ${timeLabel}`;
      const id = `${dateKey}T${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;
      valid.push({
        id,
        dateKey,
        shortLabel,
        fullLabel: `${monthDay} • ${shortLabel}`,
        timeLabel,
      });
    }
  }
  return valid;
}

function findNextOpenDay(fromDate: Date, minTimestampMs: number): { date: Date; slots: HeroTimeSlot[] } {
  for (let offset = 1; offset <= 14; offset++) {
    const candidate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + offset, 0, 0, 0, 0);
    const slots = buildSlotsForDay(candidate, minTimestampMs);
    if (slots.length > 0) {
      return { date: candidate, slots: slots.slice(0, 3) };
    }
  }
  return { date: fromDate, slots: [] };
}

/**
 * Computes real-time available booking slots for either today (filtering out
 * already-elapsed times + 30 min buffer) or any selected calendar date.
 */
export function getAvailableHeroSchedule(selectedDateKey: string, now: Date): HeroScheduleAvailability {
  const todayKey = toLocalDateKey(now);
  const selected = parseLocalDateKey(selectedDateKey);
  const bufferMs = now.getTime() + 30 * 60 * 1000;

  if (selectedDateKey < todayKey) {
    const next = findNextOpenDay(now, bufferMs);
    return {
      status: 'past',
      selectedDateKey,
      effectiveDateKey: toLocalDateKey(next.date),
      promptText: `Next open (${formatShortWeekdayDate(next.date)}):`,
      statusNote: 'Past date — showing upcoming',
      slots: next.slots,
    };
  }

  // Sunday closed -> roll forward to Monday's first open slots
  if (selected.getDay() === 0) {
    const next = findNextOpenDay(selected, bufferMs);
    const monthDay = next.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      status: 'closed_day',
      selectedDateKey,
      effectiveDateKey: toLocalDateKey(next.date),
      promptText: `Closed Sun • Next ${monthDay}:`,
      statusNote: 'Sunday closed — showing next open',
      slots: next.slots,
    };
  }

  const isToday = selectedDateKey === todayKey;
  const candidateSlots = buildSlotsForDay(selected, isToday ? bufferMs : 0);

  if (isToday && candidateSlots.length === 0) {
    const next = findNextOpenDay(selected, bufferMs);
    const monthDay = next.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      status: 'after_hours',
      selectedDateKey,
      effectiveDateKey: toLocalDateKey(next.date),
      promptText: `Next open (${monthDay}):`,
      statusNote: 'After hours today — showing next open',
      slots: next.slots,
    };
  }

  const monthDay = selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return {
    status: 'open',
    selectedDateKey,
    effectiveDateKey: selectedDateKey,
    promptText: isToday ? `Open today (${monthDay}):` : `Open for ${monthDay}:`,
    statusNote: isToday ? 'Live slots remaining today' : 'Verified open slots',
    slots: candidateSlots.slice(0, 3),
  };
}

/**
 * Generates an accurate Sun-Sat 7-column calendar grid for the given month/year.
 */
export function buildHeroCalendarGrid(viewYear: number, viewMonth: number, now: Date): HeroCalendarCell[] {
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startDow = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = startDow + daysInMonth > 35 ? 42 : 35;
  const todayKey = toLocalDateKey(now);

  const cells: HeroCalendarCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(viewYear, viewMonth, 1 - startDow + i);
    const dateKey = toLocalDateKey(cellDate);
    cells.push({
      dateKey,
      day: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === viewMonth && cellDate.getFullYear() === viewYear,
      isPast: dateKey < todayKey,
      isToday: dateKey === todayKey,
      isClosedDay: cellDate.getDay() === 0,
    });
  }
  return cells;
}

export const CINEMA_TIME_ZONE = 'America/Mexico_City';

export function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function parseLocalIso(iso: string): LocalParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(iso);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5])
  };
}

function hasTimeZone(iso: string): boolean {
  return /(Z|[+-]\d{2}:\d{2})$/.test(iso);
}

function localTimeLabel(parts: LocalParts): string {
  const period = parts.hour >= 12 ? 'PM' : 'AM';
  let hour = parts.hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${String(parts.minute).padStart(2, '0')} ${period}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatTime(iso: string): string {
  if (hasTimeZone(iso)) {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }
  const parts = parseLocalIso(iso);
  return parts ? localTimeLabel(parts) : '';
}

export function formatDateTime(iso: string): string {
  if (hasTimeZone(iso)) {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
  const parts = parseLocalIso(iso);
  if (!parts) return '';
  return `${WEEKDAYS[new Date(parts.year, parts.month - 1, parts.day).getDay()]}, ${MONTHS[parts.month - 1]} ${parts.day}, ${localTimeLabel(parts)}`;
}

export function nowInTimeZone(timeZone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  return new Date(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')) % 24,
    Number(get('minute')),
    Number(get('second'))
  );
}

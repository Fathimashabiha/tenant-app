/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString()). */
export function toLocalDateIso(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Friendly label e.g. "Sun, May 24" */
export function formatDisplayDate(isoOrDate: string | Date): string {
  if (typeof isoOrDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(isoOrDate)) {
    const [y, m, d] = isoOrDate.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  const dt = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function buildNextDaysOptions(count = 7): { label: string; value: string }[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      value: toLocalDateIso(d),
    };
  });
}

export function labelForDateValue(
  value: string,
  options: { label: string; value: string }[]
): string {
  return options.find((o) => o.value === value)?.label ?? formatDisplayDate(value);
}

/** Parse "6:00 AM" / "18:00" to minutes since midnight. */
export function parseTimeToMinutes(time: string): number {
  const trimmed = time.trim();
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = Number(match12[1]);
    const minutes = Number(match12[2]);
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return Number(match24[1]) * 60 + Number(match24[2]);
  }
  return 0;
}

export function bookingDateToIso(bookingDate: string | Date): string {
  if (typeof bookingDate === "string") {
    return bookingDate.slice(0, 10);
  }
  return toLocalDateIso(bookingDate);
}

/** Relative label e.g. "2h ago", "In 2d". Past = ago; future = in … */
export function formatRelativeTime(isoOrDate: string | Date, now: Date = new Date()): string {
  const dt = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const diffMs = now.getTime() - dt.getTime();

  if (diffMs < 0) {
    const aheadMin = Math.ceil(-diffMs / 60000);
    if (aheadMin < 60) return `In ${aheadMin}m`;
    const aheadHours = Math.ceil(aheadMin / 60);
    if (aheadHours < 24) return `In ${aheadHours}h`;
    const aheadDays = Math.ceil(aheadHours / 24);
    if (aheadDays < 7) return `In ${aheadDays}d`;
    return formatShortDate(dt);
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatShortDate(dt);
}

/** Past events sort by time; future events rank below all past activity. */
export function toRecencySortTime(isoOrDate: string | Date, now: Date = new Date()): number {
  const t = new Date(isoOrDate).getTime();
  if (Number.isNaN(t)) return 0;
  const nowMs = now.getTime();
  if (t > nowMs) {
    return nowMs - (t - nowMs);
  }
  return t;
}

export function compareRecencyDesc(
  a: { timestamp: string },
  b: { timestamp: string },
): number {
  return toRecencySortTime(b.timestamp) - toRecencySortTime(a.timestamp);
}

export function compareNotificationsDesc(
  a: { timestamp: string; read: boolean },
  b: { timestamp: string; read: boolean },
): number {
  if (a.read !== b.read) return a.read ? 1 : -1;
  return compareRecencyDesc(a, b);
}

export function formatShortDate(isoOrDate: string | Date): string {
  const iso =
    typeof isoOrDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(isoOrDate)
      ? isoOrDate.slice(0, 10)
      : toLocalDateIso(typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate);
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isAmenityBookingPast(
  bookingDate: string | Date,
  endTime: string,
  now: Date = new Date()
): boolean {
  const [y, m, d] = bookingDateToIso(bookingDate).split("-").map(Number);
  const endMinutes = parseTimeToMinutes(endTime);
  const slotEnd = new Date(
    y,
    m - 1,
    d,
    Math.floor(endMinutes / 60),
    endMinutes % 60,
    0,
    0
  );
  return now > slotEnd;
}

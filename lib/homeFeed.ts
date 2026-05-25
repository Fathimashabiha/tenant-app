import type { Bill } from "./billsService";
import type { MaintenanceRequest } from "./maintenanceService";
import type { AmenityBooking } from "./amenitiesService";
import {
  bookingDateToIso,
  compareNotificationsDesc,
  compareRecencyDesc,
  formatRelativeTime,
  formatShortDate,
  isAmenityBookingPast,
} from "./dateUtils";

export type HomeNavPath = "Bills" | "Maintenance" | "Amenities";
export type FeedIconKey = "zap" | "droplets" | "wrench" | "calendar" | "credit" | "dollar" | "megaphone";

export type DashboardStat = {
  label: string;
  value: string;
  path: HomeNavPath;
  iconKey: FeedIconKey;
};

export type ActivityItem = {
  id: string;
  title: string;
  desc: string;
  time: string;
  timestamp: string;
  color: string;
  path: HomeNavPath;
  iconKey: FeedIconKey;
};

export type HomeNotification = {
  id: string;
  type: "bill" | "update";
  title: string;
  desc: string;
  time: string;
  timestamp: string;
  read: boolean;
  iconKey: FeedIconKey;
  path: HomeNavPath;
};

export type ScheduleEvent = {
  title: string;
  time: string;
  color: string;
  bg: string;
};

export type ScheduleGroup = {
  date: string;
  sortKey: string;
  events: ScheduleEvent[];
};

export type HomeSources = {
  bills: Bill[];
  maintenance: MaintenanceRequest[];
  bookings: AmenityBooking[];
};

function billAmount(b: Bill): number {
  return Number(b.amount);
}

function isBillUnpaid(b: Bill): boolean {
  return b.status.toLowerCase() !== "paid";
}

function isMaintenanceActive(r: MaintenanceRequest): boolean {
  if (r.status === "cancelled" || r.status === "closed") return false;
  if (r.status === "completed" && (r.ratings?.length ?? 0) > 0) return false;
  return true;
}

function billIconKey(billType: string): FeedIconKey {
  if (billType === "water") return "droplets";
  if (billType === "maintenance") return "wrench";
  if (billType === "rent") return "dollar";
  return "zap";
}

function maintenanceMessage(r: MaintenanceRequest): string {
  switch (r.status) {
    case "assigned":
      return r.technicianName ? `${r.technicianName} assigned` : "Technician assigned";
    case "in_progress":
    case "open":
      return "Work in progress";
    case "completed":
      return (r.ratings?.length ?? 0) > 0 ? "Service rated" : "Work completed — confirm & rate";
    case "created":
      return "Request submitted";
    case "cancelled":
      return "Request cancelled";
    default:
      return `Status: ${r.status.replace(/_/g, " ")}`;
  }
}

function upcomingBookings(bookings: AmenityBooking[]): AmenityBooking[] {
  return bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "completed")
    .filter((b) => !isAmenityBookingPast(b.bookingDate, b.endTime || b.startTime))
    .sort((a, b) => {
      const da = new Date(`${bookingDateToIso(a.bookingDate)}T${a.startTime}`).getTime();
      const db = new Date(`${bookingDateToIso(b.bookingDate)}T${b.startTime}`).getTime();
      return da - db;
    });
}

export function buildDashboardStats(
  sources: HomeSources,
  tenancyEnabled: boolean,
): DashboardStat[] {
  const { bills, maintenance, bookings } = sources;
  const visibleBills = tenancyEnabled ? bills : bills.filter((b) => b.billType === "maintenance");

  const rentDue = visibleBills
    .filter((b) => b.billType === "rent" && isBillUnpaid(b))
    .reduce((sum, b) => sum + billAmount(b), 0);

  const maintDue = visibleBills
    .filter((b) => b.billType === "maintenance" && isBillUnpaid(b))
    .reduce((sum, b) => sum + billAmount(b), 0);

  const openRequests = maintenance.filter(isMaintenanceActive).length;
  const nextBooking = upcomingBookings(bookings)[0];

  const stats: DashboardStat[] = [];

  if (tenancyEnabled) {
    stats.push({
      label: "Rent Due",
      value: rentDue > 0 ? `AED ${rentDue.toLocaleString()}` : "Paid",
      path: "Bills",
      iconKey: "dollar",
    });
  }

  stats.push({
    label: "Maint. Due",
    value: maintDue > 0 ? `AED ${maintDue.toLocaleString()}` : "None",
    path: "Bills",
    iconKey: "credit",
  });

  stats.push({
    label: "Requests",
    value: openRequests === 1 ? "1 Open" : `${openRequests} Open`,
    path: "Maintenance",
    iconKey: "wrench",
  });

  stats.push({
    label: "Booking",
    value: nextBooking ? formatShortDate(nextBooking.bookingDate) : "None",
    path: "Amenities",
    iconKey: "calendar",
  });

  return stats;
}

function buildBillActivityItems(bills: Bill[], tenancyEnabled: boolean): ActivityItem[] {
  const visible = tenancyEnabled ? bills : bills.filter((b) => b.billType === "maintenance");
  const items: ActivityItem[] = [];

  for (const bill of visible) {
    const iconKey = billIconKey(bill.billType);
    const amountLabel = `AED ${billAmount(bill).toFixed(2)}`;

    if (isBillUnpaid(bill)) {
      const issuedAt = bill.createdAt || bill.dueDate;
      items.push({
        id: `activity-bill-due-${bill.id}`,
        title: bill.title,
        desc: `${amountLabel} · Due ${formatShortDate(bill.dueDate)}`,
        timestamp: issuedAt,
        time: formatRelativeTime(issuedAt),
        color: "#2563eb",
        path: "Bills",
        iconKey,
      });
    }

    for (const payment of bill.payments ?? []) {
      items.push({
        id: `activity-bill-paid-${bill.id}-${payment.id}`,
        title: `${bill.title} paid`,
        desc: `${amountLabel} · ${payment.paymentMethod || "Payment"}`,
        timestamp: payment.paidAt,
        time: formatRelativeTime(payment.paidAt),
        color: "#16a34a",
        path: "Bills",
        iconKey: "credit",
      });
    }
  }

  return items;
}

function buildMaintenanceActivityItems(maintenance: MaintenanceRequest[]): ActivityItem[] {
  return maintenance.map((r) => ({
    id: `activity-maint-${r.id}-${r.updatedAt}`,
    title: r.title,
    desc: maintenanceMessage(r),
    timestamp: r.updatedAt || r.createdAt,
    time: formatRelativeTime(r.updatedAt || r.createdAt),
    color: "#2563eb",
    path: "Maintenance" as const,
    iconKey: "wrench" as const,
  }));
}

function buildBookingActivityItems(bookings: AmenityBooking[]): ActivityItem[] {
  return upcomingBookings(bookings).slice(0, 3).map((b) => ({
    id: `activity-booking-${b.id}`,
    title: b.facility?.name || "Amenity booking",
    desc: `${formatShortDate(b.bookingDate)} · ${b.startTime}`,
    timestamp: `${bookingDateToIso(b.bookingDate)}T${b.startTime}`,
    time: formatRelativeTime(b.bookingDate),
    color: "#0d9488",
    path: "Amenities" as const,
    iconKey: "calendar" as const,
  }));
}

export function buildRecentActivity(
  sources: HomeSources,
  tenancyEnabled: boolean,
  limit = 6,
): ActivityItem[] {
  const items = [
    ...buildBillActivityItems(sources.bills, tenancyEnabled),
    ...buildMaintenanceActivityItems(sources.maintenance),
    ...buildBookingActivityItems(sources.bookings),
  ];

  return items.sort(compareRecencyDesc).slice(0, limit);
}

export function buildNotifications(
  sources: HomeSources,
  tenancyEnabled: boolean,
  readIds: Set<string>,
): HomeNotification[] {
  const { bills, maintenance, bookings } = sources;
  const visibleBills = tenancyEnabled ? bills : bills.filter((b) => b.billType === "maintenance");
  const items: HomeNotification[] = [];

  for (const bill of visibleBills) {
    const amountLabel = `AED ${billAmount(bill).toFixed(2)}`;
    if (isBillUnpaid(bill)) {
      const id = `notif-bill-due-${bill.id}`;
      const issuedAt = bill.createdAt || bill.dueDate;
      items.push({
        id,
        type: "bill",
        title: `${bill.title} due`,
        desc: `${amountLabel} due ${formatShortDate(bill.dueDate)}`,
        timestamp: issuedAt,
        time: formatRelativeTime(issuedAt),
        read: readIds.has(id),
        iconKey: billIconKey(bill.billType),
        path: "Bills",
      });
    }

    for (const payment of bill.payments ?? []) {
      const id = `notif-bill-paid-${bill.id}-${payment.id}`;
      items.push({
        id,
        type: "bill",
        title: `${bill.title} paid`,
        desc: `${amountLabel} · ${payment.paymentMethod || "Payment confirmed"}`,
        timestamp: payment.paidAt,
        time: formatRelativeTime(payment.paidAt),
        read: readIds.has(id),
        iconKey: "credit",
        path: "Bills",
      });
    }
  }

  for (const r of maintenance) {
    const id = `notif-maint-${r.id}-${r.status}-${r.updatedAt}`;
    items.push({
      id,
      type: "update",
      title: r.title,
      desc: maintenanceMessage(r),
      timestamp: r.updatedAt || r.createdAt,
      time: formatRelativeTime(r.updatedAt || r.createdAt),
      read: readIds.has(id),
      iconKey: "wrench",
      path: "Maintenance",
    });
  }

  for (const b of upcomingBookings(bookings)) {
    const id = `notif-booking-${b.id}`;
    items.push({
      id,
      type: "update",
      title: `${b.facility?.name || "Booking"} upcoming`,
      desc: `${formatShortDate(b.bookingDate)} at ${b.startTime}`,
      timestamp: `${bookingDateToIso(b.bookingDate)}T${b.startTime}`,
      time: formatRelativeTime(b.bookingDate),
      read: readIds.has(id),
      iconKey: "calendar",
      path: "Amenities",
    });
  }

  return items.sort(compareNotificationsDesc);
}

export function buildScheduleGroups(sources: HomeSources): ScheduleGroup[] {
  const groups = new Map<string, ScheduleGroup>();

  const addEvent = (
    dateIso: string,
    title: string,
    time: string,
    color: string,
    bg: string,
  ) => {
    const sortKey = dateIso;
    const label = formatShortDate(dateIso);
    const existing = groups.get(sortKey) ?? { date: label, sortKey, events: [] };
    existing.events.push({ title, time, color, bg });
    groups.set(sortKey, existing);
  };

  for (const r of sources.maintenance) {
    if (!r.scheduledDate) continue;
    const iso = bookingDateToIso(r.scheduledDate);
    addEvent(
      iso,
      r.title,
      new Date(r.scheduledDate).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      "#2563eb",
      "#eff6ff",
    );
  }

  for (const b of upcomingBookings(sources.bookings)) {
    addEvent(
      bookingDateToIso(b.bookingDate),
      b.facility?.name || "Amenity booking",
      b.startTime,
      "#0d9488",
      "#f0fdfa",
    );
  }

  return [...groups.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(0, 14);
}

export function countUnreadNotifications(notifications: HomeNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

export type HomeFeedResponse = {
  tenancyEnabled: boolean;
  stats: DashboardStat[];
  activity: ActivityItem[];
  notifications: HomeNotification[];
  schedule: ScheduleGroup[];
  unreadCount: number;
};

export function buildHomeFeed(
  sources: HomeSources,
  tenancyEnabled: boolean,
  readIds: Set<string>,
): HomeFeedResponse {
  const notifications = buildNotifications(sources, tenancyEnabled, readIds);
  return {
    tenancyEnabled,
    stats: buildDashboardStats(sources, tenancyEnabled),
    activity: buildRecentActivity(sources, tenancyEnabled),
    notifications,
    schedule: buildScheduleGroups(sources),
    unreadCount: countUnreadNotifications(notifications),
  };
}

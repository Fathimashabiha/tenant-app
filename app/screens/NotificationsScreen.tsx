import { useState, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft, Calendar, Zap, Wrench, Droplets, Package,
  CreditCard, Megaphone, Clock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, GRADIENTS } from "../../constants/Theme";

const TABS = ["All", "Unread", "Bills", "Updates"];

const initialNotifications = [
  {
    id: 1, type: "bill", Icon: Zap,
    title: "Electricity Bill Due", desc: "AED 342.50 due March 28",
    time: "2h ago", read: false,
  },
  {
    id: 2, type: "update", Icon: Megaphone,
    title: "Quarterly Inspection", desc: "Mar 22, 10 AM - 2 PM. Be home.",
    time: "3h ago", read: false,
  },
  {
    id: 3, type: "bill", Icon: Droplets,
    title: "Water Bill Due", desc: "AED 89.00 due March 28",
    time: "2h ago", read: false,
  },
  {
    id: 4, type: "update", Icon: Wrench,
    title: "Maintenance Update", desc: "AC repair scheduled for Mar 19",
    time: "5h ago", read: true,
  },
  {
    id: 5, type: "update", Icon: Package,
    title: "Parcel Arrived", desc: "DHL package ready at Locker L-12",
    time: "1d ago", read: true,
  },
  {
    id: 6, type: "bill", Icon: CreditCard,
    title: "Rent Payment Confirmed", desc: "AED 8,500 paid successfully",
    time: "3d ago", read: true,
  },
];

const scheduleData = [
  {
    date: "Mar 19",
    events: [
      { title: "AC Repair", time: "10:00 AM", color: COLORS.secondary, bg: COLORS.badgeBackground },
    ],
  },
  {
    date: "Mar 20",
    events: [
      { title: "Gym Booking", time: "7:00 AM", color: COLORS.secondary, bg: COLORS.white },
    ],
  },
  {
    date: "Mar 22",
    events: [
      { title: "Pool Booking", time: "5:00 PM", color: COLORS.secondary, bg: COLORS.white },
      { title: "Community BBQ", time: "6:00 PM", color: COLORS.success, bg: COLORS.badgeBackground },
      { title: "Building Inspection", time: "10:00 AM", color: COLORS.error, bg: "#fef2f2" },
    ],
  },
  {
    date: "Mar 25",
    events: [
      { title: "Water Tank Cleaning", time: "8:00 AM", color: COLORS.secondary, bg: COLORS.white },
    ],
  },
];

function NotificationItem({
  item, index,
}: {
  item: typeof initialNotifications[0];
  index: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
    }}>
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        activeOpacity={0.75}
      >
        {/* Icon */}
        {!item.read ? (
          <LinearGradient
            colors={GRADIENTS.activeNav}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <item.Icon size={22} color="white" />
          </LinearGradient>
        ) : (
          <View style={styles.iconGradientRead}>
            <item.Icon size={22} color="#94a3b8" />
          </View>
        )}

        {/* Content */}
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, item.read && styles.notifTitleRead]}>
            {item.title}
          </Text>
          <Text style={styles.notifDesc}>{item.desc}</Text>
        </View>

        {/* Meta */}
        <View style={styles.notifMeta}>
          <Text style={styles.notifTime}>{item.time}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Notifications() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState("All");
  const [showCalendar, setShowCalendar] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const hasUnread = notifications.some((n) => !n.read);

  const filtered = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Bills") return n.type === "bill";
    if (activeTab === "Updates") return n.type === "update";
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={18} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCalendar(!showCalendar)}
          activeOpacity={0.8}
        >
          {showCalendar ? (
            <LinearGradient
              colors={GRADIENTS.activeNav}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.calendarBtn}
            >
              <Calendar size={18} color="white" />
            </LinearGradient>
          ) : (
            <View style={[styles.calendarBtn, styles.calendarBtnInactive]}>
              <Calendar size={18} color="#0f172a" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {!showCalendar ? (
          <View style={{ paddingBottom: 80 }}>
            {/* Tabs */}
            <View style={styles.tabsRow}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Mark all as read */}
            {hasUnread && (
              <TouchableOpacity style={styles.markAllRow} onPress={markAllRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            )}

            {/* Notifications */}
            <View style={styles.notifList}>
              {filtered.map((item, i) => (
                <NotificationItem key={item.id} item={item} index={i} />
              ))}
              {filtered.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No notifications here</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={{ paddingBottom: 80 }}>
            <Text style={styles.scheduleTitle}>Upcoming Schedule</Text>
            {scheduleData.map((group) => (
              <View key={group.date} style={styles.scheduleGroup}>
                <Text style={styles.scheduleDate}>{group.date}</Text>
                <View style={styles.scheduleEvents}>
                  {group.events.map((ev, i) => (
                    <View key={i} style={[styles.scheduleEventCard, { backgroundColor: ev.bg }]}>
                      <Clock size={16} color={ev.color} />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.scheduleEventTitle, { color: ev.color }]}>
                          {ev.title}
                        </Text>
                        <Text style={styles.scheduleEventTime}>{ev.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  calendarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarBtnInactive: {
    backgroundColor: "#f1f5f9",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Tabs
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  tabTextActive: {
    color: "#0f172a",
    fontWeight: "700",
  },

  // Mark all
  markAllRow: {
    marginBottom: 16,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  // Notification cards
  notifList: {
    gap: 10,
  },
  notifCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  notifCardUnread: {
    borderColor: COLORS.primary + "30",
  },
  iconGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGradientRead: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  notifTitleRead: {
    color: "#64748b",
    fontWeight: "600",
  },
  notifDesc: {
    fontSize: 11,
    color: "#94a3b8",
  },
  notifMeta: {
    alignItems: "flex-end",
    gap: 6,
  },
  notifTime: {
    fontSize: 11,
    color: "#94a3b8",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },

  // Schedule
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
    marginTop: 4,
  },
  scheduleGroup: {
    marginBottom: 20,
  },
  scheduleDate: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 10,
  },
  scheduleEvents: {
    gap: 8,
  },
  scheduleEventCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "white",
  },
  scheduleEventTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  scheduleEventTime: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
});
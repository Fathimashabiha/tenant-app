import { useState, useRef, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Calendar, Wrench, Clock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, GRADIENTS } from "../../constants/Theme";
import { homeService } from "../../lib/homeService";
import type { HomeNotification } from "../../lib/homeFeed";
import { compareNotificationsDesc } from "../../lib/dateUtils";
import { FEED_ICON_MAP } from "../../lib/homeFeedIcons";

const TENANT_ID = "default-tenant-uuid";
const TABS = ["All", "Unread", "Bills", "Updates"];

function NotificationItem({
  item, index, onPress,
}: {
  item: HomeNotification;
  index: number;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const Icon = FEED_ICON_MAP[item.iconKey] ?? Wrench;

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
        onPress={onPress}
      >
        {!item.read ? (
          <LinearGradient
            colors={GRADIENTS.activeNav}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Icon size={22} color="white" />
          </LinearGradient>
        ) : (
          <View style={styles.iconGradientRead}>
            <Icon size={22} color="#94a3b8" />
          </View>
        )}

        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, item.read && styles.notifTitleRead]}>
            {item.title}
          </Text>
          <Text style={styles.notifDesc}>{item.desc}</Text>
        </View>

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All");
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: homeFeed, isLoading } = useQuery({
    queryKey: ["homeFeed", TENANT_ID],
    queryFn: () => homeService.getFeed(TENANT_ID),
  });

  const notifications = homeFeed?.notifications ?? [];
  const scheduleData = homeFeed?.schedule ?? [];

  const markAllRead = async () => {
    const feed = await homeService.markAllNotificationsRead(TENANT_ID);
    queryClient.setQueryData(["homeFeed", TENANT_ID], feed);
  };

  const markOneRead = async (id: string) => {
    const feed = await homeService.markNotificationsRead(TENANT_ID, [id]);
    queryClient.setQueryData(["homeFeed", TENANT_ID], feed);
  };

  const hasUnread = notifications.some((n) => !n.read);

  const filtered = useMemo(() => {
    const list = notifications.filter((n) => {
      if (activeTab === "All") return true;
      if (activeTab === "Unread") return !n.read;
      if (activeTab === "Bills") return n.type === "bill";
      if (activeTab === "Updates") return n.type === "update";
      return true;
    });
    return [...list].sort(compareNotificationsDesc);
  }, [notifications, activeTab]);

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
              {isLoading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : (
                filtered.map((item, i) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    index={i}
                    onPress={() => {
                      markOneRead(item.id);
                      navigation.navigate(item.path);
                    }}
                  />
                ))
              )}
              {!isLoading && filtered.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No notifications here</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={{ paddingBottom: 80 }}>
            <Text style={styles.scheduleTitle}>Upcoming Schedule</Text>
            {isLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : scheduleData.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming events</Text>
              </View>
            ) : (
              scheduleData.map((group) => (
                <View key={group.sortKey} style={styles.scheduleGroup}>
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
              ))
            )}
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
  loadingWrap: {
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
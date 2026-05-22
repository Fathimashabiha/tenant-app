import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Bell, Calendar, FileText, Wrench, Building2, CreditCard,
  ChevronRight, MapPin, Home as HomeIcon, ArrowUpRight,
  AlertTriangle, Megaphone, Clock, Zap, Droplets, DollarSign,
  Star, TrendingUp, Camera, Download, Key, LucideIcon
} from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import AppLayout from "../../components/layout/AppLayout";
import { COLORS, SIZES, FONTS, SHADOWS, GRADIENTS } from "../../constants/Theme";
import { Badge, Card, IconButton } from "../../components/ui";
import { useFeatures } from "../context/FeatureContext";

const quickActions: { icon: LucideIcon, label: string, color: string, path: string }[] = [
  { icon: Building2,  label: "Move-in",     color: "teal", path: "MoveIn" },
  { icon: FileText,   label: "Tenancy",     color: "blue", path: "Tenancy" },
  { icon: CreditCard, label: "Bills",        color: "teal", path: "Bills" },
  { icon: Wrench,     label: "Maintenance",  color: "lime", path: "Maintenance" },
  { icon: Building2,  label: "Amenities",    color: "blue", path: "Amenities" },
];

const stats: { label: string, value: string, icon: LucideIcon, colors: readonly [string, string, ...string[]], path: string }[] = [
  { label: "Rent Due",  value: "AED 8,500", icon: DollarSign, colors: GRADIENTS.activeNav, path: "Bills" },
  { label: "Maint. Due", value: "AED 250", icon: CreditCard, colors: GRADIENTS.activeNav, path: "Bills" },
  { label: "Requests",  value: "2 Open",    icon: Wrench,     colors: GRADIENTS.activeNav, path: "Maintenance" },
  { label: "Booking",   value: "Mar 20",    icon: Calendar,   colors: ["#26A69A", "#2EC4B6"] as const, path: "Amenities" },
];

const recentActivity = [
  { icon: Zap,      title: "Electricity Bill", desc: "AED 342.50 - Feb 2026", time: "2h ago",  color: COLORS.primary, path: "Bills" },
  { icon: Droplets, title: "Water Bill",        desc: "AED 89.00 - Feb 2026",  time: "2h ago",  color: COLORS.secondary, path: "Bills" },
  { icon: Wrench,   title: "AC Maintenance Bill", desc: "AED 250.00 - Feb 2026", time: "3h ago",  color: COLORS.primary, path: "Bills" },
  { icon: Wrench,   title: "AC Maintenance",    desc: "Technician assigned",    time: "5h ago",  color: COLORS.primary, path: "Maintenance" },
];

function LogoWithSpring() {
  const rotate = useSharedValue(-10);
  useEffect(() => {
    rotate.value = withSpring(0, { damping: 8, stiffness: 100 });
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Image source={require("../../assets/images/spacezen.jpeg")} style={styles.logo} resizeMode="contain" />
    </Animated.View>
  );
}

export default function Dashboard() {
  const navigation = useNavigation<any>();
  const { config } = useFeatures();

  const filteredQuickActions = quickActions.filter(action => {
    if (action.path === "Tenancy") return config.tenancyEnabled;
    return true;
  });

  const filteredStats = stats.filter(stat => {
    if (stat.path === "Bills") {
      // If tenancy is disabled, show only maintenance items in bills stats
      if (!config.tenancyEnabled) return stat.label.includes("Maintenance");
      return true;
    }
    return true;
  });

  const filteredActivity = recentActivity.filter(item => {
    if (item.path === "Bills") {
      // If tenancy is disabled, show only maintenance items in bills activity
      if (!config.tenancyEnabled) return item.title.includes("Maintenance");
      return true;
    }
    return true;
  });

  return (
    <AppLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Header gradient ── */}
        <LinearGradient
          colors={GRADIENTS.sidebar}
          style={styles.headerGradient}
        >
          {/* Top row: logo + name + bell */}
          <View style={styles.headerRow}>
            <View style={styles.userInfo}>
              <LogoWithSpring />
              <View>
                <Text style={styles.greeting}>Good Morning</Text>
                <Text style={styles.userName}>Ahmed Al Rashid</Text>
              </View>
            </View>
            <IconButton
              icon={<Bell size={20} color={COLORS.foreground} />}
              onPress={() => navigation.navigate("Notifications")}
              badgeCount={3}
            />
          </View>

          {/* ── Address Card ── */}
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => config.tenancyEnabled && navigation.navigate("Tenancy")}
            style={styles.addressCard}
          >
            {/* Building background image */}
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80" }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />

            {/* Dark-left gradient overlay */}
            <LinearGradient
              colors={["rgba(8,25,55,0.88)", "rgba(8,25,55,0.55)", "rgba(8,25,55,0.15)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Card content */}
            <View style={styles.addressContent}>

              {/* Building name + location */}
              <View style={styles.addressTop}>
                <Text style={styles.addressTitle}>Azure Tower, Tower A</Text>
                <View style={styles.mapPinRow}>
                  <MapPin size={11} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.mapPinText}>Dubai Marina, Dubai, UAE</Text>
                </View>
              </View>

              {/* Unit + Floor pill badges */}
              <View style={styles.addressBadgeRow}>
                <View style={styles.badgeTeal}>
                  <HomeIcon size={11} color="#fff" />
                  <Text style={styles.badgeTealText}>Unit 1204</Text>
                </View>
                <View style={styles.badgeGlass}>
                  <Building2 size={11} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.badgeGlassText}>12th Floor</Text>
                </View>
              </View>

              {/* Thin divider */}
              <View style={styles.addressDivider} />

              {/* Stats row: Rent · Deposit · Living Since */}
              <View style={styles.addressStatsRow}>
                {config.tenancyEnabled && (
                  <>
                    <View style={styles.addressStat}>
                      <Text style={styles.statTopLabel}>Rent</Text>
                      <Text style={styles.statTopValue}>AED 8,995</Text>
                    </View>
                    <View style={styles.addressStatSep} />
                    <View style={styles.addressStat}>
                      <Text style={styles.statTopLabel}>Deposit</Text>
                      <Text style={styles.statTopValue}>AED 8,995</Text>
                    </View>
                    <View style={styles.addressStatSep} />
                    <View style={styles.addressStat}>
                      <Text style={styles.statTopLabel}>Tenancy</Text>
                      <Text style={styles.statTopValue}>Active</Text>
                    </View>
                  </>
                )}
              </View>

            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Main content ── */}
        <View style={styles.mainContent}>

          {/* Announcements */}
          <View style={styles.announcementsCol}>
            <View style={styles.announcementDestructive}>
              <AlertTriangle size={16} color={COLORS.error} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.announceTitleDestructive}>Quarterly Inspection – Mar 22</Text>
                <Text style={styles.announceDesc}>Building inspection 10 AM – 2 PM. Someone must be home.</Text>
              </View>
            </View>
            <View style={styles.announcementPrimary}>
              <Megaphone size={16} color={COLORS.primary} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.announceTitlePrimary}>Pool Maintenance Complete</Text>
                <Text style={styles.announceDesc}>Pool is now open. Enjoy!</Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {filteredStats.map((stat, i) => (
              <TouchableOpacity key={i} onPress={() => navigation.navigate(stat.path)} style={styles.statCard}>
                <LinearGradient colors={stat.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
                  <View style={styles.statIconBg}>
                    <stat.icon size={16} color="white" />
                  </View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {filteredQuickActions.map((action, i) => (
                <TouchableOpacity key={i} onPress={() => navigation.navigate(action.path)} style={styles.actionItem}>
                  <View style={[styles.actionIconBg, { backgroundColor: COLORS.muted }]}>
                    <action.icon
                      size={24}
                      color={
                        action.color === "blue" ? COLORS.primary :
                        action.color === "teal" ? COLORS.secondary : COLORS.accent
                      }
                    />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              {filteredActivity.map((item, i) => (
                <TouchableOpacity key={i} onPress={() => navigation.navigate(item.path)} activeOpacity={0.75}>
                  <Card style={styles.activityItem} padding={SIZES.md}>
                    <View style={[styles.activityIconBg, { backgroundColor: item.color + "18" }]}>
                      <item.icon size={18} color={item.color} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{item.title}</Text>
                      <Text style={styles.activityDesc}>{item.desc}</Text>
                    </View>
                    <View style={styles.activityTimeRow}>
                      <Clock size={12} color={COLORS.mutedForeground} />
                      <Text style={styles.activityTime}>{item.time}</Text>
                    </View>
                    <ChevronRight size={14} color={COLORS.mutedForeground} />
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.background },

  // Header
  headerGradient:   { paddingHorizontal: SIZES.lg, paddingTop: 48, paddingBottom: 28, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SIZES.lg },
  userInfo:         { flexDirection: "row", alignItems: "center", gap: SIZES.sm },
  logo:             { width: 60, height: 60 },
  greeting:         { fontSize: 10, color: COLORS.mutedForeground, fontWeight: "bold", fontFamily: FONTS.bold },
  userName:         { fontSize: 18, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.display },

  // ── Address Card ──
  addressCard:      {
    width: "100%",
    height: 170,
    borderRadius: 18,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  addressContent:   {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  addressTop:       { gap: 3 },
  addressTitle:     { fontSize: 18, fontWeight: "bold", color: "#fff", fontFamily: FONTS.display },
  mapPinRow:        { flexDirection: "row", alignItems: "center", gap: 4 },
  mapPinText:       { fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: FONTS.regular },

  // Pill badges
  addressBadgeRow:  { flexDirection: "row", gap: 8 },
  badgeTeal:       {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  badgeTealText:   { fontSize: 12, color: "#fff", fontWeight: "bold", fontFamily: FONTS.bold },
  badgeGlass:       {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  badgeGlassText:   { fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: FONTS.regular },

  // Divider
  addressDivider:   { height: 1, backgroundColor: "rgba(255,255,255,0.18)" },

  // Stats row at bottom of card
  addressStatsRow:  { flexDirection: "row", alignItems: "center" },
  addressStat:      { flex: 1, gap: 2 },
  statTopLabel:     { fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: FONTS.regular },
  statTopValue:     { fontSize: 13, fontWeight: "bold", color: "#fff", fontFamily: FONTS.display },
  addressStatSep:   { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 8 },

  // Announcements
  announcementsCol:     { gap: 8, marginTop: 4 },
  announcementDestructive:      { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fef2f2", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: "#fecaca" },
  announcementPrimary:     { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.muted, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: COLORS.border },
  announceTitleDestructive:     { fontSize: 12, fontWeight: "bold", color: COLORS.error, fontFamily: FONTS.bold },
  announceTitlePrimary:    { fontSize: 12, fontWeight: "bold", color: COLORS.primary, fontFamily: FONTS.bold },
  announceDesc:         { fontSize: 11, color: COLORS.mutedForeground, fontFamily: FONTS.regular, marginTop: 1 },

  // Main content
  mainContent:      { paddingHorizontal: SIZES.lg, marginTop: SIZES.md },
  statsRow:         { flexDirection: "row", gap: SIZES.sm, marginTop: 20 },
  statCard:         { flex: 1, height: 110, borderRadius: SIZES.radiusMedium, overflow: "hidden", ...SHADOWS.sm, backgroundColor: COLORS.transparent },
  statGradient:     { flex: 1, padding: 12 },
  statIconBg:       { width: 32, height: 32, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: SIZES.radiusSmall, alignItems: "center", justifyContent: "center", marginBottom: SIZES.sm },
  statLabel:        { fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: "bold", fontFamily: FONTS.bold },
  statValue:        { fontSize: 12, fontWeight: "bold", color: COLORS.white, fontFamily: FONTS.display },

  section:          { marginTop: SIZES.lg },
  sectionTitle:     { fontSize: 14, fontWeight: "bold", color: COLORS.foreground, marginBottom: SIZES.md, fontFamily: FONTS.display },
  quickActionsGrid: { flexDirection: "row", justifyContent: "space-between" },
  actionItem:       { alignItems: "center", gap: SIZES.sm },
  actionIconBg:     { width: 56, height: 56, borderRadius: SIZES.radiusMedium, alignItems: "center", justifyContent: "center", ...SHADOWS.sm },
  actionLabel:      { fontSize: 10, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  activityList:     { gap: SIZES.sm, paddingBottom: 24 },
  activityItem:     { flexDirection: "row", alignItems: "center", gap: SIZES.md },
  activityIconBg:   { width: 36, height: 36, backgroundColor: "#f8fafc", borderRadius: SIZES.radiusSmall, alignItems: "center", justifyContent: "center" },
  activityContent:  { flex: 1 },
  activityTitle:    { fontSize: 12, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  activityDesc:     { fontSize: 10, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  activityTimeRow:  { flexDirection: "row", alignItems: "center", gap: 4 },
  activityTime:     { fontSize: 10, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
});
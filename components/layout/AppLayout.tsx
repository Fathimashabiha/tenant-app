import { ReactNode, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Home, Building2, Users, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, SHADOWS, GRADIENTS } from "../../constants/Theme";
import { useFeatures } from "../../app/context/FeatureContext";

const ALL_TABS = [
  { name: "Dashboard", icon: Home, label: "Home" },
  { name: "Amenities", icon: Building2, label: "Amenities" },
  { name: "Community", icon: Users, label: "Community" },
  { name: "Profile", icon: User, label: "Profile" },
];

function ActiveIndicator() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.activeIndicatorContainer,
        { opacity: anim, transform: [{ scale: anim }] },
      ]}
    >
      <LinearGradient
        colors={GRADIENTS.activeNav}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.activeIndicator}
      />
    </Animated.View>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigation = useNavigation<any>();
  const { config } = useFeatures();

  const tabs = ALL_TABS.filter(tab => {
    if (tab.name === "Community") return config.communityEnabled;
    return true;
  });

  const routeName = useNavigationState((state) => {
    if (!state) return null;
    const route = state.routes[state.index];
    if (route.state) {
      return route.state.routes[route.state.index || 0].name;
    }
    return route.name;
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>

      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const active = routeName === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={styles.tabItem}
            >
              {active && <ActiveIndicator />}
              <View style={[active && styles.iconActiveGlow]}>
                <tab.icon
                  size={20}
                  color={active ? COLORS.primaryForeground : COLORS.mutedForeground}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  active ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingBottom: 80 },
  navBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    zIndex: 50,
    paddingTop: SIZES.sm,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    paddingHorizontal: SIZES.md,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    flexDirection: "column", alignItems: "center", gap: 4,
    paddingHorizontal: SIZES.md, position: "relative",
  },
  activeIndicatorContainer: {
    position: "absolute",
    top: -12,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  activeIndicator: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  iconActiveGlow: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  tabLabel: { fontSize: 10, fontWeight: "bold", fontFamily: FONTS.bold, marginTop: 4 },
  tabLabelActive: { color: COLORS.primary },
  tabLabelInactive: { color: COLORS.mutedForeground },
});
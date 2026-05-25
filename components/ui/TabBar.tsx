import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SIZES, SHADOWS, FONTS } from "../../constants/Theme";

interface TabBarProps<T extends string> {
  tabs: { key: T; label: string }[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  style?: ViewStyle;
}

export function TabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  style,
}: TabBarProps<T>) {
  return (
    <View style={[styles.tabBar, style]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.muted,
    borderRadius: SIZES.radiusSmall,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.sm,
    alignItems: "center",
  },
  tabItemActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: FONTS.bold,
    textTransform: "capitalize",
  },
  tabLabelActive: { color: COLORS.foreground },
  tabLabelInactive: { color: COLORS.mutedForeground },
});

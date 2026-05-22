import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from "react-native";
import { COLORS, SIZES, SHADOWS, FONTS } from "../../constants/Theme";

interface IconButtonProps extends Omit<TouchableOpacityProps, "style"> {
  icon: React.ReactNode;
  size?: number;
  backgroundColor?: string;
  borderRadius?: number;
  shadow?: boolean;
  /** Optional numeric badge (e.g. notification count) */
  badgeCount?: number;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  size = 40,
  backgroundColor = COLORS.white,
  borderRadius = SIZES.radiusSmall,
  shadow = true,
  badgeCount,
  style,
  ...rest
}: IconButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        { width: size, height: size, backgroundColor, borderRadius },
        shadow && SHADOWS.sm,
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      {icon}
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: FONTS.bold,
  },
});

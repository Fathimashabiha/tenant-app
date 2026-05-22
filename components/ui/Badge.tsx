import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SIZES, FONTS } from "../../constants/Theme";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "neutral" | "accent";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  style?: ViewStyle;
  uppercase?: boolean;
}

export function Badge({
  label,
  variant = "primary",
  size = "sm",
  style,
  uppercase = false,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[`bg_${variant}`], style]}>
      <Text
        style={[
          styles.text,
          styles[`text_${variant}`],
          size === "md" && styles.textMd,
          uppercase && styles.uppercase,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: FONTS.bold,
  },
  textMd: { fontSize: 10 },
  uppercase: { textTransform: "uppercase" },

  // Backgrounds
  bg_primary: { backgroundColor: "#eff6ff" },
  bg_success: { backgroundColor: "#ecfdf5" },
  bg_warning: { backgroundColor: "#fffbeb" },
  bg_error: { backgroundColor: "#fef2f2" },
  bg_neutral: { backgroundColor: COLORS.muted },
  bg_accent: { backgroundColor: "#f7fee7" },

  // Text colors
  text_primary: { color: COLORS.primary },
  text_success: { color: "#059669" },
  text_warning: { color: "#d97706" },
  text_error: { color: COLORS.error },
  text_neutral: { color: COLORS.mutedForeground },
  text_accent: { color: COLORS.accent },
});

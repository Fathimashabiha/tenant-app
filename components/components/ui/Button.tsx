import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from "react-native";
import { COLORS, SIZES, SHADOWS, FONTS } from "../../constants/Theme";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? COLORS.primary : COLORS.white}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: SIZES.radiusMedium,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
  },
  fullWidth: { width: "100%" },
  disabled: { opacity: 0.4 },

  // Variants
  primary: { backgroundColor: COLORS.primary, ...SHADOWS.md },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: { backgroundColor: COLORS.muted },
  danger: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fee2e2",
  },
  success: { backgroundColor: COLORS.success, ...SHADOWS.md },

  // Sizes
  size_sm: { paddingVertical: SIZES.xs, paddingHorizontal: SIZES.sm },
  size_md: { paddingVertical: SIZES.md, paddingHorizontal: SIZES.lg },
  size_lg: { paddingVertical: 18, paddingHorizontal: SIZES.xl },

  // Text base
  text: { fontWeight: "bold", fontFamily: FONTS.bold },

  // Text variants
  text_primary: { color: COLORS.white },
  text_outline: { color: COLORS.primary },
  text_ghost: { color: COLORS.foreground },
  text_danger: { color: COLORS.error },
  text_success: { color: COLORS.white },

  // Text sizes
  textSize_sm: { fontSize: 10 },
  textSize_md: { fontSize: 14 },
  textSize_lg: { fontSize: 16 },
});

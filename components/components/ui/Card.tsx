import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { COLORS, SIZES, SHADOWS } from "../../constants/Theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** If provided, the card becomes touchable */
  onPress?: () => void;
  /** Shadow intensity */
  shadow?: "sm" | "md" | "lg" | "none";
  /** Border radius size */
  radius?: "sm" | "md" | "lg" | "xl";
  noBorder?: boolean;
  padding?: number;
}

export function Card({
  children,
  style,
  onPress,
  shadow = "sm",
  radius = "lg",
  noBorder = false,
  padding = SIZES.md,
}: CardProps) {
  const baseStyle: ViewStyle = {
    backgroundColor: COLORS.white,
    borderRadius: radiusMap[radius],
    padding,
    ...(shadowMap[shadow] as ViewStyle),
    ...(noBorder ? {} : { borderWidth: 1, borderColor: COLORS.border }),
  };

  if (onPress) {
    return (
      <TouchableOpacity style={[baseStyle, ...(Array.isArray(style) ? style : style ? [style] : [])]} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[baseStyle, ...(Array.isArray(style) ? style : style ? [style] : [])]}>{children}</View>;
}

const radiusMap: Record<string, number> = {
  sm: SIZES.radiusSmall,
  md: SIZES.radiusMedium,
  lg: SIZES.radiusLarge,
  xl: 32,
};

const shadowMap: Record<string, object> = {
  none: {},
  sm: SHADOWS.sm,
  md: SHADOWS.md,
  lg: SHADOWS.lg,
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.white,
  },
  border: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

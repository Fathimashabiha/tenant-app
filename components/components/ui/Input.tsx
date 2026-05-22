import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { COLORS, SIZES, SHADOWS, FONTS } from "../../constants/Theme";

interface InputProps extends TextInputProps {
  label?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: ViewStyle;
  /** Use true to render a tall multiline textarea */
  multiline?: boolean;
}

export function Input({
  label,
  leftSlot,
  rightSlot,
  containerStyle,
  multiline = false,
  style,
  ...rest
}: InputProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputCard, multiline && styles.inputCardMultiline]}>
        {leftSlot && <View style={styles.leftSlot}>{leftSlot}</View>}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            style,
          ]}
          placeholderTextColor={COLORS.mutedForeground}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          {...rest}
        />
        {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: SIZES.xs },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: FONTS.bold,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMedium,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  inputCardMultiline: {
    alignItems: "flex-start",
    paddingVertical: SIZES.md,
  },
  leftSlot: { flexDirection: "row", alignItems: "center" },
  rightSlot: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.foreground,
    fontFamily: FONTS.regular,
  },
  inputMultiline: {
    height: 128,
    textAlignVertical: "top",
  },
});

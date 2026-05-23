import { useState, useRef } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { Phone, ArrowRight, Shield } from "lucide-react-native";
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, SHADOWS, FONTS } from "../../constants/Theme";
import { Button, Input, Card } from "../../components/ui";

export default function Login() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const navigation = useNavigation<any>();
  const auth = useAuth();
  const otpRefs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const handleSendOtp = () => {
    if (phone.length >= 9) setStep("otp");
  };

  const handleVerify = async () => {
    await auth.login(phone);
    navigation.navigate("Main");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
    if (newOtp.every((d) => d !== "")) {
      setTimeout(handleVerify, 300);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={[COLORS.white, COLORS.background]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.headerContainer}>
            <Image source={require("../../assets/images/spacezen.jpeg")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to manage your home</Text>
          </Animated.View>

          {step === "phone" ? (
            <Animated.View entering={FadeInLeft.duration(400)} style={styles.formContainer}>
              <Input
                label="Mobile Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/\D/g, ""))}
                placeholder="50 123 4567"
                maxLength={10}
                leftSlot={
                  <View style={styles.countryCode}>
                    <Text style={styles.flag}>🇦🇪</Text>
                    <Text style={styles.code}>+971</Text>
                  </View>
                }
                rightSlot={<Phone size={20} color={COLORS.mutedForeground} />}
              />

              <Button
                label="Send OTP"
                variant="primary"
                size="md"
                fullWidth
                disabled={phone.length < 9}
                onPress={handleSendOtp}
                rightIcon={<ArrowRight size={20} color={COLORS.white} />}
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInRight.duration(400)} style={styles.formContainer}>
              <Text style={styles.otpMessage}>
                Enter the code sent to{" "}
                <Text style={styles.boldText}>+971 {phone}</Text>
              </Text>
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={otpRefs[i]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(i, val)}
                    style={styles.otpInput}
                  />
                ))}
              </View>
              <TouchableOpacity onPress={() => setStep("phone")}>
                <Text style={styles.changeNumberText}>Change number</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={styles.footer}>
            <Shield size={14} color={COLORS.mutedForeground} />
            <Text style={styles.footerText}>Secured with end-to-end encryption</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  dotActive: { width: 32, backgroundColor: COLORS.secondary },
  dotInactive: { width: 8, backgroundColor: "rgba(255, 255, 255, 0.4)" },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  innerContainer: { flex: 1, justifyContent: "center", paddingHorizontal: SIZES.lg, paddingVertical: SIZES.xxl },
  headerContainer: { alignItems: "center", marginBottom: SIZES.xxl },
  logo: { width: 140, height: 140, marginBottom: SIZES.md },
  title: { fontSize: 24, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.display },
  subtitle: { fontSize: 14, color: COLORS.mutedForeground, marginTop: SIZES.xs, fontFamily: FONTS.regular },
  formContainer: { gap: SIZES.lg },
  countryCode: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.muted, borderRadius: SIZES.radiusSmall, paddingHorizontal: SIZES.sm, paddingVertical: SIZES.sm },
  flag: { fontSize: 14 },
  code: { fontSize: 14, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  otpMessage: { textAlign: "center", fontSize: 14, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  boldText: { fontWeight: "bold", color: COLORS.foreground },
  otpRow: { flexDirection: "row", justifyContent: "center", gap: SIZES.sm, marginTop: SIZES.lg },
  otpInput: { width: 56, height: 56, backgroundColor: COLORS.white, borderRadius: SIZES.radiusMedium, textAlign: "center", fontSize: 24, fontWeight: "bold", borderWidth: 1, borderColor: COLORS.primary + "30", ...SHADOWS.sm, fontFamily: FONTS.bold },
  changeNumberText: { color: COLORS.secondary, fontSize: 14, fontWeight: "bold", textAlign: "center", marginTop: SIZES.md, fontFamily: FONTS.bold },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SIZES.sm, marginTop: SIZES.xl },
  footerText: { fontSize: 10, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
});
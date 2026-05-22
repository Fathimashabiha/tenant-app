import { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../constants/Theme";
import { Button } from "../../components/ui";

const { height, width } = Dimensions.get("window");

const slides = [
  { quote: "Your Building. Your Community. Your Control." },
  { quote: "Effortless Move-In. Digital Everything." },
  { quote: "Maintenance, Bills & More — All in One Place." },
];

export default function Welcome() {
  const [current, setCurrent] = useState(0);
  const navigation = useNavigation<any>();
  const quoteAnim = useRef(new Animated.Value(0)).current;



  useEffect(() => {
    quoteAnim.setValue(0);
    Animated.timing(quoteAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [current]);

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else navigation.navigate("Login");
  };

  const skip = () => navigation.navigate("Login");

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/welcome-bg.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(10, 50, 50, 0.4)", "rgba(10, 30, 30, 0.9)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentContainer}>


        <View style={styles.spacer} />

        <View style={styles.bottomContainer}>
          <Animated.Text
            style={[
              styles.quoteText,
              {
                opacity: quoteAnim,
                transform: [{ translateY: quoteAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              },
            ]}
          >
            {slides[current].quote}
          </Animated.Text>

          <View style={styles.dotsContainer}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === current ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={skip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <Button
              label={current === slides.length - 1 ? "Get Started" : "Next"}
              variant="primary"
              size="md"
              onPress={next}
              rightIcon={<ChevronRight color="white" size={16} />}
              style={styles.nextButtonOverride}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black, position: "relative" },
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  contentContainer: {
    flex: 1, zIndex: 10, flexDirection: "column", justifyContent: "space-between",
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.xxl,
  },
  logoContainer: { alignItems: "center", paddingTop: SIZES.xl },
  logo: { width: 80, height: 80 },
  spacer: { flex: 1 },
  bottomContainer: { paddingBottom: SIZES.lg },
  quoteText: {
    fontSize: 24, fontWeight: "bold", color: COLORS.white, textAlign: "center",
    lineHeight: 32, marginBottom: SIZES.xl, fontFamily: FONTS.display,
  },
  dotsContainer: { flexDirection: "row", justifyContent: "center", gap: SIZES.sm, marginBottom: SIZES.xxl },
  dot: { height: 8, borderRadius: SIZES.radiusFull },
  dotActive: { width: 32, backgroundColor: COLORS.secondary },
  dotInactive: { width: 8, backgroundColor: "rgba(255, 255, 255, 0.4)" },
  buttonRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  skipButton: { paddingHorizontal: SIZES.md },
  skipText: { color: "rgba(255, 255, 255, 0.7)", fontSize: 14, fontWeight: "500" },
  nextButtonOverride: { borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.xl },
});
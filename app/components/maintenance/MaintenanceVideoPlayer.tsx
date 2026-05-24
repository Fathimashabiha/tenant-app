import { View, Text, StyleSheet } from "react-native";
import { Video } from "lucide-react-native";
import { isExpoVideoAvailable } from "../../../lib/maintenanceAudio";
import { COLORS } from "../../../constants/Theme";

type Props = {
  uri: string;
  title?: string;
  subtitle?: string;
  height?: number;
};

export default function MaintenanceVideoPlayer({
  uri,
  title = "Video Attachment",
  subtitle = "Recorded Video Note",
  height = 200,
}: Props) {
  if (!isExpoVideoAvailable()) {
    return (
      <View style={styles.fallback}>
        <Video size={20} color={COLORS.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.fallbackTitle}>{title}</Text>
          <Text style={styles.fallbackSub}>{subtitle}</Text>
        </View>
      </View>
    );
  }

  const MaintenanceVideoPlayerNative = require("./MaintenanceVideoPlayerNative").default;
  return <MaintenanceVideoPlayerNative uri={uri} height={height} />;
}

const styles = StyleSheet.create({
  fallback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ecfeff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  fallbackTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  fallbackSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
});

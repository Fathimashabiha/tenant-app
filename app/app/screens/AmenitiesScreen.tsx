import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { amenitiesService } from "../../lib/amenitiesService";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import {
  Dumbbell, Waves, Users, Presentation, Truck, Flame,
  X, QrCode, Check, ChevronRight, ChevronDown, Clock, Calendar, Car,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, GRADIENTS } from "../../constants/Theme";
import AppLayout from "../../components/layout/AppLayout";

// ─── Types ───────────────────────────────────────────────────────────────────

type Facility = {
  id: string;
  label: string;
  Icon: any;
  available: boolean;
  iconColor: string;
  iconBg: string;
};

type Booking = {
  id: number;
  facility: string;
  date: string;
  time: string;
  status: "completed" | "cancelled" | "upcoming";
};

// ─── Data ────────────────────────────────────────────────────────────────────

const DATES = ["Mar 18", "Mar 19", "Mar 20", "Mar 21", "Mar 22", "Mar 23", "Mar 24"];
const TIME_SLOTS = ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
const DURATION_OPTIONS = ["1 Day", "1 Week", "1 Month", "Permanent"];

const FACILITY_LOOKUPS: Record<string, { Icon: any; iconColor: string; iconBg: string }> = {
  gym: { Icon: Dumbbell, iconColor: COLORS.primary, iconBg: COLORS.badgeBackground },
  pool: { Icon: Waves, iconColor: COLORS.secondary, iconBg: COLORS.muted },
  clubhouse: { Icon: Users, iconColor: COLORS.primary, iconBg: COLORS.badgeBackground },
  meetingroom: { Icon: Presentation, iconColor: COLORS.mutedForeground, iconBg: COLORS.muted },
  playarea: { Icon: Flame, iconColor: COLORS.warning, iconBg: "#fff7ed" },
  liftbooking: { Icon: Truck, iconColor: COLORS.secondary, iconBg: COLORS.muted },
};

const getFacilityMeta = (name: string) => {
  const norm = name.toLowerCase().replace(/\s+/g, "");
  return FACILITY_LOOKUPS[norm] || { Icon: Dumbbell, iconColor: COLORS.primary, iconBg: COLORS.badgeBackground };
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function QRModal({ facility, onClose }: { facility: string; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.qrModal}>
          <TouchableOpacity style={styles.qrClose} onPress={onClose}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.qrBox}>
            <QrCode size={110} color="white" />
          </View>
          <Text style={styles.qrTitle}>{facility} Access</Text>
          <Text style={styles.qrSub}>Scan at entrance</Text>
          <Text style={styles.qrValid}>Valid for booked slot only</Text>
        </View>
      </View>
    </Modal>
  );
}

function ParkingModal({ onClose }: { onClose: () => void }) {
  const [plate, setPlate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("1 Day");
  const [showDrop, setShowDrop] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.parkingModal}>
            <View style={styles.successIconBg}>
              <Check size={28} color="white" />
            </View>
            <Text style={styles.qrTitle}>Request Submitted!</Text>
            <Text style={styles.qrSub}>Your parking request is being reviewed.</Text>
            <TouchableOpacity style={styles.submitBtn} onPress={onClose}>
              <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
                <Text style={styles.submitBtnText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.parkingModal}>
          <View style={styles.parkingModalHeader}>
            <Text style={styles.parkingModalTitle}>Request Parking</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Vehicle Plate Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter vehicle plate number"
            placeholderTextColor="#94a3b8"
            value={plate}
            onChangeText={setPlate}
          />

          <Text style={styles.fieldLabel}>Vehicle Type</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter vehicle type"
            placeholderTextColor="#94a3b8"
            value={vehicleType}
            onChangeText={setVehicleType}
          />

          <Text style={styles.fieldLabel}>Purpose (Visitor/Extra)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter purpose (visitor/extra)"
            placeholderTextColor="#94a3b8"
            value={purpose}
            onChangeText={setPurpose}
          />

          <Text style={styles.fieldLabel}>Duration</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowDrop(!showDrop)}>
            <Text style={styles.dropdownText}>{duration}</Text>
            <ChevronDown size={16} color="#64748b" />
          </TouchableOpacity>
          {showDrop && (
            <View style={styles.dropList}>
              {DURATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.dropItem, duration === opt && styles.dropItemActive]}
                  onPress={() => { setDuration(opt); setShowDrop(false); }}
                >
                  <Text style={[styles.dropItemText, duration === opt && styles.dropItemTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={() => setSubmitted(true)}>
            <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
              <Text style={styles.submitBtnText}>Submit Request</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function Amenities() {
  const queryClient = useQueryClient();
  const TENANT_ID = "default-tenant-uuid";

  const { data: serverFacilities = [] } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => amenitiesService.getFacilities(),
  });

  const { data: serverBookings = [] } = useQuery({
    queryKey: ["amenitiesBookings", TENANT_ID],
    queryFn: () => amenitiesService.getBookings(TENANT_ID),
  });

  const { data: serverParking = [] } = useQuery({
    queryKey: ["parking", TENANT_ID],
    queryFn: () => amenitiesService.getParkingRequests(TENANT_ID),
  });

  const bookMutation = useMutation({
    mutationFn: (payload: any) => amenitiesService.bookFacility(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenitiesBookings"] });
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        setSelected(null);
        setSelectedTime(null);
      }, 2500);
    }
  });

  const [tab, setTab] = useState<"book" | "history">("book");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("Mar 20");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [qrFacility, setQrFacility] = useState<string | null>(null);
  const [showParking, setShowParking] = useState(false);

  const uiFacilities = useMemo(() => {
    return serverFacilities.map(f => {
      const meta = getFacilityMeta(f.name);
      return {
        id: f.id,
        label: f.name,
        Icon: meta.Icon,
        available: true,
        iconColor: meta.iconColor,
        iconBg: meta.iconBg,
      };
    });
  }, [serverFacilities]);

  const apiUpcoming = useMemo(() => {
    return serverBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').map(b => ({
      id: b.id,
      facility: b.facility?.name || "Facility",
      date: new Date(b.bookingDate).toLocaleDateString(),
      time: `${b.startTime} - ${b.endTime}`,
      status: "upcoming"
    }));
  }, [serverBookings]);

  const apiHistory = useMemo(() => {
    return serverBookings.filter(b => b.status === 'completed' || b.status === 'cancelled').map(b => ({
      id: b.id,
      facility: b.facility?.name || "Facility",
      date: new Date(b.bookingDate).toLocaleDateString(),
      time: `${b.startTime} - ${b.endTime}`,
      status: b.status as "completed" | "cancelled" | "upcoming"
    }));
  }, [serverBookings]);

  const handleBook = () => {
    // Basic mock of finding an ID
    const facilityId = serverFacilities.find(f => f.name.toLowerCase().includes(selected?.toLowerCase() || ''))?.id;
    bookMutation.mutate({
      tenantId: TENANT_ID,
      facilityId: facilityId || "00000000-0000-0000-0000-000000000000",
      bookingDate: selectedDate,
      startTime: selectedTime || "10:00 AM",
      endTime: "11:00 AM"
    });
  };

  const handleFacilityPress = (f: Facility) => {
    if (!f.available) return;
    setSelected(f.label);
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={GRADIENTS.activeNav}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Amenities</Text>
          <Text style={styles.headerSub}>Book facilities & manage access</Text>
        </LinearGradient>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Tab Bar */}
          <View style={styles.tabRow}>
            {(["book", "history"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === "book" ? "Book" : "History"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "book" ? (
            <View style={styles.content}>
              {/* Facility Grid */}
              <Text style={styles.sectionTitle}>Select Facility</Text>
              <View style={styles.facilityGrid}>
                {uiFacilities.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    disabled={!f.available}
                    onPress={() => handleFacilityPress(f)}
                    style={[
                      styles.facilityCard,
                      selected === f.label && styles.facilityCardActive,
                      !f.available && styles.facilityCardUnavailable,
                    ]}
                  >
                    <View style={[styles.facilityIconBg, { backgroundColor: f.iconBg }]}>
                      <f.Icon size={22} color={f.available ? f.iconColor : "#94a3b8"} />
                    </View>
                    <Text style={[styles.facilityLabel, !f.available && styles.facilityLabelUnavailable]}>
                      {f.label}
                    </Text>
                    {!f.available && (
                      <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableBadgeText}>N/A</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Booking Panel */}
              {selected && !confirmed && (
                <View style={styles.bookingPanel}>
                  <Text style={styles.bookingFacilityTitle}>{selected}</Text>

                  {/* Date */}
                  <Text style={styles.bookingLabel}>Select Date</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {DATES.map((d) => (
                        <TouchableOpacity
                          key={d}
                          onPress={() => setSelectedDate(d)}
                          style={[styles.dateChip, selectedDate === d && styles.dateChipActive]}
                        >
                          {selectedDate === d ? (
                            <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.dateChipGrad}>
                              <Text style={styles.dateChipTextActive}>{d}</Text>
                            </LinearGradient>
                          ) : (
                            <Text style={styles.dateChipText}>{d}</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Time */}
                  <Text style={styles.bookingLabel}>Select Time</Text>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setSelectedTime(t)}
                        style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
                      >
                        {selectedTime === t ? (
                          <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.timeChipGrad}>
                            <Text style={styles.timeChipTextActive}>{t}</Text>
                          </LinearGradient>
                        ) : (
                          <Text style={styles.timeChipText}>{t}</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {selectedTime && (
                    <TouchableOpacity onPress={handleBook} style={{ marginTop: 16 }}>
                      <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmBtn}>
                        <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Success */}
              {confirmed && (
                <View style={styles.successCard}>
                  <View style={styles.successIconBg}>
                    <Check size={28} color="white" />
                  </View>
                  <Text style={styles.successTitle}>Booking Confirmed!</Text>
                  <Text style={styles.successSub}>{selected} · {selectedDate} · {selectedTime}</Text>
                </View>
              )}

              {/* Parking Section */}
              <Text style={styles.sectionTitle}>Parking</Text>
              <View style={styles.parkingSection}>
                {/* Assigned slot */}
                <View style={styles.parkingSlotCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.parkingSlotTitle}>Plate: K-88291 · Spot B2-14</Text>
                    <Text style={styles.parkingSlotSub}>Assigned</Text>
                  </View>
                  <View style={styles.parkingBadgeActive}>
                    <Text style={styles.parkingBadgeActiveText}>Active</Text>
                  </View>
                </View>

                {/* Guest slot */}
                <View style={styles.parkingSlotCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.parkingSlotTitle}>Plate: Guest · Spot V-03</Text>
                    <Text style={styles.parkingSlotSub}>Visitor</Text>
                  </View>
                  <Text style={styles.parkingBadgeExpired}>Expired</Text>
                </View>

                {/* Request additional */}
                <TouchableOpacity style={styles.parkingRequestBtn} onPress={() => setShowParking(true)}>
                  <Text style={styles.parkingRequestBtnText}>+ Request Additional Parking</Text>
                </TouchableOpacity>
              </View>

              {/* Upcoming Bookings */}
              {apiUpcoming.length > 0 && !selected && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
                  <View style={styles.list}>
                    {apiUpcoming.map((b) => (
                      <View key={b.id} style={styles.upcomingCard}>
                        <LinearGradient
                          colors={GRADIENTS.activeNav}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.upcomingIcon}
                        >
                          <Calendar size={18} color="white" />
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.upcomingTitle}>{b.facility} · {b.date}</Text>
                          <Text style={styles.upcomingTime}>{b.time}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.qrBtn}
                          onPress={() => setQrFacility(b.facility)}
                        >
                          <QrCode size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            // ── History Tab ──
            <View style={styles.content}>
              <View style={styles.list}>
                {apiHistory.map((b) => (
                  <View key={b.id} style={styles.historyCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyTitle}>{b.facility}</Text>
                      <Text style={styles.historySub}>{b.date} · {b.time}</Text>
                    </View>
                    <View style={styles.historyRight}>
                      <View style={[
                        styles.statusBadge,
                        b.status === "completed" ? styles.statusCompleted :
                        b.status === "cancelled" ? styles.statusCancelled : styles.statusUpcoming,
                      ]}>
                        <Text style={[
                          styles.statusText,
                          b.status === "completed" ? styles.statusTextCompleted :
                          b.status === "cancelled" ? styles.statusTextCancelled : styles.statusTextUpcoming,
                        ]}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </Text>
                      </View>
                      {b.status === "completed" && (
                        <TouchableOpacity style={styles.qrBtn} onPress={() => setQrFacility(b.facility)}>
                          <QrCode size={18} color="#94a3b8" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* QR Modal */}
        {qrFacility && <QRModal facility={qrFacility} onClose={() => setQrFacility(null)} />}

        {/* Parking Modal */}
        {showParking && <ParkingModal onClose={() => setShowParking(false)} />}
      </View>
    </AppLayout>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  scroll: { flex: 1 },

  // Tabs
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 14,
    margin: 20,
    padding: 4,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "white",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
  tabTextActive: { color: "#0f172a", fontWeight: "700" },

  content: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 14 },
  list: { gap: 10 },

  // Facility Grid
  facilityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  facilityCard: {
    width: "30.5%", aspectRatio: 1,
    backgroundColor: "white", borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    paddingBottom: 10,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
    position: "relative",
  },
  facilityCardActive: { borderColor: "#2248db", backgroundColor: "#eff6ff" },
  facilityCardUnavailable: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  facilityIconBg: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  facilityLabel: { fontSize: 11, fontWeight: "700", color: "#0f172a", textAlign: "center" },
  facilityLabelUnavailable: { color: "#94a3b8" },
  unavailableBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "#e2e8f0", borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  unavailableBadgeText: { fontSize: 9, fontWeight: "700", color: "#94a3b8" },

  // Parking section
  parkingSection: {
    backgroundColor: "white", borderRadius: 16, padding: 4,
    marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
    borderWidth: 1, borderColor: "#e8edf5",
    gap: 2,
  },
  parkingSlotCard: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: "#f8fafc", borderRadius: 12,
  },
  parkingSlotTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  parkingSlotSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  parkingBadgeActive: {
    backgroundColor: "#f0fdf9", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: "#6ee7c7",
  },
  parkingBadgeActiveText: { fontSize: 12, fontWeight: "700", color: "#0d9488" },
  parkingBadgeExpired: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
  parkingRequestBtn: {
    margin: 6, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#2248db", borderStyle: "dashed",
    paddingVertical: 14, alignItems: "center",
  },
  parkingRequestBtnText: { fontSize: 14, fontWeight: "700", color: "#2248db" },

  // Booking panel
  bookingPanel: {
    backgroundColor: "white", borderRadius: 16, padding: 16,
    marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  bookingFacilityTitle: {
    fontSize: 15, fontWeight: "800", color: "#0f172a",
    marginBottom: 14,
  },
  bookingLabel: { fontSize: 13, fontWeight: "700", color: "#0f172a", marginBottom: 10 },
  dateChip: {
    borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0",
    backgroundColor: "white", overflow: "hidden",
  },
  dateChipActive: { borderColor: "transparent" },
  dateChipGrad: { paddingHorizontal: 14, paddingVertical: 8 },
  dateChipText: { paddingHorizontal: 14, paddingVertical: 8, fontSize: 12, fontWeight: "700", color: "#0f172a" },
  dateChipTextActive: { fontSize: 12, fontWeight: "700", color: "white" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeChip: {
    width: "23%", borderRadius: 10, borderWidth: 1,
    borderColor: "#e2e8f0", backgroundColor: "white",
    alignItems: "center", overflow: "hidden",
  },
  timeChipActive: { borderColor: "transparent" },
  timeChipGrad: { width: "100%", paddingVertical: 10, alignItems: "center" },
  timeChipText: { paddingVertical: 10, fontSize: 11, fontWeight: "700", color: "#0f172a" },
  timeChipTextActive: { fontSize: 11, fontWeight: "700", color: "white" },
  confirmBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  confirmBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  // Success
  successCard: {
    backgroundColor: "white", borderRadius: 16, padding: 32,
    alignItems: "center", marginBottom: 20,
    borderWidth: 1, borderColor: "#dcfce7",
  },
  successIconBg: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#22c55e",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  successTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  successSub: { fontSize: 13, color: "#64748b", marginTop: 4 },

  // Upcoming bookings
  upcomingCard: {
    backgroundColor: "white", borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  upcomingIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  upcomingTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  upcomingTime: { fontSize: 11, color: "#64748b", marginTop: 2 },
  qrBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "#f1f5f9",
    alignItems: "center", justifyContent: "center",
  },

  // History
  historyCard: {
    backgroundColor: "white", borderRadius: 14, padding: 16,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  historyTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  historySub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  historyRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusCompleted: { backgroundColor: "#f0fdf4" },
  statusCancelled: { backgroundColor: "#fef2f2" },
  statusUpcoming: { backgroundColor: "#eff6ff" },
  statusText: { fontSize: 12, fontWeight: "700" },
  statusTextCompleted: { color: COLORS.success },
  statusTextCancelled: { color: COLORS.error },
  statusTextUpcoming: { color: COLORS.primary },

  // Overlay / Modals
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },

  // QR Modal
  qrModal: {
    backgroundColor: "white", borderRadius: 28, padding: 28,
    alignItems: "center", width: "100%", maxWidth: 360,
  },
  qrClose: {
    position: "absolute", top: 20, right: 20, padding: 6,
    backgroundColor: "#f1f5f9", borderRadius: 8,
  },
  qrBox: {
    width: 190, height: 190, backgroundColor: "#0f172a",
    borderRadius: 20, alignItems: "center", justifyContent: "center",
    marginBottom: 20, marginTop: 8,
  },
  qrTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  qrSub: { fontSize: 13, color: "#64748b", marginTop: 4 },
  qrValid: { fontSize: 12, color: COLORS.primary, marginTop: 8, fontWeight: "600" },

  // Parking Modal
  parkingModal: {
    backgroundColor: "white", borderRadius: 24, padding: 24,
    width: "100%", maxWidth: 400,
  },
  parkingModalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  parkingModalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#0f172a", marginBottom: 6 },
  input: {
    backgroundColor: "#f1f5f9", borderRadius: 12, padding: 14,
    fontSize: 13, color: "#0f172a", marginBottom: 14,
  },
  dropdown: {
    backgroundColor: "#f1f5f9", borderRadius: 12, padding: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 6,
  },
  dropdownText: { fontSize: 13, color: "#0f172a" },
  dropList: {
    backgroundColor: "white", borderRadius: 12, marginBottom: 14,
    borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden",
  },
  dropItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropItemActive: { backgroundColor: "#64748b" },
  dropItemText: { fontSize: 13, color: "#0f172a" },
  dropItemTextActive: { color: "white", fontWeight: "700" },
  submitBtn: { marginTop: 8 },
  submitBtnGrad: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  // Unused legacy styles kept for reference
  parkingCard: {
    backgroundColor: "white", borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
    borderWidth: 1, borderColor: "#e8edf5",
  },
  parkingCardIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "#eff3ff", alignItems: "center", justifyContent: "center",
  },
  parkingCardTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  parkingCardSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
});
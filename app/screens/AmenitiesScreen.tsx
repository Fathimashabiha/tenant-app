import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { amenitiesService } from "../../lib/amenitiesService";
import {
  buildNextDaysOptions,
  formatDisplayDate,
  isAmenityBookingPast,
  labelForDateValue,
} from "../../lib/dateUtils";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform, Image, Alert,
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

function QRModal({
  facility,
  qrCodeUrl,
  onClose,
}: {
  facility: string;
  qrCodeUrl?: string;
  onClose: () => void;
}) {
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.qrModal}>
          <TouchableOpacity style={styles.qrClose} onPress={onClose}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.qrBox}>
            {qrCodeUrl ? (
              <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} resizeMode="contain" />
            ) : (
              <QrCode size={110} color="white" />
            )}
          </View>
          <Text style={styles.qrTitle}>{facility} Access</Text>
          <Text style={styles.qrSub}>Scan at entrance</Text>
          <Text style={styles.qrValid}>Valid for booked slot only</Text>
        </View>
      </View>
    </Modal>
  );
}

function ParkingModal({
  tenantId,
  onClose,
  onSubmitted,
}: {
  tenantId: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [plate, setPlate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("1 Day");
  const [showDrop, setShowDrop] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const parkingMutation = useMutation({
    mutationFn: (payload: {
      vehicleModel: string;
      licensePlate: string;
      vehicleType?: string;
      purpose?: string;
      duration?: string;
    }) =>
      amenitiesService.requestParking({
        tenantId,
        ...payload,
      }),
    onSuccess: () => {
      setSubmitted(true);
      onSubmitted();
    },
    onError: () => {
      Alert.alert("Error", "Could not submit your parking request. Please try again.");
    },
  });

  if (submitted) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.parkingModal}>
            <View style={styles.successIconBg}>
              <Check size={28} color="white" />
            </View>
            <Text style={styles.qrTitle}>Request Submitted!</Text>
            <Text style={styles.qrSub}>
              Your request is being reviewed. You will get a parking QR once approved (about 8 seconds in demo mode).
            </Text>
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

          <TouchableOpacity
            style={styles.submitBtn}
            disabled={!plate.trim() || parkingMutation.isPending}
            onPress={() =>
              parkingMutation.mutate({
                vehicleModel: vehicleType.trim() || "Vehicle",
                licensePlate: plate.trim(),
                vehicleType: vehicleType.trim() || undefined,
                purpose: purpose.trim() || undefined,
                duration,
              })
            }
          >
            <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
              <Text style={styles.submitBtnText}>
                {parkingMutation.isPending ? "Submitting..." : "Submit Request"}
              </Text>
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
  const dateOptions = useMemo(() => buildNextDaysOptions(7), []);

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
    refetchInterval: (query) => {
      const list = query.state.data ?? [];
      if (list.some((p) => p.status === "pending")) return 4000;
      if (list.some((p) => p.status === "approved" && !p.qrCodeUrl)) return 2000;
      return false;
    },
  });

  const [tab, setTab] = useState<"book" | "history">("book");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => buildNextDaysOptions(7)[0]?.value ?? "");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [qrView, setQrView] = useState<{ facility: string; qrCodeUrl?: string } | null>(null);
  const [showParking, setShowParking] = useState(false);

  const { data: availability } = useQuery({
    queryKey: ["amenityAvailability", selectedFacilityId, selectedDate],
    queryFn: () => amenitiesService.getAvailability(selectedFacilityId!, selectedDate),
    enabled: Boolean(selectedFacilityId && selectedDate),
  });

  const bookedStartTimes = useMemo(
    () => new Set((availability?.bookedSlots ?? []).map((s) => s.startTime)),
    [availability],
  );

  const bookMutation = useMutation({
    mutationFn: (payload: Parameters<typeof amenitiesService.bookFacility>[0]) =>
      amenitiesService.bookFacility(payload),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["amenitiesBookings"] });
      queryClient.invalidateQueries({ queryKey: ["amenityAvailability"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
      setConfirmed(true);
      if (booking.qrCodeUrl && selected) {
        setQrView({ facility: selected, qrCodeUrl: booking.qrCodeUrl });
      }
      setTimeout(() => {
        setConfirmed(false);
        setSelected(null);
        setSelectedFacilityId(null);
        setSelectedTime(null);
      }, 2500);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ||
        "This time slot is no longer available. Please choose another slot.";
      Alert.alert("Booking unavailable", msg);
      queryClient.invalidateQueries({ queryKey: ["amenityAvailability"] });
    },
  });

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
    return serverBookings
      .filter(
        (b) =>
          b.status === "confirmed" &&
          !isAmenityBookingPast(b.bookingDate, b.endTime)
      )
      .map((b) => ({
        id: b.id,
        facility: b.facility?.name || "Facility",
        date: formatDisplayDate(b.bookingDate),
        time: `${b.startTime} - ${b.endTime}`,
        status: "upcoming" as const,
        qrCodeUrl: b.qrCodeUrl,
      }));
  }, [serverBookings]);

  const apiHistory = useMemo(() => {
    return serverBookings
      .filter((b) => {
        if (b.status === "cancelled" || b.status === "completed") return true;
        return (
          b.status === "confirmed" &&
          isAmenityBookingPast(b.bookingDate, b.endTime)
        );
      })
      .map((b) => ({
        id: b.id,
        facility: b.facility?.name || "Facility",
        date: formatDisplayDate(b.bookingDate),
        time: `${b.startTime} - ${b.endTime}`,
        status: (b.status === "cancelled"
          ? "cancelled"
          : "completed") as "completed" | "cancelled" | "upcoming",
        qrCodeUrl: b.qrCodeUrl,
      }));
  }, [serverBookings]);

  const handleBook = () => {
    if (!selectedFacilityId || !selectedTime) return;
    bookMutation.mutate({
      tenantId: TENANT_ID,
      facilityId: selectedFacilityId,
      bookingDate: selectedDate,
      startTime: selectedTime,
    });
  };

  const handleFacilityPress = (f: Facility) => {
    if (!f.available) return;
    setSelected(f.label);
    setSelectedFacilityId(f.id);
    setSelectedTime(null);
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
                      {dateOptions.map((d) => (
                        <TouchableOpacity
                          key={d.value}
                          onPress={() => { setSelectedDate(d.value); setSelectedTime(null); }}
                          style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive]}
                        >
                          {selectedDate === d.value ? (
                            <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.dateChipGrad}>
                              <Text style={styles.dateChipTextActive}>{d.label}</Text>
                            </LinearGradient>
                          ) : (
                            <Text style={styles.dateChipText}>{d.label}</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Time */}
                  <Text style={styles.bookingLabel}>Select Time</Text>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map((t) => {
                      const isBooked = bookedStartTimes.has(t);
                      return (
                      <TouchableOpacity
                        key={t}
                        disabled={isBooked}
                        onPress={() => setSelectedTime(t)}
                        style={[
                          styles.timeChip,
                          selectedTime === t && styles.timeChipActive,
                          isBooked && styles.timeChipBooked,
                        ]}
                      >
                        {selectedTime === t && !isBooked ? (
                          <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.timeChipGrad}>
                            <Text style={styles.timeChipTextActive}>{t}</Text>
                          </LinearGradient>
                        ) : (
                          <Text style={[styles.timeChipText, isBooked && styles.timeChipTextBooked]}>
                            {isBooked ? `${t} · Booked` : t}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );})}
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
                  <Text style={styles.successSub}>
                    {selected} · {labelForDateValue(selectedDate, dateOptions)} · {selectedTime}
                  </Text>
                </View>
              )}

              {/* Parking Section */}
              <Text style={styles.sectionTitle}>Parking</Text>
              <View style={styles.parkingSection}>
                {serverParking.length === 0 ? (
                  <Text style={styles.parkingEmpty}>No parking passes yet.</Text>
                ) : (
                  serverParking.map((p) => (
                    <View key={p.id} style={styles.parkingSlotCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.parkingSlotTitle}>
                          {p.licensePlate} · {p.assignedSlot ? `Spot ${p.assignedSlot}` : "Pending slot"}
                        </Text>
                        <Text style={styles.parkingSlotSub}>
                          {p.purpose || p.vehicleModel} · {p.duration || "—"}
                        </Text>
                      </View>
                      {p.status === "approved" ? (
                        <TouchableOpacity
                          style={[styles.qrBtn, !p.qrCodeUrl && styles.qrBtnDisabled]}
                          disabled={!p.qrCodeUrl}
                          onPress={() =>
                            setQrView({
                              facility: `Parking ${p.assignedSlot ?? "pass"}`,
                              qrCodeUrl: p.qrCodeUrl,
                            })
                          }
                        >
                          <QrCode size={18} color={p.qrCodeUrl ? COLORS.primary : "#94a3b8"} />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.parkingBadgePending}>
                          <Text style={styles.parkingBadgePendingText}>
                            {p.status === "pending" ? "Pending" : p.status}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                )}

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
                          onPress={() => setQrView({ facility: b.facility, qrCodeUrl: b.qrCodeUrl })}
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
                      {(b.status === "completed" || b.status === "confirmed") && b.qrCodeUrl && (
                        <TouchableOpacity
                          style={styles.qrBtn}
                          onPress={() => setQrView({ facility: b.facility, qrCodeUrl: b.qrCodeUrl })}
                        >
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
        {qrView && (
          <QRModal
            facility={qrView.facility}
            qrCodeUrl={qrView.qrCodeUrl}
            onClose={() => setQrView(null)}
          />
        )}

        {showParking && (
          <ParkingModal
            tenantId={TENANT_ID}
            onClose={() => setShowParking(false)}
            onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["parking"] })}
          />
        )}
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
  timeChipBooked: { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0", opacity: 0.7 },
  timeChipTextBooked: { color: "#94a3b8", fontSize: 10 },
  qrImage: { width: 200, height: 200, backgroundColor: "white", borderRadius: 8 },
  parkingEmpty: { fontSize: 13, color: "#64748b", marginBottom: 12 },
  parkingBadgePending: {
    backgroundColor: "#fff7ed", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100,
  },
  parkingBadgePendingText: { fontSize: 11, fontWeight: "700", color: "#c2410c" },
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
  qrBtnDisabled: { opacity: 0.5 },

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
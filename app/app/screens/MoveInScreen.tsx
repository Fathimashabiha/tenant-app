import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moveinService } from "../../lib/moveInService";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Switch, TextInput, Modal, KeyboardAvoidingView, Platform, Pressable
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft, Building2, MapPin, Users, FileText, Download,
  Upload, Camera, CheckCircle2, Circle, Truck, Car, Key,
  Home as HomeIcon, ArrowRight, Check, X
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, SHADOWS, GRADIENTS } from "../../constants/Theme";

const TABS = ["Address", "Documents", "Photos", "Requests", "Complete"];

// ─── Types ───────────────────────────────────────────────────────────────────
type Document = {
  id: string;
  name: string;
  type: "upload" | "download";
  status: "uploaded" | "pending" | "ready";
  size: string;
};

type Room = { id: string; name: string; photos: number };

type FamilyMember = {
  id: string;
  name: string;
  role: string;
  id_no: string;
};

// ─── Static Data ─────────────────────────────────────────────────────────────
const DOCUMENTS: Document[] = [
  { id: "1", name: "Lease Agreement",      type: "upload",   status: "uploaded", size: "1.2 MB" },
  { id: "2", name: "Emirates ID Copy",     type: "upload",   status: "uploaded", size: "580 KB" },
  { id: "3", name: "Passport Copy",        type: "upload",   status: "pending",  size: "" },
  { id: "4", name: "DEWA Connection Form", type: "download", status: "ready",    size: "245 KB" },
  { id: "5", name: "Internet Setup Guide", type: "download", status: "ready",    size: "180 KB" },
  { id: "6", name: "Building Rules",       type: "download", status: "ready",    size: "320 KB" },
  { id: "7", name: "Emergency Contacts",   type: "download", status: "ready",    size: "95 KB" },
];

const ROOMS: Room[] = [
  { id: "1", name: "Living Room",     photos: 0 },
  { id: "2", name: "Master Bedroom",  photos: 0 },
  { id: "3", name: "Bedroom 2",       photos: 0 },
  { id: "4", name: "Kitchen",         photos: 0 },
  { id: "5", name: "Master Bathroom", photos: 0 },
  { id: "6", name: "Guest Bathroom",  photos: 0 },
  { id: "7", name: "Balcony",         photos: 0 },
  { id: "8", name: "Entrance",        photos: 0 },
];

const INITIAL_FAMILY: FamilyMember[] = [
  { id: "1", name: "Fatima Al Mansoori", role: "Spouse", id_no: "784-1988-XXXXXXX-X" },
  { id: "2", name: "Yousuf Al Mansoori", role: "Child",  id_no: "784-2015-XXXXXXX-Y" },
];

// ─── FadeSlideIn ─────────────────────────────────────────────────────────────
function FadeSlideIn({ children, style }: { children: React.ReactNode; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

// ─── Tab Bar (unused – tabs now live inside the gradient header) ──────────────

// ─── Add Family Member Modal ──────────────────────────────────────────────────
function AddFamilyModal({ visible, onClose, onAdd }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (member: Omit<FamilyMember, "id">) => void;
}) {
  const [name, setName]     = useState("");
  const [relation, setRelation] = useState("");
  const [emiratesId, setEmiratesId] = useState("");
  const [phone, setPhone]   = useState("");
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1,   duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0,   useNativeDriver: true, damping: 18, stiffness: 200 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), role: relation.trim() || "Family", id_no: emiratesId.trim() || "—" });
    setName(""); setRelation(""); setEmiratesId(""); setPhone("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[m.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={m.kvWrapper}>
          <Animated.View style={[m.sheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Modal Header */}
            <View style={m.modalHeader}>
              <Text style={m.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={onClose} style={m.closeBtn}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Fields */}
            <View style={m.fieldGroup}>
              <Text style={m.fieldLabel}>Full Name</Text>
              <TextInput
                style={m.input}
                placeholder="Enter full name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={m.fieldGroup}>
              <Text style={m.fieldLabel}>Relation</Text>
              <TextInput
                style={m.input}
                placeholder="Enter relation"
                placeholderTextColor="#94a3b8"
                value={relation}
                onChangeText={setRelation}
              />
            </View>

            <View style={m.fieldGroup}>
              <Text style={m.fieldLabel}>Emirates ID</Text>
              <TextInput
                style={m.input}
                placeholder="Enter emirates id"
                placeholderTextColor="#94a3b8"
                value={emiratesId}
                onChangeText={setEmiratesId}
                keyboardType="numeric"
              />
            </View>

            <View style={m.fieldGroup}>
              <Text style={m.fieldLabel}>Phone Number</Text>
              <TextInput
                style={m.input}
                placeholder="Enter phone number"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Add Member Button */}
            <LinearGradient
              colors={GRADIENTS.activeNav}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={m.addBtnGradient}
            >
              <TouchableOpacity style={m.addBtn} onPress={handleAdd}>
                <Text style={m.addBtnText}>Add Member</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  kvWrapper:      { justifyContent: "flex-end" },
  sheet:          { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalTitle:     { fontSize: 20, fontWeight: "bold", color: "#1e293b", fontFamily: FONTS.display },
  closeBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  fieldGroup:     { marginBottom: 14 },
  fieldLabel:     { fontSize: 14, fontWeight: "600", color: "#1e293b", marginBottom: 6, fontFamily: FONTS.bold },
  input:          { backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#1e293b", fontFamily: FONTS.regular, borderWidth: 1, borderColor: "#e2e8f0" },
  addBtnGradient: { borderRadius: 14, marginTop: 6 },
  addBtn:         { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  addBtnText:     { color: "#fff", fontWeight: "bold", fontSize: 16, fontFamily: FONTS.bold },
});

// ─── ADDRESS TAB ─────────────────────────────────────────────────────────────
function AddressTab() {
  const [family, setFamily]       = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddMember = (member: Omit<FamilyMember, "id">) => {
    setFamily(prev => [...prev, { ...member, id: String(Date.now()) }]);
  };

  return (
    <FadeSlideIn style={{ gap: 16 }}>
      {/* Your New Home card */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <Building2 size={18} color={COLORS.primary} />
          <Text style={s.cardTitle}>Your New Home</Text>
        </View>
        {[
          { label: "Building",   value: "Marina Heights, Tower A" },
          { label: "Floor",      value: "12th Floor" },
          { label: "Apartment",  value: "Unit 1204" },
          { label: "Type",       value: "2 Bedroom Apartment" },
          { label: "Size",       value: "1,250 sq ft" },
          { label: "Parking",    value: "B2-P045" },
        ].map((row, i, arr) => (
          <View key={row.label} style={[s.detailRow, i < arr.length - 1 && s.detailRowBorder]}>
            <Text style={s.detailLabel}>{row.label}</Text>
            <Text style={s.detailValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Location */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <MapPin size={18} color={COLORS.primary} />
          <Text style={s.cardTitle}>Location</Text>
        </View>
        <Text style={[s.detailLabel, { marginBottom: 12 }]}>Dubai Marina, Dubai, UAE</Text>
        <View style={[s.mapPlaceholder, { backgroundColor: COLORS.badgeBackground }]}>
          <MapPin size={32} color={COLORS.primary} />
        </View>
      </View>

      {/* Family Members */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <Users size={18} color={COLORS.primary} />
          <Text style={s.cardTitle}>Family Members</Text>
        </View>
        {/* Primary Member */}
        <View style={s.primaryMemberRow}>
          <View style={[s.primaryMemberAvatar, { backgroundColor: COLORS.secondary, borderColor: COLORS.primary + "40" }]}>
            <Text style={s.primaryMemberAvatarText}>A</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={s.primaryMemberName}>Ahmed Al Mansoori</Text>
              <View style={[s.primaryBadge, { backgroundColor: COLORS.secondary }]}>
                <Text style={s.primaryBadgeText}>Primary</Text>
              </View>
            </View>
            <Text style={s.primaryMemberMeta}>Tenant · 784-1985-XXXXXXX-X</Text>
          </View>
        </View>
        <View style={s.familyDivider} />
        {family.map((f) => (
          <View key={f.id} style={s.familyRow}>
            <View style={s.familyAvatar}>
              <Text style={s.familyAvatarText}>{f.name[0]}</Text>
            </View>
            <View>
              <Text style={s.familyName}>{f.name}</Text>
              <Text style={s.familyMeta}>{f.role} · {f.id_no}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={[s.addMemberBtn, { borderColor: COLORS.secondary }]} onPress={() => setModalVisible(true)}>
          <Text style={[s.addMemberText, { color: COLORS.secondary }]}>+ Add Family Member</Text>
        </TouchableOpacity>
      </View>

      <AddFamilyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddMember}
      />
    </FadeSlideIn>
  );
}

// ─── DOCUMENTS TAB ───────────────────────────────────────────────────────────
function DocumentsTab({ docs, onToggleUpload }: { docs: Document[]; onToggleUpload: (id: string) => void }) {
  return (
    <FadeSlideIn style={{ gap: 16 }}>
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <FileText size={18} color={COLORS.primary} />
          <Text style={s.cardTitle}>Move-in Documents</Text>
        </View>
        <Text style={s.cardSubtitle}>Upload required docs and download guides</Text>
        {docs.map((doc, i) => (
          <View key={doc.id} style={[s.docRow, i < docs.length - 1 && s.docRowBorder]}>
            <View style={[s.docIcon, doc.status === "uploaded" ? s.docIconGreen : doc.status === "pending" ? s.docIconRed : s.docIconBlue]}>
              {doc.type === "upload"
                ? doc.status === "uploaded"
                  ? <CheckCircle2 size={18} color="#16a34a" />
                  : <Upload size={18} color="#dc2626" />
                : <Download size={18} color={COLORS.secondary} />
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.docName}>{doc.name}</Text>
              <Text style={s.docMeta}>
                {doc.status === "uploaded" ? `Uploaded · ${doc.size}` : doc.status === "pending" ? "Required — tap to upload" : `Ready · ${doc.size}`}
              </Text>
            </View>
            {doc.status === "uploaded" && <Check size={16} color="#16a34a" />}
            {doc.status === "pending" && (
              <TouchableOpacity onPress={() => onToggleUpload(doc.id)}>
                <Text style={s.uploadBtn}>Upload</Text>
              </TouchableOpacity>
            )}
            {doc.status === "ready" && <Text style={[s.downloadBtn, { color: COLORS.secondary }]}>Download</Text>}
          </View>
        ))}
      </View>
    </FadeSlideIn>
  );
}

// ─── PHOTOS TAB ──────────────────────────────────────────────────────────────
function PhotosTab({ rooms, onAddPhoto }: { rooms: Room[]; onAddPhoto: (id: string) => void }) {
  return (
    <FadeSlideIn style={{ gap: 4 }}>
      <View style={[s.infoBox, { marginBottom: 8, backgroundColor: COLORS.badgeBackground }]}>
        <Camera size={16} color={COLORS.secondary} />
        <View style={{ flex: 1 }}>
          <Text style={s.infoTitle}>Move-in Inspection Photos</Text>
          <Text style={s.infoSubtitle}>Upload timestamped photos of each room to protect your deposit.</Text>
        </View>
      </View>
      {rooms.map((room) => (
        <View key={room.id} style={[s.card, { marginBottom: 8 }]}>
          <View style={s.roomHeader}>
            <Text style={s.roomName}>{room.name}</Text>
            {room.photos > 0 && (
              <View style={s.photoBadge}>
                <Text style={s.photoBadgeText}>{room.photos} photos</Text>
              </View>
            )}
          </View>
          <View style={s.photoGrid}>
            {Array.from({ length: Math.max(1, room.photos + 1) }).map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[s.photoSlot, i < room.photos && s.photoSlotFilled, i === room.photos && s.photoSlotActive]}
                onPress={() => i === room.photos && onAddPhoto(room.id)}
              >
                <Camera size={20} color={i < room.photos ? COLORS.secondary : COLORS.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </FadeSlideIn>
  );
}

// ─── REQUESTS TAB ────────────────────────────────────────────────────────────
type RequestsState = {
  elevator: boolean; elevatorDate: string; elevatorSlot: string;
  parking: boolean; plate: string; model: string;
  keyCollection: boolean; keyDate: string;
};
function RequestsTab({ state, onChange }: { state: RequestsState; onChange: (s: RequestsState) => void }) {
  const set = (patch: Partial<RequestsState>) => onChange({ ...state, ...patch });
  const slots = ["Morning", "Afternoon", "Evening"];

  return (
    <FadeSlideIn style={{ gap: 12 }}>
      <View style={s.card}>
        <View style={s.requestRow}>
          <View style={s.requestLeft}>
            <Truck size={18} color={COLORS.primary} />
            <Text style={s.requestLabel}>Service Elevator</Text>
          </View>
          <Switch value={state.elevator} onValueChange={v => set({ elevator: v })} trackColor={{ true: COLORS.secondary }} />
        </View>
        {state.elevator && (
          <View style={{ marginTop: 12, gap: 10 }}>
            <View style={s.dateInput}>
              <Text style={s.dateInputText}>{state.elevatorDate || "mm/dd/yyyy"}</Text>
            </View>
            <View style={s.slotRow}>
              {slots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[s.slotBtn, state.elevatorSlot === slot && s.slotBtnActive]}
                  onPress={() => set({ elevatorSlot: slot })}
                >
                  <Text style={[s.slotText, state.elevatorSlot === slot && s.slotTextActive]}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={s.card}>
        <View style={s.requestRow}>
          <View style={s.requestLeft}>
            <Car size={18} color={COLORS.primary} />
            <Text style={s.requestLabel}>Parking Access</Text>
          </View>
          <Switch value={state.parking} onValueChange={v => set({ parking: v })} trackColor={{ true: COLORS.secondary }} />
        </View>
        {state.parking && (
          <View style={{ marginTop: 12, gap: 10 }}>
            <Text style={s.assignedText}>Assigned: <Text style={{ fontWeight: "bold" }}>B2-P045</Text></Text>
            <TextInput style={s.textField} placeholder="Vehicle Plate Number" value={state.plate} onChangeText={v => set({ plate: v })} />
            <TextInput style={s.textField} placeholder="Vehicle Make & Model" value={state.model} onChangeText={v => set({ model: v })} />
          </View>
        )}
      </View>

      <View style={s.card}>
        <View style={s.requestRow}>
          <View style={s.requestLeft}>
            <Key size={18} color={COLORS.primary} />
            <Text style={s.requestLabel}>Key Collection</Text>
          </View>
          <Switch value={state.keyCollection} onValueChange={v => set({ keyCollection: v })} trackColor={{ true: COLORS.secondary }} />
        </View>
        {state.keyCollection && (
          <View style={{ marginTop: 12, gap: 10 }}>
            <Text style={s.cardSubtitle}>Schedule key collection from the management office.</Text>
            <View style={s.dateInput}>
              <Text style={s.dateInputText}>{state.keyDate || "mm/dd/yyyy"}</Text>
            </View>
          </View>
        )}
      </View>
    </FadeSlideIn>
  );
}

// ─── COMPLETE TAB ─────────────────────────────────────────────────────────────
function CompleteTab({ docs, rooms, requests }: {
  docs: Document[];
  rooms: Room[];
  requests: RequestsState;
}) {
  const uploadedDocs  = docs.filter(d => d.type === "upload" && d.status === "uploaded").length;
  const totalUploads  = docs.filter(d => d.type === "upload").length;
  const totalPhotos   = rooms.reduce((sum, r) => sum + r.photos, 0);
  const roomsWithPhotos = rooms.filter(r => r.photos > 0);
  const activeRequests = [
    requests.elevator && { icon: Truck, label: "Service Elevator", detail: requests.elevatorSlot },
    requests.parking  && { icon: Car,   label: "Parking Access",   detail: requests.plate || "B2-P045" },
    requests.keyCollection && { icon: Key, label: "Key Collection", detail: requests.keyDate || "Scheduled" },
  ].filter(Boolean) as { icon: any; label: string; detail: string }[];

  return (
    <FadeSlideIn style={{ gap: 14, paddingVertical: 8 }}>
      {/* Hero */}
      <View style={{ alignItems: "center", gap: 8, paddingVertical: 16 }}>
        <View style={s.completeIconBg}>
          <HomeIcon size={40} color={COLORS.primary} />
        </View>
        <Text style={s.completeTitle}>Welcome Home! 🎉</Text>
        <Text style={s.completeSubtitle}>Your move-in process is complete</Text>
        <Text style={s.completeAddress}>Marina Heights, Tower A · Unit 1204</Text>
      </View>

      {/* Documents summary */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <FileText size={16} color={COLORS.primary} />
          <Text style={s.cardTitle}>Documents</Text>
          <View style={{ flex: 1 }} />
          <Text style={s.summaryCount}>{uploadedDocs}/{totalUploads} uploaded</Text>
        </View>
        {docs.filter(d => d.type === "upload").map((doc, i, arr) => (
          <View key={doc.id} style={[s.summaryRow, i < arr.length - 1 && s.docRowBorder]}>
            <View style={[s.summaryDot, doc.status === "uploaded" ? s.summaryDotGreen : s.summaryDotRed]} />
            <Text style={[s.summaryLabel, { flex: 1 }]}>{doc.name}</Text>
            <Text style={doc.status === "uploaded" ? s.summaryStatusGreen : s.summaryStatusRed}>
              {doc.status === "uploaded" ? "✓ Uploaded" : "Pending"}
            </Text>
          </View>
        ))}
      </View>

      {/* Photos summary */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <Camera size={16} color={COLORS.primary} />
          <Text style={s.cardTitle}>Photos</Text>
          <View style={{ flex: 1 }} />
          <Text style={s.summaryCount}>{totalPhotos} total · {roomsWithPhotos.length}/{rooms.length} rooms</Text>
        </View>
        {rooms.map((room, i) => (
          <View key={room.id} style={[s.summaryRow, i < rooms.length - 1 && s.docRowBorder]}>
            <View style={[s.summaryDot, room.photos > 0 ? s.summaryDotGreen : s.summaryDotGray]} />
            <Text style={[s.summaryLabel, { flex: 1 }]}>{room.name}</Text>
            <Text style={room.photos > 0 ? s.summaryStatusGreen : s.summaryStatusGray}>
              {room.photos > 0 ? `${room.photos} photo${room.photos > 1 ? "s" : ""}` : "No photos"}
            </Text>
          </View>
        ))}
      </View>

      {/* Requests summary */}
      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <Key size={16} color={COLORS.primary} />
          <Text style={s.cardTitle}>Requests</Text>
          <View style={{ flex: 1 }} />
          <Text style={s.summaryCount}>{activeRequests.length} active</Text>
        </View>
        {activeRequests.length === 0 ? (
          <Text style={s.summaryEmpty}>No requests submitted</Text>
        ) : activeRequests.map((req, i) => (
          <View key={req.label} style={[s.summaryRow, i < activeRequests.length - 1 && s.docRowBorder]}>
            <req.icon size={15} color={COLORS.primary} />
            <Text style={[s.summaryLabel, { flex: 1, marginLeft: 8 }]}>{req.label}</Text>
            <Text style={s.summaryStatusGreen}>{req.detail}</Text>
          </View>
        ))}
        {[
          !requests.elevator && "Service Elevator",
          !requests.parking  && "Parking Access",
          !requests.keyCollection && "Key Collection",
        ].filter(Boolean).map((label, i, arr) => (
          <View key={label as string} style={[s.summaryRow, (activeRequests.length > 0 || i > 0) && s.docRowBorder]}>
            <View style={[s.summaryDot, s.summaryDotGray]} />
            <Text style={[s.summaryLabel, { flex: 1 }]}>{label as string}</Text>
            <Text style={s.summaryStatusGray}>Not requested</Text>
          </View>
        ))}
      </View>
    </FadeSlideIn>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function MoveIn() {
  const queryClient = useQueryClient();
  const TENANT_ID = "default-tenant-uuid";

  const { data: serverChecklist = [] } = useQuery({
    queryKey: ["moveinChecklist", TENANT_ID],
    queryFn: () => moveinService.getChecklist(TENANT_ID),
  });

  const signMutation = useMutation({
    mutationFn: (payload: any) => moveinService.signAgreement(payload),
  });

  const patchChecklistMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) => moveinService.updateChecklistItem(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moveinChecklist"] });
    }
  });

  // Derived rooms from checklist categories
  const rooms = useMemo(() => {
    if (serverChecklist.length === 0) return ROOMS;
    const categories = Array.from(new Set(serverChecklist.map(c => c.itemCategory)));
    return categories.map((cat, i) => {
      const items = serverChecklist.filter(c => c.itemCategory === cat);
      const withPhoto = items.filter(c => c.photoUrl).length;
      return {
        id: `room-${i}`,
        name: cat as string,
        photos: withPhoto
      };
    });
  }, [serverChecklist]);

  const [activeTab, setActiveTab] = useState(0);
  const navigation = useNavigation<any>();
  const progressAnim = useRef(new Animated.Value(20)).current;

  // ── Lifted state ──
  const [docs, setDocs]   = useState<Document[]>(DOCUMENTS);

  const [requests, setRequests] = useState<RequestsState>({
    elevator: false, elevatorDate: "", elevatorSlot: "Morning",
    parking: false,  plate: "",       model: "",
    keyCollection: false, keyDate: "",
  });

  const handleToggleUpload = (id: string) => {
    setDocs(prev => prev.map(d =>
      d.id === id ? { ...d, status: "uploaded", size: "320 KB" } : d
    ));
    if (id === "1") {
      signMutation.mutate({ tenantId: TENANT_ID, signatureUrl: "https://example.com/signature.png" });
    }
  };

  const handleAddPhoto = (roomId: string) => {
    const roomCat = rooms.find(r => r.id === roomId)?.name;
    const item = serverChecklist.find(c => c.itemCategory === roomCat && !c.photoUrl);
    if (item) {
      patchChecklistMutation.mutate({ id: item.id, data: { photoUrl: "https://example.com/photo.jpg", status: "completed" } });
    }
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ((activeTab + 1) / TABS.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  return (
    <View style={s.container}>
      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={GRADIENTS.activeNav}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={s.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <ArrowLeft size={18} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={s.headerTitle}>Move-In Hub</Text>
            <Text style={s.headerSubtitle}>Effortless digital move-in</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Single tab row with step dots */}
        <View style={s.tabStepRow}>
          {TABS.map((tab, i) => {
            const isDone    = i < activeTab;
            const isCurrent = i === activeTab;
            return (
              <TouchableOpacity key={tab} style={s.tabStepItem} onPress={() => setActiveTab(i)}>
                {/* Connector line before (skip first) */}
                {i > 0 && (
                  <View style={[s.stepConnector, isDone && s.stepConnectorDone]} />
                )}
                {/* Dot */}
                <View style={[s.stepDot, isDone && s.stepDotDone, isCurrent && s.stepDotCurrent, isDone && { backgroundColor: COLORS.success, borderColor: COLORS.success }]}>
                  {isDone
                    ? <Check size={10} color="#fff" />
                    : <Text style={[s.stepDotNum, isCurrent && s.stepDotNumActive, isCurrent && { color: COLORS.secondary }]}>{i + 1}</Text>
                  }
                </View>
                {/* Label */}
                <Text style={[s.stepLabel, isCurrent && s.stepLabelActive]} numberOfLines={1}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Progress bar */}
        <View style={s.progressTrack}>
          <Animated.View
            style={[
              s.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 0 && <AddressTab />}
        {activeTab === 1 && <DocumentsTab docs={docs} onToggleUpload={handleToggleUpload} />}
        {activeTab === 2 && <PhotosTab rooms={rooms} onAddPhoto={handleAddPhoto} />}
        {activeTab === 3 && <RequestsTab state={requests} onChange={setRequests} />}
        {activeTab === 4 && <CompleteTab docs={docs} rooms={rooms} requests={requests} />}
      </ScrollView>

      {/* Footer */}
      {activeTab < 4 ? (
        <View style={s.footer}>
          {activeTab > 0 ? (
            <TouchableOpacity style={s.backFooterBtn} onPress={() => setActiveTab(p => p - 1)}>
              <ArrowLeft size={14} color={COLORS.foreground} />
              <Text style={s.backFooterText}>Back</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}
          <LinearGradient
            colors={GRADIENTS.activeNav}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.continueBtnGradient}
          >
            <TouchableOpacity
              style={s.continueBtn}
              onPress={() => setActiveTab(p => Math.min(p + 1, 4))}
            >
              <Text style={s.continueBtnText}>
                {activeTab === 3 ? "Complete Move-In" : "Continue"}
              </Text>
              <ArrowRight size={14} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : (
        <View style={s.footer}>
          <LinearGradient
            colors={GRADIENTS.activeNav}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[s.continueBtnGradient, { flex: 1 }]}
          >
            <TouchableOpacity
              style={s.continueBtn}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: "Main" }] })}
            >
              <Text style={s.continueBtnText}>✦ Go to Dashboard</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.background },

  // ── Gradient Header ──
  header:           { paddingTop: 52, paddingBottom: 14, paddingHorizontal: SIZES.lg },
  headerTop:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle:      { fontSize: 20, fontWeight: "bold", color: "#fff", fontFamily: FONTS.display, textAlign: "center" },
  headerSubtitle:   { fontSize: 12, color: "rgba(255,255,255,0.8)", textAlign: "center", fontFamily: FONTS.regular },

  // Step tab row
  tabStepRow:       { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  tabStepItem:      { flex: 1, alignItems: "center", flexDirection: "column", position: "relative" },
  stepConnector:    { position: "absolute", top: 10, right: "50%", width: "100%", height: 2, backgroundColor: "rgba(255,255,255,0.3)", zIndex: 0 },
  stepConnectorDone:{ backgroundColor: "#fff" },
  stepDot:          { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.25)", borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center", zIndex: 1 },
  stepDotDone:      { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  stepDotCurrent:   { backgroundColor: "#fff", borderColor: "#fff" },
  stepDotNum:       { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "bold" },
  stepDotNumActive: { color: "#1e4fd8" },
  stepLabel:        { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 4, fontFamily: FONTS.regular, textAlign: "center" },
  stepLabelActive:  { color: "#fff", fontWeight: "bold" },

  // Progress bar
  progressTrack:    { height: 4, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 2, overflow: "hidden" },
  progressFill:     { height: 4, backgroundColor: "#fff", borderRadius: 2 },

  // Scroll
  scroll:           { flex: 1 },
  scrollContent:    { padding: SIZES.lg, paddingBottom: 32 },

  // Card
  card:             { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", ...SHADOWS.sm },
  cardTitleRow:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle:        { fontSize: 16, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.display },
  cardSubtitle:     { fontSize: 12, color: COLORS.mutedForeground, marginBottom: 8, fontFamily: FONTS.regular },

  // Detail rows
  detailRow:        { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  detailRowBorder:  { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  detailLabel:      { fontSize: 14, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  detailValue:      { fontSize: 14, fontWeight: "600", color: COLORS.foreground, fontFamily: FONTS.bold },

  // Map
  mapPlaceholder:   { height: 120, backgroundColor: "#eff6ff", borderRadius: 12, alignItems: "center", justifyContent: "center" },

  // Family
  primaryMemberRow:     { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, backgroundColor: "#f0f7ff", borderRadius: 12, paddingHorizontal: 10, marginBottom: 4 },
  primaryMemberAvatar:  { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1e4fd8", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#93c5fd" },
  primaryMemberAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 18, fontFamily: FONTS.bold },
  primaryMemberName:    { fontSize: 14, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  primaryMemberMeta:    { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular, marginTop: 1 },
  primaryBadge:         { backgroundColor: "#1e4fd8", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  primaryBadgeText:     { fontSize: 10, color: "#fff", fontWeight: "bold", fontFamily: FONTS.bold },
  familyDivider:        { height: 1, backgroundColor: "#f1f5f9", marginVertical: 4 },
  familyRow:        { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  familyAvatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  familyAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 16, fontFamily: FONTS.bold },
  familyName:       { fontSize: 14, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  familyMeta:       { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  addMemberBtn:     { marginTop: 8, borderWidth: 1, borderColor: "#16a34a", borderStyle: "dashed", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  addMemberText:    { color: "#16a34a", fontWeight: "bold", fontFamily: FONTS.bold },

  // Documents
  docRow:           { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  docRowBorder:     { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  docIcon:          { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  docIconGreen:     { backgroundColor: "#dcfce7" },
  docIconRed:       { backgroundColor: "#fee2e2" },
  docIconBlue:      { backgroundColor: "#eff6ff" },
  docName:          { fontSize: 14, fontWeight: "600", color: COLORS.foreground, fontFamily: FONTS.bold },
  docMeta:          { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  uploadBtn:        { color: "#dc2626", fontWeight: "bold", fontSize: 13, fontFamily: FONTS.bold },
  downloadBtn:      { color: COLORS.primary, fontWeight: "bold", fontSize: 13, fontFamily: FONTS.bold },

  // Info box
  infoBox:          { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#eff6ff", borderRadius: 12, padding: 12 },
  infoTitle:        { fontSize: 13, fontWeight: "bold", color: COLORS.primary, fontFamily: FONTS.bold },
  infoSubtitle:     { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },

  // Photos
  roomHeader:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  roomName:         { fontSize: 15, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.display },
  photoBadge:       { backgroundColor: "#dcfce7", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  photoBadgeText:   { fontSize: 11, color: "#16a34a", fontWeight: "bold", fontFamily: FONTS.bold },
  photoGrid:        { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoSlot:        { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderColor: "#cbd5e1", borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  photoSlotFilled:  { backgroundColor: "#eff6ff", borderColor: COLORS.primary, borderStyle: "solid" },
  photoSlotActive:  { borderColor: "#334155", borderStyle: "solid" },

  // Requests
  requestRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  requestLeft:      { flexDirection: "row", alignItems: "center", gap: 10 },
  requestLabel:     { fontSize: 15, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  dateInput:        { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  dateInputText:    { color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  slotRow:          { flexDirection: "row", gap: 8 },
  slotBtn:          { flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" },
  slotBtnActive:    { backgroundColor: "#eff6ff", borderColor: COLORS.primary },
  slotText:         { fontSize: 13, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  slotTextActive:   { color: COLORS.primary, fontWeight: "bold" },
  assignedText:     { fontSize: 13, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  textField:        { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: FONTS.regular },

  // Complete hero
  completeIconBg:   { width: 80, height: 80, borderRadius: 40, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center" },
  completeTitle:    { fontSize: 24, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.display },
  completeSubtitle: { fontSize: 13, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  completeAddress:  { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },

  // Complete summary
  summaryRow:       { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  summaryDot:       { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  summaryDotGreen:  { backgroundColor: "#16a34a" },
  summaryDotRed:    { backgroundColor: "#dc2626" },
  summaryDotGray:   { backgroundColor: "#cbd5e1" },
  summaryLabel:     { fontSize: 13, color: COLORS.foreground, fontFamily: FONTS.regular },
  summaryCount:     { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  summaryStatusGreen: { fontSize: 12, color: "#16a34a", fontWeight: "bold", fontFamily: FONTS.bold },
  summaryStatusRed:   { fontSize: 12, color: "#dc2626", fontWeight: "bold", fontFamily: FONTS.bold },
  summaryStatusGray:  { fontSize: 12, color: "#94a3b8", fontFamily: FONTS.regular },
  summaryEmpty:     { fontSize: 13, color: COLORS.mutedForeground, fontFamily: FONTS.regular, paddingVertical: 6 },

  // Footer
  footer:               { flexDirection: "row", gap: 10, paddingHorizontal: SIZES.lg, paddingBottom: 20, paddingTop: 10, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9", alignItems: "center" },
  backFooterBtn:        { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#f1f5f9" },
  backFooterText:       { fontSize: 13, color: COLORS.foreground, fontFamily: FONTS.bold },
  continueBtnGradient:  { flex: 2, borderRadius: 10, ...SHADOWS.md },
  continueBtn:          { flexDirection: "row", paddingVertical: 12, alignItems: "center", justifyContent: "center", gap: 6 },
  continueBtnText:      { color: "#fff", fontWeight: "bold", fontSize: 14, fontFamily: FONTS.bold },
});
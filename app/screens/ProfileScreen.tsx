import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft, FileText, Camera, ChevronRight, LogOut,
  RefreshCw, Truck, Phone, Mail, Shield, Bell, HelpCircle,
  Star, LucideIcon, Users, Plus, Trash2, Download,
  CheckCircle, Package, Wrench, CreditCard,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppLayout from "../../components/layout/AppLayout";
import { COLORS, SIZES, FONTS, SHADOWS, GRADIENTS } from "../../constants/Theme";
import { Badge, Card, Button } from "../../components/ui";
import { useFeatures } from "../context/FeatureContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveView =
  | "main" | "docs" | "photos" | "family"
  | "renewal" | "moveout";

type FamilyMember = {
  id: string;
  name: string;
  relation: "Spouse" | "Child" | "Parent" | "Other";
  emiratesId: string;
  phone?: string;
};

const RELATION_TYPES: FamilyMember["relation"][] = ["Spouse", "Child", "Parent", "Other"];

const AVATAR_COLORS: Record<FamilyMember["relation"], [string, string]> = {
  Spouse: ["#10b981", "#059669"],
  Child:  ["#3b82f6", "#2563eb"],
  Parent: ["#8b5cf6", "#7c3aed"],
  Other:  ["#f59e0b", "#d97706"],
};

const getInitials = (name: string) =>
  name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// ─── Static Data ──────────────────────────────────────────────────────────────

const DOCUMENTS = [
  { id: "1", name: "Lease Agreement 2026", type: "PDF", size: "2.4 MB", date: "Feb 15, 2026" },
  { id: "2", name: "Ejari Certificate",    type: "PDF", size: "1.1 MB", date: "Feb 20, 2026" },
  { id: "3", name: "Emirates ID Copy",     type: "PDF", size: "0.8 MB", date: "Feb 10, 2026" },
  { id: "4", name: "Welcome Handbook",     type: "PDF", size: "5.2 MB", date: "Mar 1, 2026"  },
];

const PHOTO_ROOMS = [
  { id: "1", label: "Living Room", count: 8  },
  { id: "2", label: "Bedroom 1",   count: 6  },
  { id: "3", label: "Bedroom 2",   count: 5  },
  { id: "4", label: "Kitchen",     count: 6  },
  { id: "5", label: "Bathroom 1",  count: 4  },
  { id: "6", label: "Bathroom 2",  count: 3  },
  { id: "7", label: "Balcony",     count: 4  },
  { id: "8", label: "Study Room",  count: 4  },
];

const LEASE_TERMS = ["6 Months", "12 Months", "24 Months"];

const MOVEOUT_REASONS = ["Relocating", "End of Lease", "Personal Reasons", "Other"];

const MOVEOUT_CHECKLIST = [
  "Clear outstanding bills",
  "Return all keys & access cards",
  "Schedule move-out inspection",
  "Disconnect DEWA",
];

const profileSections: {
  title: string;
  items: { icon: LucideIcon; label: string; desc: string; badge?: string; action?: boolean }[];
}[] = [
  {
    title: "Property",
    items: [
      { icon: FileText,  label: "My Documents",    desc: "Ejari, Contract, Emirates ID", badge: "4 files"   },
      { icon: Camera,    label: "Move-In Photos",  desc: "View uploaded photos",         badge: "32 photos" },
      { icon: Users,     label: "Family Members",  desc: "Manage family members",        badge: "3 members" },
      { icon: RefreshCw, label: "Renewal Request", desc: "Renew your lease",             action: true       },
      { icon: Truck,     label: "Move-Out Request",desc: "Submit move-out notice",       action: true       },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Bell,        label: "Notification Settings", desc: "Manage alerts"       },
      { icon: Shield,      label: "Privacy & Security",    desc: "Password, 2FA"       },
      { icon: HelpCircle,  label: "Help & Support",        desc: "FAQs, Contact us"    },
      { icon: Star,        label: "Rate App",              desc: "Give us feedback"     },
    ],
  },
  {
    title: "Feature Settings",
    items: [
      { icon: Users,       label: "Community Tab",         desc: "Enable community features" },
      { icon: FileText,    label: "Tenancy Features",      desc: "Show tenancy details" },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigation = useNavigation<any>();
  const { config, updateConfig } = useFeatures();
  const [activeView, setActiveView] = useState<ActiveView>("main");

  // Family state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Fatima Al Mansoori",  relation: "Spouse", emiratesId: "784-1988-XXXXXXX-X" },
    { id: "2", name: "Yousuf Al Mansoori",  relation: "Child",  emiratesId: "784-2015-XXXXXXX-X" },
    { id: "3", name: "Mariam Al Mansoori",  relation: "Child",  emiratesId: "784-2018-XXXXXXX-X" },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", relation: "Spouse" as FamilyMember["relation"], emiratesId: "", phone: "" });

  // Renewal state
  const [leaseTerm, setLeaseTerm] = useState("12 Months");
  const [renewalComments, setRenewalComments] = useState("");
  const [showTermPicker, setShowTermPicker] = useState(false);
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);

  // Move-out state
  const [moveOutDate] = useState("May 28, 2026");
  const [moveOutReason, setMoveOutReason] = useState("Relocating");
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [moveOutNotes, setMoveOutNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    Object.fromEntries(MOVEOUT_CHECKLIST.map((item) => [item, true]))
  );
  const [moveOutSubmitted, setMoveOutSubmitted] = useState(false);

  const goBack = () => { setActiveView("main"); setShowAddForm(false); setShowTermPicker(false); setShowReasonPicker(false); };

  const renderHeader = (title: string) => (
    <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.headerGradient}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );

  // ── My Documents ──────────────────────────────────────────────────────────
  if (activeView === "docs") {
    return (
      <View style={styles.container}>
        {renderHeader("My Documents")}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {DOCUMENTS.map((doc) => (
            <View key={doc.id} style={styles.docCard}>
              <View style={styles.docIconBg}>
                <FileText size={20} color={COLORS.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docMeta}>{doc.type} · {doc.size} · {doc.date}</Text>
              </View>
              <TouchableOpacity style={styles.downloadBtn}>
                <Download size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Move-In Photos ────────────────────────────────────────────────────────
  if (activeView === "photos") {
    return (
      <View style={styles.container}>
        {renderHeader("Move-In Photos")}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.photoGrid}>
            {PHOTO_ROOMS.map((room) => (
              <TouchableOpacity key={room.id} style={styles.photoRoomCard}>
                <View style={styles.photoIconBg}>
                  <Camera size={28} color={COLORS.mutedForeground} />
                </View>
                <Text style={styles.photoRoomLabel}>{room.label}</Text>
                <Text style={styles.photoRoomCount}>{room.count} photos</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Family Members ────────────────────────────────────────────────────────
  if (activeView === "family") {
    const handleAddMember = () => {
      if (!newMember.name.trim() || !newMember.emiratesId.trim()) {
        Alert.alert("Missing Info", "Please enter name and Emirates ID.");
        return;
      }
      setFamilyMembers((prev) => [...prev, { id: Date.now().toString(), ...newMember }]);
      setNewMember({ name: "", relation: "Spouse", emiratesId: "", phone: "" });
      setShowAddForm(false);
    };
    const handleDelete = (id: string) => {
      Alert.alert("Remove Member", "Remove this family member?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => setFamilyMembers((p) => p.filter((m) => m.id !== id)) },
      ]);
    };

    return (
      <View style={styles.container}>
        {renderHeader("Family Members")}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {familyMembers.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <LinearGradient colors={AVATAR_COLORS[member.relation]} style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{getInitials(member.name)}</Text>
              </LinearGradient>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRelation}>{member.relation}</Text>
                <Text style={styles.memberEid}>{member.emiratesId}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(member.id)} style={styles.deleteBtn}>
                <Trash2 size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}

          {showAddForm ? (
            <View style={styles.addForm}>
              <Text style={styles.addFormTitle}>Add Family Member</Text>
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={COLORS.mutedForeground}
                value={newMember.name} onChangeText={(v) => setNewMember((p) => ({ ...p, name: v }))} />
              <View style={styles.relationRow}>
                {RELATION_TYPES.map((rel) => (
                  <TouchableOpacity key={rel}
                    style={[styles.relationChip, newMember.relation === rel && styles.relationChipActive]}
                    onPress={() => setNewMember((p) => ({ ...p, relation: rel }))}>
                    <Text style={[styles.relationChipText, newMember.relation === rel && styles.relationChipTextActive]}>{rel}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={styles.input} placeholder="Emirates ID" placeholderTextColor={COLORS.mutedForeground}
                value={newMember.emiratesId} onChangeText={(v) => setNewMember((p) => ({ ...p, emiratesId: v }))} />
              <TextInput style={styles.input} placeholder="Phone Number (optional)" placeholderTextColor={COLORS.mutedForeground}
                keyboardType="phone-pad" value={newMember.phone} onChangeText={(v) => setNewMember((p) => ({ ...p, phone: v }))} />
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAddForm(false); setNewMember({ name: "", relation: "Spouse", emiratesId: "", phone: "" }); }}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddMember}>
                  <Text style={styles.saveBtnText}>Save Member</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addMemberBtn} onPress={() => setShowAddForm(true)}>
              <Plus size={18} color={COLORS.success} />
              <Text style={styles.addMemberBtnText}>Add Family Member</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Renewal Request ───────────────────────────────────────────────────────
  if (activeView === "renewal") {
    if (renewalSubmitted) {
      return (
        <View style={styles.container}>
          {renderHeader("Renewal Request")}
          <View style={styles.successContainer}>
            <CheckCircle size={64} color={COLORS.success} style={styles.successIcon} />
            <Text style={styles.successTitle}>Request Submitted!</Text>
            <Text style={styles.successDesc}>Your renewal request has been sent. We'll get back to you shortly.</Text>
            <Button
              label="Back to Profile"
              variant="success"
              onPress={() => { setRenewalSubmitted(false); goBack(); }}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        {renderHeader("Renewal Request")}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Lease Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Current Lease</Text>
            <Text style={styles.infoCardDate}>Mar 1, 2026 – Feb 28, 2027</Text>
            <Text style={styles.infoCardHighlight}>Renewal window opens: Dec 2026</Text>
          </View>

          {/* Preferred Lease Term */}
          <Text style={styles.fieldLabel}>Preferred Lease Term</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowTermPicker(!showTermPicker)}>
            <Text style={styles.selectBoxText}>{leaseTerm}</Text>
            <ChevronRight size={16} color={COLORS.mutedForeground} style={{ transform: [{ rotate: "90deg" }] }} />
          </TouchableOpacity>
          {showTermPicker && (
            <View style={styles.dropdownList}>
              {LEASE_TERMS.map((term) => (
                <TouchableOpacity key={term} style={[styles.dropdownItem, leaseTerm === term && styles.dropdownItemActive]}
                  onPress={() => { setLeaseTerm(term); setShowTermPicker(false); }}>
                  <Text style={[styles.dropdownItemText, leaseTerm === term && styles.dropdownItemTextActive]}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Comments */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Comments</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requests..."
            placeholderTextColor={COLORS.mutedForeground}
            multiline numberOfLines={4}
            value={renewalComments}
            onChangeText={setRenewalComments}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setRenewalSubmitted(true)}
          >
            <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtnGradient}>
              <Text style={styles.primaryBtnText}>Submit Renewal Request</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Move-Out Request ──────────────────────────────────────────────────────
  if (activeView === "moveout") {
    if (moveOutSubmitted) {
      return (
        <View style={styles.container}>
          {renderHeader("Move-Out Request")}
          <View style={styles.successContainer}>
            <Package size={64} color={COLORS.error} style={styles.successIcon} />
            <Text style={styles.successTitle}>Notice Submitted!</Text>
            <Text style={styles.successDesc}>Your move-out notice has been received. Our team will contact you soon.</Text>
            <Button
              label="Back to Profile"
              variant="primary"
              style={{ backgroundColor: COLORS.error, marginTop: 8 }}
              onPress={() => { setMoveOutSubmitted(false); goBack(); }}
            />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        {renderHeader("Move-Out Request")}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Important Notice */}
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningText}>Minimum 90 days notice required. Early termination fees may apply.</Text>
          </View>

          {/* Preferred Date */}
          <Text style={styles.fieldLabel}>Preferred Move-Out Date</Text>
          <View style={styles.selectBox}>
            <Text style={styles.selectBoxText}>{moveOutDate}</Text>
          </View>

          {/* Reason */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Reason</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowReasonPicker(!showReasonPicker)}>
            <Text style={styles.selectBoxText}>{moveOutReason}</Text>
            <ChevronRight size={16} color={COLORS.mutedForeground} style={{ transform: [{ rotate: "90deg" }] }} />
          </TouchableOpacity>
          {showReasonPicker && (
            <View style={styles.dropdownList}>
              {MOVEOUT_REASONS.map((r) => (
                <TouchableOpacity key={r} style={[styles.dropdownItem, moveOutReason === r && styles.dropdownItemActive]}
                  onPress={() => { setMoveOutReason(r); setShowReasonPicker(false); }}>
                  <Text style={[styles.dropdownItemText, moveOutReason === r && styles.dropdownItemTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Additional Notes */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional details..."
            placeholderTextColor={COLORS.mutedForeground}
            multiline numberOfLines={4}
            value={moveOutNotes}
            onChangeText={setMoveOutNotes}
          />

          {/* Move-Out Checklist */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Move-Out Checklist</Text>
          <View style={styles.checklistContainer}>
            {MOVEOUT_CHECKLIST.map((item) => (
              <TouchableOpacity key={item} style={styles.checklistItem}
                onPress={() => setChecklist((p) => ({ ...p, [item]: !p[item] }))}>
                <View style={[styles.checkBox, checklist[item] && styles.checkBoxChecked]}>
                  {checklist[item] && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.checklistText, checklist[item] && styles.checklistTextDone]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.dangerBtn} onPress={() => setMoveOutSubmitted(true)}>
            <Text style={styles.dangerBtnText}>Submit Move-Out Notice</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Main Profile ──────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={GRADIENTS.activeNav}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.profileHeaderGradient}
        >
          <Text style={styles.profileTitle}>Profile</Text>
          <View style={styles.profileInfoRow}>
            <LinearGradient colors={GRADIENTS.avatar} style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>AR</Text>
            </LinearGradient>
            <View>
              <Text style={styles.profileName}>Ahmed Al Rashid</Text>
              <View style={styles.contactItem}><Phone size={12} color="white" /><Text style={styles.contactText}>+971 50 123 4567</Text></View>
              <View style={styles.contactItem}><Mail size={12} color="white" /><Text style={styles.contactText}>ahmed@email.com</Text></View>
            </View>
          </View>
        </LinearGradient>

        {/* Lease card */}
        <View style={styles.profileContent}>
          {config.tenancyEnabled && (
            <View style={styles.leaseCard}>
              <View style={styles.leaseCardLeft}>
                <View style={styles.leaseIconBg}><FileText size={18} color={COLORS.primary} /></View>
                <View>
                  <Text style={styles.leaseName}>Azure Tower – Unit 1204</Text>
                  <Text style={styles.leaseDates}>Lease: Mar 1, 2026 – Feb 28, 2027</Text>
                </View>
              </View>
              <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>
            </View>
          )}

          {profileSections.map((section, si) => {
            const items = section.items.filter(item => {
              if (section.title === "Property" && !config.tenancyEnabled) {
                return item.label !== "My Documents" && 
                       item.label !== "Renewal Request" && 
                       item.label !== "Move-Out Request";
              }
              return true;
            });

            if (items.length === 0) return null;

            return (
              <View key={si} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionItems}>
                  {items.map((item, ii) => {
                    const isFeature = section.title === "Feature Settings";
                    return (
                      <Card key={ii}
                      onPress={() => {
                        if (item.label === "My Documents")    setActiveView("docs");
                        if (item.label === "Move-In Photos")  setActiveView("photos");
                        if (item.label === "Family Members")  setActiveView("family");
                        if (item.label === "Renewal Request") setActiveView("renewal");
                        if (item.label === "Move-Out Request")setActiveView("moveout");
                      }}
                      style={styles.itemCard} padding={12}>
                      <View style={styles.itemIconBg}><item.icon size={18} color={COLORS.mutedForeground} /></View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        <Text style={styles.itemDesc}>{item.desc}</Text>
                      </View>
                      {isFeature ? (
                        <Switch
                          value={
                            item.label === "Community Tab" ? config.communityEnabled :
                            config.tenancyEnabled
                          }
                          onValueChange={(val) => {
                            if (item.label === "Community Tab") updateConfig({ communityEnabled: val });
                            if (item.label === "Tenancy Features") updateConfig({ tenancyEnabled: val });
                          }}
                          trackColor={{ false: COLORS.border, true: COLORS.primary }}
                          thumbColor="#fff"
                        />
                      ) : (
                        <>
                          {item.badge && <Badge label={item.badge} variant="primary" />}
                          <ChevronRight size={16} color={COLORS.mutedForeground} />
                        </>
                      )}
                    </Card>
                  );
                })}
              </View>
            </View>
          );
        })}

          <Button label="Sign Out" variant="danger" size="md" fullWidth
            leftIcon={<LogOut size={16} color={COLORS.error} />}
            onPress={() => navigation.navigate("Welcome")}
            style={styles.signOutBtnMargin} />
          <Text style={styles.versionText}>Space Zen v1.0.0</Text>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  headerGradient: {
    paddingHorizontal: SIZES.lg, paddingTop: 60, paddingBottom: 28,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: SIZES.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", fontFamily: FONTS.display, letterSpacing: 0.5 },
  content: { flex: 1, paddingHorizontal: SIZES.lg, paddingVertical: 20 },

  // Documents
  docCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: SIZES.radiusMedium,
    padding: 14, marginBottom: 10, ...SHADOWS.sm,
  },
  docIconBg: { width: 42, height: 42, backgroundColor: "#eff6ff", borderRadius: SIZES.radiusSmall, alignItems: "center", justifyContent: "center" },
  docInfo: { flex: 1 },
  docName: { fontSize: 13, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  docMeta: { fontSize: 11, color: COLORS.mutedForeground, fontFamily: FONTS.regular, marginTop: 2 },
  downloadBtn: { width: 36, height: 36, backgroundColor: "#eff6ff", borderRadius: 18, alignItems: "center", justifyContent: "center" },

  // Photos
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  photoRoomCard: {
    width: "47%", backgroundColor: "#fff", borderRadius: SIZES.radiusMedium,
    padding: 20, alignItems: "center", ...SHADOWS.sm,
  },
  photoIconBg: { width: 56, height: 56, backgroundColor: "#f1f5f9", borderRadius: SIZES.radiusMedium, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  photoRoomLabel: { fontSize: 13, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold, textAlign: "center" },
  photoRoomCount: { fontSize: 11, color: COLORS.mutedForeground, fontFamily: FONTS.regular, marginTop: 2 },

  // Family
  memberCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: SIZES.radiusMedium, padding: 14, marginBottom: 10, ...SHADOWS.sm },
  memberAvatar: { width: 44, height: 44, borderRadius: SIZES.radiusSmall, alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontSize: 16, fontWeight: "bold", color: "#fff", fontFamily: FONTS.display },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 13, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  memberRelation: { fontSize: 11, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  memberEid: { fontSize: 10, color: COLORS.mutedForeground, fontFamily: FONTS.regular, marginTop: 1 },
  deleteBtn: { padding: 6 },
  addMemberBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: COLORS.success, borderStyle: "dashed", borderRadius: SIZES.radiusMedium, paddingVertical: 14, marginTop: 4 },
  addMemberBtnText: { fontSize: 14, color: COLORS.success, fontWeight: "600", fontFamily: FONTS.bold },
  addForm: { backgroundColor: "#fff", borderRadius: SIZES.radiusMedium, padding: 16, marginTop: 8, ...SHADOWS.sm },
  addFormTitle: { fontSize: 14, fontWeight: "bold", color: COLORS.foreground, marginBottom: 14, fontFamily: FONTS.display },
  relationRow: { flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  relationChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border ?? "#e5e7eb", backgroundColor: COLORS.muted },
  relationChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  relationChipText: { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  relationChipTextActive: { color: "#fff", fontWeight: "600" },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: SIZES.radiusSmall, borderWidth: 1, borderColor: COLORS.border ?? "#e5e7eb", alignItems: "center" },
  cancelBtnText: { fontSize: 13, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  saveBtn: { flex: 2, paddingVertical: 12, borderRadius: SIZES.radiusSmall, backgroundColor: COLORS.success, alignItems: "center" },
  saveBtnText: { fontSize: 13, color: "#fff", fontWeight: "bold", fontFamily: FONTS.bold },

  // Forms (shared)
  fieldLabel: { fontSize: 13, fontWeight: "bold", color: COLORS.foreground, marginBottom: 8, fontFamily: FONTS.bold },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusSmall, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: COLORS.foreground, fontFamily: FONTS.regular, marginBottom: 10, backgroundColor: "#fff" },
  textArea: { height: 100, textAlignVertical: "top" },
  selectBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusSmall, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#fff", marginBottom: 4 },
  selectBoxText: { fontSize: 13, color: COLORS.foreground, fontFamily: FONTS.regular },
  dropdownList: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusSmall, backgroundColor: "#fff", overflow: "hidden", marginBottom: 8 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: "#475569" },
  dropdownItemText: { fontSize: 13, color: COLORS.foreground, fontFamily: FONTS.regular },
  dropdownItemTextActive: { color: "#fff" },

  // Info card (renewal)
  infoCard: { backgroundColor: "#f0fdf4", borderRadius: SIZES.radiusMedium, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#bbf7d0" },
  infoCardTitle: { fontSize: 13, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold, marginBottom: 4 },
  infoCardDate: { fontSize: 13, color: COLORS.foreground, fontFamily: FONTS.regular },
  infoCardHighlight: { fontSize: 12, color: COLORS.success, fontFamily: FONTS.regular, marginTop: 2 },

  // Warning card (move-out)
  warningCard: { backgroundColor: "#fef2f2", borderRadius: SIZES.radiusMedium, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#fecaca" },
  warningTitle: { fontSize: 13, fontWeight: "bold", color: COLORS.error, fontFamily: FONTS.bold, marginBottom: 4 },
  warningText: { fontSize: 12, color: "#7f1d1d", fontFamily: FONTS.regular },

  // Checklist
  checklistContainer: { backgroundColor: "#fff", borderRadius: SIZES.radiusMedium, padding: 4, marginBottom: 20, ...SHADOWS.sm },
  checklistItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  checkBox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
  checkBoxChecked: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkMark: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  checklistText: { fontSize: 13, color: COLORS.foreground, fontFamily: FONTS.regular },
  checklistTextDone: { textDecorationLine: "line-through", color: COLORS.mutedForeground },

  // Buttons
  primaryBtn: { borderRadius: SIZES.radiusMedium, overflow: "hidden", marginTop: 8, marginBottom: 24 },
  primaryBtnGradient: { paddingVertical: 16, alignItems: "center" },
  primaryBtnText: { fontSize: 15, fontWeight: "bold", color: "#fff", fontFamily: FONTS.bold },
  dangerBtn: { backgroundColor: "#ef4444", borderRadius: SIZES.radiusMedium, paddingVertical: 16, alignItems: "center", marginTop: 4, marginBottom: 24 },
  dangerBtnText: { fontSize: 15, fontWeight: "bold", color: "#fff", fontFamily: FONTS.bold },

  // Success screen
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12, paddingBottom: 100 },
  successIcon: { marginBottom: 8 },

  successTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.display },
  successDesc: { fontSize: 13, color: COLORS.mutedForeground, textAlign: "center", fontFamily: FONTS.regular, lineHeight: 20 },

  // Main profile
  profileHeaderGradient: {
    paddingHorizontal: SIZES.lg, paddingTop: 64, paddingBottom: 32,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  profileTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 24, fontFamily: FONTS.display },
  profileInfoRow: { flexDirection: "row", alignItems: "center", gap: SIZES.md },
  profileAvatar: { width: 64, height: 64, borderRadius: SIZES.radiusMedium, alignItems: "center", justifyContent: "center" },
  profileAvatarText: { fontSize: 20, fontWeight: "bold", color: "#fff", fontFamily: FONTS.display },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#fff", fontFamily: FONTS.display },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2, opacity: 0.8 },
  contactText: { fontSize: 12, color: "#fff", fontFamily: FONTS.regular },
  profileContent: { paddingHorizontal: SIZES.lg, paddingTop: SIZES.md, paddingBottom: 40 },

  // Lease card
  leaseCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", borderRadius: SIZES.radiusMedium, padding: 14, marginTop: 4, marginBottom: 4, ...SHADOWS.sm },
  leaseCardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  leaseIconBg: { width: 36, height: 36, backgroundColor: "#eff6ff", borderRadius: SIZES.radiusSmall, alignItems: "center", justifyContent: "center" },
  leaseName: { fontSize: 13, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  leaseDates: { fontSize: 11, color: COLORS.mutedForeground, fontFamily: FONTS.regular, marginTop: 1 },
  activeBadge: { backgroundColor: COLORS.badgeBackground, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.primary },
  activeBadgeText: { fontSize: 11, color: COLORS.primary, fontWeight: "600", fontFamily: FONTS.bold },

  section: { marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: COLORS.foreground, marginBottom: 12, fontFamily: FONTS.display },
  sectionItems: { gap: 8 },
  itemCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemIconBg: { width: 36, height: 36, backgroundColor: COLORS.muted, borderRadius: SIZES.radiusSmall, alignItems: "center", justifyContent: "center" },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 12, fontWeight: "bold", color: COLORS.foreground, fontFamily: FONTS.bold },
  itemDesc: { fontSize: 10, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  signOutBtnMargin: { marginTop: 24 },
  versionText: { textAlign: "center", fontSize: 10, color: COLORS.mutedForeground, marginTop: 16, fontFamily: FONTS.regular },
});
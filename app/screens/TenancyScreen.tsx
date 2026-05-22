import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft, MapPin, AlertCircle, FileText, Download,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, GRADIENTS } from "../../constants/Theme";

const contractDetails = {
  unit: "Azure Tower - Unit 1204",
  type: "2 BHK Apartment",
  start: "March 1, 2026",
  end: "February 28, 2027",
  rent: "AED 102,000 / year",
  monthlyRent: "AED 8,500 / month",
  deposit: "AED 5,000",
  payment: "4 Cheques",
  renewalDate: "December 1, 2026",
  status: "Active",
  location: "Dubai Marina, Dubai, UAE",
  floor: "12",
};

const tenant = {
  name: "Ahmed Al Rashid",
  phone: "+971 50 123 4567",
  email: "ahmed@email.com",
  emiratesId: "784-1990-1234567-1",
  visaType: "Employment Visa",
};

const cheques = [
  { num: 1, amount: "AED 25,500", date: "Mar 1, 2026", status: "paid" },
  { num: 2, amount: "AED 25,500", date: "Jun 1, 2026", status: "upcoming" },
  { num: 3, amount: "AED 25,500", date: "Sep 1, 2026", status: "upcoming" },
  { num: 4, amount: "AED 25,500", date: "Dec 1, 2026", status: "upcoming" },
];

const documents = [
  { name: "Ejari Certificate", size: "1.1 MB" },
  { name: "Signed Lease Agreement", size: "2.4 MB" },
  { name: "Payment Schedule", size: "0.3 MB" },
  { name: "Emirates ID Copy", size: "0.8 MB" },
  { name: "Passport Copy", size: "1.2 MB" },
  { name: "Visa Copy", size: "0.9 MB" },
  { name: "Welcome Handbook", size: "5.2 MB" },
];

const leaseFields = [
  { label: "Start Date", value: contractDetails.start },
  { label: "End Date", value: contractDetails.end },
  { label: "Annual Rent", value: contractDetails.rent },
  { label: "Monthly Rent", value: contractDetails.monthlyRent },
  { label: "Security Deposit", value: contractDetails.deposit },
  { label: "Payment Plan", value: contractDetails.payment },
  { label: "Renewal Date", value: contractDetails.renewalDate },
  { label: "Floor", value: contractDetails.floor },
];

const tenantFields = [
  { label: "Name", value: tenant.name },
  { label: "Phone", value: tenant.phone },
  { label: "Email", value: tenant.email },
  { label: "Emirates ID", value: tenant.emiratesId },
  { label: "Visa Type", value: tenant.visaType },
];

export default function Tenancy() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.activeNav}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tenancy Contract</Text>
        </View>

        <View style={styles.contractCard}>
          <View style={styles.cardHeader}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
            <Text style={styles.typeText}>{contractDetails.type}</Text>
          </View>
          <Text style={styles.unitName}>{contractDetails.unit}</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color="white" />
            <Text style={styles.locationText}>{contractDetails.location}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.mainContent}>

        {/* Lease Details */}
        <View>
          <Text style={styles.sectionTitle}>Lease Details</Text>
          <View style={styles.card}>
            <View style={styles.gridContainer}>
              {leaseFields.map((item, i) => (
                <View key={i} style={styles.gridItem}>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                  <Text style={styles.gridValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Tenant Information */}
        <View>
          <Text style={styles.sectionTitle}>Tenant Information</Text>
          <View style={styles.card}>
            {tenantFields.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.tenantRow,
                  i < tenantFields.length - 1 && styles.tenantRowBorder,
                ]}
              >
                <Text style={styles.tenantLabel}>{item.label}</Text>
                <Text style={styles.tenantValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Renewal Reminder */}
        <View style={styles.reminderCard}>
          <AlertCircle size={16} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.reminderTitle}>Renewal Reminder</Text>
            <Text style={styles.reminderDesc}>
              Renewal window opens {contractDetails.renewalDate}
            </Text>
          </View>
        </View>

        {/* Payment Schedule */}
        <View>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.list}>
            {cheques.map((c) => (
              <View key={c.num} style={styles.listRow}>
                <View style={[
                  styles.chequeNumBg,
                  { backgroundColor: c.status === "paid" ? "#ecfdf5" : "#f8fafc" },
                ]}>
                  <Text style={[
                    styles.chequeNumText,
                    { color: c.status === "paid" ? COLORS.success : COLORS.mutedForeground },
                  ]}>
                    #{c.num}
                  </Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{c.amount}</Text>
                  <Text style={styles.rowSub}>{c.date}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: c.status === "paid" ? "#ecfdf5" : "#eff6ff" },
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: c.status === "paid" ? COLORS.success : COLORS.primary },
                  ]}>
                    {c.status === "paid" ? "Paid" : "Upcoming"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* All Documents */}
        <View>
          <Text style={styles.sectionTitle}>All Documents</Text>
          <View style={styles.list}>
            {documents.map((doc, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.docIconBg}>
                  <FileText size={18} color={COLORS.primary} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{doc.name}</Text>
                  <Text style={styles.rowSub}>{doc.size}</Text>
                </View>
                <TouchableOpacity style={styles.downloadBtn}>
                  <Download size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footerBtns}>
          <TouchableOpacity style={[styles.renewBtn, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.renewBtnText}>Renew Contract</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.noticeBtn}>
            <Text style={styles.noticeBtnText}>Submit Notice</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  contractCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
  },
  typeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  unitName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.75,
  },
  locationText: {
    fontSize: 12,
    color: "white",
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    marginBottom: 16,
  },
  gridLabel: {
    fontSize: 10,
    color: "#475569",
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  tenantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
  },
  tenantRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tenantLabel: {
    fontSize: 13,
    color: "#475569",
  },
  tenantValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  reminderCard: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  reminderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2248db",
    marginBottom: 2,
  },
  reminderDesc: {
    fontSize: 11,
    color: "#64748b",
  },
  list: {
    gap: 8,
  },
  listRow: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chequeNumBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chequeNumText: {
    fontSize: 12,
    fontWeight: "700",
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  rowSub: {
    fontSize: 11,
    color: "#94a3b8",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  docIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtns: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 40,
  },
  renewBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#2248db",
    alignItems: "center",
    shadowColor: "#2248db",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  renewBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  noticeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    backgroundColor: "white",
    alignItems: "center",
  },
  noticeBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ef4444",
  },
});
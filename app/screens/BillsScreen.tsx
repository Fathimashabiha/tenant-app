import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billsService } from "../../lib/billsService";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Switch,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Zap,
  Droplets,
  Building,
  CreditCard,
  Clock,
  ChevronRight,
  Download,
  Check,
  Smartphone,
  Landmark,
  RefreshCw,
  X,
  Wifi,
  Flame,
  Users,
  CalendarClock,
  CircleCheckBig,
  SplitSquareHorizontal,
  Wrench,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, SHADOWS, GRADIENTS } from "../../constants/Theme";
import { Button, Card, TabBar } from "../../components/ui";
import { useFeatures } from "../context/FeatureContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type BillStatus = "unpaid" | "paid";
type PaymentMethod = "credit" | "debit" | "apple" | "bank" | "tabby";

interface Bill {
  id: any;
  icon: any;
  type: string;
  amount: string;
  amountNum: number;
  due: string;
  status: BillStatus;
  breakdown: { label: string; value: string }[];
}

interface Roommate {
  id: number;
  initials: string;
  name: string;
  role: string;
  color: string;
  bgColor: string;
}

interface PaymentRecord {
  title: string;
  date: string;
  method: string;
  txnId: string;
  amount: string;
  status: "success" | "failed";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const BILLS: Bill[] = [
  {
    id: 1,
    icon: Building,
    type: "Rent",
    amount: "8,995.00",
    amountNum: 8995,
    due: "Mar 28, 2026",
    status: "unpaid",
    breakdown: [
      { label: "Base Amount", value: "AED 7,196.00" },
      { label: "Service Charges", value: "AED 899.50" },
      { label: "Municipality Fee", value: "AED 449.75" },
      { label: "VAT (5%)", value: "AED 449.75" },
    ],
  },
  {
    id: 2,
    icon: Zap,
    type: "Electricity (DEWA)",
    amount: "487.50",
    amountNum: 487.5,
    due: "Apr 5, 2026",
    status: "unpaid",
    breakdown: [
      { label: "Consumption", value: "AED 420.00" },
      { label: "Fuel Surcharge", value: "AED 42.00" },
      { label: "VAT (5%)", value: "AED 25.50" },
    ],
  },
  {
    id: 3,
    icon: Droplets,
    type: "Water (DEWA)",
    amount: "125.00",
    amountNum: 125,
    due: "Apr 5, 2026",
    status: "paid",
    breakdown: [
      { label: "Consumption", value: "AED 110.00" },
      { label: "Sewerage Charge", value: "AED 15.00" },
    ],
  },
  {
    id: 4,
    icon: Wifi,
    type: "Internet (du)",
    amount: "399.00",
    amountNum: 399,
    due: "Apr 10, 2026",
    status: "unpaid",
    breakdown: [
      { label: "Monthly Plan", value: "AED 380.00" },
      { label: "VAT (5%)", value: "AED 19.00" },
    ],
  },
  {
    id: 5,
    icon: Flame,
    type: "Gas",
    amount: "65.00",
    amountNum: 65,
    due: "Apr 5, 2026",
    status: "paid",
    breakdown: [{ label: "Consumption", value: "AED 65.00" }],
  },
  {
    id: 6,
    icon: Wrench,
    type: "Maintenance",
    amount: "250.00",
    amountNum: 250,
    due: "Apr 12, 2026",
    status: "unpaid",
    breakdown: [
      { label: "AC Repair", value: "AED 200.00" },
      { label: "Call-out Fee", value: "AED 50.00" },
    ],
  },
];

const ROOMMATES: Roommate[] = [
  { id: 1, initials: "KR", name: "Khalid Al Rashid", role: "Roommate", color: "#1d4ed8", bgColor: "#eff6ff" },
  { id: 2, initials: "OH", name: "Omar Hassan", role: "Roommate", color: "#7c3aed", bgColor: "#fdf4ff" },
  { id: 3, initials: "SA", name: "Sara Al Maktoum", role: "Flatmate", color: "#d97706", bgColor: "#fff7ed" },
];

// ✅ FIXED: Added `title` field to each record
const PAYMENT_HISTORY: PaymentRecord[] = [
  { title: "Rent", date: "Feb 28, 2026", method: "Visa ···· 4521", txnId: "TXN-0226-4521", amount: "AED 8,995.00", status: "success" },
  { title: "Electricity (DEWA)", date: "Feb 25, 2026", method: "Apple Pay", txnId: "TXN-0225-AP01", amount: "AED 512.30", status: "success" },
  { title: "Water (DEWA)", date: "Feb 25, 2026", method: "Visa ···· 4521", txnId: "TXN-0225-4521", amount: "AED 118.00", status: "success" },
];

const PAYMENT_METHODS = [
  { id: "credit" as PaymentMethod, icon: CreditCard, label: "Credit Card", sub: "Visa ···· 4521" },
  { id: "debit" as PaymentMethod, icon: Landmark, label: "Debit Card", sub: "Emirates NBD ···· 8834" },
  { id: "apple" as PaymentMethod, icon: Smartphone, label: "Apple Pay", sub: "ahmed@icloud.com" },
  { id: "bank" as PaymentMethod, icon: Landmark, label: "Bank Transfer", sub: "ADCB Savings" },
  { id: "tabby" as PaymentMethod, icon: CreditCard, label: "Tabby", sub: "Split in 4 payments" },
];

function fmt(n: number) {
  return n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Gradient header used by modals (matches MaintenanceScreen style) */
function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <LinearGradient
      colors={GRADIENTS.activeNav}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.gradientHeader}
    >
      <View style={s.gradientHeaderRow}>
        <TouchableOpacity onPress={onBack} style={s.subHeaderBack}>
          <ArrowLeft size={18} color="white" />
        </TouchableOpacity>
        <Text style={s.gradientHeaderTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );
}

function BillIconBg({ icon: Icon, status }: { icon: any; status: BillStatus }) {
  return (
    <View style={[s.billIconBg, status === "paid" && { backgroundColor: COLORS.badgeBackground }]}>
      <Icon size={22} color={status === "paid" ? COLORS.success : COLORS.primary} />
    </View>
  );
}

function StatusBadge({ status }: { status: BillStatus | "pending" | "success" }) {
  const colors = {
    unpaid: { bg: "#fef2f2", text: COLORS.error, border: "#fecaca", label: "Unpaid" },
    paid:   { bg: COLORS.badgeBackground, text: COLORS.success, border: COLORS.primary, label: "Paid" },
    pending:{ bg: "#fffbeb", text: COLORS.warning, border: "#fde68a", label: "Pending" },
    success:{ bg: COLORS.badgeBackground, text: COLORS.success, border: COLORS.primary, label: "Success" },
  };
  const c = colors[status];
  return (
    <View style={[s.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[s.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

function SectionDivider({ label }: { label: string }) {
  return <Text style={s.sectionLabel}>{label}</Text>;
}

// ─── Modal: Bill Detail ───────────────────────────────────────────────────────

function BillDetailModal({
  bill,
  history,
  onClose,
  onPaySuccess,
}: {
  bill: Bill;
  history: PaymentRecord[];
  onClose: () => void;
  onPaySuccess: (id: number) => void;
}) {
  const [payVisible, setPayVisible] = useState(false);
  const [splitVisible, setSplitVisible] = useState(false);
  const [autoPayVisible, setAutoPayVisible] = useState(false);

  return (
    <>
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <View style={s.modalContainer}>
          <SubHeader title="Bill Details" onBack={onClose} />

          <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Amount card */}
            <Card style={s.amountCard} padding={24} radius="xl" noBorder={false}>
              <Text style={s.detailType}>{bill.type}</Text>
              <Text style={s.detailAmount}>AED {bill.amount}</Text>
              <Text style={s.detailDue}>Due: {bill.due}</Text>
              <View style={{ marginTop: 10 }}>
                <StatusBadge status={bill.status} />
              </View>
            </Card>

            {/* Breakdown */}
            <Card style={s.sectionCard} padding={20} radius="xl">
              <SectionDivider label="Breakdown" />
              {bill.breakdown.map((row, i) => (
                <View key={i} style={[s.rowItem, i === bill.breakdown.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={s.rowKey}>{row.label}</Text>
                  <Text style={s.rowVal}>{row.value}</Text>
                </View>
              ))}
            </Card>

            {/* Recent payments */}
            <Card style={s.sectionCard} padding={20} radius="xl">
              <SectionDivider label="Recent Payments" />
              {history.slice(0, 2).map((p, i) => (
                <View key={i} style={[s.rowItem, i === 1 && { borderBottomWidth: 0 }]}>
                  <View>
                    <Text style={s.rowVal}>{p.date}</Text>
                    <Text style={s.rowKey}>{p.method}</Text>
                  </View>
                  <StatusBadge status="success" />
                </View>
              ))}
            </Card>

            {/* Actions */}
            <View style={s.actionGroup}>
              {bill.status === "unpaid" && (
                <Button
                  label="Pay Now"
                  variant="primary"
                  size="lg"
                  style={s.fullBtn}
                  onPress={() => setPayVisible(true)}
                />
              )}
              <View style={s.dualRow}>
                <TouchableOpacity style={s.outlineBtn} onPress={() => setSplitVisible(true)}>
                  <SplitSquareHorizontal size={16} color={COLORS.primary} />
                  <Text style={s.outlineBtnText}>Split Bill</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.outlineBtn} onPress={() => setAutoPayVisible(true)}>
                  <CalendarClock size={16} color={COLORS.primary} />
                  <Text style={s.outlineBtnText}>Auto-Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {payVisible && (
        <PaymentModal
          bill={bill}
          onClose={() => setPayVisible(false)}
          onDone={() => { 
            setPayVisible(false); 
            onPaySuccess(bill.id);
            onClose(); 
          }}
        />
      )}
      {splitVisible && (
        <SplitBillModal bill={bill} onClose={() => setSplitVisible(false)} />
      )}
      {autoPayVisible && (
        <AutoPayModal bill={bill} onClose={() => setAutoPayVisible(false)} />
      )}
    </>
  );
}

// ─── Modal: Payment Flow ──────────────────────────────────────────────────────

function PaymentModal({
  bill,
  onClose,
  onDone,
}: {
  bill: Bill;
  onClose: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const [method, setMethod] = useState<PaymentMethod>("credit");
  const txnId = "TXN-" + Math.floor(10000000 + Math.random() * 90000000);

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "Credit Card";

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.modalContainer}>
        <SubHeader
          title={
            step === "select" ? "Select Payment" :
            step === "confirm" ? "Confirm Payment" :
            "Payment Successful"
          }
          onBack={
            step === "select" ? onClose :
            step === "confirm" ? () => setStep("select") :
            onDone
          }
        />

        <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
          {step === "select" && (
            <>
              <Card style={s.amountCard} padding={24} radius="xl">
                <Text style={s.detailType}>Paying for {bill.type}</Text>
                <Text style={s.detailAmount}>AED {bill.amount}</Text>
              </Card>
              <Card style={s.sectionCard} padding={20} radius="xl">
                <SectionDivider label="Select Payment Method" />
                {PAYMENT_METHODS.map((pm) => (
                  <TouchableOpacity
                    key={pm.id}
                    style={[s.paymentOption, method === pm.id && s.paymentOptionSelected]}
                    onPress={() => setMethod(pm.id)}
                  >
                    <View style={s.payOptionIcon}>
                      <pm.icon size={18} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.payOptionLabel}>{pm.label}</Text>
                      <Text style={s.payOptionSub}>{pm.sub}</Text>
                    </View>
                    {method === pm.id && (
                      <Check size={18} color="#1a9e6e" />
                    )}
                  </TouchableOpacity>
                ))}
              </Card>
              <View style={s.actionGroup}>
                <Button label="Continue" variant="primary" size="lg" style={s.fullBtn} onPress={() => setStep("confirm")} />
              </View>
            </>
          )}

          {step === "confirm" && (
            <>
              <Card style={[s.sectionCard, { marginTop: 20 }]} padding={24} radius="xl">
                <Text style={[s.sectionLabel, { fontSize: 15, marginBottom: 16 }]}>Payment Summary</Text>
                {[
                  ["Bill Type", bill.type],
                  ["Amount", `AED ${bill.amount}`],
                  ["Due Date", bill.due],
                  ["Payment Method", methodLabel],
                  ["Processing Fee", "AED 0.00"],
                ].map(([k, v], i) => (
                  <View key={i} style={s.rowItem}>
                    <Text style={s.rowKey}>{k}</Text>
                    <Text style={s.rowVal}>{v}</Text>
                  </View>
                ))}
                <View style={[s.rowItem, { borderBottomWidth: 0, paddingTop: 12, marginTop: 4, borderTopWidth: 0.5, borderTopColor: COLORS.border }]}>
                  <Text style={[s.rowVal, { fontSize: 15 }]}>Total</Text>
                  <Text style={[s.rowVal, { fontSize: 15, color: COLORS.success }]}>AED {bill.amount}</Text>
                </View>
              </Card>
              <View style={s.actionGroup}>
                <Button
                  label={`Confirm & Pay AED ${bill.amount}`}
                  variant="primary"
                  size="lg"
                  style={s.fullBtn}
                  onPress={() => setStep("success")}
                />
              </View>
            </>
          )}

          {step === "success" && (
            <View style={s.successWrapper}>
              <Card style={s.successCard} padding={32} radius="xl">
                <View style={s.successIconCircle}>
                  <CircleCheckBig size={32} color={COLORS.success} />
                </View>
                <Text style={s.successTitle}>Payment Successful!</Text>
                <Text style={s.successAmount}>AED {bill.amount}</Text>
                <Text style={s.successSub}>{bill.type} — Paid via {methodLabel}</Text>
                <Text style={s.successTxn}>Transaction ID: {txnId}</Text>
              </Card>
              <View style={s.dualRow}>
                <TouchableOpacity style={s.outlineBtn}>
                  <Download size={15} color={COLORS.primary} />
                  <Text style={s.outlineBtnText}>Receipt</Text>
                </TouchableOpacity>
                <Button label="Done" variant="primary" size="lg" style={{ flex: 1 }} onPress={onDone} />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Modal: Split Bill ────────────────────────────────────────────────────────

function SplitBillModal({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const [selected, setSelected] = useState<number[]>([ROOMMATES[0].id]);
  const [sent, setSent] = useState(false);

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const shareAmt = fmt(bill.amountNum / (selected.length + 1));

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.modalContainer}>
        <SubHeader title={sent ? "Invite Roommates" : "Split Bill"} onBack={onClose} />
        {!sent ? (
          <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
            <Card style={s.amountCard} padding={24} radius="xl">
              <Text style={s.detailType}>Splitting {bill.type}</Text>
              <Text style={s.detailAmount}>AED {bill.amount}</Text>
            </Card>
            <Card style={s.sectionCard} padding={20} radius="xl">
              <SectionDivider label="Select Roommates" />
              {ROOMMATES.map((rm) => (
                <TouchableOpacity
                  key={rm.id}
                  style={[s.roommateOption, selected.includes(rm.id) && s.roommateSelected]}
                  onPress={() => toggle(rm.id)}
                >
                  <View style={[s.avatar, { backgroundColor: rm.bgColor }]}>
                    <Text style={[s.avatarText, { color: rm.color }]}>{rm.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.payOptionLabel}>{rm.name}</Text>
                    <Text style={s.payOptionSub}>{rm.role}</Text>
                  </View>
                  {selected.includes(rm.id) && <Check size={18} color="#1a9e6e" />}
                </TouchableOpacity>
              ))}
            </Card>
            {selected.length > 0 && (
              <Card style={s.sectionCard} padding={20} radius="xl">
                <SectionDivider label="Split Breakdown" />
                <View style={s.rowItem}>
                  <Text style={s.rowKey}>Your share</Text>
                  <Text style={s.rowVal}>AED {shareAmt}</Text>
                </View>
                {selected.map((id) => {
                  const rm = ROOMMATES.find((r) => r.id === id)!;
                  return (
                    <View key={id} style={s.rowItem}>
                      <Text style={s.rowKey}>{rm.name}</Text>
                      <Text style={s.rowVal}>AED {shareAmt}</Text>
                    </View>
                  );
                })}
              </Card>
            )}
            <View style={s.actionGroup}>
              <Button
                label="Send Split Request"
                variant="primary"
                size="lg"
                style={s.fullBtn}
                onPress={() => setSent(true)}
                disabled={selected.length === 0}
              />
            </View>
          </ScrollView>
        ) : (
          <View style={s.successWrapper}>
            <Card style={s.successCard} padding={32} radius="xl">
              <View style={[s.successIconCircle, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                <Users size={30} color="#2563eb" />
              </View>
              <Text style={s.successTitle}>Split Request Sent!</Text>
              <Text style={[s.successSub, { marginBottom: 20 }]}>
                Waiting for {selected.length} roommate{selected.length > 1 ? "s" : ""} to accept
              </Text>
              {selected.map((id) => {
                const rm = ROOMMATES.find((r) => r.id === id)!;
                return (
                  <View key={id} style={[s.rowItem, { borderBottomWidth: 0 }]}>
                    <Text style={s.rowVal}>{rm.name}</Text>
                    <StatusBadge status="pending" />
                  </View>
                );
              })}
              <Text style={[s.rowKey, { marginTop: 14, textAlign: "center" }]}>
                Your share: AED {shareAmt}
              </Text>
            </Card>
            <Button label="Done" variant="primary" size="lg" style={s.fullBtn} onPress={onClose} />
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Modal: Auto-Pay ──────────────────────────────────────────────────────────

function AutoPayModal({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const [method, setMethod] = useState<PaymentMethod>("debit");
  const [enabled, setEnabled] = useState(false);

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "Debit Card";

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={s.modalContainer}>
        <SubHeader title={enabled ? "Auto-Pay Active" : "Auto-Pay Setup"} onBack={onClose} />

        {!enabled ? (
          <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
            <Card style={s.amountCard} padding={24} radius="xl">
              <View style={s.autopayIconRow}>
                <CalendarClock size={32} color="#2563eb" />
              </View>
              <Text style={s.detailType}>Auto-Pay for {bill.type}</Text>
              <Text style={s.detailAmount}>
                AED {bill.amount}
                <Text style={{ fontSize: 16, color: COLORS.mutedForeground, fontWeight: "400" }}>/month</Text>
              </Text>
            </Card>
            <Card style={s.sectionCard} padding={20} radius="xl">
              <SectionDivider label="Payment Method" />
              {PAYMENT_METHODS.slice(0, 3).map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  style={[s.paymentOption, method === pm.id && s.paymentOptionSelected]}
                  onPress={() => setMethod(pm.id)}
                >
                  <View style={s.payOptionIcon}>
                    <pm.icon size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.payOptionLabel}>{pm.label}</Text>
                    <Text style={s.payOptionSub}>{pm.sub}</Text>
                  </View>
                  {method === pm.id && <Check size={18} color="#1a9e6e" />}
                </TouchableOpacity>
              ))}
            </Card>
            <Card style={s.sectionCard} padding={20} radius="xl">
              <SectionDivider label="Schedule" />
              {[
                ["Frequency", "Monthly"],
                ["Payment Day", "28th of each month"],
                ["Next Payment", "Mar 28, 2026"],
                ["Max Amount", `AED ${bill.amount}`],
              ].map(([k, v], i, arr) => (
                <View key={i} style={[s.rowItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={s.rowKey}>{k}</Text>
                  <Text style={s.rowVal}>{v}</Text>
                </View>
              ))}
            </Card>
            <View style={s.actionGroup}>
              <Button
                label="Enable Auto-Pay"
                variant="primary"
                size="lg"
                style={s.enableAutoPayBtn}
                onPress={() => setEnabled(true)}
              />
            </View>
          </ScrollView>
        ) : (
          <View style={s.successWrapper}>
            <Card style={s.successCard} padding={32} radius="xl">
              <View style={[s.successIconCircle, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                <CalendarClock size={30} color="#2563eb" />
              </View>
              <Text style={s.successTitle}>Auto-Pay Enabled!</Text>
              <Text style={s.successSub}>{bill.type} — {methodLabel}</Text>
              <Text style={[s.successAmount, { color: "#2563eb" }]}>
                AED {bill.amount}/month
              </Text>
              <Text style={s.successTxn}>Next payment: Mar 28, 2026</Text>
              <Text style={s.successTxn}>You'll be notified 3 days before each payment</Text>
            </Card>
            <Button label="Done" variant="primary" size="lg" style={s.fullBtn} onPress={onClose} />
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Bills() {
  const queryClient = useQueryClient();
  const TENANT_ID = "default-tenant-uuid";
  const { config } = useFeatures();

  const { data: serverBills = [], isLoading } = useQuery({
    queryKey: ["bills", TENANT_ID],
    queryFn: () => billsService.getBills(TENANT_ID),
  });

  const visibleServerBills = useMemo(() => {
    if (config.tenancyEnabled) return serverBills;
    return serverBills.filter((b) => b.billType === "maintenance");
  }, [serverBills, config.tenancyEnabled]);

  const bills = useMemo(() => {
    return visibleServerBills.map((b) => ({
      id: b.id,
      icon:
        b.billType === "maintenance"
          ? Wrench
          : b.billType === "rent"
            ? Building
            : Zap,
      type: b.title,
      amount: fmt(Number(b.amount)),
      amountNum: Number(b.amount),
      due: new Date(b.dueDate).toLocaleDateString(),
      status: b.status.toLowerCase() === "paid" ? ("paid" as const) : ("unpaid" as const),
      breakdown: [{ label: "Base Amount", value: `AED ${b.amount}` }],
    })) as Bill[];
  }, [visibleServerBills]);

  const currentBills = useMemo(
    () => bills.filter((b) => b.status !== "paid"),
    [bills]
  );

  const history = useMemo(() => {
    const hist: PaymentRecord[] = [];
    serverBills
      .filter((b) => b.status.toLowerCase() === "paid")
      .forEach((b) => {
        if (b.payments?.length) {
          b.payments.forEach((p) => {
            hist.push({
              title: b.title,
              date: new Date(p.paidAt).toLocaleDateString(),
              method: p.paymentMethod || "Paid",
              txnId: p.id,
              amount: `AED ${Number(b.amount).toFixed(2)}`,
              status: "success",
            });
          });
        } else {
          hist.push({
            title: b.title,
            date: new Date(b.dueDate).toLocaleDateString(),
            method: "Paid",
            txnId: b.id,
            amount: `AED ${Number(b.amount).toFixed(2)}`,
            status: "success",
          });
        }
      });
    return hist.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [serverBills]);

  const payMutation = useMutation({
    mutationFn: ({ billId, method }: { billId: string, method: string }) => billsService.payBill(billId, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
    }
  });

  const [tab, setTab] = useState<"current" | "history">("current");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPayingAll, setIsPayingAll] = useState(false);
  const [autoPay, setAutoPay] = useState(true);
  const navigation = useNavigation<any>();

  const unpaidBills = bills.filter((b) => b.status === "unpaid");
  const totalDue = unpaidBills.reduce((s, b) => s + b.amountNum, 0);

  const handlePaySuccess = (billId: any) => {
    if (billId === "all") {
      unpaidBills.forEach(b => payMutation.mutate({ billId: b.id, method: "Credit Card" }));
    } else {
      payMutation.mutate({ billId, method: "Credit Card" });
    }
  };

  const totalBillSummary: Bill = {
    id: 0,
    icon: CreditCard,
    type: "All Unpaid Bills",
    amount: fmt(totalDue),
    amountNum: totalDue,
    due: "Today",
    status: "unpaid",
    breakdown: unpaidBills.map((b) => ({ label: b.type, value: `AED ${b.amount}` })),
  };

  return (
    <View style={s.screenContainer}>
      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={GRADIENTS.activeNav}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.mainGradientHeader}
      >
        <View style={s.mainGradientHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.subHeaderBack}>
            <ArrowLeft size={18} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.gradientHeaderTitle}>Bills & Payments</Text>
            <Text style={s.gradientHeaderSub}>Manage your bills & payments</Text>
          </View>
        </View>

        <Card style={s.totalDueCard} shadow="lg" padding={20} noBorder>
          <Text style={s.totalDueLabel}>Total Outstanding</Text>
          <Text style={s.totalDueAmount}>AED {fmt(totalDue)}</Text>
          <Text style={s.totalDueSubtitle}>
            {unpaidBills.length} unpaid bills
          </Text>
          <Button
            label="Pay All Bills"
            variant="primary"
            size="md"
            style={s.payAllBtn}
            onPress={() => setIsPayingAll(true)}
            disabled={totalDue === 0}
          />
        </Card>
      </LinearGradient>

      {/* Bulk Payment Modal */}
      {isPayingAll && (
        <PaymentModal
          bill={totalBillSummary}
          onClose={() => setIsPayingAll(false)}
          onDone={() => {
            handlePaySuccess("all");
            setIsPayingAll(false);
          }}
        />
      )}

      {/* ── Body (tabs fixed; content scrolls independently) ── */}
      <View style={s.bodySection}>
        <View style={s.tabBarWrap}>
          <TabBar
            tabs={[
              { key: "current", label: "Current" },
              { key: "history", label: "History" },
            ]}
            activeTab={tab}
            onTabChange={(t) => setTab(t as "current" | "history")}
          />
        </View>

        {tab === "current" ? (
          <ScrollView
            style={s.scrollBody}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <View style={s.billList}>
              <Card style={s.autoPayCard} padding={16} radius="xl">
                <View style={s.autoPayRow}>
                  <View style={s.autoPayIcon}>
                    <CalendarClock size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.autoPayLabel}>Auto-Pay</Text>
                    <Text style={s.autoPaySub}>Pay bills automatically</Text>
                  </View>
                  <Switch
                    value={autoPay}
                    onValueChange={setAutoPay}
                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    thumbColor="#fff"
                  />
                </View>
              </Card>

              {currentBills.length === 0 && (
                <Text style={s.emptyHint}>No outstanding bills.</Text>
              )}
              {currentBills.map((bill) => (
                <TouchableOpacity
                  key={bill.id}
                  style={s.billRow}
                  onPress={() => setSelectedBill(bill)}
                  activeOpacity={0.7}
                >
                  <BillIconBg icon={bill.icon} status={bill.status} />
                  <View style={s.billInfo}>
                    <Text style={s.billType}>{bill.type}</Text>
                    <Text style={s.billDueSmall}>Due: {bill.due}</Text>
                  </View>
                  <View style={s.billRight}>
                    <Text style={s.billAmountText}>AED {bill.amount}</Text>
                    <StatusBadge status={bill.status} />
                  </View>
                  <ChevronRight size={16} color={COLORS.mutedForeground} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            style={s.scrollBody}
            contentContainerStyle={[
              s.scrollContent,
              history.length === 0 && s.scrollContentEmpty,
            ]}
            data={history}
            keyExtractor={(p) => p.txnId}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            removeClippedSubviews={false}
            ListEmptyComponent={
              <Text style={s.emptyHint}>No paid bills yet.</Text>
            }
            renderItem={({ item: p }) => (
              <Card style={[s.historyCard, s.historyItemSpacing]} padding={16} radius="xl">
                <View style={s.historyHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.billType}>{p.title}</Text>
                    <Text style={s.billDueSmall}>{p.date} · {p.method}</Text>
                  </View>
                  <StatusBadge status="success" />
                </View>
                <View style={s.historyFooter}>
                  <Text style={s.txnLabel}>Transaction ID</Text>
                  <Text style={s.txnId} numberOfLines={1} ellipsizeMode="middle">
                    {p.txnId}
                  </Text>
                  <View style={s.historyFooterBottom}>
                    <Text style={s.historyAmount}>{p.amount}</Text>
                    <TouchableOpacity style={s.receiptBtn} activeOpacity={0.7}>
                      <Download size={13} color="#2563eb" />
                      <Text style={s.receiptText}>Receipt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            )}
          />
        )}
      </View>

      {/* Bill detail modal */}
      {selectedBill && (
        <BillDetailModal 
          bill={selectedBill} 
          history={history}
          onClose={() => setSelectedBill(null)}
          onPaySuccess={handlePaySuccess}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#f1f5f9" },
  bodySection: { flex: 1 },
  tabBarWrap: { paddingHorizontal: SIZES.lg, paddingTop: 16, paddingBottom: 8 },
  scrollBody: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.lg, paddingBottom: 120 },
  scrollContentEmpty: { flexGrow: 1, justifyContent: "center" },

  modalContainer: { flex: 1, backgroundColor: "#f1f5f9" },

  mainGradientHeader: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  mainGradientHeaderRow: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18,
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  gradientHeaderRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  gradientHeaderTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  gradientHeaderSub:   { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  subHeaderBack: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },

  totalDueCard: { borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", backgroundColor: "white" },
  totalDueLabel: { fontSize: 12, fontWeight: "bold", color: COLORS.mutedForeground, fontFamily: FONTS.bold },
  totalDueAmount: { fontSize: 28, fontWeight: "bold", color: "#dc2626", marginTop: 4, fontFamily: FONTS.display },
  totalDueSubtitle: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 4, fontFamily: FONTS.regular },
  payAllBtn: { marginTop: 16, backgroundColor: "#1a9e6e", borderRadius: 14 },

  billList: { paddingBottom: 16 },
  emptyHint: { fontSize: 14, color: COLORS.mutedForeground, textAlign: "center", paddingVertical: 24 },
  historyItemSpacing: { marginBottom: 10 },

  autoPayCard: { borderWidth: 0.5, borderColor: "#e2e8f0", marginBottom: 10 },
  autoPayRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  autoPayIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  autoPayLabel: { fontSize: 14, fontWeight: "600", color: COLORS.foreground, fontFamily: FONTS.bold },
  autoPaySub: { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },

  billRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.background ?? "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  billIconBg: {
    width: 44,
    height: 44,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  billInfo: { flex: 1 },
  billType: { fontSize: 14, fontWeight: "600", color: COLORS.foreground, fontFamily: FONTS.bold },
  billDueSmall: { fontSize: 11, color: COLORS.mutedForeground, marginTop: 2, fontFamily: FONTS.regular },
  billRight: { alignItems: "flex-end", gap: 4 },
  billAmountText: { fontSize: 14, fontWeight: "600", color: COLORS.foreground, fontFamily: FONTS.display },

  historyCard: { borderWidth: 0.5, borderColor: "#e2e8f0" },
  historyHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  historyFooter: { marginTop: 4, gap: 4 },
  txnLabel: { fontSize: 10, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  txnId: { fontSize: 11, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  historyFooterBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 8,
  },
  historyAmount: { fontSize: 14, fontWeight: "600", color: COLORS.foreground, fontFamily: FONTS.display, flexShrink: 0 },
  receiptRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  receiptBtn: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 },
  receiptText: { fontSize: 12, color: "#2563eb", fontFamily: FONTS.regular },

  modalScroll: { flex: 1, paddingHorizontal: SIZES.lg },

  amountCard: {
    marginTop: 20,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  sectionCard: {
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.mutedForeground,
    fontFamily: FONTS.bold,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  detailType: { fontSize: 13, color: COLORS.mutedForeground, fontFamily: FONTS.regular, marginBottom: 4 },
  detailAmount: { fontSize: 30, fontWeight: "700", color: COLORS.foreground, fontFamily: FONTS.display, textAlign: "center" },
  detailDue: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 4, fontFamily: FONTS.regular },

  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
  },
  rowKey: { fontSize: 13, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
  rowVal: { fontSize: 13, fontWeight: "600", color: COLORS.foreground, fontFamily: FONTS.bold },

  actionGroup: { paddingHorizontal: 0, paddingBottom: 40, gap: 10, marginTop: 4 },
  fullBtn: { borderRadius: 14 },
  enableAutoPayBtn: { borderRadius: 14, backgroundColor: "#2563eb" },
  dualRow: { flexDirection: "row", gap: 10 },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: COLORS.background ?? "#fff",
  },
  outlineBtnText: { fontSize: 14, color: COLORS.foreground, fontFamily: FONTS.bold },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  paymentOptionSelected: {
    borderWidth: 1.5,
    borderColor: "#1a9e6e",
    backgroundColor: "#f0fdf4",
  },
  payOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  payOptionLabel: { fontSize: 14, fontWeight: "600", color: COLORS.foreground, fontFamily: FONTS.bold },
  payOptionSub: { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },

  roommateOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  roommateSelected: {
    borderWidth: 1.5,
    borderColor: "#1a9e6e",
    backgroundColor: "#f0fdf4",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontWeight: "700", fontFamily: FONTS.bold },

  autopayIconRow: { alignItems: "center", marginBottom: 10 },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 0.5,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, fontWeight: "600", fontFamily: FONTS.bold },

  successWrapper: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  successCard: {
    alignItems: "center",
    gap: 6,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 20, fontWeight: "700", color: COLORS.foreground, fontFamily: FONTS.display },
  successAmount: { fontSize: 28, fontWeight: "700", color: "#1a9e6e", fontFamily: FONTS.display },
  successSub: { fontSize: 13, color: COLORS.mutedForeground, fontFamily: FONTS.regular, textAlign: "center" },
  successTxn: { fontSize: 12, color: COLORS.mutedForeground, fontFamily: FONTS.regular },
});
import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import AppLayout from "../../components/layout/AppLayout";
import {
  X, QrCode, Heart, MessageSquare, Flag, Send,
  Calendar, Clock, MapPin, Users, Check, ChevronLeft,
  Package, UserPlus, Image as ImageIcon, Lock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, GRADIENTS } from "../../constants/Theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatContact = {
  id: number; name: string; avatar: string; lastMsg: string;
  time: string; unread: number; colors: readonly [string, string];
  messages: { id: number; text: string; mine: boolean; time: string }[];
};

type FeedPost = {
  id: number; author: string; avatar: string; avatarColors: readonly [string, string];
  time: string; tag: string; tagColor: string; tagBg: string;
  title: string; body: string; likes: number; comments: number;
};

type Event = {
  id: number; title: string; date: string; time: string; location: string;
  attending: number; capacity: number; rsvpd: boolean;
  host: string; price: string; desc: string;
};

type Visitor = {
  id: number; name: string; date: string; status: "Expected" | "Visited";
};

type Parcel = {
  id: number; pkg: string; courier: string; date: string;
  status: "Ready for pickup" | "Collected";
  desc: string; weight: string; locker: string; arrivedTime: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONTACTS: ChatContact[] = [
  {
    id: 1, name: "Sarah M.", avatar: "SM", time: "10:30 AM", unread: 2,
    colors: GRADIENTS.activeNav,
    lastMsg: "Has anyone seen a grey cat?",
    messages: [
      { id: 1, text: "Has anyone seen a grey cat around Tower B?", mine: false, time: "10:30 AM" },
      { id: 2, text: "I think I saw one near the parking area yesterday!", mine: true, time: "10:35 AM" },
      { id: 3, text: "Oh thanks! I'll check there. Her name is Luna 🐱", mine: false, time: "10:36 AM" },
    ],
  },
  {
    id: 2, name: "Building Mgmt", avatar: "BM", time: "9:15 AM", unread: 1,
    colors: ["#1e3a8a", "#26A69A"] as const,
    lastMsg: "Pool will be closed tomorrow",
    messages: [
      { id: 1, text: "Pool will be closed tomorrow for maintenance from 8 AM - 2 PM.", mine: false, time: "9:15 AM" },
    ],
  },
  {
    id: 3, name: "Omar K.", avatar: "OK", time: "Yesterday", unread: 0,
    colors: ["#347373", "#26A69A"] as const,
    lastMsg: "Is the coffee table available?",
    messages: [
      { id: 1, text: "Is the coffee table available?", mine: false, time: "Yesterday" },
      { id: 2, text: "Yes, it's still available! You can pick it up anytime.", mine: true, time: "Yesterday" },
    ],
  },
];

const FEED_POSTS: FeedPost[] = [
  {
    id: 1, author: "Building Management", avatar: "BM",
    avatarColors: ["#1e3a8a", "#26A69A"] as const, time: "2h ago",
    tag: "Announcement", tagColor: COLORS.primary, tagBg: COLORS.badgeBackground,
    title: "Water Tank Cleaning – Mar 25",
    body: "Water supply may be interrupted 8 AM – 12 PM on March 25. Please store water.",
    likes: 12, comments: 3,
  },
  {
    id: 2, author: "Fatima J.", avatar: "FJ",
    avatarColors: GRADIENTS.activeNav, time: "5h ago",
    tag: "Buy & Sell", tagColor: COLORS.success, tagBg: COLORS.badgeBackground,
    title: "Moving Sale – Furniture",
    body: "Selling: Sofa set AED 800, Dining table AED 500, Book shelf AED 150. DM for details.",
    likes: 5, comments: 8,
  },
  {
    id: 3, author: "Ahmed R.", avatar: "AR",
    avatarColors: ["#ea580c", "#f59e0b"] as const, time: "1d ago",
    tag: "Lost & Found", tagColor: COLORS.warning, tagBg: "#fff7ed",
    title: "Found: Black Umbrella",
    body: "Found a black umbrella near Lobby A entrance. Please contact me to claim it.",
    likes: 3, comments: 1,
  },
];

const EVENTS: Event[] = [
  {
    id: 1, title: "Community BBQ Night", date: "Mar 22, 2026",
    time: "6:00 PM – 9:00 PM", location: "Rooftop Terrace",
    attending: 45, capacity: 60, rsvpd: true,
    host: "Building Management", price: "AED 50/person",
    desc: "Join your neighbors for a fun evening of grilled food and stunning views!",
  },
  {
    id: 2, title: "Kids Art Workshop", date: "Mar 25, 2026",
    time: "3:00 PM – 5:00 PM", location: "Clubhouse",
    attending: 12, capacity: 20, rsvpd: true,
    host: "Residents Committee", price: "Free",
    desc: "A creative art session for kids aged 4–12. Materials provided.",
  },
  {
    id: 3, title: "Yoga in the Park", date: "Mar 28, 2026",
    time: "7:00 AM – 8:00 AM", location: "Garden Area",
    attending: 18, capacity: 30, rsvpd: false,
    host: "Wellness Club", price: "Free",
    desc: "Start your morning with a relaxing outdoor yoga session.",
  },
];

const VISITORS: Visitor[] = [
  { id: 1, name: "John Smith",   date: "Mar 14, 2026 · 3:00 PM",  status: "Expected" },
  { id: 2, name: "Maria Garcia", date: "Mar 15, 2026 · 11:00 AM", status: "Expected" },
  { id: 3, name: "David Lee",    date: "Mar 10, 2026 · 2:00 PM",  status: "Visited"  },
];

const PARCELS: Parcel[] = [
  { id: 1, pkg: "PKG-2041", courier: "DHL Express", date: "Mar 11, 2026", status: "Ready for pickup", desc: "Amazon.ae — Electronics",  weight: "2.3 kg", locker: "Locker B3", arrivedTime: "Mar 11, 2026 · 11:32 AM" },
  { id: 2, pkg: "PKG-2040", courier: "Aramex",      date: "Mar 11, 2026", status: "Ready for pickup", desc: "Noon — Clothing",           weight: "0.8 kg", locker: "Locker A1", arrivedTime: "Mar 11, 2026 · 9:10 AM"  },
  { id: 3, pkg: "PKG-2038", courier: "FedEx",       date: "Mar 9, 2026",  status: "Collected",        desc: "Apple Store — Accessories", weight: "1.1 kg", locker: "Locker C2", arrivedTime: "Mar 9, 2026 · 3:45 PM"   },
];

const TABS = ["Chat", "Feed", "Events", "Visitors", "Parcels"];

// ─── Modals ───────────────────────────────────────────────────────────────────

function CreatePostModal({ onClose, onPost }: { onClose: () => void; onPost: (text: string, tag: string) => void }) {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("General");
  const POST_TAGS = ["General", "Announcement", "Buy & Sell", "Lost & Found", "Help"];

  return (
    <Modal visible transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={[styles.modalSheet, { maxHeight: "75%" }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={onClose}><X size={20} color="#64748b" /></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 8 }}>
            {POST_TAGS.map(t => (
              <TouchableOpacity key={t} onPress={() => setTag(t)} style={[styles.tagChip, tag === t && styles.tagChipActive]}>
                <Text style={[styles.tagChipText, tag === t && styles.tagChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={styles.postTextInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#94a3b8"
            multiline value={text} onChangeText={setText} autoFocus
          />
          <TouchableOpacity onPress={() => { if (text.trim()) { onPost(text.trim(), tag); onClose(); } }} style={{ marginTop: 12 }}>
            <LinearGradient
              colors={text.trim() ? GRADIENTS.activeNav : [COLORS.border, COLORS.border]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.submitBtnGrad}
            >
              <Text style={[styles.submitBtnText, !text.trim() && { color: "#94a3b8" }]}>Post</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AddVisitorModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [plate, setPlate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalSheet}>
            <View style={[styles.successIconBg, { marginBottom: 14 }]}>
              <Check size={28} color="white" />
            </View>
            <Text style={styles.modalTitle}>Visitor Added!</Text>
            <Text style={styles.modalSub}>QR code sent to visitor.</Text>
            <TouchableOpacity style={{ marginTop: 20, width: "100%" }} onPress={onClose}>
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
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Visitor</Text>
            <TouchableOpacity onPress={onClose}><X size={20} color="#64748b" /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {[
              ["Name",                     name,        setName,        "Enter name"],
              ["Phone",                    phone,       setPhone,       "Enter phone"],
              ["Email (optional)",         email,       setEmail,       "Enter email (optional)"],
              ["Purpose of Visit",         purpose,     setPurpose,     "Enter purpose of visit"],
              ["Vehicle Plate (optional)", plate,       setPlate,       "Enter vehicle plate (optional)"],
              ["Vehicle Type (optional)",  vehicleType, setVehicleType, "Enter vehicle type (optional)"],
            ].map(([label, val, setter, ph]) => (
              <View key={label as string}>
                <Text style={styles.fieldLabel}>{label as string}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={ph as string}
                  placeholderTextColor="#94a3b8"
                  value={val as string}
                  onChangeText={setter as any}
                />
              </View>
            ))}
            <View style={styles.dateTimeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Date</Text>
                <View style={styles.dateTimeInput}><Text style={styles.dateTimeText}>Mar 20, 2026</Text></View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Time</Text>
                <View style={styles.dateTimeInput}><Text style={styles.dateTimeText}>2:00 PM</Text></View>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSubmitted(true)} style={{ marginTop: 8 }}>
              <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
                <Text style={styles.submitBtnText}>Generate QR & Add Visitor</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Community() {
  const [activeTab, setActiveTab]         = useState("Chat");
  const [activeChat, setActiveChat]       = useState<ChatContact | null>(null);
  const [activeEvent, setActiveEvent]     = useState<Event | null>(null);
  const [activeParcel, setActiveParcel]   = useState<Parcel | null>(null);
  const [activeVisitor, setActiveVisitor] = useState<Visitor | null>(null);
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [likedPosts, setLikedPosts]         = useState<number[]>([]);
  const [events, setEvents]                 = useState(EVENTS);
  const [feedPosts, setFeedPosts]           = useState(FEED_POSTS);
  const [msgDraft, setMsgDraft]             = useState("");
  const [chatMessages, setChatMessages]     = useState<Record<number, ChatContact["messages"]>>(
    Object.fromEntries(CONTACTS.map(c => [c.id, c.messages]))
  );

  const clearDetail = () => {
    setActiveChat(null); setActiveEvent(null);
    setActiveParcel(null); setActiveVisitor(null);
  };

  const switchTab = (tab: string) => { setActiveTab(tab); clearDetail(); };

  const toggleLike = (id: number) =>
    setLikedPosts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleRsvp = (id: number) =>
    setEvents(prev => prev.map(e =>
      e.id === id ? { ...e, rsvpd: !e.rsvpd, attending: e.rsvpd ? e.attending - 1 : e.attending + 1 } : e
    ));

  const handleNewPost = (text: string, tag: string) => {
    const tagStyles: Record<string, { tagColor: string; tagBg: string }> = {
      "General":      { tagColor: "#64748b", tagBg: "#f1f5f9" },
      "Announcement": { tagColor: COLORS.primary, tagBg: COLORS.badgeBackground },
      "Buy & Sell":   { tagColor: COLORS.success, tagBg: COLORS.badgeBackground },
      "Lost & Found": { tagColor: COLORS.warning, tagBg: "#fff7ed" },
      "Help":         { tagColor: "#9333ea", tagBg: "#faf5ff" },
    };
    setFeedPosts(prev => [{
      id: Date.now(), author: "You", avatar: "AR",
      avatarColors: GRADIENTS.activeNav,
      time: "Just now", tag,
      tagColor: tagStyles[tag]?.tagColor ?? "#64748b",
      tagBg:    tagStyles[tag]?.tagBg    ?? "#f1f5f9",
      title: "", body: text, likes: 0, comments: 0,
    }, ...prev]);
  };

  const sendMessage = () => {
    if (!msgDraft.trim() || !activeChat) return;
    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] ?? []), { id: Date.now(), text: msgDraft.trim(), mine: true, time: "Now" }],
    }));
    setMsgDraft("");
  };

  const inDetail = !!(activeChat || activeEvent || activeParcel || activeVisitor);

  return (
    <AppLayout>
      <View style={styles.container}>

        {/* ── Header ── */}
        <LinearGradient
          colors={GRADIENTS.activeNav}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {inDetail ? (
            <TouchableOpacity style={styles.headerBackRow} onPress={clearDetail}>
              <ChevronLeft size={20} color="white" />
              <Text style={styles.headerBackText}>
                {activeChat    ? activeChat.name    :
                 activeEvent   ? activeEvent.title  :
                 activeParcel  ? activeParcel.pkg   :
                 activeVisitor ? activeVisitor.name : "Back"}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.headerTitle}>Community</Text>
              <Text style={styles.headerSub}>Connect with your neighbors</Text>
            </>
          )}
        </LinearGradient>

        {/* ── Tabs ── */}
        <View style={styles.tabBarWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => switchTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              >
                <Text style={[styles.tabLabel, activeTab === tab ? styles.tabLabelActive : styles.tabLabelInactive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Scrollable Content ── */}
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ════ CHAT: list ════ */}
          {activeTab === "Chat" && !activeChat && (
            <View style={styles.content}>
              {CONTACTS.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setActiveChat(c)} style={styles.contactCard}>
                  <LinearGradient colors={c.colors} style={styles.avatar}>
                    <Text style={styles.avatarText}>{c.avatar}</Text>
                  </LinearGradient>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactHeaderRow}>
                      <Text style={styles.contactName}>{c.name}</Text>
                      <Text style={styles.contactTime}>{c.time}</Text>
                    </View>
                    <Text style={styles.lastMsg} numberOfLines={1}>{c.lastMsg}</Text>
                  </View>
                  {c.unread > 0 && (
                    <View style={styles.unreadBadge}><Text style={styles.unreadText}>{c.unread}</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ════ CHAT: conversation ════ */}
          {activeTab === "Chat" && activeChat && (
            <View style={styles.content}>
              {(chatMessages[activeChat.id] ?? []).map(m => (
                <View key={m.id} style={[styles.bubbleRow, m.mine && { justifyContent: "flex-end" }]}>
                  {m.mine ? (
                    <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bubble, styles.bubbleMine]}>
                      <Text style={styles.bubbleTextMine}>{m.text}</Text>
                      <Text style={styles.bubbleTime}>{m.time}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.bubble, styles.bubbleTheirs]}>
                      <Text style={styles.bubbleTextTheirs}>{m.text}</Text>
                      <Text style={[styles.bubbleTime, { color: "#94a3b8" }]}>{m.time}</Text>
                    </View>
                  )}
                </View>
              ))}
              <View style={{ height: 20 }} />
            </View>
          )}

          {/* ════ FEED ════ */}
          {activeTab === "Feed" && (
            <View style={styles.content}>
              <TouchableOpacity style={styles.createPost} onPress={() => setShowCreatePost(true)} activeOpacity={0.7}>
                <View style={[styles.smallAvatar, { backgroundColor: COLORS.primary }]}><Text style={styles.smallAvatarText}>AR</Text></View>
                <View style={styles.createPostInput}><Text style={styles.createPostPh}>Share something with your community...</Text></View>
                <View style={styles.createPostImg}><ImageIcon size={18} color="#64748b" /></View>
              </TouchableOpacity>
              {feedPosts.map(post => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <LinearGradient colors={post.avatarColors} style={styles.postAvatar}>
                      <Text style={styles.avatarText}>{post.avatar}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postAuthor}>{post.author}</Text>
                      <Text style={styles.postTime}>{post.time}</Text>
                    </View>
                    <View style={[styles.postTag, { backgroundColor: post.tagBg }]}>
                      <Text style={[styles.postTagText, { color: post.tagColor }]}>{post.tag}</Text>
                    </View>
                  </View>
                  {!!post.title && <Text style={styles.postTitle}>{post.title}</Text>}
                  <Text style={styles.postBody}>{post.body}</Text>
                  <View style={styles.postActions}>
                    <TouchableOpacity style={styles.postAction} onPress={() => toggleLike(post.id)}>
                      <Heart size={16} color={likedPosts.includes(post.id) ? COLORS.error : COLORS.mutedForeground} fill={likedPosts.includes(post.id) ? COLORS.error : "none"} />
                      <Text style={styles.postActionText}>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.postAction}>
                      <MessageSquare size={16} color="#94a3b8" />
                      <Text style={styles.postActionText}>{post.comments}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.postAction, { marginLeft: "auto" }]}>
                      <Flag size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ════ EVENTS: list ════ */}
          {activeTab === "Events" && !activeEvent && (
            <View style={styles.content}>
              {events.map(event => {
                const pct = event.attending / event.capacity;
                return (
                  <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => setActiveEvent(event)}>
                    <View style={styles.eventCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.eventMetaRow}>
                          <Calendar size={12} color={COLORS.primary} />
                          <Text style={styles.eventMetaText}>{event.date}</Text>
                          <Clock size={12} color={COLORS.secondary} style={{ marginLeft: 8 }} />
                          <Text style={styles.eventMetaText}>{event.time}</Text>
                        </View>
                        <View style={styles.eventMetaRow}>
                          <MapPin size={12} color={COLORS.success} />
                          <Text style={styles.eventMetaText}>{event.location}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.eventAttendCount}>{event.attending}/{event.capacity}</Text>
                        <Text style={styles.eventAttendLabel}>attending</Text>
                      </View>
                    </View>
                    <View style={styles.progressBg}>
                      <LinearGradient
                        colors={GRADIENTS.activeNav}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${pct * 100}%` as any }]}
                      />
                    </View>
                    <View style={styles.eventCardBottom}>
                      <TouchableOpacity onPress={(e: any) => { e.stopPropagation?.(); toggleRsvp(event.id); }}>
                        <Text style={[styles.rsvpdText, !event.rsvpd && { color: COLORS.primary }]}>
                          {event.rsvpd ? "✓ RSVP'd" : "RSVP"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ════ EVENTS: detail ════ */}
          {activeTab === "Events" && activeEvent && (() => {
            const event = events.find(e => e.id === activeEvent.id) ?? activeEvent;
            return (
              <View>
                <View style={styles.eventDetailImg}>
                  <Calendar size={48} color={COLORS.success} />
                </View>
                <View style={styles.eventDetailBody}>
                  <Text style={styles.eventDetailTitle}>{event.title}</Text>
                  <Text style={styles.eventDetailDesc}>{event.desc}</Text>
                  <View style={styles.eventDetailMeta}>
                    <View style={styles.eventMetaRow}>
                      <Calendar size={15} color={COLORS.primary} />
                      <Text style={styles.eventMetaText}>{event.date} · {event.time.split("–")[0].trim()}</Text>
                    </View>
                    <View style={styles.eventMetaRow}>
                      <MapPin size={15} color={COLORS.secondary} />
                      <Text style={styles.eventMetaText}>{event.location}</Text>
                    </View>
                    <View style={styles.eventMetaRow}>
                      <Users size={15} color={COLORS.success} />
                      <Text style={styles.eventMetaText}>{event.attending} / {event.capacity} attending</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.eventInfoCard}>
                  <View style={styles.eventInfoRow}>
                    <Text style={styles.eventInfoLabel}>Hosted by</Text>
                    <Text style={styles.eventInfoVal}>{event.host}</Text>
                  </View>
                  <View style={styles.eventInfoRow}>
                    <Text style={styles.eventInfoLabel}>Price</Text>
                    <Text style={styles.eventInfoVal}>{event.price}</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
                  <TouchableOpacity onPress={() => toggleRsvp(event.id)}>
                    <LinearGradient
                      colors={event.rsvpd ? [COLORS.success, COLORS.success] : GRADIENTS.activeNav}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={styles.rsvpBtn}
                    >
                      {event.rsvpd && <Check size={18} color="white" style={{ marginRight: 6 }} />}
                      <Text style={styles.rsvpBtnText}>{event.rsvpd ? "RSVP'd" : `RSVP · ${event.price}`}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}

          {/* ════ VISITORS: list ════ */}
          {activeTab === "Visitors" && !activeVisitor && (
            <View style={styles.content}>
              <TouchableOpacity style={styles.addVisitorBtn} onPress={() => setShowAddVisitor(true)}>
                <UserPlus size={18} color={COLORS.primary} />
                <Text style={[styles.addVisitorText, { color: COLORS.primary }]}>Add New Visitor</Text>
              </TouchableOpacity>
              {VISITORS.map(v => (
                <TouchableOpacity key={v.id} style={styles.visitorCard} onPress={() => setActiveVisitor(v)}>
                  <View style={styles.visitorQrIcon}><QrCode size={20} color={COLORS.primary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.visitorName}>{v.name}</Text>
                    <Text style={styles.visitorDate}>{v.date}</Text>
                  </View>
                  <View style={[styles.visitorBadge, v.status === "Expected" ? styles.visitorBadgeExpected : styles.visitorBadgeVisited]}>
                    <Text style={[styles.visitorBadgeText, v.status === "Expected" ? styles.visitorBadgeTextExpected : { color: COLORS.success }]}>
                      {v.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ════ VISITORS: detail ════ */}
          {activeTab === "Visitors" && activeVisitor && (
            <View style={styles.content}>
              <View style={styles.visitorDetailQrCard}>
                <View style={styles.visitorDetailQrBox}>
                  <QrCode size={110} color="white" />
                </View>
                <Text style={styles.visitorDetailName}>{activeVisitor.name}</Text>
                <Text style={styles.visitorDetailDate}>{activeVisitor.date}</Text>
                <View style={[
                  styles.visitorBadge, { marginTop: 8, alignSelf: "center" },
                  activeVisitor.status === "Expected" ? styles.visitorBadgeExpected : styles.visitorBadgeVisited,
                ]}>
                  <Text style={[styles.visitorBadgeText, activeVisitor.status === "Expected" ? styles.visitorBadgeTextExpected : styles.visitorBadgeTextVisited]}>
                    {activeVisitor.status}
                  </Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                {[
                  ["Visitor Name", activeVisitor.name],
                  ["Scheduled",    activeVisitor.date],
                  ["Status",       activeVisitor.status],
                  ["Access",       "Main Entrance"],
                ].map(([label, val]) => (
                  <View key={label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{label}</Text>
                    <Text style={styles.detailVal}>{val}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ════ PARCELS: list ════ */}
          {activeTab === "Parcels" && !activeParcel && (
            <View style={styles.content}>
              {PARCELS.map(p => (
                <TouchableOpacity key={p.id} style={styles.parcelCard} onPress={() => setActiveParcel(p)}>
                  <View style={[styles.parcelIcon, p.status === "Collected" && styles.parcelIconCollected]}>
                    <Package size={20} color={p.status === "Ready for pickup" ? COLORS.success : COLORS.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.parcelPkg}>{p.pkg}</Text>
                    <Text style={styles.parcelSub}>{p.courier} · {p.date}</Text>
                  </View>
                  <View style={[styles.parcelBadge, p.status === "Ready for pickup" ? styles.parcelBadgeReady : styles.parcelBadgeCollected]}>
                    <Text style={[styles.parcelBadgeText, p.status === "Ready for pickup" ? styles.parcelBadgeTextReady : styles.parcelBadgeTextCollected]}>
                      {p.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ════ PARCELS: detail ════ */}
          {activeTab === "Parcels" && activeParcel && (
            <View style={styles.content}>
              <View style={styles.parcelDetailHero}>
                <View style={[styles.parcelDetailHeroIcon, activeParcel.status === "Collected" && styles.parcelIconCollected]}>
                  <Package size={36} color={activeParcel.status === "Ready for pickup" ? COLORS.success : COLORS.mutedForeground} />
                </View>
                <Text style={styles.parcelDetailPkg}>{activeParcel.pkg}</Text>
                <View style={[
                  styles.parcelBadge,
                  activeParcel.status === "Ready for pickup" ? styles.parcelBadgeReady : styles.parcelBadgeCollected,
                  { marginTop: 6 },
                ]}>
                  <Text style={[styles.parcelBadgeText, activeParcel.status === "Ready for pickup" ? styles.parcelBadgeTextReady : styles.parcelBadgeTextCollected]}>
                    {activeParcel.status}
                  </Text>
                </View>
              </View>
              <View style={styles.detailCard}>
                {[
                  ["Courier",     activeParcel.courier],
                  ["Description", activeParcel.desc],
                  ["Weight",      activeParcel.weight],
                  ["Arrived",     activeParcel.arrivedTime],
                  ["Locker",      activeParcel.locker],
                ].map(([label, val]) => (
                  <View key={label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{label}</Text>
                    <Text style={styles.detailVal}>{val}</Text>
                  </View>
                ))}
              </View>
              {activeParcel.status === "Ready for pickup" && (
                <TouchableOpacity activeOpacity={0.85}>
                  <LinearGradient colors={[COLORS.success, COLORS.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.openLockerBtn}>
                    <Lock size={18} color="white" />
                    <Text style={styles.openLockerText}>Open Locker</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Chat input bar — shown when inside a conversation */}
        {activeTab === "Chat" && activeChat && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.msgInput}
                placeholder="Type a message..."
                placeholderTextColor="#94a3b8"
                value={msgDraft}
                onChangeText={setMsgDraft}
              />
              <TouchableOpacity onPress={sendMessage}>
                <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendBtn}>
                  <Send size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {showAddVisitor && <AddVisitorModal onClose={() => setShowAddVisitor(false)} />}
        {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} onPost={handleNewPost} />}
      </View>
    </AppLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll:    { flex: 1 },
  content:   { paddingHorizontal: 16, paddingTop: 12, gap: 10 },

  // Header
  header: {
    paddingHorizontal: 20, paddingTop: 48, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
  },
  headerTitle:    { fontSize: 22, fontWeight: "800", color: "white" },
  headerSub:      { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  headerBackRow:  { flexDirection: "row", alignItems: "center", gap: 6 },
  headerBackText: { fontSize: 16, fontWeight: "700", color: "white" },

  // Tabs
  tabBarWrapper: {
    backgroundColor: "#e2e8f0",
    marginHorizontal: 16, marginVertical: 14,
    borderRadius: 14, padding: 4, height: 46,
  },
  tabBarContent:    { gap: 4, alignItems: "center" },
  tabItem:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 11, alignItems: "center", justifyContent: "center", height: 38 },
  tabItemActive:    { backgroundColor: "white", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  tabLabel:         { fontSize: 13, fontWeight: "700" },
  tabLabelActive:   { color: "#0f172a" },
  tabLabelInactive: { color: "#94a3b8" },

  // Chat list
  contactCard: {
    backgroundColor: "white", borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  avatar:           { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarText:       { color: "white", fontWeight: "800", fontSize: 13 },
  contactInfo:      { flex: 1 },
  contactHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  contactName:      { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  contactTime:      { fontSize: 11, color: "#94a3b8" },
  lastMsg:          { fontSize: 12, color: COLORS.mutedForeground },
  unreadBadge:      { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  unreadText:       { color: "white", fontSize: 11, fontWeight: "700" },

  // Chat messages
  bubbleRow:        { flexDirection: "row", marginBottom: 4 },
  bubble:           { maxWidth: "75%", borderRadius: 18, padding: 12 },
  bubbleMine:       { borderBottomRightRadius: 4 },
  bubbleTheirs:     { backgroundColor: "white", borderBottomLeftRadius: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  bubbleTextMine:   { fontSize: 14, color: "white", lineHeight: 20 },
  bubbleTextTheirs: { fontSize: 14, color: "#0f172a", lineHeight: 20 },
  bubbleTime:       { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "white", padding: 12,
    borderTopWidth: 1, borderTopColor: "#e2e8f0",
  },
  msgInput: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  sendBtn:  { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },

  // Feed
  createPost: {
    backgroundColor: "white", borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  smallAvatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "#2248db", alignItems: "center", justifyContent: "center" },
  smallAvatarText: { color: "white", fontWeight: "800", fontSize: 11 },
  createPostInput: { flex: 1 },
  createPostPh:    { fontSize: 13, color: "#94a3b8" },
  createPostImg:   { padding: 4 },
  postCard: {
    backgroundColor: "white", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  postHeader:     { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  postAvatar:     { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  postAuthor:     { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  postTime:       { fontSize: 11, color: "#94a3b8" },
  postTag:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  postTagText:    { fontSize: 11, fontWeight: "700" },
  postTitle:      { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  postBody:       { fontSize: 13, color: "#475569", lineHeight: 20, marginBottom: 12 },
  postActions:    { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  postAction:     { flexDirection: "row", alignItems: "center", gap: 5 },
  postActionText: { fontSize: 13, color: "#94a3b8", fontWeight: "600" },

  // Events list
  eventCard:       { backgroundColor: "white", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  eventCardTop:    { flexDirection: "row", marginBottom: 12 },
  eventTitle:      { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  eventMetaRow:    { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  eventMetaText:   { fontSize: 12, color: "#64748b" },
  eventAttendCount:{ fontSize: 18, fontWeight: "800", color: "#0f172a" },
  eventAttendLabel:{ fontSize: 11, color: "#94a3b8" },
  progressBg:      { height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden", marginBottom: 10 },
  progressFill:    { height: "100%", borderRadius: 3 },
  eventCardBottom: { flexDirection: "row", justifyContent: "flex-end" },
  rsvpdText:       { fontSize: 13, fontWeight: "700", color: "#16a34a" },

  // Event detail
  eventDetailImg: {
    marginHorizontal: 16, marginTop: 4, height: 150,
    backgroundColor: "#f0fdf4", borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  eventDetailBody:  { backgroundColor: "white", marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16, marginBottom: 10 },
  eventDetailTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  eventDetailDesc:  { fontSize: 13, color: "#64748b", lineHeight: 20, marginBottom: 14 },
  eventDetailMeta:  { gap: 6 },
  eventInfoCard:    { backgroundColor: "white", marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
  eventInfoRow:     { flexDirection: "row", justifyContent: "space-between" },
  eventInfoLabel:   { fontSize: 13, color: "#94a3b8" },
  eventInfoVal:     { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  rsvpBtn:          { borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  rsvpBtnText:      { fontSize: 15, fontWeight: "700", color: "white" },

  // Visitors list
  addVisitorBtn: {
    borderWidth: 1.5, borderColor: "#2248db", borderStyle: "dashed",
    borderRadius: 14, padding: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "white",
  },
  addVisitorText:          { fontSize: 14, fontWeight: "700", color: "#2248db" },
  visitorCard:             { backgroundColor: "white", borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  visitorQrIcon:           { width: 44, height: 44, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  visitorName:             { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  visitorDate:             { fontSize: 12, color: "#64748b", marginTop: 2 },
  visitorBadge:            { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  visitorBadgeExpected:    { backgroundColor: "#eff6ff" },
  visitorBadgeVisited:     { backgroundColor: "#f1f5f9" },
  visitorBadgeText:        { fontSize: 12, fontWeight: "700" },
  visitorBadgeTextExpected:{ color: "#2248db" },
  visitorBadgeTextVisited: { color: "#94a3b8" },

  // Visitor detail
  visitorDetailQrCard: {
    backgroundColor: "white", borderRadius: 20, padding: 24,
    alignItems: "center", marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  visitorDetailQrBox: {
    width: 170, height: 170, backgroundColor: "#0f172a",
    borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  visitorDetailName: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  visitorDetailDate: { fontSize: 13, color: "#64748b", marginTop: 4 },

  // Parcels list
  parcelCard:           { backgroundColor: "white", borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  parcelIcon:           { width: 44, height: 44, borderRadius: 12, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  parcelIconCollected:  { backgroundColor: "#f1f5f9" },
  parcelPkg:            { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  parcelSub:            { fontSize: 12, color: "#64748b", marginTop: 2 },
  parcelBadge:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  parcelBadgeReady:     { backgroundColor: "#f0fdf4" },
  parcelBadgeCollected: { backgroundColor: "#f1f5f9" },
  parcelBadgeText:          { fontSize: 12, fontWeight: "700" },
  parcelBadgeTextReady:     { color: "#16a34a" },
  parcelBadgeTextCollected: { color: "#94a3b8" },

  // Parcel detail
  parcelDetailHero:     { backgroundColor: "white", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  parcelDetailHeroIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  parcelDetailPkg:      { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  openLockerBtn:        { borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  openLockerText:       { fontSize: 15, fontWeight: "700", color: "white" },

  // Shared detail card
  detailCard:  { backgroundColor: "white", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1, marginBottom: 12 },
  detailRow:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  detailLabel: { fontSize: 13, color: "#94a3b8" },
  detailVal:   { fontSize: 13, fontWeight: "700", color: "#0f172a" },

  // Modals
  overlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalSheet:   { backgroundColor: "white", borderRadius: 24, padding: 24, width: "100%", maxWidth: 400, maxHeight: "85%" },
  modalHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  modalSub:     { fontSize: 13, color: "#64748b", marginTop: 4 },
  fieldLabel:   { fontSize: 13, fontWeight: "600", color: "#0f172a", marginBottom: 6 },
  input:        { backgroundColor: "#f1f5f9", borderRadius: 12, padding: 14, fontSize: 13, color: "#0f172a", marginBottom: 14 },
  dateTimeRow:  { flexDirection: "row", gap: 10 },
  dateTimeInput:{ backgroundColor: "#f1f5f9", borderRadius: 12, padding: 14, marginBottom: 14 },
  dateTimeText: { fontSize: 13, color: "#0f172a", fontWeight: "600" },
  submitBtnGrad:{ borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  submitBtnText:{ fontSize: 15, fontWeight: "700", color: "white" },
  successIconBg:{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center" },

  // Create post modal
  tagChip:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  tagChipActive:    { backgroundColor: "#2248db", borderColor: "#2248db" },
  tagChipText:      { fontSize: 13, fontWeight: "600", color: "#64748b" },
  tagChipTextActive:{ color: "white" },
  postTextInput: {
    backgroundColor: "#f8fafc", borderRadius: 14, padding: 14,
    fontSize: 14, color: "#0f172a", minHeight: 120,
    textAlignVertical: "top", borderWidth: 1, borderColor: "#e2e8f0",
  },
});
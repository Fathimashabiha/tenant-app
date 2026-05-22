import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceService } from "../../lib/maintenanceService";
import { useNavigation } from "@react-navigation/native";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, Image, Alert, ActionSheetIOS,
} from "react-native";
import {
  ArrowLeft, Camera, Star, MapPin, MessageCircle,
  ChevronRight, CheckCircle2, Clock, Phone, Send, ThumbsUp,
  Mic, Video, Play, Pause, Trash2, Square, ImageIcon,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, FONTS, GRADIENTS } from "../../constants/Theme";
import {
  getExpoAVAudio,
  getImagePicker,
  isNativeAudioAvailable,
  isNativeCameraAvailable,
  type ExpoRecording,
  type ExpoSound,
} from "../../lib/nativeMedia";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "created" | "in_progress" | "assigned" | "completed" | "cancelled";

type Request = {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  submittedDate: string;
  status: Status;
  technician: string;
  techInitials: string;
  techCompany: string;
  techRating: number;
  techJobs: number;
  rating?: number;
  timeline: { label: string; date: string; done: boolean }[];
  chat: { id: number; text: string; mine: boolean; time: string }[];
  videoUrl?: string;
  audioUrl?: string;
  photos?: string[];
};

type ScreenView =
  | "list"
  | "create"
  | "detail"
  | "chat"
  | "complete_confirm"
  | "rate"
  | "thank_you";

// ─── Data ────────────────────────────────────────────────────────────────────

const ISSUE_TYPES = [
  "AC Not Cooling", "AC Making Noise", "Water Leak", "Pipe Burst",
  "Drain Clogged", "Light Flickering", "Power Outlet Issue",
  "Doorbell Not Working", "Door Lock Issue", "Window Crack",
  "Wall Damage", "Ceiling Leak", "Paint Peeling",
  "Pest Control", "Appliance Malfunction", "Other",
];

const PREFERRED_TIMES = ["Morning", "Afternoon", "Evening", "Any"];

const LIKE_TAGS = ["Professional", "On Time", "Clean Work", "Friendly", "Knowledgeable", "Quick Fix"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<Status, string> = {
  created:     "Created",
  in_progress: "In Progress",
  assigned:    "Assigned",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

const STATUS_COLOR: Record<Status, string> = {
  created:     COLORS.mutedForeground,
  in_progress: COLORS.secondary,
  assigned:    COLORS.primary,
  completed:   COLORS.success,
  cancelled:   COLORS.error,
};

const STATUS_BG: Record<Status, string> = {
  created:     "#f1f5f9",
  in_progress: COLORS.muted,
  assigned:    COLORS.badgeBackground,
  completed:   COLORS.badgeBackground,
  cancelled:   "#fef2f2",
};

function StarRow({ rating, onRate, size = 22 }: { rating: number; onRate?: (n: number) => void; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onRate?.(n)} disabled={!onRate}>
          <Star
            size={size}
            color={COLORS.success}
            fill={n <= rating ? COLORS.success : "none"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Sub-Headers ─────────────────────────────────────────────────────────────

function SubHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <LinearGradient
      colors={GRADIENTS.activeNav}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientHeader}
    >
      <View style={styles.gradientHeaderRow}>
        <TouchableOpacity onPress={onBack} style={styles.subHeaderBack}>
          <ArrowLeft size={18} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.gradientHeaderTitle}>{title}</Text>
          {subtitle && <Text style={styles.gradientHeaderSub}>{subtitle}</Text>}
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function Maintenance() {
  const queryClient = useQueryClient();
  const TENANT_ID = "default-tenant-uuid";

  const { data: serverRequests = [], isLoading } = useQuery({
    queryKey: ["maintenance", TENANT_ID],
    queryFn: () => maintenanceService.getRequests(TENANT_ID),
  });

  const allActive = useMemo(() => {
    return serverRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').map(r => {
      const statusVal = (r.status === 'open' ? 'in_progress' : r.status) as Status;
      return {
        id: r.id,
        title: r.title,
        category: r.category,
        description: r.description,
        location: "Door 1204, 12th, Tower A, Marina Heights",
        submittedDate: new Date(r.createdAt).toLocaleDateString(),
        status: statusVal,
        technician: r.technicianName || "TBD",
        techInitials: r.technicianName ? r.technicianName.substring(0, 2).toUpperCase() : "?",
        techCompany: "Pending",
        techRating: 0,
        techJobs: 0,
        timeline: [
          { label: "Request Submitted", date: new Date(r.createdAt).toLocaleDateString(), done: true },
          { 
            label: "Technician Assigned", 
            date: (statusVal === 'assigned' || statusVal === 'in_progress' || statusVal === 'completed') 
              ? (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Done') 
              : 'Pending', 
            done: (statusVal === 'assigned' || statusVal === 'in_progress' || statusVal === 'completed') 
          },
          { 
            label: "In Progress", 
            date: (statusVal === 'in_progress' || statusVal === 'completed') 
              ? (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Done') 
              : 'Pending', 
            done: (statusVal === 'in_progress' || statusVal === 'completed') 
          },
          { 
            label: "Completed", 
            date: statusVal === 'completed' 
              ? (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Done') 
              : 'Pending', 
            done: statusVal === 'completed' 
          },
        ],
        chat: [],
        videoUrl: r.videoUrl,
        audioUrl: r.audioUrl,
        photos: r.photos?.map((p: any) => p.photoUrl) || [],
      };
    }) as Request[];
  }, [serverRequests]);

  const allHistory = useMemo(() => {
    return serverRequests.filter(r => r.status === 'completed' || r.status === 'cancelled').map(r => {
      const statusVal = r.status as Status;
      return {
        id: r.id,
        title: r.title,
        category: r.category,
        description: r.description,
        location: "Door 1204, 12th, Tower A, Marina Heights",
        submittedDate: new Date(r.createdAt).toLocaleDateString(),
        status: statusVal,
        technician: r.technicianName || "TBD",
        techInitials: r.technicianName ? r.technicianName.substring(0, 2).toUpperCase() : "?",
        techCompany: "Pending",
        techRating: 0,
        techJobs: 0,
        timeline: [
          { label: "Request Submitted", date: new Date(r.createdAt).toLocaleDateString(), done: true },
          { 
            label: "Technician Assigned", 
            date: (statusVal === 'assigned' || statusVal === 'in_progress' || statusVal === 'completed') 
              ? (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Done') 
              : 'Pending', 
            done: (statusVal === 'assigned' || statusVal === 'in_progress' || statusVal === 'completed') 
          },
          { 
            label: "In Progress", 
            date: (statusVal === 'in_progress' || statusVal === 'completed') 
              ? (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Done') 
              : 'Pending', 
            done: (statusVal === 'in_progress' || statusVal === 'completed') 
          },
          { 
            label: "Completed", 
            date: statusVal === 'completed' 
              ? (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Done') 
              : 'Pending', 
            done: statusVal === 'completed' 
          },
        ],
        chat: [],
        videoUrl: r.videoUrl,
        audioUrl: r.audioUrl,
        photos: r.photos?.map((p: any) => p.photoUrl) || [],
      };
    }) as Request[];
  }, [serverRequests]);

  const [view, setView]                   = useState<ScreenView>("list");
  const [tab, setTab]                     = useState<"active" | "history">("active");
  const [selectedReq, setSelectedReq]     = useState<Request | null>(null);

  // Create form
  const [issueType, setIssueType]         = useState("");
  const [showIssueDrop, setShowIssueDrop] = useState(false);
  const [description, setDescription]    = useState("");
  const [prefTime, setPrefTime]           = useState("Any");

  // ─── Media capture states ─────────────────────────────────────────────────
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [capturedVideo, setCapturedVideo]   = useState<{ uri: string; name: string } | null>(null);
  const [capturedAudio, setCapturedAudio]   = useState<{ uri: string; durationSec: number } | null>(null);

  // Native audio recording/playback refs (expo-av)
  const recordingRef = useRef<ExpoRecording | null>(null);
  const soundRef     = useRef<ExpoSound | null>(null);
  const detailSoundRef = useRef<ExpoSound | null>(null);

  // Recording UI states
  const [isRecordingAudio, setIsRecordingAudio]   = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingIntervalId, setRecordingIntervalId] = useState<any>(null);

  // Playback UI states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaySeconds, setAudioPlaySeconds] = useState(0);
  const [playbackIntervalId, setPlaybackIntervalId] = useState<any>(null);

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => {
      if (isNativeAudioAvailable()) {
        if (recordingRef.current) {
          recordingRef.current.stopAndUnloadAsync().catch(() => {});
        }
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch(() => {});
        }
        if (detailSoundRef.current) {
          detailSoundRef.current.unloadAsync().catch(() => {});
        }
      }
    };
  }, []);

  // ─── Photo: real camera capture ───────────────────────────────────────────
  const handleTakePhotoNative = async () => {
    const ImagePicker = getImagePicker();
    if (!ImagePicker) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera access to capture photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      setCapturedPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  // ─── Photo: pick from gallery ─────────────────────────────────────────────
  const handlePickFromGalleryNative = async () => {
    const ImagePicker = getImagePicker();
    if (!ImagePicker) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    if (!result.canceled && result.assets.length > 0) {
      setCapturedPhotos(prev => [
        ...prev,
        ...result.assets.map((a: any) => a.uri),
      ]);
    }
  };

  // Show Camera / Gallery action sheet
  const handleAddPhoto = () => {
    if (!isNativeCameraAvailable()) {
      // Fallback
      let mockPhoto = "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80"; // default
      const category = (issueType || "").toLowerCase();
      if (category.includes("ac") || category.includes("cooling")) {
        mockPhoto = "https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=400&q=80";
      } else if (category.includes("leak") || category.includes("water") || category.includes("pipe") || category.includes("clogged") || category.includes("burst")) {
        mockPhoto = "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80";
      } else if (category.includes("light") || category.includes("power") || category.includes("outlet") || category.includes("wire") || category.includes("flicker")) {
        mockPhoto = "https://images.unsplash.com/photo-1558244661-d248897f7bc4?auto=format&fit=crop&w=400&q=80";
      } else if (category.includes("lock") || category.includes("door") || category.includes("window")) {
        mockPhoto = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80";
      } else if (category.includes("pest")) {
        mockPhoto = "https://images.unsplash.com/photo-1587334206574-35113a8525b8?auto=format&fit=crop&w=400&q=80";
      } else if (category.includes("wall") || category.includes("paint") || category.includes("ceiling")) {
        mockPhoto = "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80";
      }
      setCapturedPhotos(prev => [...prev, mockPhoto]);
      Alert.alert("Sandbox Mode", "Native Camera not linked. Running in Sandbox/Simulator Mode.");
      return;
    }

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Gallery"],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) handleTakePhotoNative();
          else if (idx === 2) handlePickFromGalleryNative();
        }
      );
    } else {
      Alert.alert("Add Photo", "Choose an option", [
        { text: "Camera", onPress: handleTakePhotoNative },
        { text: "Gallery", onPress: handlePickFromGalleryNative },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setCapturedPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ─── Video: real camera recording ─────────────────────────────────────────
  const handleAddVideo = async () => {
    if (capturedVideo) {
      setCapturedVideo(null);
      return;
    }
    if (!isNativeCameraAvailable()) {
      setCapturedVideo({
        uri: "https://assets.mixkit.co/videos/preview/mixkit-plumber-screwing-a-pipe-under-the-sink-44026-large.mp4",
        name: "simulated_issue_video.mp4",
      });
      Alert.alert("Sandbox Mode", "Native Video Camera not linked. Running in Sandbox/Simulator Mode.");
      return;
    }
    const ImagePicker = getImagePicker();
    if (!ImagePicker) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera access to record video.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["videos"],
      videoMaxDuration: 60,
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setCapturedVideo({
        uri: asset.uri,
        name: asset.fileName || "video_note.mp4",
      });
    }
  };

  // ─── Audio: real microphone recording ────────────────────────────────────
  const startRecordingAudio = async () => {
    if (isRecordingAudio) return;
    if (!isNativeAudioAvailable()) {
      // Fallback recording state machine
      setIsRecordingAudio(true);
      setRecordingDuration(0);
      if (playbackIntervalId) { clearInterval(playbackIntervalId); setPlaybackIntervalId(null); }
      setIsPlayingAudio(false);
      setAudioPlaySeconds(0);
      const interval = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) {
            clearInterval(interval);
            stopRecordingAudio();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
      setRecordingIntervalId(interval);
      Alert.alert("Sandbox Mode", "Native Microphone not linked. Running in Sandbox/Simulator Mode.");
      return;
    }

    const Audio = getExpoAVAudio();
    if (!Audio) return;

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow microphone access to record voice notes.");
        return;
      }
      // Stop any active playback
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      if (playbackIntervalId) { clearInterval(playbackIntervalId); setPlaybackIntervalId(null); }
      setIsPlayingAudio(false);
      setAudioPlaySeconds(0);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecordingAudio(true);
      setRecordingDuration(0);

      const interval = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) {
            clearInterval(interval);
            stopRecordingAudio();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
      setRecordingIntervalId(interval);
    } catch (err) {
      console.error("Recording start error:", err);
      Alert.alert("Error", "Could not start recording. Please try again.");
    }
  };

  const stopRecordingAudio = async () => {
    if (recordingIntervalId) { clearInterval(recordingIntervalId); setRecordingIntervalId(null); }
    setIsRecordingAudio(false);

    if (!isNativeAudioAvailable()) {
      const finalDuration = recordingDuration > 0 ? recordingDuration : 3;
      setCapturedAudio({
        uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        durationSec: finalDuration
      });
      return;
    }

    if (!recordingRef.current) return;
    const Audio = getExpoAVAudio();
    if (!Audio) return;
    try {
      const status = await recordingRef.current.getStatusAsync();
      const durationMs = status.durationMillis ?? 0;
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) {
        setCapturedAudio({
          uri,
          durationSec: Math.max(1, Math.floor(durationMs / 1000)),
        });
      }
    } catch (err) {
      console.error("Recording stop error:", err);
      recordingRef.current = null;
    }
  };

  const cancelRecordingAudio = async () => {
    if (recordingIntervalId) { clearInterval(recordingIntervalId); setRecordingIntervalId(null); }
    setIsRecordingAudio(false);
    setRecordingDuration(0);

    if (!isNativeAudioAvailable()) return;

    if (recordingRef.current) {
      try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
      recordingRef.current = null;
    }
    const Audio = getExpoAVAudio();
    if (Audio) {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    }
  };

  const deleteCapturedAudio = async () => {
    if (playbackIntervalId) { clearInterval(playbackIntervalId); setPlaybackIntervalId(null); }
    setIsPlayingAudio(false);
    setAudioPlaySeconds(0);
    setCapturedAudio(null);

    if (!isNativeAudioAvailable()) return;

    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }
  };

  // ─── Audio: playback ─────────────────────────────────────────────────
  const togglePlayAudio = async () => {
    if (!capturedAudio) return;

    if (!isNativeAudioAvailable()) {
      // Fallback playback timer
      if (isPlayingAudio) {
        if (playbackIntervalId) { clearInterval(playbackIntervalId); setPlaybackIntervalId(null); }
        setIsPlayingAudio(false);
      } else {
        setIsPlayingAudio(true);
        const interval = setInterval(() => {
          setAudioPlaySeconds(prev => {
            if (prev >= capturedAudio.durationSec) {
              clearInterval(interval);
              setIsPlayingAudio(false);
              setPlaybackIntervalId(null);
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
        setPlaybackIntervalId(interval);
      }
      return;
    }

    const Audio = getExpoAVAudio();
    if (!Audio) return;

    try {
      if (isPlayingAudio) {
        if (soundRef.current) await soundRef.current.pauseAsync().catch(() => {});
        if (playbackIntervalId) { clearInterval(playbackIntervalId); setPlaybackIntervalId(null); }
        setIsPlayingAudio(false);
      } else {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        if (!soundRef.current) {
          const { sound } = await Audio.Sound.createAsync({ uri: capturedAudio.uri });
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((s: any) => {
            if (s.isLoaded && s.didJustFinish) {
              setIsPlayingAudio(false);
              setAudioPlaySeconds(0);
              soundRef.current = null;
            }
          });
        }
        await soundRef.current!.playAsync();
        setIsPlayingAudio(true);
        const interval = setInterval(() => {
          setAudioPlaySeconds(prev => {
            if (prev >= capturedAudio.durationSec) {
              clearInterval(interval);
              setIsPlayingAudio(false);
              setPlaybackIntervalId(null);
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
        setPlaybackIntervalId(interval);
      }
    } catch (err) {
      console.error("Playback error:", err);
      Alert.alert("Error", "Could not play the audio note.");
    }
  };

  // Detail Audio Playback states
  const [isDetailPlayingAudio, setIsDetailPlayingAudio] = useState(false);
  const [detailAudioPlaySeconds, setDetailAudioPlaySeconds] = useState(0);
  const [detailPlaybackIntervalId, setDetailPlaybackIntervalId] = useState<any>(null);

  const togglePlayDetailAudio = async (url: string | undefined) => {
    if (!url) return;

    if (!isNativeAudioAvailable()) {
      // Fallback playback timer for Detail View
      if (isDetailPlayingAudio) {
        if (detailPlaybackIntervalId) {
          clearInterval(detailPlaybackIntervalId);
          setDetailPlaybackIntervalId(null);
        }
        setIsDetailPlayingAudio(false);
      } else {
        setIsDetailPlayingAudio(true);
        const interval = setInterval(() => {
          setDetailAudioPlaySeconds(prev => {
            if (prev >= 10) { // Default 10 seconds mock duration
              clearInterval(interval);
              setIsDetailPlayingAudio(false);
              setDetailPlaybackIntervalId(null);
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
        setDetailPlaybackIntervalId(interval);
      }
      return;
    }

    const Audio = getExpoAVAudio();
    if (!Audio) return;

    try {
      if (isDetailPlayingAudio) {
        if (detailSoundRef.current) {
          await detailSoundRef.current.pauseAsync().catch(() => {});
        }
        if (detailPlaybackIntervalId) {
          clearInterval(detailPlaybackIntervalId);
          setDetailPlaybackIntervalId(null);
        }
        setIsDetailPlayingAudio(false);
      } else {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        if (!detailSoundRef.current) {
          const { sound } = await Audio.Sound.createAsync({ uri: url });
          detailSoundRef.current = sound;
          
          const status = await sound.getStatusAsync();
          const totalSec = status.isLoaded && status.durationMillis ? Math.ceil(status.durationMillis / 1000) : 5;
          
          sound.setOnPlaybackStatusUpdate((s: any) => {
            if (s.isLoaded && s.didJustFinish) {
              setIsDetailPlayingAudio(false);
              setDetailAudioPlaySeconds(0);
              detailSoundRef.current = null;
            }
          });
          
          await sound.playAsync();
          setIsDetailPlayingAudio(true);
          setDetailAudioPlaySeconds(0);
          
          const interval = setInterval(() => {
            setDetailAudioPlaySeconds(prev => {
              if (prev >= totalSec) {
                clearInterval(interval);
                setIsDetailPlayingAudio(false);
                setDetailPlaybackIntervalId(null);
                return 0;
              }
              return prev + 1;
            });
          }, 1000);
          setDetailPlaybackIntervalId(interval);
        } else {
          await detailSoundRef.current.playAsync();
          setIsDetailPlayingAudio(true);
          const status = await detailSoundRef.current.getStatusAsync();
          const totalSec = status.isLoaded && status.durationMillis ? Math.ceil(status.durationMillis / 1000) : 5;
          const interval = setInterval(() => {
            setDetailAudioPlaySeconds(prev => {
              if (prev >= totalSec) {
                clearInterval(interval);
                setIsDetailPlayingAudio(false);
                setDetailPlaybackIntervalId(null);
                return 0;
              }
              return prev + 1;
            });
          }, 1000);
          setDetailPlaybackIntervalId(interval);
        }
      }
    } catch (err) {
      console.error("Detail playback error:", err);
      Alert.alert("Error", "Could not play the audio attachment.");
    }
  };

  // Rate
  const [starRating, setStarRating]       = useState(0);
  const [selectedTags, setSelectedTags]   = useState<string[]>([]);

  // Chat
  const [chatDraft, setChatDraft]         = useState("");
  const [chatMessages, setChatMessages]   = useState<Record<string, Request["chat"]>>({});

  const goDetail = (req: Request) => { setSelectedReq(req); setView("detail"); };
  const goList   = () => {
    setSelectedReq(null);
    setView("list");
    setIsDetailPlayingAudio(false);
    setDetailAudioPlaySeconds(0);
    if (detailPlaybackIntervalId) {
      clearInterval(detailPlaybackIntervalId);
      setDetailPlaybackIntervalId(null);
    }
    if (detailSoundRef.current) {
      detailSoundRef.current.unloadAsync().catch(() => {});
      detailSoundRef.current = null;
    }
  };

  const sendChat = () => {
    if (!chatDraft.trim() || !selectedReq) return;
    setChatMessages(prev => ({
      ...prev,
      [selectedReq.id]: [...(prev[selectedReq.id] ?? []), { id: Date.now(), text: chatDraft.trim(), mine: true, time: "Now" }],
    }));
    setChatDraft("");
  };

  const createMutation = useMutation({
    mutationFn: (payload: any) => maintenanceService.createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setIssueType(""); setDescription(""); setPrefTime("Any");
      // Clear media states
      setCapturedPhotos([]);
      setCapturedVideo(null);
      setCapturedAudio(null);
      setIsRecordingAudio(false);
      setRecordingDuration(0);
      setIsPlayingAudio(false);
      setAudioPlaySeconds(0);
      if (recordingIntervalId) clearInterval(recordingIntervalId);
      if (playbackIntervalId) clearInterval(playbackIntervalId);
      setRecordingIntervalId(null);
      setPlaybackIntervalId(null);
      // Release native audio resources safely
      if (isNativeAudioAvailable()) {
        if (soundRef.current) { soundRef.current.unloadAsync().catch(() => {}); soundRef.current = null; }
        if (recordingRef.current) { recordingRef.current.stopAndUnloadAsync().catch(() => {}); recordingRef.current = null; }
      }
      setView("list");
    }
  });

  const handleSubmitRequest = () => {
    createMutation.mutate({
      tenantId: TENANT_ID,
      title: issueType || "New Request",
      description,
      category: issueType.split(" ")[0] || "General",
      priority: "medium",
      photos: capturedPhotos,
      videoUrl: capturedVideo ? capturedVideo.uri : undefined,
      audioUrl: capturedAudio ? capturedAudio.uri : undefined,
    });
  };

  const handleMarkComplete = () => setView("complete_confirm");

  const handleConfirmComplete = (resolved: boolean) => {
    if (resolved && selectedReq) {
      setView("rate");
    } else {
      setView("detail");
    }
  };

  const handleSubmitRating = () => setView("thank_you");

  const navigation = useNavigation<any>();

  // ── Render: List ──────────────────────────────────────────────────────────
  if (view === "list") {
    const activeCount  = allActive.length;
    const historyCount = allHistory.length;
    return (
      <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={GRADIENTS.activeNav}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.gradientHeaderRow}>
              <View style={styles.gradientHeaderLeft}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.subHeaderBack}>
                  <ArrowLeft size={18} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.gradientHeaderTitle}>Maintenance</Text>
                  <Text style={styles.gradientHeaderSub}>Track & manage requests</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.newBtn} onPress={() => setView("create")}>
                <Text style={styles.newBtnText}>+ New</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Tab Bar */}
          <View style={styles.tabRow}>
            {(["active", "history"] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === "active" ? `Active (${activeCount})` : `History (${historyCount})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {tab === "active" ? (
              allActive.length === 0 ? (
                <View style={styles.empty}><Text style={styles.emptyText}>No active requests</Text></View>
              ) : (
                allActive.map(req => (
                  <TouchableOpacity key={req.id} style={styles.reqCard} onPress={() => goDetail(req)}>
                    <View style={styles.reqCardTop}>
                      <Text style={[styles.reqId, { color: COLORS.primary }]}>{req.id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[req.status] }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLOR[req.status] }]}>
                          {STATUS_LABEL[req.status]}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reqTitle}>{req.title}</Text>
                    <Text style={styles.reqMeta}>{req.category} · {req.submittedDate}</Text>
                    <View style={styles.reqCardBottom}>
                      <View style={styles.techSmallRow}>
                        <View style={styles.techSmallAvatar}>
                          <Text style={styles.techSmallInitials}>{req.techInitials}</Text>
                        </View>
                        <Text style={styles.techSmallName}>{req.technician}</Text>
                      </View>
                      <ChevronRight size={14} color="#94a3b8" />
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : (
              allHistory.length === 0 ? (
                <View style={styles.empty}><Text style={styles.emptyText}>No past requests</Text></View>
              ) : (
                allHistory.map(req => (
                  <TouchableOpacity key={req.id} style={styles.reqCard} onPress={() => goDetail(req)}>
                    <View style={styles.reqCardTop}>
                      <Text style={[styles.reqId, { color: COLORS.primary }]}>{req.id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[req.status] }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLOR[req.status] }]}>
                          {STATUS_LABEL[req.status]}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reqTitle}>{req.title}</Text>
                    <Text style={styles.reqMeta}>{req.category} · {req.submittedDate}</Text>
                    <View style={styles.reqCardBottom}>
                      <View style={styles.techSmallRow}>
                        <View style={styles.techSmallAvatar}>
                          <Text style={styles.techSmallInitials}>{req.techInitials}</Text>
                        </View>
                        <Text style={styles.techSmallName}>{req.technician}</Text>
                      </View>
                      {req.rating !== undefined && (
                         <View style={{ flexDirection: "row", gap: 2 }}>
                           {[1,2,3,4,5].map(n => (
                             <Star key={n} size={12} color={COLORS.success} fill={n <= req.rating! ? COLORS.success : "none"} />
                           ))}
                         </View>
                      )}
                      <ChevronRight size={14} color="#94a3b8" />
                    </View>
                  </TouchableOpacity>
                ))
              )
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
    );
  }

  // ── Render: Create ────────────────────────────────────────────────────────
  if (view === "create") {
    return (
      <View style={styles.container}>
          <SubHeader title="New Request" onBack={goList} />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Issue / Complaint */}
            <Text style={styles.formLabel}>Issue / Complaint</Text>
            <TouchableOpacity
              style={[styles.selectInput, showIssueDrop && styles.selectInputActive]}
              onPress={() => setShowIssueDrop(!showIssueDrop)}
            >
              <Text style={[styles.selectText, issueType ? styles.selectTextFilled : styles.selectTextPh]}>
                {issueType || "Select an issue type..."}
              </Text>
            </TouchableOpacity>
            {showIssueDrop && (
              <View style={styles.dropList}>
                <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled>
                  <TouchableOpacity
                    style={[styles.dropItem, !issueType && styles.dropItemActive]}
                    onPress={() => { setIssueType(""); setShowIssueDrop(false); }}
                  >
                    <Text style={[styles.dropItemText, !issueType && styles.dropItemTextActive]}>Select an issue type...</Text>
                  </TouchableOpacity>
                  {ISSUE_TYPES.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.dropItem, issueType === opt && styles.dropItemActive]}
                      onPress={() => { setIssueType(opt); setShowIssueDrop(false); }}
                    >
                      <Text style={[styles.dropItemText, issueType === opt && styles.dropItemTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Location Details */}
            <Text style={styles.formLabel}>Location Details</Text>
            <View style={styles.locationGrid}>
              {[["1204", "Unit"], ["12th Floor", "Floor"], ["Tower A", "Tower"], ["Marina Heights", "Building"]].map(([val, ph]) => (
                <View key={ph} style={styles.locationInput}>
                  <Text style={styles.locationInputText}>{val}</Text>
                </View>
              ))}
            </View>
            <View style={styles.input}>
              <Text style={styles.inputText}>Dubai Marina, Dubai, UAE</Text>
            </View>

            {/* Description */}
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the issue in detail..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            {/* Media Attachments Section */}
            <Text style={styles.formLabel}>Media Attachments</Text>
            
            {/* Active Previews Container */}
            <View style={styles.mediaPreviewContainer}>
              {/* Photo Previews (Horizontal Scroll) */}
              {capturedPhotos.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.mediaSubLabel}>Photos ({capturedPhotos.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    {capturedPhotos.map((uri, idx) => (
                      <View key={idx} style={styles.previewImageContainer}>
                        <Image source={{ uri }} style={styles.previewImage} />
                        <TouchableOpacity style={styles.removeMediaBtn} onPress={() => handleRemovePhoto(idx)}>
                          <Trash2 size={12} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Video Preview */}
              {capturedVideo && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.mediaSubLabel}>Video Attachment</Text>
                  <View style={styles.videoPreviewCard}>
                    <LinearGradient
                      colors={["rgba(13, 148, 136, 0.9)", "rgba(15, 118, 110, 0.9)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.videoPreviewGradient}
                    >
                      <View style={styles.videoIconBg}>
                        <Video size={20} color="white" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.videoTitle}>{capturedVideo.name}</Text>
                        <Text style={styles.videoSubtitle}>Recorded Video Note</Text>
                      </View>
                      <TouchableOpacity style={styles.removeMediaBtnInline} onPress={() => setCapturedVideo(null)}>
                        <Trash2 size={16} color="white" />
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                </View>
              )}

              {/* Voice Note Section */}
              {isRecordingAudio && (
                <View style={styles.audioCaptureCard}>
                  <View style={styles.pulseContainer}>
                    <View style={styles.recordBtn}>
                      <Mic size={18} color="white" />
                    </View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.audioTitle}>Recording Voice Note...</Text>
                    <Text style={styles.audioSubtitle}>
                      {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')} / 1:00
                    </Text>
                    {/* Simulated Waveform Visualizer */}
                    <View style={styles.waveformContainer}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((_, i) => {
                        const randomHeight = Math.floor(Math.sin((recordingDuration * 10 + i) * 0.5) * 10) + 12;
                        return (
                          <View
                            key={i}
                            style={[
                              styles.waveformBarActive,
                              { height: Math.max(4, randomHeight) }
                            ]}
                          />
                        );
                      })}
                    </View>
                  </View>
                  <View style={styles.audioActions}>
                    <TouchableOpacity style={styles.audioActionCircleCancel} onPress={cancelRecordingAudio}>
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.audioActionCircleStop} onPress={stopRecordingAudio}>
                      <Square size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {capturedAudio && !isRecordingAudio && (
                <View style={styles.audioPlayerCard}>
                  <TouchableOpacity style={styles.audioPlayBtn} onPress={togglePlayAudio}>
                    {isPlayingAudio ? (
                      <Pause size={16} color="white" />
                    ) : (
                      <Play size={16} color="white" style={{ marginLeft: 2 }} />
                    )}
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.audioTitle}>Voice Note Attachment</Text>
                    <Text style={styles.audioSubtitle}>
                      {isPlayingAudio 
                        ? `${Math.floor(audioPlaySeconds / 60)}:${(audioPlaySeconds % 60).toString().padStart(2, '0')}`
                        : `0:00`
                      } / {Math.floor(capturedAudio.durationSec / 60)}:{(capturedAudio.durationSec % 60).toString().padStart(2, '0')}
                    </Text>
                    {/* Audio Waveform Player */}
                    <View style={styles.waveformContainer}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((_, i) => {
                        const isPlayed = isPlayingAudio && (i / 20) * capturedAudio.durationSec <= audioPlaySeconds;
                        return (
                          <View
                            key={i}
                            style={[
                              isPlayed ? styles.waveformBarActive : styles.waveformBarInactive,
                              { height: 8 + (i % 3) * 4 }
                            ]}
                          />
                        );
                      })}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.removeMediaBtnInlineAudio} onPress={deleteCapturedAudio}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Media Action Row */}
            <View style={styles.mediaActionRow}>
              <TouchableOpacity style={styles.mediaActionButton} onPress={handleAddPhoto}>
                <Camera size={14} color={COLORS.primary} />
                <Text style={styles.mediaActionButtonText}>+ Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mediaActionButton, capturedVideo ? styles.mediaActionButtonActive : null]} 
                onPress={handleAddVideo}
              >
                <Video size={14} color={capturedVideo ? "white" : COLORS.primary} />
                <Text style={[styles.mediaActionButtonText, capturedVideo ? { color: "white" } : null]}>
                  {capturedVideo ? "Video added" : "+ Video"}
                </Text>
              </TouchableOpacity>

              {!capturedAudio && !isRecordingAudio && (
                <TouchableOpacity style={styles.mediaActionButton} onPress={startRecordingAudio}>
                  <Mic size={14} color={COLORS.primary} />
                  <Text style={styles.mediaActionButtonText}>+ Voice</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Preferred Time */}
            <Text style={styles.formLabel}>Preferred Time</Text>
            <View style={styles.prefTimeRow}>
              {PREFERRED_TIMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.prefTimeChip, prefTime === t && styles.prefTimeChipActive]}
                  onPress={() => setPrefTime(t)}
                >
                  <Text style={[styles.prefTimeText, prefTime === t && styles.prefTimeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRequest}>
              <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
                <Send size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Submit Request</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
    );
  }

  // ── Render: Detail ────────────────────────────────────────────────────────
  if (view === "detail" && selectedReq) {
    const req = selectedReq;
    const isActive = req.status === "in_progress" || req.status === "assigned" || req.status === "created";
    const isAssignedOrInProgress = req.status === "in_progress" || req.status === "assigned";
    return (
      <View style={styles.container}>
          <SubHeader title={req.id} onBack={goList} />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

            {/* Info Card */}
            <View style={styles.card}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[req.status], alignSelf: "flex-start", marginBottom: 10 }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[req.status] }]}>{STATUS_LABEL[req.status]}</Text>
              </View>
              <Text style={styles.detailTitle}>{req.title}</Text>
              <Text style={styles.detailDesc}>{req.description}</Text>
              <View style={styles.detailMetaRow}>
                <MapPin size={13} color="#64748b" />
                <Text style={styles.detailMetaText}>{req.location}</Text>
              </View>
              <View style={styles.detailMetaRow}>
                <Clock size={13} color="#64748b" />
                <Text style={styles.detailMetaText}>Submitted: {req.submittedDate}</Text>
              </View>
            </View>

            {/* Detail Media Attachments Card */}
            {((req.photos && req.photos.length > 0) || req.videoUrl || req.audioUrl) && (
              <View style={styles.card}>
                <Text style={styles.cardSectionLabel}>Attached Media</Text>
                
                {/* Photos horizontal gallery */}
                {req.photos && req.photos.length > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.mediaSubLabel, { marginBottom: 6 }]}>Photos ({req.photos.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                      {req.photos.map((uri, idx) => (
                        <View key={idx} style={styles.previewImageContainer}>
                          <Image source={{ uri }} style={styles.previewImage} />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                 {/* Video */}
                {req.videoUrl && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[styles.mediaSubLabel, { marginBottom: 6 }]}>Video Attachment</Text>
                    <View style={styles.videoPreviewCard}>
                      <LinearGradient
                        colors={["rgba(13, 148, 136, 0.9)", "rgba(15, 118, 110, 0.9)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.videoPreviewGradient}
                      >
                        <View style={styles.videoIconBg}>
                          <Video size={20} color="white" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.videoTitle}>{req.videoUrl.split('/').pop() || "attached_video_note.mp4"}</Text>
                          <Text style={styles.videoSubtitle}>Recorded Video Note</Text>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                )}

                {/* Audio */}
                {req.audioUrl && (
                  <View>
                    <Text style={[styles.mediaSubLabel, { marginBottom: 6 }]}>Voice Note Attachment</Text>
                    <View style={styles.audioPlayerCard}>
                      <TouchableOpacity style={styles.audioPlayBtn} onPress={() => togglePlayDetailAudio(req.audioUrl)}>
                        {isDetailPlayingAudio ? (
                          <Pause size={16} color="white" />
                        ) : (
                          <Play size={16} color="white" style={{ marginLeft: 2 }} />
                        )}
                      </TouchableOpacity>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.audioTitle}>Voice Note</Text>
                        <Text style={styles.audioSubtitle}>
                          {isDetailPlayingAudio 
                            ? `${Math.floor(detailAudioPlaySeconds / 60)}:${(detailAudioPlaySeconds % 60).toString().padStart(2, '0')}`
                            : `0:00`
                          } / Voice Recording
                        </Text>
                        {/* Audio Waveform Player */}
                        <View style={styles.waveformContainer}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((_, i) => {
                            const isPlayed = isDetailPlayingAudio && (i / 20) * 10 <= detailAudioPlaySeconds;
                            return (
                              <View
                                key={i}
                                style={[
                                  isPlayed ? styles.waveformBarActive : styles.waveformBarInactive,
                                  { height: 8 + (i % 3) * 4 }
                                ]}
                              />
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Technician Card */}
            {req.status === "created" ? (
              <View style={styles.card}>
                <Text style={styles.cardSectionLabel}>Assigned Technician</Text>
                <View style={{ paddingVertical: 16, alignItems: "center", gap: 8 }}>
                  <Clock size={28} color={COLORS.mutedForeground} />
                  <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.foreground }}>Assignment Pending</Text>
                  <Text style={{ fontSize: 12, color: COLORS.mutedForeground, textAlign: "center", paddingHorizontal: 16 }}>
                    We are currently matching a professional technician to your request. You will be notified once assigned.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardSectionLabel}>Assigned Technician</Text>
                <View style={styles.techRow}>
                  <View style={styles.techAvatar}>
                    <Text style={styles.techAvatarText}>{req.techInitials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.techName}>{req.technician}</Text>
                    <Text style={styles.techCompany}>{req.techCompany}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
                      <Text style={styles.techRatingText}>{req.techRating} · {req.techJobs} jobs</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setView("chat")}>
                    <MessageCircle size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn}>
                    <Phone size={18} color={COLORS.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Timeline Card */}
            <View style={styles.card}>
              <Text style={styles.cardSectionLabel}>Progress Timeline</Text>
              {req.timeline.map((step, i) => (
                <View key={i} style={styles.timelineRow}>
                  <View style={[styles.timelineDot, step.done ? styles.timelineDotDone : styles.timelineDotPending]}>
                    {step.done
                      ? <CheckCircle2 size={18} color={COLORS.success} />
                      : <Clock size={18} color={COLORS.mutedForeground} />
                    }
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.timelineLabel, !step.done && { color: "#94a3b8" }]}>{step.label}</Text>
                    <Text style={styles.timelineDate}>{step.date}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Chat with Technician link */}
            {isAssignedOrInProgress && (
              <TouchableOpacity style={styles.chatLink} onPress={() => setView("chat")}>
                <MessageCircle size={16} color={COLORS.secondary} />
                <Text style={[styles.chatLinkText, { color: COLORS.secondary }]}>Chat with Technician</Text>
              </TouchableOpacity>
            )}

            {/* Mark as Complete */}
            {isAssignedOrInProgress && (
              <TouchableOpacity style={styles.completeBtn} onPress={handleMarkComplete}>
                <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.completeBtnGrad}>
                  <CheckCircle2 size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.completeBtnText}>Mark as Complete</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
    );
  }

  // ── Render: Chat ─────────────────────────────────────────────────────────
  if (view === "chat" && selectedReq) {
    const msgs = chatMessages[selectedReq.id] ?? [];
    return (
      <View style={styles.container}>
          <SubHeader title={`Chat — ${selectedReq.technician.split(" ")[0]}`} onBack={() => setView("detail")} />

          {/* Tech info banner */}
          <View style={styles.chatTechBanner}>
            <View style={styles.techAvatar}>
              <Text style={styles.techAvatarText}>{selectedReq.techInitials}</Text>
            </View>
            <View>
              <Text style={styles.techName}>{selectedReq.technician}</Text>
              <Text style={styles.techCompany}>{selectedReq.techCompany}</Text>
            </View>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
            {msgs.map(m => (
              <View key={m.id} style={[styles.bubbleRow, m.mine && { justifyContent: "flex-end" }]}>
                {m.mine ? (
                  <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.bubble, styles.bubbleMine]}>
                    <Text style={styles.bubbleTextMine}>{m.text}</Text>
                    <Text style={styles.bubbleTimeMine}>{m.time}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.bubble, styles.bubbleTheirs]}>
                    <Text style={styles.bubbleTextTheirs}>{m.text}</Text>
                    <Text style={styles.bubbleTimeTheirs}>{m.time}</Text>
                  </View>
                )}
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor="#94a3b8"
                value={chatDraft}
                onChangeText={setChatDraft}
              />
              <TouchableOpacity onPress={sendChat}>
                <LinearGradient colors={GRADIENTS.activeNav} style={styles.chatSendBtn}>
                  <Send size={16} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
    );
  }

  // ── Render: Confirm Complete ──────────────────────────────────────────────
  if (view === "complete_confirm") {
    return (
      <View style={styles.container}>
          <SubHeader title="Service Complete" onBack={() => setView("detail")} />
          <View style={styles.centeredContent}>
            <View style={styles.confirmCard}>
              <Text style={styles.confirmIcon}>⚠️</Text>
              <Text style={styles.confirmTitle}>Confirm Completion</Text>
              <Text style={styles.confirmSub}>Has the issue been resolved?</Text>
            </View>
            <TouchableOpacity style={{ marginBottom: 12 }} onPress={() => handleConfirmComplete(true)}>
              <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmYesBtn}>
                <ThumbsUp size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.confirmYesBtnText}>Yes, Resolved</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmNoBtn} onPress={() => handleConfirmComplete(false)}>
              <Text style={styles.confirmNoBtnText}>No, Reopen</Text>
            </TouchableOpacity>
          </View>
        </View>
    );
  }

  // ── Render: Rate ─────────────────────────────────────────────────────────
  if (view === "rate" && selectedReq) {
    return (
      <View style={styles.container}>
          <SubHeader title="Rate Service" onBack={() => setView("list")} />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14 }}>

            {/* Tech rating card */}
            <View style={[styles.card, { alignItems: "center", paddingVertical: 28 }]}>
              <View style={styles.rateAvatar}>
                <Text style={styles.rateAvatarText}>{selectedReq.techInitials}</Text>
              </View>
              <Text style={styles.rateName}>Rate {selectedReq.technician}</Text>
              <Text style={styles.rateCompany}>{selectedReq.techCompany}</Text>
              <View style={{ marginTop: 16 }}>
                <StarRow rating={starRating} onRate={setStarRating} size={36} />
              </View>
            </View>

            {/* Tags — show only when star selected */}
            {starRating > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardSectionLabel}>What did you like?</Text>
                <View style={styles.tagsRow}>
                  {LIKE_TAGS.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                      onPress={() => setSelectedTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )}
                    >
                      <Text style={[styles.tagChipText, selectedTags.includes(tag) && styles.tagChipTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {starRating > 0 && (
              <TouchableOpacity onPress={handleSubmitRating}>
                <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
                  <Star size={16} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Submit Rating</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
    );
  }

  // ── Render: Thank You ─────────────────────────────────────────────────────
  if (view === "thank_you") {
    return (
      <View style={styles.container}>
          <SubHeader title="Thank You!" onBack={goList} />
          <View style={styles.centeredContent}>
            <View style={styles.thankYouIconBg}>
              <Star size={40} color={COLORS.success} fill={COLORS.success} />
            </View>
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouSub}>Your feedback helps us improve</Text>
            <TouchableOpacity style={{ marginTop: 28, width: "100%" }} onPress={goList}>
              <LinearGradient colors={GRADIENTS.activeNav} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
                <Text style={styles.submitBtnText}>Back to Maintenance</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Gradient header (used for list + sub-screens)
  gradientHeader: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  gradientHeaderRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  gradientHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  gradientHeaderTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  gradientHeaderSub:   { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  subHeaderBack: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  newBtn: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.8)",
  },
  newBtnText: { fontSize: 13, fontWeight: "700", color: "white" },

  // Tabs
  tabRow: {
    flexDirection: "row", backgroundColor: "#e2e8f0",
    margin: 16, borderRadius: 14, padding: 4,
  },
  tabBtn:       { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center" },
  tabBtnActive: { backgroundColor: "white", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  tabText:       { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
  tabTextActive: { color: "#0f172a", fontWeight: "700" },

  listContent: { paddingHorizontal: 16, gap: 12 },

  // Request card
  reqCard: {
    backgroundColor: "white", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  reqCardTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  reqId:         { fontSize: 11, fontWeight: "700", color: "#2248db" },
  reqTitle:      { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  reqMeta:       { fontSize: 12, color: "#64748b", marginBottom: 12 },
  reqCardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  techSmallRow:     { flexDirection: "row", alignItems: "center", gap: 8 },
  techSmallAvatar:  { width: 24, height: 24, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  techSmallInitials:{ fontSize: 9, fontWeight: "700", color: "#64748b" },
  techSmallName:    { fontSize: 11, color: "#64748b" },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText:  { fontSize: 12, fontWeight: "700" },

  empty:     { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94a3b8" },

  // Form
  formContent: { padding: 16, gap: 6 },
  formLabel: { fontSize: 13, fontWeight: "700", color: "#0f172a", marginTop: 10, marginBottom: 6 },
  selectInput: {
    backgroundColor: "white", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  selectInputActive: { borderColor: "#2248db" },
  selectText:       { fontSize: 14 },
  selectTextPh:     { color: "#94a3b8" },
  selectTextFilled: { color: "#0f172a", fontWeight: "600" },
  dropList: {
    backgroundColor: "white", borderRadius: 12,
    borderWidth: 1, borderColor: "#e2e8f0",
    marginBottom: 8, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  dropItem:         { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropItemActive:   { backgroundColor: "#64748b" },
  dropItemText:     { fontSize: 14, color: "#0f172a" },
  dropItemTextActive:{ color: "white", fontWeight: "700" },

  locationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  locationInput: {
    flex: 1, minWidth: "45%",
    backgroundColor: "white", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  locationInputText: { fontSize: 14, color: "#0f172a" },
  input: {
    backgroundColor: "white", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 4,
  },
  inputText: { fontSize: 14, color: "#0f172a" },
  textArea: {
    backgroundColor: "white", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#e2e8f0",
    fontSize: 14, color: "#0f172a", minHeight: 100,
    textAlignVertical: "top",
  },
  uploadBox: {
    backgroundColor: "white", borderRadius: 14,
    borderWidth: 1.5, borderStyle: "dashed", borderColor: "#cbd5e1",
    padding: 32, alignItems: "center", justifyContent: "center", gap: 8,
  },
  uploadText: { fontSize: 13, color: "#94a3b8" },
  prefTimeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  prefTimeChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0",
    backgroundColor: "white",
  },
  prefTimeChipActive: { borderColor: "#0d9488", backgroundColor: "#f0fdfa" },
  prefTimeText:       { fontSize: 13, fontWeight: "600", color: "#64748b" },
  prefTimeTextActive: { color: "#0d9488" },
  submitBtn: { marginTop: 16 },
  submitBtnGrad: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  // Detail
  card: {
    backgroundColor: "white", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  detailTitle:    { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  detailDesc:     { fontSize: 13, color: "#475569", lineHeight: 20, marginBottom: 10 },
  detailMetaRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  detailMetaText: { fontSize: 12, color: "#64748b" },

  cardSectionLabel: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 14 },
  techRow:       { flexDirection: "row", alignItems: "center", gap: 12 },
  techAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: "#0d9488", alignItems: "center", justifyContent: "center" },
  techAvatarText:{ color: "white", fontWeight: "800", fontSize: 13 },
  techName:      { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  techCompany:   { fontSize: 12, color: "#64748b" },
  techRatingText:{ fontSize: 12, color: "#64748b" },
  iconBtn:       { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },

  timelineRow:      { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  timelineDot:      { width: 24, justifyContent: "center", alignItems: "center" },
  timelineDotDone:  {},
  timelineDotPending:{},
  timelineLabel:    { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  timelineDate:     { fontSize: 11, color: "#94a3b8", marginTop: 2 },

  chatLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14,
  },
  chatLinkText: { fontSize: 14, fontWeight: "700", color: "#0d9488" },

  completeBtn:     {},
  completeBtnGrad: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  completeBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  // Chat
  chatTechBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "white", padding: 16,
    borderBottomWidth: 1, borderBottomColor: "#e2e8f0",
  },
  bubbleRow:        { flexDirection: "row" },
  bubble:           { maxWidth: "75%", borderRadius: 18, padding: 12 },
  bubbleMine:       { borderBottomRightRadius: 4 },
  bubbleTheirs:     { backgroundColor: "white", borderBottomLeftRadius: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  bubbleTextMine:   { fontSize: 14, color: "white", lineHeight: 20 },
  bubbleTextTheirs: { fontSize: 14, color: "#0f172a", lineHeight: 20 },
  bubbleTimeMine:   { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  bubbleTimeTheirs: { fontSize: 10, color: "#94a3b8", marginTop: 4 },
  chatInputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "white", padding: 12,
    borderTopWidth: 1, borderTopColor: "#e2e8f0",
  },
  chatInput:   { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#0f172a" },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },

  // Complete confirm
  centeredContent: { flex: 1, padding: 16, justifyContent: "center" },
  confirmCard: {
    backgroundColor: "white", borderRadius: 16, padding: 32,
    alignItems: "center", marginBottom: 20,
  },
  confirmIcon:  { fontSize: 36, marginBottom: 12 },
  confirmTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  confirmSub:   { fontSize: 13, color: "#64748b", marginTop: 6 },
  confirmYesBtn:     { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  confirmYesBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
  confirmNoBtn:      { backgroundColor: "white", borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  confirmNoBtnText:  { fontSize: 15, fontWeight: "700", color: "#dc2626" },

  // Rate
  rateAvatar:    { width: 64, height: 64, borderRadius: 32, backgroundColor: "#0d9488", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  rateAvatarText:{ color: "white", fontWeight: "800", fontSize: 18 },
  rateName:      { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  rateCompany:   { fontSize: 13, color: "#64748b", marginTop: 4 },
  tagsRow:       { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  tagChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "white" },
  tagChipActive: { borderColor: "#0d9488", backgroundColor: "#f0fdfa" },
  tagChipText:   { fontSize: 13, fontWeight: "600", color: "#64748b" },
  tagChipTextActive: { color: "#0d9488" },

  // Thank you
  thankYouIconBg: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#f0fdf4",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  thankYouTitle: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  thankYouSub:   { fontSize: 14, color: "#64748b", marginTop: 6 },

  // Media Capture & Preview
  mediaPreviewContainer: {
    gap: 8,
    marginBottom: 8,
  },
  mediaSubLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  previewImageContainer: {
    position: "relative",
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "visible",
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  removeMediaBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  videoPreviewCard: {
    borderRadius: 14,
    overflow: "hidden",
  },
  videoPreviewGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  videoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  videoSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  removeMediaBtnInline: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  audioCaptureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  audioPlayerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdfa",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  pulseContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  recordBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  audioSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 6,
    height: 24,
  },
  waveformBarActive: {
    width: 3,
    backgroundColor: "#0d9488",
    borderRadius: 1.5,
  },
  waveformBarInactive: {
    width: 3,
    backgroundColor: "#cbd5e1",
    borderRadius: 1.5,
  },
  audioActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  audioActionCircleCancel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  audioActionCircleStop: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0d9488",
    alignItems: "center",
    justifyContent: "center",
  },
  removeMediaBtnInlineAudio: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  mediaActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  mediaActionButtonActive: {
    backgroundColor: "#0d9488",
    borderColor: "#0d9488",
  },
  mediaActionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
});
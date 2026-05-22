export const COLORS = {
  primary: "#26A69A", // Teal Accent
  primaryHover: "#2EC4B6", // Teal Glow
  primaryForeground: "#FFFFFF",
  secondary: "#347373", // Teal Muted
  secondaryForeground: "#FFFFFF",
  accent: "#26A69A",
  accentForeground: "#FFFFFF",
  background: "#F7FCFC", // Main Content Background
  foreground: "#0F2A38", // Main Content Foreground text
  muted: "#F0FAFC", // Sidebar Background start / Soft Mint Cream
  mutedForeground: "#5A7785", // Slate gray
  card: "#FFFFFF",
  cardForeground: "#0F2A38",
  border: "#D5E5E8", // Main Content Border
  sidebarBorder: "#C9DFE2",
  sidebarText: "#1A3A4A",
  input: "#D5E5E8",
  ring: "#26A69A",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  error: "#DC2626",
  success: "#1FA37A",
  warning: "#F59E0B",
  glow: "rgba(46, 196, 182, 0.25)", // Logo halo
  badgeBackground: "rgba(38, 154, 154, 0.15)", // Teal accent @ 15%
  shadow: "rgba(46, 196, 182, 0.45)", // Active shadow
};

export const GRADIENTS = {
  sidebar: ["#FFFFFF", "#F0FAFC"] as const,
  activeNav: ["#347373", "#26A69A"] as const,
  avatar: ["#347373", "#26A69A"] as const,
};


export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  radiusSmall: 8,
  radiusMedium: 16,
  radiusLarge: 24,
  radiusFull: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const FONTS = {
  regular: "PlusJakartaSans_400Regular",
  bold: "PlusJakartaSans_700Bold",
  display: "Sora_700Bold",
};

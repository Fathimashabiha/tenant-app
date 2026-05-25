import {
  Calendar, Zap, Wrench, Droplets, CreditCard, DollarSign, Megaphone, LucideIcon,
} from "lucide-react-native";
import { COLORS } from "../constants/Theme";
import type { FeedIconKey } from "./homeFeed";

export const FEED_ICON_MAP: Record<FeedIconKey, LucideIcon> = {
  zap: Zap,
  droplets: Droplets,
  wrench: Wrench,
  calendar: Calendar,
  credit: CreditCard,
  dollar: DollarSign,
  megaphone: Megaphone,
};

export function feedIconColor(iconKey: FeedIconKey): string {
  switch (iconKey) {
    case "droplets":
      return COLORS.secondary;
    case "calendar":
      return "#0d9488";
    case "credit":
    case "dollar":
      return COLORS.primary;
    default:
      return COLORS.primary;
  }
}

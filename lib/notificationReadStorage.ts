import AsyncStorage from "@react-native-async-storage/async-storage";

const READ_IDS_KEY = "@zendwell_notification_read_ids";

export async function loadReadNotificationIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(READ_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export async function saveReadNotificationIds(ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
}

export async function markNotificationsRead(ids: string[]): Promise<Set<string>> {
  const current = await loadReadNotificationIds();
  ids.forEach((id) => current.add(id));
  await saveReadNotificationIds(current);
  return current;
}

export async function markAllNotificationsRead(allIds: string[]): Promise<Set<string>> {
  const next = new Set(allIds);
  await saveReadNotificationIds(next);
  return next;
}

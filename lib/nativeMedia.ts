import { NativeModules } from "react-native";
import type { Audio as ExpoAVAudio } from "expo-av";

export type ExpoRecording = ExpoAVAudio.Recording;
export type ExpoSound = ExpoAVAudio.Sound;

/** Native module is linked in the current dev build / binary. */
export const isNativeCameraAvailable = (): boolean =>
  NativeModules.ExponentImagePicker != null;

export const isNativeAudioAvailable = (): boolean =>
  NativeModules.ExponentAV != null;

let imagePickerModule: typeof import("expo-image-picker") | null = null;
let expoAVAudioModule: typeof ExpoAVAudio | null = null;

export function getImagePicker(): typeof import("expo-image-picker") | null {
  if (!isNativeCameraAvailable()) return null;
  if (!imagePickerModule) {
    imagePickerModule = require("expo-image-picker");
  }
  return imagePickerModule;
}

export function getExpoAVAudio(): typeof ExpoAVAudio | null {
  if (!isNativeAudioAvailable()) return null;
  if (!expoAVAudioModule) {
    expoAVAudioModule = require("expo-av").Audio;
  }
  return expoAVAudioModule;
}

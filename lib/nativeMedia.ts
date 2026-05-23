import type { Audio as ExpoAVAudio } from "expo-av";

export type ExpoRecording = ExpoAVAudio.Recording;
export type ExpoSound = ExpoAVAudio.Sound;

/** Always available — expo-image-picker and expo-av are installed in the dev build. */
export const isNativeCameraAvailable = (): boolean => true;

export const isNativeAudioAvailable = (): boolean => true;

let imagePickerModule: typeof import("expo-image-picker") | null = null;
let expoAVAudioModule: typeof ExpoAVAudio | null = null;

export function getImagePicker(): typeof import("expo-image-picker") | null {
  if (!imagePickerModule) {
    imagePickerModule = require("expo-image-picker");
  }
  return imagePickerModule;
}

export function getExpoAVAudio(): typeof ExpoAVAudio | null {
  if (!expoAVAudioModule) {
    expoAVAudioModule = require("expo-av").Audio;
  }
  return expoAVAudioModule;
}

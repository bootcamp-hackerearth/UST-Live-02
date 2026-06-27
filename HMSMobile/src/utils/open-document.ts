import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";

const sanitizeFileName = (value: string) =>
  value.replace(/[<>:"/\\|?*]+/g, "-").trim() || "document";

export const openDocumentFile = async (
  url: string,
  fileName: string,
  mimeType = "application/pdf",
) => {
  try {
    const safeFileName = sanitizeFileName(fileName);
    const fileUri = `${FileSystem.documentDirectory}${safeFileName}`;
    const result = await FileSystem.downloadAsync(url, fileUri);

    if (Platform.OS === "android") {
      try {
        const contentUri = await FileSystem.getContentUriAsync(result.uri);

        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: mimeType,
        });
        return;
      } catch {
        // Fall through to share sheet when no native viewer is available.
      }
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        dialogTitle: "Open Document",
        mimeType,
      });
      return;
    }

    Alert.alert("Unable to open", "No compatible document viewer is available.");
  } catch {
    Alert.alert("Unable to open", "This document cannot be opened.");
  }
};

import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const sanitizeFileName = (value: string) =>
  value.replace(/[<>:"/\\|?*]+/g, "-").trim() || "document";

export const downloadFile = async (url: string, fileName: string) => {
  try {
    const safeFileName = sanitizeFileName(fileName);
    const fileUri = `${FileSystem.documentDirectory}${safeFileName}`;
    const result = await FileSystem.downloadAsync(url, fileUri);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri);
      return;
    }

    Alert.alert("Downloaded", `File saved to ${result.uri}`);
  } catch {
    Alert.alert("Download failed", "Unable to download this document.");
  }
};

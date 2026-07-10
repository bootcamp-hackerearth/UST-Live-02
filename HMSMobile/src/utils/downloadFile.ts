import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { logger } from "./logger";

export async function downloadFile(url: string, fileName: string) {
  try {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const result = await FileSystem.downloadAsync(url, fileUri);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri);
    }
  } catch (error) {
    logger.error("File download failed", error, { url, fileName });
  }
}

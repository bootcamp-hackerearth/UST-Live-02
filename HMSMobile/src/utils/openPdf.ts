import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { logger } from "./logger";

export async function openPdf(url: string, fileName: string) {
  try {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const result = await FileSystem.downloadAsync(url, fileUri);

    try {
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: result.uri,
        type: "application/pdf",
        flags: 1,
      });
    } catch {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Open PDF",
        });
      }
    }
  } catch (error) {
    logger.error("PDF open failed", error, { url, fileName });
  }
}

import { Linking } from "react-native";
import { showToast } from "../services/toast.service";
import { logger } from "./logger";

export async function openPdf(url: string, fileName?: string) {
  try {
    await Linking.openURL(encodeURI(url));

  } catch (error) {
    logger.error("PDF open failed", error, { url, fileName });
    showToast("Unable to open this file.", "error");
  }
}

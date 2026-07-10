import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { showToast } from "../services/toast.service";
import { logger } from "./logger";

const RESERVED_FILE_NAME_CHARACTERS = new Set([
  "<",
  ">",
  ":",
  '"',
  "/",
  "\\",
  "|",
  "?",
  "*",
]);

const isWhiteSpace = (character: string) => character.trim() === "";

const getSafeFileName = (fileName: string) => {
  const sanitizedCharacters: string[] = [];
  let previousCharacterWasWhiteSpace = false;

  for (const character of fileName.trim()) {
    if (
      RESERVED_FILE_NAME_CHARACTERS.has(character) ||
      (character.codePointAt(0) ?? 0) < 32
    ) {
      sanitizedCharacters.push("_");
      previousCharacterWasWhiteSpace = false;
      continue;
    }

    if (isWhiteSpace(character)) {
      if (!previousCharacterWasWhiteSpace) {
        sanitizedCharacters.push(" ");
      }

      previousCharacterWasWhiteSpace = true;
      continue;
    }

    sanitizedCharacters.push(character);
    previousCharacterWasWhiteSpace = false;
  }

  const sanitizedFileName = sanitizedCharacters.join("").slice(0, 120);

  return sanitizedFileName || `health-record-${Date.now()}`;
};

const getMimeType = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    return "application/pdf";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  return "application/octet-stream";
};

export async function downloadFile(url: string, fileName: string) {
  const safeFileName = getSafeFileName(fileName);
  const mimeType = getMimeType(safeFileName);
  const tempUri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${safeFileName}`;

  try {
    if (Platform.OS === "android") {
      const permission =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permission.granted) {
        showToast("Download cancelled.", "info");
        return;
      }

      const result = await FileSystem.downloadAsync(url, tempUri);
      const base64File = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const savedUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permission.directoryUri,
        safeFileName,
        mimeType,
      );

      await FileSystem.writeAsStringAsync(savedUri, base64File, {
        encoding: FileSystem.EncodingType.Base64,
      });
      showToast("File saved successfully.", "success");
      return;
    }

    const result = await FileSystem.downloadAsync(url, tempUri);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        dialogTitle: "Save file",
        mimeType,
      });
      return;
    }

    showToast("File downloaded successfully.", "success");
  } catch (error) {
    logger.error("File download failed", error, { url, fileName: safeFileName });
    showToast("Unable to download this file.", "error");
  }
}

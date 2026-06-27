import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export async function downloadFile(url: string, fileName: string) {
  try {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const result = await FileSystem.downloadAsync(url, fileUri);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri);
    }
  } catch (error) {
    console.log("Download Error", error);
  }
}

import React from "react";
import { WebView } from "react-native-webview";

export default function PdfViewerScreen({ route }: any) {
  const { url } = route.params;

  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    url,
  )}`;

  return (
    <WebView
      source={{
        uri: viewerUrl,
      }}
    />
  );
}

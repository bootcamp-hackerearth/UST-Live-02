import { Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const escapeHtml = (value: unknown) =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

export const sharePrescriptionPdf = async (prescription: any) => {
  try {
    const medicines = prescription?.prescriptions || [];
    const medicineRows = medicines.length
      ? medicines
          .map(
            (medicine: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(medicine.medicineName)}</td>
                <td>${escapeHtml(medicine.dosage)}</td>
                <td>${escapeHtml(medicine.frequency)}</td>
                <td>${escapeHtml(medicine.duration)}</td>
              </tr>
            `,
          )
          .join("")
      : `<tr><td colspan="5">No medicines added</td></tr>`;

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { color: #2563eb; margin-bottom: 8px; }
            p { margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background: #eff6ff; }
          </style>
        </head>
        <body>
          <h1>Prescription</h1>
          <p><strong>Date:</strong> ${escapeHtml(formatDate(prescription?.createdAt))}</p>
          <p><strong>Doctor:</strong> Dr. ${escapeHtml(prescription?.doctorEmployeeId?.name)}</p>
          <p><strong>Department:</strong> ${escapeHtml(prescription?.doctorEmployeeId?.department)}</p>
          <p><strong>Diagnosis:</strong> ${escapeHtml(prescription?.diagnosis)}</p>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>${medicineRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const result = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        dialogTitle: "Share Prescription",
        mimeType: "application/pdf",
      });
      return;
    }

    Alert.alert("PDF created", `Prescription PDF saved to ${result.uri}`);
  } catch {
    Alert.alert("PDF failed", "Unable to create prescription PDF.");
  }
};

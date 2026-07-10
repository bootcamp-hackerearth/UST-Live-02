import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { HealthRecordDetails } from "../types/HealthRecord";
import { getFileUrl } from "./fileUrl";

const escapeHtml = (value?: string | number | null) =>
  String(value ?? "N/A")
    .replaceAll('&', "&amp;")
    .replaceAll('<', "&lt;")
    .replaceAll('>', "&gt;");

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "N/A";

const isPrintableImage = (url?: string | null) =>
  Boolean(url && /\.(png|jpe?g|gif|webp)$/i.test(url.split("?")[0]));

const renderUploadedFile = (title: string, documentUrl?: string) => {
  const fileUrl = getFileUrl(documentUrl);

  if (!fileUrl) {
    return `<p class="muted">No uploaded file attached.</p>`;
  }

  return `
    <p>
      <strong>Uploaded File:</strong>
      <a href="${fileUrl}">${escapeHtml(fileUrl)}</a>
    </p>
    ${
      isPrintableImage(fileUrl)
        ? `<img class="file-preview" src="${fileUrl}" alt="${escapeHtml(title)}" />`
        : ""
    }
  `;
};

const renderPrescriptionTable = (prescriptions: any[] = []) => {
  if (!prescriptions.length) {
    return `<p class="muted">No prescriptions recorded for this consultation.</p>`;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Medicine</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${prescriptions
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.medicineName)}</td>
                <td>${escapeHtml(item.dosage)}</td>
                <td>${escapeHtml(item.frequency)}</td>
                <td>${escapeHtml(item.duration)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
};

export const downloadHealthRecordPdf = async (record: HealthRecordDetails) => {
  const patient = record.patient;
  const fullName =
    `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim();

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1, h2 { margin-bottom: 8px; }
          section { margin-top: 24px; }
          .meta, .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-top: 10px; }
          .muted { color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f8fafc; }
          a { color: #2563eb; word-break: break-all; }
          .file-preview { max-width: 100%; max-height: 420px; margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 6px; }
          .card { break-inside: avoid; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(fullName || "Patient Health Record")}</h1>
        <p class="muted">UHID: ${escapeHtml(patient.patientId)}</p>
        <div class="meta">
          <p>Gender: ${escapeHtml(patient.gender)}</p>
          <p>Blood Group: ${escapeHtml(patient.bloodGroup)}</p>
          <p>Phone: ${escapeHtml(patient.phone)}</p>
        </div>
        <section>
          <h2>Consultations & Prescriptions (${record.consultations.length})</h2>
          ${
            record.consultations
              .map(
                (item) => `
                <div class="card">
                  <strong>${formatDate(item.createdAt)} - ${escapeHtml(item.doctorEmployeeId?.name)}</strong>
                  <p>Diagnosis: ${escapeHtml(item.diagnosis)}</p>
                  <p>Symptoms: ${escapeHtml(item.symptoms?.join(", "))}</p>
                  <p>Doctor Notes: ${escapeHtml(item.doctorNotes)}</p>
                  ${renderPrescriptionTable(item.prescriptions)}
                </div>
              `,
              )
              .join("") || "<p>No consultations available.</p>"
          }
        </section>
        <section>
          <h2>Lab Reports (${record.labReports.length})</h2>
          ${
            record.labReports
              .map(
                (item) => `
                <div class="card">
                  <strong>${escapeHtml(item.title)}</strong>
                  <p>${escapeHtml(item.reportType)} - ${formatDate(item.reportDate)}</p>
                  <p>Lab: ${escapeHtml(item.labName)}</p>
                  <p>Doctor: ${escapeHtml(item.doctorName)}</p>
                  ${renderUploadedFile(item.title, item.documentUrl)}
                </div>
              `,
              )
              .join("") || "<p>No lab reports available.</p>"
          }
        </section>
        <section>
          <h2>Medical Documents (${record.medicalDocuments.length})</h2>
          ${
            record.medicalDocuments
              .map(
                (item) => `
                <div class="card">
                  <strong>${escapeHtml(item.title)}</strong>
                  <p>${escapeHtml(item.documentType)} - ${formatDate(item.recordDate)}</p>
                  <p>Hospital: ${escapeHtml(item.hospitalName)}</p>
                  <p>Doctor: ${escapeHtml(item.doctorName)}</p>
                  ${renderUploadedFile(item.title, item.documentUrl)}
                </div>
              `,
              )
              .join("") || "<p>No medical documents available.</p>"
          }
        </section>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Download complete health record",
    });
  }

  return uri;
};

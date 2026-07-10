import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { PrescriptionGroup } from "../types/HealthRecord";
import { logger } from "./logger";

export async function downloadPrescriptionPdf(prescription: PrescriptionGroup) {
  try {
    const medicinesHtml = prescription.prescriptions
      .map(
        (medicine, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${medicine.medicineName}</td>
              <td>${medicine.dosage}</td>
              <td>${medicine.frequency}</td>
              <td>${medicine.duration}</td>
            </tr>
          `,
      )
      .join("");

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial;
              padding: 24px;
            }

            h1 {
              color: #2563EB;
            }

            p {
              margin: 6px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #eff6ff;
            }
          </style>
        </head>

        <body>
          <h1>
            Prescription
          </h1>

          <p>
            <strong>
              Date:
            </strong>
            ${new Date(prescription.date).toLocaleDateString()}
          </p>

          <p>
            <strong>
              Doctor:
            </strong>
            ${prescription.doctor ?? "-"}
          </p>

          <p>
            <strong>
              Department:
            </strong>
            ${prescription.department ?? "-"}
          </p>

          <p>
            <strong>
              Diagnosis:
            </strong>
            ${prescription.diagnosis ?? "-"}
          </p>

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

            <tbody>
              ${medicinesHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const result = await Print.printToFileAsync({
      html,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Prescription",
      });
    }
  } catch (error) {
    logger.error("Prescription PDF generation failed", error);
  }
}

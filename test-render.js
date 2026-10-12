import { getReportData } from "./report-data.js";
import { renderReportPdf } from "./render-pdf.js";
import { mkdirSync } from "node:fs";

mkdirSync("reports", { recursive: true });

const data = getReportData();
await renderReportPdf(data, "reports/test.pdf");

console.log("PDF generated at reports/test.pdf");

import { chromium } from "playwright";
import { db } from "./db.js";

function buildHtml(reportData) {
	const today = new Date().toISOString().split("T")[0];

	const topProductsRows = reportData.topProducts
		.map(
			(p) => `<tr><td>${p.product}</td><td>€${p.revenue.toFixed(2)}</td></tr>`,
		)
		.join("");

	const allOrders = db
		.prepare(
			"SELECT id, customer, product, amount, created_at FROM orders ORDER BY id",
		)
		.all();

	const allOrdersRows = allOrders
		.map(
			(o) =>
				`<tr><td>${o.id}</td><td>${o.customer}</td><td>${o.product}</td><td>€${o.amount.toFixed(2)}</td><td>${o.created_at}</td></tr>`,
		)
		.join("");

	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 20px; }
        h2 { font-size: 16px; margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-size: 12px; }
        th { background: #f0f0f0; }
        tr { break-inside: avoid; }
        thead { display: table-header-group; }
      </style>
    </head>
    <body>
      <h1>Sales Report - ${today}</h1>
      <p><strong>Total Orders:</strong> ${reportData.totalOrders}</p>
      <p><strong>Total Revenue:</strong> €${reportData.totalRevenue.toFixed(2)}</p>

      <h2>Top 5 Products by Revenue</h2>
      <table>
        <thead><tr><th>Product</th><th>Revenue</th></tr></thead>
        <tbody>${topProductsRows}</tbody>
      </table>

      <h2>All Orders</h2>
      <table>
        <thead><tr><th>ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>${allOrdersRows}</tbody>
      </table>
    </body>
    </html>
  `;
}

export async function renderReportPdf(reportData, outputPath) {
	const html = buildHtml(reportData);

	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.setContent(html);
	await page.pdf({ path: outputPath, format: "A4", printBackground: true });
	await browser.close();
}

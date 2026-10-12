import express from "express";
import { db } from "./db.js";
import { getReportData } from "./report-data.js";
import { renderReportPdf } from "./render-pdf.js";
import { mkdirSync } from "node:fs";
import path from "node:path";

mkdirSync("reports", { recursive: true });

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

app.post("/reports", async (req, res) => {
	const data = getReportData();
	const now = new Date().toISOString();

	// Insert a row first to get an id, then render using that id in the filename
	const insert = db.prepare(
		"INSERT INTO reports (path, created_at) VALUES (?, ?)",
	);
	const info = insert.run("", now);
	const id = info.lastInsertRowid;

	const filePath = `reports/${id}.pdf`;
	await renderReportPdf(data, filePath);

	db.prepare("UPDATE reports SET path = ? WHERE id = ?").run(filePath, id);

	res.status(201).json({
		id,
		file: `/reports/${id}/file`,
	});
});

app.get("/reports/:id", (req, res) => {
	const row = db
		.prepare("SELECT * FROM reports WHERE id = ?")
		.get(req.params.id);

	if (!row) {
		return res.status(404).json({ error: "Report not found" });
	}

	res.json({
		id: row.id,
		created_at: row.created_at,
		file: `/reports/${row.id}/file`,
	});
});

app.get("/reports/:id/file", (req, res) => {
	const row = db
		.prepare("SELECT * FROM reports WHERE id = ?")
		.get(req.params.id);

	if (!row) {
		return res.status(404).json({ error: "Report not found" });
	}

	res.sendFile(path.resolve(row.path));
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

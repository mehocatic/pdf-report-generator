import { db } from "./db.js";

const products = [
	"Keyboard",
	"Mouse",
	"Monitor",
	"Headphones",
	"Webcam",
	"Desk Lamp",
];

function randomDate(daysBack) {
	const date = new Date();
	date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
	return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

// Clean slate — safe to run twice
db.exec("DELETE FROM orders");

const insert = db.prepare(
	"INSERT INTO orders (customer, product, amount, created_at) VALUES (?, ?, ?, ?)",
);

for (let i = 1; i <= 200; i++) {
	const customer = `Customer ${i}`;
	const product = products[Math.floor(Math.random() * products.length)];
	const amount = Math.floor(Math.random() * 195) + 5; // 5–200
	const created_at = randomDate(30);
	insert.run(customer, product, amount, created_at);
}

console.log("Seeded 200 orders.");

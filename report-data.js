import { db } from "./db.js";

export function getReportData() {
	const totalOrders = db
		.prepare("SELECT COUNT(*) as count FROM orders")
		.get().count;

	const totalRevenue = db
		.prepare("SELECT SUM(amount) as total FROM orders")
		.get().total;

	const topProducts = db
		.prepare(
			`SELECT product, SUM(amount) as revenue
       FROM orders
       GROUP BY product
       ORDER BY revenue DESC
       LIMIT 5`,
		)
		.all();

	const ordersLast7Days = db
		.prepare(
			`SELECT created_at as date, COUNT(*) as count
       FROM orders
       WHERE created_at >= date('now', '-7 days')
       GROUP BY created_at
       ORDER BY created_at ASC`,
		)
		.all();

	return {
		totalOrders,
		totalRevenue,
		topProducts,
		ordersLast7Days,
	};
}

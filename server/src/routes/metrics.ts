import jwt from "jsonwebtoken";
import { initMetrics } from "../services/metrics";


export const initMetricsHandler = async ({
	store,
	cookie: { token },
	params: { agency_id }
}: any) => {
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		if (decoded.role !== "Government")
			return {
				error: "Not found",
				data: null,
				success: false,
				message: "Not found",
			};
		const result = await initMetrics(agency_id);

		return {
			success: true,
			data: {
                upserted_id: result.upsertedId?.toString(),
            },
			error: null,
			message: "Metrics initiated successfully",
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			message: "Unauthorized",
			data: null,
			success: false,
		};
	}
};

export const updateMetricsHandler = async ({
	store,
	cookie: { token },
	params: { agency_id },
    body
}: any) => {
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		if (decoded.role !== "Government")
			return {
				error: "Not found",
				data: null,
				success: false,
				message: "Not found",
			};
		const result = await initMetrics(agency_id);

		return {
			success: true,
			data: {
                upserted_id: result.upsertedId?.toString(),
            },
			error: null,
			message: "Metrics initiated successfully",
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			message: "Unauthorized",
			data: null,
			success: false,
		};
	}
};

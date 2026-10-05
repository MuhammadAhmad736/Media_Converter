import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Visitor from "@/models/visitors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const visitorDocumentId = "000000000000000000000001";

function getVisitorIp(request: NextRequest): string | null {
	const forwardedIp = request.headers
		.get("x-forwarded-for")
		?.split(",")[0]
		.trim();

	return (
		forwardedIp ||
		request.headers.get("x-real-ip")?.trim() ||
		request.headers.get("cf-connecting-ip")?.trim() ||
		null
	);
}

function isDuplicateKeyError(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		error.code === 11000
	);
}

export async function GET(request: NextRequest) {
	const ip = getVisitorIp(request);

	if (!ip) {
		return NextResponse.json(
			{ success: false, error: "Unable to determine visitor IP" },
			{ status: 400 }
		);
	}

	try {
		await connectDB();

		const existingVisitor = await Visitor.findOne().select("_id").lean();
		const visitorId = existingVisitor?._id ?? visitorDocumentId;
		const update = {
			$addToSet: { ipAddresses: ip },
			$inc: { counter: 1 },
		};
		const filter = { _id: visitorId, ipAddresses: { $ne: ip } };

		let visitor;
		try {
			visitor = await Visitor.findOneAndUpdate(filter, update, {
				new: true,
				upsert: !existingVisitor,
				setDefaultsOnInsert: false,
			});
		} catch (error) {
			if (!isDuplicateKeyError(error) || existingVisitor) throw error;

			// Another request created the singleton visitor document concurrently.
			visitor = await Visitor.findOneAndUpdate(filter, update, { new: true });
		}

		if (!visitor) {
			visitor = await Visitor.findById(visitorId).select("counter").lean();
		}

		return NextResponse.json({
			success: true,
			counter: visitor?.counter ?? 0,
		});
	} catch (error) {
		console.error("Visitor tracking error:", error);
		return NextResponse.json(
			{ success: false, error: "Unable to track visitor" },
			{ status: 500 }
		);
	}
}

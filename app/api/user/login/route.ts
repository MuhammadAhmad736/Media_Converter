import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "@/models/user";
import { connectDB } from "@/lib/db/mongodb";
import { getAdminAccess } from "@/lib/middleware/require-admin";

const JWT_SECRET: string = process.env.JWT_SECRET || "";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET is missing in .env.local");
}

const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict" as const,
	path: "/",
	maxAge: SESSION_DURATION_SECONDS,
};

const createUserToken = (userId: string) =>
	jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

const invalidSessionResponse = () =>
	NextResponse.json({ success: true, authenticated: false });

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const token = request.cookies.get("user_token")?.value;
		if (!token) return invalidSessionResponse();

		try {
			const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
			const user = await User.findById(decoded.id);

			if (!user) return invalidSessionResponse();

			return NextResponse.json({
				success: true,
				authenticated: true,
				user: { name: user.name, email: user.email, isAdmin: user.isAdmin === true },
			});
		} catch {
			return invalidSessionResponse();
		}
	} catch (error) {
		console.error("User auth check error:", error);
		return NextResponse.json(
			{ success: false, error: "Something went wrong" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json().catch(() => ({}))) as {
			mode?: string;
			name?: string;
			email?: string;
			password?: string;
			currentPassword?: string;
			newPassword?: string;
		};

		const mode = body.mode;
		const name = typeof body.name === "string" ? body.name.trim() : "";
		const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
		const password = typeof body.password === "string" ? body.password : "";
		const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

		await connectDB();

		if (mode === "register") {
			if (!name || name.length > 100 || !isValidEmail || password.length < 8 || password.length > 72) {
				return NextResponse.json(
					{ success: false, error: "Enter a valid name, email, and password (8-72 characters)." },
					{ status: 400 },
				);
			}

			// Check if the user already exists
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				return NextResponse.json(
					{ success: false, error: "User already exists, please login." },
					{ status: 409 },
				);
			}

			// Create a new user with a hashed password
			const hashedPassword = await bcrypt.hash(password, 10);
			const user = await User.create({
				name,
				email,
				password: hashedPassword,
				isAdmin: false,
			});
			const token = createUserToken(user._id.toString());

			const response = NextResponse.json({
				success: true,
				authenticated: true,
				user: { name: user.name, email: user.email, isAdmin: user.isAdmin === true },
			});

			// Create authentication cookie for 7 days
			response.cookies.set("user_token", token, cookieOptions);
			return response;
		}

		if (mode === "login") {
			if (!isValidEmail || !password || password.length > 72) {
				return NextResponse.json(
					{ success: false, error: "Enter a valid email and password." },
					{ status: 400 },
				);
			}

			// Check the user's email first
			const user = await User.findOne({ email });
			if (!user || typeof user.password !== "string") {
				return NextResponse.json(
					{ success: false, error: "Incorrect email or password." },
					{ status: 401 },
				);
			}

			// Only allow login when the password matches the stored hash
			const isPasswordCorrect = await bcrypt.compare(password, user.password);
			if (!isPasswordCorrect) {
				return NextResponse.json(
					{ success: false, error: "Incorrect email or password." },
					{ status: 401 },
				);
			}

			const token = createUserToken(user._id.toString());
			const response = NextResponse.json({
				success: true,
				authenticated: true,
				user: { name: user.name, email: user.email, isAdmin: user.isAdmin === true },
			});

			// Create authentication cookie for 7 days
			response.cookies.set("user_token", token, cookieOptions);
			return response;
		}

		if (mode === "change-password") {
			const access = await getAdminAccess(request.cookies.get("user_token")?.value);
			if (access.status !== "authorized") {
				return NextResponse.json(
					{
						success: false,
						error: access.status === "unauthenticated" ? "Please sign in." : "Admin access required.",
					},
					{ status: access.status === "unauthenticated" ? 401 : 403 },
				);
			}

			const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
			const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
			const user = await User.findById(access.userId);

			if (!user || email !== user.email) {
				return NextResponse.json(
					{ success: false, error: "Enter the signed-in admin email." },
					{ status: 400 },
				);
			}

			if (
				!currentPassword ||
				currentPassword.length > 72 ||
				newPassword.length < 12 ||
				newPassword.length > 72
			) {
				return NextResponse.json(
					{ success: false, error: "The new password must be between 12 and 72 characters." },
					{ status: 400 },
				);
			}

			if (typeof user.password !== "string" || !(await bcrypt.compare(currentPassword, user.password))) {
				return NextResponse.json(
					{ success: false, error: "Incorrect current password." },
					{ status: 401 },
				);
			}

			user.password = await bcrypt.hash(newPassword, 10);
			await user.save();

			return NextResponse.json({ success: true, message: "Password updated successfully." });
		}

		return NextResponse.json(
			{ success: false, error: "Invalid authentication mode." },
			{ status: 400 },
		);
	} catch (error) {
		if ((error as { code?: number }).code === 11000) {
			return NextResponse.json(
				{ success: false, error: "User already exists, please login." },
				{ status: 409 },
			);
		}

		console.error("User auth error:", error);
		return NextResponse.json(
			{ success: false, error: "Something went wrong" },
			{ status: 500 },
		);
	}
}

export async function DELETE() {
	const response = NextResponse.json({ success: true, message: "Logged out successfully" });
	response.cookies.set("user_token", "", { ...cookieOptions, maxAge: 0 });
	return response;
}

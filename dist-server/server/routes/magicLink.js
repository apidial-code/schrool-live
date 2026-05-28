import { Router } from "express";
import { randomBytes } from "crypto";
import { verifyMagicLinkToken } from "../_core/magicLink";
import { getDb } from "../db";
import { users, magicLinkTokens } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
const COOKIE_NAME = "session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const router = Router();
/**
 * Magic link request endpoint
 * POST /auth/request
 */
router.post("/request", async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ success: false, message: "Email is required" });
    }
    try {
        const db = await getDb();
        if (!db) {
            return res.status(500).json({ success: false, message: "Database unavailable" });
        }
        // Find user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Generate magic link token directly
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
        // Store token in database
        await db.insert(magicLinkTokens).values({
            token,
            userId: user.id,
            expiresAt,
            used: 0,
        });
        // In production, send email here
        // For demo, return the token
        return res.json({ success: true, message: "Magic link sent to email", token });
    }
    catch (error) {
        console.error("[Magic Link Request] Error:", error);
        return res.status(500).json({ success: false, message: "Failed to process request" });
    }
});
/**
 * Magic link verification endpoint
 * GET /auth/magic?token=xxx
 */
router.get("/magic", async (req, res) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        return res.status(400).send("Invalid token");
    }
    try {
        // Verify the token
        const result = await verifyMagicLinkToken(token);
        if (!result) {
            return res.status(401).send("Invalid or expired magic link");
        }
        const { userId, userType } = typeof result === 'object' ? result : { userId: result, userType: 'student' };
        // Get user details
        const db = await getDb();
        if (!db) {
            return res.status(500).send("Database unavailable");
        }
        let [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        if (!user && process.env.MOCK_DB_ENABLED === 'true') {
            console.log(`[MockDB] User ${userId} not found, creating mock user`);
            user = {
                id: userId,
                openId: `mock_open_id_${userId}`,
                name: `Mock User ${userId}`,
                role: userType,
                email: `${userType}${userId}@test.com`,
                lastSignedIn: new Date()
            };
            if (!global.mockData)
                global.mockData = {};
            if (!global.mockData.users)
                global.mockData.users = [];
            global.mockData.users.push(user);
        }
        if (!user) {
            return res.status(404).send("User not found");
        }
        // Create session token using SDK
        let sessionToken;
        if (process.env.MOCK_DB_ENABLED === 'true') {
            const jwt = (await import('jsonwebtoken')).default;
            const { ENV } = await import('../_core/env');
            sessionToken = jwt.sign({
                openId: user.openId || "mock_open_id",
                appId: ENV.appId,
                name: user.name || "Mock User",
            }, ENV.cookieSecret || 'demo-secret', { expiresIn: '365d' });
        }
        else {
            sessionToken = await sdk.createSessionToken(user.openId || "", {
                name: user.name || "",
                expiresInMs: ONE_YEAR_MS,
            });
        }
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        // Redirect to appropriate dashboard based on role
        const dashboardMap = {
            student: "/student",
            parent: "/parent",
            teacher: "/teacher",
            admin: "/admin",
        };
        const redirectPath = dashboardMap[user.role] || "/";
        res.redirect(redirectPath);
    }
    catch (error) {
        console.error("[Magic Link] Verification error:", error);
        res.status(500).send("Authentication failed");
    }
});
export default router;

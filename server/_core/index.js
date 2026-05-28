import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers/index.js";
import { createContext } from "./context.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import lessonsApiRouter from "../routes/lessonsApi.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
    console.log("Starting server...");
    const app = express();
    const server = createServer(app);
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    console.log("Setting up tRPC...");
    app.use("/api/trpc", createExpressMiddleware({
        router: appRouter,
        createContext,
    }));
    // Direct lessons API (workaround for Drizzle ORM issues)
    app.use("/api/lessons/direct", lessonsApiRouter);
    // Robust static file serving
    const possibleDistPaths = [
        path.resolve(__dirname, "../../../../dist"), // For Heroku, assuming dist is at the root
        path.resolve(process.cwd(), "dist"), // For local development
        path.resolve(__dirname, "../../dist") // Another common local path
    ];
    let distPath = "";
    for (const p of possibleDistPaths) {
        if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
            distPath = p;
            break;
        }
    }
    if (distPath) {
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }
    else {
        console.error("CRITICAL: Could not find static files directory!");
        app.get("*", (req, res) => {
            res.status(404).send("Static files not found. Build might have failed.");
        });
    }
    const port = parseInt(process.env.PORT || "3000");
    server.listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
    });
}
startServer().catch((err) => {
    console.error("CRITICAL ERROR:", err);
    process.exit(1);
});

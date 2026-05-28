import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers/index.js";
import { createContext } from "./context.js";
import path from "path";
import { fileURLToPath } from "url";
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
    if (process.env.NODE_ENV === "production") {
        console.log("Production mode: serving static files");
        const distPath = path.resolve(__dirname, "../../../dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
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

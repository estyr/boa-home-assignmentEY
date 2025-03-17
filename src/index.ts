import { join } from "path";
import express from "express";
import { readFileSync } from "fs";
import serveStatic from "serve-static";
import dotenv from "dotenv";
import cors from "cors";
import shopify from "./shopify.js";
import submitRoute from "./routes/submitRoute.ts"; // ייבוא הנתיב שהפרדנו

dotenv.config();

const backendPort = process.env.BACKEND_PORT as string;
const envPort = process.env.PORT as string;
const PORT = parseInt(backendPort || envPort, 10) || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "https://8f0c-46-210-167-11.ngrok-free.app",
    "https://extensions.shopifycdn.com",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

// Middleware להדפסת בקשות נכנסות
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: {} })
);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

// הוספת הנתיב של /api/submit
app.use("/api", submitRoute);

// Static files serving
app.use(serveStatic(`${process.cwd()}/frontend/`, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  const htmlContent = readFileSync(
    join(`${process.cwd()}/frontend/`, "index.html"),
    "utf-8"
  );
  const transformedHtml = htmlContent.replace(
    /%SHOPIFY_API_KEY%/g,
    process.env.SHOPIFY_API_KEY || ""
  );

  res.status(200).set("Content-Type", "text/html").send(transformedHtml);
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// import { join } from "path";
// import express from "express";
// import { readFileSync } from "fs";
// import serveStatic from "serve-static";
// import dotenv from "dotenv";

// import shopify from "./shopify.js";

// dotenv.config();

// const backendPort = process.env.BACKEND_PORT as string;
// const envPort = process.env.PORT as string;
// const PORT = parseInt(backendPort || envPort, 10);

// const app = express();

// // Set up Shopify authentication and webhook handling
// app.get(shopify.config.auth.path, shopify.auth.begin());
// app.get(
//   shopify.config.auth.callbackPath,
//   shopify.auth.callback(),
//   shopify.redirectToShopifyOrAppRoot()
// );

// app.post(
//   shopify.config.webhooks.path,
//   shopify.processWebhooks({ webhookHandlers: {} })
// );

// app.use(express.json());

// // All endpoints after this point will require an active session
// app.use("/api/*", shopify.validateAuthenticatedSession());

// app.use(serveStatic(`${process.cwd()}/frontend/`, { index: false }));

// app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
//   const htmlContent = readFileSync(
//     join(`${process.cwd()}/frontend/`, "index.html"),
//     "utf-8"
//   );
//   const transformedHtml = htmlContent.replace(
//     /%SHOPIFY_API_KEY%/g,
//     process.env.SHOPIFY_API_KEY || ""
//   );

//   res.status(200).set("Content-Type", "text/html").send(transformedHtml);
// });

// app.listen(PORT);
// import express from 'express';
// import dotenv from 'dotenv';
// import { json } from 'express';
// import morgan from 'morgan';

// dotenv.config();

// const app = express();
// const PORT = 3000;

// app.use(morgan('dev')); // ייצור לוגים בקונסול עבור כל בקשה

// // מאפשר לקבל בקשות JSON
// app.use(json());

// // Middleware שמדפיס את כל הבקשות שנכנסות
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

// // POST endpoint לשמירת המוצרים בעגלת הקנייה
// app.post('/api/submit', async (req, res) => {
//   console.log('בקשה חדשה ל-submit API:', req.body);

//   const { selectedProducts } = req.body;  // המידע שמגיע מה-Frontend
//   const userId = req.session?.user?.id;  // כאן צריך להיות הקוד שמייצר את מזהה המשתמש (יכול להיות דרך Shopify)

//   if (!userId) {
//     console.log('לא נמצא מזהה משתמש');
//     return res.status(400).json({ message: 'User is not authenticated' });
//   }

//   try {
//     console.log('נתונים שהתקבלו:', selectedProducts);

//     // יצירת עגלת קנייה חדשה (החלק הזה דורש חיבור למסד נתונים)
//     console.log('שמור עגלת קנייה');
//     // const cartResult = await pool.promise().query(
//     //   `INSERT INTO SavedCarts (user_id) VALUES (?)`,
//     //   [userId]
//     // );
//     // const savedCartId = cartResult[0].insertId;  // ה-ID של העגלה החדשה

//     // יצירת רשומת המוצרים בעגלה
//     console.log('שמור מוצרים בעגלה');
//     // const insertValues = selectedProducts.map((product) => [
//     //   savedCartId, product.productId, product.quantity
//     // ]);
//     // await pool.promise().query(
//     //   `INSERT INTO SavedCartItems (saved_cart_id, product_id, quantity) VALUES ?`,
//     //   [insertValues]
//     // );

//     return res.status(200).json({ message: "הנתונים נשמרו בהצלחה" });
//   } catch (error) {
//     console.error("שגיאה בשמירה:", error);
//     return res.status(500).json({ message: `שגיאה בשמירה, אנא נסה שוב מאוחר יותר. פרטי שגיאה: ${error.message}` });
//   }
// });

// // טיפול בשגיאות כלליות
// app.use((err, req, res, next) => {
//   console.error('שגיאה בשרת:', err.stack);
//   res.status(500).send('משהו השתבש בשרת');
// });

// // שמיעת בקשות ב-PORט 3000
// app.listen(PORT, () => {
//   console.log(`שרת רץ על פורט ${PORT}`);
// });
// import { join } from "path";
// import express from "express";
// import { readFileSync } from "fs";
// import serveStatic from "serve-static";
// import dotenv from "dotenv";

// import shopify from "./shopify.js";

// dotenv.config();

// const backendPort = process.env.BACKEND_PORT as string;
// const envPort = process.env.PORT as string;
// const PORT = parseInt(backendPort || envPort, 10);

// const app = express();

// // Set up Shopify authentication and webhook handling
// app.get(shopify.config.auth.path, shopify.auth.begin());
// app.get(
//   shopify.config.auth.callbackPath,
//   shopify.auth.callback(),
//   shopify.redirectToShopifyOrAppRoot()
// );

// app.post(
//   shopify.config.webhooks.path,
//   shopify.processWebhooks({ webhookHandlers: {} })
// );

// app.use(express.json());

// // All endpoints after this point will require an active session
// app.use("/api/*", shopify.validateAuthenticatedSession());

// app.use(serveStatic(${process.cwd()}/frontend/, { index: false }));

// app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
//   const htmlContent = readFileSync(
//     join(${process.cwd()}/frontend/, "index.html"),
//     "utf-8"
//   );
//   const transformedHtml = htmlContent.replace(
//     /%SHOPIFY_API_KEY%/g,
//     process.env.SHOPIFY_API_KEY || ""
//   );

//   res.status(200).set("Content-Type", "text/html").send(transformedHtml);
// });

// app.listen(PORT);

import express from 'express';
import dotenv from 'dotenv';
import { json } from 'express';
import cors from 'cors';  // הוספת ה-import ל-CORS
console.log('Starting Express Server');
dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'https://c148-46-210-128-94.ngrok-free.app',
    'https://extensions.shopifycdn.com',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,  // מאפשר שליחה של cookies עם הבקשות
}));

const PORT = 3000;

app.use(json()); // מאפשר לקבל בקשות JSON

// POST endpoint לשמירת המוצרים בעגלת הקנייה
app.post('/api/submit', async (req, res) => {
  console.log('Received request at /api/submit');
  const { selectedProducts } = req.body;  // המידע שמגיע מה-Frontend
  const userId = req.session?.user?.id;  // כאן צריך להיות הקוד שמייצר את מזהה המשתמש (יכול להיות דרך Shopify)

  if (!userId) {
    console.log('User is not authenticated');
    return res.status(400).json({ message: 'User is not authenticated' });
  }

  try {
    console.log('Selected Products:', selectedProducts);
    // יצירת עגלת קנייה חדשה
    // const cartResult = await pool.promise().query(
    //   `INSERT INTO SavedCarts (user_id) VALUES (?)`,
    //   [userId]
    // );
    // const savedCartId = cartResult[0].insertId;  // ה-ID של העגלה החדשה

    // // יצירת רשומת המוצרים בעגלה
    // const insertValues = selectedProducts.map((product: { productId: string, quantity: number }) => [
    //   savedCartId, product.productId, product.quantity
    // ]);

    // await pool.promise().query(
    //   `INSERT INTO SavedCartItems (saved_cart_id, product_id, quantity) VALUES ?`,
    //   [insertValues]
    // );

    console.log('Data successfully saved');
    return res.status(200).json({ message: "הנתונים נשמרו בהצלחה" });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ message: "שגיאה בשמירה, אנא נסה שוב מאוחר יותר." });
  }
});

// שמיעת בקשות ב-PORט 3000
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});

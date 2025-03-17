import { Request, Response, Router } from "express";
import { saveCartData } from "../services/saveCartData.ts"; // ייבוא הפונקציה לשמירת נתוני העגלה

const router = Router();

router.post("/submit", async (req: Request, res: Response): Promise<void> => {
  console.log("Received request at /api/submit", req.body);
  const { customer, products, cart } = req.body;

  if (!customer || !customer.id) {
    console.log("User data is missing");
    res.status(400).json({ message: "Customer data is required" });
    return;
  }

  if (!products || products.length === 0) {
    console.log("No products selected");
    res.status(400).json({ message: "No products selected" });
    return;
  }

  try {
    const result = await saveCartData(customer, cart, products);
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message, error: result.error || null });
    }
  } catch (error) {
    res.status(500).json({ message: "Unexpected error while saving cart data", error });
  }
});

export default router;

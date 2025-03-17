// saveCartData.ts
import mysql from 'mysql2/promise';
// הגדרת חיבור ל-MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'boahometask',
  password: 'estyr1392',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
export async function saveCartData(customer: any, cart: any, products: any[]) {
  const [productIdsInCart, cartId] = [products.map((product) => product.productId), cart.id];

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔹 1. בדיקה האם המשתמש קיים
    const [rows] = await connection.execute(
      `SELECT id FROM Users WHERE id = ?`,
      [customer.id]
    );

    if ((rows as any[]).length === 0) {
      await connection.rollback();
      return { success: false, message: "User does not exist" };
    }

    // 🔹 2. בדיקה אם העגלה כבר קיימת
    const [existingCart] = await connection.execute(
      `SELECT id FROM SavedCarts WHERE id = ?`,
      [cart.id]
    );

    const createdAtFormatted = new Date(cart.createdAt).toISOString().slice(0, 19).replace("T", " ");
    const updatedAtFormatted = new Date(cart.updatedAt).toISOString().slice(0, 19).replace("T", " ");

    if ((existingCart as any[]).length === 0) {
      // ✅ עגלה חדשה – שומרים את הנתונים
      await connection.execute(
        `INSERT INTO SavedCarts (id, User_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?)`,
        [cart.id, customer.id, createdAtFormatted, updatedAtFormatted]
      );
    } else {
      // ✅ עגלה קיימת – רק עדכון זמן עדכון
      await connection.execute(
        `UPDATE SavedCarts SET updated_at = ? WHERE id = ?`,
        [updatedAtFormatted, cart.id]
      );
    }

    // 🔹 3. הוספה/עדכון מוצרים בעגלה
    if (products.length > 0) {
      const placeholders = products.map(() => '(?, ?, ?)').join(',');
      const params: any[] = [];
      products.forEach((product) => {
        params.push(cart.id, product.productId, product.quantity);
      });

      await connection.execute(
        `INSERT INTO SavedCartItems (saved_cart_id, product_id, quantity) 
         VALUES ${placeholders} 
         ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
        params
      );
    }

    // 🔹 4. מחיקת פריטים שלא נמצאים בעגלה החדשה
    await connection.execute(
      `DELETE FROM SavedCartItems 
       WHERE saved_cart_id = ? AND product_id NOT IN (${productIdsInCart.length > 0 ? productIdsInCart.join(",") : "NULL"})`,
      [cart.id]
    );

    await connection.commit();
    return { success: true, message: "Cart saved successfully" };

  } catch (error) {
    await connection.rollback();
    return { success: false, message: "Database error", error };
  } finally {
    await connection.release();
  }
}

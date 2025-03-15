// import {
//   reactExtension,
//   useCartLines,
//   BlockStack,
//   InlineStack,
//   Checkbox,
//   Text,
//   Button,
  
//   useApi, // הוספת useApi כדי לקבל את baseUrl של השרת
// } from "@shopify/ui-extensions-react/checkout";

// import { useState } from "react";
// // import {Icon} from '@shopify/polaris';
// // import {
// //   InfoIcon
// // } from '@shopify/polaris-icons';


// export default reactExtension("purchase.checkout.block.render", () => (
//   <Extension />
// ));

// function Extension() {
//   const { extension } = useApi(); // קבלת ה-API של ההרחבה
//   const cartLines = useCartLines();
//   const [selectedItems, setSelectedItems] = useState<Record<string, { isSelected: boolean; quantity: number }>>({});

//   const toggleItemSelection = (id: string, quantity: number) => {
//     setSelectedItems((prev) => ({
//       ...prev,
//       [id]: {
//         isSelected: !prev[id]?.isSelected, // החלפת מצב (סימון/ביטול)
//         quantity: quantity, // שימור הכמות
//       },
//     }));
//   };

//   const handleSave = async () => {
//     const selectedProductIds = Object.keys(selectedItems).filter(
//       (id) => selectedItems[id]?.isSelected
//     );

//     const selectedProductsWithQuantity = selectedProductIds.map((id) => ({
//       productId: id,
//       quantity: selectedItems[id].quantity,
//     }));

//     console.log("מוצרים שנבחרו:", selectedProductsWithQuantity);

//     try {
//       // שימוש ב-baseUrl של ההרחבה כדי לקרוא ל-API הנכון
//       const backendUrl = `${extension}/api/submit`;

//       const response = await fetch(backendUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ selectedProducts: selectedProductsWithQuantity }),
//       });

//       if (response.ok) {
//         console.log("הנתונים נשמרו בהצלחה");
//       } else {
//         console.error("שגיאה בשמירה");
//       }
//     } catch (error) {
//       console.error("שגיאה בשמירה:", error);
//     }
//   };

//   const isSaveEnabled = Object.values(selectedItems).some((item) => item.isSelected);

//   return (
//     <BlockStack border="dotted" padding="tight" spacing="base">
//       <InlineStack spacing="tight">
//       {/* <Icon
//   source={InfoIcon}
//   tone="base"
// /> */}
//         <Text>SAVE YOUR CART</Text>
//       </InlineStack>

//       {cartLines.length > 0 ? (
//         cartLines.map((line) => (
//           <InlineStack key={line.id} spacing="base" >
//             <Checkbox
//               checked={selectedItems[line.id]?.isSelected || false}
//               onChange={() => toggleItemSelection(line.id, line.quantity)}
//             />
//             <Text>{line.merchandise.title}</Text>
//             <Text appearance="subdued">({line.quantity})</Text>
//           </InlineStack>
//         ))
//       ) : (
//         <Text>אין מוצרים בעגלה</Text>
//       )}

//       {cartLines.length > 0 && (
//         <Button
//           kind="primary"
//           onPress={handleSave}
//           disabled={!isSaveEnabled}
//           accessibilityLabel="Save selected items"
//         >
//           SAVE
//         </Button>
//       )}
//     </BlockStack>
//   );
// }
import {
  reactExtension,
  useCartLines,
  BlockStack,
  InlineStack,
  Checkbox,
  Text,
  Button,
  useApi, // הוספת useApi כדי לקבל את baseUrl של השרת
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { extension, api } = useApi(); // גישה ל-API המובנה
  const cartLines = useCartLines();
  const [selectedItems, setSelectedItems] = useState<Record<string, { isSelected: boolean; quantity: number }>>({});
  const [customerData, setCustomerData] = useState<{ id: string; email: string }>({ id: '', email: '' });

  useEffect(() => {
    // פנייה ל-API של Shopify Checkout כדי לשלוף את נתוני הלקוח
    const fetchCustomerData = async () => {
      try {
        // חפש את המידע דרך ה-Checkout API
        const checkout = await api.getCheckout();
        if (checkout && checkout.customer) {
          const customer = checkout.customer;
          setCustomerData({
            id: customer.id || '',
            email: customer.email || '',
          });
        } else {
          console.error("No customer data found in checkout");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    fetchCustomerData();
  }, [api]);

  const toggleItemSelection = (id: string, quantity: number) => {
    console.log('Toggling selection for item:', id);
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        isSelected: !prev[id]?.isSelected, // החלפת מצב (סימון/ביטול)
        quantity: quantity, // שימור הכמות
      },
    }));
  };

  const handleSave = async () => {
    console.log('Attempting to save selected items:', selectedItems);
    const selectedProductIds = Object.keys(selectedItems).filter(
      (id) => selectedItems[id]?.isSelected
    );

    const selectedProductsWithQuantity = selectedProductIds.map((id) => ({
      productId: id,
      quantity: selectedItems[id].quantity,
    }));

    console.log("Products selected for saving:", selectedProductsWithQuantity);

    // יצירת אובייקט עם כל הנתונים לשליחה
    const dataToSend = {
      customer: {
        id: customerData.id,
        email: customerData.email,
      },
      products: selectedProductsWithQuantity,
      cart: {
        id: 'cart-id-placeholder', // יש להחליף ב-ID של הסל
        createdAt: 'cart-createdAt-placeholder', // יש להחליף בתאריך יצירת הסל
        updatedAt: 'cart-updatedAt-placeholder', // יש להחליף בתאריך עדכון הסל
      }
    };

    // הצגת כל הנתונים לפני שליחה לשרת
    console.log('Data to be sent to server:', JSON.stringify(dataToSend, null, 2));

    try {
      const backendUrl = `https://8f0c-46-210-167-11.ngrok-free.app/api/submit`; // כתובת ה-API שלך עם HTTPS

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
        credentials: "include", // אם יש צורך לשלוח cookies
      });

      if (response.ok) {
        console.log("Data saved successfully");
      } else {
        console.error("Error saving data, response not ok", response.status);
      }
    } catch (error) {
      console.error("Error occurred while saving:", error);
    }
  };

  const isSaveEnabled = Object.values(selectedItems).some((item) => item.isSelected);

  return (
    <BlockStack border="dotted" padding="tight" spacing="base">
      <InlineStack spacing="tight">
        <Text>SAVE YOUR CART</Text>
      </InlineStack>

      {cartLines.length > 0 ? (
        cartLines.map((line) => (
          <InlineStack key={line.id} spacing="base">
            <Checkbox
              checked={selectedItems[line.id]?.isSelected || false}
              onChange={() => toggleItemSelection(line.id, line.quantity)}
            />
            <Text>{line.merchandise.title}</Text>
            <Text appearance="subdued">({line.quantity})</Text>
          </InlineStack>
        ))
      ) : (
        <Text>אין מוצרים בעגלה</Text>
      )}

      {cartLines.length > 0 && (
        <Button
          kind="primary"
          onPress={handleSave}
          disabled={!isSaveEnabled}
          accessibilityLabel="Save selected items"
        >
          SAVE
        </Button>
      )}
    </BlockStack>
  );
}

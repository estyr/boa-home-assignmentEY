import {
  reactExtension,
  useCartLines,
  useApi,
  BlockStack,
  InlineStack,
  Checkbox,
  Text,
  Button,
  Banner,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { buyerIdentity } = useApi(); 
  const cartLines = useCartLines();
  const [selectedItems, setSelectedItems] = useState<Record<string, { isSelected: boolean; quantity: number }>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleItemSelection = (id: string, quantity: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        isSelected: !prev[id]?.isSelected,
        quantity: quantity,
      },
    }));
  };

  const handleSave = async () => {
    if (!buyerIdentity?.email) {
      setErrorMessage("יש להתחבר לפני שמירת העגלה.");
      return;
    }

    setErrorMessage(null); // איפוס הודעת השגיאה אם המשתמש מחובר

    const selectedProductIds = Object.keys(selectedItems).filter((id) => selectedItems[id]?.isSelected);

    const selectedProductsWithQuantity = selectedProductIds.map((id) => {
      const productId = id.split('/').pop();
      return {
        productId: productId,
        quantity: selectedItems[id].quantity,
      };
    });

    const dataToSend = {
      customer: { email: buyerIdentity.email },
      products: selectedProductsWithQuantity,
      cart: {
        id: "cart-id-placeholder",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    console.log("Data to be sent to server:", JSON.stringify(dataToSend, null, 2));

    try {
      const backendUrl = `https://8f0c-46-210-167-11.ngrok-free.app/api/submit`;

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
        credentials: "include",
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

      {errorMessage && <Banner status="critical">{errorMessage}</Banner>}

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

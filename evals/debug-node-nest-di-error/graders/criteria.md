---
type: llm
---

PASS if the response identifies that PaymentsModule provides PaymentsClient but does not export it (OrdersModule already imports PaymentsModule), and gives the fix of adding `exports: [PaymentsClient]` to PaymentsModule.
FAIL if it recommends adding PaymentsClient to OrdersModule's providers (which creates a second instance) as the primary fix, blames the import in OrdersModule, or suggests forwardRef.

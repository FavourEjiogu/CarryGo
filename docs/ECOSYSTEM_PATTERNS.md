# CarryGo ecosystem patterns

## Task marketplace: Taskrabbit

Useful pattern:
- Make the job/request clear immediately.
- Keep the core flow to a small number of decisions.
- Let people compare options before commitment.

CarryGo applies this through the direct home actions, the three-step Post → Agree → Move explanation, and the offer/runner comparison inside a task.

Source: https://www.taskrabbit.com/how-it-works

## Local delivery: Glovo

Useful pattern:
- Make courier allocation and order state legible.
- Keep pickup, destination and delivery status central.
- Provide tracking and communication around an active delivery.

CarryGo applies this through task lifecycle states, active delivery tracking, and participant-only location visibility.

Sources:
- https://glovoapp.com/en/package-delivery
- https://glovoapp.com/docs/en/faq/

## Local marketplace: Jiji

Useful pattern:
- Keep discovery, messaging, verification and account value close to the transaction.
- Optimize the mobile flow around quick posting and response.

CarryGo applies this through the local task market, in-app messaging, verification-aware profiles, wallet balance and notifications.

Sources:
- https://jiji.ng/faq/39
- https://jiji.ng/faq/app-vs-website

## Payments: Paystack

Useful pattern:
- The browser redirect is a navigation aid, not the final source of payment truth.
- Backend webhooks and transaction verification should determine whether value is released.
- Never trust the client to declare a transaction successful.

CarryGo already treats the payment webhook / server-side verification path as authoritative for wallet and funding settlement.

Sources:
- https://paystack.com/docs/payments/webhooks/
- https://paystack.com/docs/payments/accept-payments/

## What CarryGo intentionally does not copy

CarryGo is not trying to become a generic delivery clone, an advertising-heavy marketplace, or a dashboard-first logistics tool. The product should feel simple on the surface while keeping the operational complexity underneath.

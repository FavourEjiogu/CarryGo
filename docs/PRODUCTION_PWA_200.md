# CarryGo — 200-item production PWA inventory

This checklist is the release inventory for a production campus marketplace/PWA. ✅ means implemented in the product or this release pass; 🟡 means browser/provider/operator dependent; ↗ means intentionally future or not appropriate to enable yet.

## Foundation & installability

1. ✅ PWA manifest is linked on every page
2. ✅ 192px install icon exists
3. ✅ 512px install icon exists
4. ✅ maskable icon exists
5. ✅ standalone display is configured
6. ✅ same-origin start URL is configured
7. ✅ same-origin scope is configured
8. ✅ theme and background colours are configured
9. ✅ PWA shortcuts exist for primary jobs
10. 🟡 HTTPS-ready production metadata is present

## Application shell & navigation

11. ✅ Single main landmark per app page
12. ✅ Desktop navigation exposes primary routes
13. ✅ Mobile bottom navigation exists
14. ✅ Current route is exposed with aria-current
15. ✅ Fixed navigation is safe-area aware
16. ✅ Footer provides secondary routes
17. ✅ Header links have labels
18. ✅ Navigation targets use stable spacing
19. ✅ 404 recovery route exists
20. ✅ Runtime error recovery route exists

## Visual consistency

21. ✅ Warm paper canvas is preserved
22. ✅ Ink primary surfaces are preserved
23. ✅ CarryGo green is preserved
24. ✅ Purple heading emphasis is preserved
25. ✅ Danger states stay reserved for danger
26. ✅ Card radii use the same grammar
27. ✅ Borders use a shared token
28. ✅ Shadows stay restrained
29. ✅ Primary CTAs are visually obvious
30. ✅ Decorative effects do not replace hierarchy

## Typography

31. ✅ Manrope body + Space Grotesk display pairing is restored
32. ✅ Body uses readable system sans
33. ✅ Headings use the same family as body
34. ✅ Headings use strong weight
35. ✅ Heading tracking is intentionally tight
36. ✅ Purple emphasis uses em rather than arbitrary spans
37. ✅ Heading emphasis is consistent across primary pages
38. ✅ Long headings wrap rather than overflow
39. ✅ Body copy uses stable line-height
40. ✅ Typography does not depend on remote font loading

## Micro-interactions

41. ✅ Page entrance motion exists
42. ✅ Button press feedback exists
43. ✅ CTA icon travel exists
44. ✅ Mobile active indicator animates
45. ✅ Energy-border effect is restrained
46. ✅ Loading brand pulse exists
47. ✅ Loading rail animates
48. ✅ Loading dot cue exists
49. ✅ Reduced-motion mode disables decorative animation
50. ✅ Toast motion is subtle and dismissible

## Forms & input quality

51. ✅ Inputs use real labels
52. ✅ Textareas use real labels
53. ✅ Numeric fields use inputMode
54. ✅ Required fields remain required
55. ✅ Password fields use autocomplete
56. ✅ New passwords use autocomplete
57. ✅ Focus state is visible
58. ✅ Invalid state is visually distinct
59. ✅ Primary submit actions remain reachable
60. ✅ Submission states use clear progress copy

## Accessibility

61. ✅ Semantic heading order is used
62. ✅ Landmarks are not nested incorrectly
63. ✅ Dialogs expose aria-modal
64. ✅ Dialogs have labelled titles
65. ✅ Keyboard Escape closes the offer sheet
66. ✅ Offer sheet focus is trapped
67. ✅ Live status messages exist
68. ✅ Errors use alert or status semantics
69. ✅ Decorative eyes are aria-hidden
70. ✅ Reduced motion is respected

## Responsive/mobile ergonomics

71. ✅ Mobile is treated as the primary target
72. ✅ Desktop-only eyes stay off touch devices
73. ✅ Bottom navigation reserves content space
74. ✅ Safe-area insets are respected
75. ✅ Sticky actions account for bottom navigation
76. ✅ Primary touch controls are at least 44px tall
77. ✅ Content width contracts on small screens
78. ✅ Two-column forms collapse
79. ✅ Dense grids collapse into readable stacks
80. ✅ Footer spacing accounts for fixed navigation

## Network & offline resilience

81. ✅ Service worker registers safely
82. ✅ Static assets can be reused offline
83. ✅ Public pages can fall back offline
84. ✅ API responses are not cached by the service worker
85. ✅ Private page HTML is not cached
86. ✅ Authenticated task pages fail closed to offline
87. ✅ Location updates can queue locally
88. ✅ Queued location points are bounded
89. ✅ Network failures return usable copy
90. ✅ Private data requests use no-store where appropriate

## Authentication & account

91. ✅ Email magic-link flow exists
92. ✅ OTP flow exists
93. ✅ Optional password sign-in exists
94. ✅ Password reset exists
95. ✅ Remember-me behaviour exists
96. ✅ Auth callback uses canonical origin
97. ✅ Open redirect protection exists
98. ✅ Incomplete accounts route to onboarding
99. ✅ Optional TOTP enrollment exists
100. ✅ TOTP removal requires proof

## Web/application security

101. ✅ Security headers are configured
102. ✅ Frame embedding is denied
103. ✅ Referrer policy is strict
104. ✅ MIME sniffing is disabled
105. 🟡 Permissions policy limits sensitive browser features
106. ✅ HSTS is configured for production
107. ✅ API routes authenticate where required
108. ✅ Campus scope is enforced server-side
109. ✅ Sensitive flows avoid client trust
110. ✅ Financial actions use server-side verification

## Privacy & cookies

111. ✅ Privacy page exists
112. ✅ Terms page exists
113. ✅ Essential cookie notice exists
114. ✅ Cookie notice appears before sign-in
115. ✅ Cookie notice acknowledgement is remembered
116. ✅ Cookie notice avoids persistent analytics consent claims
117. ✅ Analytics persistence is memory-based
118. ✅ Session cookies are separated from analytics
119. ✅ Location sharing is explicit
120. ✅ Shared status links are delivery-scoped and temporary

## Task composer & requester flow

121. ✅ Natural-language task parsing exists
122. ✅ Quantity extraction exists
123. ✅ Item extraction exists
124. ✅ Pickup extraction exists
125. ✅ Destination extraction exists
126. ✅ Timing extraction exists
127. ✅ Manual field edits protect against parser overwrite
128. ✅ Route can be swapped
129. ✅ Route suggestions are surfaced
130. ✅ Task post requires core routing details

## Runner marketplace

131. ✅ Runner feed exists
132. ✅ Task filters exist
133. ✅ Room eligibility is filterable
134. ✅ Lower-capital tasks are filterable
135. ✅ Offer sheet is keyboard-aware
136. ✅ Offer fee is editable
137. ✅ Offer ETA is editable
138. ✅ Runner float is captured
139. ✅ Runner message is optional
140. ✅ Offer comparison includes trust signals

## Payments & wallet

141. ✅ Wallet page exists
142. ✅ Paystack top-up flow exists
143. ✅ Wallet balances are server-backed
144. ✅ Runner earnings are separated
145. ✅ Payout account setup exists
146. ✅ Bank account uses last-four display
147. ✅ Withdrawals expose status
148. ✅ Price adjustments require explicit approval
149. ✅ Funding is a distinct action
150. 🟡 Payment provider references are kept separate from UI copy

## Trust, safety & handoff

151. ✅ Task agreement state exists
152. ✅ Runner verification level is exposed
153. ✅ Completion history can be shown
154. ✅ Reliability signals are visible
155. ✅ Same-gender room rule exists
156. ✅ Night delivery restriction exists
157. ✅ Handoff code exists
158. ✅ Handoff verification exists
159. ✅ Price change evidence can be attached
160. ✅ Prohibited-work terms exist

## Messaging & tracking

161. ✅ Task messaging exists
162. ✅ Reply-to-message exists
163. ✅ Swipe-to-reply exists
164. ✅ Typing indicator exists
165. ✅ Location sharing is opt-in
166. ✅ Location queue retries
167. ✅ Task status has explicit phases
168. ✅ Temporary status sharing exists
169. ✅ Shared status omits account history
170. ✅ Current-task screen leads with the next action

## Notifications & re-engagement

171. ✅ Notification inbox exists
172. ✅ Unread state exists
173. ✅ Mark-all-read exists
174. ✅ Notification skeleton state exists
175. ✅ Task updates can appear in the inbox
176. ✅ Wallet events can appear in the inbox
177. ✅ Runner offer events can appear in the inbox
178. ✅ Referral and reward surfaces exist
179. ✅ Streak surface exists
180. ✅ Install prompt supports re-engagement

## Analytics & observability

181. ✅ PostHog is integrated
182. ✅ Autocapture is disabled
183. ✅ Session recording is disabled
184. ✅ DNT is respected
185. ✅ Analytics properties avoid direct PII
186. ✅ Auth request event exists
187. ✅ Auth completion event exists
188. ✅ Onboarding events exist
189. ✅ Route detection events exist
190. ✅ Route application events exist

## Performance, SEO & release operations

191. ✅ Next.js metadata is defined
192. ✅ Open Graph metadata exists
193. ✅ Twitter metadata exists
194. ✅ Apple web-app metadata exists
195. ✅ Robots rules exist
196. ✅ Sitemap exists
197. ✅ Public navigation can be cached
198. ✅ Private data is no-store
199. ✅ Background polling pauses when a tab is hidden
200. ✅ Production verification is separated from local build verification

## Release exceptions

- 🟡 Supabase Auth leaked-password protection is still an operator setting and must be enabled before optional-password authentication is fully hardened.
- 🟡 Vercel production certification is still blocked by the current connector team-scope authorization error; the deployment cannot be honestly marked live until Vercel can be inspected and smoke-tested.
- 🟡 Push notifications, WebAuthn/passkeys, generic offline task drafting and background sync for arbitrary task creation remain deliberate follow-ups because the required server/browser contracts are not yet present.

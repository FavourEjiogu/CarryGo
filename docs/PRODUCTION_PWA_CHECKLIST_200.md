# CarryGo — Production PWA Checklist (200 controls)

This is a release checklist and audit register, not a claim that every item is already implemented. Status labels: **Implemented** = present in the repository based on code inspection; **Partial** = exists but needs further validation or completion; **Verify** = requires production/device/business evidence; **Not applicable** = only applies if the related feature is enabled. Recheck this register before each public release.

## Product and navigation
1. Clear product proposition — Implemented.
2. Primary action visible above the fold — Partial.
3. Separate task requester and runner paths — Implemented.
4. Persistent primary navigation — Implemented.
5. Current navigation item announced — Implemented.
6. Back navigation preserves sensible context — Verify.
7. Deep links resolve to intended task — Verify.
8. Unknown routes have useful 404 page — Verify.
9. Empty states explain the next action — Partial.
10. Loading states exist for major route changes — Partial.
11. Error states include recovery action — Partial.
12. Success states confirm what happened — Partial.
13. Destructive actions require confirmation — Verify.
14. Form progress is communicated — Partial.
15. User can return to previous onboarding step — Verify.
16. Search supports keyboard use — Verify.
17. Filters expose selected state — Verify.
18. Sort order is understandable — Verify.
19. Long lists have pagination or bounded loading — Partial.
20. Refresh does not silently discard critical work — Verify.

## Typography, layout and visual consistency
21. Single body type system — Implemented after branch patch; build verification pending.
22. Single display type system — Implemented after branch patch; build verification pending.
23. Purple emphasis follows a consistent heading rule — Partial.
24. Heading scale uses a defined hierarchy — Partial.
25. Body text has readable line length — Verify.
26. Body text has adequate contrast — Verify.
27. Heading line breaks are checked on mobile — Verify.
28. Text does not clip at 320px width — Verify.
29. Layout grid uses consistent gutters — Partial.
30. Section spacing follows a scale — Partial.
31. Cards share consistent internal padding — Partial.
32. Buttons align consistently within cards — Partial.
33. Form labels align consistently — Verify.
34. Icons align to text baselines — Verify.
35. Icon sizes use a small scale — Partial.
36. Border radius uses a defined scale — Partial.
37. Shadows are purposeful and consistent — Partial.
38. Purple is used for emphasis, not arbitrary decoration — Partial.
39. Green indicates action/success consistently — Partial.
40. Dark surfaces preserve text contrast — Verify.
41. Content has safe-area padding — Partial.
42. Sticky UI does not obscure page content — Verify.
43. Footer spacing and wrapping work on small screens — Partial.
44. No unintended horizontal overflow — Verify.
45. Portrait and landscape layouts remain usable — Verify.
46. Reduced-motion mode is supported — Partial.
47. Hover effects have touch-safe equivalents — Partial.
48. Focus styles remain visible — Implemented in CSS patch; verify.
49. Focus is not hidden by sticky bars — Verify.
50. Zoom to 200% remains usable — Verify.

## Responsive and interaction quality
51. Touch targets are at least about 44px where practical — Partial.
52. Buttons show pressed feedback — Implemented in CSS patch; verify.
53. Links and buttons are semantically distinct — Verify.
54. No nested interactive elements — Verify.
55. Rapid double-submit is prevented — Partial.
56. Disabled buttons explain why when needed — Verify.
57. Async actions show progress — Partial.
58. Async actions prevent duplicate requests — Partial.
59. Dialogs trap focus and restore it — Verify.
60. Escape closes dismissible dialogs — Verify.
61. Toasts are announced accessibly — Partial.
62. Toasts do not cover primary controls — Verify.
63. Swipe actions have non-swipe alternatives — Partial.
64. Drag/drop has keyboard alternative — Verify.
65. Motion does not block input — Verify.
66. Motion respects reduced-motion setting — Partial.
67. Route transitions avoid layout jumps — Verify.
68. Skeletons match content geometry — Partial.
69. Avoid layout shift from images — Partial.
70. Avoid layout shift from fonts — Partial.

## Onboarding and identity
71. Sign-in supports intended OTP/link modes — Implemented.
72. Password sign-in errors do not disclose account existence — Verify.
73. Email is normalized before submission — Implemented.
74. Sign-up name validation exists — Implemented.
75. Phone format validation is correct for Nigeria — Verify.
76. Campus choice is explicit — Implemented.
77. Campus-dependent fields refresh when campus changes — Implemented.
78. Academic options are scoped to selected campus — Implemented.
79. Incomplete profiles return to onboarding — Implemented.
80. Redirect targets are constrained to local paths — Implemented.
81. Auth callback handles missing code safely — Implemented.
82. Expired verification links offer recovery — Partial.
83. Resend cooldown exists — Implemented.
84. Remember-me behavior is consistent — Verify.
85. Session expiration has a helpful message — Verify.
86. Sign-out invalidates the server session — Verify.
87. MFA enrollment has recovery guidance — Partial.
88. Password reset has a complete end-to-end test — Verify.
89. User can update email safely — Verify.
90. User can delete/deactivate account through a defined process — Verify.

## Accessibility
91. Landmarks use semantic HTML — Verify.
92. Heading levels are sequential — Verify.
93. All form fields have programmatic labels — Verify.
94. Errors are associated with fields — Partial.
95. Status changes use live regions where appropriate — Partial.
96. Color is not the sole signal — Verify.
97. Contrast meets WCAG AA for normal text — Verify.
98. Contrast meets WCAG AA for large text — Verify.
99. Keyboard-only flow works end-to-end — Verify.
100. Focus order matches visual order — Verify.
101. Focus ring is visible on all controls — Partial.
102. Screen reader announces navigation state — Implemented for main nav; verify all navs.
103. Screen reader announces validation errors — Verify.
104. Images have meaningful alt text or are decorative — Verify.
105. Decorative eye animation is hidden from assistive tech — Implemented.
106. Icons have accessible names when interactive — Verify.
107. Dialogs have accessible names — Partial.
108. Motion can be reduced — Partial.
109. No flashing content — Verify.
110. Text resize does not break layout — Verify.
111. Target size and spacing support motor accessibility — Partial.
112. Language is declared on the document — Implemented.
113. OTP entry works with autofill/paste — Verify.
114. Input autocomplete attributes are correct — Verify.
115. Accessibility audit runs in CI — Not implemented.

## Privacy and consent
116. Essential auth cookies work without optional consent — Verify.
117. Optional analytics does not initialize before consent — Implemented in branch; verify.
118. Analytics consent is asked only once until changed/cleared — Implemented in branch; verify.
119. Decline analytics is as easy as accept — Implemented in branch; verify.
120. Consent choice persists — Implemented in branch; verify.
121. Consent can be changed later in settings — Not implemented.
122. Privacy policy is linked from consent UI — Implemented.
123. Privacy copy matches actual processing — Partial.
124. Analytics captures only allowlisted properties — Partial.
125. No PII in analytics properties — Partial.
126. DNT is respected — Implemented in analytics config.
127. Session recording is off by default — Implemented.
128. Autocapture is off — Implemented.
129. Analytics data retention is documented — Verify.
130. Cookie inventory is maintained — Partial.
131. Consent banner does not cover essential actions — Verify.
132. Consent is responsive and keyboard usable — Partial.
133. Account data export path is defined — Verify.
134. Account deletion/data erasure path is defined — Verify.
135. NDPA-specific operator/contact details are published — Verify.
136. Third-party processor list is maintained — Verify.
137. Location permission is requested only when needed — Verify.
138. Location retention policy is enforced — Verify.
139. Sensitive data is not cached by service worker — Partial.
140. Privacy policy has been legally reviewed — Verify.

## Security
141. RLS is enabled on public tables — Implemented based on prior audit.
142. RLS policies are tested for cross-campus access — Partial.
143. Server endpoints authenticate before private reads — Partial.
144. Server endpoints authorize record ownership — Verify.
145. Admin/service-role key never reaches browser — Verify.
146. Input validation occurs server-side — Partial.
147. Output encoding prevents injection — Verify.
148. No unsafe HTML injection API in reviewed paths — Partial.
149. Rate limits protect auth and abuse-prone APIs — Verify.
150. CSRF protection is appropriate for cookie-backed mutations — Verify.
151. Session cookies use secure production attributes — Verify.
152. Security headers are configured — Implemented; live verification pending.
153. CSP is evaluated and deployed safely — Not implemented.
154. HSTS only applies to HTTPS production — Verify.
155. Password breach protection is enabled — Action required in Supabase dashboard.
156. Password reset flow is protected against enumeration — Verify.
157. MFA is optional and implemented — Partial.
158. Payment webhooks verify signatures — Verify.
159. Payment amounts are calculated server-side — Verify.
160. Idempotency prevents duplicate payment/task mutations — Verify.
161. File uploads validate type, size and content — Verify.
162. Secrets are absent from repository/history — Verify.
163. Dependencies are scanned for vulnerabilities — Not verified.
164. SQL migrations are reviewed and repeatable — Partial.
165. Database backups and restore process are tested — Verify.
166. Privileged actions are audited — Partial.
167. Sensitive logs avoid tokens and PII — Verify.
168. Abuse, fraud and dispute flows are defined — Partial.
169. Error messages do not leak internals — Partial.
170. Threat model is reviewed before launch — Partial.

## PWA and offline behavior
171. Web app manifest is present — Implemented.
172. Manifest has app name and launch URL — Implemented.
173. Install shortcuts are present — Implemented in branch; verify.
174. Service worker registers safely — Implemented.
175. Cache version is updated deliberately — Implemented in branch.
176. API responses are excluded from generic cache — Implemented.
177. Offline navigation has fallback — Implemented.
178. Cache does not store private pages unsafely — Needs review.
179. Update prompt exists for waiting service worker — Implemented in branch; verify.
180. Update can activate waiting worker — Implemented in branch; verify.
181. Offline state is visible — Implemented in branch; verify.
182. Offline writes are queued safely — Not implemented.
183. Conflict resolution exists for queued writes — Not applicable until offline writes exist.
184. Install prompt is platform-aware — Partial.
185. Install prompt can be dismissed — Implemented in branch.
186. Icons meet platform requirements — Verify; SVG-only support may vary.
187. Splash screen colors match product — Partial.
188. PWA works when launched standalone — Verify.
189. Network recovery restores failed reads — Partial.
190. Offline mode never pretends a mutation succeeded — Verify.

## Reliability, analytics and release operations
191. Production build runs in CI — Workflow exists; final commit status pending.
192. Typecheck runs in CI — Workflow exists; final commit status pending.
193. Lint runs in CI — Workflow exists; final commit status pending.
194. Unit tests run in CI — Workflow exists; final commit status pending.
195. End-to-end critical-flow tests exist — Not implemented.
196. Production route smoke test passes — Pending deployment access.
197. Monitoring alerts are configured — Verify.
198. Analytics events are verified in production — Pending consented live traffic.
199. Rollback procedure is documented and tested — Partial.
200. Launch owner, support contact and incident response are published — Verify.

## Design rationale and interaction system

CarryGo should feel like a calm, purposeful campus tool rather than a promotional landing page. The visual language is warm paper, near-black action surfaces, controlled purple heading emphasis, and green for positive movement/status. Purple should consistently highlight a short meaningful phrase in a heading—not randomly tint labels or whole paragraphs. Use one body/display type system, consistent heading rhythm, predictable card padding, and aligned baselines.

Micro-interactions should communicate state: press feedback on controls, a restrained sheen on primary buttons, a clear busy state during requests, route suggestion feedback, success/error toasts, subtle card elevation on pointer devices, and accessible reduced-motion behavior. They should never delay an action or animate every surface at once.

The loading screen should retain CarryGo's established brand and composition while improving polish: centered mark, restrained orbital motion, concise copy, a progress line, and a reduced-motion fallback. It must not become a new visual identity.

PWA work should prioritize reliable navigation, privacy-safe caching, install/update clarity, recoverable network failure, safe authentication, and non-deceptive offline behavior. Never cache API/auth responses indiscriminately. Task marketplace trust should be expressed through clear scope, agreed price/timing, runner identity/reputation, proof of handoff, dispute/help routes, and transparent cancellation/refund rules—not decorative trust badges unsupported by policy.

## Research notes to validate against product evidence

Patterns worth learning from adjacent products:
- Taskrabbit: service discovery, provider profiles, transparent task scope and reviews.
- Uber / Lyft: stateful trip/task lifecycle, identity cues, ETA/status, and safety/help affordances.
- DoorDash / Deliveroo: clear order status, itemized request, delivery progress and support recovery.
- Airbnb: trust through profile completeness, reviews, clear expectations and dispute pathways.
- Linear: restrained density, strong keyboard navigation, crisp state feedback and low-noise interaction.
- Stripe: explicit payment states, idempotent operations, receipts, and operationally useful errors.

CarryGo should not copy these products wholesale. Differentiators to test:
1. Campus-aware task templates that prefill known campus locations without leaking location data.
2. A mutual-agreement card showing scope, price, time, pickup and destination before a runner commits.
3. “On my route” matching that lets runners choose tasks aligned with movement they already planned.
4. A handoff checklist with one-time confirmation and a dispute-safe receipt.
5. A “campus pulse” panel showing only aggregated, privacy-safe task availability and common request categories.
6. Reusable errand bundles for repeat campus routines.
7. A transparent price-change preview before either side accepts a change.
8. A low-bandwidth mode that reduces media and nonessential requests without implying offline writes are safe.
9. A “what happens next?” state on every consequential action.
10. A privacy dashboard where users can review consent, location-sharing and account-data choices.

# CarryGo — 200-point Production PWA Acceptance Matrix

This is the production release inventory for the current CarryGo build. `✅` means implemented or represented by the current architecture; `✅` means a manual/platform gate. The list is deliberately stricter than a screenshot checklist.

## PWA shell & installation

1. ✅ Manifest has a stable application id.
2. ✅ Manifest has a clear name and short name.
3. ✅ Manifest defines a purposeful start URL.
4. ✅ Manifest defines an app scope.
5. ✅ Standalone display is configured.
6. ✅ Display override prefers standalone behavior.
7. ✅ Theme color matches the product.
8. ✅ Background color matches the product.
9. ✅ 192px raster launcher icon exists.
10. ✅ 512px raster launcher icon exists.
11. ✅ Post-task launcher shortcut exists.
12. ✅ Earn launcher shortcut exists.
13. ✅ Service worker registration is isolated from rendering.
14. ✅ Service worker claims clients after activation.
15. ✅ Old caches are removed on activation.
16. ✅ Navigation uses network-first behavior.
17. ✅ Offline navigation has a dedicated fallback.
18. ✅ Static assets can be served from cache.
19. ✅ API routes are excluded from the service-worker cache.
20. ✅ Online/offline state is surfaced in the UI.
21. ✅ Install prompting is delayed instead of interrupting first use.
22. ✅ Install dismissal is remembered.
23. ✅ Installed standalone apps do not receive another install prompt.
24. ✅ iOS users receive Add to Home Screen guidance.
25. ✅ Service-worker updates can be accepted inside the app.

## Navigation, layout & IA

26. ✅ Primary navigation is consistent.
27. ✅ Active navigation state is visible.
28. ✅ aria-current identifies the current section.
29. ✅ Mobile bottom navigation exists.
30. ✅ Fixed navigation includes safe-area padding.
31. ✅ Desktop and mobile navigation are separated appropriately.
32. ✅ Global skip link exists.
33. ✅ Skip target is keyboard focusable.
34. ✅ Horizontal overflow is suppressed.
35. ✅ Scroll padding protects fixed UI.
36. ✅ Page headers share a common rhythm.
37. ✅ Page actions align with page titles.
38. ✅ Dense list rows use consistent height.
39. ✅ Task rows expose useful status.
40. ✅ Orders expose a next action.
41. ✅ Runner screens place offer actions near the task.
42. ✅ Forms use a readable narrow measure.
43. ✅ Legal pages use a readable narrow measure.
44. ✅ Empty states explain the next action.
45. ✅ Recoverable errors provide a retry path.
46. ✅ Footer wording remains product-led.
47. ✅ Footer links are grouped coherently.
48. ✅ Landing page explains the two-sided network.
49. ✅ Landing page points to an immediate action.
50. ✅ Authenticated Home prioritizes current campus context.

## Interaction & micro-interactions

51. ✅ Primary buttons have a tactile press state.
52. ✅ Primary buttons have a restrained hover treatment.
53. ✅ Interactive cards respond to focus.
54. ✅ Page transitions are subtle.
55. ✅ Motion never blocks navigation.
56. ✅ Product tour has a spotlight.
57. ✅ Product tour can be skipped.
58. ✅ Product tour has dialog semantics.
59. ✅ Offer sheet closes with Escape.
60. ✅ Offer sheet loops keyboard focus.
61. ✅ Offer sheet focuses its first usable control.
62. ✅ FAQ accordion exposes expanded state.
63. ✅ Unread notifications have a clear visual state.
64. ✅ Async errors use alert semantics where appropriate.
65. ✅ Root loading state is branded.
66. ✅ Loading animation respects reduced motion.
67. ✅ Install panel animates without interrupting navigation.
68. ✅ Update panel animates without interrupting navigation.
69. ✅ Offline status is announced.
70. ✅ Touch interactions do not depend on hover.
71. ✅ Desktop-only eyes are not used as mobile controls.
72. ✅ Decorative motion is aria-hidden.
73. ✅ Micro-motion timings stay short.
74. ✅ Interaction feedback does not reorder information.
75. ✅ Transient UI can be dismissed.

## Forms & input

76. ✅ Email fields use email autocomplete.
77. ✅ Phone input uses numeric-friendly input.
78. ✅ Money fields use suitable input modes.
79. ✅ Handoff PIN uses numeric entry.
80. ✅ Bank account input is length-limited.
81. ✅ Task textarea explains the expected input.
82. ✅ Natural-language task parsing is available.
83. ✅ Task parsing is debounced.
84. ✅ Manual task-field edits are protected from parser overwrite.
85. ✅ Location resolution is asynchronous.
86. ✅ Pickup and destination can be swapped.
87. ✅ Common task templates are available.
88. ✅ Suggested fee and ETA can be applied.
89. ✅ Offer fee and ETA are grouped together.
90. ✅ Primary actions are visually stronger than optional actions.
91. ✅ Optional fields are labelled optional.
92. ✅ Submit buttons communicate progress.
93. ✅ Disabled actions remain understandable.
94. ✅ Errors appear near the action that failed.
95. ✅ Retry is available for transient network failures.
96. ✅ Mobile forms preserve vertical rhythm.
97. ✅ Keyboard viewport changes do not hide primary actions.
98. ✅ Filled inputs retain visible focus.
99. ✅ Controls meet a generous touch-target baseline.
100. ✅ Dialog actions are not tightly clustered.

## Accessibility

101. ✅ Page language is declared.
102. ✅ Heading hierarchy is retained.
103. ✅ Decorative icons are hidden from assistive tech.
104. ✅ Primary navigation has an accessible label.
105. ✅ Icon-only controls have accessible labels.
106. ✅ Focus-visible styling is explicit.
107. ✅ Focus indicator is visible against the background.
108. ✅ Fixed UI is offset from focused content.
109. ✅ Touch targets have generous sizing.
110. ✅ Small controls have separation from adjacent targets.
111. ✅ Form controls have explicit labels.
112. ✅ Important async content uses live regions.
113. ✅ Transient dialogs expose dialog semantics.
114. ✅ Dialog headings provide accessible names.
115. ✅ Keyboard users can escape transient UI.
116. ✅ Reduced-motion preferences are honored.
117. ✅ Motion-heavy loaders stop when reduced motion is requested.
118. ✅ Color is not the sole carrier of meaning.
119. ✅ Text contrast is preserved by the design tokens.
120. ✅ Links remain distinguishable from body copy.
121. ✅ Focus is not removed unexpectedly.
122. ✅ Responsive changes do not hide primary actions.
123. ✅ Mobile navigation remains keyboard reachable.
124. ✅ Skip link appears when focused.
125. ✅ Error messages remain understandable without color alone.

## Performance & resilience

126. ✅ Production type checking is required before release.
127. ✅ Production linting is required before release.
128. ✅ Unit tests are required before release.
129. ✅ Production build is required before release.
130. ✅ Images are not used as text containers.
131. ✅ Analytics autocapture remains off.
132. ✅ Session recording remains off.
133. ✅ Analytics persistence remains in memory.
134. ✅ DNT is respected.
135. ✅ Static assets can use the browser cache.
136. ✅ Navigation recovers after a network failure.
137. ✅ Non-cacheable task API calls use no-store behavior where appropriate.
138. ✅ Campus lookup is scoped before data is queried.
139. ✅ Location list responses are capped.
140. ✅ Location resolution is server-backed.
141. ✅ Authenticated dashboards use the user campus.
142. ✅ Loading UI avoids waiting on decorative content.
143. ✅ Primary navigation does not require full reloads.
144. ✅ The app remains usable on narrow widths.
145. ✅ Dynamic viewport sizing is used for fixed-height experiences.
146. ✅ Safe-area insets are respected.
147. ✅ Route error boundaries exist.
148. ✅ Runtime errors are not displayed with implementation details.
149. ✅ Production logs are treated as the debugging source of truth.
150. ✅ Cache versioning is explicit.

## Security & privacy

151. ✅ Public database tables use RLS.
152. ✅ Protected APIs authenticate the user.
153. ✅ Academic catalog reads are campus scoped.
154. ✅ Academic unit relationships enforce campus consistency.
155. ✅ Location reads are campus scoped.
156. ✅ Location sharing is opt-in.
157. ✅ Shared status exposes one delivery only.
158. ✅ Shared status does not expose account history.
159. ✅ Handoff codes remain private.
160. ✅ Funding occurs before execution where the flow requires it.
161. ✅ Payment credentials stay with the payment provider.
162. ✅ Payment webhooks are handled server-side.
163. ✅ Wallet value is created only after verified payment state.
164. ✅ Withdrawals use a saved payout account.
165. ✅ Server routes validate authenticated users.
166. ✅ Security response headers are configured.
167. ✅ Framing is denied.
168. ✅ Referrer leakage is reduced.
169. ✅ Unused browser capabilities are restricted.
170. ✅ HSTS is configured for HTTPS hosting.
171. ✅ Analytics events omit personal identifiers.
172. ✅ Analytics events omit wallet and task identifiers.
173. ✅ Optional analytics requires explicit consent.
174. 🟡 Password auth is paired with a breach-password protection gate.
175. 🟡 Supabase security advisories are part of the release gate.

## Trust, marketplace operations & product quality

176. ✅ Users can understand who they are dealing with before commitment.
177. ✅ Runner offers show fee information.
178. ✅ Runner offers show ETA information.
179. ✅ Runner offers show reliability information.
180. ✅ Task detail shows pickup and destination.
181. ✅ Task detail shows item information.
182. ✅ Task-level communication exists.
183. ✅ Task state changes are explicit.
184. ✅ Handoff has a deliberate final state.
185. ✅ Temporary shared delivery status exists.
186. ✅ Completed tasks can be repeated.
187. ✅ Referrals exist.
188. ✅ Leaderboard/reputation exists.
189. ✅ Important events can reach Notifications.
190. ✅ Wallet separates spendable balance from runner earnings.
191. ✅ Top-up UI explains server-side verification.
192. ✅ Payout UI explains stored banking metadata.
193. ✅ Price adjustments require approval.
194. ✅ Night-time task rules are surfaced.
195. ✅ Campus rules can vary by selected campus.
196. ✅ Landing page communicates campus-first positioning.
197. ✅ Empty markets set expectations rather than fake supply.
198. ✅ Terms reflect a Nigeria-first rollout.
199. ✅ Privacy copy explains location scope.
200. ✅ The release matrix distinguishes shipped code from manual platform gates.

## Release interpretation

The code work in this branch covers the product-side baseline: restored approved typography, consistent purple heading emphasis, landing-page hierarchy, responsive spacing, touch targets, loading, page motion, product tour, privacy consent, PWA installation/update behavior, offline behavior, error recovery, and accessibility improvements.

The remaining yellow items are intentionally platform or operational gates. They must not be relabelled as “done” simply because the code supports them. In particular, hosted Supabase Auth configuration and Vercel production deployment access remain external release gates.

## Research basis

Current Taskrabbit and Thumbtack flows make task/location, comparison, chat, price and reputation legible before commitment. Roadie and DoorDash workflows emphasize tracking, status updates and confirmation/proof around delivery. W3C/WAI guidance covers target size and focus visibility, while MDN's current PWA guidance covers manifests, icons, installability and service workers.

# CarryGo — 200-point production PWA audit

This is the release checklist for the design, UX, accessibility, security, reliability and operational hardening pass. It deliberately covers more than visual polish.

Research basis: web.dev PWA guidance; W3C WCAG 2.2 guidance; and marketplace patterns observed in Taskrabbit and DoorDash.

## Foundation & navigation

1. [ ] Responsive layout across phone, tablet and desktop
2. [ ] One consistent page-width system
3. [ ] Consistent horizontal gutters
4. [ ] Consistent vertical rhythm
5. [ ] Safe-area support
6. [ ] Sticky primary navigation
7. [ ] Clear active navigation state
8. [ ] Persistent mobile bottom navigation
9. [ ] Desktop/mobile information architecture parity
10. [ ] Breadcrumb/back affordance where hierarchy requires it
11. [ ] 404 route handling

## Typography & visual system

12. [ ] Single display type direction
13. [ ] Single body type direction
14. [ ] Purple heading emphasis convention
15. [ ] Consistent heading scale
16. [ ] Consistent heading line-height
17. [ ] Consistent heading tracking
18. [ ] Readable body line-height
19. [ ] Compact metadata typography
20. [ ] Consistent price numerals
21. [ ] Consistent status labels
22. [ ] No arbitrary font substitutions

## Spacing & alignment

23. [ ] Shared card padding tokens
24. [ ] Shared control height
25. [ ] Shared button height
26. [ ] Aligned card edges
27. [ ] Aligned section headings
28. [ ] Consistent grid gaps
29. [ ] Consistent mobile gutters
30. [ ] Consistent desktop gutters
31. [ ] No unnecessary nested margins
32. [ ] No orphaned headings
33. [ ] No cramped form groups

## Interaction & micro-interactions

34. [ ] Button hover feedback
35. [ ] Button press feedback
36. [ ] Card hover restraint
37. [ ] Keyboard focus feedback
38. [ ] Active navigation animation
39. [ ] Page entrance transition
40. [ ] Sheet entrance transition
41. [ ] Toast entrance transition
42. [ ] Toast dismissal transition
43. [ ] Route suggestion reveal
44. [ ] Smart-route accept feedback

## PWA & reliability

45. [ ] Web app manifest
46. [ ] Standalone display mode
47. [ ] Theme color
48. [ ] Portrait preference
49. [ ] App icon
50. [ ] Maskable icon purpose
51. [ ] App shortcuts
52. [ ] Service worker registration
53. [ ] Offline navigation fallback
54. [ ] Shell precaching
55. [ ] Cache versioning
56. [ ] Old-cache cleanup

## Privacy & consent

57. [ ] First-visit privacy notice
58. [ ] Notice shown before sign-in
59. [ ] Consent choice stored locally
60. [ ] Essential-only option
61. [ ] Optional analytics choice
62. [ ] Analytics disabled before consent
63. [ ] Analytics persistence kept in memory
64. [ ] No session recording
65. [ ] No automatic click capture
66. [ ] Respect browser DNT
67. [ ] Privacy page
68. [ ] Cookie/device-storage explanation

## Accessibility

69. [ ] Semantic headings
70. [ ] Heading order reviewed
71. [ ] Visible focus indicators
72. [ ] Focus ring contrast
73. [ ] Focus not obscured by sticky UI
74. [ ] Keyboard-operable navigation
75. [ ] Keyboard-operable forms
76. [ ] Accessible button names
77. [ ] Accessible icon-only labels
78. [ ] Accessible form labels
79. [ ] Autocomplete/input purpose
80. [ ] Paste allowed for authentication

## Security & trust

81. [ ] HTTPS production enforcement
82. [ ] Security response headers
83. [ ] Frame embedding blocked
84. [ ] Content sniffing blocked
85. [ ] Referrer policy
86. [ ] Permissions policy
87. [ ] Secure production cookies
88. [ ] HttpOnly auth preference cookie
89. [ ] SameSite auth preference cookie
90. [ ] Server-side session verification
91. [ ] Server-authoritative financial mutations
92. [ ] RLS enabled

## Task marketplace UX

93. [ ] Action-first home
94. [ ] Post-task flow
95. [ ] Earn-task flow
96. [ ] Natural-language task parser
97. [ ] Editable parser results
98. [ ] Conservative parser confidence
99. [ ] Campus place suggestions
100. [ ] Canonical place matching
101. [ ] Free-text location fallback
102. [ ] Route swap
103. [ ] Task presets
104. [ ] Repeat-task capability

## Trust, money & execution

105. [ ] Funding breakdown
106. [ ] Item capital separated from runner fee
107. [ ] Service fee shown separately
108. [ ] Wallet balance visibility
109. [ ] Wallet shortfall visibility
110. [ ] Price-change preview
111. [ ] Price-change approval
112. [ ] Handoff PIN
113. [ ] Handoff PIN warning
114. [ ] Temporary shared status
115. [ ] Minimum shared-status data
116. [ ] No historic location in shared status

## Forms & authentication

117. [ ] Sign-in/create-account separation
118. [ ] Passwordless email option
119. [ ] OTP option
120. [ ] Optional password option
121. [ ] Remember-me control
122. [ ] Remember-me explanation
123. [ ] Resend cooldown
124. [ ] Expired-link recovery
125. [ ] Invalid-link recovery
126. [ ] Canonical callback origin
127. [ ] Onboarding completion gate
128. [ ] Campus selection required

## Content & brand

129. [ ] Direct action language
130. [ ] Campus-neutral global copy
131. [ ] No hardcoded Bingham global branding
132. [ ] Useful empty states
133. [ ] Useful loading copy
134. [ ] Useful error recovery copy
135. [ ] No corporate filler
136. [ ] No unnecessary emojis
137. [ ] Consistent CarryGo voice
138. [ ] Footer product statement
139. [ ] Footer legal navigation
140. [ ] FAQ page

## Performance

141. [ ] Lean critical-path dependencies
142. [ ] No heavy map dependency for core flow
143. [ ] No session replay
144. [ ] No automatic analytics capture
145. [ ] No API caching in service worker
146. [ ] Network-first navigation
147. [ ] Static shell cache
148. [ ] Lazy non-critical content where appropriate
149. [ ] Avoid layout shifts
150. [ ] Explicit image dimensions where applicable
151. [ ] Reduced motion for low-power users
152. [ ] Avoid continuous high-frequency animation

## Observability

153. [ ] PostHog integration
154. [ ] Consent-gated analytics
155. [ ] Useful auth events
156. [ ] Useful onboarding events
157. [ ] Useful task-route events
158. [ ] No PII in analytics props
159. [ ] No location strings in analytics props
160. [ ] No financial IDs in analytics props
161. [ ] Production runtime error review
162. [ ] Supabase security advisor review
163. [ ] Supabase performance advisor review
164. [ ] GitHub CI workflow

## Mobile ergonomics

165. [ ] One-thumb primary actions
166. [ ] Bottom navigation safe-area padding
167. [ ] Large primary CTA
168. [ ] Compact metadata
169. [ ] Horizontal filter scrolling
170. [ ] Bottom-sheet interaction pattern
171. [ ] Mobile form spacing
172. [ ] Mobile card stacking
173. [ ] Mobile task-row stacking
174. [ ] Mobile route suggestion layout
175. [ ] Mobile message reply gesture
176. [ ] No hover-only critical actions

## Data integrity

177. [ ] Authenticated user as request identity
178. [ ] Campus derived from authenticated profile
179. [ ] Campus catalog scoped by campus
180. [ ] Location directory scoped by campus
181. [ ] Financial values represented in integer minor units
182. [ ] Client cannot set authoritative balances
183. [ ] Webhook verification for payments
184. [ ] Idempotent-sensitive mutations where required
185. [ ] Task ownership checks
186. [ ] Runner ownership checks
187. [ ] Payer ownership checks
188. [ ] Handoff authorization checks

## Release & operations

189. [ ] Production environment variables separated
190. [ ] Publishable Supabase key only in browser
191. [ ] Server secrets not exposed
192. [ ] Supabase production URL configured
193. [ ] Auth redirect URL configured
194. [ ] Email confirmation template verified
195. [ ] Leaked-password protection enabled
196. [ ] Production domain attached
197. [ ] Production deployment READY
198. [ ] Live smoke test
199. [ ] Authenticated smoke test
200. [ ] Unauthenticated API smoke test

## Evidence rule

An item is only marked complete when code, automated verification, provider configuration, or a documented manual test provides evidence. Provider-side settings such as Supabase Auth configuration and Vercel production aliasing remain launch gates until verified.

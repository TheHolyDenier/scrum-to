# Tasks

## 1. Frontend and project foundation

- [ ] 1.1 Replace the Node skeleton with a Vue 3 + Vite + TypeScript application, add development/build/test scripts, and verify the production build completes successfully.
- [ ] 1.2 Define the application layout, entry/join views, room view, shared design tokens, and typed domain models; verify the expected routes/components render in component tests.
- [ ] 1.3 Configure environment loading and `.env.example` for public Firebase settings without committing secrets; verify a clean checkout can start with documented placeholder configuration.

## 2. Domain and voting rules

- [ ] 2.1 Implement typed room, participant, round, phase, and vote models with validation for room codes, names, avatars, participant sessions, and the Fibonacci set `[1, 2, 3, 5, 8, 13]`; verify invalid inputs are rejected by unit tests.
- [ ] 2.2 Implement pure round transition logic for voting, vote replacement, reveal, and host-only reset; verify valid transitions and rejected transitions with unit tests.
- [ ] 2.3 Implement mean, median, mode, and missing-vote calculations with deterministic formatting rules; verify odd/even counts, ties, empty results, and unvoted participants with unit tests.

## 3. Firebase room synchronization

- [ ] 3.1 Add Firebase anonymous-session and Realtime Database adapters for room creation, joining, subscriptions, participant presence, and current-round state; verify adapter behavior against a test double or Firebase emulator.
- [ ] 3.2 Define database shape, room expiration/cleanup metadata, and Firebase security rules for participant membership, vote privacy, valid values, and host-only transitions; verify allowed and denied mutations with emulator rules tests.
- [ ] 3.3 Connect the room composable/store to realtime subscriptions and reconnection handling; verify a simulated participant update is reflected without a manual refresh and stale local state is replaced on reconnect.

## 4. Room and voting experience

- [ ] 4.1 Implement room creation and join flows with room code/link handling, name/avatar selection, validation errors, unavailable-room errors, and host assignment; verify success and failure states with component tests.
- [ ] 4.2 Implement participant list, phase indicator, Fibonacci card selection, private voting progress, reveal, and host reset controls; verify participants cannot see vote values before reveal and can change votes before reveal.
- [ ] 4.3 Implement revealed result cards and mean/median/mode summaries, including no-unique-mode and missing-vote states; verify the displayed values match the domain calculations.

## 5. Visual system, accessibility, and licensing

- [ ] 5.1 Create original card/poker visual assets and document each non-code asset's source and license; verify no extracted Balatro assets, logos, characters, or proprietary artwork are included.
- [ ] 5.2 Apply responsive layouts, semantic labels, keyboard focus states, contrast-safe colors, and reduced-motion behavior to the room and voting UI; verify keyboard navigation and narrow-viewport rendering with component/accessibility tests.
- [ ] 5.3 Add concise local setup, Firebase configuration, free-tier limitations, room expiration behavior, and deployment documentation; verify each documented setup command is valid.

## 6. Integration and release checks

- [ ] 6.1 Run the full unit/component/integration test suite and production build, then fix regressions without weakening the room, privacy, security, or accessibility requirements.
- [ ] 6.2 Validate a multi-browser session with one host and multiple anonymous participants, covering join, vote changes, reveal, statistics, reset, reconnect, and rejected unauthorized actions; record the observable result.

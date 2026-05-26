# DevNest — FINAL COMPLETE PRODUCTION PLAN
> **Senior Architect Blueprint** | Expo SDK 55 · React Native · TypeScript · Offline-First · AI-Powered

---

## Pre-Requisites — Before Starting (Environment Setup)

> **Pehle ye sab install karo. Kuch bhi missing ho to aage mat bado.**

### Step 1 — Node.js Install
Download: https://nodejs.org (LTS version recommended)

Verify:
```bash
node -v    # should show v18.x or above
npm -v     # should show 9.x or above
```

### Step 2 — Expo Go App (Mobile)
Ye apne phone pe install karo — development mein QR scan karke live preview dekh sakte ho.

| Platform | Link |
|---|---|
| Android | Play Store → search "Expo Go" |
| iPhone | App Store → search "Expo Go" |

### Step 3 — Verify Project Runs
```bash
npx expo start
# Phone pe QR scan karo → app open hoga
```

> ✅ Jab tak phone pe app nahi khulta, libraries install mat karo.

---

## What We Are Building

**DevNest** = Offline Developer Workspace + Code Vault + Mini AI Assistant

> VS Code Snippets + Notion Notes + File Manager + Mini ChatGPT — ek hi app mein.

**5 Major Systems:**
1. **Snippet System** — CRUD, tags, pin, favorite, search
2. **SQLite Database** — offline brain storage
3. **File Management** — screenshots, exports, templates, backups
4. **AI Explanation** — Gemini API (Explain/Summarize/Optimize/Refactor) + offline cache
5. **Export & Share** — .txt / .js / .json via Expo Sharing

---

## Core Stack

| Purpose | Technology |
|---|---|
| Framework | Expo SDK 55 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router |
| Database | SQLite (expo-sqlite v14) |
| File Management | Expo FileSystem |
| State Management | Zustand |
| Theme Storage | AsyncStorage |
| Secure Storage | Expo SecureStore |
| AI | Gemini API (gemini-2.0-flash) |
| Styling | NativeWind v4 |
| Icons | Lucide React Native |
| Sharing | Expo Sharing |
| Animations | React Native Reanimated |
| Bottom Sheets | @gorhom/bottom-sheet |
| Lists | @shopify/FlashList |
| Haptics | expo-haptics |
| Network | expo-network |
| Blur | expo-blur |
| Clipboard | expo-clipboard |
| Keyboard | react-native-keyboard-controller |
| Code Editor | @rivascva/react-native-code-editor |
| Toast | react-native-toast-message |

---

## Complete Installation Commands

```bash
# 1. Navigation
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# 2. Database
npx expo install expo-sqlite

# 3. File System
npx expo install expo-file-system

# 4. Media
npx expo install expo-image-picker
npx expo install expo-document-picker

# 5. Sharing & Clipboard
npx expo install expo-sharing
npx expo install expo-clipboard

# 6. Storage
npx expo install expo-secure-store
npx expo install @react-native-async-storage/async-storage

# 7. State
npm install zustand

# 8. Styling
npm install nativewind tailwindcss
npx tailwindcss init

# 9. Animations & Gestures
npx expo install react-native-reanimated
npx expo install react-native-gesture-handler

# 10. UI Libraries
npm install @gorhom/bottom-sheet
npm install @shopify/flash-list
npm install lucide-react-native
npm install react-native-toast-message

# 11. Expo Features
npx expo install expo-haptics
npx expo install expo-network
npx expo install expo-blur
npx expo install expo-splash-screen
npx expo install expo-font

# 12. Keyboard & Editor
npx expo install react-native-keyboard-controller
npm install @rivascva/react-native-code-editor

# 13. Developer Tooling
npm install eslint prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-native

# 14. Git Setup (version control - MUST do this early)
git init
git add .
git commit -m "chore: initial project setup"

# 15. Production
npm install -g eas-cli
eas init
```

---

## FINAL PRODUCTION FOLDER STRUCTURE

```
DevNest/
│
├── app/                              ← Expo Router screens
│   ├── _layout.tsx                   ← Root layout (fonts, DB init, providers, splash)
│   ├── (tabs)/
│   │   ├── _layout.tsx               ← Custom animated tab bar
│   │   ├── index.tsx                 ← Home Screen
│   │   ├── favorites.tsx             ← Favorites Screen
│   │   ├── files.tsx                 ← File Manager Screen
│   │   └── settings.tsx              ← Settings Screen
│   ├── snippet/
│   │   ├── [id].tsx                  ← Snippet Detail + Edit Screen
│   │   └── create.tsx                ← Create Snippet Screen
│   ├── search.tsx                    ← Full-screen Search
│   ├── ai-history.tsx                ← AI History Screen
│   └── templates.tsx                 ← Templates Screen
│
├── src/
│   │
│   ├── assets/
│   │   ├── fonts/                    ← JetBrains Mono, Fira Code TTF files
│   │   ├── icons/                    ← Custom SVG icons
│   │   ├── images/                   ← Onboarding illustrations, empty states
│   │   └── animations/               ← Reanimated presets, Lottie JSON files
│   │
│   ├── components/
│   │   ├── buttons/
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── GhostButton.tsx
│   │   │   ├── DangerButton.tsx
│   │   │   └── FAB.tsx               ← Floating Action Button
│   │   ├── cards/
│   │   │   ├── SnippetCard.tsx       ← FlashList row card
│   │   │   ├── AIResponseCard.tsx
│   │   │   └── FileCard.tsx
│   │   ├── inputs/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── TextInput.tsx
│   │   │   └── TagInput.tsx          ← Chip-style tag input
│   │   ├── headers/
│   │   │   └── ScreenHeader.tsx      ← Consistent top header with back + actions
│   │   ├── modals/
│   │   │   ├── ConfirmModal.tsx      ← Delete confirmation
│   │   │   ├── ExportModal.tsx       ← Format picker (txt/js/json)
│   │   │   └── AIActionSheet.tsx     ← Explain/Summarize/Optimize/Refactor
│   │   ├── loaders/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── SkeletonCard.tsx      ← Skeleton placeholder
│   │   │   └── AILoader.tsx          ← AI typing animation
│   │   ├── editors/
│   │   │   ├── SnippetEditor.tsx     ← Full code editor (wraps code-editor lib)
│   │   │   ├── CodePreview.tsx       ← Read-only syntax view
│   │   │   └── LanguagePicker.tsx    ← Bottom sheet language selector
│   │   └── layout/
│   │       ├── TabBar.tsx
│   │       ├── SafeContainer.tsx
│   │       ├── EmptyState.tsx
│   │       ├── OfflineBanner.tsx     ← Network status banner
│   │       ├── Badge.tsx
│   │       ├── Divider.tsx
│   │       └── KeyboardContainer.tsx
│   │
│   ├── constants/
│   │   ├── colors.ts                 ← (re-export from theme)
│   │   ├── routes.ts                 ← All route strings typed
│   │   ├── storageKeys.ts            ← AsyncStorage/SecureStore key constants
│   │   ├── languages.ts              ← Language list with colors/icons
│   │   └── config.ts                 ← DB name, AI model, app version, file paths
│   │
│   ├── database/
│   │   ├── db.ts                     ← SQLite connection, WAL mode, init
│   │   ├── schema.ts                 ← CREATE TABLE SQL strings
│   │   ├── migrations.ts             ← Version-based migration runner
│   │   └── queries/
│   │       ├── snippets.queries.ts   ← All snippet SQL queries
│   │       ├── files.queries.ts      ← File record queries
│   │       └── ai.queries.ts         ← AI history queries
│   │
│   ├── features/                     ← Feature-based business logic
│   │   ├── snippets/
│   │   │   ├── snippetService.ts     ← Snippet business logic
│   │   │   └── snippetHelpers.ts     ← Filter, sort, parse tag helpers
│   │   ├── ai/
│   │   │   ├── aiService.ts          ← Gemini API calls + caching logic
│   │   │   └── aiPrompts.ts          ← Prompt templates per action type
│   │   ├── files/
│   │   │   ├── fileService.ts        ← FileSystem operations
│   │   │   └── fileHelpers.ts        ← MIME type detection, path helpers
│   │   ├── export/
│   │   │   ├── exportService.ts      ← Build .txt / .js / .json strings
│   │   │   └── shareService.ts       ← Expo Sharing wrapper
│   │   ├── favorites/
│   │   │   └── favoritesService.ts   ← Toggle favorite logic
│   │   └── search/
│   │       └── searchService.ts      ← Debounce + SQLite LIKE query
│   │
│   ├── hooks/
│   │   ├── useSnippets.ts            ← Filtered/searched snippets from store
│   │   ├── useSearch.ts              ← Search with debounce
│   │   ├── useFiles.ts               ← File list per snippet
│   │   ├── useTheme.ts               ← Theme + toggle
│   │   ├── useOffline.ts             ← expo-network status
│   │   ├── useDebounce.ts            ← Generic debounce
│   │   ├── useHaptics.ts             ← Haptic feedback wrappers
│   │   ├── useClipboard.ts           ← Copy with toast feedback
│   │   └── useAI.ts                  ← AI action trigger + loading
│   │
│   ├── screens/                      ← Screen-level UI components (content of each screen)
│   │   ├── HomeScreen/
│   │   │   └── HomeScreen.tsx        ← Full Home screen UI logic
│   │   ├── CreateSnippetScreen/
│   │   │   └── CreateSnippetScreen.tsx
│   │   ├── SnippetDetailsScreen/
│   │   │   └── SnippetDetailsScreen.tsx
│   │   ├── FavoritesScreen/
│   │   │   └── FavoritesScreen.tsx
│   │   ├── FileManagerScreen/
│   │   │   └── FileManagerScreen.tsx
│   │   ├── SearchScreen/
│   │   │   └── SearchScreen.tsx
│   │   ├── AIHistoryScreen/
│   │   │   └── AIHistoryScreen.tsx
│   │   ├── TemplatesScreen/
│   │   │   └── TemplatesScreen.tsx
│   │   └── SettingsScreen/
│   │       └── SettingsScreen.tsx
│   │
│   │   │ NOTE: app/ routes import from src/screens/
│   │   │ Example: app/(tabs)/index.tsx → imports HomeScreen from src/screens/
│   │
│   │
│   ├── services/                     ← External API/device service wrappers
│   │   ├── ai/
│   │   │   └── gemini.service.ts     ← fetch() Gemini REST API
│   │   ├── export/
│   │   │   └── export.service.ts     ← File write + format
│   │   ├── filesystem/
│   │   │   └── filesystem.service.ts ← copy/move/delete/list files
│   │   ├── sharing/
│   │   │   └── sharing.service.ts    ← expo-sharing wrapper
│   │   └── snippets/
│   │       └── snippet.service.ts    ← CRUD via DB queries
│   │
│   ├── storage/
│   │   ├── asyncStorage/
│   │   │   └── asyncStorage.ts       ← Typed AsyncStorage get/set/remove
│   │   ├── secureStorage/
│   │   │   └── secureStore.ts        ← Typed SecureStore for API key
│   │   └── localFiles/
│   │       └── localFiles.ts         ← documentDirectory folder management
│   │
│   ├── store/                        ← Zustand global state
│   │   ├── snippetStore.ts
│   │   ├── fileStore.ts
│   │   ├── aiStore.ts
│   │   ├── themeStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── theme/
│   │   ├── darkTheme.ts              ← Full dark color + shadow tokens
│   │   ├── lightTheme.ts             ← Full light color + shadow tokens
│   │   ├── typography.ts             ← Font sizes, weights, families
│   │   ├── spacing.ts                ← Spacing scale, border radius
│   │   └── index.ts                  ← Unified theme export
│   │
│   ├── types/
│   │   ├── snippet.types.ts
│   │   ├── file.types.ts
│   │   ├── ai.types.ts
│   │   └── settings.types.ts         ← Font size, theme, onboarding types
│   │
│   └── utils/
│       ├── validators/
│       │   └── snippetValidator.ts   ← Title/content required checks
│       ├── formatters/
│       │   ├── dateFormatter.ts      ← "2 days ago", ISO string format
│       │   └── codeFormatter.ts      ← Trim, normalize whitespace
│       ├── helpers/
│       │   ├── idGenerator.ts        ← UUID v4 generator
│       │   ├── tagParser.ts          ← JSON string ↔ string[] for SQLite
│       │   └── dbCorruptionHandler.ts← SQLite error recovery
│       └── logger/
│           └── logger.ts             ← Dev-only console logger with levels
│
├── .env                              ← GEMINI_API_KEY (gitignored)
├── .env.example                      ← Template for contributors
├── .gitignore                        ← node_modules, .env, dist, *.key
├── .eslintrc.js
├── .prettierrc
├── app.json                          ← dark splash, plugins, scheme, pkg name
├── babel.config.js                   ← NativeWind + Reanimated plugins
├── tailwind.config.js                ← NativeWind v4 content paths + tokens
├── metro.config.js                   ← NativeWind CSS processing
├── tsconfig.json                     ← strict + path aliases (@/* → ./src/*)
├── eas.json                          ← dev/preview/production build profiles
└── package.json
```

---

## Device File Structure (Expo FileSystem)

```
documentDirectory/
├── snippets/       ← raw snippet text exports
├── exports/        ← .txt / .js / .json exports
├── screenshots/    ← attached screenshots per snippet
├── templates/      ← starter template files
└── backups/        ← full JSON backup files
```

---

## Database Tables (SQLite)

### snippets
| Column | Type | Notes |
|---|---|---|
| id | TEXT PRIMARY KEY | UUID |
| title | TEXT | Required |
| content | TEXT | Code content |
| language | TEXT | e.g. "TypeScript" |
| tags | TEXT | JSON string array |
| isFavorite | INTEGER | 0 or 1 |
| isPinned | INTEGER | 0 or 1 |
| isDeleted | INTEGER | 0 or 1 (Trash system) |
| createdAt | TEXT | ISO string |
| updatedAt | TEXT | ISO string |

### files
| Column | Type | Notes |
|---|---|---|
| id | TEXT PRIMARY KEY | UUID |
| snippetId | TEXT | FK → snippets.id |
| filePath | TEXT | documentDirectory relative |
| fileType | TEXT | image/text/document |
| createdAt | TEXT | ISO string |

### ai_history
| Column | Type | Notes |
|---|---|---|
| id | TEXT PRIMARY KEY | UUID |
| snippetId | TEXT | FK → snippets.id |
| prompt | TEXT | Action type: explain/summarize/etc |
| response | TEXT | Cached Gemini response |
| createdAt | TEXT | ISO string |

---

## Storage Architecture

| Layer | Technology | Stores |
|---|---|---|
| SQLite | expo-sqlite | snippets, files, ai_history |
| AsyncStorage | @react-native-async-storage | theme, fontSize, onboarding |
| SecureStore | expo-secure-store | Gemini API key |
| FileSystem | expo-file-system | exports, screenshots, templates, backups |

---

## Data Flows

### Snippet Flow
```
User Action → Zustand Action → SQLite Write → Zustand State Update → FlashList Re-render
```

### AI Flow (with Offline Cache)
```
User taps Explain
    ↓
Check SQLite ai_history for snippetId
    ├── CACHE HIT → render cached response immediately
    └── CACHE MISS → check network
            ├── OFFLINE → show "No cached response" empty state
            └── ONLINE → fetch Gemini API → cache in SQLite → render
```

### File Flow
```
User picks file (image picker / doc picker)
    ↓
FileSystem.copyAsync → documentDirectory/screenshots/
    ↓
SQLite files table ← path saved
    ↓
FileCard renders in Snippet Detail
```

### Export Flow
```
User selects format (.txt/.js/.json)
    ↓
export.service builds string content
    ↓
FileSystem.writeAsync → documentDirectory/exports/
    ↓
expo-sharing.shareAsync → system share dialog
    ↓
User shares via WhatsApp / Telegram / Email / Save
```

### Favorite Flow
```
User taps Favorite
    ↓
SQLite UPDATE isFavorite = 1
    ↓
snippetStore.toggleFavorite() updates in-memory state
    ↓
Favorites screen FlashList auto-refreshes
```

---

## All Screens

> ⚠️ **UI SOURCE:** Screens marked 🎨 follow the exact design from `/demo-screen/` folder. Screens marked 📝 use planned UI (no design provided).

| Screen | Route | Tab? | UI Source |
| Screen | Route | Tab? | UI Source |
|---|---|---|---|
| Onboarding | `/onboarding` | ❌ | 🎨 Design provided |
| Profile Creation | `/profile-setup` | ❌ | 🎨 Design provided |
| Home | `/(tabs)/` | ✅ | 🎨 Design provided |
| Search | `/(tabs)/search` | ✅ | 🎨 Design provided |
| Files (My Files) | `/(tabs)/files` | ✅ | 🎨 Design provided |
| Settings | `/(tabs)/settings` | ✅ | 🎨 Design provided |
| Profile | `/(tabs)/profile` | ✅ | 🎨 Design provided |
| Create Snippet | `/snippet/create` | ❌ | 🎨 Design provided |
| Snippet Detail | `/snippet/[id]` | ❌ | 🎨 Design provided |
| Edit Snippet | `/snippet/edit/[id]` | ❌ | 🎨 Design provided |
| AI History | `/ai-history` | ❌ | 🎨 Design provided |
| Templates | `/templates` | ❌ | 🎨 Design provided |
| Inside Folder | `/folder/[id]` | ❌ | 🎨 Design provided |
| AI Chat Modal | Bottom Sheet | ❌ | 🎨 Design provided |
| Language Modal | Bottom Sheet | ❌ | 🎨 Design provided |

> ✅ **ALL 15 screens/modals have designs now.** No planned-only screens remaining.

> ⚠️ **Tab Bar changed:** 5 tabs = Home / Search / + (FAB center) / Files / Profile. Settings is now accessed from Profile tab.

---

## Screen UI Details (from demo-screen/ designs)

### 🎨 Home Screen (`/(tabs)/`)
> Design file: `02_29_30 AM.png` (dark) + `02_29_34 AM.png` (light)

**Top Bar:**
- Left: Hamburger menu (☰)
- Right: Search icon + Bell icon (notification dot) + User avatar

**Hero Section:**
- Greeting: "Good Morning, [Name] 👋"
- Headline: "Ready to code something **amazing**?"
- 3D illustration: developer character with laptop (right side)

**Stats Bar (4 cards):**
| Card | Icon | Value | Label |
|---|---|---|---|
| Snippets | `</>` code icon | count | "Snippets" |
| Folders | folder icon | count | "Folders" |
| Favorites | star icon | count | "Favorites" |
| Templates | doc icon | count | "Templates" |
- Each card has a mini green wavy graph line at bottom

**AI Assistant Banner:**
- Label: "✨ AI Assistant"
- Text: "Ask AI to explain, optimize or refactor your code."
- CTA button: "Ask AI →" (green pill button)
- Right side: 3D robot/AI mascot illustration

**Recent Snippets Section:**
- Section header: "Recent Snippets" + "View all →" link
- Each row: Language icon badge + Title + Time + Language tag + Star icon + ⋮ menu
- Example rows: Debounce Function in JS, React useEffect Cleanup, Custom Button, Python List

**Quick Actions Bar:**
- 4 action chips: **+ New Snippet** | **📷 Scan Code** | **⬆ Import File** | **✨ AI Explain**

**Bottom Tab Bar:**
- Home (active, green) | Search | ➕ (FAB, green circle, center) | Files | Settings

---

### 🎨 Search Screen (`/(tabs)/search`)
> Design file: `02_41_59 AM.png` (dark) + `02_42_05 AM.png` (light)

**Top:**
- Back arrow
- Heading: "Search.●" with subtitle: "Find snippets, folders, tags and more"
- Mascot: green dino with magnifying glass (top right)

**Search Input:**
- Full-width search bar with green border glow (when focused)
- Clear X button + Filter sliders icon (right)

**Filter Chips (horizontal scroll):**
`All` | `Snippets` | `Folders` | `Tags` | `Templates` | `Users`
- Active chip: green filled background

**Results Sections (grouped):**
1. **Top Results** — Best matching snippet card:
   - Language icon + Title + "Snippet" badge + bookmark + ⋮
   - Description line
   - Language + timestamp
   - **Inline code preview** (syntax highlighted, line numbers)
   - "Preview" button (eye icon)
2. **Folders** — "View all →" header + folder row (name + snippet count + ❯)
3. **Tags** — Tag chips (active tag in green)
4. **More Snippets** — Simple list rows (icon + title + language + time + bookmark + ⋮)

---

### 🎨 Files Screen / My Files (`/(tabs)/files`)
> Design file: `02_42_12 AM.png` (light) + `02_51_37 AM.png` (dark) + `02_52_34 AM.png` (dark - Create New sheet) + `02_52_43 AM.png` (light - Create New sheet)

**Top Bar:**
- Left: ≡ list icon
- Heading: "My Files 👋"
- Subtitle: "All your documents, organized and safe"
- Right: Search icon + Bell + Avatar

**Tip Banner:**
- Green pill label: "💡 Tip"
- Text: "Group files into folders for better organization"
- Arrow doodle on right

**Folders Grid (3 columns):**
- Each folder card: 3D colored folder icon + item count badge (top right) + folder name + doc count + ⋮ menu
- Last slot: dashed border "+ Add folder" card
- Files can appear inline in grid too

**Quick Actions (3 buttons):**
| Action | Icon | Description |
|---|---|---|
| Scan Document | green | Use camera to scan |
| Import Files | blue | From device or cloud |
| Add Screenshot | cyan | Save from gallery |

**Bottom Search Bar:**
- Fixed at bottom: "Search files, folders..." + filter icon

**"Create New" Bottom Sheet (opens on + FAB tap):**
- Title: "Create New" + subtitle
- Options list: New Folder / New Document / New Spreadsheet / New PDF / Upload from Gallery / Scan Document
- Each option: colored icon + title + subtitle + ❯ chevron

---

### 🎨 Settings Screen (`/(tabs)/settings`)
> Design file: `03_01_23 AM.png` (dark) + `03_02_17 AM.png` (light)

**Top:**
- Heading: "Settings"
- Subtitle: "Customize your experience and manage your app."
- Right: Search icon + Bell + Avatar

**Security Banner:**
- "✅ Your data is safe"
- "We value your privacy and keep your data secure."
- 3D lock + briefcase illustration

**Account Section:**
| Row | Icon | Title | Subtitle |
|---|---|---|---|
| Profile | person | Profile | View and edit your profile |
| Security | shield | Security | Manage password and security |
| Backup & Restore | cloud | Backup & Restore | Backup your files and restore |

**Preferences Section:**
| Row | Icon | Title | Value/Subtitle |
|---|---|---|---|
| Notifications | bell | Notifications | Manage your notification preferences |
| Appearance | palette | Appearance | Choose app theme and customize |
| Language | globe | Language | "English" (shown as value) |
| Storage | stack | Storage | "153 GB / 2 TB" (shown as value) |

**Support Section:**
| Row | Title |
|---|---|
| Help & FAQ | Find answers to common questions |
| Contact Us | Get in touch with our support team |
| Terms & Privacy | Read our terms and privacy policy |
| About | App version and information (shows v1.4.0) |

**Log Out button** — red text, full-width at bottom

---

### 🎨 Profile Screen (`/(tabs)/profile`) — NEW SCREEN
> Design file: `03_06_25 AM.png` (light) + `03_06_30 AM.png` (dark)
> ⚠️ This screen was NOT in the original plan. Added from your design.

**Top Bar:**
- Back arrow + "Profile" title + ⚙️ settings icon (top right)
- Subtitle: "Manage your profile and preferences"

**User Card:**
- Avatar (3D character) + camera icon overlay (to change photo)
- Name: **Rohit Kumar**
- Email: rohit.kumar@email.com
- ✅ Verified badge (green)
- ❯ chevron (to edit)

**Storage Usage Card:**
- "Storage Usage" label + pie chart icon
- "153 GB of 2 TB used"
- Green progress bar + "7% Used" label

**Account Section:**
| Row | Icon | Title | Subtitle |
|---|---|---|---|
| Personal Information | person | Personal Information | Update your name, email and more |
| Security | shield | Security | Change password and manage security |
| Subscription Plan | card | Subscription Plan | View and manage your plan |
| Connected Devices | monitor | Connected Devices | Manage devices connected to your account |

**Activity Section:**
| Row | Icon | Title | Badge |
|---|---|---|---|
| Recent Activity | clock | Recent Activity | "12 new" badge |
| Downloads | download | Downloads | — |
| Trash | trash | Trash | — |

**Log Out button** — red text, full-width with "You will be logged out from this device" caption

**Tab Bar for Profile:** Home | Search | ➕ | Files | **Profile** (active, person icon)

---

### 🎨 Create Snippet Screen `/snippet/create`
> Design file: `a9ea398a-8a3d-47e6-bb61-222bf36fa7d5.png` (dark theme)
> ✅ Previously "Planned UI" — now updated from provided design.

**Top Bar:**
- Back arrow (← top left)
- Heading: **"Create** `Snippet`**"** (white "Create" + green "Snippet")
- Subtitle: *"Write your code. AI will handle the rest."*
- Top right: 3D code editor illustration (`</>` window with sparkles ✨)

**Form Fields (scrollable):**

1. **Title field:**
   - Label: `Title`
   - Input: full-width, rounded, green border glow on focus
   - Placeholder: *"e.g. Fetch data from API"*

2. **Language field:**
   - Label: `Language`
   - Dropdown selector (full-width pill): shows `JS JavaScript` with `⌄` chevron
   - Tap → opens LanguagePicker bottom sheet

3. **Code field:**
   - Label: `Code`
   - Code editor block: dark background, line numbers (1, 2, 3...), syntax highlighting
   - Copy icon (top right of editor block)
   - Example placeholder code shown in green/yellow syntax colors

4. **Description field:**
   - Label: `Description (Optional)`
   - Multi-line text input
   - Placeholder: *"Describe what this snippet does..."*

5. **Tags field:**
   - Label: `Tags (Optional)`
   - Existing tag chips: `api` `fetch` + `+ Add tag` button (dashed border chip)

6. **Private toggle:**
   - Label: `Private`
   - Subtitle: *"Only you can access this snippet"*
   - Green toggle switch (ON by default, right aligned)

**Bottom Buttons (side by side):**
- **Cancel** — dark outlined button (left, 40% width)
- **Create Snippet →** — bright green filled button (right, 60% width), arrow icon

> **CRUD Build Order:** Create first → Read (show on Home) → Delete → Edit. Ek ek karo.

---

### 🎨 Snippet Detail Screen `/snippet/[id]`
> Design file: `3380e840-972a-46de-ab07-74dece3520f9.png` (dark theme)
> ✅ Previously "Planned UI" — now updated from provided design.

**Top Bar:**
- Back arrow (← left)
- Right side action buttons (3 icon buttons):
  - ✏️ **Edit** (pencil icon + label)
  - ⭐ **Favorite** (star icon, green when active + label)
  - ⋮ **More** (three-dot menu + label)

**Snippet Header:**
- Language badge: colored square (e.g. `JS` yellow badge)
- Title: **"Fetch Users from API"** (large white bold)
- Subtitle: *"Last updated 2h ago • JavaScript"* (green language text)

**Code Block:**
- Header row: `</> Code` label + **Copy** button + **⤢** expand button
- Full syntax-highlighted code viewer with line numbers
- Dark background, green/yellow/purple syntax colors

**Tabs (below code block):**
`ℹ Info` | `📊 Usage (3)` | `🕐 History (5)`
- Active tab has green underline indicator

**Info Tab Content:**

- **Description section:**
  - `📄 Description` label + `✏️ Edit` link (right)
  - Description text in a rounded dark card

- **Language + Created (2 columns):**
  - Left: `Language` → JS badge + "JavaScript"
  - Right: `Created` → calendar icon + date (e.g. May 12, 2025)

- **Tags:**
  - `◇ Tags` label
  - Tag chips with `×` remove button: `api ×` `fetch ×` `users ×` + `+ Add tag` (dashed border)

- **Actions grid (2×3 buttons):**
  | Row 1 | Row 2 |
  |---|---|
  | ▷ Run Code | ↓ Export |
  | 🔗 Share | ☆ Add to Favorites |
  | ⧉ Duplicate | 🗑 Delete (red text) |

---

### 🎨 AI History Screen `/ai-history`
> Design file: `ca5edfb9-50fe-4618-abb9-a211c888a67d.png` (dark theme)
> ✅ Previously "Planned UI" — now updated from provided design.

**Top:**
- Heading: **"AI** `History`**"** (white "AI" + green "History") + ✨ sparkle icon
- Subtitle: *"Your AI interactions and results."*
- Right: 🔽 Filter icon button (rounded square)

**Filter Chips (horizontal, full-width bar):**
`All` | `Explain` | `Optimize` | `Generate`
- Active: green filled pill; others: dark pill

**History List (each entry = card):**

Each AI history card contains:
- **Left:** Action type icon (green square bg):
  - `</>` for Explain
  - ⚡ for Optimize
  - 🔀 for Generate
  - 🗄 for SQL/Database
  - 🐛 for Debug
- **Center:**
  - Title (action name): e.g. *"Explain this code"*, *"Optimize API call"*, *"Generate React Hook"*
  - Snippet preview (1 line): e.g. *"function add(a, b) { return a + b; }"*
  - Timestamp: *"2h ago"*, *"5h ago"*, *"1d ago"*
- **Right:** ⭐ Star/bookmark icon (golden = saved, outline = not saved)

**Example entries shown in design:**
1. Explain this code → `function add(a, b)...` → 2h ago ⭐
2. Optimize API call → `Improve performance...` → 5h ago ☆
3. Generate React Hook → `Create a custom hook...` → 1d ago ⭐
4. SQL Query Help → `Write a query to get top 10 users` → 2d ago ☆
5. Debug this issue → `Why is my state not updating?` → 3d ago ⭐

---

### 🎨 Templates Screen `/templates`
> Design file: `76d2c9fd-4a89-418e-a624-48e321f38cf1.png` (dark theme)
> ✅ Previously "Planned UI" — now updated from provided design.

**Top:**
- Heading: **"Temp`lates`"** (white "Temp" + green "lates") + ✨ sparkle stars
- Subtitle: *"Start with pre-built code templates."*
- Right: 🔍 Search icon button (rounded circle)

**Category Filter Chips (horizontal scroll):**
`All` | `JavaScript` | `React` | `Node.js` | `SQL`
- Active: green outlined pill; others: dark pill

**Templates List (full-width cards, each tappable):**

Each template card:
- **Left:** Language/framework icon (colored circular bg)
- **Center:** Template name + description subtitle
- **Right:** `>` chevron

| Icon | Template Name | Description |
|---|---|---|
| ⚛️ React (blue) | React Component | Create a basic functional component |
| ⚛️ React (blue) | Custom React Hook | Create a reusable custom hook |
| `JS` Node (green hex) | API Route (Node.js) | Create an Express.js API route |
| 🗄 SQL (green db) | SQL Select Query | Basic SELECT query template |
| `N` Next.js (dark circle) | Next.js Page | Create a Next.js page component |
| `JS` yellow | Error Handling | Try-catch error handling example |

> Tap any template → opens Create Snippet screen with pre-filled code + language

---

### 🎨 Onboarding Flow `/onboarding`
> Design files: `ChatGPT Image May 26, 2026, 04_22_55 PM.png` to `04_23_12 PM.png` (5 screens)

**Common Elements (All Screens):**
- Dark background (`#0D1117`) with subtle green grid/dots and glowing sparkles
- **Top:** DevNest logo (left) + `Skip >` button (right)
- **Bottom:** Bright green `Next →` button (or `Get Started →` on last screen) + `Skip for now` text link + page indicator dots

**Screen 1: Intro / Code Editor**
- Headline: "Your Offline **AI-Powered** Developer Workspace." ("AI-Powered" in green)
- Illustration: 3D dark code editor window (floating in space) with JavaScript code + floating `</>` icon block
- Bottom Footer Grid: 4 feature highlights:
  - `</>` Built for Developers
  - 🚫📶 Works Offline
  - ⚡ Blazing Fast
  - 🛡️ Your Data. Your Control

**Screen 2: Organize**
- Number Badge: `2` (outlined box)
- Headline: "**Organize** Your Code Beautifully" ("Organize" in green)
- Illustration: 3D green DevNest folder with 3 glowing code documents inside ("React Hook", "API Utility", "SQL Query")
- Description: "Save, organize, tag and find your code snippets instantly. Works completely offline."

**Screen 3: Attach & Manage**
- Number Badge: `3` (outlined box)
- Headline: "**Attach &** Manage Everything" ("Attach &" in green)
- Illustration: 3D floating file manager list (image, pdf, js, sql files) + green Cloud Upload button `☁️⬆️` and `+` button
- Description: "Add screenshots, files and templates. Keep everything in one secure place on your device."

**Screen 4: AI Assistant**
- Number Badge: `4` (outlined box)
- Headline: "**AI** That Understands **Developers**" ("AI" and "Developers" in green)
- Illustration: 3D cute robot avatar + chat bubbles ("Explain this code") + code snippet box + audio waveform box
- Description: "Get explanations, summaries, improvements and more using powerful on-device AI."

**Screen 5: Privacy & Security**
- Number Badge: `5` (outlined box)
- Headline: "Private. Secure. Always **Offline.**" ("Offline." in green)
- Illustration: Large 3D Shield with padlock + surrounding security icons (Database, Fingerprint, Lock, Cloud-slash)
- Description Grid (3 columns):
  - 🚫📶 No Tracking: Your data stays with you.
  - ☁️🚫 No Cloud Sync: 100% offline. No uploads.
  - 🛡️ 100% Private: Your code. Your device. Your rules.
- **Button:** `Get Started →` instead of Next.

---

### 🎨 Profile Creation Flow `/profile-setup`
> Design files: `ChatGPT Image May 26, 2026, 04_26_05 PM.png` to `04_26_10 PM.png` (3 screens)
> ⚠️ Appears directly after Onboarding flow.

**Common Elements:**
- Dark background (`#0D1117`) with subtle glowing rings/stars
- **Top Progress Bar:** `(1) — (2) — (3)` (nodes connected by lines, active states turn green)
- **Top Left (Screens 2 & 3):** Back arrow button `<-`

**Step 1: Let's Get Started**
- Headline: "Let's Get **Started** 👋" ("Started" in green)
- Subtitle: "Create your profile to personalize your DevNest AI experience." *(Note: original design says DevSnippets, use DevNest)*
- Illustration: Large 3D ID card/badge with generic avatar icon + floating green 3D pencil icon.
- Bottom: `Create Profile →` (green filled button) + `I'll do this later` (text link).

**Step 2: Name Input**
- Headline: "What's your **name?**" ("name?" in green)
- Subtitle: "This will be used across your workspace."
- Illustration: Neon green outline circle with user icon.
- Input Box: Rounded box with user icon (left) + "Enter your name" placeholder.
- Subtext: "Display name is visible to you only."
- Bottom: `Continue →` (green filled button).

**Step 3: Choose Avatar**
- Headline: "Choose your **avatar**" ("avatar" in green)
- Subtitle: "Pick an avatar that represents you."
- Grid (3x4): 12 high-quality 3D avatars (humans, robot, cat, bear, rocket).
- Interaction: Selected avatar gets green border + green checkmark badge at bottom right.
- Bottom: Pagination dots (indicating scroll/more options) + `Continue →` (green filled button).

---

### 🎨 Inside Folder Screen `/folder/[id]`
> Design file: `ChatGPT Image May 26, 2026, 05_24_04 PM.png`
- **Header:** Back arrow (left), Folder icon (green), Title "React Hooks", Subtitle "12 snippets", More options `⋮` button (right).
- **Search Bar:** "Search in React Hooks..." + filter icon right next to it.
- **Filter Chips:** `All` (active, green text/border), `Favorites`, `Recently Used`. Right side has `Newest ⌄` sort dropdown.
- **List Items (Snippets):**
  - Left: Language icon (React logo, JS badge).
  - Center: Snippet Title + Description snippet. Below that: Tags chips (e.g. `state`, `basic`).
  - Right: Star icon (yellow if favorited) + `⋮` options. Timestamp (e.g. `2h ago`) + Language text (e.g. `JavaScript` in yellow) below it.

### 🎨 AI Assistant Chat Modal `(Bottom Sheet / Modal)`
> Design file: `ChatGPT Image May 26, 2026, 05_24_11 PM.png`
- **Header:** Yellow sparkle icon, Title "Ask AI", Subtitle "Your AI coding assistant", Close `✕` button (right).
- **Chat Interface:**
  - User message: Dark green bubble, right aligned + timestamp.
  - AI message: Sparkle icon + "AI Assistant" header. Text response.
  - AI Code Block: syntax highlighted, `JS JavaScript` badge, `Copy` button.
- **Input Area (Bottom):** "Ask anything about your code...", send button (yellow/green arrow).

### 🎨 Language Picker Modal `(Bottom Sheet)`
> Design file: `ChatGPT Image May 26, 2026, 05_24_14 PM.png`
- **Header:** Drag handle line (top center). Globe icon (yellow/green), "Select Language", "Choose the language for your snippet", Close `✕` button.
- **Search Bar:** "Search languages..."
- **List Groups:**
  - "Popular": JS (with yellow checkmark for active), TS, Python, Java, C#.
  - "All Languages": C++, Go, PHP, Ruby, Swift, Kotlin, Dart, Rust.

### 🎨 Edit Snippet Screen `/snippet/edit/[id]`
> Design file: `ChatGPT Image May 26, 2026, 05_24_17 PM.png`
- **Header:** Back arrow, "Edit Snippet ✨", "Update your code snippet", `Save` button (top right, green filled).
- **Form Fields (Pre-filled):**
  - Title input ("useState Example").
  - Language dropdown (JS JavaScript).
  - Visibility dropdown (Private lock icon).
  - Description input with char count (e.g., 58/500).
- **Code Block:** Dark background, syntax highlighting, line numbers, copy button.
- **Tags Section:** Pre-filled tags with `✕` to remove + `+ Add tag` button.
- **Bottom Action:** Full width `Delete Snippet` button (red text with red outline).

---

## Must-Have Features (MVP)

| Feature | System |
|---|---|
| ✅ CRUD | SQLite + Zustand |
| ✅ Search | SQLite LIKE + debounce |
| ✅ Favorites | SQLite + store |
| ✅ Tags | JSON stored in SQLite |
| ✅ Pin Snippets | SQLite + store |
| ✅ File Attach | FileSystem + SQLite |
| ✅ Export/Share | FileSystem + Expo Sharing |
| ✅ AI Explain | Gemini API + SQLite cache |
| ✅ Dark Mode | AsyncStorage + theme |

## Advanced Features

| Feature | System |
|---|---|
| ✅ AI History | SQLite ai_history table |
| ✅ Offline AI Cache | SQLite ai_history lookup |
| ✅ Backup/Restore | JSON → FileSystem/backups/ |
| ✅ Trash System | isDeleted flag in SQLite |
| ✅ Snippet Collections | tags as collections |
| ✅ Biometric Lock | expo-local-authentication |
| ✅ Markdown Rendering | react-native-markdown-display |
| ✅ Pinned Snippets | isPinned flag in SQLite |
| ✅ Syntax Themes | VS Code style code highlight themes (multiple presets) |
| ✅ Local Search Indexing | FTS5 (Full Text Search) SQLite extension for fast search |

---

## Important Configurations

| Config File | Purpose |
|---|---|
| `tsconfig.json` | strict: true + path aliases @/* |
| `babel.config.js` | NativeWind + Reanimated plugins |
| `tailwind.config.js` | NativeWind v4 content + tokens |
| `metro.config.js` | NativeWind CSS processing |
| `app.json` | dark splash, plugins, scheme, android pkg |
| `.env` | GEMINI_API_KEY |
| `.eslintrc.js` | TypeScript + React Native rules |
| `.prettierrc` | Single quotes, 2-space, trailing comma |
| `eas.json` | dev/preview/production profiles |

---

## App Versioning Setup

> **IMPORTANT:** Version aur build number track karna production app ka basic requirement hai.

In `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": { "buildNumber": "1" },
    "android": { "versionCode": 1 }
  }
}
```

| Field | Purpose |
|---|---|
| `version` | User-visible version (1.0.0, 1.1.0...) |
| `versionCode` | Android internal build number (1, 2, 3...) |
| `buildNumber` | iOS internal build number |

> **Rule:** Har Play Store release pe `versionCode` increment karna COMPULSORY hai.

---

## App Icons & Splash Screen Setup

> 🎨 **Icons Source:** `demo-screen/icon-inspertion/` folder mein dono icons provided hain.

---

### 📱 icon-1.png — App Icon (OS mein dikhta hai)
> **Used when:** Phone ke home screen pe, Play Store listing mein, recent apps switcher mein, notifications mein

**Design Description:**
- Black rounded square background (`#0D1117`)
- Center: 3D green folder (DevNest "N" logo formed by folder shape)
- Inside folder: White code document with `</>` symbol + green text lines
- Right side: Green neon code particles flying (`</>` tags)
- Bottom text: **"DevNest"** (white "Dev" + bright green "Nest", bold)
- Style: Dark + neon green glow, premium 3D look

**Where to place:**
```
assets/
├── icon.png              ← icon-1.png copy karo yahan (1024×1024)
├── adaptive-icon.png    ← icon-1.png copy karo yahan (Android adaptive)
└── favicon.png          ← icon-1.png se crop karo (196×196)
```

**`app.json` config:**
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0D1117"
      }
    },
    "ios": {
      "icon": "./assets/icon.png"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

### ⏳ icon-2.png — Splash Screen Icon (App load hote waqt dikhta hai)
> **Used when:** App open ho rahi ho — OS loading screen par

**Design Description:**
- Same black background (`#0D1117`)
- Same 3D green folder + code document illustration (slightly different angle/composition)
- Bottom text: **"DevNest"** (white + green, bold italic style) with speed-line dash accent
- Tagline below: **"CODE. CONNECT. CREATE."** (small white caps text)
- Style: Same dark neon premium look, slightly more minimal than icon-1

**Where to place:**
```
assets/
└── splash-icon.png      ← icon-2.png copy karo yahan
```

**`app.json` splash config:**
```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0D1117"
    }
  }
}
```

---

### 📊 Complete Icon Setup Summary

| File | Source | Used For | Background |
|---|---|---|---|
| `assets/icon.png` | icon-1.png | iOS icon, Android fallback icon, Play Store | `#0D1117` |
| `assets/adaptive-icon.png` | icon-1.png | Android adaptive icon (home screen) | `#0D1117` |
| `assets/splash-icon.png` | icon-2.png | Splash screen (app loading) | `#0D1117` |
| `assets/favicon.png` | icon-1.png (resized) | Web browser tab icon | `#0D1117` |

> ⚠️ **RULE:** Icon files ko RENAME karke `assets/` folder mein rakho. `app.json` mein path wahi likha hai jo upar diya hai.

---

## Permissions Planning

> Permissions `app.json` mein declare karne padte hain — runtime pe user se maanga jata hai.

| Permission | Platform | Needed For | How to Request |
|---|---|---|---|
| `MEDIA_LIBRARY` | Android + iOS | Image picker (attach screenshot) | `expo-image-picker` auto-requests |
| `CAMERA` | Android + iOS | Optional: take photo directly | `expo-image-picker` |
| `READ_EXTERNAL_STORAGE` | Android | Document picker (import files) | `expo-document-picker` auto-requests |
| `WRITE_EXTERNAL_STORAGE` | Android | Export files to Downloads | `expo-file-system` |

In `app.json` (Android):
```json
"android": {
  "permissions": [
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.READ_MEDIA_IMAGES"
  ]
}
```

> **Best Practice:** Permission sirf tab maango jab user wo feature use kare. On app launch mat maango.

---

## Status Bar Setup

> Dark mode app mein status bar bhi dark hona chahiye — yahi professional look deta hai.

`app/_layout.tsx` mein:
```tsx
import { StatusBar } from 'expo-status-bar';
// ...
<StatusBar style="light" backgroundColor="#0D1117" />
```

| Setting | Value | Purpose |
|---|---|---|
| `style` | `"light"` | White icons on dark background |
| `backgroundColor` | `"#0D1117"` | Match app background |
| `translucent` | `true` | Edge-to-edge on Android |

> **Rule:** `expo-status-bar` use karo — React Native's built-in se better control milta hai.

---

## Initial Seed Data (Templates Preload)

> App pehli baar open ho to 5 built-in starter templates already hone chahiye — empty app unprofessional lagta hai.

`src/database/seedData.ts` banao:

| Template Name | Language | Description |
|---|---|---|
| React Component | TypeScript | Basic functional component with props |
| Custom Hook | TypeScript | `useLocalStorage` hook template |
| Fetch API Call | JavaScript | `async/await` fetch with error handling |
| Express API Route | JavaScript | GET/POST route template |
| SQL Query | SQL | SELECT with JOIN and WHERE template |

**Seed Flow:**
```
App first launch detected (AsyncStorage flag)
    ↓
Run seedDatabase() function
    ↓
Insert 5 template snippets into SQLite
    ↓
Set 'seed_done' flag in AsyncStorage
    ↓
Home screen shows pre-loaded snippets
```

> **Rule:** Seed sirf once chalao — `AsyncStorage.getItem('seed_done')` check karo pehle.

---

## Animation Planning (Decide Before Dev)

> Animations baad mein add karna mushkil hota hai — pehle se plan karo kaun sa animation kahaan lagega.

### Screen Transitions
| Transition | Where | Animation Type |
|---|---|---|
| Tab switch | Bottom tab bar | Fade + slight scale |
| Home → Detail | SnippetCard tap | Slide up (shared element) |
| Home → Create | FAB tap | Slide up from bottom |
| Back navigation | Any stack | Slide right (default) |

### Card Animations
| Animation | Where | Trigger |
|---|---|---|
| Slide in | SnippetCard on list load | FlatList/FlashList mount |
| Scale press | SnippetCard, buttons | `onPressIn` / `onPressOut` |
| Swipe to delete | SnippetCard | Horizontal swipe gesture |
| Bounce | FAB | On mount (attention) |

### Modal / Sheet Animations
| Animation | Where | Type |
|---|---|---|
| Slide up | Bottom sheets (AI, Language, File) | Gorhom default + spring |
| Fade in/out | ConfirmModal overlay | Opacity |
| Scale in | Toast messages | Scale + translate Y |
| Pulse | AI loading dots | Opacity loop |

> **Tools:** `react-native-reanimated` for all animations. `expo-haptics` paired with animations.

---

## Production Mindset — Error Scenarios

| Scenario | Handler |
|---|---|
| No internet | useOffline hook + OfflineBanner |
| AI API failure | Error state in aiStore + user message + **Retry button** |
| DB corruption | dbCorruptionHandler.ts → offer reset |
| File missing | FileCard fallback empty state |
| App crash | ErrorBoundary wrapper |
| Empty list | EmptyState component |
| API key missing | Settings screen prompt |
| Export failed | Toast error + **Retry button** |
| Backup failed | Toast error + **Retry button** |

> **Rule:** Har error state mein Retry button hona chahiye. User ko kabhi dead-end pe mat chodo.

---

## Post-Install Sanity Check (Step 1 of Development)

> **IMPORTANT:** Dependencies install karne ke baad, aage badhne se pehle ye check karo:

| Check | How to Verify |
|---|---|
| App starts without crash | `npx expo start` → scan QR → app opens |
| NativeWind working | Add `className="bg-blue-500"` to a View → blue background |
| Expo Router working | `app/(tabs)/index.tsx` renders on Home tab |
| Reanimated working | No "Reanimated 2 failed to create a worklet" error |
| No TypeScript errors | `npx tsc --noEmit` → 0 errors |

> ❌ Agar koi bhi check fail ho to aage mat bado. Pehle fix karo.

---

## Performance Rules

| Technique | Where to Apply |
|---|---|
| `React.memo` | SnippetCard, FileCard, AIResponseCard (FlashList items) |
| `useMemo` | Filtered/searched snippet list computation |
| `useCallback` | Event handlers passed as props (onPress, onDelete) |
| `FlashList` | All long lists (snippets, files, AI history, search results) |
| Lazy loading | Templates screen, AI History screen (load on demand) |
| Debounce | Search input (300ms) |

---

## Toast Messages — Specific Actions

| Action | Toast Message | Type |
|---|---|---|
| Snippet created | "Snippet saved! 🎉" | success |
| Snippet updated | "Changes saved" | success |
| Snippet deleted | "Snippet deleted" | info |
| Snippet copied | "Code copied to clipboard" | success |
| Snippet exported | "Exported successfully" | success |
| Favorite toggled on | "Added to favorites ❤️" | success |
| Favorite toggled off | "Removed from favorites" | info |
| AI response cached | "AI response saved offline" | success |
| AI call failed | "AI unavailable. Try again." | error |
| Backup created | "Backup saved to device" | success |
| Restore complete | "Snippets restored successfully" | success |
| File attached | "File attached" | success |
| File deleted | "File deleted" | info |

---

## Initial Seed Data — Template Snippets Detail

### 5 Built-in Templates (added on first launch)

**1. React Functional Component**
```typescript
// language: TypeScript | tags: react, component, typescript
interface Props { title: string; }
const MyComponent = ({ title }: Props) => {
  return <View><Text>{title}</Text></View>;
};
export default MyComponent;
```

**2. Custom Hook (useLocalStorage)**
```typescript
// language: TypeScript | tags: hook, react, custom
const useLocalStorage = <T>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(initial);
  // ...
  return [value, setValue] as const;
};
```

**3. Fetch API with Async/Await**
```javascript
// language: JavaScript | tags: fetch, api, async
const fetchData = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) { console.error(err); return null; }
};
```

**4. Express API Route**
```javascript
// language: JavaScript | tags: express, api, backend
router.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
```

**5. SQL SELECT Query**
```sql
-- language: SQL | tags: sql, query, database
SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = 1
GROUP BY u.id
ORDER BY order_count DESC
LIMIT 10;
```

---

## Constants Files Detail

### routes.ts
```typescript
export const ROUTES = {
  HOME: '/(tabs)/',
  FAVORITES: '/(tabs)/favorites',
  FILES: '/(tabs)/files',
  SETTINGS: '/(tabs)/settings',
  CREATE: '/snippet/create',
  DETAIL: (id: string) => `/snippet/${id}`,
  SEARCH: '/search',
  AI_HISTORY: '/ai-history',
  TEMPLATES: '/templates',
} as const;
```

### storageKeys.ts
```typescript
export const STORAGE_KEYS = {
  THEME: 'devnest_theme',
  FONT_SIZE: 'devnest_font_size',
  FONT_FAMILY: 'devnest_font_family',
  ONBOARDING_DONE: 'devnest_onboarding',
  RECENT_SEARCHES: 'devnest_recent_searches',
} as const;

export const SECURE_KEYS = {
  GEMINI_API_KEY: 'devnest_gemini_key',
} as const;
```

---

## Development Order (Day-by-Day)

| Day | Phase | Tasks |
|---|---|---|
| 1 | Phase 0 | Install all deps, configs (babel, tailwind, metro, tsconfig, eslint) |
| 1 | Phase 1 | Theme system (darkTheme, lightTheme, typography, spacing), constants, types |
| 2 | Phase 2 | SQLite schema, db.ts, migrations, all queries |
| 2 | Phase 3 | All 5 Zustand stores |
| 3 | Phase 4 | All services + feature logic + storage wrappers |
| 3 | Phase 5 | All reusable components + hooks |
| 4 | Phase 6-7 | Navigation + all 9 screens |
| 5 | Phase 8 | Advanced features + polish + error handling + verification |

---

## Week-by-Week Production Timeline

> Beginner mistake: ❌ Random features banana. Correct approach: ✅ Layer-by-layer development.

### WEEK 1 — Foundation
- Setup + all installs
- Navigation (empty screens, tabs working)
- Theme + design system
- Reusable UI components

### WEEK 2 — Data Layer
- SQLite setup + schema
- CRUD in order: **Create → Read → Delete → Edit** (ek ek karo)
- Zustand stores connect
- Favorites + Search (with filters: All / Favorites / Recent / Language)

### WEEK 3 — File & Export
- FileSystem folder creation on startup
- Image attach flow
- Export (.txt / .js / .json)
- File Manager screen (with rename / copy / move / delete / share)

### WEEK 4 — AI + Polish + Build
- Gemini AI integration (Explain first, then Summarize / Optimize / Refactor)
- AI History + offline cache
- Animations + Haptics + Toasts ("Saved" / "Deleted" / "Exported")
- Performance: memoization (useMemo / useCallback) + lazy loading
- Error handling with Retry buttons
- Build: Android APK (EAS) + Play Store AAB

---

## Simplified Beginner Build Order

> Ye order beginners ke liye hai — ek ek cheez stable hone ke baad next pe jao.

```
1. UI (screens + components, empty data)
       ↓
2. SQLite (schema + tables + db init)
       ↓
3. CRUD (Create → Read → Delete → Edit, ek ek)
       ↓
4. Search (SQLite LIKE, debounce 300ms)
       ↓
5. Favorites (toggle + SQLite update + store)
       ↓
6. FileSystem (folder create + image attach)
       ↓
7. Export (txt/js/json + share dialog)
       ↓
8. AI (Gemini API + SQLite cache)
       ↓
9. Polish (animations + haptics + toasts + errors)
```

> **BIGGEST BEGINNER MISTAKE:**
> ❌ AI pehle banana | ❌ Animations pehle banana | ❌ Sab ek saath banana
>
> ✅ Foundation pehle, features baad mein.

---

## Verification Plan

### Build Checks
```bash
npx tsc --noEmit          # TypeScript strict check
npx eslint src/ app/      # Lint all files
npx expo start            # Dev server
npx expo run:android      # Full Android build (APK)
npx eas build --platform android --profile production  # Play Store AAB
```

### Screen QA Matrix
| Screen | Test |
|---|---|
| Home | Create → list appears; Pin → top; Swipe delete; Sections visible (pinned/recent/all) |
| Create | Validation; Language pick; Tag add; Save; Haptic on save |
| Detail | Copy code; Toggle fav; AI sheet; Attach file; Edit mode |
| Search | Debounce 300ms; Filter by Language; Recent searches; Empty state |
| Favorites | Only fav shown; Unfav removes from list |
| Files | Import; Long-press → rename/delete; Folder tabs switch |
| AI | Explain → response; Same snippet → cached (no API call); Retry button on fail |
| Templates | Select → create snippet; All built-in templates shown |
| Settings | API key save to SecureStore; Backup file created in /backups/ |

### Offline Test
- Airplane mode ON → all CRUD works ✅
- AI shows cache hit or "Connect to internet" ✅
- Export still works ✅
- OfflineBanner visible on Home ✅

### Performance Test
- 100+ snippets in list → FlashList smooth scroll ✅
- Search debounce → no lag on input ✅
- No unnecessary re-renders on FlashList items (React.memo) ✅

### Production Build
- `eas build --profile preview` → internal APK for testing ✅
- `eas build --profile production` → Play Store AAB ✅

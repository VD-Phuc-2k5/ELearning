# Create Post Modal — UI/UX Specification

> **Target**: Next.js 15 + Tailwind CSS + Tiptap + existing custom component library
> **Status**: Design spec for implementation

---

## 0. Codebase Context & Constraints

Before design, map what we have vs what we need:

| Capability             | Exists?  | Details                                                                                                     |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| **Button**             | Yes      | `Button` component: 3 variants (primary/secondary/ghost), 2 sizes (sm/md), loading spinner                  |
| **Input**              | Yes      | `Input` component: label, error, helperText, password toggle                                                |
| **Modal**              | Partial  | `useConfirmModal()` hook — portal + backdrop overlay. Must generalize into a `Dialog` component             |
| **Tiptap editor**      | Partial  | `TiptapEditor` — 6 toolbar buttons (B, I, H2, bullet, ordered, blockquote), image paste/drop, no code block |
| **Loading**            | Yes      | `Loading` component exists                                                                                  |
| **Empty state**        | Yes      | `EmptyState` component exists                                                                               |
| **Icons**              | Yes      | `lucide-react` (use existing patterns: `Plus`, `AlertTriangle`, `MessageSquare`, etc.)                      |
| **Toast/notification** | No       | Need inline error banner (existing pattern: red-tinted div)                                                 |
| **Tag input**          | No       | Need to build                                                                                               |
| **Select/Dropdown**    | No       | Need to build                                                                                               |
| **Image grid**         | No       | Need to build                                                                                               |
| **Color system**       | Implicit | Tailwind defaults: `slate`, `indigo`, `red`, `emerald`, `amber`                                             |
| **Font**               | Yes      | Inter (primary)                                                                                             |
| **Dark mode**          | No       | Light mode only                                                                                             |

### What MUST be built new before assembling the modal:

1. `Dialog` component — generalize `useConfirmModal` to accept children
2. `Select` (Dropdown) component — for category picker
3. `TagInput` component — autocomplete tag selector
4. Tiptap extensions: `CodeBlockLowlight`, `Underline`, `HorizontalRule`, `TaskList`/`TaskItem`
5. `ImageGrid` component — thumbnail grid with reorder/delete

---

## 1. Design Tokens

Extend Tailwind config with:

```js
theme: {
  extend: {
    colors: {
      surface: { DEFAULT: '#ffffff', muted: '#f7f8fb', hover: '#f1f5f9' },
      border: { DEFAULT: '#e2e8f0', focus: '#818cf8' },
    },
    borderRadius: {
      modal: '16px',
      field: '12px',
      tag: '8px',
      thumbnail: '8px',
    },
    boxShadow: {
      modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      soft: '0 16px 40px -24px rgb(15 23 42 / 0.45)',
      toolbar: '0 4px 16px -4px rgba(0, 0, 0, 0.12)',
    },
    animation: {
      'modal-in': 'modal-in 200ms ease-out',
      'modal-out': 'modal-out 150ms ease-in',
      'fade-in': 'fade-in 150ms ease-out',
      'slide-up': 'slide-up 200ms ease-out',
    },
  },
}
```

### Spacing system (8px base):

```
px  = 4px
1   = 8px
2   = 12px
3   = 16px
4   = 24px
5   = 32px
6   = 40px
8   = 48px
10  = 64px
12  = 96px
```

---

## 2. Component Hierarchy

```
CreatePostModal (container — or page-level)
├── Dialog (overlay + backdrop + portal)
│   ├── DialogHeader
│   │   ├── Title ("Create Post")
│   │   ├── AutosaveIndicator (text + check icon)
│   │   └── CloseButton (X icon)
│   ├── DialogBody (scrollable)
│   │   ├── TitleInput (large single-line input)
│   │   ├── EditorToolbar (sticky on scroll)
│   │   │   ├── ToolbarGroup (text formatting)
│   │   │   ├── ToolbarGroup (headings dropdown)
│   │   │   ├── ToolbarGroup (lists)
│   │   │   ├── ToolbarGroup (block types)
│   │   │   └── ToolbarGroup (inserts)
│   │   ├── TiptapEditor (contentEditable area)
│   │   ├── ImageGrid (uploaded images)
│   │   ├── CategorySelect (dropdown)
│   │   └── TagInput (autocomplete tags)
│   └── DialogFooter
│       ├── CharacterCount + ReadTime
│       ├── CancelButton
│       └── PublishButton (with loading)
└── InlineErrorBanner (conditional, at top of body)
```

---

## 3. Layout Specification

### Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────┐
│  ◄ Create Post                        Saved just now ✓  [X]  │  ← Header (py=4, px=6)
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌ Title input (placeholder, autofocus, character counter) ┐  │  ← px=6
│  └──────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Toolbar ───────────────────────────────────────────────┐  │  ← sticky, z-10
│  │ B  I  U  S  `  ┊  H1 H2 H3 H4 ┊ • 1. ☐ ┊ " ≡ ─ ┊ +  │  │  ← px=4
│  └──────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Editor ────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │  (min-h: 240px, auto-expands, prose styling)            │  │  ← px=4
│  │  Share your knowledge with the community...              │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Image Grid ───────────────────────────────────────────┐  │
│  │ [img1] [img2] [img3] [+]  ← Upload zone                 │  │  ← px=6
│  └──────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Category ─────────┐  ┌─ Tags ─────────────────────────┐  │
│  │ [Dropdown ▼      ] │  │ [tag1 ×] [tag2 ×] [Add...  ]  │  │  ← px=6
│  └────────────────────┘  └─────────────────────────────────┘  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  1,247 chars · ~5 min read          [Cancel]  [Save Draft]  [Publish]│  ← Footer
└──────────────────────────────────────────────────────────────┘

Modal width:    max-w-3xl (768px)
Modal max-h:    90vh
Body scroll:    overflow-y-auto
Border radius:  16px (rounded-modal)
Shadow:         shadow-modal
Backdrop:       bg-black/50 + backdrop-blur-sm
```

### Tablet (640px–1023px)

- Modal: `mx-4`, max-width fills screen minus margins
- Toolbar: wraps to 2 rows on smaller tablets
- Image grid: 3 columns → 2 columns

### Mobile (<640px)

- Modal becomes **full-screen sheet** (no border radius, full height)
- Toolbar: **sticky at bottom** (not top) for thumb reach
  - Compact: only 4 most-used buttons visible (B, I, H2, link)
  - "More" button opens overflow panel
- Footer: **sticky at bottom**, buttons full-width stacked
- Back button replaces close button in header
- Image grid: 2 columns

---

## 4. Component States

### 4.1 Title Input

```
┌────────────────────────────────────────────────┐
│ Give your post a clear and descriptive title...│  ← default (placeholder)
│ font-size: 18px, font-weight: 600,             │
│ slate-400 placeholder                          │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ How to optimize NestJS microservices ───── 42  │  ← active + filled
│ font-size: 18px, font-weight: 600,             │
│ slate-900 text, focus: outline-none            │
└────────────────────────────────────────────────┘
                                   ↑ counter shows at 80+ chars
                                   counter turns amber at 80% of max (120)
                                   counter turns red at 100%
                                   input border turns red when over max
```

### 4.2 Editor Toolbar

Each button has 5 states:

```
[ B ]  default:    bg-transparent, text-slate-500, h-8 w-8, rounded-lg
[ B ]  hover:      bg-slate-100, text-slate-700
[ B ]  active:     bg-indigo-100, text-indigo-700 (when formatting is applied there)
[ B ]  focus:      outline-2, outline-indigo-500, outline-offset-1
[ B ]  disabled:   opacity-40, cursor-not-allowed

Group separator: w-px h-6 bg-slate-200, mx-1
```

Dropdown menus (headings, insert):

```
┌──────────────┐
│ Paragraph    │  ← hover: bg-slate-50
│ Heading 1    │  ← active: bg-indigo-50, text-indigo-700, checkmark right
│ Heading 2    │
│ Heading 3    │
│ Heading 4    │
└──────────────┘
Dropdown: bg-white, rounded-lg, shadow-lg, border, p-1, min-w-40
          animate-slide-up (200ms ease-out)
```

### 4.3 Editor Area

```
Default (empty):
┌─────────────────────────────────────────────────┐
│                                                 │
│  Share your knowledge with the community...     │  ← placeholder (slate-300, italic)
│                                                 │
│  You can include text, images, code snippets,   │
│  and explanations.                              │
│                                                 │
└─────────────────────────────────────────────────┘
border: border-slate-200, rounded-field (12px)
bg: white
min-h: 240px
focus: border-indigo-500, ring-4 ring-indigo-100
```

### 4.4 Image Grid

```
Empty state:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                          📷 (icon)                               │
│                                                                  │
│                    No images uploaded yet                        │
│                                                                  │
│              ┌─────────────────────────────────┐                 │
│              │  Drag files here or click to    │  ← dashed border│
│              │  upload                         │     border-2    │
│              └─────────────────────────────────┘     border-dashed│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
Dashed border: border-2 border-dashed border-slate-200 rounded-field
Hover: border-indigo-300 bg-indigo-50/30

With images:
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│          │ │          │ │          │ │          │
│  [img]   │ │  [img]   │ │  [img]   │ │  [  +  ] │  ← add more
│          │ │          │ │          │ │          │
│  [ × ]   │ │  [ × ]   │ │  [ × ]   │ │          │  ← delete button
└──────────┘ └──────────┘ └──────────┘ └──────────┘
Thumbnails: 96x96px, rounded-tag, object-cover
Delete button: top-right, w-5 h-5, bg-red-500/80, text-white, rounded-full
Hover: opacity-80 + scale(1.02)
Add slot: 96x96px, dashed border, "+" icon centered

Uploading:
┌──────────┐
│          │
│   ▓▓▓▓   │  ← progress overlay (bg-black/50)
│   63%    │  ← white text
│          │
└──────────┘

Upload failed:
┌──────────┐
│          │
│   ⚠ retry│  ← error state, red tint
│          │
└──────────┘
```

### 4.5 Category Select

```
Default:  ┌─────────────────────────────┐
          │ General Discussion      ▼  │  ← bg-white, border, rounded-field
          └─────────────────────────────┘     h-11

Open:     ┌─────────────────────────────┐
          │ General Discussion      ▲  │
          ├─────────────────────────────┤
          │ Programming                 │  ← hover: bg-slate-50
          │ Backend                ✓  │  ← active: bg-indigo-50, checkmark
          │ Frontend                    │
          │ DevOps                      │
          │ AI / Machine Learning      │
          │ Database                    │
          │ Mobile Development         │
          │ Career & Learning          │
          └─────────────────────────────┘
Dropdown: bg-white, border, rounded-field, shadow-lg, max-h-60 overflow-y-auto
Animation: animate-slide-up 200ms ease-out
```

### 4.6 Tag Input

```
┌──────────────────────────────────────────────────────────────────────┐
│ [nestjs ×] [typescript ×] | Add tag...                              │ ← input grows
└──────────────────────────────────────────────────────────────────────┘

Tag pill: bg-indigo-50, text-indigo-700, rounded-tag, px-2 py-0.5, text-xs
Delete:  "×" button, ml-1, hover: text-indigo-900
Input:   inline, no border, focus:outline-none, min-w-20

Dropdown (shows when typing):
┌───────────────────┐
│ "perf" →          │
│ performance       │  ← existing tags match
│ perfect-guide     │
│ performance-tips  │
├───────────────────┤
│ + Create "perf"   │  ← if no match + user has permission
└───────────────────┘
max-h: 32, overflow-y-auto, shadow-lg, rounded-field
```

### 4.7 Footer

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1,247 chars · ~5 min read          [Cancel]  [Save Draft]  [Publish]  │
└──────────────────────────────────────────────────────────────────────┘

Publish button states:
  disabled:  opacity-60, cursor-not-allowed (title empty OR content empty)
  idle:      bg-indigo-600, text-white
  hover:     bg-indigo-700
  active:    bg-indigo-800
  loading:   spinner replaces text, button disabled
  success:   brief green checkmark ("Published!") → modal closes (250ms delay)

Cancel:      variant="secondary" (existing Button pattern)
Save Draft:  variant="ghost"
```

### 4.8 Error Banner (Inline)

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚠ Title is required. Please enter a title before publishing.   │  ← bg-red-50, border-red-200
└──────────────────────────────────────────────────────────────────┘
  border: border border-red-200, rounded-field (12px)
  bg: bg-red-50
  text: text-sm text-red-700
  icon: AlertTriangle (lucide), h-4 w-4, text-red-400
  margin: mb-4

  Position: between header and title input (slides in from top)
  Duration: persists until user fixes issue or clicks dismiss
  Animation: animate-slide-up 200ms ease-out
```

---

## 5. Interaction Flows

### 5.1 Primary Flow — Create & Publish

```
1. User clicks "New Post" button on forum page
2. Modal opens (animate: opacity + scale, 200ms)
3. Title input autofocuses
4. User types title → character counter updates in real time
5. User writes content in editor (or pastes)
   - Images pasted/dropped → upload starts → progress shown in grid
   - Toolbar interaction → formatting applied in real time
6. (Optional) User selects category from dropdown
7. (Optional) User adds tags via autocomplete
8. User clicks "Publish" (or Ctrl/Cmd+Enter)
   - Validation runs (client-side):
     · Title empty? → show error banner, focus title
     · Content empty? → show error banner, focus editor
     · Images still uploading? → show error banner
   - If valid → button shows spinner → API call
   - On success → modal closes, redirect to new post
   - On failure → error banner with retry option
```

### 5.2 Draft Flow

```
1. Editor content auto-saves to localStorage every 30s (debounced)
2. "Save Draft" button does explicit save + persists to server
3. If user closes modal with unsaved changes:
   - Show confirm dialog ("You have unsaved changes. Discard?")
   - Esc key triggers same confirmation
4. If user navigates away (browser back, link click):
   - beforeunload event checker
```

### 5.3 Image Upload Flow

```
1. User pastes image / drags file / clicks upload zone
2. Client-side validation:
   - Type: PNG, JPG, JPEG, GIF, WEBP ✓ — else: error banner
   - Size: max 10MB ✓ — else: error banner
   - Count: max 10 ✓ — else: error banner
3. Thumbnail appears in grid with progress overlay (0% → 100%)
4. Upload completes → thumbnail shows image preview
5. Upload fails → error state on thumbnail, "Retry" button
6. User can drag thumbnails to reorder (drag handle or long-press on mobile)
```

### 5.4 Keyboard Shortcuts

| Shortcut               | Action                           |
| ---------------------- | -------------------------------- |
| `Ctrl/Cmd + B`         | Bold                             |
| `Ctrl/Cmd + I`         | Italic                           |
| `Ctrl/Cmd + U`         | Underline                        |
| `Ctrl/Cmd + Shift + S` | Strikethrough                    |
| `Ctrl/Cmd + E`         | Inline code                      |
| `Ctrl/Cmd + Alt + 1-4` | Heading 1-4                      |
| `Ctrl/Cmd + Alt + 0`   | Paragraph                        |
| `Ctrl/Cmd + Shift + 7` | Numbered list                    |
| `Ctrl/Cmd + Shift + 8` | Bullet list                      |
| `Ctrl/Cmd + Shift + 9` | Task checklist                   |
| `Ctrl/Cmd + Shift + B` | Blockquote                       |
| `Ctrl/Cmd + Shift + C` | Code block                       |
| `Ctrl/Cmd + K`         | Insert link                      |
| `Ctrl/Cmd + Z`         | Undo                             |
| `Ctrl/Cmd + Shift + Z` | Redo                             |
| `Ctrl/Cmd + Enter`     | Publish                          |
| `Ctrl/Cmd + S`         | Save draft                       |
| `Esc`                  | Close modal (with unsaved check) |

---

## 6. Loading States

### 6.1 Modal Opening

- Skeleton placeholder for 200ms while content mounts (if heavy)

### 6.2 Image Upload

- Per-image progress bar with percentage
- Aggregate "Uploading 2 of 5 images..." text in footer area

### 6.3 Publishing

- Publish button: spinner replaces text
- Cancel/Save Draft buttons: disabled during publish
- Overlay: subtle `bg-white/30` over entire modal, pointer-events-none

### 6.4 Autosave

- Small "Saving..." text with pulsing dot in header
- Changes to "Saved just now ✓" (static, then fades after 3s)

---

## 7. Error States & Recovery

| Error                           | Display                                                            | Recovery                               |
| ------------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| Network failure                 | Error banner: "Network error. Please check your connection."       | "Retry" button in banner               |
| Upload failed (single image)    | Red tint on thumbnail + "⚠" icon                                  | "Retry" link on thumbnail              |
| Publish failed                  | Error banner: "Failed to publish. {server message}"                | "Try Again" button; draft is preserved |
| Title > max length              | Counter turns red, border turns red                                | Trim title or edit                     |
| Unsupported file type           | Error banner: "Unsupported file type. Use PNG, JPG, GIF, or WEBP." | Dismiss + try different file           |
| Image too large                 | Error banner: "File exceeds 10MB limit."                           | Dismiss + compress image               |
| Too many images                 | Error banner: "Maximum 10 images allowed."                         | Dismiss                                |
| Upload in progress (publishing) | Error banner: "Please wait for image upload to complete."          | Wait or cancel upload                  |
| Empty title                     | Error banner: "Title is required." + focus title input             | Type title                             |
| Empty content                   | Error banner: "Content cannot be empty." + focus editor            | Write content                          |

**ALL errors use the inline error banner pattern.** Never use `alert()` or `window.confirm()`.

---

## 8. Accessibility (WCAG 2.2 AA)

### Keyboard Navigation

- `Tab` / `Shift+Tab`: cycle through all interactive elements in order
- `Enter` / `Space`: activate focused button/toggle
- `Escape`: close modal (after unsaved check)
- `Arrow keys`: navigate dropdown options, tag suggestions
- Focus trap: Tab cycling stays within modal (wrap from last to first)
- Focus restoration: on modal close, focus returns to the "New Post" button

### Screen Reader

- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title, `aria-describedby` for context
- Toolbar: `role="toolbar"`, each button has `aria-label`, `aria-pressed` for toggles
- Editor: `role="textbox"`, `aria-multiline="true"`, `aria-placeholder`
- Image grid: `role="list"`, each image `role="listitem"` with `aria-label="Image {n}"`
- Category select: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`
- Tag input: `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`
- Error banner: `role="alert"`, `aria-live="assertive"`
- Loading: `aria-busy="true"`, `aria-live="polite"`
- Character counter: `aria-live="polite"` (announces at 80%, 90%, 100%)

### Color Contrast

- Body text on background: ≥4.5:1 (slate-900 on white = 15.4:1 ✓)
- Error text: red-700 on red-50 = 7.1:1 ✓
- Placeholder text: slate-400 on white = 4.6:1 (borderline — make 500 on focus)
- Button text: white on indigo-600 = 6.3:1 ✓
- Focus indicators: visible outline (not color-only)

### Touch Targets

- Toolbar buttons: min 32×32px (h-8 w-8 = 32px ✓)
- Delete image button: min 28×28px
- Dropdown options: min h-10 (40px)
- Tag close buttons: min 24×24px
- Mobile sticky toolbar: min h-12 (48px)

---

## 9. Responsive Behavior Summary

| Breakpoint          | Modal Width                   | Toolbar                                   | Image Grid             | Footer                            |
| ------------------- | ----------------------------- | ----------------------------------------- | ---------------------- | --------------------------------- |
| <640px (mobile)     | Full screen (100vw, 100dvh)   | Sticky bottom, compact (4 buttons + more) | 2 columns, 80px thumbs | Sticky bottom, stacked full-width |
| 640-1023px (tablet) | calc(100vw - 32px), max 768px | Top, wraps 2 rows                         | 3 columns              | Horizontal                        |
| ≥1024px (desktop)   | max-w-3xl (768px)             | Top, single row                           | 4 columns              | Horizontal                        |

---

## 10. Tiptap Extension Setup

### Required npm packages (new):

```
@tiptap/extension-code-block-lowlight
@tiptap/extension-underline
@tiptap/extension-task-list
@tiptap/extension-task-item
@tiptap/extension-horizontal-rule
@tiptap/extension-placeholder
lowlight
```

### Extension configuration:

```ts
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Placeholder from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    codeBlock: false, // replaced by CodeBlockLowlight
  }),
  Image.configure({ allowBase64: false }),
  Link.configure({ openOnClick: false, autolink: true }),
  Underline,
  CodeBlockLowlight.configure({ lowlight }),
  TaskList,
  TaskItem.configure({ nested: true }),
  HorizontalRule,
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') return 'Heading...';
      return 'Write something, or type / for commands...';
    },
  }),
];
```

### Note on language selector:

The language selector dropdown for code blocks is NOT part of core Tiptap. It requires a custom extension or a toolbar-based language picker. Two approaches:

**Approach A (recommended — simpler)**: Language selector in toolbar. A dropdown button "Code" that inserts `codeBlock` with `language: 'auto'`. User can then click into a code block and change the language via a floating popover.

**Approach B**: `@tiptap/extension-code-block-lowlight` with a custom NodeView that renders a language selector in the code block's gutter.

For this spec, use Approach A with a toolbar dropdown.

---

## 11. Developer Handoff Notes

### Components to build (in order):

```
src/components/ui/
├── dialog.tsx           ← generalize ConfirmModal pattern
├── select.tsx           ← dropdown/select with keyboard nav
├── tag-input.tsx        ← autocomplete multi-tag input
├── image-grid.tsx       ← upload zone + thumbnail grid
├── editor-toolbar.tsx   ← full Tiptap toolbar (extracted from tiptap-editor)
├── tiptap-editor.tsx    ← UPDATE: add new extensions, integrate toolbar
└── create-post-modal.tsx ← assemble everything
```

### File: `dialog.tsx`

```tsx
// Pattern: portal + backdrop + centered content
// Reuse: the fixed inset-0 overlay pattern from confirm-modal.tsx
// Props: open, onClose, children, size?: 'sm' | 'md' | 'lg'
// Animation: CSSTransition or manual with framer-motion (if available)
// Focus trap: manual implementation or use @radix-ui/react-focus-guards
```

### File: `select.tsx`

```tsx
// Pattern: button trigger + floating dropdown
// Props: value, onChange, options: { label, value }[], placeholder?
// States: default, open, disabled
// Keyboard: ArrowUp/Down, Enter, Escape
// Use: lucide-react ChevronDown icon
```

### File: `tag-input.tsx`

```tsx
// Pattern: flex-wrap container + inline input + dropdown
// Props: value: string[], onChange, suggestions?: string[]
// Behavior:
// - Type to search existing tags
// - Enter/comma to add
// - Backspace on empty input removes last tag
// - Click × on tag to remove
```

### File: `image-grid.tsx`

```tsx
// Pattern: grid of thumbnails + upload zone
// Props: files: File[], onAdd, onRemove, onReorder?
// States: empty, uploading, error per image
// Upload: calls uploadForumImage server action
// Max: 10 images
```

### File: `editor-toolbar.tsx`

```tsx
// Extracted from tiptap-editor.tsx — standalone component
// Props: editor: Editor
// Groups:
//   Text:     Bold, Italic, Underline, Strikethrough, InlineCode, ClearMarks
//   Headings: Paragraph, H1, H2, H3, H4 (dropdown)
//   Lists:    BulletList, OrderedList, TaskList
//   Blocks:   Blockquote, CodeBlock, HorizontalRule
//   Insert:   Link, Image
//   History:  Undo, Redo
```

### Integration with existing code:

1. **Replace** `apps/LearningHub/src/app/(main)/forum/[slug]/new-post/page.tsx`
   - Current: inline form page → New: modal wrapper OR keep page layout, enhance editor
2. **Update** `TiptapEditor` to accept `toolbarPosition` prop and richer config

3. **Add** new components to `src/components/ui/index.ts` barrel export

### Rollout strategy:

1. Build `Dialog` component (no dependency, pure utility)
2. Build `Select` component (for category)
3. Build `TagInput` component
4. Install new Tiptap extensions + build `EditorToolbar`
5. Build `ImageGrid` component
6. Assemble `CreatePostModal`
7. Replace `new-post/page.tsx` with modal
8. Test keyboard nav, screen reader, responsive

---

## 12. Implementation Priority Matrix

| Priority | Component                                       | Effort      | Impact                |
| -------- | ----------------------------------------------- | ----------- | --------------------- |
| P0       | `Dialog` (generalized modal)                    | Small (1h)  | Blocks all modal work |
| P0       | `EditorToolbar` (extracted, enriched)           | Medium (2h) | Core UX               |
| P0       | Tiptap extensions (code block, underline, etc.) | Small (1h)  | Core content creation |
| P1       | `Select` (dropdown)                             | Medium (2h) | Category picker       |
| P1       | `TagInput`                                      | Medium (2h) | Tag system            |
| P1       | `ImageGrid`                                     | Medium (3h) | Image management      |
| P2       | `CreatePostModal` assembly                      | Medium (3h) | Integration           |
| P2       | Autosave logic                                  | Small (1h)  | Draft persistence     |
| P3       | Slash commands                                  | Medium (2h) | Power user UX         |
| P3       | Language selector for code blocks               | Medium (2h) | Developer UX          |

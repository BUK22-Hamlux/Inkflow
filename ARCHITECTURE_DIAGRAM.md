# InkFlow Architecture Diagram

## Application Overview
InkFlow is a React-based document editor built with TipTap (a ProseMirror-based rich text editor), featuring local storage persistence, theming, and responsive design.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Welcome    │    │   Editor     │    │   Focus      │              │
│  │    Page      │◄──►│    Page      │◄──►│    Mode      │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                  │                    │                       │
│         └──────────────────┴────────────────────┘                       │
│                            │                                            │
│                    ┌───────▼────────┐                                   │
│                    │   AppContent   │                                   │
│                    │   (Router)     │                                   │
│                    └───────┬────────┘                                   │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                         CONTEXT LAYER                                    │
│  ┌──────────────────────────┼──────────────────────────────────────┐   │
│  │ ┌────────────────────────┴──────────────────────────────────┐   │   │
│  │ │                    EditorProvider                         │   │   │
│  │ │  • appState (welcome/editing/focusMode)                   │   │   │
│  │ │  • currentDocId, currentTitle                            │   │   │
│  │ │  • editor instance, pageSettings                         │   │   │
│  │ │  • modal states (export, shortcuts, find, about)        │   │   │
│  │ │  • document management (openNew, openExisting)           │   │   │
│  │ └────────────────────────┬──────────────────────────────────┘   │   │
│  │                          │                                          │   │
│  │ ┌─────────────────────────┴──────────────────────────────────┐   │   │
│  │ │                   ThemeProvider                            │   │   │
│  │ │  • theme state (light, dark, purple, teal, rose, amber)   │   │   │
│  │ │  • theme switching functionality                          │   │   │
│  │ └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    DialogProvider                            │ │   │
│  │ │  • modal dialog management (prompt, confirm)                  │ │   │
│  │ │  • promise-based dialog API                                 │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────────────┐
│                          COMPONENT LAYER                                 │
│  ┌──────────────────────────┼──────────────────────────────────────┐   │
│  │                          │                                      │   │
│  │ ┌─────────────────────────▼──────────────────────────────────┐   │   │
│  │ │                    EditorLayout                            │   │   │
│  │ │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │   │   │
│  │ │  │MenuBar  │  │Toolbar  │  │ Sidebar │  │StatusBar│      │   │   │
│  │ │  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │   │   │
│  │ │  ┌─────────────────────────────────────────────────┐     │   │   │
│  │ │  │              EditorCanvas (TipTap)               │     │   │   │
│  │ │  │  • Rich text editing with extensions             │     │   │   │
│  │ │  │  • Auto-pagination and page layout               │     │   │   │
│  │ │  │  • Image resizing, tables, links, formatting      │     │   │   │
│  │ │  └─────────────────────────────────────────────────┘     │   │   │
│  │ └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    WelcomePage                                │ │   │
│  │ │  • Drag & drop file upload (docx, txt)                        │ │   │
│  │ │  • Recent documents list from localStorage                    │ │   │
│  │ │  • New document creation                                      │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────────────┐
│                          HOOKS LAYER                                     │
│  ┌──────────────────────────┼──────────────────────────────────────┐   │
│  │                          │                                      │   │
│  │ ┌─────────────────────────▼──────────────────────────────────┐   │   │
│  │ │                    useEditorState                            │   │   │
│  │ │  • Tracks active formatting (bold, italic, headings, etc.)  │   │   │
│  │ │  • Monitors editor state changes (transaction, selection)  │   │   │
│  │ │  • Provides undo/redo state                                  │   │   │
│  │ └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    useMenuActions                            │ │   │
│  │ │  • File operations (new, open, save, export, print)          │ │   │
│  │ │  • Edit operations (undo, redo, find/replace)                 │ │   │
│  │ │  • View operations (theme, sidebar, focus mode)              │ │   │
│  │ │  • Insert operations (links, images, tables, rules)          │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    useImageActions                           │ │   │
│  │ │  • Image file selection and upload                            │ │   │
│  │ │  • Image manipulation (resize, align)                        │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    useDropZone                               │ │   │
│  │ │  • Drag & drop file handling                                  │ │   │
│  │ │  • File type validation and processing                       │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    useTheme                                  │ │   │
│  │ │  • Theme state management                                     │ │   │
│  │ │  • CSS variable updates for theming                           │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────────────┐
│                          UTILITIES LAYER                                 │
│  ┌──────────────────────────┼──────────────────────────────────────┐   │
│  │                          │                                      │   │
│  │ ┌─────────────────────────▼──────────────────────────────────┐   │   │
│  │ │                    localStorage.js                          │   │   │
│  │ │  • Document CRUD operations                                │   │   │
│  │ │  • Storage quota management (5MB limit)                    │   │   │
│  │ │  • Recent colors persistence                                │   │   │
│  │ └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    openDocx.js / openTxt.js                  │ │   │
│  │ │  • File import parsing (mammoth for docx)                   │ │   │
│  │ │  • HTML content conversion                                   │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    exportDocx.js / exportPdf.js              │ │   │
│  │ │  • Document export functionality                             │ │   │
│  │ │  • Format conversion (docx, pdf)                              │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────────────┐
│                          TIPAPAT EXTENSIONS LAYER                         │
│  ┌──────────────────────────┼──────────────────────────────────────┐   │
│  │                          │                                      │   │
│  │ ┌─────────────────────────▼──────────────────────────────────┐   │   │
│  │ │                    Custom Extensions                       │   │   │
│  │ │  • AutoPagination - Automatic page layout management       │   │   │
│  │ │  • PageBreak - Manual page break insertion                  │   │   │
│  │ │  • FontSize - Custom font size support                      │   │   │
│  │ │  • ResizableImage - Drag-to-resize images                   │   │   │
│  │ └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │ ┌──────────────────────────────────────────────────────────────┐ │   │
│  │ │                    Standard Extensions                       │ │   │
│  │ │  • StarterKit - Basic editing (bold, italic, lists, etc.)    │ │   │
│  │ │  • TextStyle, Color, FontFamily - Text formatting           │ │   │
│  │ │  • TextAlign - Paragraph alignment                           │ │   │
│  │ │  • Link, Image - Media insertion                             │ │   │
│  │ │  • Table, TableRow, TableCell - Table support               │ │   │
│  │ │  • DragHandle, Dropcursor - Drag & drop UI                   │ │   │
│  │ └──────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────────────┐
│                          DATA PERSISTENCE LAYER                          │
│  ┌──────────────────────────┼──────────────────────────────────────┐   │
│  │                          │                                      │   │
│  │ ┌─────────────────────────▼──────────────────────────────────┐   │   │
│  │ │                    Browser localStorage                     │   │   │
│  │ │  • inkflow_documents - Document storage array              │   │   │
│  │ │  • inkflow_recent_colors - Recently used colors            │   │   │
│  │ │  • 5MB storage limit with quota management                  │   │   │
│  │ └──────────────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Document Creation Flow
```
User clicks "New Document" 
  → EditorContext.openNewDocument()
  → generateDocId() creates unique ID
  → saveDocument() saves to localStorage
  → setAppState("editing")
  → EditorPage renders with new document
```

### Document Opening Flow
```
User selects existing document
  → EditorContext.openExistingDocument(doc)
  → Load document content from localStorage
  → setInitialContent(doc.content)
  → setPageSettings(doc.pageSettings)
  → setAppState("editing")
  → EditorCanvas hydrates TipTap editor with content
```

### Editing Flow
```
User types in editor
  → TipTap editor transaction
  → useEditorState hook detects change
  → Editor state updates (formatting, selection)
  → Toolbar buttons update to reflect current state
  → AutoPagination recalculates page layout
  → Changes kept in memory until save
```

### Save Flow
```
User triggers save (Ctrl+S or menu)
  → useMenuActions.saveCurrentDocument()
  → editor.getJSON() gets current content
  → editor.getText() gets plain text for word count
  → saveDocument() updates localStorage
  → Toast notification confirms save
```

### Theme Switching Flow
```
User changes theme
  → useMenuActions.selectTheme(themeId)
  → ThemeContext.setTheme(themeId)
  → CSS variables update via themes.css
  → UI re-renders with new colors
  → Theme preference persists in localStorage
```

## Key Technologies

- **React 19** - UI framework with concurrent features
- **TipTap 3** - Rich text editor built on ProseMirror
- **Tailwind CSS 4** - Utility-first styling with theming
- **Vite 8** - Build tool and dev server
- **localStorage** - Client-side data persistence
- **Framer Motion** - Animations
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **docx, mammoth** - Word document import/export
- **html2pdf.js** - PDF export

## Component Structure

### UI Components
- **MenuBar** - Application menu with File, Edit, View, Insert, Format, Help
- **Toolbar** - Formatting toolbar (desktop)
- **MobileToolbar** - Responsive toolbar for mobile devices
- **EditorCanvas** - Main TipTap editor instance with custom extensions
- **DocumentSettings** - Sidebar for page configuration
- **StatusBar** - Document statistics display

### Specialized Components
- **TablePicker** - Interactive table dimension selector
- **ColorPicker** - Color selection with recent colors
- **FontFamilySelector** - Font family dropdown
- **FontSizeSelector** - Font size controls
- **AlignmentControls** - Text alignment options
- **ImageToolbar** - Image manipulation controls
- **TableToolbar** - Table editing controls

### Context Providers
- **EditorProvider** - Global editor state and document management
- **ThemeProvider** - Theme management and CSS variable updates
- **DialogProvider** - Modal dialog system

## State Management

The application uses React Context API for state management:

1. **EditorContext** - Core application state
   - Current document ID and title
   - Editor instance reference
   - Page settings (margins, size, spacing)
   - Modal visibility states
   - Application state (welcome/editing/focusMode)

2. **ThemeContext** - Visual appearance
   - Current theme ID
   - Theme switching logic

3. **DialogContext** - UI interactions
   - Modal dialog management
   - Promise-based API for user input

## File Organization

```
src/
├── components/          # Reusable UI components
│   ├── Editor/         # TipTap editor wrapper
│   ├── MenuBar/        # Application menu
│   ├── Toolbar/        # Formatting controls
│   ├── Modals/         # Dialog components
│   ├── Sidebar/        # Settings panel
│   └── UI/             # Basic UI elements
├── context/            # React Context providers
├── extensions/         # TipTap custom extensions
├── hooks/              # Custom React hooks
├── layouts/            # Page layout components
├── pages/              # Main page components
├── sections/           # Welcome page sections
├── styles/             # Global CSS files
├── utils/              # Utility functions
└── config/             # Configuration files
```

## Key Features

1. **Rich Text Editing** - Full-featured editor with formatting, links, images, tables
2. **Auto-pagination** - Automatic page layout calculation
3. **Responsive Design** - Mobile and desktop layouts
4. **Local Storage** - Documents saved locally, no server required
5. **Theme System** - Multiple color themes with live switching
6. **File Import/Export** - Support for DOCX, TXT import and export
7. **Focus Mode** - Distraction-free writing environment
8. **Keyboard Shortcuts** - Efficient editing workflows
9. **Image Manipulation** - Resizable images with alignment options
10. **Table Support** - Full table creation and editing capabilities
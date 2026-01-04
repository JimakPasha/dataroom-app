# Data Room

A modern, full-featured Data Room application built with React, TypeScript, and Redux Toolkit. This application allows users to securely store, manage, and organize documents in a virtual data room environment, inspired by industry-leading solutions like Google Drive, Dropbox, and Box.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JimakPasha/dataroom-app.git OR get .zip
   cd dataroom-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173` (Vite's default port)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📋 Features

> **📖 Detailed Documentation**: For comprehensive information about the application, including business use cases, technical architecture, and implementation details, visit the **About & Documentation** page within the application, or continue reading below.

### Core Functionality

- **Data Room Management**: Create, view, and delete data rooms
- **Folder Management**: 
  - Create nested folders (unlimited depth)
  - Rename folders
  - Delete folders (with cascading deletion of nested items)
  - Navigate through folder hierarchy
- **File Management**:
  - Upload PDF, DOCX, XLSX, TXT, and CSV files (drag & drop supported)
  - Upload entire folders with all contents (including nested folders)
  - View files in a built-in viewer
  - Rename files
  - Delete files
  - Download files
- **User Experience**:
  - Breadcrumb navigation (inspired by macOS/Windows file explorers)
  - Folder tree sidebar for quick navigation
  - Context menus for quick actions
  - Toast notifications for user feedback
  - Responsive design (works on desktop, tablet, and mobile)
  - Loading states and error handling
  - Empty states with helpful messaging

## 🛠 Technology Stack

- **Frontend Framework**: React 18+ with Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI primitives)
- **State Management**: Redux Toolkit (RTK) with React-Redux
- **Storage**: IndexedDB (browser-based persistence)
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📁 Project Structure

```
dataroom-app/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI base components (Button, Dialog, etc.)
│   │   ├── dialogs/         # Dialog components (CreateFolder, Rename, etc.)
│   │   ├── Breadcrumbs.tsx  # Breadcrumb navigation component
│   │   ├── FileList.tsx     # Main file and folder list component
│   │   ├── FileUpload.tsx   # Drag-and-drop file upload component
│   │   ├── FolderTree.tsx   # Collapsible folder tree sidebar
│   │   ├── Layout.tsx       # Main application layout
│   │   └── PDFViewer.tsx    # PDF and document viewer component
│   ├── hooks/
│   │   ├── redux.ts          # Typed Redux hooks (useAppDispatch, useAppSelector)
│   │   └── use-toast.ts     # Toast notification hook
│   ├── lib/
│   │   ├── db.ts            # IndexedDB wrapper and database operations
│   │   ├── utils.ts         # Utility functions (name sanitization, etc.)
│   │   └── validators.ts    # File validation functions
│   ├── pages/
│   │   └── AboutPage.tsx    # About/info page
│   ├── store/
│   │   ├── index.ts         # Redux store configuration
│   │   ├── dataroomSlice.ts # DataRoom state management slice
│   │   ├── folderSlice.ts   # Folder state management slice
│   │   ├── fileSlice.ts     # File state management slice
│   │   └── uiSlice.ts       # UI state management slice (dialogs, modals)
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions (DataRoom, Folder, File)
│   ├── App.tsx              # Main application component with routing
│   └── main.tsx             # Application entry point
├── vercel.json              # Vercel deployment configuration (SPA routing)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── .prettierrc              # Prettier code formatting rules
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

### Key Files Explained

- **`src/lib/db.ts`**: IndexedDB wrapper that handles all database operations (CRUD for DataRooms, Folders, Files)
- **`src/store/*.ts`**: Redux slices that manage application state and handle async operations
- **`src/components/FileList.tsx`**: Main component that displays files and folders, handles user interactions
- **`src/components/FolderTree.tsx`**: Sidebar component showing hierarchical folder structure
- **`vercel.json`**: Configuration for Vercel deployment, ensures SPA routing works correctly

## 📖 Usage Guide

### Creating a Data Room

1. On the welcome screen, click the **"Create Data Room"** button
2. Enter a name for the data room in the dialog
3. Click **"Create"** to confirm
4. The new data room will appear in the sidebar

### Managing Folders

**Creating a Folder**:
1. Select a data room from the sidebar (or create one if none exist)
2. Click the **"New Folder"** button in the toolbar
3. Enter a folder name in the dialog
4. Click **"Create"** to confirm

**Navigating Folders**:
- **Click on a folder** in the file list to navigate into it
- **Use breadcrumbs** at the top to jump to any parent folder
- **Use the folder tree** in the sidebar to navigate directly to any folder
- **Click the back arrow** in breadcrumbs to go to the parent folder

**Nested Folders**:
- Folders can be nested to any depth
- Create a folder inside another folder by navigating into the parent folder first, then creating a new folder

### Uploading Files

1. Navigate to the folder where you want to upload files
2. **Drag and drop** a file onto the upload area, OR
3. Click **"Select File"** and choose a file from your computer
4. Supported file types: PDF, DOCX, XLSX, TXT, CSV
5. Maximum file size: 10MB
6. Files with duplicate names are automatically renamed (e.g., "document.pdf" → "document (1).pdf")

### Uploading Folders

1. Navigate to the folder where you want to upload a folder
2. **Drag and drop** a folder onto the upload area, OR
3. Click **"Upload Folder"** from the menu (➕ button or context menu), OR
4. Click **"Select Folder"** in the empty state area
5. Select a folder from your computer
6. The entire folder structure will be recreated, including:
   - All nested subfolders
   - All files within the folder and subfolders
7. **Browser Support**:
   - **Chrome/Edge**: Full support for folders (including empty folders) via File System Access API
   - **Firefox/Safari**: Support for folders with files via webkitdirectory (empty folders require adding at least one file)
8. All files are validated (type and size) before upload
9. Folder and file names are automatically sanitized and made unique if duplicates exist

### Viewing Files

1. Click on a file in the file list
2. A modal will open with the file viewer
3. For PDF files, you can scroll through pages
4. For other file types, the content will be displayed in a readable format
5. Click the **download button** to save the file to your computer
6. Click outside the modal or press ESC to close

### Renaming Items

1. **Right-click** on a file or folder, OR
2. Click the **three-dot menu** (⋮) next to an item
3. Select **"Rename"** from the context menu
4. Enter the new name in the dialog
5. Click **"Rename"** to confirm
6. Invalid characters will be automatically sanitized

### Deleting Items

1. **Right-click** on a file or folder, OR
2. Click the **three-dot menu** (⋮) next to an item
3. Select **"Delete"** from the context menu
4. Confirm the deletion in the dialog
5. **Important**: Deleting a folder will also delete ALL nested folders and files inside it (cascading deletion)

## Design Decisions

This section explains the key architectural and design decisions made during development, along with the reasoning behind each choice.

### Problem Statement & Approach

The goal was to create a Data Room MVP that allows users to securely store, manage, and share company documents. After researching existing solutions like Google Drive, Dropbox, and Box, as well as native file explorers (macOS Finder, Windows Explorer), I identified key UX patterns that users expect:

1. **Hierarchical folder structure** with intuitive navigation
2. **Visual feedback** for all user actions
3. **Quick access** to common operations (context menus)
4. **Clear visual hierarchy** showing current location
5. **Drag-and-drop** for file operations

### State Management Architecture

**Decision**: Redux Toolkit with separate domain slices

**Rationale**:
- **Predictable State Updates**: Redux's unidirectional data flow makes it easier to reason about state changes, especially when dealing with complex nested folder structures
- **TypeScript Integration**: Redux Toolkit provides excellent TypeScript support with typed hooks and actions, reducing runtime errors
- **Separation of Concerns**: Each domain (dataroom, folder, file, ui) has its own slice, making the codebase more maintainable and testable
- **Async Operations**: Redux Thunks handle all IndexedDB operations, providing a consistent pattern for async state management
- **DevTools Support**: Redux DevTools enable easy debugging and state inspection during development

**Implementation**: 
- Four main slices: `dataroomSlice`, `folderSlice`, `fileSlice`, and `uiSlice`
- All async operations use `createAsyncThunk` for consistent error handling
- Typed hooks (`useAppDispatch`, `useAppSelector`) ensure type safety throughout the app

### Data Storage Strategy

**Decision**: IndexedDB for browser-based persistence

**Rationale**:
- **No Backend Required**: The assignment allows mocking data, and IndexedDB provides a robust solution that persists across browser sessions
- **Structured Storage**: Unlike localStorage, IndexedDB supports complex data structures, transactions, and indexing
- **File Content Storage**: IndexedDB can store ArrayBuffer objects directly, making it perfect for storing file contents
- **Performance**: IndexedDB is asynchronous and non-blocking, preventing UI freezes when dealing with large files
- **Scalability**: Can handle large amounts of data (hundreds of MBs) without performance degradation

**Data Structure Design**:
```typescript
// Hierarchical structure using parentId references
DataRoom {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

Folder {
  id: string
  name: string
  parentId: string | null  // null = root folder
  dataRoomId: string
  createdAt: Date
  updatedAt: Date
}

File {
  id: string
  name: string
  folderId: string | null  // null = root level
  dataRoomId: string
  type: FileType
  size: number
  content: ArrayBuffer
  createdAt: Date
  updatedAt: Date
}
```

**Indexing Strategy**:
- Indexes on `parentId` and `dataRoomId` for folders enable fast queries of nested structures
- Indexes on `folderId` and `dataRoomId` for files enable efficient filtering
- This design supports O(log n) lookups instead of O(n) scans

### UI/UX Design Philosophy

**Decision**: Shadcn UI components with Tailwind CSS

**Rationale**:
- **Accessibility First**: Shadcn UI is built on Radix UI primitives, which provide excellent keyboard navigation and screen reader support out of the box
- **Design System Consistency**: All components follow the same design tokens, ensuring visual consistency
- **Customization**: Unlike pre-built component libraries, Shadcn UI components are copied into the project, allowing full customization
- **Modern Aesthetics**: Clean, minimal design that matches professional data room software expectations

**Navigation Patterns** (inspired by Google Drive and macOS Finder):

1. **Breadcrumb Navigation**: 
   - Shows the full path from root to current folder
   - Each breadcrumb is clickable for quick navigation
   - Visual hierarchy clearly indicates current location

2. **Folder Tree Sidebar**:
   - Provides a bird's-eye view of the entire folder structure
   - Enables quick navigation without using breadcrumbs
   - Collapsible sections for better space management

3. **Context Menus**:
   - Right-click or dropdown menu for quick actions
   - Reduces UI clutter while keeping common operations accessible
   - Follows platform conventions (similar to Windows/macOS)

4. **Drag & Drop**:
   - Intuitive file upload experience
   - Visual feedback during drag operations
   - Follows web standards for better accessibility

### Edge Cases & Error Handling

**Decision**: Proactive validation and graceful error handling

**Rationale**: A production-ready application must handle edge cases gracefully. Researching real-world file management systems revealed common pain points:

1. **Duplicate Names**:
   - **Solution**: Automatic renaming with numeric suffix (e.g., "document.pdf" → "document (1).pdf")
   - **Rationale**: Prevents user confusion and data loss, similar to how macOS and Windows handle duplicates

2. **Invalid Characters**:
   - **Solution**: Sanitization of file and folder names, removing or replacing invalid characters
   - **Rationale**: Prevents filesystem errors and ensures cross-platform compatibility

3. **Empty Names**:
   - **Solution**: Client-side validation prevents submission of empty names
   - **Rationale**: Provides immediate feedback without server round-trip

4. **Large Files**:
   - **Solution**: 10MB size limit with clear error messages
   - **Rationale**: Prevents browser memory issues while providing clear user feedback

5. **File Type Validation**:
   - **Solution**: MIME type checking and file extension validation
   - **Rationale**: Ensures only supported file types are uploaded, preventing runtime errors

6. **Cascading Deletion**:
   - **Solution**: Recursive deletion of all nested folders and files
   - **Rationale**: Prevents orphaned data and maintains data integrity

7. **Empty States**:
   - **Solution**: Helpful messaging and call-to-action buttons when folders/files are empty
   - **Rationale**: Guides users on next steps, improving discoverability

### Component Architecture

**Decision**: Granular, reusable components

**Rationale**:
- **Maintainability**: Small, focused components are easier to understand and modify
- **Reusability**: Components like `Dialog`, `Button`, `Toast` are used throughout the app
- **Testability**: Isolated components are easier to unit test
- **Performance**: Smaller components enable better code splitting and lazy loading opportunities

**Component Structure**:
- **UI Components** (`components/ui/`): Base components from Shadcn UI
- **Feature Components** (`components/`): Domain-specific components (FileList, FolderTree, etc.)
- **Dialog Components** (`components/dialogs/`): Modal dialogs for user interactions
- **Layout Components**: Reusable layout structures

### Type Safety Strategy

**Decision**: Strict TypeScript configuration with comprehensive type definitions

**Rationale**:
- **Catch Errors Early**: TypeScript catches many errors at compile time, reducing runtime bugs
- **Better IDE Support**: Autocomplete and IntelliSense improve developer experience
- **Self-Documenting Code**: Types serve as inline documentation
- **Refactoring Safety**: TypeScript makes large refactorings safer

**Implementation**:
- Strict mode enabled in `tsconfig.json`
- All Redux actions and state are fully typed
- Custom types for all domain entities (DataRoom, Folder, File)
- No `any` types used (enforced by ESLint)

## 🚀 Deployment

### Deploying to Vercel (Recommended)

Vercel is the recommended hosting platform for this project. Follow these steps:

#### Prerequisites
- A GitHub, GitLab, or Bitbucket account
- A Vercel account (free tier is sufficient)

#### Step-by-Step Instructions

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

2. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up using your GitHub/GitLab/Bitbucket account for easy integration

3. **Import your repository**:
   - Once logged in, click **"Add New Project"**
   - Import your Git repository containing the React application
   - Vercel will automatically detect that it's a Vite project

4. **Configure build settings** (usually auto-detected):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Deploy**:
   - Click **"Deploy"**
   - Vercel will build and deploy your application
   - You'll receive a unique URL (e.g., `your-app.vercel.app`)

6. **SPA Routing Configuration**:
   - The `vercel.json` file is already configured for Single Page Application routing
   - All routes will redirect to `index.html`, ensuring client-side routing works correctly

#### Post-Deployment

- Your app will be publicly accessible at the provided Vercel URL
- Any future pushes to your main branch will trigger automatic deployments
- You can view deployment logs and manage settings in the Vercel dashboard

### Alternative Deployment Options

If you prefer not to use Vercel, you can deploy to:

- **Render**: Similar process, supports static sites
- **Netlify**: Drag-and-drop deployment or Git integration
- **GitHub Pages**: Free hosting for static sites (requires additional configuration)

### Docker Setup (Alternative to Deployment)

If you prefer to provide Docker setup instead of a hosted URL:

1. **Build the Docker image**:
   ```bash
   docker build -t dataroom-app .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up
   ```

Note: Docker files are not included in this repository but can be added if needed.

## 🔧 Code Quality

### Development Standards

- **TypeScript**: Full type safety throughout the application with strict mode enabled
- **ESLint**: Configured with strict rules, no console.log allowed in production code
- **Prettier**: Consistent code formatting across the entire codebase
- **Code Style**: 
  - Consistent use of arrow functions
  - Self-documenting code (minimal comments)
  - Consistent semicolon usage
  - Meaningful variable and function names

### Running Linters

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Check code formatting
npm run format:check

# Auto-format code
npm run format
```

## Browser Support

- **Chrome/Edge (latest)**: Full support including folder uploads (empty and with content) via File System Access API
- **Firefox (latest)**: Full support including folder uploads via webkitdirectory (empty folders require at least one file)
- **Safari (latest)**: Full support including folder uploads via webkitdirectory (empty folders require at least one file)

Note: IndexedDB is required, so very old browsers may not be supported. File System Access API (for advanced folder upload features) is only available in Chrome/Edge.

## Future Enhancements

Potential improvements for future versions:

- Search functionality
- File preview thumbnails
- Dark mode toggle
- File sharing capabilities
- User authentication
- Backend integration for cloud storage
- File versioning
- Activity logs

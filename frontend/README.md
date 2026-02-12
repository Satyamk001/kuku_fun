# Kuku Fun - Frontend

A real-time chat application frontend built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Features

-   **Real-time Messaging**: Instant messaging powered by Socket.io.
-   **File Sharing**: Support for uploading and sharing Images, PDFs, Documents, and Text files.
-   **Drag & Drop**: Seamless file upload by dragging files directly into the chat interface.
-   **Rich UI**:
    -   Responsive design for mobile and desktop.
    -   Image Lightbox (Modal) for viewing images.
    -   File cards with type-specific icons (PDF, Word, Text).
    -   Typing indicators and online status.
-   **Authentication**: Integrated with Clerk for secure user authentication.
-   **Robust Error Handling**:
    -   Connection status indicators.
    -   Automatic reconnection logic.

## Version History

### [v1.0.1] - 2026-02-09
**Added:**
-   **File Uploads**: Support for PDF, DOC/DOCX, and TXT files.
-   **Drag & Drop**: Drag files directly into the chat window to upload.
-   **Attachment UI**: Compact attachment previews with delete functionality before sending.
-   **Image Modal**: Full-screen responsive modal for viewing image attachments.
-   **Connection Error Handling**: Dedicated UI for socket connection failures and manual retry.

### [v2.0.0] - 2026-02-12
**Major Release: Topic Rooms**
- **Topic Rooms**: Full-featured ephemeral chat rooms with category filtering and real-time updates.
- **UI Overhaul**: Fixed layout issues in chat interface, ensuring 100% height utilization without scrolling the main window.
- **Real-time Engine**: Upgraded socket handling to support multiple namespaces and robust reconnection logic.

## 🌟 New Feature: Topic Rooms (v2.0.0)
Create and join temporary, topic-based discussions! All messages and room data are ephemeral and automatically expire.

- **Create Rooms**: Specify a topic (e.g., Tech, Music), duration (15m - 4h), and max participants.
- **Join Active Rooms**: Browse a live list of active rooms with real-time participant counts.
- **Real-time Chat**: Isolated chat experience separate from direct messages, powered by a dedicated Socket.IO namespace.
- **Automatic Expiry**: Rooms and messages are deleted automatically after the set duration.
- **Smart Layout**: Chat interface optimized for all screen sizes, ensuring the input area is always accessible.

## 🎨 UI Enhancements (WhatsApp Style)
We've polished the interface to feel more native and responsive:

- Message Bubbles: Redesigned with proper tails, timestamps, and status ticks (server-side read receipts).
- Typing Indicators: New 3-dot bounce animation replaces static text.
- Attachment Preview: Click images to view them in a full-screen modal. Non-image files now show proper icons and filenames.
Floating Input Bar: Modern pill-shaped input area.

## 🛠 Technical Corrections
- Database: Added topic_rooms, room_participants, room_messages tables.
- Socket.IO: Implemented separate namespace handlers for scalable room management.
- Auth Middleware: Corrected API authentication flow for new modules.

## Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) components
-   **State/Data**: React Hooks, SWR (implied or direct API calls)
-   **Real-time**: Socket.io Client
-   **Uploads**: Cloudinary (via Backend)
-   **Icons**: Lucide React

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file with the following:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
    CLERK_SECRET_KEY=...
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
    
    # API & Socket Configuration
    NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/chat-app/api
    NEXT_PUBLIC_SOCKET_API=http://localhost:5000
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open**: [http://localhost:3000](http://localhost:3000)

## Project Structure

-   `src/app`: Next.js App Router pages.
-   `src/components/chat`: Chat-specific components (`DirectChatPanel`, `ChatList`, etc.).
-   `src/components/ui`: Reusable UI components (buttons, cards, inputs).
-   `src/lib`: Utilities and API clients.
-   `src/hooks`: Custom hooks (e.g., `useSocket`).

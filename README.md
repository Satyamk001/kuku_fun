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

### [v1.1.0] - Planned
-   *Upcoming features will be listed here.*

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
    NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
    NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
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

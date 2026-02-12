# Kuku Fun - User Manual

## Introduction
Welcome to **Kuku Fun**, a modern real-time communication platform using Next.js 14 and Socket.IO. This application combines structured forum-like **Threads**, instant **Direct Messaging**, and ephemeral **Topic Rooms** into a single cohesive experience.

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Navigation & Dashboard](#2-navigation--dashboard)
3. [Threads (Home)](#3-threads-home)
4. [Direct Chat](#4-direct-chat)
5. [Topic Rooms](#5-topic-rooms)
6. [Profile & Settings](#6-profile--settings)

---

## 1. Getting Started

### Sign Up & Login
Kuku Fun uses **Clerk** for secure authentication.

- **Sign Up / Login**:
  1. Navigate to the home page or click **"Sign In"**.
  2. You will be redirected to the Clerk authentication page.
  3. Continue with your **Google (Gmail)** account to access the application.

---

## 2. Navigation & Dashboard
The application features a responsive navigation bar at the top:

- **Logo (KuKu Fun)**: Redirects to the Home page (Threads).
- **Desktop Navigation**:
  - **Chat**: Direct messaging with other users.
  - **Rooms**: Ephemeral topic-based chat rooms.
  - **Profile**: Account settings.
- **User Actions**:
  - **Notifications (Bell Icon)**: Shows unread updates (thread replies, likes).
  - **User Profile**: Access account management or sign out.
- **Mobile Menu**: clicking the "Menu" (hamburger) icon opens the navigation links on smaller screens.

---

## 3. Threads (Home)
The landing page of Kuku Fun is the **Threads** feed. This is where structured, long-form discussions happen.

### Features
- **Browse Threads**: View a list of the latest discussions.
  - **Filter by Category**: Use the sidebar (desktop) or horizontal scroll (mobile) to filter threads by topics (e.g., Tech, Music).
  - **Search**: Use the search bar to find threads by keyword.
- **Create a Thread**:
  - Click the **"+" (Plus)** button or **"New Thread"** to start a discussion.
  - Add a **Title**, **Content**, and select a **Category**.
- **Interact**:
  - Click on a thread to view the full conversation.
  - **Reply** to threads to join the discussion.
  - **Like** posts to show appreciation.

---

## 4. Direct Chat
The **Chat** section (`/chat`) is for private, real-time one-on-one messaging.

### Features
- **Real-time Messaging**: Messages are delivered instantly via Socket.IO.
- **File Sharing**:
  - Click the **Paperclip** icon to browse files.
  - **Drag & Drop**: Drag files (Images, PDFs, Docs) directly into the chat window.
  - **Image Previews**: Click on sent images to view them in a full-screen modal.
- **Read Receipts**: WhatsApp-style ticks indicate message status (Sent, Delivered, Read).
- **Typing Indicators**: See when the other user is typing with a 3-dot animation.

---

## 5. Topic Rooms
**Topic Rooms** (`/rooms`) are temporary chat spaces for focused, real-time group discussions.

### How it Works
1. **Create a Room**:
   - Click **"Create Room"**.
   - **Title**: E.g., "Weekend Gaming".
   - **Category**: Classify your room.
   - **Duration**: Set how long the room lasts (15m, 30m, 1h, etc.). After this time, the room and all messages are **automatically deleted**.
   - **Max Users**: Limit the number of participants.
2. **Join a Room**:
   - Browse the **Active Rooms** list.
   - See the current participant count (e.g., `5/50`) before joining.
   - Click **"Join Room"** to enter.
3. **Chat**:
   - Participate in the group chat.
   - Observe real-time styles and updates.
   - **Leave** at any time; the room disappears for you, but remains active for others until expiry.

---

## 6. Profile & Settings
Manage your public persona in the **Profile** section (`/profile`).

### Customizable Fields
- **Display Name**: Your public name shown in chats and threads.
- **Handle**: A unique `@username` for mentions.
- **Bio**: A short description about yourself.
- **Avatar URL**: Link to a custom profile picture (defaults to your Clerk image if not set).

### How to Edit
1. Enter your new details in the form.
2. Click **"Save Changes"**.
3. Updates are reflected immediately across the app.

---

## 7. Notifications
Stay updated with the **Notification Center**:
- Located in the top navigation bar (Bell icon).
- Shows a **red badge** count for unread items.
- Receive alerts for:
  - **Replies** to your threads.
  - **Likes** on your posts.
- Real-time toast notifications appear at the bottom right when you are online.

# Instant Connect

Build a beautiful, modern, responsive web application called **“TempChat”** — a privacy-focused temporary communication platform inspired by WhatsApp, but without requiring phone numbers or email addresses.

## Core Concept

The main purpose of the application is to make it extremely easy for people to communicate and share files without exchanging phone numbers, email IDs, or complicated contact information.

Every user gets:

* A unique username
* A unique QR code linked to their profile/chat interface
* A shareable profile link

When another person scans the QR code, they should be taken directly to the communication interface with that user.

The application should support:

* Temporary one-to-one chats
* Temporary group chats
* Text messages
* Images
* Documents
* Videos
* Audio/files
* Drag-and-drop file sharing
* QR-based contact sharing
* Temporary messages that automatically disappear
* No phone number
* No email requirement

## Design Direction

Create a premium UI inspired by:

* WhatsApp
* Telegram
* Discord
* Signal
* Linear
* Modern SaaS dashboards

However, DO NOT simply copy WhatsApp's UI.

Use a unique visual identity with:

* Dark/light mode
* Glassmorphism used subtly
* Smooth gradients
* Rounded cards
* Clean typography
* Soft shadows
* Modern icons
* Micro animations
* Smooth page transitions
* Responsive design
* Mobile-first layouts

The interface should feel like a production-ready startup product.

## Main Pages

### 1. Landing Page

Create an impressive landing page.

Hero section:

Headline:

**“Connect instantly. Leave no trace.”**

Subheading:

**“A temporary communication platform built for simple, private conversations — no phone number, no email, just a username and a QR code.”**

Buttons:

* Start Chatting
* Create Your QR

Add an animated visual showing two users connecting by scanning a QR code.

Sections:

* How it works
* QR-based communication
* Temporary conversations
* File sharing
* Privacy-focused design
* No phone numbers
* No email
* FAQ
* Footer

### 2. Username Creation / Entry

Users should be able to enter or generate a unique username.

Example:

@chann
@alex_92
@rahul_dev

UI:

“Choose your username”

Username input with availability indicator.

Buttons:

* Generate Username
* Continue

Do not ask for:

* Phone number
* Email
* Password unless required by the backend architecture.

### 3. User Dashboard

After entering the platform, show:

Left sidebar:

* Profile
* Chats
* Contacts
* QR Code
* Settings

Main dashboard:

“Welcome, @username”

Cards:

* My QR Code
* Active Chats
* Contacts
* Messages disappearing soon

Show the user's QR code prominently.

Buttons:

* Share QR
* Download QR
* Copy Profile Link

### 4. QR Code Page

Create a dedicated QR page.

Display:

“Scan to Chat With Me”

Large QR code in the center.

Under it:

@username

“Anyone who scans this QR code can instantly open a temporary chat with you.”

Buttons:

* Share QR
* Download QR
* Copy Link

Add a visually attractive animated QR scanning effect.

### 5. QR Scanner

Create a QR scanner interface.

Title:

“Scan to Connect”

Camera scanning area with a modern scanning animation.

Also provide:

* Upload QR Image
* Paste Chat Link

After successful scanning:

Show:

“Connecting to @username…”

Then automatically open the chat interface.

### 6. Chat Interface

Build a polished real-time chat UI.

Desktop:

* Left sidebar with conversations
* Main chat window
* Optional right-side user information panel

Mobile:

* Full-screen chat
* Back button
* Chat header

Chat header:

* Username
* Online/offline indicator
* Temporary chat timer
* More options

Message bubbles:

* Sent messages
* Received messages
* Timestamps
* Delivery status
* File previews

Composer:

* Text input
* Emoji button
* Attachment button
* Camera button
* Microphone button
* Send button

Support:

* Text
* Images
* Videos
* Documents
* Audio
* Generic files

### 7. Temporary Message UI

Every chat should clearly show that messages are temporary.

At the top of the chat show:

“⏳ Messages disappear automatically”

Provide a timer control:

Disappear after:

* 5 minutes
* 15 minutes
* 1 hour
* 6 hours
* 24 hours
* Custom

Show countdown indicators where appropriate.

When a message expires, animate it disappearing.

Include a subtle privacy indicator without making the interface feel complicated.

### 8. File Sharing

Create a beautiful file-sharing experience.

Users can:

* Drag and drop files
* Click attachment
* Select files

Before sending, show preview:

File name
File type
File size
Upload progress

After sending:

* Image → image preview
* Video → video preview
* PDF → document card
* Other files → file card

Include download/open controls.

### 9. Contacts

Do NOT use traditional phone contacts.

Instead call them:

**Connections**

Users can add people through:

* QR scan
* Username
* Temporary chat link

Example:

Search:

“Search username…”

Result:

@alex
Online

[Start Chat]

### 10. Profile

Profile page:

QR Code

@username

Status:
“Available”

Buttons:

* Share Profile
* Copy Link
* Download QR

Show active temporary connections.

### 11. Settings

Settings should include:

Appearance:

* Light
* Dark
* System

Privacy:

* Message expiration
* Allow new chats
* QR visibility
* Block users

Notifications:

* Message notifications
* Sound
* Browser notifications

Storage:

* Temporary files
* Clear local cache

Account:

* Username
* Generate new username
* Delete session

### 12. Empty States

Create beautiful empty states.

Example:

“No conversations yet.”

“Scan someone's QR code or share yours to start communicating.”

Button:

“Scan QR”

## Important UX Flow

The primary flow must be extremely simple:

User A:

1. Opens website
2. Gets username
3. Gets QR code
4. Shows QR to User B

User B:

1. Opens website
2. Scans User A's QR
3. Chat interface opens automatically
4. User B can immediately send a message

User A receives the message in real time.

No phone number.
No email.
No contact saving requirement.

## QR URL Structure

Design the frontend so QR codes can represent a unique communication URL such as:

/connect/@username

or

/chat/session-id

The backend will later provide the actual routing and session logic.

## Real-Time UI

Prepare the frontend architecture for WebSocket-based real-time communication.

The UI should support states:

* Connecting
* Connected
* Sending
* Sent
* Delivered
* Failed
* Reconnecting
* Offline

Use realistic loading/skeleton states.

## Technologies

Use:

* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Lucide icons
* QR code generation library
* QR scanner library

Keep components modular and reusable.

Create components such as:

ChatSidebar
ChatWindow
MessageBubble
MessageComposer
FileUpload
FilePreview
QRCodeCard
QRScanner
UserProfile
ConnectionCard
TemporaryTimer
SettingsPanel
NotificationToast

## Responsive Design

The application must work beautifully on:

* Desktop
* Laptop
* Tablet
* Android
* iPhone

On mobile, use a native-app-like experience.

## Visual Details

Use smooth animations for:

* Opening chats
* Sending messages
* QR scanning
* File uploading
* New message arrival
* Message expiration
* Page transitions

Avoid excessive animations.

The final frontend should look like a **real startup product**, not a generic generated dashboard.

Make accessibility, keyboard navigation, responsive behavior, loading states, error states, and empty states first-class concerns.

Important:

Do not implement fake authentication or fake real-time messaging as the final architecture. Create clean API/service abstractions so the frontend can later connect to the backend through REST/WebSocket APIs.

Use mock data only where necessary for visual development, but structure the application so the mock layer can easily be replaced by the backend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ef46c479-4e3d-4e35-b104-229f4a6b4e59).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

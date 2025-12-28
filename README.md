# Chat App

A real-time messaging application built with React, TypeScript, Supabase, and ZEGO Cloud.

## Features

- ✅ User authentication (signup/login)
- ✅ One-on-one text messaging
- ✅ Real-time message delivery
- ✅ Reply to messages
- ✅ Typing indicators
- ✅ Message reactions (👍❤️😂😮😢)
- ✅ Message status (sent ✓, read ✓✓)
- ✅ Rich media support (images, files, audio, video)
- ✅ Conversation list with unread counts
- ✅ Edit/delete messages
- ✅ Dark mode
- ✅ Search users

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Router
- ZEGO ZIM SDK (real-time messaging)
- Supabase Client

### Backend
- Node.js
- Express
- TypeScript
- Supabase (database & auth)
- ZEGO Cloud (real-time messaging)

## Prerequisites

- Node.js 18+
- Supabase account
- ZEGO Cloud account

## Setup

### 1. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Run the SQL schema from `server/schema.sql` in the Supabase SQL editor
3. Get your Supabase URL and keys from Project Settings > API

### 2. ZEGO Cloud Setup

1. Create an account on [ZEGO Cloud](https://www.zegocloud.com/)
2. Create a new project
3. Get your App ID and Server Secret from the console

### 3. Environment Variables

#### Client (`client/.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_URL=wss://webliveroom-api.zego.im/ws
VITE_API_BASE_URL=http://localhost:8080
```

#### Server (`server/.env`)
```env
PORT=8080
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
ZEGO_APP_ID=your_zego_app_id
ZEGO_SERVER_SECRET=your_zego_server_secret
NODE_ENV=development
```

### 4. Installation

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 5. Running the Application

```bash
# Terminal 1 - Start the server
cd server
npm run dev

# Terminal 2 - Start the client
cd client
npm run dev
```

The client will be available at `http://localhost:5173`
The server will be available at `http://localhost:8080`

## Project Structure

```
telegram-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API & SDK services
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration
│   │   └── server.ts      # Entry point
│   ├── schema.sql         # Database schema
│   └── package.json
│
└── README.md
```

## How It Works

### Authentication
- Users sign up/login using Supabase Auth (client-side)
- JWT tokens are used for API authentication
- User profiles are stored in Supabase (accessed via backend API)

### Real-time Messaging
- ZEGO ZIM SDK handles real-time message delivery
- Messages are sent through ZEGO and stored in Supabase via backend API
- Typing indicators and reactions use ZEGO custom messages

### Architecture
- **Client**: Only uses Supabase for authentication
- **Server**: Handles all database operations via Supabase service key
- **ZEGO**: Real-time message delivery between clients
- **Flow**: Client → ZEGO (real-time) → Server API → Supabase (storage)

### Message Flow
1. User types a message
2. Message is sent via ZEGO ZIM SDK
3. Message is stored in Supabase database
4. Recipient receives message in real-time via ZEGO
5. Message status is updated (sent → delivered → read)

## Features Explained

### Reply to Messages
- Click "Reply" on any message
- The original message is quoted in your reply
- Replies are linked in the database

### Typing Indicators
- Shows when the other user is typing
- Automatically stops after 2 seconds of inactivity
- Uses ZEGO custom messages

### Message Reactions
- Click "React" on any message
- Choose from 5 emojis: 👍❤️😂😮😢
- Multiple users can react to the same message
- Reactions are stored in Supabase

### Message Status
- ✓ Sent: Message delivered to ZEGO
- ✓✓ Read: Recipient has viewed the message
- Status updates in real-time

## Development

### Building for Production

```bash
# Build client
cd client
npm run build

# Build server
cd server
npm run build
```

### Linting

```bash
# Lint client
cd client
npm run lint

# Lint server
cd server
npm run lint
```

## Troubleshooting

### ZEGO Connection Issues
- Verify your ZEGO App ID and Server Secret
- Check that the ZEGO server URL is correct
- Ensure your token generation is working

### Supabase Issues
- Verify your Supabase URL and keys
- Check that RLS policies are correctly set up
- Ensure the database schema is properly created

### Message Not Sending
- Check browser console for errors
- Verify ZEGO connection status
- Check server logs for API errors

## License

MIT

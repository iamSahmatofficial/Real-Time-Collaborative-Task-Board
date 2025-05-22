# Real-Time Collaborative Task Board

A Trello-like task board built with React, TypeScript, and Tailwind CSS. This application allows users to create, edit, and organize tasks with drag and drop functionality.

**Submitted by: Md Sahmat Ali**

## Features

- Create, update, and delete columns
- Create, update, and delete tasks within columns
- Drag and drop tasks between columns
- Reorder columns via drag and drop
- Optimistic UI updates
- Responsive design

## Demo Mode

The current implementation runs in demo mode with local state. Changes are not persisted between browser refreshes. In a full implementation, WebSockets (Socket.IO) would provide real-time synchronization between clients as described in the architecture section below.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Context API
- **Drag and Drop**: react-beautiful-dnd
- **Package Manager**: Bun

## Setup and Running

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Bun](https://bun.sh/) for faster package management

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/md-sahmat-ali/realtime-task-board.git
   cd realtime-task-board
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

4. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

5. To test drag and drop functionality, create new tasks and columns and try moving them around.

## Project Structure

```
src/
├── components/     # React components
│   ├── Board.tsx   # Main board component
│   ├── Column.tsx  # Column component
│   └── Task.tsx    # Task component
├── contexts/       # React contexts
│   └── BoardContext.tsx  # State management for the board
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
│   └── index.ts    # Shared types
├── App.tsx         # Main application component
├── index.css       # Global styles
└── main.tsx        # Application entry point
```

## Real-Time Architecture and Data Flow (Production Design)

### Architecture

In a production implementation, the application would follow a client-server architecture where:

1. A WebSocket server (Socket.IO) maintains the source of truth for the board state
2. Clients connect to the server and receive the initial state
3. When a client makes a change, it:
   - Updates its local state optimistically
   - Sends the change to the server
4. The server processes the change and broadcasts it to all connected clients
5. Other clients receive the update and apply it to their local state

### Data Flow

```
User Action (e.g., create task) →
  → Optimistic UI Update →
    → Socket.IO Event to Server →
      → Server Updates State →
        → Server Broadcasts Update →
          → All Clients Receive Update →
            → Clients Update UI
```

### State Management

- **Local State**: React Context API is used to manage the board state locally
- **Synchronization**: In a full implementation, Socket.IO events would keep the server and all clients in sync
- **Optimistic Updates**: Changes are applied locally first before server confirmation

## Tradeoffs and Limitations

### Current Demo Implementation

1. **Local State Only**: This demo uses only local state for simplicity. Changes are not persisted between refreshes.
2. **No Real-Time Sync**: The demo doesn't include actual WebSocket connections for real-time updates between clients.
3. **Single User Experience**: The current implementation simulates a single-user experience.

### Production Considerations

1. **Database Integration**: A production implementation would use a persistent database (MongoDB, PostgreSQL, etc.).
2. **Authentication**: User accounts with proper authentication would be needed.
3. **Error Handling**: Robust error handling and retry mechanisms would be implemented.
4. **Rate Limiting**: API rate limiting to prevent abuse.
5. **Conflict Resolution**: More sophisticated conflict resolution for simultaneous edits.

## Author

- Md Sahmat Ali

// Task interface
export interface Task {
  id: string;           // UUID
  title: string;        // Task title
  description?: string; // Optional description
  createdAt: string;    // ISO date string
  updatedAt: string;    // ISO date string
}

// Column interface
export interface Column {
  id: string;           // UUID
  title: string;        // Column title
  taskIds: string[];    // Ordered array of task IDs
}

// Interface for board state
export interface BoardState {
  tasks: Record<string, Task>;     // Map of tasks by id
  columns: Record<string, Column>; // Map of columns by id
  columnOrder: string[];           // Order of columns
}

// User presence interface
export interface UserPresence {
  id: string;               // User ID
  lastActive: string;       // ISO date string
  currentAction?: {         // What the user is currently doing
    type: 'editing' | 'moving';
    elementId: string;      // ID of task or column being acted upon
  };
}

// Socket event types
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  INITIAL_STATE = 'INITIAL_STATE',
  BOARD_UPDATE = 'BOARD_UPDATE',
  USER_PRESENCE_UPDATE = 'USER_PRESENCE_UPDATE',
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  CREATE_COLUMN = 'CREATE_COLUMN',
  UPDATE_COLUMN = 'UPDATE_COLUMN',
  DELETE_COLUMN = 'DELETE_COLUMN',
  MOVE_TASK = 'MOVE_TASK',
  MOVE_COLUMN = 'MOVE_COLUMN',
  USER_CONNECTED = 'USER_CONNECTED',
  USER_DISCONNECTED = 'USER_DISCONNECTED',
  ERROR = 'ERROR',
}

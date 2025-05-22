import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, Column, SocketEvent, Task, UserPresence } from '../types';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow any origin for development. In production, restrict this to your domain.
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.use(cors({
  origin: '*', // Allow any origin for development
  credentials: true
}));

// Initial data setup
let boardState: BoardState = {
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Create project structure',
      description: 'Set up initial folder structure and dependencies',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'task-2': {
      id: 'task-2',
      title: 'Implement drag and drop',
      description: 'Use react-beautiful-dnd for task dragging',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'task-3': {
      id: 'task-3',
      title: 'Set up Socket.IO',
      description: 'Implement real-time synchronization',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-3'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: [],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

// Track connected users
const connectedUsers: Record<string, UserPresence> = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create user entry
  const userId = socket.id;
  connectedUsers[userId] = {
    id: userId,
    lastActive: new Date().toISOString(),
  };

  // Send initial state to the newly connected client
  socket.emit(SocketEvent.INITIAL_STATE, boardState);

  // Notify all clients about the new user
  io.emit(SocketEvent.USER_CONNECTED, {
    userId,
    connectedUsers,
    count: Object.keys(connectedUsers).length,
  });

  // Handle task creation
  socket.on(SocketEvent.CREATE_TASK, (data: { columnId: string; task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }) => {
    const { columnId, task } = data;
    const column = boardState.columns[columnId];

    if (!column) {
      socket.emit(SocketEvent.ERROR, { message: 'Column not found' });
      return;
    }

    const newTask: Task = {
      id: uuidv4(),
      title: task.title,
      description: task.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update board state
    boardState.tasks[newTask.id] = newTask;
    boardState.columns[columnId].taskIds.push(newTask.id);

    // Broadcast update to all clients
    io.emit(SocketEvent.BOARD_UPDATE, boardState);
  });

  // Handle task update
  socket.on(SocketEvent.UPDATE_TASK, (task: Task) => {
    if (!boardState.tasks[task.id]) {
      socket.emit(SocketEvent.ERROR, { message: 'Task not found' });
      return;
    }

    // Update the task with new values but keep original creation date
    boardState.tasks[task.id] = {
      ...task,
      updatedAt: new Date().toISOString(),
    };

    // Broadcast update
    io.emit(SocketEvent.BOARD_UPDATE, boardState);
  });

  // Handle task deletion
  socket.on(SocketEvent.DELETE_TASK, (data: { taskId: string; columnId: string }) => {
    const { taskId, columnId } = data;

    if (!boardState.tasks[taskId] || !boardState.columns[columnId]) {
      socket.emit(SocketEvent.ERROR, { message: 'Task or column not found' });
      return;
    }

    // Remove task from column and delete from tasks
    boardState.columns[columnId].taskIds = boardState.columns[columnId].taskIds.filter(id => id !== taskId);
    delete boardState.tasks[taskId];

    // Broadcast update
    io.emit(SocketEvent.BOARD_UPDATE, boardState);
  });

  // Handle column creation
  socket.on(SocketEvent.CREATE_COLUMN, (columnTitle: string) => {
    const newColumn: Column = {
      id: uuidv4(),
      title: columnTitle,
      taskIds: [],
    };

    // Update board state
    boardState.columns[newColumn.id] = newColumn;
    boardState.columnOrder.push(newColumn.id);

    // Broadcast update
    io.emit(SocketEvent.BOARD_UPDATE, boardState);
  });

  // Handle column update
  socket.on(SocketEvent.UPDATE_COLUMN, (column: Column) => {
    if (!boardState.columns[column.id]) {
      socket.emit(SocketEvent.ERROR, { message: 'Column not found' });
      return;
    }

    // Update column
    boardState.columns[column.id] = column;

    // Broadcast update
    io.emit(SocketEvent.BOARD_UPDATE, boardState);
  });

  // Handle column deletion
  socket.on(SocketEvent.DELETE_COLUMN, (columnId: string) => {
    if (!boardState.columns[columnId]) {
      socket.emit(SocketEvent.ERROR, { message: 'Column not found' });
      return;
    }

    // Get tasks in column
    const tasksToDelete = boardState.columns[columnId].taskIds;

    // Remove tasks
    tasksToDelete.forEach(taskId => {
      delete boardState.tasks[taskId];
    });

    // Remove column
    delete boardState.columns[columnId];
    boardState.columnOrder = boardState.columnOrder.filter(id => id !== columnId);

    // Broadcast update
    io.emit(SocketEvent.BOARD_UPDATE, boardState);
  });

  // Handle task movement
  socket.on(SocketEvent.MOVE_TASK, (data: {
    taskId: string;
    sourceColumnId: string;
    destinationColumnId: string;
    sourceIndex: number;
    destinationIndex: number;
  }) => {
    const { taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = data;

    // Validate data
    if (
      !boardState.columns[sourceColumnId] ||
      !boardState.columns[destinationColumnId] ||
      !boardState.tasks[taskId]
    ) {
      socket.emit(SocketEvent.ERROR, { message: 'Invalid movement data' });
      return;
    }

    // Remove from source
    const sourceTaskIds = Array.from(boardState.columns[sourceColumnId].taskIds);
    sourceTaskIds.splice(sourceIndex, 1);

    // Add to destination
    const destinationTaskIds =
      sourceColumnId === destinationColumnId
        ? sourceTaskIds
        : Array.from(boardState.columns[destinationColumnId].taskIds);

    destinationTaskIds.splice(destinationIndex, 0, taskId);

    // Update board state
    boardState.columns[sourceColumnId].taskIds = sourceTaskIds;
    boardState.columns[destinationColumnId].taskIds = destinationTaskIds;

    // Update user action
    connectedUsers[userId] = {
      ...connectedUsers[userId],
      lastActive: new Date().toISOString(),
      currentAction: {
        type: 'moving',
        elementId: taskId,
      },
    };

    // Broadcast updates
    io.emit(SocketEvent.BOARD_UPDATE, boardState);
    io.emit(SocketEvent.USER_PRESENCE_UPDATE, connectedUsers);
  });

  // Handle column reordering
  socket.on(SocketEvent.MOVE_COLUMN, (data: { sourceIndex: number; destinationIndex: number }) => {
    const { sourceIndex, destinationIndex } = data;

    // Reorder columns
    const newColumnOrder = Array.from(boardState.columnOrder);
    const [removed] = newColumnOrder.splice(sourceIndex, 1);
    newColumnOrder.splice(destinationIndex, 0, removed);

    // Update board state
    boardState.columnOrder = newColumnOrder;

    // Broadcast update
    io.emit(SocketEvent.BOARD_UPDATE, boardState);
  });

  // Handle user presence updates
  socket.on(SocketEvent.USER_PRESENCE_UPDATE, (data: { action?: { type: 'editing' | 'moving'; elementId: string } }) => {
    if (!connectedUsers[userId]) return;

    connectedUsers[userId] = {
      ...connectedUsers[userId],
      lastActive: new Date().toISOString(),
      currentAction: data.action,
    };

    // Broadcast update
    io.emit(SocketEvent.USER_PRESENCE_UPDATE, connectedUsers);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove user
    delete connectedUsers[userId];

    // Broadcast update
    io.emit(SocketEvent.USER_DISCONNECTED, {
      userId,
      connectedUsers,
      count: Object.keys(connectedUsers).length,
    });
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;

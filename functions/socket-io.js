const express = require('express');
const serverless = require('serverless-http');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Initial data setup
const boardState = {
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
const connectedUsers = {};

// API endpoint to get initial state
app.get('/api/initial-state', (req, res) => {
  res.json(boardState);
});

// API endpoint to get users
app.get('/api/users', (req, res) => {
  res.json({
    users: connectedUsers,
    count: Object.keys(connectedUsers).length
  });
});

// Export the serverless function handler
exports.handler = serverless(app);

import React, { createContext, useEffect, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, Column, Task, UserPresence } from '../types';

// Define the context type
interface BoardContextType {
  // Board state
  boardState: BoardState;
  connectedUsers: Record<string, UserPresence>;
  userCount: number;
  currentUserId: string | null;
  isConnected: boolean;

  // Actions
  createTask: (columnId: string, task: { title: string; description?: string }) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  createColumn: (title: string) => void;
  updateColumn: (column: Column) => void;
  deleteColumn: (columnId: string) => void;
  moveTask: (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
  moveColumn: (sourceIndex: number, destinationIndex: number) => void;
  updateUserPresence: (action?: { type: 'editing' | 'moving'; elementId: string }) => void;
}

// Create the context
export const BoardContext = createContext<BoardContextType | undefined>(undefined);

// Provider component
export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boardState, setBoardState] = useState<BoardState>({
    tasks: {},
    columns: {},
    columnOrder: [],
  });
  const [connectedUsers, setConnectedUsers] = useState<Record<string, UserPresence>>({});
  const [userCount, setUserCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(uuidv4());
  const [isConnected, setIsConnected] = useState(true);

  // Define updateUserPresence before using it in other functions
  const updateUserPresence = useCallback((action?: { type: 'editing' | 'moving'; elementId: string }) => {
    // In a full implementation, this would send the presence to the server
    if (currentUserId) {
      setConnectedUsers(prev => ({
        ...prev,
        [currentUserId]: {
          id: currentUserId,
          lastActive: new Date().toISOString(),
          currentAction: action,
        }
      }));
    }
  }, [currentUserId]);

  // Initialize board state
  useEffect(() => {
    // For the demo, we'll use hardcoded initial state
    const initialState: BoardState = {
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

    setBoardState(initialState);

    // Simulate user presence
    if (currentUserId) {
      setConnectedUsers({
        [currentUserId]: {
          id: currentUserId,
          lastActive: new Date().toISOString(),
        }
      });
      setUserCount(1);
    }
  }, [currentUserId]);

  // For a real implementation, polling or WebSockets would keep this in sync
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Simulate a poll for updates
      console.log('Polling for updates...');
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Action: Create Task
  const createTask = useCallback((columnId: string, task: { title: string; description?: string }) => {
    // Optimistic update
    const newTaskId = uuidv4();
    const newTask: Task = {
      id: newTaskId,
      title: task.title,
      description: task.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBoardState(prev => {
      const updatedColumn = {
        ...prev.columns[columnId],
        taskIds: [...prev.columns[columnId].taskIds, newTaskId],
      };

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [newTaskId]: newTask,
        },
        columns: {
          ...prev.columns,
          [columnId]: updatedColumn,
        },
      };
    });
  }, []);

  // Action: Update Task
  const updateTask = useCallback((task: Task) => {
    // Optimistic update
    setBoardState(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [task.id]: {
          ...task,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  }, []);

  // Action: Delete Task
  const deleteTask = useCallback((taskId: string, columnId: string) => {
    // Optimistic update
    setBoardState(prev => {
      const updatedTasks = { ...prev.tasks };
      delete updatedTasks[taskId];

      const updatedColumn = {
        ...prev.columns[columnId],
        taskIds: prev.columns[columnId].taskIds.filter(id => id !== taskId),
      };

      return {
        ...prev,
        tasks: updatedTasks,
        columns: {
          ...prev.columns,
          [columnId]: updatedColumn,
        },
      };
    });
  }, []);

  // Action: Create Column
  const createColumn = useCallback((title: string) => {
    // Optimistic update
    const newColumnId = uuidv4();
    const newColumn: Column = {
      id: newColumnId,
      title,
      taskIds: [],
    };

    setBoardState(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...prev.columnOrder, newColumnId],
    }));
  }, []);

  // Action: Update Column
  const updateColumn = useCallback((column: Column) => {
    // Optimistic update
    setBoardState(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [column.id]: column,
      },
    }));
  }, []);

  // Action: Delete Column
  const deleteColumn = useCallback((columnId: string) => {
    // Optimistic update
    setBoardState(prev => {
      const updatedColumns = { ...prev.columns };
      delete updatedColumns[columnId];

      const updatedTasks = { ...prev.tasks };
      const tasksToDelete = prev.columns[columnId]?.taskIds || [];

      tasksToDelete.forEach(taskId => {
        delete updatedTasks[taskId];
      });

      return {
        ...prev,
        tasks: updatedTasks,
        columns: updatedColumns,
        columnOrder: prev.columnOrder.filter(id => id !== columnId),
      };
    });
  }, []);

  // Action: Move Task
  const moveTask = useCallback(
    (
      taskId: string,
      sourceColumnId: string,
      destinationColumnId: string,
      sourceIndex: number,
      destinationIndex: number
    ) => {
      // Optimistic update
      setBoardState(prev => {
        const sourceColumn = prev.columns[sourceColumnId];
        const destinationColumn = prev.columns[destinationColumnId];

        if (!sourceColumn || !destinationColumn) return prev;

        const sourceTaskIds = Array.from(sourceColumn.taskIds);
        sourceTaskIds.splice(sourceIndex, 1);

        const destinationTaskIds =
          sourceColumnId === destinationColumnId
            ? sourceTaskIds
            : Array.from(destinationColumn.taskIds);

        destinationTaskIds.splice(destinationIndex, 0, taskId);

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColumnId]: {
              ...sourceColumn,
              taskIds: sourceTaskIds,
            },
            [destinationColumnId]: {
              ...destinationColumn,
              taskIds: destinationTaskIds,
            },
          },
        };
      });

      // Update user presence
      updateUserPresence({ type: 'moving', elementId: taskId });
    },
    [updateUserPresence]
  );

  // Action: Move Column
  const moveColumn = useCallback((sourceIndex: number, destinationIndex: number) => {
    // Optimistic update
    setBoardState(prev => {
      const newColumnOrder = Array.from(prev.columnOrder);
      const [removed] = newColumnOrder.splice(sourceIndex, 1);
      newColumnOrder.splice(destinationIndex, 0, removed);

      return {
        ...prev,
        columnOrder: newColumnOrder,
      };
    });
  }, []);

  // Context value
  const value: BoardContextType = {
    boardState,
    connectedUsers,
    userCount,
    currentUserId,
    isConnected,
    createTask,
    updateTask,
    deleteTask,
    createColumn,
    updateColumn,
    deleteColumn,
    moveTask,
    moveColumn,
    updateUserPresence,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

// Custom hook to use the board context
export const useBoard = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

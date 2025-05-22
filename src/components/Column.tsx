import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Column as ColumnType, Task as TaskType } from '../types';
import Task from './Task';
import { useBoard } from '../contexts/BoardContext';

interface ColumnProps {
  column: ColumnType;
  tasks: TaskType[];
  index: number;
}

const Column: React.FC<ColumnProps> = ({ column, tasks, index }) => {
  const { createTask, updateColumn, deleteColumn, updateUserPresence, connectedUsers } = useBoard();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Check if anyone is currently editing this column
  const activeUsers = Object.values(connectedUsers).filter(
    user => user.currentAction?.elementId === column.id
  );

  const handleEditTitle = () => {
    setIsEditingTitle(true);
    updateUserPresence({ type: 'editing', elementId: column.id });
  };

  const handleSaveTitle = () => {
    updateColumn({
      ...column,
      title,
    });
    setIsEditingTitle(false);
    updateUserPresence();
  };

  const handleCancelEditTitle = () => {
    setTitle(column.title);
    setIsEditingTitle(false);
    updateUserPresence();
  };

  const handleAddTask = () => {
    setIsAddingTask(true);
  };

  const handleSaveTask = () => {
    if (newTaskTitle.trim()) {
      createTask(column.id, {
        title: newTaskTitle,
        description: newTaskDescription || undefined,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
    }
  };

  const handleCancelAddTask = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddingTask(false);
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Are you sure you want to delete the column "${column.title}"?`)) {
      deleteColumn(column.id);
    }
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex h-full w-72 flex-col rounded-md bg-gray-100 p-2 shadow-sm"
        >
          <div
            {...provided.dragHandleProps}
            className="mb-2 flex items-center justify-between rounded-md bg-white p-2 shadow-sm"
          >
            {isEditingTitle ? (
              <div className="flex w-full items-center space-x-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded border border-gray-300 p-1 text-sm"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEditTitle}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-medium">
                  {column.title} ({tasks.length})
                  {activeUsers.length > 0 && (
                    <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  )}
                </h2>
                <div className="flex space-x-1">
                  <button
                    onClick={handleEditTitle}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={handleDeleteColumn}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>

          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-grow overflow-y-auto rounded-md p-1 ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
              >
                {tasks.map((task, index) => (
                  <Task key={task.id} task={task} index={index} columnId={column.id} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {isAddingTask ? (
            <div className="mt-2 space-y-2 rounded-md bg-white p-2 shadow-sm">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full rounded border border-gray-300 p-1 text-sm"
                placeholder="Task title..."
                autoFocus
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full rounded border border-gray-300 p-1 text-sm"
                placeholder="Task description (optional)..."
                rows={2}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelAddTask}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTask}
                  className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                  disabled={!newTaskTitle.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddTask}
              className="mt-2 rounded-md bg-white p-2 text-center text-sm text-gray-600 shadow-sm hover:bg-gray-50"
            >
              + Add a task
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Column;

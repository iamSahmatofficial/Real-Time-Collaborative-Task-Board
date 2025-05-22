import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task as TaskType } from '../types';
import { useBoard } from '../contexts/BoardContext';

interface TaskProps {
  task: TaskType;
  index: number;
  columnId: string;
}

const Task: React.FC<TaskProps> = ({ task, index, columnId }) => {
  const { updateTask, deleteTask, updateUserPresence, connectedUsers } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  // Check if anyone is currently editing or moving this task
  const activeUsers = Object.values(connectedUsers).filter(
    user => user.currentAction?.elementId === task.id
  );

  const handleEdit = () => {
    setIsEditing(true);
    updateUserPresence({ type: 'editing', elementId: task.id });
  };

  const handleSave = () => {
    updateTask({
      ...task,
      title,
      description: description || undefined,
    });
    setIsEditing(false);
    updateUserPresence();
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditing(false);
    updateUserPresence();
  };

  const handleDelete = () => {
    deleteTask(task.id, columnId);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all ${
            snapshot.isDragging ? 'rotate-1 scale-105 shadow-md' : ''
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border border-gray-300 p-1 text-sm"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border border-gray-300 p-1 text-sm"
                placeholder="Add a description..."
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancel}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-1 flex items-start justify-between">
                <h3 className="text-sm font-medium">{task.title}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={handleEdit}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {task.description && (
                <p className="text-xs text-gray-600">{task.description}</p>
              )}
              {activeUsers.length > 0 && (
                <div className="mt-2 flex items-center space-x-1">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-500">
                    {activeUsers.length} user{activeUsers.length > 1 ? 's' : ''} active
                  </span>
                </div>
              )}
              <div className="mt-2 text-right text-xs text-gray-400">
                Last updated: {new Date(task.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Task;

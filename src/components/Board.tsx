import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useBoard } from '../contexts/BoardContext';
import Column from './Column';

const Board: React.FC = () => {
  const { boardState, moveTask, moveColumn, createColumn, userCount, isConnected } = useBoard();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // If there's no destination, do nothing
    if (!destination) return;

    // If dropped in the same place, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle column reordering
    if (type === 'column') {
      moveColumn(source.index, destination.index);
      return;
    }

    // Handle task movement
    moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  const handleAddColumn = () => {
    setIsAddingColumn(true);
  };

  const handleSaveColumn = () => {
    if (newColumnTitle.trim()) {
      createColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleCancelAddColumn = () => {
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Real-Time Collaborative Task Board</h1>
          <p className="text-sm text-gray-600">by Md Sahmat Ali</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Local Demo Mode' : 'Disconnected'}
            </span>
          </div>
          <div className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
            {userCount} user{userCount !== 1 ? 's' : ''} online
          </div>
        </div>
      </div>

      <div className="mb-2 rounded-md bg-yellow-50 p-3 border border-yellow-200">
        <p className="text-yellow-800 text-sm">
          <strong>Demo Mode:</strong> This is a local demo with optimistic UI updates. Changes are not persisted between browser refreshes. In a full implementation, WebSockets would provide real-time synchronization between clients.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-full space-x-4 overflow-x-auto pb-4"
            >
              {boardState.columnOrder.map((columnId, index) => {
                const column = boardState.columns[columnId];
                const tasks = column.taskIds.map(taskId => boardState.tasks[taskId]);

                return (
                  <Column key={column.id} column={column} tasks={tasks} index={index} />
                );
              })}
              {provided.placeholder}

              {isAddingColumn ? (
                <div className="flex h-min w-72 flex-col rounded-md bg-gray-100 p-2 shadow-sm">
                  <div className="mb-2 rounded-md bg-white p-2 shadow-sm">
                    <input
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                      placeholder="Column title..."
                      autoFocus
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={handleCancelAddColumn}
                        className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveColumn}
                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                        disabled={!newColumnTitle.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddColumn}
                  className="h-min w-72 rounded-md border-2 border-dashed border-gray-300 bg-white p-4 text-center text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  + Add a column
                </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Board;

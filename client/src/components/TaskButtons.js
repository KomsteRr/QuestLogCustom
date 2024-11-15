import React from 'react';

const TaskButtons = ({ showCompleted, setShowCompleted, setShowTodo }) => {
  return (
    <div className="flex gap-4 flex-wrap">
      <button
        onClick={() => document.getElementById('newtask-form').style.display='block'}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                 text-gray-800 dark:text-gray-200 shadow-[4px_4px_#2563EB] hover:shadow-none hover:translate-x-1 
                 hover:translate-y-1 transition-all duration-200 rounded-none"
      >
        New Task
      </button>
      <button
        onClick={setShowCompleted}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                 text-gray-800 dark:text-gray-200 shadow-[4px_4px_#2563EB] hover:shadow-none hover:translate-x-1 
                 hover:translate-y-1 transition-all duration-200 rounded-none"
      >
        Show completed
      </button>
      <button
        onClick={setShowTodo}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 font-bold text-lg border-3 border-gray-800 dark:border-gray-200 
                 text-gray-800 dark:text-gray-200 shadow-[4px_4px_#2563EB] hover:shadow-none hover:translate-x-1 
                 hover:translate-y-1 transition-all duration-200 rounded-none"
      >
        Show to-do
      </button>
    </div>
  );
};
export default TaskButtons;
import React, { useState, useEffect } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import TaskButtons from './components/TaskButtons';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import LevelUpModal from './components/LevelUpModal';
import StreakTracker from './components/StreakTracker';
import Leaderboard from './components/Leaderboard';
import useXPManager from './components/XPManager';

const API_BASE_URL = 'https://smart-list-hjea.vercel.app/api';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('todo');

  const {
    level,
    experience,
    showLevelUp,
    newLevel,
    calculateXP,
    resetXP,
    setShowLevelUp,
    getTotalXP
  } = useXPManager();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        let sessionId = localStorage.getItem('sessionId');
        
        if (!sessionId) {
          sessionId = uuidv4();
          localStorage.setItem('sessionId', sessionId);
        }

        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            sessionId,
            xp: getTotalXP(),
            level: level
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to initialize user: ${response.status}`);
        }

        const data = await response.json();
        setUserId(data.userId);

        // ... rest of the initialization logic
      } catch (error) {
        console.error('Error during initialization:', error);
        setError(error.message);
      }
    };


  initializeUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const updateUserData = async () => {
      if (!userId) {
        console.log('No userId available, skipping update');
        return;
      }

      try {
        const totalXP = getTotalXP();
        const url = `${API_BASE_URL}/users/${userId}`;
        
        console.log('Updating user data:', { url, userId, xp: totalXP, level, tasksCompleted: completedTasks.length });
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            xp: totalXP,
            level: level,
            tasksCompleted: completedTasks.length,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update user data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('User data updated successfully:', data);
      } catch (error) {
        console.error('Error updating user data:', error);
        setError(`Failed to update user data: ${error.message}`);
      }
    };

    updateUserData();
  }, [userId, experience, level, completedTasks, getTotalXP]);


  useEffect(() => {
    const loadTasks = () => {
      const storedTasks = localStorage.getItem('tasks');
      const storedCompletedTasks = localStorage.getItem('completedtasks');
      
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
      
      if (storedCompletedTasks) {
        setCompletedTasks(JSON.parse(storedCompletedTasks));
      }
    };

    loadTasks();
  }, []);

  const addTask = (taskData) => {
    try {
      const newTask = {
        ...taskData,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      console.log('Task added successfully:', newTask);
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message);
    }
  };

  const completeTask = (task) => {
    try {
      const updatedTasks = tasks.filter(t => t.id !== task.id);
      const completedTask = {
        ...task,
        completedAt: new Date().toISOString()
      };
      const updatedCompletedTasks = [...completedTasks, completedTask];

      calculateXP(task.experience);

      setTasks(updatedTasks);
      setCompletedTasks(updatedCompletedTasks);

      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));

    } catch (error) {
      console.error('Error completing task:', error);
      setError(error.message);
    }
  };

  const removeTask = (taskId, isCompleted) => {
    try {
      if (isCompleted) {
        const updatedCompletedTasks = completedTasks.filter(t => t.id !== taskId);
        setCompletedTasks(updatedCompletedTasks);
        localStorage.setItem('completedtasks', JSON.stringify(updatedCompletedTasks));
      } else {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      }
      console.log('Task removed successfully:', { taskId, isCompleted });
    } catch (error) {
      console.error('Error removing task:', error);
      setError(error.message);
    }
  };


  const clearAllData = async () => {
    try {      
      localStorage.removeItem('tasks');
      localStorage.removeItem('completedtasks');
      localStorage.removeItem('experience');
      localStorage.removeItem('level');
      
      setTasks([]);
      setCompletedTasks([]);
      const { level: resetLevel, experience: resetExp } = resetXP();
  
      if (userId) {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            xp: resetExp,
            level: resetLevel, 
            tasksCompleted: 0,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to reset user data: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setError(error.message);
    }
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
    setCurrentView(showLeaderboard ? 'todo' : 'leaderboard');
  };

  const handleShowCompleted = () => {
    setShowCompleted(true);
    setShowLeaderboard(false);
    setCurrentView('completed');
  };
  const handleShowTodo = () => {
    setShowCompleted(false);
    setShowLeaderboard(false);
    setCurrentView('todo');
  };

  return (
    <div>
      <Header />
      {error && (
        <div className="error-message" style={{ color: 'red', padding: '10px', margin: '10px' }}>
          Error: {error}
        </div>
      )}
      <ProgressBar level={level} experience={experience} />
      <StreakTracker tasks={tasks} completedTasks={completedTasks} />
      <TaskButtons 
        showCompleted={showCompleted} 
        setShowCompleted={handleShowCompleted}
        setShowTodo={handleShowTodo}
      />
      <TaskForm addTask={addTask} />
      <div className="bottom-buttons">
        <button onClick={toggleLeaderboard} className="leaderboard-toggle">
          {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
        </button>
        <button id="clear-button" onClick={clearAllData}>Clear all data</button>
      </div>
      
      {/* Main content section */}
      <div className="main-content">
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={currentView}
            classNames="fade"
            timeout={300}
            unmountOnExit
          >
            <div className="view-container">
              {currentView === 'leaderboard' && <Leaderboard />}
              {currentView === 'todo' && (
                <TaskList 
                  tasks={tasks} 
                  removeTask={removeTask}
                  completeTask={completeTask}
                  isCompleted={false}
                />
              )}
              {currentView === 'completed' && (
                <TaskList 
                  tasks={completedTasks} 
                  removeTask={removeTask}
                  completeTask={completeTask}
                  isCompleted={true}
                />
              )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>

      {/* Level up modal */}
      <LevelUpModal 
        show={showLevelUp} 
        onClose={() => setShowLevelUp(false)} 
        level={newLevel}
      />
    </div>
  );
};

export default App;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'


function TaskManager({ user, logout }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user?.token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      setTasks(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load tasks');
      if (error.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/tasks', 
        { todo: newTask },
        { 
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setTasks([...tasks, res.data]);
      setNewTask('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (id, updatedFields) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/tasks/${id}`, 
        updatedFields,
        { 
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setTasks(tasks.map(task => task.id === id ? res.data : task));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete task');
    }
  };

  if (!user?.token) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Authentication Required</h2>
          <p>Please login to access your tasks.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="user-info">
          <h2>Task Manager</h2>
          <p>Welcome back, {user.firstName}!</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={fetchTasks}
            disabled={loading}
            className="btn-secondary"
          >
            Refresh
          </button>
          <button 
            onClick={logout}
            className="btn-logout"
          >
            Sign Out
          </button>
        </div>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="task-section">
        <h3>Add New Task</h3>
        <form onSubmit={handleCreateTask} className="task-form">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            required
            disabled={loading}
            className="task-input"
          />
          <button 
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            Add Task
          </button>
        </form>
      </div>
      
      <div className="task-section">
        <h3>Your Tasks ({tasks.length})</h3>
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create your first task above!</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <h4>{task.todo}</h4>
                  <span className="task-status">
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="task-actions">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => handleUpdateTask(task.id, { 
                        todo: task.todo, 
                        completed: e.target.checked 
                      })}
                      disabled={loading}
                    />
                    Complete
                  </label>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={loading}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskManager;
const axios = require('axios');

const API = 'https://dummyjson.com';

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasksResponse = await axios.get(`${API}/todos/user/${userId}`, {
      timeout: 10000
    });
    
    const tasks = tasksResponse.data.todos || [];
    res.status(200).json(tasks);

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch tasks', 
      error: error.response?.data?.message || 'Server error'
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { todo } = req.body;
    const userId = req.user.id;

    if (!todo?.trim()) {
      return res.status(400).json({ message: 'Task content is required' });
    }

    const newTask = await axios.post(
      `${API}/todos/add`,
      {
        todo: todo.trim(),
        completed: false,
        userId: parseInt(userId),
      },
      { timeout: 10000 }
    );

    res.status(201).json(newTask.data);

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create task', 
      error: error.response?.data?.message || 'Server error'
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { todo, completed } = req.body;

    const updatedTask = await axios.put(
      `${API}/todos/${id}`,
      { todo, completed },
      { timeout: 10000 }
    );

    res.status(200).json(updatedTask.data);

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update task', 
      error: error.response?.data?.message || 'Server error'
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await axios.delete(`${API}/todos/${id}`, {
      timeout: 10000
    });
    
    res.status(200).json({ 
      message: 'Task deleted successfully', 
      task: deletedTask.data 
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete task', 
      error: error.response?.data?.message || 'Server error'
    });
  }
};
import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const user = await authService.register({ email, password, name, role });
    
    // Inconsistent Response style: Preserved exactly
    return res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    // Improper Error Leakage: Preserved exactly
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during registration', databaseError: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });

    // Inconsistent Response style: Preserved exactly
    return res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // If it's a credentials error, return 401/400
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (error.message === 'Email and password are required') {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Leaks query stack trace: Preserved exactly
    return res.status(500).json({ error: 'Internal Server Error', errorStack: error.stack });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return res.json(user);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(500).json({ error: error.message });
  }
};

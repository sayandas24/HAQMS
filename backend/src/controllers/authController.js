import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const user = await authService.register({ email, password, name, role });
    
    // FIXED: Sanitize user payload by removing the password hash before sending to client
    const { password: _, ...sanitizedUser } = user;
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizedUser,
    });
  } catch (error) {
    console.error('[ERROR] Registration failure:', error);
    // FIXED: Sanitize error output to prevent database details leakage
    if (error.message === 'All fields are required') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'User already exists with this email') {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });

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
    console.error('[ERROR] Login failure:', error);
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (error.message === 'Email and password are required') {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // FIXED: Sanitize error response stack trace leaks
    return res.status(500).json({ error: 'Internal Server Error' });
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

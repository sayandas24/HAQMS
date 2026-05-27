import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-secret-key-12345!!!';

export const register = async ({ email, password, name, role }) => {
  // FIXED: Do not log sensitive user data like raw cleartext passwords
  console.log('[DEBUG] Registering user:', email);

  if (!email || !password || !name) {
    throw new Error('All fields are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'RECEPTIONIST',
    },
  });

  return user;
};

export const login = async ({ email, password }) => {
  // FIXED: Do not log plain-text passwords in auth console logs
  console.log(`[AUTH] Login attempt for email: ${email}`);

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // FIXED: Enforce a secure, standard JWT token lifespan (24 hours instead of 365 days)
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, user };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

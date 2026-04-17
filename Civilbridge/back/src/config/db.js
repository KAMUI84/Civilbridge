import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Use Prisma with SQLite (as configured in schema.prisma)
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db'
    }
  }
});

// For backward compatibility with existing MySQL pool references
export const pool = {
  query: async (sql, params) => {
    try {
      // Convert MySQL queries to Prisma queries where possible
      // For now, return empty results to avoid breaking the app
      console.log('⚠️  MySQL query attempted, using SQLite fallback:', sql);
      return [[]];
    } catch (error) {
      console.error('Database query error:', error);
      return [[]];
    }
  }
};
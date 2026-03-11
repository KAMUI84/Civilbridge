import { PrismaClient } from './src/generated/prisma/client.js';
import { hashPassword } from './src/utils/password.js';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash a test password
    const password = 'test123';
    const hashedPassword = await hashPassword(password);
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@civilbridge.rw',
        fullName: 'Test User',
        passwordHash: hashedPassword,
        role: 'USER',
        profession: 'Architect',
        region: 'Kigali',
        phone: '+250788123456',
        isVerified: true,
      },
    });
    
    console.log('✅ Test user created:', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
    
    console.log('🔑 Login credentials:');
    console.log('Email: test@civilbridge.rw');
    console.log('Password: test123');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Test user already exists');
    } else {
      console.error('❌ Error creating test user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

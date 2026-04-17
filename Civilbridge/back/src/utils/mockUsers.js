// In-memory user store for mock authentication
const mockUsers = new Map();

// Add default test user
mockUsers.set('test@civilbridge.rw', {
  id: '1',
  email: 'test@civilbridge.rw',
  fullName: 'Test User',
  password: 'test123',
  role: 'USER'
});

// Helper functions for mock user management
function addMockUser(email, fullName, password, role = 'USER') {
  const userId = Date.now().toString();
  mockUsers.set(email, {
    id: userId,
    email: email,
    fullName: fullName,
    password: password,
    role: role
  });
  return mockUsers.get(email);
}

function getMockUser(email) {
  return mockUsers.get(email);
}

function validateMockUser(email, password) {
  const user = mockUsers.get(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

function getAllMockUsers() {
  return Array.from(mockUsers.values());
}

// ES module exports
export { addMockUser, getMockUser, validateMockUser, getAllMockUsers, mockUsers };

console.log('🧪 Mock User Store Initialized');
console.log('📊 Current users:', Array.from(mockUsers.keys()));

// Using CommonJS (require)
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
module.exports = { default: prisma };
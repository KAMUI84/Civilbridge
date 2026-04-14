import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const permissionsList = [
  { name: 'create_project', description: 'Create new construction projects' },
  { name: 'edit_project', description: 'Edit existing projects' },
  { name: 'delete_project', description: 'Delete projects' },
  { name: 'view_all_projects', description: 'View all projects system-wide' },
  { name: 'approve_request', description: 'Approve or reject client requests' },
  { name: 'create_request', description: 'Create new requests' },
  { name: 'manage_users', description: 'Manage regular users' },
  { name: 'manage_admins', description: 'Manage admin users' },
  { name: 'view_analytics', description: 'View system analytics and reports' },
  { name: 'view_logs', description: 'View system audit logs' },
  { name: 'manage_payments', description: 'Manage all financial transactions' },
  { name: 'make_payments', description: 'Make payments for own projects' },
  { name: 'upload_files', description: 'Upload documents and plans' },
  { name: 'message_users', description: 'Send direct messages' },
  { name: 'book_tour', description: 'Book property tours' }
];

const rolePermissions = {
  SUPER_ADMIN: ['create_project', 'edit_project', 'delete_project', 'view_all_projects', 'approve_request', 'manage_users', 'manage_admins', 'view_analytics', 'view_logs', 'manage_payments', 'upload_files', 'message_users'],
  ADMIN: ['create_project', 'edit_project', 'view_all_projects', 'approve_request', 'manage_users', 'view_analytics', 'upload_files', 'message_users'],
  ENGINEER: ['edit_project', 'upload_files', 'message_users'],
  HOME_BUILDER: ['create_request', 'make_payments', 'message_users', 'book_tour', 'upload_files'],
  VIEWER: [],
  AUDITOR: ['view_analytics', 'view_logs', 'view_all_projects'],
  FINANCE: ['manage_payments', 'view_analytics', 'view_all_projects']
};

async function main() {
  console.log('Seeding Permissions...');
  for (const perm of permissionsList) {
    try {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm
      });
    } catch (e) {
      console.error(`Failed to upsert permission ${perm.name}: ${e.message}`);
    }
  }

  console.log('Mapping Role Permissions...');
  for (const [role, perms] of Object.entries(rolePermissions)) {
    for (const permName of perms) {
      try {
        const permItem = await prisma.permission.findUnique({ where: { name: permName } });
        if (permItem) {
          const existing = await prisma.rolePermission.findFirst({
            where: { role: role, permissionId: permItem.id }
          });
          if (!existing) {
            await prisma.rolePermission.create({
              data: { role: role, permissionId: permItem.id }
            });
          }
        }
      } catch (e) {
        console.error(`Error mapping ${permName} to ${role}: ${e.message}`);
      }
    }
  }
  console.log('Seeding Complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

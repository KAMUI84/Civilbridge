import { pool } from './src/config/db.js';

async function makeAdmin() {
    try {
        console.log("Starting admin promotion...");
        const email = 'samuelnizeyimana505@gmail.com';
        const [[adminRole]] = await pool.query("SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1");
        if (!adminRole) {
            console.log("No ADMIN role found in the database. Creating one...");
            // Let's create it if it doesn't exist just in case
            await pool.query("INSERT INTO roles (name) VALUES ('ADMIN')");
            const [[newRole]] = await pool.query("SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1");
            await pool.query("UPDATE users SET role_id = ? WHERE email = ?", [newRole.id, email]);
        } else {
            const [result] = await pool.query("UPDATE users SET role_id = ? WHERE email = ?", [adminRole.id, email]);
            console.log("Update result:", result.affectedRows > 0 ? "Success!" : "Email not found in DB!");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit(0);
    }
}

makeAdmin();

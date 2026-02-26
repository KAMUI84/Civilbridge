import { pool } from "../../config/db.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateToken } from "../../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    const hashed = await hashPassword(password);

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, req.body.phone || null, hashed, role]
    );
            await pool.query(
        "INSERT INTO audit_logs (user_id, action) VALUES (?, ?)",
        [result.insertId, "REGISTER"]
        );

    const token = generateToken({ id: result.insertId, role });

    res.json({
      success: true,
      token,
      user: { id: result.insertId, full_name, email, phone: req.body.phone || null, role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];

    const valid = await comparePassword(password, user.password_hash);

    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role
      }
    });
        await pool.query(
    "INSERT INTO audit_logs (user_id, action) VALUES (?, ?)",
    [user.id, "LOGIN"]
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};
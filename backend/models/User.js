const pool = require('../config/database');

class User {
    static async findAll() {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByUsername(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    }

    static async findByLogin(identifier) {
        const result = await pool.query(
            'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)',
            [identifier]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async create({ username, email, password_hash, full_name, phone, neighborhood }) {
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name, phone, neighborhood)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [username, email, password_hash, full_name, phone, neighborhood]
        );
        return result.rows[0];
    }

    static async update(id, { username, email, full_name, phone, neighborhood }) {
        const result = await pool.query(
            `UPDATE users SET username = $1, email = $2, full_name = $3, phone = $4, neighborhood = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [username, email, full_name, phone, neighborhood, id]
        );
        return result.rows[0];
    }

    static async updateTrustScore(id, score) {
        const result = await pool.query(
            'UPDATE users SET trust_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [score, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
    }

    static async getStats() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
                COUNT(CASE WHEN role = 'resident' THEN 1 END) as resident_count,
                ROUND(AVG(trust_score), 2) as avg_trust_score
            FROM users
        `);
        return result.rows[0];
    }

    static async count() {
        const result = await pool.query('SELECT COUNT(*) as count FROM users');
        return parseInt(result.rows[0].count);
    }
}

module.exports = User;

const pool = require('../config/database');

class Category {
    static async findAll() {
        const result = await pool.query('SELECT * FROM categories ORDER BY name');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create({ name, description, icon }) {
        const result = await pool.query(
            'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) RETURNING *',
            [name, description, icon || 'box']
        );
        return result.rows[0];
    }

    static async update(id, { name, description, icon }) {
        const result = await pool.query(
            'UPDATE categories SET name = $1, description = $2, icon = $3 WHERE id = $4 RETURNING *',
            [name, description, icon, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    }

    static async getItemCount() {
        const result = await pool.query(`
            SELECT c.*, COUNT(i.id) as item_count
            FROM categories c
            LEFT JOIN items i ON c.id = i.category_id
            GROUP BY c.id
            ORDER BY c.name
        `);
        return result.rows;
    }
}

module.exports = Category;
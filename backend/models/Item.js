const pool = require('../config/database');

class Item {
    static async findAll(filters = {}) {
        let query = `
            SELECT i.*, u.username as owner_name, u.full_name as owner_full_name, 
                   u.neighborhood as owner_neighborhood, u.trust_score as owner_trust_score,
                   c.name as category_name, c.icon as category_icon
            FROM items i
            JOIN users u ON i.owner_id = u.id
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.category_id) {
            query += ` AND i.category_id = $${paramIndex}`;
            params.push(filters.category_id);
            paramIndex++;
        }
        if (filters.condition) {
            query += ` AND i.condition = $${paramIndex}`;
            params.push(filters.condition);
            paramIndex++;
        }
        if (filters.search) {
            query += ` AND (i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        if (filters.is_available !== undefined) {
            query += ` AND i.is_available = $${paramIndex}`;
            params.push(filters.is_available);
            paramIndex++;
        }
        if (filters.owner_id) {
            query += ` AND i.owner_id = $${paramIndex}`;
            params.push(filters.owner_id);
            paramIndex++;
        }
        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(parseInt(filters.limit));
            paramIndex++;
        }

        query += ' ORDER BY i.created_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(`
            SELECT i.*, u.username as owner_name, u.full_name as owner_full_name,
                   u.neighborhood as owner_neighborhood, u.trust_score as owner_trust_score,
                   c.name as category_name, c.icon as category_icon
            FROM items i
            JOIN users u ON i.owner_id = u.id
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.id = $1
        `, [id]);
        return result.rows[0];
    }

    static async create({ owner_id, category_id, title, description, condition, image_url, max_loan_days, pickup_instructions, rental_price_per_day }) {
        const result = await pool.query(
            `INSERT INTO items (owner_id, category_id, title, description, condition, image_url, max_loan_days, pickup_instructions, rental_price_per_day)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [owner_id, category_id, title, description, condition, image_url, max_loan_days, pickup_instructions, rental_price_per_day || 0]
        );
        return result.rows[0];
    }

    static async update(id, { category_id, title, description, condition, image_url, is_available, max_loan_days, pickup_instructions, rental_price_per_day }) {
        const result = await pool.query(
            `UPDATE items SET category_id = $1, title = $2, description = $3, condition = $4,
             image_url = $5, is_available = $6, max_loan_days = $7, pickup_instructions = $8, rental_price_per_day = $9,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $10 RETURNING *`,
            [category_id, title, description, condition, image_url, is_available, max_loan_days, pickup_instructions, rental_price_per_day || 0, id]
        );
        return result.rows[0];
    }

    static async updateAvailability(id, isAvailable) {
        const result = await pool.query(
            'UPDATE items SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [isAvailable, id]
        );
        return result.rows[0];
    }

    static async toggleAvailability(id) {
        const result = await pool.query(
            'UPDATE items SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM items WHERE id = $1', [id]);
    }

    static async getStats() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_items,
                COUNT(CASE WHEN is_available THEN 1 END) as available_items,
                COUNT(CASE WHEN condition = 'excellent' THEN 1 END) as excellent_count,
                COUNT(CASE WHEN condition = 'good' THEN 1 END) as good_count,
                COUNT(CASE WHEN condition = 'fair' THEN 1 END) as fair_count,
                COUNT(CASE WHEN condition = 'worn' THEN 1 END) as worn_count
            FROM items
        `);
        return result.rows[0];
    }

    static async count() {
        const result = await pool.query('SELECT COUNT(*) as count FROM items');
        return parseInt(result.rows[0].count);
    }
}

module.exports = Item;
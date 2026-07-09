const pool = require('../config/database');

class Reservation {
    static async findAll(filters = {}) {
        let query = `
            SELECT r.*, 
                   i.title as item_title, i.condition as item_condition, i.image_url, i.rental_price_per_day,
                   u.username as borrower_name, u.full_name as borrower_full_name,
                   ou.username as owner_name, ou.full_name as owner_full_name,
                   c.name as category_name
            FROM reservations r
            JOIN items i ON r.item_id = i.id
            JOIN users u ON r.borrower_id = u.id
            JOIN users ou ON i.owner_id = ou.id
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.borrower_id) {
            query += ` AND r.borrower_id = $${paramIndex}`;
            params.push(filters.borrower_id);
            paramIndex++;
        }
        if (filters.owner_id) {
            query += ` AND i.owner_id = $${paramIndex}`;
            params.push(filters.owner_id);
            paramIndex++;
        }
        if (filters.status) {
            query += ` AND r.status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }
        if (filters.item_id) {
            query += ` AND r.item_id = $${paramIndex}`;
            params.push(filters.item_id);
            paramIndex++;
        }
        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(parseInt(filters.limit));
            paramIndex++;
        }

        query += ' ORDER BY r.created_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(`
            SELECT r.*,
                   i.title as item_title, i.condition as item_condition, i.image_url, i.max_loan_days, i.rental_price_per_day,
                   i.pickup_instructions, i.owner_id,
                   u.username as borrower_name, u.full_name as borrower_full_name,
                   ou.username as owner_name, ou.full_name as owner_full_name,
                   c.name as category_name
            FROM reservations r
            JOIN items i ON r.item_id = i.id
            JOIN users u ON r.borrower_id = u.id
            JOIN users ou ON i.owner_id = ou.id
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE r.id = $1
        `, [id]);
        return result.rows[0];
    }

    static async findByUser(userId) {
        const result = await pool.query(`
            SELECT r.*,
                   i.title as item_title, i.condition as item_condition, i.image_url, i.rental_price_per_day,
                   i.owner_id,
                   u.username as borrower_name, u.full_name as borrower_full_name,
                   ou.username as owner_name, ou.full_name as owner_full_name
            FROM reservations r
            JOIN items i ON r.item_id = i.id
            JOIN users u ON r.borrower_id = u.id
            JOIN users ou ON i.owner_id = ou.id
            WHERE r.borrower_id = $1 OR i.owner_id = $1
            ORDER BY r.created_at DESC
        `, [userId]);
        return result.rows;
    }

    static async create({ item_id, borrower_id, start_date, end_date, borrower_notes, rental_price }) {
        const result = await pool.query(
            `INSERT INTO reservations (item_id, borrower_id, start_date, end_date, borrower_notes, rental_price)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [item_id, borrower_id, start_date, end_date, borrower_notes, rental_price || 0]
        );
        return result.rows[0];
    }

    static async updateStatus(id, status, lender_notes = null) {
        const result = await pool.query(
            `UPDATE reservations SET status = $1, lender_notes = COALESCE($2, lender_notes), 
             updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
            [status, lender_notes, id]
        );
        return result.rows[0];
    }

    static async completeReturn(id, return_condition, return_notes) {
        const result = await pool.query(
            `UPDATE reservations SET status = 'returned', return_condition = $1, 
             return_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
            [return_condition, return_notes, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    }

    static async getStats() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_reservations,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
                COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned_count,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
            FROM reservations
        `);
        return result.rows[0];
    }

    static async getUpcomingReturns() {
        const result = await pool.query(`
            SELECT r.*, i.title as item_title, u.full_name as borrower_name
            FROM reservations r
            JOIN items i ON r.item_id = i.id
            JOIN users u ON r.borrower_id = u.id
            WHERE r.status IN ('active', 'approved')
            AND r.end_date <= CURRENT_DATE + INTERVAL '3 days'
            ORDER BY r.end_date ASC
        `);
        return result.rows;
    }

    static async count() {
        const result = await pool.query('SELECT COUNT(*) as count FROM reservations');
        return parseInt(result.rows[0].count);
    }
}

module.exports = Reservation;

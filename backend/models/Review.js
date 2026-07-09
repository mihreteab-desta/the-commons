const pool = require('../config/database');

class Review {
    static async findAll(filters = {}) {
        let query = `
            SELECT rev.*, 
                   r.item_id, r.status as reservation_status,
                   i.title as item_title,
                   rev_u.username as reviewer_name, rev_u.full_name as reviewer_full_name,
                   rev_u2.username as reviewee_name, rev_u2.full_name as reviewee_full_name
            FROM item_reviews rev
            JOIN reservations r ON rev.reservation_id = r.id
            JOIN items i ON r.item_id = i.id
            JOIN users rev_u ON rev.reviewer_id = rev_u.id
            JOIN users rev_u2 ON rev.reviewee_id = rev_u2.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.reviewee_id) {
            query += ` AND rev.reviewee_id = $${paramIndex}`;
            params.push(filters.reviewee_id);
            paramIndex++;
        }
        if (filters.reservation_id) {
            query += ` AND rev.reservation_id = $${paramIndex}`;
            params.push(filters.reservation_id);
            paramIndex++;
        }
        if (filters.reviewer_id) {
            query += ` AND rev.reviewer_id = $${paramIndex}`;
            params.push(filters.reviewer_id);
            paramIndex++;
        }

        query += ' ORDER BY rev.created_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(`
            SELECT rev.*, i.title as item_title
            FROM item_reviews rev
            JOIN reservations r ON rev.reservation_id = r.id
            JOIN items i ON r.item_id = i.id
            WHERE rev.id = $1
        `, [id]);
        return result.rows[0];
    }

    static async create({ reservation_id, reviewer_id, reviewee_id, rating, comment, review_type }) {
        const result = await pool.query(
            `INSERT INTO item_reviews (reservation_id, reviewer_id, reviewee_id, rating, comment, review_type)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [reservation_id, reviewer_id, reviewee_id, rating, comment, review_type]
        );
        return result.rows[0];
    }

    static async getAverageRating(userId) {
        const result = await pool.query(`
            SELECT ROUND(AVG(rating), 2) as avg_rating, COUNT(*) as review_count
            FROM item_reviews
            WHERE reviewee_id = $1
        `, [userId]);
        return result.rows[0];
    }

    static async hasUserReviewedReservation(reservationId, userId) {
        const result = await pool.query(`
            SELECT COUNT(*) as count
            FROM item_reviews
            WHERE reservation_id = $1 AND reviewer_id = $2
        `, [reservationId, userId]);
        return parseInt(result.rows[0].count) > 0;
    }
}

module.exports = Review;
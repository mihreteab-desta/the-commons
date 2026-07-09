const pool = require('../config/database');

const initDB = async () => {
    try {
        console.log('Initializing database...');

        // Drop existing tables
        await pool.query(`
            DROP TABLE IF EXISTS item_reviews CASCADE;
            DROP TABLE IF EXISTS reservations CASCADE;
            DROP TABLE IF EXISTS items CASCADE;
            DROP TABLE IF EXISTS categories CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);
        console.log('Dropped existing tables');

        // Create users table
        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                neighborhood VARCHAR(100),
                role VARCHAR(20) DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
                trust_score DECIMAL(3,2) DEFAULT 5.00 CHECK (trust_score >= 0 AND trust_score <= 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created: users table');

        // Create categories table
        await pool.query(`
            CREATE TABLE categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                icon VARCHAR(50) DEFAULT 'box',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created: categories table');

        // Create items table
        await pool.query(`
            CREATE TABLE items (
                id SERIAL PRIMARY KEY,
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'worn')),
                image_url VARCHAR(255),
                is_available BOOLEAN DEFAULT TRUE,
                max_loan_days INTEGER DEFAULT 7 CHECK (max_loan_days > 0 AND max_loan_days <= 30),
                rental_price_per_day DECIMAL(10,2) DEFAULT 0.00,
                pickup_instructions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created: items table');

        // Create reservations table
        await pool.query(`
            CREATE TABLE reservations (
                id SERIAL PRIMARY KEY,
                item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
                borrower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                rental_price DECIMAL(10,2) DEFAULT 0.00,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'returned', 'overdue', 'cancelled', 'rejected')),
                borrower_notes TEXT,
                lender_notes TEXT,
                return_condition VARCHAR(20),
                return_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT valid_dates CHECK (end_date >= start_date)
            )
        `);
        console.log('Created: reservations table');

        // Create item_reviews table
        await pool.query(`
            CREATE TABLE item_reviews (
                id SERIAL PRIMARY KEY,
                reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
                reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                review_type VARCHAR(20) CHECK (review_type IN ('borrower_to_lender', 'lender_to_borrower')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created: item_reviews table');

        console.log('\n✅ Database initialized successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
};

initDB();
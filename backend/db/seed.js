const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
    try {
        console.log('Seeding database...');

        const hashPassword = async (password) => {
            return await bcrypt.hash(password, 10);
        };

        await pool.query(`
            INSERT INTO categories (name, description, icon) VALUES
            ('Power Tools', 'Drills, saws, sanders, and other power equipment', 'zap'),
            ('Hand Tools', 'Hammers, wrenches, screwdrivers, and manual tools', 'tool'),
            ('Garden & Outdoor', 'Lawn mowers, trimmers, camping gear, bikes', 'sun'),
            ('Kitchen & Dining', 'Specialty appliances, serving ware, large pots', 'utensils'),
            ('Electronics', 'Projectors, speakers, cameras, and tech gadgets', 'monitor'),
            ('Arts & Crafts', 'Sewing machines, painting supplies, crafting tools', 'palette'),
            ('Sports & Fitness', 'Exercise equipment, sports gear, outdoor games', 'activity'),
            ('Cleaning', 'Vacuums, carpet cleaners, pressure washers', 'droplet')
        `);
        console.log('Seeded: categories');

        const adminPass = await hashPassword('admin123');
        const userPass = await hashPassword('password123');

        await pool.query(`
            INSERT INTO users (username, email, password_hash, full_name, phone, neighborhood, role, trust_score) VALUES
            ('admin_james', 'james@commons.local', $1, 'James Okafor', '+251911111111', 'Bole District', 'admin', 5.00),
            ('sara_tadesse', 'sara@email.com', $2, 'Sara Tadesse', '+251922222222', 'Kirkos District', 'resident', 4.80),
            ('mike_abebe', 'mike@email.com', $2, 'Mike Abebe', '+251933333333', 'Arada District', 'resident', 4.50),
            ('lina_mengistu', 'lina@email.com', $2, 'Lina Mengistu', '+251944444444', 'Bole District', 'resident', 4.90),
            ('david_berhe', 'david@email.com', $2, 'David Berhe', '+251955555555', 'Kirkos District', 'resident', 4.20)
        `, [adminPass, userPass]);
        console.log('Seeded: users');

        await pool.query(`
            INSERT INTO items (owner_id, category_id, title, description, condition, image_url, is_available, max_loan_days, pickup_instructions) VALUES
            (2, 1, 'Cordless Drill Set', '18V DeWalt cordless drill with 2 batteries, charger, and bit set. Perfect for home projects.', 'excellent', '/images/drill.jpg', TRUE, 7, 'Pickup from my garage on Bole Road. Text when arriving.'),
            (2, 3, 'Camping Tent (4-Person)', 'REI 4-person tent, waterproof, easy setup. Includes footprint and rainfly.', 'good', '/images/tent.jpg', TRUE, 14, 'I keep it in storage. Call me 30 min before pickup.'),
            (3, 2, 'Complete Socket Wrench Set', 'Metric and SAE socket set with ratchets. 150 pieces in rolling case.', 'excellent', '/images/sockets.jpg', TRUE, 5, 'Available anytime. Ring the bell at Gate 3.'),
            (4, 4, 'Stand Mixer', 'KitchenAid Artisan stand mixer with paddle, whisk, and dough hook attachments.', 'good', '/images/mixer.jpg', TRUE, 3, 'Pickup from my apartment lobby. I will leave it with security.'),
            (5, 5, 'Portable Projector', 'Mini LED projector, 1080p, HDMI/USB. Great for movie nights or presentations.', 'excellent', '/images/projector.jpg', TRUE, 2, 'Evening pickup preferred. Building B, Apartment 402.'),
            (3, 6, 'Sewing Machine', 'Brother sewing machine with basic stitches. Includes extra needles and bobbins.', 'fair', '/images/sewing.jpg', TRUE, 7, 'Weekends only. I will bring it to the lobby.'),
            (4, 7, 'Yoga Mat & Blocks Set', 'Thick yoga mat with 2 foam blocks and strap. Clean and well-maintained.', 'good', '/images/yoga.jpg', TRUE, 10, 'Available weekdays after 6pm. Text for address.'),
            (5, 8, 'Pressure Washer', 'Electric pressure washer, 2000 PSI. Great for cleaning driveways and patios.', 'good', '/images/pressure.jpg', TRUE, 3, 'Heavy item - need a car. Pickup Saturday mornings.'),
            (2, 1, 'Circular Saw', '7-1/4 inch circular saw with blade guard. Extra blade included.', 'good', '/images/saw.jpg', TRUE, 5, 'Same as drill pickup location.'),
            (4, 3, 'Bicycle (Mountain)', 'Trek mountain bike, 26-inch, 21-speed. Helmet included.', 'excellent', '/images/bike.jpg', TRUE, 14, 'Stored in my basement. I will bring it up.'),
            (3, 4, 'Rice Cooker (Large)', '10-cup rice cooker, also steams vegetables. Non-stick inner pot.', 'good', '/images/ricecooker.jpg', TRUE, 3, 'Pickup anytime from my office reception.'),
            (5, 2, 'Level & Measuring Tools', 'Laser level, tape measure, and stud finder set.', 'excellent', '/images/level.jpg', TRUE, 7, 'Drop by my shop on Meskel Square.')
        `);
        console.log('Seeded: items');

        await pool.query(`
            INSERT INTO reservations (item_id, borrower_id, start_date, end_date, status, borrower_notes, lender_notes) VALUES
            (1, 3, '2026-06-15', '2026-06-20', 'returned', 'Need to fix kitchen cabinets', 'Please return clean'),
            (2, 4, '2026-06-18', '2026-06-25', 'active', 'Weekend camping trip to Entoto', 'Enjoy the mountains!'),
            (4, 5, '2026-06-20', '2026-06-23', 'approved', 'Baking for a birthday party', 'All attachments included'),
            (5, 2, '2026-06-22', '2026-06-24', 'pending', 'Community meeting presentation', NULL),
            (7, 3, '2026-06-10', '2026-06-20', 'overdue', 'Daily yoga practice', 'Please return ASAP')
        `);
        console.log('Seeded: reservations');

        await pool.query(`
            INSERT INTO item_reviews (reservation_id, reviewer_id, reviewee_id, rating, comment, review_type) VALUES
            (1, 3, 2, 5, 'Sara was very accommodating. Drill worked perfectly!', 'borrower_to_lender'),
            (1, 2, 3, 4, 'Mike returned the drill on time and in good condition.', 'lender_to_borrower')
        `);
        console.log('Seeded: reviews');

        console.log('\n✅ Database seeded successfully!');
        console.log('📝 Sample login credentials:');
        console.log('  Admin: admin_james / admin123');
        console.log('  User:  sara_tadesse / password123');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
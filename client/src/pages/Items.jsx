import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ItemImage from '../components/common/ItemImage';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Electronics', 'Power Tools', 'Hand Tools', 'Outdoor', 'Camping'];

  const formatPrice = (price) => {
    const amount = parseFloat(price || 0);
    return amount > 0 ? `$${amount.toFixed(2)}/day` : 'Free';
  };

  const matchesCategory = (item, category) => {
    if (category === 'All') return true;

    const itemCategory = (item.category_name || '').toLowerCase();
    const selectedCategory = category.toLowerCase();

    if (selectedCategory === 'outdoor') {
      return itemCategory.includes('outdoor') || itemCategory.includes('garden');
    }

    return itemCategory.includes(selectedCategory);
  };

  const filteredItems = items.filter((item) => matchesCategory(item, activeCategory));

  useEffect(() => {
    // Fetch items from API
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/items');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
        // Use sample data if API is not running
        const sampleItems = [
          {
            id: 1,
            title: 'Cordless Drill Set',
            description: '18V DeWalt cordless drill with 2 batteries',
            condition: 'excellent',
            is_available: true,
            owner_full_name: 'Sara Tadesse',
            owner_neighborhood: 'Kirkos District',
            max_loan_days: 7,
            rental_price_per_day: 5,
            category_name: 'Power Tools'
          },
          {
            id: 2,
            title: 'Camping Tent (4-Person)',
            description: 'REI 4-person tent, waterproof, easy setup',
            condition: 'good',
            is_available: true,
            owner_full_name: 'Sara Tadesse',
            owner_neighborhood: 'Kirkos District',
            max_loan_days: 14,
            rental_price_per_day: 0,
            category_name: 'Garden & Outdoor'
          },
          {
            id: 3,
            title: 'Complete Socket Wrench Set',
            description: 'Metric and SAE socket set with ratchets',
            condition: 'excellent',
            is_available: true,
            owner_full_name: 'Mike Abebe',
            owner_neighborhood: 'Arada District',
            max_loan_days: 5,
            rental_price_per_day: 3,
            category_name: 'Hand Tools'
          }
        ];
        setItems(sampleItems);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="tc-page">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tc-page">
      <div className="tc-page-head">
        <div>
          <h1>Browse <span>Items</span> near you</h1>
          <p>Find tools, equipment, and household items available to borrow or rent in your neighborhood.</p>
        </div>
      </div>

      <section className="tc-trust-band">
        <div className="tc-trust-inner">
          <div>
            <h2>500+ items shared across 12 neighborhoods</h2>
            <p>Every listing is from a verified neighbor. Borrow what you need, return it on time, and help someone else skip a trip to the store.</p>
            <Link to="/items/new" className="tc-trust-cta">List your first item →</Link>
          </div>
          <div className="tc-stat-grid">
            <div className="tc-stat-card"><div className="num">98%</div><div className="label">Items returned on time</div></div>
            <div className="tc-stat-card"><div className="num">4.8</div><div className="label">Average lender rating</div></div>
            <div className="tc-stat-card"><div className="num">390+</div><div className="label">Active lenders nearby</div></div>
            <div className="tc-stat-card"><div className="num">$0</div><div className="label">Platform fees, always</div></div>
          </div>
        </div>
      </section>

      <div className="tc-filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`tc-chip tc-filter-button ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="tc-empty-state">
          <div className="empty-icon">📦</div>
          <h3>No items found</h3>
          <p>
            {items.length === 0
              ? 'Check back later for new listings.'
              : `No ${activeCategory.toLowerCase()} items are available right now.`}
          </p>
        </div>
      ) : (
        <div className="tc-grid-wrap">
        <div className="tc-item-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="tc-item-card">
              <div className={`tc-card-media ${!item.is_available ? 'dark' : ''}`}>
                <ItemImage item={item} alt={item.title} />
                <span className={`tc-badge ${item.is_available ? 'avail' : 'unavail'}`}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="tc-card-body">
                <div className="tc-tag-row">
                  <span className="tc-cat-tag">{item.category_name || 'Uncategorized'}</span>
                  <span className="tc-cond-tag">
                    {item.condition || 'Good'}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p className="desc">
                  {item.description ? item.description.substring(0, 80) + '...' : ''}
                </p>
                <div className="tc-card-foot">
                  <div className="tc-lender">
                    <div className="name">{item.owner_full_name || 'Unknown'}</div>
                    <div className="loc">{item.owner_neighborhood || 'Nearby'}</div>
                  </div>
                  <div className="tc-price-block">
                    <div className="duration">{item.max_loan_days || 7} days max</div>
                    <div className="price">{formatPrice(item.rental_price_per_day)}</div>
                  </div>
                </div>
              </div>
              <Link to={`/items/${item.id}`} className="item-link" />
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
};

export default Items;

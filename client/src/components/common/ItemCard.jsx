import React from 'react';
import { Link } from 'react-router-dom';
import ItemImage from './ItemImage';

const ItemCard = ({ item }) => {
  const getConditionClass = (condition) => {
    const map = {
      'excellent': 'excellent',
      'good': 'good',
      'fair': 'fair',
      'worn': 'worn'
    };
    return map[condition] || 'good';
  };

  const getCategoryIcon = (icon) => {
    const map = {
      'zap': '⚡',
      'tool': '🔧',
      'sun': '☀️',
      'utensils': '🍳',
      'monitor': '🖥️',
      'palette': '🎨',
      'activity': '🏃',
      'droplet': '💧'
    };
    return map[icon] || '📦';
  };

  const formatPrice = (price) => {
    const amount = parseFloat(price || 0);
    return amount > 0 ? `$${amount.toFixed(2)}/day` : 'Free';
  };

  return (
    <div className="item-card">
      <div className="item-image">
        <ItemImage item={item} alt={item.title} />
        <span className={`item-badge ${item.is_available ? 'available' : 'unavailable'}`}>
          {item.is_available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      <div className="item-content">
        <div className="item-meta">
          <span className="item-category">
            {getCategoryIcon(item.category_icon)} {item.category_name || 'Uncategorized'}
          </span>
          <span className={`item-condition ${getConditionClass(item.condition)}`}>
            {item.condition}
          </span>
        </div>

        <h3 className="item-title">{item.title}</h3>
        <p className="item-description">
          {item.description ? item.description.substring(0, 80) + '...' : ''}
        </p>

        <div className="item-footer">
          <div className="item-owner">
            <span className="owner-name">{item.owner_full_name}</span>
            <span className="owner-neighborhood">{item.owner_neighborhood}</span>
          </div>
          <div className="item-loan">
            ⏱️ {item.max_loan_days} days max
          </div>
          <div className="item-price">
            {formatPrice(item.rental_price_per_day)}
          </div>
        </div>
      </div>

      <Link to={`/items/${item.id}`} className="item-link" />
    </div>
  );
};

export default ItemCard;

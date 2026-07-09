import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getItems, deleteItem, toggleItemAvailability } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, borrowed: 0 });
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user) fetchMyItems();
  }, [user]);

  const fetchMyItems = async () => {
    try {
      const res = await getItems(isAdmin ? {} : { owner: user.id });
      setItems(res.data);
      const total = res.data.length;
      const available = res.data.filter((i) => i.is_available).length;
      setStats({ total, available, borrowed: total - available });
    } catch (err) {
      toast.error(isAdmin ? 'Failed to load listings' : 'Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleItemAvailability(id);
      toast.success('Availability updated');
      fetchMyItems();
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      toast.success('Item deleted');
      fetchMyItems();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  if (loading) return <div className="tc-page">Loading dashboard...</div>;

  return (
    <div className="tc-page">
      <div className="tc-page-head">
        <div className="tc-dashboard-hero-copy">
          <h1>{isAdmin ? 'Admin' : 'My'} <span>Dashboard</span></h1>
          <p>
            {isAdmin
              ? 'Manage all listed items, availability, and unnecessary listings from one place.'
              : 'Manage your listed items, availability, and lending activity from one place.'}
          </p>
        </div>
        
      </div>

      <div className="tc-dashboard-stats">
        <div className="tc-stat-card">
          <div className="num">{stats.total}</div>
          <div className="label">Total Items</div>
        </div>
        <div className="tc-stat-card">
          <div className="num">{stats.available}</div>
          <div className="label">Available now</div>
        </div>
        <div className="tc-stat-card">
          <div className="num">{stats.borrowed}</div>
          <div className="label">Currently borrowed</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="tc-empty-state">
          <p>
            {isAdmin ? 'No items have been listed yet.' : "You haven't listed any items yet."}
          </p>
          <Link to={isAdmin ? '/items' : '/items/new'} className="tc-primary-btn">
            {isAdmin ? 'Browse Items' : 'List Your First Item'}
          </Link>
        </div>
      ) : (
        <section className="tc-section-card">
          <div className="tc-section-title">
            <h2>{isAdmin ? 'All Listings' : 'My Items'}</h2>
            <span className="tc-chip active">{items.length} listed</span>
          </div>
          <div className="tc-table-wrapper">
          <table className="tc-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                {isAdmin && <th>Owner</th>}
                <th>Condition</th>
                <th>Max Loan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="tc-table-item">
                      
                      <strong>{item.title}</strong>
                    </div>
                  </td>
                  <td>{item.category_name}</td>
                  {isAdmin && (
                    <td>
                      <div className="tc-table-item">
                        <strong>{item.owner_full_name || item.owner_name || 'Unknown'}</strong>
                      </div>
                    </td>
                  )}
                  <td className="capitalize">{item.condition}</td>
                  <td>{item.max_loan_days} days</td>
                  <td>
                    <span className={`tc-badge inline ${item.is_available ? 'avail' : 'unavail'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="tc-action-row">
                      <button
                        onClick={() => handleToggle(item.id)}
                        className="tc-secondary-btn small"
                        title="Toggle Availability"
                      >
                        {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <Link to={`/items/${item.id}`} className="tc-view-link">
                        View <span>→</span>
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="tc-danger-btn small">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;

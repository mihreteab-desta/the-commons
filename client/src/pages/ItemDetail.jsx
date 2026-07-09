import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createReservation, getItem, updateItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ItemImage from '../components/common/ItemImage';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowData, setBorrowData] = useState({
    start_date: '',
    end_date: '',
    borrower_notes: ''
  });
  const [editData, setEditData] = useState({
    rental_price_per_day: '',
    condition: 'good',
    max_loan_days: 7,
    image_url: ''
  });
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await getItem(id);
        setItem(response.data);
        setEditData({
          rental_price_per_day: response.data.rental_price_per_day ?? 0,
          condition: response.data.condition || 'good',
          max_loan_days: response.data.max_loan_days || 7,
          image_url: response.data.image_url || ''
        });
      } catch (error) {
        console.error('Error fetching item:', error);
        // Sample data if API not running
        const fallbackItem = {
          id: parseInt(id),
          title: 'Cordless Drill Set',
          description: '18V DeWalt cordless drill with 2 batteries, charger, and bit set. Perfect for home projects.',
          condition: 'excellent',
          is_available: true,
          owner_full_name: 'Sara Tadesse',
          owner_neighborhood: 'Kirkos District',
          owner_trust_score: 4.8,
          max_loan_days: 7,
          rental_price_per_day: 5.00,
          pickup_instructions: 'Pickup from my garage on Bole Road. Text when arriving.',
          category_name: 'Power Tools'
        };
        setItem(fallbackItem);
        setEditData({
          rental_price_per_day: fallbackItem.rental_price_per_day,
          condition: fallbackItem.condition,
          max_loan_days: fallbackItem.max_loan_days,
          image_url: fallbackItem.image_url || ''
        });
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setBorrowData({ ...borrowData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const maxLoanDays = parseInt(editData.max_loan_days, 10);
    const rentalPrice = parseFloat(editData.rental_price_per_day || 0);

    if (Number.isNaN(maxLoanDays) || maxLoanDays < 1 || maxLoanDays > 30) {
      toast.error('Max loan period must be between 1 and 30 days');
      return;
    }

    if (Number.isNaN(rentalPrice) || rentalPrice < 0) {
      toast.error('Price per day cannot be negative');
      return;
    }

    setSavingDetails(true);

    try {
      const response = await updateItem(item.id, {
        category_id: item.category_id,
        title: item.title,
        description: item.description,
        condition: editData.condition,
        image_url: editData.image_url,
        is_available: item.is_available,
        max_loan_days: maxLoanDays,
        rental_price_per_day: rentalPrice,
        pickup_instructions: item.pickup_instructions
      });

      setItem(response.data);
      setEditData({
        rental_price_per_day: response.data.rental_price_per_day ?? 0,
        condition: response.data.condition || 'good',
        max_loan_days: response.data.max_loan_days || 7,
        image_url: response.data.image_url || ''
      });
      setIsEditingDetails(false);
      toast.success('Item details updated');
    } catch (error) {
      console.error('Error updating item:', error);
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You can only edit your own items');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update item details');
      }
    } finally {
      setSavingDetails(false);
    }
  };

  const handleBorrowRequest = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to borrow items');
      navigate('/login');
      return;
    }

    if (!borrowData.start_date || !borrowData.end_date) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      await createReservation({
        item_id: item.id,
        start_date: borrowData.start_date,
        end_date: borrowData.end_date,
        borrower_notes: borrowData.borrower_notes
      });

      toast.success('Rental request sent successfully!');
      navigate('/rentals');
    } catch (error) {
      console.error('Error creating reservation:', error);
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You cannot rent your own items');
      } else {
        toast.error(error.response?.data?.error || 'Failed to create rental request');
      }
    }
  };

  const getConditionClass = (condition) => {
    const map = {
      'excellent': 'excellent',
      'good': 'good',
      'fair': 'fair',
      'worn': 'worn'
    };
    return map[condition] || 'good';
  };

  if (loading) {
    return (
      <div className="tc-page">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="tc-page">
        <div className="tc-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Item not found</h3>
          <Link to="/items" className="tc-primary-btn">Browse Items</Link>
        </div>
      </div>
    );
  }

  // Check if the current user is the owner of the item
  const isOwner = isAuthenticated && user && Number(item.owner_id) === Number(user.id);

  const resetEditData = () => {
    setEditData({
      rental_price_per_day: item.rental_price_per_day ?? 0,
      condition: item.condition || 'good',
      max_loan_days: item.max_loan_days || 7,
      image_url: item.image_url || ''
    });
    setIsEditingDetails(false);
  };

  // Calculate total rental price if price per day exists
  const calculateRentalPrice = () => {
    if (!borrowData.start_date || !borrowData.end_date || !item.rental_price_per_day) return 0;
    const startDate = new Date(borrowData.start_date);
    const endDate = new Date(borrowData.end_date);
    const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return (item.rental_price_per_day * daysCount).toFixed(2);
  };

  return (
    <div className="tc-page">
      <div className="tc-detail-page">
        <Link to="/items" className="tc-back-link">← Back to items</Link>

        <div className="tc-detail-grid">
          <div className="tc-detail-media">
            <ItemImage item={item} alt={item.title} />
            <span className={`tc-badge ${item.is_available ? 'avail' : 'unavail'}`}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <div className="tc-detail-info">
            <div className="tc-tag-row">
              <span className="tc-cat-tag">{item.category_name || 'Uncategorized'}</span>
              <span className={`tc-cond-tag ${getConditionClass(item.condition)}`}>
                {item.condition || 'Good'}
              </span>
            </div>

            <h1>{item.title}</h1>
            <p className="tc-detail-description">{item.description}</p>

            <div className="tc-stat-grid">
              <div className="tc-stat-card">
                <div className="label">Max Loan Period</div>
                <div className="num">{item.max_loan_days} days</div>
              </div>
              <div className="tc-stat-card">
                <div className="label">Condition</div>
                <div className="num capitalize">{item.condition}</div>
              </div>
              <div className="tc-stat-card">
                <div className="label">Price Per Day</div>
                <div className="num">
                  {item.rental_price_per_day > 0 ? `$${parseFloat(item.rental_price_per_day).toFixed(2)}` : 'Free'}
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="tc-form-card tc-owner-edit-card">
                <div className="tc-section-title">
                  <h2>Listing Details</h2>
                  {!isEditingDetails && (
                    <button
                      type="button"
                      className="tc-secondary-btn small"
                      onClick={() => setIsEditingDetails(true)}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditingDetails ? (
                  <form onSubmit={handleEditSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="rental_price_per_day">Price Per Day ($)</label>
                        <input
                          type="number"
                          id="rental_price_per_day"
                          name="rental_price_per_day"
                          min="0"
                          step="0.01"
                          value={editData.rental_price_per_day}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="condition">Condition</label>
                        <select
                          id="condition"
                          name="condition"
                          value={editData.condition}
                          onChange={handleEditChange}
                        >
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="worn">Worn</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="max_loan_days">Max Loan Days</label>
                        <input
                          type="number"
                          id="max_loan_days"
                          name="max_loan_days"
                          min="1"
                          max="30"
                          value={editData.max_loan_days}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="image_url">Image URL</label>
                      <input
                        type="url"
                        id="image_url"
                        name="image_url"
                        value={editData.image_url}
                        onChange={handleEditChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="tc-action-row">
                      <button type="submit" className="tc-primary-btn small" disabled={savingDetails}>
                        {savingDetails ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="tc-secondary-btn small"
                        onClick={resetEditData}
                        disabled={savingDetails}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="tc-muted">
                    Update the price, condition, and max loan period for this item.
                  </p>
                )}
              </div>
            )}

            <div className="tc-owner-card">
              <div className="tc-profile-person">
                <div className="tc-profile-avatar">
                  {item.owner_full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2>{item.owner_full_name || 'Unknown'}</h2>
                  <p>{item.owner_neighborhood || 'Nearby'}</p>
                  <span className="tc-chip">{item.owner_trust_score || 5.0} trust score</span>
                </div>
              </div>
            </div>

            <div className="tc-info-panel">
              <h3>Pickup Instructions</h3>
              <p>{item.pickup_instructions || 'Contact the lender for pickup details.'}</p>
            </div>

            {/* Borrow Section - Only show if user is logged in and NOT the owner */}
            {isAuthenticated && !isOwner && item.is_available ? (
              <div className="tc-form-card tc-borrow-card">
                <h3>Request to Rent</h3>
                <form onSubmit={handleBorrowRequest}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="start_date">Start Date</label>
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={borrowData.start_date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="end_date">End Date</label>
                      <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={borrowData.end_date}
                        onChange={handleChange}
                        required
                        min={borrowData.start_date || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="borrower_notes">Notes for Lender</label>
                    <textarea
                      id="borrower_notes"
                      name="borrower_notes"
                      rows="3"
                      value={borrowData.borrower_notes}
                      onChange={handleChange}
                      placeholder="Why do you need this item? When will you return it?"
                    />
                  </div>
                  {calculateRentalPrice() > 0 && (
                    <div className="tc-total-box">
                      <p>
                        <strong>Rental Total:</strong> ${calculateRentalPrice()}
                      </p>
                    </div>
                  )}
                  <button type="submit" className="tc-primary-btn full">
                    Send Rental Request
                  </button>
                </form>
              </div>
            ) : isAuthenticated && isOwner ? (
              <div className="tc-info-panel">
                <h3>Your Item</h3>
                <p>This is your own item. You can update listing details above.</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="tc-info-panel">
                <h3>Request to Rent</h3>
                <p>
                  <Link to="/login">Sign in</Link> to rent this item.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;

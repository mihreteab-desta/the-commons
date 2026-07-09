import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMyReservations, approveReservation, rejectReservation } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Rentals = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const res = await getMyReservations();
      setRentals(res.data);
    } catch (err) {
      toast.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  // Items rented by the user (user is borrower)
  const rentedByMe = rentals.filter((r) => Number(r.borrower_id) === Number(user.id));

  // Requests from other users for items owned by the user
  const borrowRequests = rentals.filter((r) => Number(r.owner_id) === Number(user.id));

  const handleApprove = async (id) => {
    try {
      await approveReservation(id, 'Approved! Please pick up at the agreed time.');
      toast.success('Request accepted!');
      fetchRentals();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReservation(id, 'Declined by lender.');
      toast.success('Request declined');
      fetchRentals();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to decline request');
    }
  };

  const getStatusClass = (status) => {
    const map = {
      pending: 'pending',
      approved: 'approved',
      active: 'active',
      returned: 'returned',
      overdue: 'overdue',
      cancelled: 'cancelled',
      rejected: 'rejected',
    };
    return map[status] || 'pending';
  };

  const formatMoney = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  const getRentalDays = (rental) => {
    const startDate = new Date(rental.start_date);
    const endDate = new Date(rental.end_date);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 1;
    }

    return Math.max(Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1, 1);
  };

  const getTotalPrice = (rental) => {
    const storedTotal = parseFloat(rental.rental_price || 0);
    if (storedTotal > 0) {
      return storedTotal;
    }

    return parseFloat(rental.rental_price_per_day || 0) * getRentalDays(rental);
  };

  if (loading) return <div className="tc-page">Loading rentals...</div>;

  return (
    <div className="tc-page">
      <div className="tc-page-head">
        <div>
          <h1>Your <span>Rentals</span></h1>
          <p>Track what you are borrowing and respond to requests for items you own.</p>
        </div>
      </div>

      <section className="tc-section-card">
        <div className="tc-section-title">
          <h2>My Rentals</h2>
          <span className="tc-chip active">{rentedByMe.length}</span>
        </div>

        {rentedByMe.length === 0 ? (
        <div className="tc-empty-state compact">
          <p>
            You're not currently renting any items. Browse and rent items to get started!
          </p>
        </div>
      ) : (
        <div className="tc-table-wrapper">
          <table className="tc-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Owner</th>
                <th>Rental Period</th>
                <th>Price Per Day</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rentedByMe.map((rental) => (
                <tr key={rental.id}>
                  <td>
                    <strong>{rental.item_title}</strong>
                  </td>
                  <td>
                    <strong>{rental.owner_full_name}</strong>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      @{rental.owner_name}
                    </span>
                  </td>
                  <td>
                    {new Date(rental.start_date).toLocaleDateString()} to{' '}
                    {new Date(rental.end_date).toLocaleDateString()}
                  </td>
                  <td>{formatMoney(rental.rental_price_per_day)}</td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {formatMoney(getTotalPrice(rental))}
                  </td>
                  <td>
                    <span className={`tc-status ${getStatusClass(rental.status)}`}>
                      {rental.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </section>

      <section className="tc-section-card">
        <div className="tc-section-title">
          <h2>Borrow Requests</h2>
          <span className="tc-chip">{borrowRequests.length}</span>
        </div>

        {borrowRequests.length === 0 ? (
          <div className="tc-empty-state compact">
            <p>
              No borrow requests yet. When someone requests one of your listed items, it will appear here.
            </p>
          </div>
        ) : (
          <div className="tc-table-wrapper">
            <table className="tc-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Borrower</th>
                  <th>Rental Period</th>
                  <th>Price Per Day</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowRequests.map((rental) => (
                  <tr key={rental.id}>
                    <td>
                      <strong>{rental.item_title}</strong>
                    </td>
                    <td>
                      <strong>{rental.borrower_full_name}</strong>
                      <br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        @{rental.borrower_name}
                      </span>
                    </td>
                    <td>
                      {new Date(rental.start_date).toLocaleDateString()} to{' '}
                      {new Date(rental.end_date).toLocaleDateString()}
                    </td>
                    <td>{formatMoney(rental.rental_price_per_day)}</td>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                      {formatMoney(getTotalPrice(rental))}
                    </td>
                    <td>
                      <span className={`tc-status ${getStatusClass(rental.status)}`}>
                        {rental.status}
                      </span>
                    </td>
                    <td>
                      {rental.status === 'pending' ? (
                        <div className="tc-action-row">
                          <button onClick={() => handleApprove(rental.id)} className="tc-primary-btn small">
                            Accept
                          </button>
                          <button onClick={() => handleReject(rental.id)} className="tc-danger-btn small">
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="tc-muted">
                          {rental.status === 'approved' && 'Accepted'}
                          {rental.status === 'active' && 'Active'}
                          {rental.status === 'returned' && 'Returned'}
                          {rental.status === 'overdue' && 'Overdue'}
                          {rental.status === 'cancelled' && 'Cancelled'}
                          {rental.status === 'rejected' && 'Declined'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Rentals;

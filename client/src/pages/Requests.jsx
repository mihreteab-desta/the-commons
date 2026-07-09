import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMyReservations, approveReservation } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received'); // 'received' or 'sent'

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getMyReservations();
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Requests where user is the OWNER (lender) - received requests
  const receivedRequests = requests.filter((r) => r.owner_id === user.id);

  // Requests where user is the BORROWER - sent requests
  const sentRequests = requests.filter((r) => r.borrower_id === user.id);

  const handleApprove = async (id) => {
    try {
      await approveReservation(id, 'Approved! Please pick up at the agreed time.');
      toast.success('Request approved!');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = (id) => {
    toast('Reject feature coming soon — add a backend endpoint for this!');
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

  if (loading) return <div className="page-container">Loading requests...</div>;

  const displayRequests = tab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Requests</h1>
        <p>Manage your borrow requests and incoming requests</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setTab('received')}
            style={{
              padding: '0.75rem 1.5rem',
              borderBottom: tab === 'received' ? '3px solid var(--primary)' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: tab === 'received' ? '600' : '500',
              color: tab === 'received' ? 'var(--primary)' : 'var(--text-light)',
            }}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setTab('sent')}
            style={{
              padding: '0.75rem 1.5rem',
              borderBottom: tab === 'sent' ? '3px solid var(--primary)' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: tab === 'sent' ? '600' : '500',
              color: tab === 'sent' ? 'var(--primary)' : 'var(--text-light)',
            }}
          >
            Sent ({sentRequests.length})
          </button>
        </div>
      </div>

      {displayRequests.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-light)' }}>
            {tab === 'received'
              ? 'No borrow requests yet. When someone requests your items, they\'ll appear here.'
              : 'No sent requests yet. Browse items and request to borrow them!'}
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                {tab === 'received' ? (
                  <>
                    <th>Borrower</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Borrower Notes</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>Owner</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Your Notes</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {displayRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <strong>{req.item_title}</strong>
                  </td>
                  <td>
                    <strong>{tab === 'received' ? req.borrower_full_name : req.owner_full_name}</strong>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      @{tab === 'received' ? req.borrower_name : req.owner_name}
                    </span>
                  </td>
                  <td>{new Date(req.start_date).toLocaleDateString()}</td>
                  <td>{new Date(req.end_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
                    {tab === 'received' ? req.borrower_notes : req.borrower_notes}
                    {!req.borrower_notes && '-'}
                  </td>
                  {tab === 'received' && (
                    <td>
                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleApprove(req.id)} className="btn btn-small btn-primary">
                            Approve
                          </button>
                          <button onClick={() => handleReject(req.id)} className="btn btn-small btn-danger">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {req.status === 'approved' && 'Awaiting pickup'}
                          {req.status === 'active' && 'Currently borrowed'}
                          {req.status === 'returned' && 'Returned'}
                          {req.status === 'overdue' && 'Overdue!'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Requests;
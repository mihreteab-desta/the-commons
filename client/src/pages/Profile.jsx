import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMe, updateMe } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    neighborhood: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trustScore, setTrustScore] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMe();
      const data = res.data;
      setFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        neighborhood: data.neighborhood || '',
      });
      setTrustScore(data.trust_score);
    } catch (err) {
      toast.error('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateMe({
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        neighborhood: formData.neighborhood,
      });
      updateUser(res.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!window.confirm('⚠️ Are you sure you want to delete your account? This cannot be undone.')) {
      return;
    }
    toast('Account deletion requires admin assistance. Please contact support.');
  };

  return (
    <div className="tc-page">
      <div className="tc-page-head">
        <div>
          <h1>My <span>Profile</span></h1>
          <p>Manage your account details, trust score, and neighborhood identity.</p>
        </div>
      </div>

      <div className="tc-profile-layout">
        <section className="tc-profile-card">
          <div className="tc-profile-top">
            <div className="tc-profile-person">
              <div className="tc-profile-avatar">
                {formData.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2>{formData.full_name || 'Your profile'}</h2>
                <p>
                  @{formData.username}
                </p>
                <span className="tc-chip">
                  {user?.role || 'resident'}
                </span>
              </div>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="tc-primary-btn">
                Edit Profile
              </button>
            )}
          </div>
          <div className="tc-stat-grid">
            <div className="tc-stat-card"><div className="num">{trustScore || 0}</div><div className="label">Trust score</div></div>
            <div className="tc-stat-card"><div className="num">{formData.neighborhood ? '1' : '0'}</div><div className="label">Neighborhood set</div></div>
          </div>
        </section>

        <section className="tc-form-card">
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="+251911111111"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Neighborhood</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                disabled={!editing}
                placeholder="e.g., Bole District"
              />
            </div>

            {editing && (
              <div className="form-actions">
                <button type="button" className="tc-secondary-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="tc-primary-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>

          <div className="tc-danger-zone">
            <h3>
              Danger Zone
            </h3>
            <p>
              Once you delete your account, there is no going back. All your items and data will be removed.
            </p>
            <button onClick={handleDelete} className="tc-danger-btn small">
              Delete My Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;

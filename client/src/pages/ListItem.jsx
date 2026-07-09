import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createItem, getCategories } from '../services/api';

const ListItem = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    condition: 'good',
    max_loan_days: 7,
    rental_price_per_day: 0,
    pickup_instructions: '',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category_id', parseInt(formData.category_id));
      payload.append('condition', formData.condition);
      payload.append('max_loan_days', parseInt(formData.max_loan_days));
      payload.append('rental_price_per_day', parseFloat(formData.rental_price_per_day) || 0);
      payload.append('pickup_instructions', formData.pickup_instructions);
      payload.append('image_url', formData.image_url);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      await createItem(payload);
      toast.success('Item listed successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating item:', err);
      const errorMsg = err.response?.data?.details
        ? (Array.isArray(err.response.data.details)
          ? err.response.data.details.map(e => e.msg).join(', ')
          : err.response.data.details)
        : err.response?.data?.error || 'Failed to list item';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tc-page">
      <div className="tc-page-head">
        <div>
          <h1>List a <span>New Item</span></h1>
          <p>Share useful tools, equipment, and household gear with neighbors who need them.</p>
        </div>
      </div>

      <div className="tc-form-layout">
        <div className="tc-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g., Cordless Drill Set"
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the item, its features, and condition details..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange}>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="worn">Worn</option>
                </select>
              </div>
              <div className="form-group">
                <label>Max Loan Days (1-30) *</label>
                <input
                  type="number"
                  name="max_loan_days"
                  min="1"
                  max="30"
                  value={formData.max_loan_days}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rental Price Per Day ($)</label>
                <input
                  type="number"
                  name="rental_price_per_day"
                  min="0"
                  step="0.01"
                  value={formData.rental_price_per_day}
                  onChange={handleChange}
                  placeholder="e.g., 5.00 (optional)"
                />
                <small style={{ color: 'var(--text-muted)' }}>Leave empty or 0 for free rental</small>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <small style={{ color: 'var(--text-muted)' }}>Choose an image from your computer. PNG, JPG, WEBP, and GIF are supported.</small>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <small style={{ color: 'var(--text-muted)' }}>Optional: paste a public URL if you prefer not to upload</small>
            </div>

            <div className="form-group">
              <label>Pickup Instructions *</label>
              <textarea
                name="pickup_instructions"
                rows="3"
                value={formData.pickup_instructions}
                onChange={handleChange}
                required
                placeholder="Where and how should borrowers pick up this item?"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="tc-secondary-btn" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
              <button type="submit" className="tc-primary-btn" disabled={loading}>
                {loading ? 'Listing...' : 'List Item'}
              </button>
            </div>
          </form>
        </div>
        <aside className="tc-side-panel">
          <h2>Good listings get borrowed faster</h2>
          <p>Add a clear title, honest condition, max loan window, and pickup notes so neighbors know exactly what to expect.</p>
          <div className="tc-stat-grid single">
            <div className="tc-stat-card"><div className="num">4.8</div><div className="label">Average trust score</div></div>
            <div className="tc-stat-card"><div className="num">0$</div><div className="label">Free to list</div></div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ListItem;

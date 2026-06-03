// frontend/src/admin/ManageAccommodations.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './admin.css';
import { API_ORIGIN } from '../config';

export default function ManageAccommodations() {
  const [places, setPlaces] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    _id: null,
    place: '',
    name: '',
    type: 'homestay',
    address: '',
    phone: '',
    priceRange: '',
    available: true,
    coordsLat: '',
    coordsLng: '',
    imageFile: null,
    imagePreview: null,
  });

  // admin token stored on login
  const token = localStorage.getItem('admin_token') || localStorage.getItem('ts_token');

  useEffect(() => {
    loadPlaces();
    loadAccommodations();
    // eslint-disable-next-line
  }, []);

  async function loadPlaces() {
    try {
      const res = await axios.get(`${API_ORIGIN}/api/admin/places`, { headers: { Authorization: `Bearer ${token}` }});
      setPlaces(res.data || []);
    } catch (err) {
      console.error('loadPlaces error', err);
      alert('Failed to load places');
    }
  }

  async function loadAccommodations() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ORIGIN}/api/admin/accommodations`, { headers: { Authorization: `Bearer ${token}` }});
      setAccommodations(res.data || []);
    } catch (err) {
      console.error('loadAccommodations error', err);
      alert('Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      _id: null,
      place: '',
      name: '',
      type: 'homestay',
      address: '',
      phone: '',
      priceRange: '',
      available: true,
      coordsLat: '',
      coordsLng: '',
      imageFile: null,
      imagePreview: null,
    });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  }

  function handleEdit(item) {
    setForm({
      _id: item._id,
      place: item.place?._id || item.place,
      name: item.name || '',
      type: item.type || 'homestay',
      address: item.address || '',
      phone: item.phone || '',
      priceRange: item.priceRange || '',
      available: item.available === undefined ? true : !!item.available,
      coordsLat: item.coords?.lat || '',
      coordsLng: item.coords?.lng || '',
      imageFile: null,
      imagePreview: item.image || null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this accommodation?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/admin/accommodations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadAccommodations();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('place', form.place);
      fd.append('name', form.name);
      fd.append('type', form.type);
      fd.append('address', form.address);
      fd.append('phone', form.phone);
      fd.append('priceRange', form.priceRange);
      fd.append('available', form.available ? 'true' : 'false');
      if (form.coordsLat && form.coordsLng) {
        fd.append('coords', JSON.stringify({ lat: parseFloat(form.coordsLat), lng: parseFloat(form.coordsLng) }));
      }
      if (form.imageFile) fd.append('image', form.imageFile);

      if (form._id) {
        await axios.put(`${API_ORIGIN}/api/admin/accommodations/${form._id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        alert('Accommodation updated');
      } else {
        await axios.post(`${API_ORIGIN}/api/admin/accommodations`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        alert('Accommodation created');
      }
      resetForm();
      loadAccommodations();
    } catch (err) {
      console.error('save error', err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Accommodations</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24, maxWidth: 900 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Place</label><br />
          <select required value={form.place} onChange={e => setForm({ ...form, place: e.target.value })}>
            <option value="">Select place</option>
            {places.map(p => <option value={p._id} key={p._id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Name</label><br />
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Type</label><br />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="homestay">Homestay</option>
            <option value="hotel">Hotel</option>
            <option value="dharmshala">Dharmshala</option>
            <option value="guesthouse">Guesthouse</option>
          </select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Address</label><br />
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Phone</label><br />
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Price Range</label><br />
            <input value={form.priceRange} onChange={e => setForm({ ...form, priceRange: e.target.value })} placeholder="₹500-1500" />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Available</label><br />
          <select value={form.available ? 'true' : 'false'} onChange={e => setForm({ ...form, available: e.target.value === 'true' })}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Latitude</label><br />
            <input value={form.coordsLat} onChange={e => setForm({ ...form, coordsLat: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Longitude</label><br />
            <input value={form.coordsLng} onChange={e => setForm({ ...form, coordsLng: e.target.value })} />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Image</label><br />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {form.imagePreview && <div style={{ marginBottom: 8 }}>
          <img src={form.imagePreview} alt="preview" style={{ maxWidth: 240, maxHeight: 160, objectFit: 'cover' }} />
        </div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{form._id ? 'Update' : 'Create'}</button>
          <button type="button" onClick={resetForm}>Reset</button>
        </div>
      </form>

      <hr />

      <h3>Existing Accommodations</h3>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {accommodations.map(a => (
            <div key={a._id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, maxWidth: 1000 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: '0 0 160px' }}>
                  {a.image ? <img src={a.image} alt={a.name} style={{ width: 160, height: 100, objectFit: 'cover' }} /> : <div style={{ width: 160, height: 100, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{a.name}</h4>
                  <div style={{ color: '#666' }}>{a.place?.name}</div>
                  <div style={{ marginTop: 6 }}>{a.type} • {a.priceRange}</div>
                  <div style={{ marginTop: 6 }}>{a.address}</div>
                  <div style={{ marginTop: 6 }}>Phone: {a.phone}</div>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => handleEdit(a)}>Edit</button>
                    <button onClick={() => handleDelete(a._id)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

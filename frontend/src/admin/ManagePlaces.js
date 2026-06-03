// frontend/src/admin/ManagePlaces.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './admin.css';
import { API_ORIGIN } from '../config';

export default function ManagePlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    _id: null,
    code: '',
    name: '',
    description: '',
    coordsLat: '',
    coordsLng: '',
    languages: ''
  });

  const token = localStorage.getItem('admin_token') || localStorage.getItem('ts_token');

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    try {
      setLoading(true);
      if (!token) {
        alert('Admin token missing. Please login as admin.');
        return;
      }
      const res = await axios.get(`${API_ORIGIN}/api/admin/places`, { headers: { Authorization: `Bearer ${token}` } });
      setPlaces(res.data || []);
    } catch (err) {
      console.error('loadPlaces error', err?.response || err.message || err);
      alert('Failed to load places (check console).');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ _id: null, code: '', name: '', description: '', coordsLat: '', coordsLng: '', languages: '' });
  }

  function handleEdit(p) {
    setForm({
      _id: p._id,
      code: p.code || '',
      name: p.name || '',
      description: p.description || '',
      coordsLat: p.coords?.lat || '',
      coordsLng: p.coords?.lng || '',
      languages: (p.languages || []).join(', ')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (!token) { alert('Admin token missing.'); return; }

      const payload = {
        code: form.code,
        name: form.name,
        description: form.description,
        coords: (form.coordsLat || form.coordsLng) ? { lat: parseFloat(form.coordsLat || 0), lng: parseFloat(form.coordsLng || 0) } : undefined,
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (form._id) {
        await axios.put(`${API_ORIGIN}/api/admin/places/${form._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert('Place updated');
      } else {
        await axios.post(`${API_ORIGIN}/api/admin/places`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert('Place created');
      }

      resetForm();
      loadPlaces();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Save failed');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this place?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/admin/places/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadPlaces();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Places</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24, maxWidth: 900 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Code (short)</label><br />
          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="VAR / HAR" required />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Name</label><br />
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Varanasi" required />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Description</label><br />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
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
          <label>Languages (comma separated) e.g. en, hi</label><br />
          <input value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{form._id ? 'Update Place' : 'Create Place'}</button>
          <button type="button" onClick={resetForm}>Reset</button>
        </div>
      </form>

      <hr />

      <h3>Existing Places</h3>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {places.map(p => (
            <div key={p._id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, maxWidth: 1000 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.name}</strong> <small>({p.code})</small><br />
                  <div style={{ color: '#666' }}>{p.description}</div>
                  <div style={{ marginTop: 6 }}>Coords: {p.coords?.lat || '-'}, {p.coords?.lng || '-'}</div>
                  <div style={{ marginTop: 6 }}>Languages: {(p.languages || []).join(', ')}</div>
                </div>
                <div>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p._id)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

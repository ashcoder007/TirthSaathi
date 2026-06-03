// frontend/src/admin/ManageEvents.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './admin.css';
import { API_ORIGIN } from '../config';

function prettyDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString();
}

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    _id: null,
    place: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    locationDesc: '',
    tags: '',
    imageFile: null,
    imagePreview: null
  });

  const token = localStorage.getItem('admin_token') || localStorage.getItem('ts_token');

  useEffect(() => {
    loadPlaces();
    loadEvents();
  }, []);

  async function loadPlaces() {
    console.log('using token:', token);
    try {
      const res = await axios.get(`${API_ORIGIN}/api/admin/places`, { headers: { Authorization: `Bearer ${token}` } });
      setPlaces(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load places');
    }
  }

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ORIGIN}/api/admin/events`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      _id: null,
      place: '',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      locationDesc: '',
      tags: '',
      imageFile: null,
      imagePreview: null
    });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  }

  function handleEdit(ev) {
    setForm({
      _id: ev._id,
      place: ev.place?._id || ev.place,
      title: ev.title || '',
      description: ev.description || '',
      startDate: ev.startDate ? new Date(ev.startDate).toISOString().slice(0,16) : '',
      endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0,16) : '',
      locationDesc: ev.locationDesc || '',
      tags: (ev.tags || []).join(', '),
      imageFile: null,
      imagePreview: ev.image || null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('place', form.place);
      fd.append('title', form.title);
      fd.append('description', form.description);
      if (form.startDate) fd.append('startDate', new Date(form.startDate).toISOString());
      if (form.endDate) fd.append('endDate', new Date(form.endDate).toISOString());
      fd.append('locationDesc', form.locationDesc || '');
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t=>t.trim()).filter(Boolean)));
      if (form.imageFile) fd.append('image', form.imageFile);

      if (form._id) {
        // update
        await axios.put(`${API_ORIGIN}/api/admin/events/${form._id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        alert('Event updated');
      } else {
        // create
        await axios.post(`${API_ORIGIN}/api/admin/events`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        alert('Event created');
      }

      resetForm();
      loadEvents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Save failed');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadEvents();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Events</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24, maxWidth: 900 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Place</label><br />
          <select required value={form.place} onChange={e=>setForm({...form, place: e.target.value})}>
            <option value="">Choose place</option>
            {places.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Title</label><br />
          <input required value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Description</label><br />
          <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={3} />
        </div>

        <div style={{ display:'flex', gap: 12, marginBottom: 8 }}>
          <div>
            <label>Start</label><br />
            <input type="datetime-local" value={form.startDate} onChange={e=>setForm({...form, startDate: e.target.value})} />
          </div>
          <div>
            <label>End</label><br />
            <input type="datetime-local" value={form.endDate} onChange={e=>setForm({...form, endDate: e.target.value})} />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Location (short)</label><br />
          <input value={form.locationDesc} onChange={e=>setForm({...form, locationDesc: e.target.value})} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Tags (comma separated)</label><br />
          <input value={form.tags} onChange={e=>setForm({...form, tags: e.target.value})} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Image</label><br />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {form.imagePreview && (
          <div style={{ marginBottom: 8 }}>
            <img src={form.imagePreview} alt="preview" style={{ maxWidth: 240, maxHeight: 160, objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{form._id ? 'Update Event' : 'Create Event'}</button>
          <button type="button" onClick={resetForm}>Reset</button>
        </div>
      </form>

      <hr />

      <h3>Existing Events</h3>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {events.map(ev => (
            <div key={ev._id} style={{ border:'1px solid #ddd', padding:12, borderRadius:8, maxWidth:1000 }}>
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ flex:'0 0 160px' }}>
                  {ev.image ? <img src={ev.image} alt={ev.title} style={{ width:160, height:100, objectFit:'cover' }} /> : <div style={{ width:160, height:100, background:'#f0f0f0', display:'flex',alignItems:'center',justifyContent:'center' }}>No Image</div>}
                </div>
                <div style={{ flex:1 }}>
                  <h4 style={{ margin:0 }}>{ev.title}</h4>
                  <div style={{ color:'#666' }}>{ev.place?.name}</div>
                  <div style={{ marginTop:6 }}>{ev.description}</div>
                  <div style={{ marginTop:6, color:'#444' }}><b>{prettyDate(ev.startDate)}</b> → {prettyDate(ev.endDate)}</div>
                  <div style={{ marginTop:6 }}>Tags: {(ev.tags || []).join(', ')}</div>
                  <div style={{ marginTop:8 }}>
                    <button onClick={()=>handleEdit(ev)}>Edit</button>
                    <button onClick={()=>handleDelete(ev._id)} style={{ marginLeft:8, color:'red' }}>Delete</button>
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

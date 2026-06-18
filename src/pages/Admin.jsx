import { useState, useEffect } from 'react';
import { getCards, saveCard, deleteCard } from '../db';

export default function Admin() {
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    name: '', title: '', center: '', phone: '', email: '', address: '', whatsapp: ''
  });

  const fetchCards = async () => {
    const data = await getCards();
    setCards(data);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData(card);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      await deleteCard(id);
      fetchCards(); // Refresh list
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveCard(formData);
    fetchCards(); // Refresh list
    setEditingCard(null);
    setFormData({ name: '', title: '', center: '', phone: '', email: '', address: '', whatsapp: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-container admin-page">
      <h1 className="page-title">Admin Dashboard (Cloud Data)</h1>

      <div className="admin-layout">
        <div className="admin-form-box">
          <h3>{editingCard ? 'Edit Card' : 'Add New Card'}</h3>
          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <input name="title" placeholder="Title / Position" value={formData.title} onChange={handleChange} required />
            <input name="center" placeholder="Medical Center Name" value={formData.center} onChange={handleChange} required />
            <input name="phone" placeholder="Phone (e.g., +998-99-...)" value={formData.phone} onChange={handleChange} required />
            <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required />
            <input name="whatsapp" placeholder="WhatsApp Number (digits only)" value={formData.whatsapp} onChange={handleChange} required />
            <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} rows="3" required />
            
            <div className="form-buttons">
              <button type="submit" className="btn btn-save">{editingCard ? 'Update' : 'Add Card'}</button>
              {editingCard && <button type="button" className="btn btn-cancel" onClick={() => { setEditingCard(null); setFormData({ name: '', title: '', center: '', phone: '', email: '', address: '', whatsapp: '' }); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="admin-list-box">
          <h3>Existing Cards ({cards.length})</h3>
          <div className="list-items">
            {cards.map(card => (
              <div key={card.id} className="list-item">
                <div>
                  <strong>{card.name}</strong>
                  <small>{card.title}</small>
                </div>
                <div className="list-actions">
                  <button onClick={() => handleEdit(card)} className="btn btn-edit">Edit</button>
                  <button onClick={() => handleDelete(card.id)} className="btn btn-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
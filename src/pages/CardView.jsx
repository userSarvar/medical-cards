import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getCards } from '../db';

export default function CardView() {
  const { id } = useParams();
  const [card, setCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const allCards = await getCards();
      setCard(allCards.find(c => c.id === id));
    };
    fetchData();
  }, [id]);

  if (!card) return <div className="page-container"><h2>Loading or Card not found...</h2><Link to="/">Go Home</Link></div>;

  const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.name}\nTEL:${card.phone}\nEMAIL:${card.email}\nEND:VCARD`;

  return (
    <div className="page-container">
      <div className="business-card full-card">
        <header className="card-header">
          <div className="logo-icon">🏥</div>
          <div className="center-name">{card.center}</div>
        </header>

        <div className="card-body">
          <div className="info-section">
            <h1 className="doc-name">{card.name}</h1>
            <h2 className="doc-title">{card.title}</h2>
            
            <div className="contact-list">
              <a href={`tel:${card.phone.replace(/-/g, '')}`} className="contact-item">
                <span className="icon">📞</span> {card.phone}
              </a>
              <a href={`mailto:${card.email}`} className="contact-item">
                <span className="icon">✉️</span> {card.email}
              </a>
              <div className="contact-item">
                <span className="icon"></span> {card.address}
              </div>
            </div>

            <div className="quick-actions">
              <a href={`tel:${card.phone.replace(/-/g, '')}`} className="btn btn-call">Call</a>
              <a href={`https://wa.me/${card.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp">WhatsApp</a>
              <a href={`mailto:${card.email}`} className="btn btn-email">Email</a>
            </div>
          </div>

          <div className="qr-section">
            <div className="qr-box">
              <QRCodeSVG value={vCardData} size={140} />
              <p>Save Contact</p>
            </div>
            <div className="qr-box">
              <QRCodeSVG value={`https://wa.me/${card.whatsapp}`} size={140} />
              <p>WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
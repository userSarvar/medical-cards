import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCards } from "../db";
import { FaInstagram, FaTelegram, FaYoutube, FaTiktok, FaFacebook, FaGlobe, FaWhatsapp } from "react-icons/fa";

const SOCIAL_ICONS = {
  instagram: FaInstagram,
  telegram: FaTelegram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  facebook: FaFacebook,
  website: FaGlobe,
  whatsapp: FaWhatsapp,
};

export default function Home() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCards().then(data => {
      setCards(data.filter(c => c.active !== false));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-screen">Yuklanmoqda...</div>;

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Biznes Kartalar</h1>
        <p>Barcha kompaniyalar ro'yxati</p>
      </header>

      <div className="home-grid">
        {cards.map(card => (
          <Link to={`/cards/${card.id}`} key={card.id} className="home-card">
            <div className="home-card-logo">
              {card.logoUrl
                ? <img src={card.logoUrl} alt={card.name} />
                : <div className="logo-fallback">{card.name[0]}</div>
              }
            </div>
            <div className="home-card-info">
              <h2>{card.name}</h2>
              {card.description && <p>{card.description}</p>}
              {card.phone && <span className="home-card-phone">{card.phone}</span>}
              <div className="home-card-socials">
                {Object.entries(card.socials || {}).filter(([, v]) => v).map(([key]) => {
                  const Icon = SOCIAL_ICONS[key];
                  return Icon ? <Icon key={key} className={`social-icon icon-${key}`} /> : null;
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="empty-state">
          <p>Hozircha kartalar yo'q.</p>
        </div>
      )}
    </div>
  );
}
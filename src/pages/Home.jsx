import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCards } from '../db';

export default function Home() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCards();
      setCards(data);
    };
    fetchData();
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Our Specialists</h1>
      <div className="cards-grid">
        {cards.map(card => (
          <Link to={`/card/${card.id}`} key={card.id} className="card-preview">
            <div className="card-icon">👨‍️</div>
            <h3>{card.name}</h3>
            <p>{card.title}</p>
            <span className="view-btn">View Business Card →</span>
          </Link>
        ))}
        {cards.length === 0 && <p>No business cards found. Please add one in the Admin panel.</p>}
      </div>
    </div>
  );
}
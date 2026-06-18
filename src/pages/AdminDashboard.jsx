import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { QRCodeSVG } from "qrcode.react";
import { auth } from "../firebase";
import { getCards, deleteCard } from "../db";

const BASE_URL = window.location.origin;

function generateVCard(card) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.name}`,
    card.phone ? `TEL:${card.phone}` : "",
    card.address ? `ADR:;;${card.address};;;;` : "",
    card.socials?.instagram ? `URL:https://instagram.com/${card.socials.instagram}` : "",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\n");
}

export default function AdminDashboard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCard, setQrCard] = useState(null);
  const navigate = useNavigate();

  const fetchCards = async () => {
    setLoading(true);
    const data = await getCards();
    setCards(data);
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  const handleDelete = async (card) => {
    if (!window.confirm(`"${card.name}" kartasini o'chirmoqchimisiz?`)) return;
    await deleteCard(card.id, card.logoUrl);
    fetchCards();
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const downloadVCard = (card) => {
    const blob = new Blob([generateVCard(card)], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary" onClick={() => navigate("/admin/new")}>
            + Yangi karta
          </button>
          <button className="btn btn-logout" onClick={handleLogout}>
            Chiqish
          </button>
        </div>
      </header>

      <div className="admin-content">
        {loading ? (
          <p className="loading-text">Yuklanmoqda...</p>
        ) : cards.length === 0 ? (
          <div className="empty-state">
            <p>Hozircha kartalar yo'q.</p>
            <button className="btn btn-primary" onClick={() => navigate("/admin/new")}>
              Birinchi kartani qo'shing
            </button>
          </div>
        ) : (
          <div className="cards-table-wrap">
            <table className="cards-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Nomi</th>
                  <th>Telefon</th>
                  <th>Manzil</th>
                  <th>Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {cards.map(card => (
                  <tr key={card.id}>
                    <td>
                      {card.logoUrl ? (
                        <img src={card.logoUrl} alt={card.name} className="table-logo" />
                      ) : (
                        <div className="table-logo-placeholder">?</div>
                      )}
                    </td>
                    <td>
                      <strong>{card.name}</strong>
                      {card.description && <small className="table-desc">{card.description}</small>}
                    </td>
                    <td>{card.phone || "—"}</td>
                    <td>{card.address || "—"}</td>
                    <td>
                      <div className="table-actions">
                        <a
                          href={`${BASE_URL}/cards/${card.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-view"
                        >
                          Ko'rish
                        </a>
                        <button
                          className="btn btn-sm btn-qr"
                          onClick={() => setQrCard(card)}
                        >
                          QR
                        </button>
                        <button
                          className="btn btn-sm btn-vcf"
                          onClick={() => downloadVCard(card)}
                        >
                          vCard
                        </button>
                        <button
                          className="btn btn-sm btn-edit"
                          onClick={() => navigate(`/admin/edit/${card.id}`)}
                        >
                          Tahrir
                        </button>
                        <button
                          className="btn btn-sm btn-delete"
                          onClick={() => handleDelete(card)}
                        >
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrCard && (
        <div className="modal-overlay" onClick={() => setQrCard(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{qrCard.name}</h2>
            <p className="modal-url">{BASE_URL}/cards/{qrCard.id}</p>
            <div className="qr-container">
              <QRCodeSVG
                value={`${BASE_URL}/cards/${qrCard.id}`}
                size={220}
                bgColor="#ffffff"
                fgColor="#1a1a2e"
                level="H"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-vcf" onClick={() => { downloadVCard(qrCard); setQrCard(null); }}>
                vCard Yuklab olish
              </button>
              <button className="btn btn-cancel" onClick={() => setQrCard(null)}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
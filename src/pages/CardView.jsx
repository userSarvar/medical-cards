import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCard, parseLatLng } from "../db";
import {
  FaInstagram, FaTelegram, FaYoutube, FaTiktok,
  FaFacebook, FaGlobe, FaWhatsapp, FaPhone, FaMapMarkerAlt,
  FaClock, FaBan
} from "react-icons/fa";

const SOCIALS_CONFIG = [
  { key: "instagram", Icon: FaInstagram, label: "Instagram", getUrl: v => `https://instagram.com/${v}` },
  { key: "telegram",  Icon: FaTelegram,  label: "Telegram",  getUrl: v => v.startsWith("+") ? `https://t.me/${v.replace("+", "")}` : `https://t.me/${v}` },
  { key: "whatsapp",  Icon: FaWhatsapp,  label: "WhatsApp",  getUrl: v => `https://wa.me/${v.replace(/\D/g, "")}` },
  { key: "youtube",   Icon: FaYoutube,   label: "YouTube",   getUrl: v => v.startsWith("http") ? v : `https://youtube.com/${v}` },
  { key: "tiktok",    Icon: FaTiktok,    label: "TikTok",    getUrl: v => `https://tiktok.com/@${v}` },
  { key: "facebook",  Icon: FaFacebook,  label: "Facebook",  getUrl: v => v.startsWith("http") ? v : `https://facebook.com/${v}` },
  { key: "website",   Icon: FaGlobe,     label: "Veb-sayt",  getUrl: v => v.startsWith("http") ? v : `https://${v}` },
];

const DAYS_UZ = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

function getWorkingDaysText(days) {
  if (!days || days.length === 0) return "";
  const sorted = [...days].sort((a, b) => a - b);
  let isConsec = true;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) { isConsec = false; break; }
  }
  if (isConsec && sorted.length > 2) {
    return `${DAYS_UZ[sorted[0]]} – ${DAYS_UZ[sorted[sorted.length - 1]]}`;
  }
  return sorted.map(d => DAYS_UZ[d].slice(0, 2)).join(", ");
}

function getThemeVars(theme) {
  if (!theme || theme.mode === "white") return {};
  if (theme.mode === "black") return {
    "--cv-bg":       "#0f0f0f",
    "--cv-card-bg":  "#1a1a1a",
    "--cv-text":     "#f3f4f6",
    "--cv-text-2":   "#9ca3af",
    "--cv-border":   "#2d2d2d",
    "--cv-btn":      "#2563eb",
    "--cv-icon":     "#60a5fa",
  };
  return {
    "--cv-bg":      theme.bg       || "#f9fafb",
    "--cv-card-bg": theme.cardBg   || "#ffffff",
    "--cv-text":    theme.textColor|| "#111827",
    "--cv-btn":     theme.btnColor || "#2563eb",
    "--cv-icon":    theme.iconColor|| "#2563eb",
  };
}



export default function CardView() {
  const { id } = useParams();
  const [card, setCard]       = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    getCard(id).then(data => {
      setCard(data);
      setLoading(false);
      if (data && data.active !== false) {
        document.title = data.name;
      }
    });
  }, [id]);

  // Load Google Font
  useEffect(() => {
    if (!card || card.active === false) return;
    const font = card.theme?.font || "Inter";
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    link.rel  = "stylesheet";
    document.head.appendChild(link);
  }, [card]);

  if (loading) return <div className="loading-screen">Yuklanmoqda...</div>;

  if (!card) return (
    <div className="not-found">
      <h2>Karta topilmadi</h2>
      <Link to="/">Bosh sahifaga qaytish</Link>
    </div>
  );

  // ── DISABLED CARD ──
  if (card.active === false) {
    return (
      <div className="card-disabled-page">
        <div className="card-disabled-box">
          <FaBan className="card-disabled-icon" />
          <h2>Karta o'chirilgan</h2>
          <p>Bu biznes karta hozirda mavjud emas yoki o'chirib qo'yilgan.</p>
          <Link to="/" className="card-disabled-link">Bosh sahifaga qaytish →</Link>
        </div>
      </div>
    );
  }

  // ── ACTIVE CARD ──
  const activeSocials = SOCIALS_CONFIG.filter(s => card.socials?.[s.key]);
  const coords        = parseLatLng(card.location?.mapsUrl);
  const googleMapsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    : null;

  return (
    <div
      className="card-view-page"
      style={{
        ...getThemeVars(card.theme),
        fontFamily: `'${card.theme?.font || "Inter"}', sans-serif`,
      }}
    >
      <div className="card-view-wrap">

        {/* Header */}
        <div className={`cv-header ${card.coverUrl ? "cv-header-has-cover" : ""}`}>
          {card.coverUrl && (
            <div className="cv-cover" style={{ backgroundImage: `url(${card.coverUrl})` }}>
              <div className="cv-cover-overlay" />
            </div>
          )}
          <div className="cv-header-content">
            {card.logoUrl
              ? <img src={card.logoUrl} alt={card.name} className="cv-logo" />
              : <div className="cv-logo-fallback">{card.name[0]}</div>
            }
            <h1 className="cv-name">{card.name}</h1>
            {card.description && <p className="cv-desc">{card.description}</p>}
          </div>
        </div>

        {/* Contact Info */}
        <div className="cv-section">
          {card.phone && (
            <a href={`tel:${card.phone.replace(/\s/g, "")}`} className="cv-contact-row">
              <FaPhone className="cv-contact-icon" />
              <span>{card.phone}</span>
            </a>
          )}
          {card.address && (
            <div className="cv-contact-row">
              <FaMapMarkerAlt className="cv-contact-icon" />
              <span>{card.address}</span>
            </div>
          )}
          {card.workingHours && (
            <div className="cv-contact-row">
              <FaClock className="cv-contact-icon" />
              <span>
                {getWorkingDaysText(card.workingHours.days)},{" "}
                {card.workingHours.from} – {card.workingHours.to}
              </span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {activeSocials.length > 0 && (
          <div className="cv-socials">
            {activeSocials.map(({ key, Icon, label, getUrl }) => (
              <a
                key={key}
                href={getUrl(card.socials[key])}
                target="_blank"
                rel="noreferrer"
                className={`cv-social-btn social-btn-${key}`}
              >
                <Icon className="cv-social-icon" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Partner Logos */}
        {form => null /* placeholder */}
        {(() => {
          const logos = card.partnerLogos || [];
          const max   = card.partnerLogosMax ?? 3;
          const shown = logos.slice(0, max);
          if (shown.length === 0) return null;
          return (
            <div className="cv-section cv-partners">
              <div className="cv-partners-grid">
                {shown.map((p, i) =>
                  p.link ? (
                    <a key={i} href={p.link} target="_blank" rel="noreferrer" className="cv-partner-item" title={p.label}>
                      <img src={p.logoUrl} alt={p.label || `Partner ${i + 1}`} />
                    </a>
                  ) : (
                    <div key={i} className="cv-partner-item" title={p.label}>
                      <img src={p.logoUrl} alt={p.label || `Partner ${i + 1}`} />
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })()}

        {/* Call CTA */}
        {card.phone && (
          <div className="cv-cta">
            <a href={`tel:${card.phone.replace(/\s/g, "")}`} className="btn-call-big">
              <FaPhone /> Qo'ng'iroq qilish
            </a>
          </div>
        )}

        {/* Navigation CTA */}
        {googleMapsUrl && (
          <div className="cv-cta">
            <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="btn-nav-big">
              <FaMapMarkerAlt /> Yo'nalish olish
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
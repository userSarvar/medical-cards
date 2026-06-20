
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCard, parseLatLng } from "../db";
import {
  FaInstagram, FaTelegram, FaYoutube, FaTiktok,
  FaFacebook, FaGlobe, FaWhatsapp, FaPhone, FaMapMarkerAlt,
  FaClock
} from "react-icons/fa";

const SOCIALS_CONFIG = [
  { key: "instagram", Icon: FaInstagram, label: "Instagram", getUrl: v => `https://instagram.com/${v}` },
  { key: "telegram", Icon: FaTelegram, label: "Telegram", getUrl: v => v.startsWith("+") ? `https://t.me/${v.replace("+", "")}` : `https://t.me/${v}` },
  { key: "whatsapp", Icon: FaWhatsapp, label: "WhatsApp", getUrl: v => `https://wa.me/${v.replace(/\D/g, "")}` },
  { key: "youtube", Icon: FaYoutube, label: "YouTube", getUrl: v => v.startsWith("http") ? v : `https://youtube.com/${v}` },
  { key: "tiktok", Icon: FaTiktok, label: "TikTok", getUrl: v => `https://tiktok.com/@${v}` },
  { key: "facebook", Icon: FaFacebook, label: "Facebook", getUrl: v => v.startsWith("http") ? v : `https://facebook.com/${v}` },
  { key: "website", Icon: FaGlobe, label: "Veb-sayt", getUrl: v => v.startsWith("http") ? v : `https://${v}` },
];

const DAYS_UZ = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];



function getWorkingDaysText(days) {
  if (!days || days.length === 0) return "";
  const sorted = [...days].sort((a, b) => a - b);
  // Check if consecutive
  let isConsec = true;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) { isConsec = false; break; }
  }
  if (isConsec && sorted.length > 2) {
    return `${DAYS_UZ[sorted[0]]} – ${DAYS_UZ[sorted[sorted.length - 1]]}`;
  }
  return sorted.map(d => DAYS_UZ[d].slice(0, 2)).join(", ");
}

export default function CardView() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    getCard(id).then(data => {
      setCard(data);
      setLoading(false);
      if (data) {
        document.title = data.name;
      }
    });
  }, [id]);


  useEffect(() => {
    if (!card) return;
    const font = card.theme?.font || "Inter";
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
}, [card]);


  if (loading) return <div className="loading-screen">Yuklanmoqda...</div>;
  if (!card) return (
    <div className="not-found">
      <h2>Karta topilmadi</h2>
      <Link to="/">Bosh sahifaga qaytish</Link>
    </div>
  );

  const activeSocials = SOCIALS_CONFIG.filter(s => card.socials?.[s.key]);

  function getThemeVars(theme) {
    if (!theme || theme.mode === "white") return {};
    if (theme.mode === "black") return {
      "--cv-text": theme.textColor || "#f3f4f6",
      "--cv-bg": "#0f0f0f",
      "--cv-card-bg": "#1a1a1a",
      "--cv-text": "#f3f4f6",
      "--cv-text-2": "#9ca3af",
      "--cv-border": "#2d2d2d",
      "--cv-btn": "#2563eb",
      "--cv-icon": "#60a5fa",
    };
    return {
      "--cv-text": theme.textColor || "#111827",
      "--cv-bg": theme.bg || "#f9fafb",
      "--cv-card-bg": theme.cardBg || "#ffffff",
      "--cv-btn": theme.btnColor || "#2563eb",
      "--cv-icon": theme.iconColor || "#2563eb",
    };
  }
  const coords = parseLatLng(card.location?.mapsUrl);

  const NAV_APPS = coords ? [
    {
      name: "Google Maps",
      icon: "🗺️",
      url: `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
    },
    {
      name: "Yandex Navigator",
      icon: "🧭",
      url: `yandexnavi://build_route_on_map?lat_to=${coords.lat}&lon_to=${coords.lng}`,
      fallback: `https://yandex.com/maps/?rtext=~${coords.lat},${coords.lng}&rtt=auto`,
    },
    {
      name: "Yandex Maps",
      icon: "🗾",
      url: `yandexmaps://maps.yandex.ru/?pt=${coords.lng},${coords.lat}&z=16`,
      fallback: `https://yandex.com/maps/?pt=${coords.lng},${coords.lat}&z=16`,
    },
    {
      name: "2GIS",
      icon: "📍",
      url: `dgis://2gis.ru/routeSearch/rsType/car/to/${coords.lng},${coords.lat}`,
      fallback: `https://2gis.ru/directions/points/?finish=${coords.lng},${coords.lat}`,
    },
    {
      name: "Apple Maps",
      icon: "🍎",
      url: `maps://maps.apple.com/?daddr=${coords.lat},${coords.lng}`,
      fallback: `https://maps.apple.com/?daddr=${coords.lat},${coords.lng}`,
    },
  ] : [];

  const openNav = (app) => {
    if (app.fallback) {
      // try deep link, fall back after 1.5s
      window.location.href = app.url;
      setTimeout(() => { window.open(app.fallback, "_blank"); }, 1500);
    } else {
      window.open(app.url, "_blank");
    }
    setNavOpen(false);
  };


  return (
    <div className="card-view-page" style={{ ...getThemeVars(card.theme), fontFamily: `'${card.theme?.font || "Inter"}', sans-serif` }}>
      <div className="card-view-wrap">

        {/* Header */}
        <div className="cv-header">
          {card.logoUrl ? (
            <img src={card.logoUrl} alt={card.name} className="cv-logo" />
          ) : (
            <div className="cv-logo-fallback">{card.name[0]}</div>
          )}
          <h1 className="cv-name">{card.name}</h1>
          {card.description && <p className="cv-desc">{card.description}</p>}
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

        {/* Call to action */}
        {card.phone && (
          <div className="cv-cta">
            <a href={`tel:${card.phone.replace(/\s/g, "")}`} className="btn-call-big">
              <FaPhone /> Qo'ng'iroq qilish
            </a>
          </div>
        )}
        {/* Location & Navigation */}
        {card.location?.address && (
          <div className="cv-cta">
            {coords && (
              <button className="btn-nav-big" onClick={() => setNavOpen(true)}>
                <FaMapMarkerAlt /> Yo'nalish olish
              </button>
          )}
        </div>
      )}

      {/* Nav App Sheet */}
      {navOpen && (
        <div className="nav-overlay" onClick={() => setNavOpen(false)}>
          <div className="nav-sheet" onClick={e => e.stopPropagation()}>
            <div className="nav-sheet-handle" />
            <h3>Navigatsiya ilovasini tanlang</h3>
            <p className="nav-address">{card.location.address}</p>
            <div className="nav-apps">
              {NAV_APPS.map(app => (
                <button key={app.name} className="nav-app-btn" onClick={() => openNav(app)}>
                  <span className="nav-app-icon">{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
            <button className="nav-cancel" onClick={() => setNavOpen(false)}>Bekor qilish</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
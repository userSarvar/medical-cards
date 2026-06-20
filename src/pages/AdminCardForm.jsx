import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCard, saveCard, parseLatLng } from "../db";

const SOCIALS = [
  { key: "instagram", label: "Instagram", placeholder: "username" },
  { key: "telegram", label: "Telegram", placeholder: "username yoki +998..." },
  { key: "youtube", label: "YouTube", label: "YouTube", placeholder: "channel URL" },
  { key: "tiktok", label: "TikTok", placeholder: "username" },
  { key: "facebook", label: "Facebook", placeholder: "page URL yoki username" },
  { key: "website", label: "Veb-sayt", placeholder: "https://example.com" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+998901234567" },
];

const DAYS_UZ = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

const emptyForm = {
  name: "",
  description: "",
  phone: "",
  address: "",
  logoUrl: "",
  active: true,
  customId: "",
  workingHours: { from: "09:00", to: "18:00", days: [0, 1, 2, 3, 4] },
  socials: {},
  theme: { mode: "white", bg: "", cardBg: "", btnColor: "", iconColor: "", textColor: "", font: "Inter" },
  location: { address: "", mapsUrl: "" },
};

export default function AdminCardForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getCard(id).then(card => {
      if (!card) return navigate("/admin");
      setForm({ ...emptyForm, ...card, workingHours: card.workingHours || emptyForm.workingHours, socials: card.socials || {}, theme: card.theme || { mode: "white", bg: "", cardBg: "", btnColor: "", iconColor: "" } || emptyForm.theme, location: card.location || { address: "", mapsUrl: "" }, });
      setLogoPreview(card.logoUrl || "");
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSocialChange = (key, value) => {
    setForm(f => ({ ...f, socials: { ...f.socials, [key]: value } }));
  };

  const handleHoursChange = (field, value) => {
    setForm(f => ({ ...f, workingHours: { ...f.workingHours, [field]: value } }));
  };
  

  const toggleDay = (dayIndex) => {
    const days = form.workingHours.days.includes(dayIndex)
      ? form.workingHours.days.filter(d => d !== dayIndex)
      : [...form.workingHours.days, dayIndex];
    setForm(f => ({ ...f, workingHours: { ...f.workingHours, days } }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await saveCard({ ...form, id: id || undefined }, logoFile);
      console.log("Saving:", { ...form, id: id || undefined });
      navigate("/admin");
    } catch (err) {
      setError("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="form-page-header">
        <button className="btn btn-back" onClick={() => navigate("/admin")}>← Orqaga</button>
        <h1>{isEdit ? "Kartani tahrirlash" : "Yangi karta qo'shish"}</h1>
      </div>

      <form className="card-form" onSubmit={handleSubmit}>

        {/* Logo */}
        <section className="form-section">
          <h2>Logo</h2>
          <div className="logo-upload-area">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="logo-preview" />
            ) : (
              <div className="logo-placeholder">Logo yo'q</div>
            )}
            <label className="btn btn-upload">
              Logo yuklash
              <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
            </label>
          </div>
          <h2>Holati</h2>
          <div className="form-field full-width">
            <div className="toggle-row">
              <div
                className={`toggle ${form.active ? "on" : ""}`}
                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              >
                <div className="toggle-knob" />
              </div>
              <span>{form.active ? "Faol" : "Nofaol"}</span>
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section className="form-section">
          <h2>Asosiy ma'lumotlar</h2>
          <div className="form-grid">
            <div className="form-field">
              <label>Kompaniya nomi *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Masalan: Uzum Market" />
            </div>
            <div className="form-field">
              <label>Telefon raqami *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+998 90 123 45 67" />
            </div>
            <div className="form-field full-width">
              <label>Tavsif</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Kompaniya haqida qisqacha..." />
            </div>
            <div className="form-field full-width">
              <label>Manzil</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Toshkent, Chilonzor tumani..." />
            </div>
          </div>
        </section>

        {/* Working Hours */}
        <section className="form-section">
          <h2>Ish vaqti</h2>
          <div className="hours-row">
            <div className="form-field">
              <label>Boshlanish</label>
              <input type="time" value={form.workingHours.from} onChange={e => handleHoursChange("from", e.target.value)} />
            </div>
            <span className="hours-sep">—</span>
            <div className="form-field">
              <label>Tugash</label>
              <input type="time" value={form.workingHours.to} onChange={e => handleHoursChange("to", e.target.value)} />
            </div>
          </div>
          <div className="days-row">
            {DAYS_UZ.map((day, i) => (
              <button
                type="button"
                key={i}
                className={`day-btn ${form.workingHours.days.includes(i) ? "active" : ""}`}
                onClick={() => toggleDay(i)}
              >
                {day}
              </button>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section className="form-section">
          <h2>Ijtimoiy tarmoqlar</h2>
          <div className="form-grid">
            {SOCIALS.map(s => (
              <div className="form-field" key={s.key}>
                <label>{s.label}</label>
                <input
                  value={form.socials[s.key] || ""}
                  onChange={e => handleSocialChange(s.key, e.target.value)}
                  placeholder={s.placeholder}
                />
              </div>
            ))}
          </div>
        </section>
        {/* Location */}
        <section className="form-section">
          <h2>Manzil va Navigatsiya</h2>
          <div className="form-grid">
            <div className="form-field full-width">
            <label>Ko'rsatiladigan manzil</label>
            <input
              name="locationAddress"
              value={form.location?.address || ""}
              onChange={e => setForm(f => ({ ...f, location: { ...f.location, address: e.target.value } }))}
              placeholder="Toshkent, Chilonzor tumani, 5-uy"
            />
          </div>
          <div className="form-field full-width">
            <label>Google Maps havolasi</label>
            <input
              name="locationUrl"
              value={form.location?.mapsUrl || ""}
              onChange={e => setForm(f => ({ ...f, location: { ...f.location, mapsUrl: e.target.value } }))}
              placeholder="https://maps.google.com/..."
            />
            {form.location?.mapsUrl && (() => {
              const coords = parseLatLng(form.location.mapsUrl);
              return coords
                ? <small style={{ color: "#16a34a", marginTop: 4, display: "block" }}>✓ Koordinatlar topildi: {coords.lat}, {coords.lng}</small>
                : <small style={{ color: "#ef4444", marginTop: 4, display: "block" }}>✗ Koordinatlar topilmadi. To'g'ri Google Maps havolasini kiriting</small>
            })()}
          </div>
        </div>
      </section>

        {/* Theme */}
        <section className="form-section">
          <h2>Tema</h2>
          <div className="theme-options">
            {["white", "black", "custom"].map(mode => (
              <button
                type="button"
                key={mode}
                className={`theme-opt ${form.theme?.mode === mode ? "active" : ""}`}
                onClick={() => setForm(f => ({ ...f, theme: { ...f.theme, mode } }))}
              >
                <span className={`theme-dot theme-dot-${mode}`} />
                {mode === "white" ? "Oq" : mode === "black" ? "Qora" : "Custom"}
              </button>
            ))}
          </div>

          {form.theme?.mode === "custom" && (
            <div className="form-grid" style={{ marginTop: 16 }}>
              {[
                { key: "bg", label: "Sahifa foni" },
                { key: "cardBg", label: "Karta foni" },
                { key: "btnColor", label: "Tugma rangi" },
                { key: "iconColor", label: "Ikonka rangi" },
                { key: "textColor", label: "Matn rangi" },
              ].map(({ key, label }) => (
                <div className="form-field" key={key}>
                  <label>{label}</label>
                  <div className="color-pick-row">
                    <input
                      type="color"
                      value={form.theme?.[key] || "#ffffff"}
                      onChange={e => setForm(f => ({ ...f, theme: { ...f.theme, [key]: e.target.value } }))}
                      className="color-input"
                    />
                    <span className="color-hex">{form.theme?.[key] || "#ffffff"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Font picker — always visible regardless of theme mode */}
          <div className="form-field" style={{ marginTop: 16 }}>
            <label>Shrift (Font)</label>
            <select
              value={form.theme?.font || "Inter"}
              onChange={e => setForm(f => ({ ...f, theme: { ...f.theme, font: e.target.value } }))}
            >
              {[
                "Inter", "Roboto", "Open Sans", "Montserrat", "Poppins",
                "Lato", "Nunito", "Raleway", "Playfair Display", "Merriweather",
                "Ubuntu", "Oswald", "Source Sans 3", "PT Sans", "Noto Sans",
              ].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </section>
        <section>
          <div className="form-field full-width">
            <label>Maxsus ID (ixtiyoriy)</label>
            <input
              name="customId"
              value={form.customId || ""}
              onChange={handleChange}
              placeholder="masalan: remax yoki uzum-market"
              disabled={isEdit}
            />
            {!isEdit && <small style={{color:"var(--text-2)"}}>Bir marta belgilanadi, keyinchalik o'zgartirib bo'lmaydi</small>}
          </div>

          
        </section>

        {error && <p className="error-msg">{error}</p>}

        <div className="form-submit-row">
          <button type="button" className="btn btn-cancel" onClick={() => navigate("/admin")}>Bekor qilish</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </form>
    </div>
  );
}
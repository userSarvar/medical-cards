import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCard, saveCard } from "../db";

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
  workingHours: { from: "09:00", to: "18:00", days: [0, 1, 2, 3, 4] },
  socials: {},
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
      setForm({ ...emptyForm, ...card, workingHours: card.workingHours || emptyForm.workingHours, socials: card.socials || {} });
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
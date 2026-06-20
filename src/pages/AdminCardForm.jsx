import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCard, saveCard, parseLatLng, uploadToImgBB } from "../db";

const SOCIALS = [
  { key: "instagram", label: "Instagram",  placeholder: "username" },
  { key: "telegram",  label: "Telegram",   placeholder: "username yoki +998..." },
  { key: "youtube",   label: "YouTube",    placeholder: "channel URL" },
  { key: "tiktok",    label: "TikTok",     placeholder: "username" },
  { key: "facebook",  label: "Facebook",   placeholder: "page URL yoki username" },
  { key: "website",   label: "Veb-sayt",   placeholder: "https://example.com" },
  { key: "whatsapp",  label: "WhatsApp",   placeholder: "+998901234567" },
];

const DAYS_UZ = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

const emptyPartner = () => ({ label: "", logoUrl: "", link: "" });

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
  partnerLogos: [],
  partnerLogosMax: 3,
  coverUrl: "",
};

export default function AdminCardForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);

  const [form, setForm]           = useState(emptyForm);
  const [logoFile, setLogoFile]   = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // per-partner file upload refs (indexed)
  const partnerFileRefs = useRef({});

  useEffect(() => {
    if (!isEdit) return;
    getCard(id).then(card => {
      if (!card) return navigate("/admin");
      setForm({
        ...emptyForm,
        ...card,
        workingHours: card.workingHours || emptyForm.workingHours,
        socials:      card.socials      || {},
        theme:        card.theme        || emptyForm.theme,
        location:     card.location     || { address: "", mapsUrl: "" },
        partnerLogos:    card.partnerLogos    || [],
        partnerLogosMax: card.partnerLogosMax ?? 3,
        coverUrl:        card.coverUrl        || "",
      });
      setLogoPreview(card.logoUrl || "");
      setCoverPreview(card.coverUrl || "");
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSocialChange   = (key, value) => setForm(f => ({ ...f, socials: { ...f.socials, [key]: value } }));
  const handleHoursChange    = (field, value) => setForm(f => ({ ...f, workingHours: { ...f.workingHours, [field]: value } }));
  const toggleDay            = (i) => {
    const days = form.workingHours.days.includes(i)
      ? form.workingHours.days.filter(d => d !== i)
      : [...form.workingHours.days, i];
    setForm(f => ({ ...f, workingHours: { ...f.workingHours, days } }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // ── Partner logos helpers ──
  const addPartner = () =>
    setForm(f => ({ ...f, partnerLogos: [...f.partnerLogos, emptyPartner()] }));

  const removePartner = (i) =>
    setForm(f => ({ ...f, partnerLogos: f.partnerLogos.filter((_, idx) => idx !== i) }));

  const updatePartner = (i, field, value) =>
    setForm(f => {
      const updated = [...f.partnerLogos];
      updated[i] = { ...updated[i], [field]: value };
      return { ...f, partnerLogos: updated };
    });

  const handlePartnerFile = (i, file) => {
    if (!file) return;
    // We upload immediately to ImgBB on save, but for now store as object URL preview
    // We'll carry the File object separately and upload in handleSubmit
    const preview = URL.createObjectURL(file);
    updatePartner(i, "logoUrl", preview);
    updatePartner(i, "_file", file); // temp field, stripped on save
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Strip _file from partnerLogos — saveCard handles actual upload
      const cleanPartners = form.partnerLogos.map(({ _file, ...rest }) => rest);
      let coverUrl = form.coverUrl || "";
      if (coverFile) coverUrl = await uploadToImgBB(coverFile);
      await saveCard(
        { ...form, coverUrl, partnerLogos: cleanPartners, id: id || undefined },
        logoFile,
        form.partnerLogos.map(p => p._file || null),
      );
      navigate("/admin");
    } catch (err) {
      setError("Saqlashda xatolik yuz berdi.");
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

        <section className="form-section">
          <h2>Cover Rasm</h2>
          <div className="cover-upload-area">
            {coverPreview
              ? <img src={coverPreview} alt="Cover" className="cover-preview" />
              : <div className="cover-placeholder">Cover rasm yo'q (ixtiyoriy)</div>
            }
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <label className="btn btn-upload">
                Cover yuklash
                <input type="file" accept="image/*" onChange={handleCoverChange} hidden />
              </label>
              {coverPreview && (
                <button type="button" className="btn btn-danger btn-sm"
                  onClick={() => { setCoverFile(null); setCoverPreview(""); setForm(f => ({ ...f, coverUrl: "" })); }}>
                  O'chirish
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Logo + Status */}
        <section className="form-section">
          <h2>Logo</h2>
          <div className="logo-upload-area">
            {logoPreview
              ? <img src={logoPreview} alt="Logo preview" className="logo-preview" />
              : <div className="logo-placeholder">Logo yo'q</div>
            }
            <label className="btn btn-upload">
              Logo yuklash
              <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
            </label>
          </div>
          <h2 style={{ marginTop: 20 }}>Holati</h2>
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
                type="button" key={i}
                className={`day-btn ${form.workingHours.days.includes(i) ? "active" : ""}`}
                onClick={() => toggleDay(i)}
              >{day}</button>
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
                value={form.location?.address || ""}
                onChange={e => setForm(f => ({ ...f, location: { ...f.location, address: e.target.value } }))}
                placeholder="Toshkent, Chilonzor tumani, 5-uy"
              />
            </div>
            <div className="form-field full-width">
              <label>Google Maps havolasi yoki koordinatlar</label>
              <input
                value={form.location?.mapsUrl || ""}
                onChange={e => setForm(f => ({ ...f, location: { ...f.location, mapsUrl: e.target.value } }))}
                placeholder="https://maps.google.com/... yoki 40.136731, 67.823765"
              />
              {form.location?.mapsUrl && (() => {
                const coords = parseLatLng(form.location.mapsUrl);
                return coords
                  ? <small style={{ color: "#16a34a", marginTop: 4, display: "block" }}>✓ Koordinatlar topildi: {coords.lat}, {coords.lng}</small>
                  : <small style={{ color: "#ef4444", marginTop: 4, display: "block" }}>✗ Koordinatlar topilmadi. To'g'ri havola yoki koordinat kiriting</small>;
              })()}
            </div>
          </div>
        </section>

        {/* ── Partner Logos ── */}
        <section className="form-section">
          <div className="section-header-row">
            <h2>Partner Logolar</h2>
            <button type="button" className="btn btn-sm btn-upload" onClick={addPartner}>
              + Logo qo'shish
            </button>
          </div>

          {/* Max display count */}
          <div className="form-field" style={{ marginBottom: 16, maxWidth: 200 }}>
            <label>Kartada ko'rsatish soni (maks)</label>
            <select
              value={form.partnerLogosMax}
              onChange={e => setForm(f => ({ ...f, partnerLogosMax: Number(e.target.value) }))}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} ta</option>
              ))}
            </select>
          </div>

          {form.partnerLogos.length === 0 && (
            <p style={{ color: "var(--text-2)", fontSize: 13 }}>Hali logo qo'shilmagan</p>
          )}

          <div className="partner-list">
            {form.partnerLogos.map((p, i) => (
              <div key={i} className="partner-row">
                <div className="partner-logo-preview">
                  {p.logoUrl
                    ? <img src={p.logoUrl} alt="" />
                    : <span>?</span>
                  }
                </div>
                <div className="partner-fields">
                  <input
                    placeholder="Logo URL (https://...)"
                    value={p._file ? "" : p.logoUrl}
                    onChange={e => updatePartner(i, "logoUrl", e.target.value)}
                    disabled={Boolean(p._file)}
                  />
                  <input
                    placeholder="Havola (https://...) — ixtiyoriy"
                    value={p.link}
                    onChange={e => updatePartner(i, "link", e.target.value)}
                  />
                  <input
                    placeholder="Nom (ixtiyoriy)"
                    value={p.label}
                    onChange={e => updatePartner(i, "label", e.target.value)}
                  />
                </div>
                <div className="partner-actions">
                  <label className="btn btn-sm btn-upload" title="Fayl yuklash">
                    📁
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={el => partnerFileRefs.current[i] = el}
                      onChange={e => handlePartnerFile(i, e.target.files[0])}
                    />
                  </label>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removePartner(i)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section className="form-section">
          <h2>Tema</h2>
          <div className="theme-options">
            {["white", "black", "custom"].map(mode => (
              <button
                type="button" key={mode}
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
                { key: "bg",        label: "Sahifa foni" },
                { key: "cardBg",    label: "Karta foni" },
                { key: "btnColor",  label: "Tugma rangi" },
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

          <div className="form-field" style={{ marginTop: 16 }}>
            <label>Shrift (Font)</label>
            <select
              value={form.theme?.font || "Inter"}
              onChange={e => setForm(f => ({ ...f, theme: { ...f.theme, font: e.target.value } }))}
            >
              {[
                "Inter","Roboto","Open Sans","Montserrat","Poppins",
                "Lato","Nunito","Raleway","Playfair Display","Merriweather",
                "Ubuntu","Oswald","Source Sans 3","PT Sans","Noto Sans",
              ].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </section>

        {/* Custom ID */}
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
            {!isEdit && <small style={{ color: "var(--text-2)" }}>Bir marta belgilanadi, keyinchalik o'zgartirib bo'lmaydi</small>}
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
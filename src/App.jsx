import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ExternalLink, Heart, X } from "lucide-react";

// ---------- Tema ----------
const theme = {
  bg: "#120a1f", // koyumsu mor arkaplan
  bgDeep: "#0c0616",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.12)",
  fg: "#ffffff",
  muted: "rgba(255,255,255,0.6)",
  accent: "#a78bfa",
};

const PRIORITIES = {
  COK_IYI: { label: "ÇOK İYİ", color: "#f472b6", bg: "rgba(244,114,182,0.15)", ring: "rgba(244,114,182,0.4)" },
  IYI: { label: "İYİ", color: "#a78bfa", bg: "rgba(167,139,250,0.15)", ring: "rgba(167,139,250,0.4)" },
  MEH: { label: "MEH", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", ring: "rgba(148,163,184,0.35)" },
};

const PRIORITY_ORDER = ["COK_IYI", "IYI", "MEH"];

const STORAGE_KEY = "hediye-listesi-v1";

function domainOf(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function normalizeUrl(url) {
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) return "https://" + url;
  return url;
}

// ---------- Ekleme Formu ----------
function AddForm({ onAdd, onClose, ownerName }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [priority, setPriority] = useState("IYI");

  const canSave = title.trim() && url.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-4 mb-4"
      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${theme.border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: theme.fg }}>
          {ownerName} için yeni istek
        </span>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 transition">
          <X size={16} color={theme.muted} />
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ne bu? (ör. kablosuz kulaklık)"
        className="w-full rounded-lg px-3 py-2 text-sm mb-2 outline-none"
        style={{ background: theme.bgDeep, border: `1px solid ${theme.border}`, color: theme.fg }}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Link (trendyol, hepsiburada, amazon...)"
        className="w-full rounded-lg px-3 py-2 text-sm mb-3 outline-none"
        style={{ background: theme.bgDeep, border: `1px solid ${theme.border}`, color: theme.fg }}
      />

      <div className="flex gap-2 mb-4">
        {PRIORITY_ORDER.map((key) => {
          const p = PRIORITIES[key];
          const active = priority === key;
          return (
            <button
              key={key}
              onClick={() => setPriority(key)}
              className="flex-1 rounded-full px-2 py-1.5 text-xs font-bold tracking-wide transition"
              style={{
                background: active ? p.bg : "transparent",
                color: active ? p.color : theme.muted,
                border: `1px solid ${active ? p.ring : theme.border}`,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: canSave ? 1.02 : 1 }}
        whileTap={{ scale: canSave ? 0.97 : 1 }}
        disabled={!canSave}
        onClick={() => {
          onAdd({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            title: title.trim(),
            url: normalizeUrl(url.trim()),
            priority,
            createdAt: Date.now(),
          });
          onClose();
        }}
        className="w-full rounded-full py-2.5 text-sm font-semibold transition"
        style={{
          background: canSave ? theme.fg : "rgba(255,255,255,0.1)",
          color: canSave ? theme.bgDeep : theme.muted,
          cursor: canSave ? "pointer" : "not-allowed",
        }}
      >
        Listeye Ekle
      </motion.button>
    </motion.div>
  );
}

// ---------- Tek İstek Kartı ----------
function WishCard({ item, onDelete }) {
  const p = PRIORITIES[item.priority] || PRIORITIES.IYI;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group rounded-2xl p-4 flex items-start gap-3"
      style={{ background: theme.card, border: `1px solid ${theme.border}` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-md tracking-wide"
            style={{ background: p.bg, color: p.color, border: `1px solid ${p.ring}` }}
          >
            {p.label}
          </span>
        </div>
        <div className="text-sm font-semibold mb-0.5 truncate" style={{ color: theme.fg }}>
          {item.title}
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs hover:underline"
          style={{ color: theme.accent }}
        >
          {domainOf(item.url)} <ExternalLink size={11} />
        </a>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-white/10"
        title="Sil"
      >
        <Trash2 size={15} color={theme.muted} />
      </button>
    </motion.div>
  );
}

// ---------- Kolon ----------
function WishColumn({ ownerKey, ownerName, items, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);

  const sorted = [...items].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Heart
            size={18}
            color={ownerKey === "nehir" ? "#f472b6" : "#a78bfa"}
            fill={ownerKey === "nehir" ? "#f472b6" : "#a78bfa"}
          />
          <h2 className="text-2xl font-medium tracking-tight" style={{ color: theme.fg }}>
            {ownerName}
          </h2>
          <span className="text-sm" style={{ color: theme.muted }}>
            ({items.length})
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          style={{ background: theme.fg, color: theme.bgDeep }}
        >
          <Plus size={15} /> Ekle
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <AddForm ownerName={ownerName} onAdd={(item) => onAdd(ownerKey, item)} onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {sorted.map((item) => (
            <WishCard key={item.id} item={item} onDelete={(id) => onDelete(ownerKey, id)} />
          ))}
        </AnimatePresence>
        {sorted.length === 0 && !showForm && (
          <div
            className="rounded-2xl p-8 text-center text-sm"
            style={{ border: `1px dashed ${theme.border}`, color: theme.muted }}
          >
            Henüz istek yok. "Ekle" ile ilk linki koy.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Ana Uygulama ----------
export default function App() {
  const [data, setData] = useState({ nehir: [], emre: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {
      // kayıt bozuksa sıfırdan başla
    }
    setLoaded(true);
  }, []);

  const persist = (next) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Kaydetme hatası:", e);
    }
  };

  const addItem = (owner, item) => persist({ ...data, [owner]: [...data[owner], item] });
  const deleteItem = (owner, id) =>
    persist({ ...data, [owner]: data[owner].filter((i) => i.id !== id) });

  return (
    <div className="min-h-screen w-full" style={{ background: theme.bg }}>
      {/* Arkaplan mor parıltı */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0) 70%), radial-gradient(40% 30% at 85% 80%, rgba(244,114,182,0.08) 0%, rgba(244,114,182,0) 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20">
        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="liquid-glass px-3 py-2 rounded-lg mb-6 flex items-center gap-2"
          >
            <span
              className="px-2 py-0.5 rounded-md text-sm font-medium"
              style={{ background: theme.fg, color: theme.bgDeep }}
            >
              💜
            </span>
            <span className="text-sm font-medium" style={{ color: theme.muted }}>
              Nehir &amp; Emre — Hediye Listesi
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-medium mb-3"
            style={{ color: theme.fg, letterSpacing: "-2px", lineHeight: 1.15 }}
          >
            İsteklerimiz.
            <br />
            Tek Bir <span className="serif-italic">Listede.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg"
            style={{ color: "rgba(238,242,246,0.9)" }}
          >
            Birbirimize almak istediğimiz hediyeler,
            <br />
            önceliğine göre sıralı.
          </motion.p>
        </div>

        {/* İki kolon */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="flex flex-col md:flex-row gap-10 md:gap-8"
        >
          {loaded ? (
            <>
              <WishColumn
                ownerKey="nehir"
                ownerName="Nehir'in Listesi"
                items={data.nehir}
                onAdd={addItem}
                onDelete={deleteItem}
              />
              <div className="hidden md:block w-px self-stretch" style={{ background: theme.border }} />
              <WishColumn
                ownerKey="emre"
                ownerName="Emre'nin Listesi"
                items={data.emre}
                onAdd={addItem}
                onDelete={deleteItem}
              />
            </>
          ) : (
            <div className="w-full text-center py-16 text-sm" style={{ color: theme.muted }}>
              Liste yükleniyor…
            </div>
          )}
        </motion.div>

        <div className="mt-20 text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          Arkaplana fotoğraflarımız gelecek 📸
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { ref, push, onValue, remove } from "firebase/database";
import { db } from "./firebase";
import { Trash2, ExternalLink, Gift, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [items, setItems] = useState([]);
  const [productName, setProductName] = useState("");
  const [productLink, setProductLink] = useState("");

  useEffect(() => {
    const itemsRef = ref(db, "hediyeler");
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedItems = [];
      if (data) {
        for (const key in data) {
          loadedItems.push({ id: key, ...data[key] });
        }
      }
      setItems(loadedItems.reverse());
    });
    return () => unsubscribe();
  }, []);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!productName.trim() || !productLink.trim()) return;

    const itemsRef = ref(db, "hediyeler");
    push(itemsRef, {
      title: productName,
      link: productLink,
      addedAt: Date.now()
    });

    setProductName("");
    setProductLink("");
  };

  const handleDelete = (id) => {
    const itemRef = ref(db, `hediyeler/${id}`);
    remove(itemRef);
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6 md:p-12 font-sans flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 mt-10">
        <div className="flex items-center gap-3 mb-8 border-b pb-6 border-pink-100">
          <Gift className="text-pink-500" size={36} />
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 flex items-center gap-2">
            Nehir & Emre <Heart className="text-red-500 fill-red-500" size={28} />
          </h1>
        </div>

        <form onSubmit={handleAddItem} className="flex flex-col gap-4 mb-8">
          <input
            type="text"
            placeholder="Ne almak istiyoruz? (Örn: Çift Kazakları)"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition-all text-gray-700"
            required
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="Ürün Linki (https://...)"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition-all text-gray-700"
              required
            />
            <button
              type="submit"
              className="bg-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-600 active:bg-pink-700 transition-colors whitespace-nowrap shadow-md shadow-pink-200"
            >
              Listeye Ekle
            </button>
          </div>
        </form>

        <ul className="space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-5 bg-pink-50/50 rounded-2xl border border-pink-100 group hover:bg-pink-50 transition-colors"
              >
                <div className="flex-1 overflow-hidden pr-4">
                  <p className="font-semibold text-gray-800 truncate text-lg">{item.title}</p>
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-1 mt-1 w-fit"
                  >
                    Ürüne Git <ExternalLink size={14} />
                  </a>
                </div>
                
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Listeden Kaldır"
                >
                  <Trash2 size={20} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          
          {items.length === 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-12 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200"
            >
              Liste şu an boş. Birlikte alacağınız ilk şeyi ekleyin!
            </motion.p>
          )}
        </ul>
      </div>
    </div>
  );
}

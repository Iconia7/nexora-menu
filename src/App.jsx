import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, X, ChevronRight, UtensilsCrossed, Star, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_ITEMS, CATEGORIES } from './data';
import { Play } from 'lucide-react';
import { STORIES } from './data';
import MpesaModal from './MpesaModal'; // Assuming it's in the same folder

// --- CONFIGURATION ---
const RESTAURANT_NAME = "Nexora Bistro";
const WHATSAPP_NUMBER = "254115332870"; 
const HERO_IMAGE = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop"; // Atmospheric background

function App() {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Handle Scroll Effect for Header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter Items
  const filteredItems = useMemo(() => {
    return activeCategory === "All" 
      ? MENU_ITEMS 
      : MENU_ITEMS.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  // Cart Totals
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Add to Cart
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      return existing 
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
    });
  };

  // Remove from Cart
  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      return existing.qty === 1 
        ? prev.filter(i => i.id !== id)
        : prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

const handlePaymentSuccess = (details) => {
    // 1. Build the Receipt Message
    let message = `🧾 *PAID ORDER - ${RESTAURANT_NAME}*\n`;
    message += `✅ *M-Pesa Ref:* ${details.receipt}\n`;
    message += `📱 *Customer:* ${details.phone}\n\n`;
    message += `*ORDER DETAILS:*\n`;
    cart.forEach(item => message += `▫️ ${item.qty}x ${item.name}\n`);
    message += `\n💰 *TOTAL PAID: KES ${totalPrice.toLocaleString()}*`;

    // 2. Send to Waiter/Kitchen via WhatsApp
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    // 3. Clear Cart
    setCart([]);
    setIsCartOpen(false);
    setIsPaymentModalOpen(false);
};

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-24 selection:bg-orange-500 selection:text-white">
      
      {/* 1. HERO HEADER (Parallax Style) */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <motion.img 
            initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}
            src={HERO_IMAGE} 
            className="w-full h-full object-cover" 
            alt="Hero"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent text-white">
            <motion.h1 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-extrabold tracking-tight mb-2"
            >{RESTAURANT_NAME}</motion.h1>
            <div className="flex gap-4 text-sm font-medium text-stone-200">
                <span className="flex items-center gap-1"><Clock size={16}/> 10:00 AM - 10:00 PM</span>
                <span className="flex items-center gap-1"><MapPin size={16}/> Thika, Kenya</span>
                <span className="flex items-center gap-1 text-orange-400"><Star size={16} fill="currentColor"/> 4.8</span>
            </div>
        </div>
      </div>
      {/* --- FEATURE: SIZZLE REELS (STORIES) --- */}
<div className="pt-6 pb-2 pl-4 overflow-x-auto no-scrollbar">
  <div className="flex gap-4">
    {STORIES.map(story => (
      <button 
        key={story.id}
        onClick={() => setActiveStory(story)}
        className="flex flex-col items-center gap-2 group"
      >
        {/* The Ring */}
        <div className={`p-[3px] rounded-full bg-gradient-to-tr ${story.color} group-hover:scale-105 transition-transform`}>
           {/* The Image */}
           <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden relative">
             <img src={story.image} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Play size={12} fill="white" className="text-white opacity-80" />
             </div>
           </div>
        </div>
        <span className="text-xs font-bold text-stone-600">{story.title}</span>
      </button>
    ))}
  </div>
</div>

      {/* 2. STICKY NAV & CATEGORIES */}
      <div className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm pt-4 pb-2' : 'bg-transparent pt-4 pb-0'}`}>
        
        {/* Floating Cart Button (Desktop/Header) */}
        <div className="absolute right-4 top-4 md:right-8 md:top-6">
             <button onClick={() => setIsCartOpen(true)} className="bg-white text-stone-800 p-3 rounded-full shadow-lg hover:bg-orange-50 transition relative group">
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transform group-hover:scale-110 transition">
                        {totalItems}
                    </span>
                )}
             </button>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto no-scrollbar pb-4 pl-4 md:pl-8 pr-16">
            <div className="flex gap-3">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                            activeCategory === cat 
                            ? 'bg-stone-900 text-white border-stone-900 shadow-lg transform -translate-y-1' 
                            : 'bg-white text-stone-500 border-stone-200 hover:border-orange-200 hover:text-orange-600'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 3. MODERN PRODUCT GRID */}
      <main className="px-4 md:px-8 max-w-6xl mx-auto mt-2">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {filteredItems.map(item => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={item.id}
                        className="group bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col md:block"
                    >
                        {/* Image Container */}
                        <div className="relative h-48 md:h-56 rounded-[1.5rem] overflow-hidden mb-4">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                            <div className="absolute bottom-3 left-4 text-white font-bold text-xl drop-shadow-md">
                                Ksh {item.price}
                            </div>
                            <button 
                                onClick={() => addToCart(item)}
                                className="absolute bottom-3 right-3 bg-white text-stone-900 p-3 rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-colors transform active:scale-90"
                            >
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="px-2 pb-2">
                            <h3 className="font-bold text-lg text-stone-800 leading-tight group-hover:text-orange-600 transition-colors">{item.name}</h3>
                            <p className="text-sm text-stone-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
      </main>

      {/* 4. FLOATING ACTION BUTTON (Mobile Only) */}
      <AnimatePresence>
        {totalItems > 0 && !isCartOpen && (
            <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
            >
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center gap-4 bg-stone-900 text-white pl-4 pr-6 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                    <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {totalItems}
                    </div>
                    <span className="font-bold text-sm">View Cart</span>
                    <span className="text-stone-400">|</span>
                    <span className="font-bold">Ksh {totalPrice.toLocaleString()}</span>
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MODERN CART SHEET */}
      <AnimatePresence>
        {isCartOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsCartOpen(false)}
                    className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50"
                />
                <motion.div 
                    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-50 shadow-2xl flex flex-col"
                >
                    {/* Cart Header */}
                    <div className="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-stone-800">My Order</h2>
                            <p className="text-stone-500 text-sm">{totalItems} items selected</p>
                        </div>
                        <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white rounded-full shadow-sm hover:bg-stone-100 transition"><X size={20}/></button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                                <div className="p-6 bg-stone-50 rounded-full">
                                    <ShoppingBag size={48} className="opacity-20" />
                                </div>
                                <p className="font-medium">Your basket is empty</p>
                                <button onClick={() => setIsCartOpen(false)} className="text-orange-600 font-bold text-sm hover:underline">Start Browsing</button>
                            </div>
                        ) : (
                            cart.map(item => (
                                <motion.div layout key={item.id} className="flex gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-stone-800">{item.name}</h4>
                                            <p className="font-bold text-sm">Ksh {item.price * item.qty}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-stone-50 w-max px-2 py-1 rounded-lg border border-stone-100">
                                            <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-red-500 transition"><Minus size={14}/></button>
                                            <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                                            <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-stone-800 hover:text-orange-600 transition"><Plus size={14}/></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                    

                    {/* Footer */}
                    <div className="p-6 bg-white border-t border-stone-100 pb-8">
                        <div className="flex justify-between mb-2 text-stone-500">
                            <span>Subtotal</span>
                            <span>Ksh {totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-6 text-lg font-bold text-stone-900">
                            <span>Total</span>
                            <span>Ksh {totalPrice.toLocaleString()}</span>
                        </div>
                        {/* Change onClick to setIsPaymentModalOpen(true) */}
<button 
    onClick={() => setIsPaymentModalOpen(true)} // <--- UPDATED
    disabled={cart.length === 0}
    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-orange-600 transition-all disabled:opacity-50 flex justify-center items-center gap-3"
>
    <span>Pay with M-Pesa</span>
    <ChevronRight size={20} />
</button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
      {/* --- STORY MODAL --- */}
<AnimatePresence>
  {activeStory && (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col"
    >
      {/* Close Button */}
      <button 
        onClick={() => setActiveStory(null)} 
        className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md p-2 rounded-full text-white"
      >
        <X size={24} />
      </button>

      {/* The Video */}
      <div className="flex-1 relative">
        <video 
  key={activeStory.id}  // <--- CRITICAL FIX: Forces React to reload the video
  src={activeStory.video} 
  autoPlay 
  loop 
  muted 
  playsInline
  className="w-full h-full object-cover bg-black" // Added bg-black to see boundaries
  onError={(e) => console.error("Video Error:", e)} // Logs error to console (F12) if link is broken
/>
        
        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent pt-20">
            <h2 className="text-white text-3xl font-bold mb-2">{activeStory.title}</h2>
            <p className="text-white/80 mb-6">Experience the taste before you order.</p>
            
            <button 
                onClick={() => {
                   // Optional: Add a specific item to cart from the story
                   setActiveStory(null);
                }}
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition"
            >
                Order This Now
            </button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
{/* ... inside return ... */}
<MpesaModal 
    isOpen={isPaymentModalOpen}
    onClose={() => setIsPaymentModalOpen(false)}
    total={totalPrice}
    onPaymentSuccess={handlePaymentSuccess}
/>
    </div>
  );
}

export default App;
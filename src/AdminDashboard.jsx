import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { TrendingUp, ShoppingBasket, DollarSign, Calendar } from 'lucide-react';

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // 1. HOOKS ALWAYS GO AT THE TOP
  useEffect(() => {
    // Only run the database listener if the user is logged in
    if (!isAuthenticated) return;

    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, "menu_orders"),
      where("dateStr", "==", today),
      where("status", "==", "PAID")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let dailyTotal = 0;
      snapshot.forEach((doc) => {
        dailyTotal += Number(doc.data().amount);
      });
      
      setStats({
        total: dailyTotal,
        count: snapshot.size
      });
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]); // Re-run if login status changes

  const handleLogin = () => {
    if (password === "Bistro2026") {
      setIsAuthenticated(true);
    } else {
      alert("Wrong password!");
    }
  };

  // 2. CONDITIONAL RETURNS GO AFTER HOOKS
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-900 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
          <h2 className="text-2xl font-black mb-6">Staff Access</h2>
          <input 
            type="password" 
            placeholder="Enter Pin" 
            className="w-full p-4 border-2 border-stone-100 rounded-xl mb-4 text-center text-2xl font-bold"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold"
          >
            Unlock Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-stone-50 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-stone-900">Daily Insights</h1>
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Calendar size={12} /> {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* REVENUE CARD */}
        <div className="bg-stone-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
          <TrendingUp className="absolute right-[-10px] top-[-10px] size-32 text-white/5" />
          <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Today's Revenue</p>
          <h2 className="text-5xl font-black mt-2">
            <span className="text-orange-500 text-2xl">KES</span> {stats.total.toLocaleString()}
          </h2>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
            <ShoppingBasket className="text-orange-500 mb-2" />
            <p className="text-stone-400 text-xs font-bold uppercase">Orders</p>
            <p className="text-2xl font-black text-stone-800">{stats.count}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
            <DollarSign className="text-green-500 mb-2" />
            <p className="text-stone-400 text-xs font-bold uppercase">Avg. Ticket</p>
            <p className="text-2xl font-black text-stone-800">
              {stats.count > 0 ? Math.round(stats.total / stats.count) : 0}
            </p>
          </div>
        </div>
        
        <p className="text-center text-stone-400 text-xs mt-8">
          Data updates automatically upon M-Pesa confirmation.
        </p>
      </div>
    </div>
  );
}
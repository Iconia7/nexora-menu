import React, { useState, useEffect } from 'react';
import { X, Smartphone, Loader, ShieldCheck, CheckCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MpesaModal({ isOpen, onClose, total, onPaymentSuccess, cart, removeFromCart }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("input"); // 'input' | 'processing' | 'success'
  const [receipt, setReceipt] = useState(""); 
  const [showSummary, setShowSummary] = useState(false); // Toggle for order details

  // Auto-close if cart is emptied inside the modal
  useEffect(() => {
    if (isOpen && cart && cart.length === 0) {
        onClose();
        toast.error("Cart is empty");
    }
  }, [cart, isOpen, onClose]);

  const handlePay = async () => {
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    
    try {
      const res = await fetch('/api/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: total }) 
      });
      const data = await res.json();

      if (data.ResponseCode === "0") {
        setStep("processing");
        checkStatus(data.CheckoutRequestID);
      } else {
        toast.error("STK Push Failed: " + (data.errorMessage || "Unknown Error"));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection Error");
      setLoading(false);
    }
  };

  const checkStatus = async (checkoutID) => {
    let attempts = 0;
    const interval = setInterval(async () => {
        attempts++;
        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkoutRequestID: checkoutID })
            });
            const data = await res.json();
            
            if (data.ResultCode === "0") {
                clearInterval(interval);
                setReceipt(data.CheckoutRequestID); 
                setStep("success"); 
                setLoading(false);
            } 
            else if (['1032', '1', '1037'].includes(data.ResultCode)) {
                clearInterval(interval);
                toast.error(`Payment Failed: ${data.ResultDesc}`);
                setStep("input");
                setLoading(false);
            }
        } catch (error) { console.log("Polling..."); }

        if (attempts >= 20) {
            clearInterval(interval);
            toast.error("Timeout. If you entered PIN, please wait for SMS.");
            setLoading(false);
            onClose();
        }
    }, 3000);
  };

  const handleFinalize = () => {
      onPaymentSuccess({ receipt: receipt, phone: phone });
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 bg-stone-100 p-2 rounded-full hover:bg-stone-200 z-10"><X size={20}/></button>

        <div className="bg-stone-900 p-8 text-center relative">
            <Smartphone size={40} className="text-orange-500 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-white">M-Pesa Checkout</h2>
        </div>

        <div className="p-8">
            {step === "input" && (
                <div className="space-y-6">
                    {/* --- TOTAL DISPLAY --- */}
                    <div className="text-center">
                        <p className="text-xs font-bold text-stone-400 uppercase">Amount Due</p>
                        <p className="text-4xl font-black text-stone-800">KES {total.toLocaleString()}</p>
                    </div>

                    {/* --- ORDER SUMMARY TOGGLE --- */}
                    <div className="bg-stone-50 rounded-xl overflow-hidden border border-stone-100">
                        <button 
                            onClick={() => setShowSummary(!showSummary)}
                            className="w-full flex justify-between items-center p-3 text-sm font-bold text-stone-600 hover:bg-stone-100 transition"
                        >
                            <span>Review Order ({cart?.length || 0} items)</span>
                            {showSummary ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                        
                        <AnimatePresence>
                            {showSummary && (
                                <motion.div 
                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3 pt-0 max-h-40 overflow-y-auto space-y-2">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between items-center text-sm border-b border-stone-100 last:border-0 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-orange-600">{item.qty}x</span>
                                                    <span className="text-stone-700 truncate max-w-[140px]">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{(item.price * item.qty).toLocaleString()}</span>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-stone-400 hover:text-red-500 transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* --- PHONE INPUT --- */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 ml-1">PHONE NUMBER</label>
                        <input type="tel" placeholder="07..." value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-stone-50 border-2 border-stone-100 p-4 rounded-xl font-bold text-xl outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    <button onClick={handlePay} disabled={loading} className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition flex justify-center items-center gap-2">
                        {loading ? <Loader className="animate-spin" /> : "Pay Now"}
                    </button>
                </div>
            )}

            {step === "processing" && (
                <div className="text-center py-6">
                    <Loader size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-stone-800">Check your phone</h3>
                    <p className="text-stone-500 mt-2">Enter your M-Pesa PIN to complete the order.</p>
                </div>
            )}

            {step === "success" && (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2">Payment Confirmed!</h3>
                    <p className="text-sm text-stone-500 mb-6">Your transaction was successful.</p>
                    
                    <button 
                        onClick={handleFinalize} 
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition animate-pulse"
                    >
                        Send Order to Kitchen 👉
                    </button>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}
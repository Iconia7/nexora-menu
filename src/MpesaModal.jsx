import React, { useState } from 'react';
import { X, Smartphone, Loader, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MpesaModal({ isOpen, onClose, total, onPaymentSuccess }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("input"); // 'input' | 'processing' | 'success'
  const [receipt, setReceipt] = useState(""); // Store the Safaricom Receipt

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
            
            console.log("Status:", data); // Debugging

            if (data.ResultCode === "0") {
                clearInterval(interval);
                // 1. SAVE RECEIPT
                setReceipt(data.CheckoutRequestID); 
                // 2. SHOW SUCCESS BUTTON (Don't auto-redirect)
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

  // --- MANUAL TRIGGER TO BYPASS POPUP BLOCKER ---
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
        <button onClick={onClose} className="absolute top-4 right-4 bg-stone-100 p-2 rounded-full hover:bg-stone-200"><X size={20}/></button>

        <div className="bg-stone-900 p-8 text-center">
            <Smartphone size={40} className="text-orange-500 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-white">M-Pesa Checkout</h2>
        </div>

        <div className="p-8">
            {step === "input" && (
                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-xs font-bold text-stone-400 uppercase">Amount Due</p>
                        <p className="text-4xl font-black text-stone-800">KES {total.toLocaleString()}</p>
                    </div>
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

            {/* --- THIS IS THE NEW PART --- */}
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
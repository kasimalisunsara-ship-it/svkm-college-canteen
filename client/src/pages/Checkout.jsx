import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  User,
  Mail,
  CreditCard,
  QrCode,
  Banknote,
  Smartphone,
  Sparkles,
  X,
  Check,
  RefreshCw
} from 'lucide-react';

export const Checkout = () => {
  const { user, token } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState('Online UPI'); // 'Online UPI', 'Cash', 'Campus Card'
  const [showQrModal, setShowQrModal] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Authentication Required</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Please sign in to your SVKM student or staff account to place cafeteria orders.
        </p>
        <Link
          to="/login"
          className="px-6 py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm shadow-md hover:bg-orange-700 transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0 && !confirmedOrder) {
    navigate('/cart');
    return null;
  }

  const submitOrderToBackend = async (selectedMethod, txnId = null) => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          transactionId: txnId,
          items: cartItems.map(item => ({
            foodId: item.foodId,
            name: item.name,
            quantity: item.quantity
          }))
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        addToast(data.message || 'Failed to place order.', 'error');
        return;
      }

      // Success
      clearCart();
      setShowQrModal(false);
      setConfirmedOrder(data.order);
      addToast(`Order placed successfully! Order ID: ${data.order.orderId}`, 'success');
    } catch (err) {
      setLoading(false);
      addToast('Error communicating with cafeteria server.', 'error');
    }
  };

  const handleInitialClick = () => {
    if (paymentMethod === 'Online UPI') {
      setShowQrModal(true);
    } else {
      submitOrderToBackend(paymentMethod, null);
    }
  };

  const handleSimulateUpiPayment = () => {
    setIsVerifyingPayment(true);
    setTimeout(() => {
      setIsVerifyingPayment(false);
      const demoTxnId = `UPI${Date.now().toString().slice(-8)}`;
      submitOrderToBackend('Online UPI', demoTxnId);
    }, 1500);
  };

  // Order Success Screen
  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-fade-in text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            Order Confirmed & Sent to Kitchen
          </span>
          <h1 className="text-3xl font-black text-slate-900">Thank You for Your Order!</h1>
          <p className="text-slate-500 text-sm">
            Your unique cafeteria order reference ID is:
          </p>
          <div className="inline-block bg-slate-900 text-amber-400 font-mono text-2xl font-black px-6 py-3 rounded-2xl tracking-wider shadow-inner my-3">
            {confirmedOrder.orderId}
          </div>
        </div>

        {/* Payment Details Badge */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between text-xs font-bold text-orange-900">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-orange-600" />
            <span>Payment Method: {confirmedOrder.paymentMethod}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase text-[10px]">
            {confirmedOrder.paymentStatus}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md text-left space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Order Details Summary
          </h3>
          <div className="space-y-2 text-sm">
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-700 font-medium">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.subtotal}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 flex justify-between font-black text-base text-slate-900">
              <span>Total Paid</span>
              <span className="text-orange-600">₹{confirmedOrder.grandTotal}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/orders/${confirmedOrder.id}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 hover:from-orange-700 hover:to-amber-600 transition-all flex items-center justify-center gap-2"
          >
            Track Order Live <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/menu"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Checkout & Payment Gateway</h1>
        <p className="text-slate-500 text-sm">Choose payment method & confirm order details for SVKM cafeteria kitchen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Student Information & Payment Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" /> Customer Info
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">Name</span>
                <span className="font-extrabold text-slate-800">{user.name}</span>
              </div>
              {user.sapId && (
                <div>
                  <span className="text-slate-400 font-bold block">SAP ID</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{user.sapId}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-bold block">College Email</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" /> Select Payment Method
            </h2>

            <div className="space-y-3">
              {/* Online UPI Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Online UPI')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === 'Online UPI'
                    ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs">Online UPI QR Code</h3>
                    <span className="text-[10px] text-slate-500 font-semibold block">GPay, PhonePe, Paytm, BHIM</span>
                  </div>
                </div>
                {paymentMethod === 'Online UPI' && <Check className="w-5 h-5 text-orange-600" />}
              </button>

              {/* Cash at Counter Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === 'Cash'
                    ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs">Pay Cash at Counter</h3>
                    <span className="text-[10px] text-slate-500 font-semibold block">Pay cash upon meal pickup</span>
                  </div>
                </div>
                {paymentMethod === 'Cash' && <Check className="w-5 h-5 text-orange-600" />}
              </button>

              {/* Campus Wallet Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Campus Card')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === 'Campus Card'
                    ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs">SVKM Campus Card Wallet</h3>
                    <span className="text-[10px] text-slate-500 font-semibold block">Deduct from SAP ID wallet balance</span>
                  </div>
                </div>
                {paymentMethod === 'Campus Card' && <Check className="w-5 h-5 text-orange-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Order Items & Final Checkout Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" /> Order Calculation
            </h2>

            <div className="space-y-2.5 text-xs max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
              {cartItems.map(item => (
                <div key={item.foodId} className="pt-2 flex justify-between items-center text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">₹{item.price} × {item.quantity}</span>
                  </div>
                  <span className="font-black text-slate-900 text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Service Fee</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-2 flex justify-between font-black text-lg text-slate-900">
                <span>Grand Total</span>
                <span className="text-2xl text-orange-600">₹{cartSubtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleInitialClick}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-base shadow-lg shadow-orange-500/25 hover:from-orange-700 hover:to-amber-600 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-4"
          >
            {paymentMethod === 'Online UPI' ? 'Pay via UPI QR Code →' : 'Confirm & Place Order →'}
          </button>
        </div>
      </div>

      {/* Online UPI Demo QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-5 border border-slate-100 relative animate-scale-up">
            
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-orange-100 text-orange-700 uppercase">
                SVKM Canteen Payment Gateway
              </span>
              <h2 className="text-xl font-black text-slate-900">Scan & Pay via UPI</h2>
              <p className="text-xs text-slate-500">Scan QR using GPay, PhonePe, Paytm, or BHIM</p>
            </div>

            {/* Generated QR Code Container */}
            <div className="bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 p-4 rounded-3xl shadow-xl space-y-3">
              <div className="bg-white p-4 rounded-2xl shadow-inner inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=svkm.canteen@upi&pn=SVKM%20Canteen&am=${cartSubtotal}&cu=INR`}
                  alt="UPI Payment QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>

              <div className="text-white space-y-0.5">
                <span className="text-[10px] font-bold opacity-80 uppercase block">Amount to Pay</span>
                <span className="text-2xl font-black">₹{cartSubtotal.toFixed(2)}</span>
                <span className="text-[10px] font-mono opacity-90 block">UPI VPA: svkm.canteen@upi</span>
              </div>
            </div>

            {/* Simulated Payment Verification Action */}
            <button
              onClick={handleSimulateUpiPayment}
              disabled={isVerifyingPayment}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isVerifyingPayment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Payment Status...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Simulate Successful Payment
                </>
              )}
            </button>

            <span className="text-[10px] text-slate-400 font-semibold block">
              Demo Mode: Click above button to simulate instant UPI payment verification.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Clock, ShieldCheck, Zap, ArrowRight, Star, Bot, Calendar, Flame, Users, Award } from 'lucide-react';
import { SvkmLogo } from '../components/SvkmLogo';
import { FoodImage } from '../components/FoodImage';

const FEATURED_FOODS = [
  { name: 'Punjabi Veg Thali', price: 150, img: '/images/foods/veg-thali.jpg', tag: '🔥 Best Seller', cat: 'Main Course', alt: 'Authentic Indian Veg Thali Meal' },
  { name: 'Crispy Masala Dosa', price: 80, img: '/images/foods/masala-dosa.jpg', tag: '★ Top Rated', cat: 'South Indian', alt: 'Crispy South Indian Masala Dosa with Sambar' },
  { name: 'Veg Dum Biryani', price: 130, img: '/images/foods/veg-biryani.jpg', tag: '🟢 Pure Veg', cat: 'Main Course', alt: 'Hyderabadi Spiced Veg Dum Biryani' },
  { name: 'Paneer Tikka Wrap', price: 90, img: '/images/foods/paneer-wrap.jpg', tag: '⚡ Quick Bite', cat: 'Fast Food', alt: 'Grilled Paneer Tikka Wrap' },
  { name: 'Jain Special Thali', price: 160, img: '/images/foods/jain-thali.jpg', tag: '🪷 100% Jain', cat: 'Jain Specials', alt: 'Pure Jain Certified Special Thali' },
  { name: 'Matka Kesar Kulfi', price: 55, img: '/images/foods/matka-kulfi.jpg', tag: '🍨 Dessert', cat: 'Desserts', alt: 'Traditional Matka Kesar Kulfi Ice Cream' },
];

const STATS = [
  { icon: Users, value: '2,400+', label: 'Happy Students', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: UtensilsCrossed, value: '30+', label: 'Menu Items', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Clock, value: '< 15 min', label: 'Avg Pickup', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Award, value: '100%', label: 'Pure Veg & Jain', color: 'text-purple-600', bg: 'bg-purple-50' },
];

export const Home = () => {
  const { user } = useAuth();
  const [specials, setSpecials] = useState([]);
  const [activeDay, setActiveDay] = useState('Monday');

  useEffect(() => {
    fetch('/api/chat/specials')
      .then(res => res.json())
      .then(data => {
        if (data.specials) {
          setSpecials(data.specials);
          const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          if (data.specials.some(s => s.day === currentDay)) setActiveDay(currentDay);
        }
      })
      .catch(console.error);
  }, []);

  const activeSpecial = specials.find(s => s.day === activeDay) || specials[0];

  return (
    <div className="space-y-14 pb-20">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl min-h-[480px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #7c2d12 100%)' }}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-orange-500/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full px-8 md:px-14 py-14 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <SvkmLogo className="h-10 w-auto brightness-0 invert" showText={false} />
              <span className="text-orange-300 font-extrabold text-sm tracking-widest uppercase">SVKM Campus Canteen</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30 w-fit">
              <Zap className="w-3.5 h-3.5" /> Order Now · Pick Up Hot in 15 Minutes
            </div>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-tight text-white">
              Campus Food,<br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
                Freshly Made.
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-lg">
              Skip the queue. Browse the menu, order with your SAP ID, and pick up hot meals at the canteen counter!
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/menu"
                className="group px-7 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-extrabold text-sm shadow-2xl shadow-orange-500/40 transition-all flex items-center gap-2 active:scale-95">
                <UtensilsCrossed className="w-5 h-5" />
                Order Food Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!user && (
                <Link to="/register"
                  className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all">
                  Register with SAP ID
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-5 pt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />Live kitchen tracking
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Cash, UPI &amp; Campus Card
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />100% Pure Veg &amp; Jain
              </span>
            </div>
          </div>

          {/* Hero Food Image Stack */}
          <div className="flex-shrink-0 relative w-72 h-64 hidden md:block">
            <img
              src="/images/foods/veg-thali.jpg"
              alt="Indian Thali Special Meal"
              className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl rotate-3 border-4 border-white/20 bg-[#f8f8f0]"
              style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }}
            />
            <img
              src="/images/foods/veg-biryani.jpg"
              alt="Hyderabadi Veg Dum Biryani"
              className="absolute top-5 left-5 w-full h-full object-cover rounded-3xl shadow-2xl -rotate-2 border-4 border-white/10 opacity-80 bg-[#f8f8f0]"
              style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }}
            />
            <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white font-black text-xs px-4 py-2 rounded-2xl shadow-lg rotate-2 z-10">
              🔥 30+ Items Available
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label} className={`${bg} rounded-3xl p-6 flex flex-col items-center text-center gap-2 border border-white shadow-sm hover:shadow-md transition-shadow`}>
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <span className={`text-2xl font-black ${color}`}>{value}</span>
            <span className="text-xs font-semibold text-slate-600">{label}</span>
          </div>
        ))}
      </section>

      {/* POPULAR PRODUCT CARDS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Flame className="w-4 h-4" /> Today's Favourites
            </span>
            <h2 className="text-3xl font-black text-slate-900">Most Loved Dishes</h2>
          </div>
          <Link to="/menu"
            className="group hidden md:flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
            View Full Menu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {FEATURED_FOODS.map((food) => (
            <Link key={food.name} to="/menu"
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-36 overflow-hidden bg-[#f8f8f0]">
                <img
                  src={food.img}
                  alt={food.alt || food.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-[#f8f8f0]"
                  style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full shadow">
                  {food.tag}
                </span>
              </div>
              <div className="p-3">
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider block">{food.cat}</span>
                <h3 className="text-xs font-black text-slate-900 mt-0.5 leading-tight">{food.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-black text-orange-600">₹{food.price}</span>
                  <span className="text-[10px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded-full group-hover:bg-orange-600 transition-colors">
                    Order →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center md:hidden">
          <Link to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 text-white text-sm font-extrabold shadow-md hover:bg-orange-700 transition-colors">
            View All 30+ Items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* DAILY SPECIALS SECTION */}
      {specials.length > 0 && (
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <Calendar className="w-4 h-4" /> Chef's Special Schedule
              </span>
              <h2 className="text-2xl font-black text-slate-900">Full Week Cafeteria Specials</h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
              <Bot className="w-4 h-4" /> Ask BiteBot AI for Schedule
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {specials.map((s) => (
              <button key={s.day} onClick={() => setActiveDay(s.day)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  activeDay === s.day
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {s.day.slice(0, 3)} Special
              </button>
            ))}
          </div>

          {activeSpecial && (
            <div className="bg-gradient-to-br from-slate-900 to-orange-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative w-full md:w-2/5 aspect-[4/3] rounded-2xl overflow-hidden bg-[#f8f8f0] shrink-0">
                <img
                  src={activeSpecial.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                  alt={activeSpecial.specialItem || 'Daily Chef Special Food'}
                  className="w-full h-full object-cover bg-[#f8f8f0]"
                  style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }}
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black bg-orange-600 text-white shadow-md">
                  {activeSpecial.day} Special
                </span>
              </div>
              <div className="w-full md:w-3/5 space-y-4 relative z-10">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">{activeSpecial.title}</span>
                <h3 className="text-2xl md:text-3xl font-black text-white">{activeSpecial.specialItem}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{activeSpecial.description}</p>
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Special Price</span>
                    <span className="text-3xl font-black text-amber-400">₹{activeSpecial.price}</span>
                  </div>
                  <Link to="/menu"
                    className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95">
                    Order Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* WHY US SECTION */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Why Students Love Us</span>
          <h2 className="text-3xl font-black text-slate-900">The Smarter Way to Eat on Campus</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '⚡', title: 'Zero Queue Wait', desc: 'Order from your classroom or hostel. Walk in only to pick up your hot meal.' },
            { emoji: '🛡️', title: 'SVKM Verified Access', desc: 'Exclusively for SVKM students, teachers & staff. Secure login with your SAP ID.' },
            { emoji: '✨', title: 'Fresh & Hygienic', desc: 'Prepared fresh each day under strict hygiene standards by expert campus chefs.' },
          ].map(({ emoji, title, desc }) => (
            <div key={title}
              className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl mb-5">
                {emoji}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ea580c 0%, #d97706 50%, #ea580c 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-10">
          <div className="text-white text-center md:text-left space-y-2">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <SvkmLogo className="h-8 w-auto brightness-0 invert" showText={false} />
              <span className="font-black text-white/80 text-sm uppercase tracking-widest">SVKM Campus Canteen</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">Hungry? Let's Order.</h2>
            <p className="text-orange-100 text-sm">30+ dishes. Ready in minutes. Cash, UPI or Campus Card.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/menu"
              className="px-8 py-4 rounded-2xl bg-white text-orange-600 font-extrabold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 active:scale-95">
              <UtensilsCrossed className="w-5 h-5" /> Browse Menu
            </Link>
            {!user && (
              <Link to="/register"
                className="px-8 py-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-sm border border-white/30 backdrop-blur-sm transition-all flex items-center gap-2">
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

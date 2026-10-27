import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  Heart,
  Award,
  Zap,
  Leaf,
  ShieldCheck,
  Smile,
  X,
  Plus,
  Minus,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';

export const ArtisanShowcase = () => {
  // 1. Percentage Page Loader State
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isLoadingDone, setIsLoadingDone] = useState(false);

  // 2. Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // 3. Mega Menu State
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  // 4. Cart Drawer & Product Pack Selection
  const { addToCart, cartCount, cartSubtotal } = useCart();
  const { addToast } = useToast();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedPacks, setSelectedPacks] = useState({}); // productId -> packSize ('single'|'pack'|'bulk')

  // 5. Easter Egg Mini Game State
  const [score, setScore] = useState(0);
  const [cookiePos, setCookiePos] = useState({ top: 40, left: 50 });

  // Loading animation (0% -> 100%)
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingPercent(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoadingDone(true), 400);
          return 100;
        }
        return prev + 5;
      });
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // Hero Auto-Rotating Slider
  const HERO_SLIDES = [
    {
      id: 1,
      titleMain: 'Crafted with',
      titleAccent: 'Pure Passion',
      subText: 'Artisan recipes freshly prepared every morning in small batches.',
      bullets: ['100% Organic & Non-GMO', 'No Artificial Preservatives'],
      image: '/images/foods/veg-puff.jpg',
      badge: 'Artisan Batch #84'
    },
    {
      id: 2,
      titleMain: 'Freshly Baked',
      titleAccent: 'Golden Perfection',
      subText: 'Rich flavors inspired by traditional college food culture & heritage.',
      bullets: ['Sourced From Local Farmers', 'Baked Fresh Every Hour'],
      image: '/images/foods/samosa.jpg',
      badge: 'Chef’s Favorite'
    },
    {
      id: 3,
      titleMain: 'Refreshing &',
      titleAccent: 'Naturally Bold',
      subText: 'Real fruit extractions & cold brewed espressos to fuel your campus day.',
      bullets: ['Zero Added Refined Sugar', 'High Energy Boost'],
      image: '/images/foods/cold-brew-float.jpg',
      badge: 'Cold Brewed'
    },
    {
      id: 4,
      titleMain: 'SVKM Special',
      titleAccent: 'Jain Delights',
      subText: 'Authentic 100% Jain delicacies prepared with pure devotion and care.',
      bullets: ['No Root Vegetables', 'Strict Dedicated Kitchen Setup'],
      image: '/images/foods/jain-thali.jpg',
      badge: 'Jain Certified 🪷'
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  // Products Data with Pack Sizes
  const ARTISAN_PRODUCTS = [
    {
      id: 'dtc-1',
      name: 'Artisan Punjabi Samosa',
      category: 'Snacks',
      description: 'Hand-folded potato pastry infused with roasted cumin, mint & tamarind sauce.',
      image: '/images/foods/samosa.jpg',
      isVeg: true,
      isJain: false,
      prices: { single: 30, pack: 80, bulk: 150 },
      labels: { single: 'Single (2 Pcs)', pack: 'Triple Pack (6 Pcs)', bulk: 'Party Box (12 Pcs)' }
    },
    {
      id: 'dtc-2',
      name: 'Cold Brew Espresso Float',
      category: 'Beverages',
      description: 'Slow 18-hour steep espresso topped with Madagascar vanilla ice cream.',
      image: '/images/foods/cold-brew-float.jpg',
      isVeg: true,
      isJain: true,
      prices: { single: 70, pack: 190, bulk: 350 },
      labels: { single: 'Regular 350ml', pack: '3-Bottle Pack', bulk: 'Box of 6 Bottles' }
    },
    {
      id: 'dtc-3',
      name: 'Jain Shahi Paneer Special',
      description: 'Rich cashew and saffron tomato gravy with soft cottage cheese (No root veg).',
      image: '/images/foods/paneer-tikka.jpg',
      isVeg: true,
      isJain: true,
      prices: { single: 140, pack: 390, bulk: 750 },
      labels: { single: 'Single Meal', pack: 'Family Pack', bulk: 'Catering Tub' }
    },
    {
      id: 'dtc-4',
      name: 'Hot Chocolate Walnut Brownie',
      description: 'Decadent 70% dark Belgian chocolate brownie with roasted walnuts.',
      image: '/images/foods/brownie.jpg',
      isVeg: true,
      isJain: true,
      prices: { single: 90, pack: 250, bulk: 480 },
      labels: { single: '1 Slice', pack: 'Trio Box', bulk: 'Gift Box of 6' }
    }
  ];

  const handleAddProduct = (prod) => {
    const packSize = selectedPacks[prod.id] || 'single';
    const price = prod.prices[packSize];
    const packLabel = prod.labels[packSize];

    addToCart({
      id: `${prod.id}-${packSize}`,
      name: `${prod.name} (${packLabel})`,
      price: price,
      image: prod.image,
      categoryName: prod.category,
      isAvailable: true
    }, 1);

    addToast(`Added ${prod.name} (${packLabel}) to basket!`, 'success');
  };

  // Easter Egg mini game
  const moveCookie = () => {
    setScore(s => s + 1);
    setCookiePos({
      top: Math.floor(Math.random() * 70) + 15,
      left: Math.floor(Math.random() * 70) + 15
    });
  };

  if (!isLoadingDone) {
    return (
      <div className="fixed inset-0 z-50 bg-[#2c1a12] text-[#f8f8f0] flex flex-col items-center justify-center p-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="font-serif italic text-amber-400 text-lg">Handcrafted & Pure</span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-[#f8f8f0]">
            The Feed Zone Artisan
          </h1>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-64 space-y-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-75"
              style={{ width: `${loadingPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono font-bold text-amber-300">
            <span>PREPARING EXPERIENCE</span>
            <span>{loadingPercent}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfbf7] text-[#2c1a12] font-sans min-h-screen space-y-20 pb-20 selection:bg-rose-500 selection:text-white">
      
      {/* STICKY DTC NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#fcfbf7]/90 backdrop-blur-md border-b border-[#2c1a12]/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:rotate-6 transition-transform">
              B
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#2c1a12]">
              The Feed <span className="font-sans font-black text-rose-600">Zone</span>
            </span>
          </a>

          {/* Nav Links with Mega Menu */}
          <div className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-[#2c1a12]/80">
            <a href="#story" className="hover:text-rose-600 transition-colors">Our Story</a>
            
            {/* Mega Menu Trigger */}
            <div className="relative group">
              <button
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                className="hover:text-rose-600 transition-colors flex items-center gap-1 py-1"
              >
                Categories ▾
              </button>

              {/* Mega Menu Dropdown */}
              {isMegaMenuOpen && (
                <div
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                  className="absolute top-full left-0 w-80 bg-white border border-[#2c1a12]/10 rounded-2xl p-4 shadow-2xl space-y-3 z-50 animate-slide-up"
                >
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block">
                    Artisan Categories
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <a href="#products" className="p-2.5 rounded-xl bg-[#fcfbf7] hover:bg-orange-50 text-[#2c1a12] block">
                      🥐 Hot Snacks
                    </a>
                    <a href="#products" className="p-2.5 rounded-xl bg-[#fcfbf7] hover:bg-orange-50 text-[#2c1a12] block">
                      ☕ Cold Brews
                    </a>
                    <a href="#products" className="p-2.5 rounded-xl bg-[#fcfbf7] hover:bg-orange-50 text-[#2c1a12] block">
                      🪷 Jain Specials
                    </a>
                    <a href="#products" className="p-2.5 rounded-xl bg-[#fcfbf7] hover:bg-orange-50 text-[#2c1a12] block">
                      🍨 Desserts
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a href="#products" className="hover:text-rose-600 transition-colors">Craft Flavors</a>
            <a href="#reviews" className="hover:text-rose-600 transition-colors">Reviews</a>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2.5 rounded-xl bg-[#2c1a12]/5 hover:bg-rose-50 text-[#2c1a12] transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          <a
            href="#products"
            className="px-5 py-2.5 rounded-xl bg-[#2c1a12] hover:bg-rose-600 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
          >
            Shop Artisan
          </a>
        </div>
      </nav>

      {/* HERO SECTION: Full-Width Auto-Rotating Slider */}
      <section className="relative h-[80vh] min-h-[550px] w-full overflow-hidden bg-[#2c1a12] text-white">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.titleMain}
              className="w-full h-full object-cover opacity-45 scale-105 transition-transform duration-[8000ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a12] via-[#2c1a12]/40 to-transparent" />

            <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center space-y-6 z-20">
              <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-400 text-[#2c1a12] w-fit uppercase tracking-widest shadow-md">
                {slide.badge}
              </span>

              {/* Two-Line Display Headline (Serif + Bold Rounded Sans) */}
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                <span className="font-serif italic text-amber-200 block font-normal">{slide.titleMain}</span>
                <span className="font-sans text-rose-500 uppercase tracking-wider">{slide.titleAccent}</span>
              </h1>

              <p className="text-slate-300 text-base md:text-lg max-w-xl font-medium leading-relaxed">
                {slide.subText}
              </p>

              {/* Value prop bullets */}
              <div className="flex flex-wrap gap-4 text-xs font-bold text-amber-200">
                {slide.bullets.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <Check className="w-4 h-4 text-emerald-400" /> {b}
                  </span>
                ))}
              </div>

              {/* Kinetic Double-Letter Hover Button */}
              <a
                href="#products"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-rose-600/30 transition-all w-fit active:scale-95 overflow-hidden"
              >
                <span>Order Fresh Batch</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </a>
            </div>
          </div>
        ))}

        {/* Slider Navigation Dots */}
        <div className="absolute bottom-8 left-6 sm:left-12 z-30 flex items-center gap-3">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-rose-500' : 'w-2.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* STATS / TRUST STRIP */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#2c1a12] text-[#f8f8f0] rounded-3xl p-8 md:p-12 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-amber-400">100%</div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Pure Veg & Organic</span>
          </div>

          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-rose-500">15 MIN</div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Express Campus Pickup</span>
          </div>

          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-amber-400">0%</div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Added Preservatives</span>
          </div>

          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-emerald-400">4.9 ★</div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">10,000+ SVKM Reviews</span>
          </div>
        </div>
      </section>

      {/* FEATURE ICON ROW */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#2c1a12]/10 space-y-3 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#2c1a12]">Farm Fresh Sourcing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Directly sourced vegetables & grains from local ethical organic farms.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#2c1a12]/10 space-y-3 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#2c1a12]">Small Batch Baking</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Prepared in small morning batches to guarantee peak texture and flavor.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#2c1a12]/10 space-y-3 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#2c1a12]">Jain Certified 🪷</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Dedicated kitchen section for 100% authentic Jain food preparation.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#2c1a12]/10 space-y-3 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#2c1a12]">Instant SAP ID Pickup</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Show your unique Order ID at counter #2 for zero wait pickup.</p>
        </div>
      </section>

      {/* STORYTELLING SECTION */}
      <section id="story" className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="max-w-2xl space-y-4">
          <span className="font-serif italic text-rose-600 text-lg block">The Artisan Promise</span>
          <h2 className="text-4xl font-black text-[#2c1a12] tracking-tight">
            Rooted in Taste, Built for Campus Life.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            We believe college food should never compromise on quality. Every morning at 5:00 AM, our campus kitchen comes alive with the aroma of freshly ground spices, slow-steeped espresso, and golden samosa pastries.
          </p>
        </div>

        {/* Process Image Carousel */}
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          <div className="w-80 h-96 rounded-3xl overflow-hidden shrink-0 relative group shadow-md bg-[#f8f8f0]">
            <img src="/images/foods/veg-thali.jpg" alt="Hand-Picked Organic Food Ingredients" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-[#f8f8f0]" style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 text-white">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Step 01</span>
                <h4 className="font-extrabold text-base">Hand-Picked Ingredients</h4>
              </div>
            </div>
          </div>

          <div className="w-80 h-96 rounded-3xl overflow-hidden shrink-0 relative group shadow-md bg-[#f8f8f0]">
            <img src="/images/foods/cold-brew-float.jpg" alt="Slow Brew Cold Coffee Extraction" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-[#f8f8f0]" style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 text-white">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Step 02</span>
                <h4 className="font-extrabold text-base">Slow Brew Extraction</h4>
              </div>
            </div>
          </div>

          <div className="w-80 h-96 rounded-3xl overflow-hidden shrink-0 relative group shadow-md bg-[#f8f8f0]">
            <img src="/images/foods/samosa.jpg" alt="Artisan Punjabi Samosa Folding Process" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-[#f8f8f0]" style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 text-white">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Step 03</span>
                <h4 className="font-extrabold text-base">Artisan Folding</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID / FLAVOR CARDS */}
      <section id="products" className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-rose-600 uppercase tracking-widest">DTC Collection</span>
            <h2 className="text-3xl font-black text-[#2c1a12]">Handcrafted Flavors & Bundles</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ARTISAN_PRODUCTS.map((prod) => {
            const currentPack = selectedPacks[prod.id] || 'single';
            const price = prod.prices[currentPack];

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-[#2c1a12]/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-square overflow-hidden bg-[#f8f8f0]">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-[#f8f8f0]"
                      style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    {prod.isJain && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-700 text-amber-200 shadow-md">
                        🪷 Jain Available
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className="font-black text-base text-[#2c1a12] line-clamp-1">{prod.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{prod.description}</p>

                    {/* Pack-Size Selector */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Select Size</span>
                      <div className="grid grid-cols-3 gap-1">
                        {['single', 'pack', 'bulk'].map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedPacks({ ...selectedPacks, [prod.id]: size })}
                            className={`py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                              currentPack === size
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Price</span>
                    <span className="text-xl font-black text-[#2c1a12]">₹{price}</span>
                  </div>

                  <button
                    onClick={() => handleAddProduct(prod)}
                    className="px-4 py-2.5 rounded-xl bg-[#2c1a12] hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SOCIAL PROOF: Infinite Marquee */}
      <section id="reviews" className="bg-[#2c1a12] text-white py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
          <span className="font-serif italic text-amber-400 text-lg">Student Approved</span>
          <h2 className="text-3xl font-black uppercase tracking-wider text-white">What SVKM Campus Says</h2>
        </div>

        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {[
            { handle: '@arav_nmims', text: 'Best cold coffee on campus! Saved my exams week.' },
            { handle: '@sneha_svkm', text: 'The Jain Paneer Butter Masala tastes 100% home cooked.' },
            { handle: '@rohit_dj', text: 'Ordered via SAP ID and picked up in 10 mins. Zero line!' },
            { handle: '@priya_k', text: 'Samosas are crispy and fresh every single morning.' }
          ].map((rev, i) => (
            <div key={i} className="inline-block bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-xs font-semibold max-w-xs shrink-0 space-y-2">
              <div className="flex items-center text-amber-400 gap-1">
                {'★'.repeat(5)}
              </div>
              <p className="text-slate-200 whitespace-normal">"{rev.text}"</p>
              <span className="text-rose-400 font-bold block">{rev.handle}</span>
            </div>
          ))}
        </div>
      </section>

      {/* EASTER EGG MINI GAME: Catch the Golden Snack */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden h-80 flex flex-col justify-center items-center">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase">
            Mini Game Easter Egg 🎮
          </span>
          <h3 className="text-2xl font-black">Catch the Golden Snack for Extra Delight!</h3>
          <p className="text-xs text-amber-100">Click the floating snack icon below to increase your snack score!</p>

          <div className="text-3xl font-black bg-white/20 px-6 py-2 rounded-2xl font-mono">
            Score: {score}
          </div>

          {/* Interactive Clickable Floating Element */}
          <button
            onClick={moveCookie}
            className="absolute p-3 rounded-full bg-white text-2xl shadow-2xl hover:scale-125 transition-all duration-300 animate-bounce"
            style={{ top: `${cookiePos.top}%`, left: `${cookiePos.left}%` }}
          >
            🥟
          </button>
        </div>
      </section>

      {/* CLOSING STATEMENT */}
      <section className="relative py-24 bg-[#2c1a12] text-white text-center px-6 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1600&q=80"
          alt="Fresh Baked Canteen Snacks & Dishes"
          className="absolute inset-0 w-full h-full object-cover opacity-20 bg-[#f8f8f0]"
          style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }}
        />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-6xl font-black font-serif italic text-amber-200">
            "Good Food Inspires Great Minds."
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Experience the finest artisan cafeteria dining exclusively at SVKM Campus.
          </p>
          <a
            href="#products"
            className="inline-block px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-widest shadow-2xl transition-all"
          >
            Order Your Snack Batch Now
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-600 border-t border-[#2c1a12]/10 pt-12">
        <div className="space-y-3">
          <span className="font-serif text-lg font-bold text-[#2c1a12]">The Feed Zone Artisan</span>
          <p className="leading-relaxed">Handcrafted food & beverage platform for SVKM students & staff.</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-black text-[#2c1a12] uppercase">Locations</h4>
          <p>Main Campus Counter #2</p>
          <p>NMIMS Building Cafeteria</p>
          <p>DJ Sanghvi Food Court</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-black text-[#2c1a12] uppercase">Connect</h4>
          <div className="flex gap-3 text-slate-700">
            <Instagram className="w-4 h-4 cursor-pointer hover:text-rose-600" />
            <Twitter className="w-4 h-4 cursor-pointer hover:text-rose-600" />
            <Facebook className="w-4 h-4 cursor-pointer hover:text-rose-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-black text-[#2c1a12] uppercase">Hours</h4>
          <p>Mon - Sat: 8:00 AM - 8:30 PM</p>
          <p>Sun: 9:00 AM - 5:00 PM</p>
        </div>
      </footer>
    </div>
  );
};

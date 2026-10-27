import React, { useState } from 'react';
import { Utensils, Coffee, Pizza, Cake, Flame, Sparkles } from 'lucide-react';

const CategorySvgFallback = ({ categoryName, name }) => {
  const lowerCat = (categoryName || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();

  let bgGradient = 'from-orange-500 to-amber-600';
  let icon = <Utensils className="w-10 h-10 text-white stroke-[2.5]" />;
  let label = 'Delicious Dish';

  if (lowerCat.includes('beverage') || lowerName.includes('coffee') || lowerName.includes('chai') || lowerName.includes('milk') || lowerName.includes('juice') || lowerName.includes('shake')) {
    bgGradient = 'from-amber-600 to-yellow-700';
    icon = <Coffee className="w-10 h-10 text-amber-100 stroke-[2.5]" />;
    label = 'Beverage & Drink';
  } else if (lowerCat.includes('fast') || lowerName.includes('burger') || lowerName.includes('fries') || lowerName.includes('pizza') || lowerName.includes('sandwich') || lowerName.includes('wrap')) {
    bgGradient = 'from-rose-500 to-orange-600';
    icon = <Pizza className="w-10 h-10 text-rose-100 stroke-[2.5]" />;
    label = 'Fast Food & Snacks';
  } else if (lowerCat.includes('dessert') || lowerName.includes('brownie') || lowerName.includes('jamun') || lowerName.includes('kulfi') || lowerName.includes('cake') || lowerName.includes('rasgulla')) {
    bgGradient = 'from-pink-600 to-purple-700';
    icon = <Cake className="w-10 h-10 text-pink-100 stroke-[2.5]" />;
    label = 'Bakery & Dessert';
  } else if (lowerCat.includes('jain') || lowerName.includes('jain')) {
    bgGradient = 'from-purple-700 to-indigo-800';
    icon = <Sparkles className="w-10 h-10 text-amber-300 stroke-[2.5]" />;
    label = '100% Jain Special';
  } else if (lowerCat.includes('south') || lowerName.includes('dosa') || lowerName.includes('idli') || lowerName.includes('uttapam')) {
    bgGradient = 'from-emerald-600 to-teal-700';
    icon = <Flame className="w-10 h-10 text-emerald-100 stroke-[2.5]" />;
    label = 'South Indian Food';
  }

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-4 text-white relative overflow-hidden transition-transform duration-500`}
      style={{ backgroundColor: '#f8f8f0' }}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-30" />
      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg mb-1 relative z-10 border border-white/30">
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-wider text-white/90 relative z-10 drop-shadow-sm text-center line-clamp-1 px-2">
        {name || label}
      </span>
      <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest relative z-10 mt-0.5">
        SVKM Canteen Kitchen
      </span>
    </div>
  );
};

export const FoodImage = ({ src, alt, categoryName, className = '', loading = 'eager' }) => {
  const [hasError, setHasError] = useState(false);

  // Exact verified local food photo mapping based on food item keywords
  const getKeywordImageUrl = (dishName = '') => {
    const lower = (dishName || '').toLowerCase();
    if (lower.includes('samosa')) return '/images/foods/samosa.jpg';
    if (lower.includes('vada') || lower.includes('vada pav')) return '/images/foods/vada-pav.jpg';
    if (lower.includes('kachori')) return '/images/foods/kachori.jpg';
    if (lower.includes('puff')) return '/images/foods/veg-puff.jpg';
    if (lower.includes('sandwich')) return '/images/foods/sandwich.jpg';
    if (lower.includes('bhel')) return '/images/foods/bhel-puri.jpg';
    if (lower.includes('cold brew') || lower.includes('espresso float')) return '/images/foods/cold-brew-float.jpg';
    if (lower.includes('cold coffee') || lower.includes('coffee')) return '/images/foods/cold-coffee.jpg';
    if (lower.includes('chai') || lower.includes('tea')) return '/images/foods/masala-chai.jpg';
    if (lower.includes('lime') || lower.includes('soda')) return '/images/foods/lime-soda.jpg';
    if (lower.includes('badam') || lower.includes('milk')) return '/images/foods/badam-milk.jpg';
    if (lower.includes('mango') || lower.includes('shake')) return '/images/foods/mango-milkshake.jpg';
    if (lower.includes('jain') && lower.includes('biryani')) return '/images/foods/jain-biryani.jpg';
    if (lower.includes('biryani')) return '/images/foods/veg-biryani.jpg';
    if (lower.includes('pav bhaji') || lower.includes('bhaji')) return '/images/foods/pav-bhaji.jpg';
    if (lower.includes('dal') || lower.includes('makhani')) return '/images/foods/dal-makhani.jpg';
    if (lower.includes('jain') && lower.includes('thali')) return '/images/foods/jain-thali.jpg';
    if (lower.includes('thali')) return '/images/foods/veg-thali.jpg';
    if (lower.includes('wrap') || lower.includes('roll')) return '/images/foods/paneer-wrap.jpg';
    if (lower.includes('paneer') || lower.includes('tikka')) return '/images/foods/paneer-tikka.jpg';
    if (lower.includes('burger')) return '/images/foods/veg-burger.jpg';
    if (lower.includes('fries')) return '/images/foods/french-fries.jpg';
    if (lower.includes('hot dog') || lower.includes('hotdog')) return '/images/foods/veg-hot-dog.jpg';
    if (lower.includes('dosa')) return '/images/foods/masala-dosa.jpg';
    if (lower.includes('idli')) return '/images/foods/idli-sambar.jpg';
    if (lower.includes('uttapam')) return '/images/foods/veg-uttapam.jpg';
    if (lower.includes('brownie') || lower.includes('cake')) return '/images/foods/brownie.jpg';
    if (lower.includes('gulab jamun') || lower.includes('jamun')) return '/images/foods/gulab-jamun.jpg';
    if (lower.includes('rasgulla')) return '/images/foods/rasgulla.jpg';
    if (lower.includes('kulfi')) return '/images/foods/matka-kulfi.jpg';
    if (lower.includes('pizza')) return '/images/foods/veg-pizza.jpg';
    if (lower.includes('fried rice') || lower.includes('rice') || lower.includes('chole')) return '/images/foods/fried-rice.jpg';
    return '/images/foods/veg-thali.jpg';
  };

  // Determine cleanest authentic image source
  const resolveImage = () => {
    // If src is an old known mismatched or broken Unsplash URL, automatically map to local
    if (!src || src.includes('images.unsplash.com')) {
      const mapped = getKeywordImageUrl(alt);
      if (mapped) return mapped;
    }
    return src || getKeywordImageUrl(alt);
  };

  const [currentSrc, setCurrentSrc] = useState(resolveImage());

  // Update image when src or alt props change
  React.useEffect(() => {
    setCurrentSrc(resolveImage());
    setHasError(false);
  }, [src, alt]);

  if (hasError) {
    return <CategorySvgFallback categoryName={categoryName} name={alt} />;
  }

  return (
    <img
      src={currentSrc}
      alt={alt || 'Food item photo'}
      onError={() => {
        // Fallback to local image keyword mapping first if not already tried
        const localFallback = getKeywordImageUrl(alt);
        if (currentSrc !== localFallback) {
          setCurrentSrc(localFallback);
        } else {
          setHasError(true);
        }
      }}
      className={`w-full h-full object-cover bg-[#f8f8f0] ${className}`}
      style={{ backgroundColor: '#f8f8f0', objectFit: 'cover' }}
      loading={loading}
    />
  );
};


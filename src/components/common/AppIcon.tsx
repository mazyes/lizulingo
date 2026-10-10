import React from 'react';
import {
  Apple,
  Bath,
  Bed,
  Bird,
  BookOpen,
  Building,
  Building2,
  Calendar,
  Car,
  Cat,
  Citrus,
  Clock,
  Coffee,
  Coins,
  Crown,
  Dog,
  Eye,
  Fish,
  Flame,
  Gamepad2,
  Gem,
  Gift,
  Globe,
  GraduationCap,
  Hand,
  Heart,
  HelpCircle,
  Home,
  Laptop,
  MessageCircle,
  Moon,
  Mountain,
  Music,
  Package,
  Palmtree,
  PartyPopper,
  Phone,
  Pill,
  Plane,
  Rabbit,
  RotateCcw,
  Salad,
  Sandwich,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Sun,
  Tag,
  Target,
  Ticket,
  Train,
  TreePine,
  Trees,
  Trophy,
  User,
  Users,
  Utensils,
  UtensilsCrossed,
  Waves,
  Zap,
} from 'lucide-react';

export const FlagDE: React.FC<{ className?: string; size?: number }> = ({ className = 'w-6 h-4', size }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block shrink-0 shadow-xs rounded-[2px] ${className}`}
    style={size ? { width: size * 1.33, height: size } : undefined}
  >
    <path fill="#000" d="M0 0h640v160H0z" />
    <path fill="#D00" d="M0 160h640v160H0z" />
    <path fill="#FFCE00" d="M0 320h640v160H0z" />
  </svg>
);

export const FlagGE: React.FC<{ className?: string; size?: number }> = ({ className = 'w-6 h-4', size }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block shrink-0 shadow-xs rounded-[2px] ${className}`}
    style={size ? { width: size * 1.33, height: size } : undefined}
  >
    <path fill="#fff" d="M0 0h640v480H0z" />
    <path fill="#f00" d="M260 0h120v480H260z" />
    <path fill="#f00" d="M0 180h640v120H0z" />
    <g fill="#f00">
      <path d="M110 70h40v40h-40z" />
      <path d="M490 70h40v40h-40z" />
      <path d="M110 370h40v40h-40z" />
      <path d="M490 370h40v40h-40z" />
    </g>
  </svg>
);

export const FlagGB: React.FC<{ className?: string; size?: number }> = ({ className = 'w-6 h-4', size }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block shrink-0 shadow-xs rounded-[2px] ${className}`}
    style={size ? { width: size * 1.33, height: size } : undefined}
  >
    <path fill="#012169" d="M0 0h640v480H0z" />
    <path fill="#fff" d="m75 0 245 180L565 0h75v50L400 240l240 190v50h-75L320 300 75 480H0v-50l240-190L0 50V0z" />
    <path fill="#C8102E" d="m424 282 216 168v30h-38L382 312zm-208-84L0 30V0h38l220 168zm208-30L640 0v12L446 168zM0 468l194-150h44L22 480H0z" />
    <path fill="#fff" d="M250 0h140v480H250zM0 170h640v140H0z" />
    <path fill="#C8102E" d="M276 0h88v480h-88zM0 196h640v88H0z" />
  </svg>
);

export const FlagFR: React.FC<{ className?: string; size?: number }> = ({ className = 'w-6 h-4', size }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block shrink-0 shadow-xs rounded-[2px] ${className}`}
    style={size ? { width: size * 1.33, height: size } : undefined}
  >
    <path fill="#002654" d="M0 0h213.3v480H0z" />
    <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
    <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
  </svg>
);

export const FlagES: React.FC<{ className?: string; size?: number }> = ({ className = 'w-6 h-4', size }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block shrink-0 shadow-xs rounded-[2px] ${className}`}
    style={size ? { width: size * 1.33, height: size } : undefined}
  >
    <path fill="#AA151B" d="M0 0h640v120H0zm0 360h640v120H0z" />
    <path fill="#F1BF00" d="M0 120h640v240H0z" />
  </svg>
);

export const FlagIT: React.FC<{ className?: string; size?: number }> = ({ className = 'w-6 h-4', size }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block shrink-0 shadow-xs rounded-[2px] ${className}`}
    style={size ? { width: size * 1.33, height: size } : undefined}
  >
    <path fill="#009246" d="M0 0h213.3v480H0z" />
    <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
    <path fill="#ce2b37" d="M426.7 0H640v480H426.7z" />
  </svg>
);

interface AppIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className = '', size = 28 }) => {
  const clean = (name || '').trim();

  // Country Flags
  if (clean === '🇩🇪' || clean.toLowerCase() === 'de' || clean.toLowerCase() === 'deutschland') {
    return <FlagDE className={className} size={size} />;
  }
  if (clean === '🇬🇪' || clean.toLowerCase() === 'ge' || clean.toLowerCase() === 'georgien') {
    return <FlagGE className={className} size={size} />;
  }
  if (clean === '🇬🇧' || clean.toLowerCase() === 'gb' || clean.toLowerCase() === 'englisch') {
    return <FlagGB className={className} size={size} />;
  }
  if (clean === '🇫🇷' || clean.toLowerCase() === 'fr' || clean.toLowerCase() === 'frankreich') {
    return <FlagFR className={className} size={size} />;
  }
  if (clean === '🇪🇸' || clean.toLowerCase() === 'es' || clean.toLowerCase() === 'spanien') {
    return <FlagES className={className} size={size} />;
  }
  if (clean === '🇮🇹' || clean.toLowerCase() === 'it' || clean.toLowerCase() === 'italien') {
    return <FlagIT className={className} size={size} />;
  }

  // Common UI & Gamification items
  if (clean === '⚡' || clean.toLowerCase() === 'lightning' || clean.toLowerCase() === 'xp') {
    return <Zap className={`text-amber-500 fill-amber-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🔥' || clean.toLowerCase() === 'fire' || clean.toLowerCase() === 'streak') {
    return <Flame className={`text-lizu-orange fill-lizu-orange shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '❤️' || clean === '❤' || clean.toLowerCase() === 'heart' || clean.toLowerCase() === 'hearts') {
    return <Heart className={`text-lizu-red fill-lizu-red shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🏆' || clean.toLowerCase() === 'trophy' || clean.toLowerCase() === 'record') {
    return <Trophy className={`text-amber-500 fill-amber-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '👑' || clean.toLowerCase() === 'crown' || clean.toLowerCase() === 'boss') {
    return <Crown className={`text-amber-400 fill-amber-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '💎' || clean.toLowerCase() === 'gem') {
    return <Gem className={`text-cyan-500 fill-cyan-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🪙' || clean.toLowerCase() === 'coin' || clean.toLowerCase() === 'coins') {
    return <Coins className={`text-amber-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '⭐' || clean === '🌟' || clean.toLowerCase() === 'star') {
    return <Star className={`text-amber-400 fill-amber-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🎉' || clean.toLowerCase() === 'party') {
    return <PartyPopper className={`text-purple-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '✨' || clean.toLowerCase() === 'sparkles') {
    return <Sparkles className={`text-amber-400 fill-amber-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🎯' || clean.toLowerCase() === 'target') {
    return <Target className={`text-red-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '❓' || clean.toLowerCase() === 'question') {
    return <HelpCircle className={`text-lizu-blue shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '👋' || clean === '😊' || clean === '😋' || clean.toLowerCase() === 'wave' || clean.toLowerCase() === 'smile') {
    return <Smile className={`text-amber-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🌱' || clean.toLowerCase() === 'sprout') {
    return <Sprout className={`text-emerald-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🎒' || clean.toLowerCase() === 'tasche' || clean.toLowerCase() === 'backpack') {
    return <ShoppingBag className={`text-red-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🏷️' || clean === '🏷' || clean.toLowerCase() === 'tag') {
    return <Tag className={`text-blue-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '📖' || clean.toLowerCase() === 'book' || clean.toLowerCase() === 'lernen') {
    return <BookOpen className={`text-emerald-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🌍' || clean.toLowerCase() === 'globe' || clean.toLowerCase() === 'world') {
    return <Globe className={`text-blue-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '☕' || clean.toLowerCase() === 'kaffee' || clean.toLowerCase() === 'coffee') {
    return <Coffee className={`text-amber-700 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '⏰' || clean.toLowerCase() === 'uhr' || clean.toLowerCase() === 'clock') {
    return <Clock className={`text-indigo-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '📅' || clean === '🗓️' || clean === '🗓' || clean.toLowerCase() === 'calendar') {
    return <Calendar className={`text-emerald-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🛒' || clean.toLowerCase() === 'cart' || clean.toLowerCase() === 'einkaufen') {
    return <ShoppingCart className={`text-emerald-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🏠' || clean === '🏡' || clean.toLowerCase() === 'haus') {
    return <Home className={`text-rose-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🏢' || clean === '🏙️' || clean === '🏙' || clean.toLowerCase() === 'stadt' || clean.toLowerCase() === 'wohnung') {
    return <Building2 className={`text-blue-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🏨' || clean.toLowerCase() === 'hotel') {
    return <Building className={`text-amber-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🛏️' || clean === '🛏' || clean.toLowerCase() === 'zimmer') {
    return <Bed className={`text-indigo-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🍳' || clean.toLowerCase() === 'kueche' || clean.toLowerCase() === 'küche') {
    return <UtensilsCrossed className={`text-orange-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🚿' || clean.toLowerCase() === 'bad') {
    return <Bath className={`text-cyan-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '💊' || clean.toLowerCase() === 'apotheke') {
    return <Pill className={`text-rose-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🎫' || clean.toLowerCase() === 'ticket' || clean.toLowerCase() === 'fahrkarte') {
    return <Ticket className={`text-purple-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🚗' || clean.toLowerCase() === 'auto') {
    return <Car className={`text-blue-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🚆' || clean === '🚊' || clean === '🚉' || clean.toLowerCase() === 'zug' || clean.toLowerCase() === 'bahn' || clean.toLowerCase() === 'bahnhof') {
    return <Train className={`text-red-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '✈️' || clean === '✈' || clean === '🛫' || clean.toLowerCase() === 'flugzeug' || clean.toLowerCase() === 'flughafen') {
    return <Plane className={`text-sky-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🐶' || clean.toLowerCase() === 'hund') {
    return <Dog className={`text-amber-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🐱' || clean.toLowerCase() === 'katze') {
    return <Cat className={`text-amber-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🐦' || clean.toLowerCase() === 'vogel') {
    return <Bird className={`text-sky-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🐟' || clean.toLowerCase() === 'fisch') {
    return <Fish className={`text-cyan-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🐰' || clean.toLowerCase() === 'kaninchen') {
    return <Rabbit className={`text-rose-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '👁️' || clean === '👁' || clean.toLowerCase() === 'auge') {
    return <Eye className={`text-blue-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '✋' || clean.toLowerCase() === 'hand') {
    return <Hand className={`text-amber-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🌲' || clean.toLowerCase() === 'wald') {
    return <Trees className={`text-emerald-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🎄' || clean.toLowerCase() === 'weihnachten') {
    return <TreePine className={`text-emerald-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🏔️' || clean === '🏔' || clean.toLowerCase() === 'gebirge') {
    return <Mountain className={`text-slate-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🍎' || clean.toLowerCase() === 'obst' || clean.toLowerCase() === 'apfel') {
    return <Apple className={`text-red-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🥦' || clean.toLowerCase() === 'gemuese' || clean.toLowerCase() === 'gemüse') {
    return <Salad className={`text-emerald-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🍞' || clean.toLowerCase() === 'brot') {
    return <Sandwich className={`text-amber-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🧀' || clean.toLowerCase() === 'kaese' || clean.toLowerCase() === 'käse') {
    return <Package className={`text-amber-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🍋' || clean.toLowerCase() === 'zitrone') {
    return <Citrus className={`text-yellow-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🎸' || clean.toLowerCase() === 'gitarre') {
    return <Music className={`text-purple-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🎮' || clean.toLowerCase() === 'spiel') {
    return <Gamepad2 className={`text-violet-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '💻' || clean.toLowerCase() === 'computer') {
    return <Laptop className={`text-slate-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '📞' || clean.toLowerCase() === 'telefon') {
    return <Phone className={`text-green-600 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🍽️' || clean === '🍽' || clean === '🍕' || clean === '🍝' || clean === '🍲' || clean.toLowerCase() === 'essen') {
    return <Utensils className={`text-orange-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🎂' || clean === '🎁' || clean === '🍫' || clean.toLowerCase() === 'schokolade') {
    return <Gift className={`text-pink-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🏖️' || clean === '🏖' || clean === '🌴') {
    return <Palmtree className={`text-teal-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🌊' || clean.toLowerCase() === 'meer' || clean.toLowerCase() === 'ostsee') {
    return <Waves className={`text-cyan-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '☀️' || clean.toLowerCase() === 'sonne' || clean === '🌅') {
    return <Sun className={`text-amber-500 fill-amber-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🌙' || clean.toLowerCase() === 'mond') {
    return <Moon className={`text-indigo-400 fill-indigo-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '💬' || clean === '🗣️' || clean === '🗣') {
    return <MessageCircle className={`text-blue-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🤝') {
    return <Users className={`text-emerald-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (clean === '🔁' || clean === '🔄') {
    return <RotateCcw className={`text-amber-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // People / Roles
  if (clean.includes('👨‍⚕️') || clean.includes('👩‍⚕️') || clean.toLowerCase() === 'arzt' || clean.toLowerCase() === 'aerztin') {
    return (
      <div
        className={`rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Stethoscope className="w-3/4 h-3/4" />
      </div>
    );
  }

  if (
    clean === '👦' ||
    clean === '👧' ||
    clean === '👨' ||
    clean === '👩' ||
    clean === '👤' ||
    clean === '🧑‍🎓' ||
    clean === '👨‍💼' ||
    clean === '👨‍👩‍👧' ||
    clean === '👨‍👩‍👧‍👦'
  ) {
    return (
      <div
        className={`rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <User className="w-3/4 h-3/4" />
      </div>
    );
  }

  if (clean === '👨‍🏫' || clean === '👩‍🏫' || clean.toLowerCase() === 'lehrer' || clean.toLowerCase() === 'lehrerin') {
    return (
      <div
        className={`rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <GraduationCap className="w-3/4 h-3/4" />
      </div>
    );
  }

  // Fallback vector icon
  return (
    <div
      className={`rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Sparkles className="w-2/3 h-2/3 text-lizu-green" />
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyItem, PropertyType } from '../../types';
import {
  Heart,
  Plus,
  Trash2,
  MapPin,
  Tag,
  Phone,
  Mail,
  TrendingUp,
  ShieldCheck,
  Building2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  User,
  Copy,
  Check
} from 'lucide-react';

interface UserProfilePageProps {
  onBack?: () => void;
  onNavigateToProperties?: () => void;
}

const PRESET_PROPERTY_IMAGES = [
  { label: 'Highland Farm', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Washing Station', url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80' },
  { label: 'Roastery Facility', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80' },
  { label: 'Forest Estate', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80' },
];

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onBack,
  onNavigateToProperties
}) => {
  const {
    user,
    isAuthenticated,
    properties,
    likedPropertyIds,
    toggleLikeProperty,
    listProperty,
    deleteProperty,
    openModal,
    showToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'liked' | 'listed'>('liked');
  const [showListModal, setShowListModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<PropertyItem | null>(null);

  // Listing Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<PropertyType>('Coffee Farm');
  const [formPrice, setFormPrice] = useState('');
  const [formYield, setFormYield] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formImageUrl, setFormImageUrl] = useState(PRESET_PROPERTY_IMAGES[0].url);
  const [formFeatures, setFormFeatures] = useState('');
  const [formPhone, setFormPhone] = useState(user.phone || '');
  const [formEmail, setFormEmail] = useState(user.email || '');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = user.supabaseUid || user.userId || user.email || '';

  // Filtered lists
  const likedProperties = properties.filter(p => likedPropertyIds.includes(p.id));
  const listedProperties = properties.filter(
    p => (p.userId && p.userId === currentUserId) || (user.email && p.userEmail === user.email)
  );

  const handleCopyUserId = () => {
    if (user.userId || user.supabaseUid) {
      navigator.clipboard.writeText(user.supabaseUid || user.userId);
      setCopiedId(true);
      showToast('User ID copied to clipboard', 'info');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to list properties', 'error');
      openModal('login');
      return;
    }

    if (!formTitle.trim()) {
      showToast('Please enter a property title', 'error');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Please enter a valid price in ETB', 'error');
      return;
    }

    if (!formLocation.trim()) {
      showToast('Please enter the property location', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const featuresArray = formFeatures
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const res = await listProperty({
        title: formTitle.trim(),
        propertyType: formType,
        price: priceNum,
        expectedYield: formYield.trim() || '18-25% Annual Yield',
        location: formLocation.trim(),
        imageUrl: formImageUrl || PRESET_PROPERTY_IMAGES[0].url,
        features: featuresArray.length > 0 ? featuresArray : ['High Altitude Arabica', 'Organic Certified'],
        contactPhone: formPhone.trim() || user.phone,
        contactEmail: formEmail.trim() || user.email,
        description: formDescription.trim() || `${formType} located in ${formLocation.trim()}`,
        status: 'active'
      });

      if (res.success) {
        setShowListModal(false);
        setActiveSubTab('listed');
        // Reset form
        setFormTitle('');
        setFormPrice('');
        setFormYield('');
        setFormLocation('');
        setFormFeatures('');
        setFormDescription('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#103324] border border-[#1b4e36] text-emerald-400 flex items-center justify-center">
          <User size={32} />
        </div>
        <div className="space-y-1 max-w-sm">
          <h2 className="text-xl font-black text-white font-['Outfit']">Sign In Required</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Please log in with your account to access your User Profile, view properties you liked, and list properties in the marketplace.
          </p>
        </div>
        <button
          id="btn-profile-signin-prompt"
          onClick={() => openModal('login')}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 sm:px-4 py-3 space-y-4 pb-16 select-none">
      {/* 1. USER PROFILE HEADER CARD */}
      <div
        id="card-user-profile-header"
        className="bg-gradient-to-b from-[#0e2a1e] to-[#0a2318] p-4 sm:p-5 rounded-3xl border border-[#1b4e36] shadow-xl space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user.displayName || 'User'}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0e2a1e] flex items-center justify-center">
                <CheckCircle2 size={10} className="text-black stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-['Outfit'] tracking-tight">
                  {user.displayName || 'Coffee Investor'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {user.role === 'admin' ? 'Admin' : 'Verified Member'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="text-zinc-300">{user.email || user.phone}</span>
                {user.userId && (
                  <button
                    onClick={handleCopyUserId}
                    className="flex items-center gap-1 font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded-md text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    title="Copy User ID"
                  >
                    <span>ID: {user.userId}</span>
                    {copiedId ? <Check size={10} /> : <Copy size={10} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            id="btn-profile-list-property-top"
            onClick={() => setShowListModal(true)}
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus size={14} className="stroke-[3]" />
            <span className="hidden sm:inline">List Property</span>
            <span className="sm:hidden">List</span>
          </button>
        </div>

        {/* User Stats Overview */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1b4e36]/70">
          <div
            onClick={() => setActiveSubTab('liked')}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer text-center ${
              activeSubTab === 'liked'
                ? 'bg-[#103324] border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                : 'bg-black/30 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-400 mb-0.5">
              <Heart size={12} className={activeSubTab === 'liked' ? 'text-rose-400 fill-rose-400' : ''} />
              <span>Properties Liked</span>
            </div>
            <div className="text-lg font-black font-['Outfit'] text-white">
              {likedProperties.length}
            </div>
          </div>

          <div
            onClick={() => setActiveSubTab('listed')}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer text-center ${
              activeSubTab === 'listed'
                ? 'bg-[#103324] border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                : 'bg-black/30 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-400 mb-0.5">
              <Building2 size={12} className={activeSubTab === 'listed' ? 'text-emerald-400' : ''} />
              <span>Properties Listed</span>
            </div>
            <div className="text-lg font-black font-['Outfit'] text-white">
              {listedProperties.length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB TOGGLE NAVIGATION */}
      <div className="flex items-center gap-2 p-1 bg-zinc-950 border border-zinc-800/80 rounded-2xl">
        <button
          id="btn-subtab-liked-properties"
          type="button"
          onClick={() => setActiveSubTab('liked')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'liked'
              ? 'bg-emerald-500 text-black font-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Heart size={13} className={activeSubTab === 'liked' ? 'fill-black' : ''} />
          <span>Liked Properties</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
            activeSubTab === 'liked' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'
          }`}>
            {likedProperties.length}
          </span>
        </button>

        <button
          id="btn-subtab-listed-properties"
          type="button"
          onClick={() => setActiveSubTab('listed')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'listed'
              ? 'bg-emerald-500 text-black font-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Building2 size={13} />
          <span>My Listed Properties</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
            activeSubTab === 'listed' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'
          }`}>
            {listedProperties.length}
          </span>
        </button>
      </div>

      {/* 3. CONTENT AREA */}
      {/* SECTION A: LIKED PROPERTIES */}
      {activeSubTab === 'liked' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {likedProperties.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Heart size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No Liked Properties Yet</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Browse the Coffee Properties marketplace to like and save your favorite coffee estates, processing plants, and roasteries!
                </p>
              </div>
              {onNavigateToProperties && (
                <button
                  onClick={onNavigateToProperties}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl cursor-pointer"
                >
                  Explore Properties
                </button>
              )}
            </div>
          ) : (
            likedProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-lg hover:border-[#1b4e36] transition-all"
              >
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-xs text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      {prop.propertyType}
                    </span>
                    {prop.expectedYield && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/90 text-black text-[10px] font-black tracking-tight">
                        {prop.expectedYield}
                      </span>
                    )}
                  </div>

                  {/* Heart / Unlike button */}
                  <button
                    onClick={() => toggleLikeProperty(prop.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-xs border border-rose-500/40 flex items-center justify-center text-rose-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Remove from Liked"
                  >
                    <Heart size={15} className="fill-rose-500 text-rose-500" />
                  </button>

                  {/* Bottom info on image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base font-black text-white font-['Outfit'] drop-shadow-md">
                      {prop.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300 drop-shadow-sm mt-0.5">
                      <MapPin size={12} className="text-emerald-400" />
                      <span>{prop.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                    {prop.description}
                  </p>

                  {/* Features tags */}
                  {prop.features && prop.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {prop.features.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-semibold text-zinc-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Valuation / Price</span>
                      <div className="text-base font-black font-['Outfit'] text-emerald-400">
                        ETB {prop.price.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPropertyDetails(prop)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => toggleLikeProperty(prop.id)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Heart size={12} className="fill-rose-400" />
                        <span>Saved</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECTION B: LISTED PROPERTIES */}
      {activeSubTab === 'listed' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Your Published Properties ({listedProperties.length})
            </h4>
            <button
              id="btn-open-list-property-form"
              onClick={() => setShowListModal(true)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} className="stroke-[3]" />
              <span>List New Property</span>
            </button>
          </div>

          {listedProperties.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Building2 size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No Properties Listed Yet</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Have a coffee farm, processing mill, or estate to list? Create your first listing now and it will be stored directly in Supabase.
                </p>
              </div>
              <button
                onClick={() => setShowListModal(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl cursor-pointer inline-flex items-center gap-1"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>List Your First Property</span>
              </button>
            </div>
          ) : (
            listedProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-lg hover:border-[#1b4e36] transition-all"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase">
                      {prop.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-black/70 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      {prop.propertyType}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-lg border border-zinc-700 text-xs font-bold text-white">
                    <Heart size={12} className="text-rose-400 fill-rose-400" />
                    <span>{prop.likesCount}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm sm:text-base font-black text-white font-['Outfit']">
                      {prop.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-300">
                      <MapPin size={11} className="text-emerald-400" />
                      <span>{prop.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Listing Price</span>
                      <div className="text-base font-black font-['Outfit'] text-emerald-400">
                        ETB {prop.price.toLocaleString()}
                      </div>
                    </div>
                    {prop.expectedYield && (
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">Target Return</span>
                        <span className="text-xs font-bold text-white">{prop.expectedYield}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Listed {new Date(prop.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPropertyDetails(prop)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${prop.title}"?`)) {
                            deleteProperty(prop.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: LIST NEW PROPERTY */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-900 border border-[#1b4e36] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar text-white">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-['Outfit']">
                    List New Coffee Property
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Saved directly to Supabase linked to your account
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowListModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">
                  Property Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yirgacheffe Specialty Organic Farm"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Property Type & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Property Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Coffee Farm">Coffee Farm / Plantation</option>
                    <option value="Processing Plant">Processing & Washing Station</option>
                    <option value="Roastery Estate">Roastery & Extraction Hub</option>
                    <option value="Mining Facility">Mining & Industrial Hub</option>
                    <option value="Commercial Warehouse">Export Warehouse</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Valuation / Price (ETB) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 2500000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Location & Expected Yield */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Location / Region *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yirgacheffe, Sidama, Jimma"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Target Yield / ROI
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 21.5% Annual ROI"
                    value={formYield}
                    onChange={(e) => setFormYield(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Image Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Select Cover Photo Preset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_PROPERTY_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImageUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all cursor-pointer ${
                        formImageUrl === preset.url
                          ? 'border-emerald-400 scale-102 shadow-md'
                          : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-bold text-center py-0.5 text-zinc-200">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features / Highlights */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Certified, Natural Spring, Solar Powered"
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details about coffee varieties, acreage, washing facilities..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+251 9..."
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="youremail@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Publishing to Supabase...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Publish Property Listing</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROPERTY DETAIL PREVIEW */}
      {selectedPropertyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-[#1b4e36] rounded-3xl overflow-hidden shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="relative h-48 w-full">
              <img
                src={selectedPropertyDetails.imageUrl}
                alt={selectedPropertyDetails.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedPropertyDetails(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-black uppercase">
                  {selectedPropertyDetails.propertyType}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedPropertyDetails.title}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-4 pt-0">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Valuation</span>
                  <div className="text-xl font-black font-['Outfit'] text-emerald-400">
                    ETB {selectedPropertyDetails.price.toLocaleString()}
                  </div>
                </div>
                {selectedPropertyDetails.expectedYield && (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Est. Yield</span>
                    <span className="text-sm font-bold text-white">{selectedPropertyDetails.expectedYield}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-zinc-400 uppercase">About Property</h5>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {selectedPropertyDetails.description}
                </p>
              </div>

              {selectedPropertyDetails.features && selectedPropertyDetails.features.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-zinc-400 uppercase">Key Features</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPropertyDetails.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-emerald-300"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1.5 text-xs">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Contact Lister</span>
                {selectedPropertyDetails.contactPhone && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Phone size={13} className="text-emerald-400" />
                    <span>{selectedPropertyDetails.contactPhone}</span>
                  </div>
                )}
                {selectedPropertyDetails.contactEmail && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Mail size={13} className="text-emerald-400" />
                    <span>{selectedPropertyDetails.contactEmail}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleLikeProperty(selectedPropertyDetails.id)}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                    likedPropertyIds.includes(selectedPropertyDetails.id)
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                      : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  <Heart
                    size={14}
                    className={likedPropertyIds.includes(selectedPropertyDetails.id) ? 'fill-rose-400 text-rose-400' : ''}
                  />
                  <span>
                    {likedPropertyIds.includes(selectedPropertyDetails.id) ? 'Saved / Liked' : 'Save Property'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPropertyDetails(null)}
                  className="flex-1 py-2.5 bg-emerald-500 text-black font-black text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

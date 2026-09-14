import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyItem, PropertyType } from '../../types';
import {
  Heart,
  Plus,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Building2,
  Sparkles,
  Phone,
  Mail,
  User,
  ExternalLink,
  ShieldCheck,
  Coffee
} from 'lucide-react';

interface PropertiesTabProps {
  onOpenProfile?: () => void;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Estates', value: 'all' },
  { label: 'Coffee Farms', value: 'Coffee Farm' },
  { label: 'Processing Mills', value: 'Processing Plant' },
  { label: 'Roasteries', value: 'Roastery Estate' },
  { label: 'Warehouses', value: 'Commercial Warehouse' }
];

export const PropertiesTab: React.FC<PropertiesTabProps> = ({ onOpenProfile }) => {
  const {
    properties,
    likedPropertyIds,
    toggleLikeProperty,
    listProperty,
    isAuthenticated,
    user,
    openModal,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [showListModal, setShowListModal] = useState(false);

  // Listing Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<PropertyType>('Coffee Farm');
  const [formPrice, setFormPrice] = useState('');
  const [formYield, setFormYield] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80');
  const [formFeatures, setFormFeatures] = useState('');
  const [formPhone, setFormPhone] = useState(user.phone || '');
  const [formEmail, setFormEmail] = useState(user.email || '');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter properties
  const filteredProperties = properties.filter((prop) => {
    const matchesCat = selectedCategory === 'all' || prop.propertyType === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      prop.title.toLowerCase().includes(query) ||
      prop.location.toLowerCase().includes(query) ||
      prop.description.toLowerCase().includes(query) ||
      prop.propertyType.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const handleLikeClick = (e: React.MouseEvent, propId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to like and save properties', 'error');
      openModal('login');
      return;
    }
    toggleLikeProperty(propId);
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
        expectedYield: formYield.trim() || '20-25% Annual Yield',
        location: formLocation.trim(),
        imageUrl: formImageUrl,
        features: featuresArray.length > 0 ? featuresArray : ['Highland Arabica', 'Direct Land Title'],
        contactPhone: formPhone.trim() || user.phone,
        contactEmail: formEmail.trim() || user.email,
        description: formDescription.trim() || `${formType} located in ${formLocation.trim()}`,
        status: 'active'
      });

      if (res.success) {
        setShowListModal(false);
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

  return (
    <div className="flex-1 px-3 sm:px-4 py-3 space-y-4 pb-20 select-none">
      {/* 1. TOP BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c2e1f] via-[#092217] to-[#04120b] border border-[#1b4e36] p-4 sm:p-5 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={11} />
              <span>Supabase Real Estate Marketplace</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
              Coffee Estates & Infrastructure
            </h1>
            <p className="text-xs text-zinc-300 max-w-md leading-relaxed">
              Explore premier Ethiopian coffee farms, micro-lot washing stations, and processing plants. Save your favorites and list your own property.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-properties-list-property"
              onClick={() => {
                if (!isAuthenticated) {
                  showToast('Please sign in to list properties', 'error');
                  openModal('login');
                } else {
                  setShowListModal(true);
                }
              }}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>List Property</span>
            </button>

            {onOpenProfile && (
              <button
                id="btn-properties-my-profile"
                onClick={onOpenProfile}
                className="px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <Heart size={13} className="fill-emerald-400 text-emerald-400" />
                <span>My Saved ({likedPropertyIds.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, location (e.g., Yirgacheffe, Sidama), or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-emerald-500 text-black font-black shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PROPERTY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredProperties.length === 0 ? (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Building2 size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Properties Found</h4>
              <p className="text-xs text-zinc-400">
                No coffee properties match your search criteria. Try a different filter or search term.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-1.5 bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl hover:bg-zinc-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredProperties.map((prop) => {
            const isLiked = likedPropertyIds.includes(prop.id);
            return (
              <div
                key={prop.id}
                onClick={() => setSelectedProperty(prop)}
                className="bg-zinc-900 border border-zinc-800 hover:border-[#1b4e36] rounded-3xl overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col group"
              >
                {/* Image Section */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      {prop.propertyType}
                    </span>
                    {prop.expectedYield && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/90 text-black text-[10px] font-black">
                        {prop.expectedYield}
                      </span>
                    )}
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => handleLikeClick(e, prop.id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs ${
                      isLiked
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-105'
                        : 'bg-black/60 border border-zinc-700 text-zinc-300 hover:text-white hover:scale-110 active:scale-95'
                    }`}
                    title={isLiked ? 'Saved! Click to unlike' : 'Click to like and save'}
                  >
                    <Heart
                      size={15}
                      className={isLiked ? 'fill-white text-white' : 'text-zinc-300'}
                    />
                  </button>

                  {/* Title & Location on Image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm sm:text-base font-black text-white font-['Outfit'] drop-shadow-md line-clamp-1">
                      {prop.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-300 drop-shadow-sm mt-0.5">
                      <MapPin size={11} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {prop.description}
                  </p>

                  {/* Features Tag */}
                  {prop.features && prop.features.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prop.features.slice(0, 2).map((feat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded-md text-[9px] font-semibold text-zinc-300"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Price & Likes row */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase block">Valuation</span>
                      <div className="text-sm sm:text-base font-black font-['Outfit'] text-emerald-400">
                        ETB {prop.price.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-zinc-400 font-bold">
                        <Heart size={12} className={isLiked ? 'text-rose-400 fill-rose-400' : 'text-zinc-500'} />
                        <span>{prop.likesCount}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProperty(prop);
                        }}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: PROPERTY DETAILS */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-[#1b4e36] rounded-3xl overflow-hidden shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="relative h-48 w-full">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-black uppercase">
                  {selectedProperty.propertyType}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedProperty.title}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-4 pt-0">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Valuation</span>
                  <div className="text-xl font-black font-['Outfit'] text-emerald-400">
                    ETB {selectedProperty.price.toLocaleString()}
                  </div>
                </div>
                {selectedProperty.expectedYield && (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Est. Yield</span>
                    <span className="text-sm font-bold text-white">{selectedProperty.expectedYield}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-zinc-400 uppercase">Description</h5>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {selectedProperty.description}
                </p>
              </div>

              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-zinc-400 uppercase">Key Features</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProperty.features.map((feat, idx) => (
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
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Inquire Directly</span>
                {selectedProperty.contactPhone && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Phone size={13} className="text-emerald-400" />
                    <span>{selectedProperty.contactPhone}</span>
                  </div>
                )}
                {selectedProperty.contactEmail && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Mail size={13} className="text-emerald-400" />
                    <span>{selectedProperty.contactEmail}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    handleLikeClick(e, selectedProperty.id);
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                    likedPropertyIds.includes(selectedProperty.id)
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                      : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  <Heart
                    size={14}
                    className={likedPropertyIds.includes(selectedProperty.id) ? 'fill-rose-400 text-rose-400' : ''}
                  />
                  <span>
                    {likedPropertyIds.includes(selectedProperty.id) ? 'Saved / Liked' : 'Like & Save'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="flex-1 py-2.5 bg-emerald-500 text-black font-black text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
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
                    Will be stored in Supabase linked to your account
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
                    <option value="Mining Facility">Mining Facility</option>
                    <option value="Commercial Warehouse">Commercial Warehouse</option>
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details about coffee varieties, acreage, processing facilities..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 resize-none"
                />
              </div>

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
                  className="flex-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
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
    </div>
  );
};

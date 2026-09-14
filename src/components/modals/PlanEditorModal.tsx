import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { InvestmentPlan } from '../../types';
import {
  X,
  Plus,
  Edit3,
  Coffee,
  Zap,
  Tag,
  CheckCircle,
  Sparkles,
  Shield,
  Layers
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Arabica Extractor', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80' },
  { label: 'Espresso Roaster', url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Barista Rig', url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Roastery Unit', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80' },
  { label: 'Plantation Unit', url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=80' },
  { label: 'Consortium Flagship', url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&auto=format&fit=crop&q=80' }
];

export const PlanEditorModal: React.FC = () => {
  const { selectedPlan, createPlan, updatePlan, closeModal, showToast, plans } = useApp();

  const isEditing = Boolean(selectedPlan);

  const [formData, setFormData] = useState({
    name: selectedPlan?.name || `Mining - ${plans.length + 1}`,
    title: selectedPlan?.title || `Coffee Miner Tier ${plans.length + 1}`,
    subtitle: selectedPlan?.subtitle || 'High-Yield Extraction Unit',
    price: selectedPlan?.price || 1500,
    dailyIncome: selectedPlan?.dailyIncome || 85,
    cycleDays: selectedPlan?.cycleDays || 90,
    coffeeType: selectedPlan?.coffeeType || 'Arabica Medium Roast',
    powerRating: selectedPlan?.powerRating || '2.0 kW / h',
    image: selectedPlan?.image || PRESET_IMAGES[0].url,
    tag: selectedPlan?.tag || 'NEW',
    description: selectedPlan?.description || 'Automated high return coffee roasting and extraction unit with daily payouts.',
    permission: (selectedPlan?.permission || 'allowed') as 'allowed' | 'restricted',
    isActive: selectedPlan?.isActive !== false
  });

  useEffect(() => {
    if (selectedPlan) {
      setFormData({
        name: selectedPlan.name,
        title: selectedPlan.title,
        subtitle: selectedPlan.subtitle || '',
        price: selectedPlan.price,
        dailyIncome: selectedPlan.dailyIncome,
        cycleDays: selectedPlan.cycleDays,
        coffeeType: selectedPlan.coffeeType,
        powerRating: selectedPlan.powerRating,
        image: selectedPlan.image,
        tag: selectedPlan.tag || '',
        description: selectedPlan.description,
        permission: (selectedPlan.permission || 'allowed') as 'allowed' | 'restricted',
        isActive: selectedPlan.isActive !== false
      });
    }
  }, [selectedPlan]);

  const totalReturn = formData.dailyIncome * formData.cycleDays;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.price <= 0 || formData.dailyIncome <= 0) {
      showToast('Please fill all required plan fields with positive numbers', 'error');
      return;
    }

    if (isEditing && selectedPlan) {
      updatePlan(selectedPlan.id, {
        ...formData,
        totalReturn
      });
      showToast(`Updated plan "${formData.title}"`, 'success');
    } else {
      createPlan({
        miningIndex: plans.length + 1,
        ...formData,
        totalReturn
      });
      showToast(`Created new plan "${formData.title}"`, 'success');
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              {isEditing ? <Edit3 size={20} /> : <Plus size={22} />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                {isEditing ? 'Edit Mining Plan' : 'Create New Mining Plan'}
              </h2>
              <p className="text-xs text-zinc-400">
                Configure prices, daily dividends, cycle duration, and permissions
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Plan Titles & Identifier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Plan Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mining - 4"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Badge / Tag
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g. HOT, POPULAR, VIP"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pricing & Income Spec Rows */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Price (ETB) *
              </label>
              <input
                type="number"
                required
                min={100}
                step={50}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-black text-center focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Daily Yield (ETB) *
              </label>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={formData.dailyIncome}
                onChange={(e) => setFormData({ ...formData, dailyIncome: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-emerald-400 font-black text-center focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Cycle (Days)
              </label>
              <input
                type="number"
                required
                min={1}
                max={365}
                value={formData.cycleDays}
                onChange={(e) => setFormData({ ...formData, cycleDays: parseInt(e.target.value) || 90 })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 font-black text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* ROI Summary Preview */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-400 font-medium">Projected Total Return:</span>
              <p className="text-base font-black text-emerald-400 font-['Outfit']">
                ETB {(totalReturn || 0).toLocaleString('en-US')}.00
              </p>
            </div>
            <div className="text-right">
              <span className="text-zinc-400 font-medium">ROI Percentage:</span>
              <p className="text-sm font-bold text-white">
                {formData.price > 0 ? `${(((totalReturn || 0) / formData.price) * 100).toFixed(0)}%` : '0%'}
              </p>
            </div>
          </div>

          {/* Machine Category & Power Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Roast / Bean Profile
              </label>
              <input
                type="text"
                value={formData.coffeeType}
                onChange={(e) => setFormData({ ...formData, coffeeType: e.target.value })}
                placeholder="e.g. Yirgacheffe Grade 1"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Power Spec
              </label>
              <input
                type="text"
                value={formData.powerRating}
                onChange={(e) => setFormData({ ...formData, powerRating: e.target.value })}
                placeholder="e.g. 2.4 kW / h"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Plan Permission Toggle */}
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${formData.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                <Shield size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Plan Permission & Availability</p>
                <p className="text-[11px] text-zinc-400">
                  {formData.isActive ? 'Active — Members can invest in this tier' : 'Restricted — Disabled from purchase'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                isActive: !formData.isActive,
                permission: !formData.isActive ? 'allowed' : 'restricted'
              })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                formData.isActive
                  ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {formData.isActive ? 'Allowed (Active)' : 'Restricted (Disabled)'}
            </button>
          </div>

          {/* Preset Image Chooser */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">
              Select Machine Image
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, image: img.url })}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                    formData.image === img.url
                      ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/30'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  {formData.image === img.url && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-black rounded-full p-0.5">
                      <CheckCircle size={10} className="stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {isEditing ? 'Save Changes' : 'Create Mining Plan'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

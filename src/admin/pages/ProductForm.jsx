import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { getProduct, createProduct, updateProduct } from '../../lib/api';
import ImageUploader from '../components/ImageUploader';
import Toast from '../components/Toast';

const CATEGORIES = ["Hoodies", "T-Shirts", "Full Sets"];
const BADGES = ["", "NEW", "LIMITED", "SOLD OUT"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const GENDERS = ["Men", "Women", "Unisex"];

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form states
  const [form, setForm] = useState({
    name: '',
    price: '',
    comparePrice: '',
    category: 'Hoodies',
    gender: ['Unisex'],
    badge: '',
    featured: false,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Void Black', hex: '#0A0A0A' }],
    images: [],
    description: '',
    careInstructions: '',
    shippingNote: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch product for edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProductData = async () => {
        setFetching(true);
        try {
          const data = await getProduct(id, true); // Get raw colors and images
          setForm({
            name: data.name || '',
            price: data.price || '',
            comparePrice: data.comparePrice || '',
            category: data.category || 'Hoodies',
            gender: data.gender || ['Unisex'],
            badge: data.badge || '',
            featured: Boolean(data.featured),
            inStock: Boolean(data.inStock),
            sizes: data.sizes || [],
            colors: data.colors || [],
            images: data.images || [],
            description: data.description || '',
            careInstructions: data.careInstructions || '',
            shippingNote: data.shippingNote || ''
          });
        } catch (err) {
          console.error(err);
          showToast('FAILED TO FETCH PRODUCT DATA.', 'error');
        } finally {
          setFetching(false);
        }
      };
      fetchProductData();
    }
  }, [id, isEditMode]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (size) => {
    setForm(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const handleGenderChange = (genderVal) => {
    setForm(prev => {
      const gender = prev.gender.includes(genderVal)
        ? prev.gender.filter(g => g !== genderVal)
        : [...prev.gender, genderVal];
      return { ...prev, gender };
    });
  };

  // Color management
  const addColor = () => {
    setForm(prev => ({
      ...prev,
      colors: [...prev.colors, { name: 'New Color', hex: '#ffffff' }]
    }));
  };

  const removeColor = (idx) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== idx)
    }));
  };

  const updateColor = (idx, field, val) => {
    setForm(prev => {
      const colors = [...prev.colors];
      colors[idx] = { ...colors[idx], [field]: val };
      return { ...prev, colors };
    });
  };

  // Save/Submit handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      showToast('NAME, PRICE AND CATEGORY ARE REQUIRED.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      
      if (isEditMode) {
        await updateProduct(id, form, token);
        showToast('PRODUCT UPDATED SUCCESSFUL.');
      } else {
        await createProduct(form, token);
        showToast('PRODUCT CREATED SUCCESSFUL.');
        // Redirect back to list after short delay
        setTimeout(() => navigate('/admin/products'), 1500);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'FAILED TO SAVE PRODUCT DETAILS.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-[#C8FF00] font-mono">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <span className="tracking-widest uppercase text-xs">RETRIEVING PRODUCT SPEC SHEET...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-4xl">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Breadcrumb nav */}
      <div className="flex items-center gap-2">
        <Link 
          to="/admin/products"
          className="text-gray-400 hover:text-[#C8FF00] flex items-center gap-2 font-mono text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO CATALOG</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-mono text-2xl font-extrabold tracking-widest text-[#C8FF00]">
          {isEditMode ? 'EDIT PRODUCT' : 'CREATE PRODUCT'}
        </h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
          {isEditMode ? `Updating product details for: ${id}` : 'Compile specifications for a new drops release'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#1A1A1A] border border-[#C8FF00]/15 p-6 md:p-8">
        
        {/* Core details (Name, Price, Category) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              PRODUCT NAME
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase transition-colors"
              style={{ borderRadius: '0px' }}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              PRICE (₹)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleInputChange}
              className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs transition-colors"
              style={{ borderRadius: '0px' }}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              COMPARE AT PRICE (₹)
            </label>
            <input
              type="number"
              name="comparePrice"
              value={form.comparePrice}
              onChange={handleInputChange}
              className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs transition-colors"
              style={{ borderRadius: '0px' }}
            />
          </div>
        </div>

        {/* Dropdowns (Category, Badge) & Flags (In Stock, Featured) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              CATEGORY
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleInputChange}
              className="bg-[#0F0F0F] text-white px-4 py-2.5 border border-gray-800 focus:border-[#C8FF00] font-mono text-xs outline-none cursor-pointer"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              PRODUCT BADGE
            </label>
            <select
              name="badge"
              value={form.badge}
              onChange={handleInputChange}
              className="bg-[#0F0F0F] text-white px-4 py-2.5 border border-gray-800 focus:border-[#C8FF00] font-mono text-xs outline-none cursor-pointer"
            >
              {BADGES.map(badge => <option key={badge} value={badge}>{badge ? badge.toUpperCase() : 'NONE'}</option>)}
            </select>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center gap-3 pt-6">
            <input 
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={form.inStock}
              onChange={handleInputChange}
              className="w-4 h-4 bg-black border-gray-800 text-[#C8FF00] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="inStock" className="font-mono text-[10px] font-bold text-gray-300 uppercase tracking-widest cursor-pointer select-none">
              IN STOCK STATUS
            </label>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input 
              type="checkbox"
              id="featured"
              name="featured"
              checked={form.featured}
              onChange={handleInputChange}
              className="w-4 h-4 bg-black border-gray-800 text-[#C8FF00] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="featured" className="font-mono text-[10px] font-bold text-gray-300 uppercase tracking-widest cursor-pointer select-none">
              FEATURED IN CAROUSEL
            </label>
          </div>
        </div>

        {/* Sizes and Gender Multi-selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-800/60 pt-6">
          {/* Sizes Selection */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              AVAILABLE SIZES
            </span>
            <div className="flex flex-wrap gap-3">
              {SIZES.map((size) => {
                const isSelected = form.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`w-10 h-10 border font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#C8FF00] text-[#0F0F0F] border-[#C8FF00]' 
                        : 'bg-[#0F0F0F] text-gray-400 border-gray-800 hover:border-gray-600'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Gender Split Selection */}
          <div className="space-y-3">
            <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              GENDER SPLIT
            </span>
            <div className="flex flex-wrap gap-3">
              {GENDERS.map((gender) => {
                const isSelected = form.gender.includes(gender);
                return (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => handleGenderChange(gender)}
                    className={`px-4 py-2.5 border font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#C8FF00] text-[#0F0F0F] border-[#C8FF00]' 
                        : 'bg-[#0F0F0F] text-gray-400 border-gray-800 hover:border-gray-600'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    {gender}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Colors management Section */}
        <div className="border-t border-gray-800/60 pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              INVENTORY COLORS
            </span>
            <button
              type="button"
              onClick={addColor}
              className="border border-[#C8FF00]/40 text-[#C8FF00] hover:bg-[#C8FF00]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD COLOR</span>
            </button>
          </div>

          {form.colors.length === 0 ? (
            <p className="text-gray-500 font-mono text-[10px] uppercase">No colors added. Product requires at least one color option.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {form.colors.map((color, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 bg-[#0F0F0F] border border-gray-800 p-3"
                >
                  <input 
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                    className="w-8 h-8 bg-transparent border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={color.name}
                    placeholder="COLOR NAME (e.g. Acid Lime)"
                    onChange={(e) => updateColor(idx, 'name', e.target.value)}
                    className="bg-transparent text-white outline-none font-mono text-[10px] tracking-wider uppercase flex-1 border-b border-gray-800 focus:border-[#C8FF00] py-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="text-gray-500 hover:text-[#FF2D78] transition-colors cursor-pointer"
                    aria-label="Remove color"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Multi-image uploader */}
        <div className="border-t border-gray-800/60 pt-6">
          <ImageUploader 
            images={form.images} 
            onChange={(urls) => setForm({ ...form, images: urls })} 
            maxImages={6}
          />
        </div>

        {/* Text descriptions */}
        <div className="border-t border-gray-800/60 pt-6 space-y-6">
          <div className="flex flex-col">
            <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              DESCRIPTION
            </label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleInputChange}
              className="bg-[#0F0F0F] text-white p-4 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs transition-colors resize-none"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                CARE INSTRUCTIONS
              </label>
              <textarea
                name="careInstructions"
                rows="3"
                value={form.careInstructions}
                onChange={handleInputChange}
                className="bg-[#0F0F0F] text-white p-4 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs transition-colors resize-none"
                style={{ borderRadius: '0px' }}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                SHIPPING NOTE
              </label>
              <textarea
                name="shippingNote"
                rows="3"
                value={form.shippingNote}
                onChange={handleInputChange}
                className="bg-[#0F0F0F] text-white p-4 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs transition-colors resize-none"
                style={{ borderRadius: '0px' }}
              />
            </div>
          </div>
        </div>

        {/* Form controls */}
        <div className="flex justify-end pt-6 border-t border-gray-800/60">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white hover:text-black border border-[#C8FF00] px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            style={{ borderRadius: '0px' }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditMode ? 'UPDATE SPECIFICATIONS' : 'DEPLOY DROPS RELEASE'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}

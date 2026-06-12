import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Loader2, 
  Upload, 
  Clock, 
  Link as LinkIcon 
} from 'lucide-react';
import { getContent, saveBulkContent, uploadImage } from '../../lib/api';
import { useContentContext } from '../../context/ContentContext';
import Toast from '../components/Toast';

const TABS = [
  { id: 'hero', name: 'HERO SECTION' },
  { id: 'categories', name: 'CATEGORIES' },
  { id: 'weekly', name: 'WEEKLY DEMAND' },
  { id: 'statement', name: 'BRAND STATEMENT' },
  { id: 'gender', name: 'GENDER SPLIT' },
  { id: 'countdown', name: 'NEXT DROP' },
  { id: 'ugc', name: 'CULTURE STRIP' },
  { id: 'marquee', name: 'MARQUEE TICKER' }
];

export default function Content() {
  const { refreshContent } = useContentContext();
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [values, setValues] = useState({});
  
  // File inputs references
  const fileRefs = useRef({});

  const fetchContentData = async () => {
    setLoading(true);
    try {
      const data = await getContent();
      setValues(data || {});
    } catch (err) {
      console.error(err);
      showToast('FAILED TO RETRIEVE SITE CONTENT.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleInputChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // Image uploader handler for content keys
  const handleImageUpload = async (key, file) => {
    if (!file) return;
    
    showToast('UPLOADING ASSET...', 'success');
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      const response = await uploadImage(file, token);
      if (response && response.url) {
        handleInputChange(key, response.url);
        showToast('ASSET UPLOADED SUCCESSFULLY.');
      }
    } catch (err) {
      console.error(err);
      showToast('ASSET UPLOAD FAILED.', 'error');
    }
  };

  // Bulk save changed keys for the active tab
  const handleSaveTab = async (keysToSave) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      const updates = keysToSave.map(k => ({
        key: k,
        value: values[k]
      }));

      await saveBulkContent(updates, token);
      
      // Refresh context cache so client storefront gets real-time updates
      await refreshContent();
      showToast('CONTENT SAVED ✓');
    } catch (err) {
      console.error(err);
      showToast('SAVE FAILED — TRY AGAIN', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Live countdown preview states
  const targetDateStr = values.next_drop_target_date || '2026-07-01T00:00:00.000Z';
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDateStr) - +new Date();
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isLive: false
        };
      }
      return newTimeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-[#C8FF00] font-mono">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <span className="tracking-widest uppercase text-xs">DECRYPTING CONTENT CACHE...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-4xl relative">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="font-mono text-2xl font-extrabold tracking-widest text-[#C8FF00]">
          SITE CONTENT CMS
        </h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
          Customize website texts, marquee tickers, timers, and banner images without touching code
        </p>
      </div>

      {/* Tab Select & Editor Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Tab Menu List */}
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-left border flex-shrink-0 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#C8FF00] text-[#0F0F0F] border-[#C8FF00]'
                  : 'bg-[#1A1A1A] text-gray-300 border-gray-800 hover:border-gray-700'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Form Panel (Right Column) */}
        <div className="md:col-span-3 bg-[#1A1A1A] border border-[#C8FF00]/15 p-6 md:p-8 space-y-6">
          
          {/* TAB 1: HERO SECTION */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">HERO BANNER CONTROL</h3>
              
              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">HERO SUBTITLE</label>
                <input 
                  type="text"
                  value={values.hero_subtitle || ''}
                  onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                  className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">PRIMARY CTA LABEL</label>
                  <input 
                    type="text"
                    value={values.hero_cta_primary || ''}
                    onChange={(e) => handleInputChange('hero_cta_primary', e.target.value)}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">SECONDARY CTA LABEL</label>
                  <input 
                    type="text"
                    value={values.hero_cta_secondary || ''}
                    onChange={(e) => handleInputChange('hero_cta_secondary', e.target.value)}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveTab(['hero_subtitle', 'hero_cta_primary', 'hero_cta_secondary'])}
                disabled={saving}
                className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>SAVE HERO CONFIG</span>
              </button>
            </div>
          )}

          {/* TAB 2: CATEGORY BANNERS */}
          {activeTab === 'categories' && (
            <div className="space-y-8">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">CATEGORY BACKGROUND IMAGES</h3>
              
              {[
                { label: 'HOODIES BANNER ROW', key: 'category_hoodies_image' },
                { label: 'T-SHIRTS BANNER ROW', key: 'category_tshirts_image' },
                { label: 'FULL SETS BANNER ROW', key: 'category_fullsets_image' }
              ].map((banner) => (
                <div key={banner.key} className="p-4 bg-[#0F0F0F] border border-gray-800/80 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-32 h-20 bg-black border border-gray-800 flex-shrink-0 overflow-hidden">
                    {values[banner.key] && <img src={values[banner.key]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  
                  <div className="flex-1 space-y-3 w-full text-center md:text-left">
                    <span className="font-mono text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{banner.label}</span>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => fileRefs.current[banner.key]?.click()}
                        className="bg-transparent border border-gray-800 hover:border-[#C8FF00] text-white hover:text-[#C8FF00] px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        style={{ borderRadius: '0px' }}
                      >
                        <Upload className="w-3 h-3" />
                        <span>CHANGE IMAGE</span>
                      </button>
                      <input 
                        type="file" 
                        ref={el => fileRefs.current[banner.key] = el}
                        onChange={(e) => handleImageUpload(banner.key, e.target.files?.[0])}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleSaveTab(['category_hoodies_image', 'category_tshirts_image', 'category_fullsets_image'])}
                disabled={saving}
                className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>SAVE CATEGORIES CONFIG</span>
              </button>
            </div>
          )}

          {/* TAB 3: WEEKLY DEMAND */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">WEEKLY DEMAND MANIFESTO</h3>
              
              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">SECTION HEADING</label>
                <input 
                  type="text"
                  value={values.weekly_demand_heading || ''}
                  onChange={(e) => handleInputChange('weekly_demand_heading', e.target.value)}
                  className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">SUBHEADING LABEL</label>
                <input 
                  type="text"
                  value={values.weekly_demand_subheading || ''}
                  onChange={(e) => handleInputChange('weekly_demand_subheading', e.target.value)}
                  className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 text-yellow-500 font-mono text-[10px] uppercase leading-relaxed text-left">
                ⚠️ NOTE: Products shown in this storefront carousel are controlled directly by the "Featured in Carousel" toggle on each product in the Products Catalog.
              </div>

              <button
                type="button"
                onClick={() => handleSaveTab(['weekly_demand_heading', 'weekly_demand_subheading'])}
                disabled={saving}
                className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>SAVE SECTION LABELS</span>
              </button>
            </div>
          )}

          {/* TAB 4: BRAND STATEMENT */}
          {activeTab === 'statement' && (
            <div className="space-y-6">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">BRAND STATEMENTS & FOCUS CARDS</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">STATEMENT LINE 1</label>
                  <input 
                    type="text"
                    value={values.statement_line1 || ''}
                    onChange={(e) => handleInputChange('statement_line1', e.target.value)}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">STATEMENT LINE 2</label>
                  <input 
                    type="text"
                    value={values.statement_line2 || ''}
                    onChange={(e) => handleInputChange('statement_line2', e.target.value)}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
              </div>

              {[1, 2, 3].map((num) => (
                <div key={num} className="border border-gray-800/80 p-4 bg-[#0F0F0F] space-y-4">
                  <span className="font-mono text-[10px] font-bold text-gray-400 uppercase block tracking-wider">FEATURE CARD #0{num}</span>
                  <div className="flex flex-col">
                    <label className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">CARD TITLE</label>
                    <input 
                      type="text"
                      value={values[`feature_card${num}_title`] || ''}
                      onChange={(e) => handleInputChange(`feature_card${num}_title`, e.target.value)}
                      className="bg-[#1A1A1A] text-white px-3 py-2 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">CARD BODY</label>
                    <textarea 
                      rows="2"
                      value={values[`feature_card${num}_body`] || ''}
                      onChange={(e) => handleInputChange(`feature_card${num}_body`, e.target.value)}
                      className="bg-[#1A1A1A] text-white p-3 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase resize-none"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleSaveTab([
                  'statement_line1', 'statement_line2',
                  'feature_card1_title', 'feature_card1_body',
                  'feature_card2_title', 'feature_card2_body',
                  'feature_card3_title', 'feature_card3_body'
                ])}
                disabled={saving}
                className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>SAVE STATEMENTS</span>
              </button>
            </div>
          )}

          {/* TAB 5: GENDER SPLIT */}
          {activeTab === 'gender' && (
            <div className="space-y-6">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">GENDER SPLIT SPLASH COVERS</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'FOR HIM COVERS IMAGE', key: 'gender_him_image' },
                  { label: 'FOR HER COVERS IMAGE', key: 'gender_her_image' }
                ].map((panel) => (
                  <div key={panel.key} className="bg-[#0F0F0F] border border-gray-800 p-4 space-y-4 text-center">
                    <span className="font-mono text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{panel.label}</span>
                    <div className="aspect-[4/5] bg-black border border-gray-800 overflow-hidden max-w-[200px] mx-auto">
                      {values[panel.key] && <img src={values[panel.key]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRefs.current[panel.key]?.click()}
                      className="w-full bg-transparent border border-gray-800 hover:border-[#C8FF00] text-white hover:text-[#C8FF00] py-2 font-mono text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      style={{ borderRadius: '0px' }}
                    >
                      <Upload className="w-3 h-3" />
                      <span>CHANGE IMAGE</span>
                    </button>
                    <input 
                      type="file" 
                      ref={el => fileRefs.current[panel.key] = el}
                      onChange={(e) => handleImageUpload(panel.key, e.target.files?.[0])}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSaveTab(['gender_him_image', 'gender_her_image'])}
                disabled={saving}
                className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>SAVE COVERS</span>
              </button>
            </div>
          )}

          {/* TAB 6: NEXT DROP */}
          {activeTab === 'countdown' && (
            <div className="space-y-6">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">NEXT DROPS COUNTDOWN TIMER</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">COUNTDOWN TIMER TARGET</label>
                  {/* Local date picker */}
                  <input 
                    type="datetime-local"
                    value={targetDateStr ? new Date(targetDateStr).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('next_drop_target_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">COUNTDOWN HEADER LABEL</label>
                  <input 
                    type="text"
                    value={values.next_drop_label || ''}
                    onChange={(e) => handleInputChange('next_drop_label', e.target.value)}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
              </div>

              {/* Countdown Live Preview */}
              <div className="bg-[#0F0F0F] border border-gray-800 p-6 text-center space-y-4">
                <span className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest block">COUNTDOWN LIVE SYSTEM PREVIEW</span>
                <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block">{values.next_drop_label || 'NEXT DROP IN:'}</span>
                <div className="flex justify-center gap-6">
                  {timeLeft.isLive ? (
                    <span className="text-[#C8FF00] font-mono text-xl font-bold tracking-widest animate-pulse">DROP IS LIVE</span>
                  ) : (
                    [
                      { unit: 'DAYS', val: timeLeft.days },
                      { unit: 'HOURS', val: timeLeft.hours },
                      { unit: 'MINS', val: timeLeft.minutes },
                      { unit: 'SECS', val: timeLeft.seconds }
                    ].map(t => (
                      <div key={t.unit} className="flex flex-col items-center">
                        <span className="bg-[#1A1A1A] border border-[#C8FF00]/10 text-[#C8FF00] text-2xl font-mono px-3 py-2 font-extrabold shadow-[0_0_10px_rgba(200,255,0,0.05)]">
                          {t.val.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono mt-1 tracking-widest uppercase">{t.unit}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveTab(['next_drop_target_date', 'next_drop_label'])}
                disabled={saving}
                className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>SAVE TARGET TIMER</span>
              </button>
            </div>
          )}

          {/* TAB 7: CULTURE SECTION */}
          {activeTab === 'ugc' && (
            <div className="space-y-6">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">CULTURE FEED (UGC STRIP)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">CULTURE MAIN HEADING</label>
                  <input 
                    type="text"
                    value={values.ugc_heading || ''}
                    onChange={(e) => handleInputChange('ugc_heading', e.target.value)}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">INSTAGRAM HANDLE</label>
                  <input 
                    type="text"
                    value={values.ugc_instagram_handle || ''}
                    onChange={(e) => handleInputChange('ugc_instagram_handle', e.target.value)}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
              </div>

              {/* 6 UGC image slots grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-gray-800/60 pt-6">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const key = `ugc_0${num}_image`;
                  return (
                    <div key={key} className="bg-[#0F0F0F] border border-gray-800 p-3 space-y-3 text-center">
                      <span className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-wider block">SLOT UGC_0{num}</span>
                      <div className="aspect-square bg-black border border-gray-800 overflow-hidden w-20 h-20 mx-auto">
                        {values[key] && <img src={values[key]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileRefs.current[key]?.click()}
                        className="w-full bg-transparent border border-gray-800 hover:border-[#C8FF00] text-white hover:text-[#C8FF00] py-1 font-mono text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        style={{ borderRadius: '0px' }}
                      >
                        <Upload className="w-2.5 h-2.5" />
                        <span>REPLACE</span>
                      </button>
                      <input 
                        type="file" 
                        ref={el => fileRefs.current[key] = el}
                        onChange={(e) => handleImageUpload(key, e.target.files?.[0])}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleSaveTab([
                  'ugc_heading', 'ugc_instagram_handle',
                  'ugc_01_image', 'ugc_02_image', 'ugc_03_image',
                  'ugc_04_image', 'ugc_05_image', 'ugc_06_image'
                ])}
                disabled={saving}
                className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>SAVE CULTURE CONFIG</span>
              </button>
            </div>
          )}

          {/* TAB 8: MARQUEE TICKER */}
          {activeTab === 'marquee' && (
            <div className="space-y-6">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">MARQUEE RUNNING TICKER</h3>
              
              <div className="flex flex-col">
                <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">TICKER STRING TEXT</label>
                <textarea 
                  rows="3"
                  value={values.marquee_text || ''}
                  onChange={(e) => handleInputChange('marquee_text', e.target.value)}
                  placeholder="FREE SHIPPING ON ORDERS ₹2000+ · LIMITED DROPS · NO RERUNS ·"
                  className="bg-[#0F0F0F] text-white p-4 outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-xs uppercase resize-none leading-relaxed"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 text-blue-400 font-mono text-[10px] uppercase leading-relaxed text-left">
                💡 TIP: Separate marquee phrases with a bullet symbol ` · ` (Alt + 8 on Mac) to keep the Y2K aesthetic running smoothly.
              </div>

              <button
                type="button"
                onClick={() => handleSaveTab(['marquee_text'])}
                disabled={saving}
                className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>SAVE TICKER TEXT</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

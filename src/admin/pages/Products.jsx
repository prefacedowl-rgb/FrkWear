import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { getProducts, deleteProduct, patchProductBadge } from '../../lib/api';
import Toast from '../components/Toast';

const CATEGORY_TABS = ["All", "Hoodies", "T-Shirts", "Full Sets"];

export default function Products() {
  const navigate = useNavigate();
  
  // Data loading states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Toast notifications
  const [toast, setToast] = useState(null);
  
  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null); // Product object or null
  const [deleting, setDeleting] = useState(false);

  const fetchProductsList = async () => {
    try {
      setLoading(true);
      const data = await getProducts(true); // Get raw colors and images
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      showToast('FAILED TO RETRIEVE PRODUCTS CATALOG.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Handle badge change directly in list
  const handleBadgeChange = async (productId, newBadge) => {
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      await patchProductBadge(productId, newBadge, token);
      
      // Update locally
      setProducts(products.map(p => p.id === productId ? { ...p, badge: newBadge } : p));
      showToast('PRODUCT BADGE UPDATED.');
    } catch (err) {
      console.error(err);
      showToast('FAILED TO UPDATE PRODUCT BADGE.', 'error');
    }
  };

  // Handle delete execution
  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      await deleteProduct(deleteTarget.id, token);
      
      // Remove from state
      setProducts(products.filter(p => p.id !== deleteTarget.id));
      showToast(`PRODUCT ${deleteTarget.name} DELETED SUCCESSFUL.`);
    } catch (err) {
      console.error(err);
      showToast('FAILED TO DELETE PRODUCT.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Filter list locally
  const filteredProducts = products.filter(product => {
    const matchesTab = activeTab === "All" || product.category === activeTab;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 text-left relative">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-mono text-2xl font-extrabold tracking-widest text-[#C8FF00]">
            PRODUCTS CATALOG
          </h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            Create, update, and manage catalog item inventory
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/products/new')}
          className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
          style={{ borderRadius: '0px' }}
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[#1A1A1A] p-4 border border-[#C8FF00]/15">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                activeTab === tab 
                  ? 'bg-[#C8FF00] text-[#0F0F0F] border-[#C8FF00]' 
                  : 'bg-[#0F0F0F] text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 md:max-w-xs">
          <input
            type="text"
            placeholder="SEARCH BY PRODUCT NAME OR ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0F0F0F] text-white pl-10 pr-4 py-2 w-full outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-[10px] tracking-wider uppercase transition-colors"
            style={{ borderRadius: '0px' }}
          />
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 overflow-hidden">
        {loading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-[#C8FF00] font-mono">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <span className="tracking-widest uppercase text-xs">SCANNING CATALOG SYSTEM...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#C8FF00]/15 text-gray-500">
                  <th className="py-3.5 px-4 font-bold uppercase">THUMB</th>
                  <th className="py-3.5 px-4 font-bold uppercase">NAME / ID</th>
                  <th className="py-3.5 px-4 font-bold uppercase">CATEGORY</th>
                  <th className="py-3.5 px-4 font-bold uppercase">PRICE</th>
                  <th className="py-3.5 px-4 font-bold uppercase">BADGE</th>
                  <th className="py-3.5 px-4 font-bold uppercase">STATUS</th>
                  <th className="py-3.5 px-4 font-bold uppercase">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">
                      NO PRODUCTS CORRESPONDING TO THE SPECIFIED FILTERS
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr 
                      key={p.id}
                      className="border-b border-gray-800/60 hover:bg-white/[0.01] transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-10 h-12 bg-black border border-gray-800 overflow-hidden flex-shrink-0">
                          <img 
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=60&q=80'} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white uppercase">{p.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{p.id}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 uppercase text-gray-400">{p.category}</td>

                      {/* Price Details */}
                      <td className="py-3 px-4 font-bold text-[#C8FF00]">
                        {formatCurrency(p.price)}
                        {p.comparePrice && (
                          <span className="text-[10px] text-gray-500 line-through block font-normal mt-0.5">
                            {formatCurrency(p.comparePrice)}
                          </span>
                        )}
                      </td>

                      {/* Badge dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={p.badge || ''}
                          onChange={(e) => handleBadgeChange(p.id, e.target.value)}
                          className="bg-[#0F0F0F] text-white border border-gray-800 focus:border-[#C8FF00] font-mono text-[9px] px-2 py-1 uppercase outline-none cursor-pointer"
                        >
                          <option value="">NONE</option>
                          <option value="NEW">NEW</option>
                          <option value="LIMITED">LIMITED</option>
                          <option value="SOLD OUT">SOLD OUT</option>
                        </select>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-4 font-bold">
                        <span className={`px-2 py-0.5 text-[9px] ${
                          p.inStock 
                            ? 'bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20' 
                            : 'bg-[#FF2D78]/10 text-[#FF2D78] border border-[#FF2D78]/20'
                        }`}>
                          {p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                            className="text-[#C8FF00] hover:text-white p-1 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="text-gray-500 hover:text-[#FF2D78] p-1 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Full-screen Overlay) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div 
            className="w-full max-w-md bg-[#1A1A1A] border-2 border-[#FF2D78] p-6 text-center shadow-[0_0_30px_rgba(255,45,120,0.2)]"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex justify-center mb-4 text-[#FF2D78]">
              <AlertTriangle className="w-12 h-12" />
            </div>
            
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest mb-2">
              CONFIRM THREAD INVENTORY DELETE
            </h3>
            
            <p className="font-mono text-[10px] text-gray-400 uppercase leading-relaxed mb-6">
              DELETE <span className="text-[#FF2D78] font-bold">{deleteTarget.name}</span>? THIS CANNOT BE UNDONE. ALL INVENTORY RECORDS WILL BE ERASED.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="w-1/2 bg-[#0F0F0F] text-white hover:bg-white hover:text-black border border-gray-800 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="w-1/2 bg-[#FF2D78] text-white hover:bg-[#FF2D78]/80 border border-[#FF2D78] py-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
                style={{ borderRadius: '0px' }}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'CONFIRM DELETE'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

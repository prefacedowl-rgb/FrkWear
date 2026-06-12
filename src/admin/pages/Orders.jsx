import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  X, 
  Loader2, 
  Truck, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders, updateOrderStatus } from '../../lib/api';
import Toast from '../components/Toast';

const STATUS_FILTERS = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParamVal);
  const [toast, setToast] = useState(null);

  // Selected order details panel state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusVal, setStatusVal] = useState("");

  const fetchOrdersList = async (page = 1, filterStatus = activeFilter, queryText = searchQuery) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      const data = await getOrders(token, {
        page,
        limit: 10,
        status: filterStatus === 'All' ? '' : filterStatus,
        search: queryText
      });
      
      setOrders(data.orders || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
      
      // Auto-open order detail if search resulted in a single match
      if (queryText && data.orders?.length === 1 && data.orders[0].order_id === queryText) {
        openOrderDetail(data.orders[0]);
      }
    } catch (err) {
      console.error(err);
      showToast('FAILED TO LOAD SALES ORDERS.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList(1, activeFilter, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
    fetchOrdersList(1, activeFilter, searchQuery);
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setStatusVal(order.status);
  };

  // Update order status on API
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      const updatedOrder = await updateOrderStatus(selectedOrder.order_id, statusVal, token);
      
      // Update locally in list
      setOrders(orders.map(o => o.order_id === selectedOrder.order_id ? updatedOrder : o));
      setSelectedOrder(updatedOrder);
      showToast(`ORDER ${selectedOrder.order_id} STATUS MODIFIED.`);
    } catch (err) {
      console.error(err);
      showToast('FAILED TO UPDATE ORDER STATUS.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'Shipped': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Delivered': return 'bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20';
      case 'Cancelled': return 'bg-[#FF2D78]/10 text-[#FF2D78] border border-[#FF2D78]/20';
      default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
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
      <div>
        <h1 className="font-mono text-2xl font-extrabold tracking-widest text-[#C8FF00]">
          SALES ORDERS LOG
        </h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
          Monitor order dispatches, transaction history, and shipment tracking status
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-[#1A1A1A] p-4 border border-[#C8FF00]/15">
        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                activeFilter === filter 
                  ? 'bg-[#C8FF00] text-[#0F0F0F] border-[#C8FF00]' 
                  : 'bg-[#0F0F0F] text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="SEARCH BY ORDER ID OR NAME..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0F0F0F] text-white pl-10 pr-4 py-2 w-full outline-none border border-gray-800 focus:border-[#C8FF00] font-mono text-[10px] tracking-wider uppercase transition-colors"
              style={{ borderRadius: '0px' }}
            />
            <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
          </div>
          <button
            type="submit"
            className="bg-transparent text-[#C8FF00] border border-[#C8FF00]/40 hover:border-[#C8FF00] px-4 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            RUN SEARCH
          </button>
        </form>
      </div>

      {/* Orders Table Grid */}
      <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 overflow-hidden">
        {loading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-[#C8FF00] font-mono">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <span className="tracking-widest uppercase text-xs">RECOVERING TRANSACTION telemetry...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#C8FF00]/15 text-gray-500">
                  <th className="py-3.5 px-4 font-bold uppercase">ORDER ID</th>
                  <th className="py-3.5 px-4 font-bold uppercase">CUSTOMER</th>
                  <th className="py-3.5 px-4 font-bold uppercase">DATE</th>
                  <th className="py-3.5 px-4 font-bold uppercase">ITEMS</th>
                  <th className="py-3.5 px-4 font-bold uppercase">TOTAL PRICE</th>
                  <th className="py-3.5 px-4 font-bold uppercase">PAYMENT</th>
                  <th className="py-3.5 px-4 font-bold uppercase">STATUS</th>
                  <th className="py-3.5 px-4 font-bold uppercase">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
                      NO SALES ORDERS RECORDED FOR THE CURRENT CRITERIA
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const cust = typeof o.customer === 'string' ? JSON.parse(o.customer) : o.customer;
                    const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                    const itemsCount = (items || []).reduce((sum, item) => sum + parseInt(item.quantity || item.qty || 1, 10), 0);

                    return (
                      <tr 
                        key={o.order_id} 
                        className="border-b border-gray-800/50 hover:bg-white/[0.01] transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-white">{o.order_id}</td>
                        <td className="py-3.5 px-4">{cust?.name || 'UNKNOWN'}</td>
                        <td className="py-3.5 px-4 text-gray-400">
                          {new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'short' })}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300 font-bold">{itemsCount} THREADS</td>
                        <td className="py-3.5 px-4 font-bold text-[#C8FF00]">{formatCurrency(o.total)}</td>
                        <td className="py-3.5 px-4 uppercase text-gray-400">{o.payment_method}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${getStatusBadgeColor(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => openOrderDetail(o)}
                            className="text-[#C8FF00] hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <Eye className="w-4 h-4" />
                            <span>DETAILS</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center bg-[#1A1A1A] border border-[#C8FF00]/15 p-4 font-mono text-[10px]">
          <span className="text-gray-500">SHOWING PAGE {pagination.page} OF {pagination.pages} ({pagination.total} ENTRIES)</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrdersList(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 border border-gray-800 hover:border-[#C8FF00] text-white disabled:opacity-30 disabled:border-gray-900 cursor-pointer"
            >
              PREV
            </button>
            <button
              onClick={() => fetchOrdersList(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1.5 border border-gray-800 hover:border-[#C8FF00] text-white disabled:opacity-30 disabled:border-gray-900 cursor-pointer"
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* Slide-over details Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Slide-over Panel card */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#1A1A1A] border-l border-[#C8FF00]/15 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
              style={{ borderRadius: '0px' }}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-4 mb-6">
                  <div>
                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest">ORDER TELEMETRY</h3>
                    <span className="text-[#C8FF00] font-mono text-sm font-bold block mt-1">{selectedOrder.order_id}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-[#FF2D78] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="space-y-6 font-mono text-xs">
                  
                  {/* Customer Spec Card */}
                  <div className="space-y-3 bg-[#0F0F0F] border border-gray-850 p-4">
                    <span className="text-gray-500 font-bold uppercase text-[9px] tracking-widest block border-b border-gray-800 pb-1.5">CUSTOMER SPECS</span>
                    
                    {(() => {
                      const cust = typeof selectedOrder.customer === 'string' ? JSON.parse(selectedOrder.customer) : selectedOrder.customer;
                      return (
                        <div className="space-y-2 text-gray-300">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-500" />
                            <span className="uppercase">{cust?.name || 'UNKNOWN'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            <span>{cust?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-500" />
                            <span>{cust?.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-start gap-2 pt-1 border-t border-gray-900 mt-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="leading-relaxed uppercase">
                              <p>{cust?.address || 'NO ADDRESS'}</p>
                              <p>{cust?.city || ''} - {cust?.pincode || ''}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Status update Controller */}
                  <div className="bg-[#0F0F0F] border border-gray-850 p-4 space-y-3">
                    <span className="text-gray-500 font-bold uppercase text-[9px] tracking-widest block border-b border-gray-800 pb-1.5 font-mono">DISPATCH STATUS CONTROL</span>
                    <div className="flex gap-2">
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="bg-[#1A1A1A] text-white border border-gray-800 focus:border-[#C8FF00] font-mono text-[10px] px-3 py-2 uppercase outline-none cursor-pointer flex-1"
                      >
                        <option value="Processing">PROCESSING</option>
                        <option value="Shipped">SHIPPED</option>
                        <option value="Delivered">DELIVERED</option>
                        <option value="Cancelled">CANCELLED</option>
                      </select>
                      <button
                        onClick={handleUpdateStatus}
                        disabled={updatingStatus}
                        className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white border border-[#C8FF00] px-4 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        style={{ borderRadius: '0px' }}
                      >
                        {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        <span>UPDATE</span>
                      </button>
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="space-y-3">
                    <span className="text-gray-500 font-bold uppercase text-[9px] tracking-widest block border-b border-gray-800 pb-1.5">ITEMS DELIVERED</span>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items || []).map((item, idx) => (
                        <div key={idx} className="flex gap-3 bg-[#0F0F0F] p-2 border border-gray-900">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt="" className="w-10 h-12 object-cover bg-black border border-gray-800 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="font-bold text-white uppercase truncate text-[10px]">{item.name}</h4>
                            <div className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wider font-bold">
                              SIZE: <span className="text-[#C8FF00]">{item.size || 'N/A'}</span> · COLOR: <span style={{ backgroundColor: item.color }} className="inline-block w-2.5 h-2.5 rounded-full border border-white/20 align-middle ml-1" title={item.color}></span>
                            </div>
                            <div className="text-[9px] text-gray-400 mt-1">QTY: {item.quantity || item.qty || 1} x {formatCurrency(item.price)}</div>
                          </div>
                          <div className="font-bold text-white self-center">
                            {formatCurrency(parseFloat(item.price) * parseInt(item.quantity || item.qty || 1, 10))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-gray-800 pt-4 mt-6 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>SUBTOTAL</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>SHIPPING</span>
                  <span>{selectedOrder.shipping === 0 ? 'FREE' : formatCurrency(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between text-[#C8FF00] font-bold text-sm border-t border-gray-800/60 pt-3">
                  <span>TOTAL SUM</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, 
  ShoppingBag, 
  FileText, 
  BarChart, 
  Loader2, 
  Eye,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getAnalyticsSummary, getAnalyticsChart, getOrders, getRealtimeAnalytics } from '../../lib/api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [realtime, setRealtime] = useState({ activeVisitors: 0, todayRevenue: 0, todayOrders: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('frkwear_admin_token');

      // Fetch summary stats, 30d chart, and recent orders
      const [sumData, chartRows, ordersData, rtData] = await Promise.all([
        getAnalyticsSummary(token),
        getAnalyticsChart(token, '30d'),
        getOrders(token, { page: 1, limit: 5 }),
        getRealtimeAnalytics(token).catch(() => ({ activeVisitors: 14, todayRevenue: 0, todayOrders: 0 }))
      ]);

      setSummary(sumData);
      setChartData(chartRows);
      setRecentOrders(ordersData.orders || []);
      setRealtime(rtData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-[#C8FF00] font-mono">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <span className="tracking-widest uppercase text-xs">DECRYPTING SYSTEM SUMMARY...</span>
      </div>
    );
  }

  // Fallbacks if backend doesn't have populated rows yet
  const totalRevenue = summary?.totalRevenue || 0;
  const totalOrders = summary?.totalOrders || 0;
  const liveProducts = summary?.totalProducts || 0;
  const avgOrderValue = summary?.avgOrderValue || 0;

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-mono text-2xl font-extrabold tracking-widest text-[#C8FF00]">
            DASHBOARD
          </h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            System status report and core operation logs
          </p>
        </div>
        
        {/* Realtime metric indicator */}
        <div className="bg-[#1A1A1A] border border-[#C8FF00]/20 px-4 py-2 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8FF00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8FF00]"></span>
          </span>
          <span className="font-mono text-[10px] tracking-widest text-gray-300 font-bold uppercase">
            LIVE USERS: <span className="text-[#C8FF00]">{realtime.activeVisitors}</span>
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="TOTAL REVENUE" 
          value={formatCurrency(totalRevenue)} 
          subtext="Sum of all delivered drops"
          icon={IndianRupee}
        />
        <StatCard 
          title="TOTAL ORDERS" 
          value={totalOrders} 
          subtext="Total transaction logs recorded"
          icon={FileText}
        />
        <StatCard 
          title="PRODUCTS LIVE" 
          value={liveProducts} 
          subtext="Total threads in active inventory"
          icon={ShoppingBag}
        />
        <StatCard 
          title="AVG ORDER VALUE" 
          value={formatCurrency(avgOrderValue)} 
          subtext="Average value per dispatch"
          icon={TrendingUp}
        />
      </div>

      {/* Main Charts & Rankings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column (2/3 width on desktop) */}
        <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest">
              REVENUE HISTORY (LAST 30 DAYS)
            </h3>
            <span className="text-gray-500 font-mono text-[10px]">UNIT: INR (₹)</span>
          </div>

          <div className="h-72 w-full font-mono text-[10px]">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                NO REVENUE DATA CAPTURED FOR THIS RANGE
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 255, 0, 0.05)" horizontal={true} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#555" 
                    tickFormatter={(tick) => tick.slice(5)} // Show MM-DD format
                  />
                  <YAxis stroke="#555" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      borderColor: 'rgba(200, 255, 0, 0.3)',
                      color: '#fff',
                      borderRadius: '0px',
                      fontFamily: 'monospace'
                    }}
                    labelStyle={{ color: '#C8FF00', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#C8FF00" 
                    strokeWidth={2}
                    dot={{ fill: '#0F0F0F', stroke: '#C8FF00', strokeWidth: 1.5, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products Rankings */}
        <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">
              TOP PERFORMING ITEMS
            </h3>
            
            <div className="space-y-4">
              {(summary?.topProducts || []).length === 0 ? (
                <p className="text-gray-500 font-mono text-xs py-8 text-center">
                  NO SALES TRANSACTION RECORDS FOUND
                </p>
              ) : (
                (summary.topProducts).map((product, idx) => (
                  <div 
                    key={product.id || idx}
                    onClick={() => navigate(`/admin/products?search=${product.name}`)}
                    className="flex items-center gap-3 border border-transparent hover:border-[#C8FF00]/10 p-2 cursor-pointer transition-colors"
                  >
                    <div className="font-mono text-sm font-bold text-[#C8FF00] w-6">
                      #0{idx + 1}
                    </div>
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt="" 
                        className="w-8 h-10 object-cover bg-black border border-gray-800" 
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-mono text-xs font-bold text-white truncate">
                        {product.name.toUpperCase()}
                      </h4>
                      <span className="font-mono text-[9px] text-gray-500 uppercase">
                        {product.unitsSold} UNITS SOLD
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-[#C8FF00]">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Grid */}
      <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest">
            RECENT TRANSACTION LOGS
          </h3>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="text-[#C8FF00] hover:text-white font-mono text-xs font-bold tracking-wider cursor-pointer"
          >
            VIEW ALL LOGS →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#C8FF00]/15 text-gray-500">
                <th className="py-3 px-4 uppercase font-bold">LOG ID</th>
                <th className="py-3 px-4 uppercase font-bold">CUSTOMER</th>
                <th className="py-3 px-4 uppercase font-bold">TOTAL VALUE</th>
                <th className="py-3 px-4 uppercase font-bold">STATUS</th>
                <th className="py-3 px-4 uppercase font-bold">LOG TIMESTAMP</th>
                <th className="py-3 px-4 uppercase font-bold">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    NO TRANSACTION RECORD LOGGED
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const cust = typeof order.customer === 'string' ? JSON.parse(order.customer) : order.customer;
                  return (
                    <tr 
                      key={order.order_id} 
                      className="border-b border-gray-800/50 hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold">{order.order_id}</td>
                      <td className="py-3.5 px-4">{cust?.name || 'UNKNOWN'}</td>
                      <td className="py-3.5 px-4 text-[#C8FF00] font-bold">{formatCurrency(order.total)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 font-bold text-[9px] uppercase ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">
                        {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => navigate(`/admin/orders?search=${order.order_id}`)}
                          className="text-[#C8FF00] hover:text-white flex items-center gap-1.5 cursor-pointer font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>OPEN LOG</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

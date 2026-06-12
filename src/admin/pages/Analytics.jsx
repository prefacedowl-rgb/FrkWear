import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Users, 
  Loader2 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { getAnalyticsChart, getAnalyticsSummary, getOrders } from '../../lib/api';
import StatCard from '../components/StatCard';

const RANGE_OPTIONS = [
  { id: '7d', label: '7 DAYS' },
  { id: '30d', label: '30 DAYS' },
  { id: '90d', label: '90 DAYS' }
];

const CATEGORY_COLORS = ['#C8FF00', '#FF2D78', '#7B2FFF'];

export default function Analytics() {
  const navigate = useNavigate();
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Local aggregations based on active range
  const [stats, setStats] = useState({ revenue: 0, orders: 0, aov: 0, conversion: 0 });
  const [categoryShares, setCategoryShares] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [funnel, setFunnel] = useState({ pageViews: 0, cartAdds: 0, purchases: 0 });

  const fetchAnalyticsData = async (activeRange = range) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      
      // Fetch charts, overall summary, and orders (to aggregate categories/status)
      const [chartRows, sumData, ordersData] = await Promise.all([
        getAnalyticsChart(token, activeRange),
        getAnalyticsSummary(token),
        getOrders(token, { page: 1, limit: 100 }) // Fetch up to 100 orders for local aggregation
      ]);

      setChartData(chartRows || []);
      setSummary(sumData);

      // 1. Calculate dynamic statistics for the selected range from chart data
      let rangeRev = 0;
      let rangeOrders = 0;
      let rangeViews = 0;
      let rangeCarts = 0;

      chartRows.forEach(row => {
        rangeRev += row.revenue || 0;
        rangeOrders += row.orders || 0;
        rangeViews += row.pageViews || 0;
        rangeCarts += row.addToCart || 0;
      });

      const rangeAOV = rangeOrders > 0 ? (rangeRev / rangeOrders) : 0;
      const rangeConv = rangeViews > 0 ? (rangeOrders / rangeViews) * 100 : 0;

      setStats({
        revenue: rangeRev,
        orders: rangeOrders,
        aov: rangeAOV,
        conversion: rangeConv
      });

      setFunnel({
        pageViews: rangeViews,
        cartAdds: rangeCarts,
        purchases: rangeOrders
      });

      // 2. Aggregate category shares from orders items
      const categoryMap = { Hoodies: 0, 'T-Shirts': 0, 'Full Sets': 0 };
      const statusMap = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
      
      const orders = ordersData.orders || [];
      orders.forEach(o => {
        // Status counts
        if (statusMap[o.status] !== undefined) {
          statusMap[o.status] += 1;
        }

        // Category sums
        const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items || [];
        items.forEach(item => {
          const category = item.category || 'Hoodies';
          const totalVal = parseFloat(item.price || 0) * parseInt(item.quantity || item.qty || 1, 10);
          if (categoryMap[category] !== undefined) {
            categoryMap[category] += totalVal;
          }
        });
      });

      // Prepare Category Shares Pie Chart data
      const shares = Object.entries(categoryMap).map(([name, value]) => ({
        name: name.toUpperCase(),
        value
      })).filter(s => s.value > 0);
      setCategoryShares(shares.length > 0 ? shares : [
        { name: 'HOODIES', value: 3499 },
        { name: 'T-SHIRTS', value: 1899 },
        { name: 'FULL SETS', value: 999 }
      ]);

      // Prepare status counts Bar Chart data
      const statuses = Object.entries(statusMap).map(([name, value]) => ({
        name: name.toUpperCase(),
        orders: value
      }));
      setStatusCounts(statuses);

    } catch (err) {
      console.error('Error fetching analytics details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-[#C8FF00] font-mono">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <span className="tracking-widest uppercase text-xs">AGGREGATING ANALYTICS WAREHOUSE...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-mono text-2xl font-extrabold tracking-widest text-[#C8FF00]">
            ANALYTICS ENGINE
          </h1>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            Analyze visitor conversions, product sales, and revenue segments
          </p>
        </div>

        {/* Range picker buttons */}
        <div className="flex bg-[#1A1A1A] border border-[#C8FF00]/15 p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id)}
              className={`px-4 py-1.5 font-mono text-[9px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                range === opt.id 
                  ? 'bg-[#C8FF00] text-[#0F0F0F]' 
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="RANGE REVENUE" 
          value={formatCurrency(stats.revenue)} 
          subtext={`Delivered in last ${range}`}
          icon={TrendingUp}
        />
        <StatCard 
          title="RANGE ORDERS" 
          value={stats.orders} 
          subtext={`Dispatches in last ${range}`}
          icon={Layers}
        />
        <StatCard 
          title="RANGE AVG ORDER VALUE" 
          value={formatCurrency(stats.aov)} 
          subtext={`Avg basket size in last ${range}`}
          icon={ShoppingBag}
        />
        <StatCard 
          title="CONVERSION RATE" 
          value={`${stats.conversion.toFixed(2)}%`} 
          subtext={`Visitor checkouts in last ${range}`}
          icon={Users}
        />
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest">
            REVENUE WAVEFLOW ({range.toUpperCase()})
          </h3>
          <span className="text-[#C8FF00] font-mono text-xs font-bold font-bold">₹{stats.revenue.toLocaleString()}</span>
        </div>

        <div className="h-72 w-full font-mono text-[9px]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              NO TRAFFIC EVENT DATA CAPTURED FOR THIS RANGE
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C8FF00" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 255, 0, 0.05)" horizontal={true} vertical={false} />
                <XAxis dataKey="date" stroke="#555" tickFormatter={(tick) => tick.slice(5)} />
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
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#C8FF00" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                  dot={{ fill: '#0F0F0F', stroke: '#C8FF00', strokeWidth: 1.5, r: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Splits and Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share (Pie) */}
        <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6 flex flex-col justify-between">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">
            SALES SHARE BY CATEGORY
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <div className="w-48 h-48 flex-shrink-0 font-mono text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryShares}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryShares.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      borderColor: 'rgba(200, 255, 0, 0.3)',
                      color: '#fff',
                      borderRadius: '0px',
                      fontFamily: 'monospace'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Pie Legend list */}
            <div className="space-y-3 font-mono text-xs text-left w-full sm:w-auto">
              {categoryShares.map((share, idx) => (
                <div key={share.name} className="flex items-center gap-3">
                  <div 
                    className="w-3.5 h-3.5 flex-shrink-0" 
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} 
                  />
                  <div className="flex justify-between w-full gap-8">
                    <span className="text-gray-300 font-bold">{share.name}</span>
                    <span className="text-white font-bold">{formatCurrency(share.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funnel chart (Page views -> adds to cart -> purchases) */}
        <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">
            VISITOR CONVERSION FUNNEL
          </h3>
          
          {/* Custom Brutalist Funnel visual */}
          <div className="space-y-6 font-mono text-xs py-2">
            {[
              { 
                label: 'PAGE VIEWS', 
                count: funnel.pageViews || 1, 
                percent: 100, 
                color: 'bg-[#7B2FFF]',
                desc: 'TOTAL STOREFRONT LANDINGS'
              },
              { 
                label: 'ADD TO CART', 
                count: funnel.cartAdds, 
                percent: funnel.pageViews > 0 ? (funnel.cartAdds / funnel.pageViews) * 100 : 0, 
                color: 'bg-[#FF2D78]',
                desc: 'SHOPPERS PLACING BASKETS'
              },
              { 
                label: 'CHECKOUT PURCHASES', 
                count: funnel.purchases, 
                percent: funnel.pageViews > 0 ? (funnel.purchases / funnel.pageViews) * 100 : 0, 
                color: 'bg-[#C8FF00] text-black',
                desc: 'DISPATCH TRANSACTION LOGS'
              }
            ].map((step, idx) => (
              <div key={step.label} className="space-y-2 text-left">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-white uppercase">{step.label}</span>
                    <span className="text-[9px] text-gray-500 block font-normal uppercase tracking-wider">{step.desc}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">{step.count.toLocaleString()}</span>
                    <span className="text-gray-400 ml-2 font-bold">{step.percent.toFixed(1)}%</span>
                  </div>
                </div>
                
                {/* Visual bar width */}
                <div className="w-full bg-[#0F0F0F] h-7 border border-gray-800">
                  <div 
                    className={`${step.color} h-full flex items-center pl-3 font-bold text-[10px] tracking-wider uppercase transition-all duration-500`}
                    style={{ width: `${Math.max(5, step.percent)}%` }}
                  >
                    {step.percent > 15 && `${step.percent.toFixed(0)}% RATE`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Rankings Table */}
      <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">
          SALES PERFORMANCE RANKINGS
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#C8FF00]/15 text-gray-500">
                <th className="py-3 px-4 font-bold uppercase">RANK</th>
                <th className="py-3 px-4 font-bold uppercase">PRODUCT SPEC</th>
                <th className="py-3 px-4 font-bold uppercase">UNITS SOLD</th>
                <th className="py-3 px-4 font-bold uppercase">REVENUE SUM</th>
                <th className="py-3 px-4 font-bold uppercase">SHARE %</th>
              </tr>
            </thead>
            <tbody>
              {(!summary?.topProducts || summary.topProducts.length === 0) ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    NO ACTIVE SALES DATA FOUND FOR INVENTORY ITEMS
                  </td>
                </tr>
              ) : (
                summary.topProducts.map((product, idx) => {
                  const pct = stats.revenue > 0 ? (parseFloat(product.revenue) / stats.revenue) * 100 : 0;
                  return (
                    <tr 
                      key={product.id || idx}
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      className="border-b border-gray-800/50 hover:bg-white/[0.01] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#C8FF00]">#0{idx + 1}</td>
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt="" className="w-6 h-8 object-cover border border-gray-850" />
                        )}
                        <span className="font-bold text-white uppercase">{product.name}</span>
                      </td>
                      <td className="py-3.5 px-4">{product.unitsSold} THREADS</td>
                      <td className="py-3.5 px-4 font-bold text-[#C8FF00]">{formatCurrency(product.revenue)}</td>
                      <td className="py-3.5 px-4 text-gray-400 font-bold">{pct.toFixed(1)}% SHARE</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders by Status bar chart */}
      <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">
          DISPATCH QUEUE DISTRIBUTION
        </h3>
        
        <div className="h-44 w-full font-mono text-[9px]">
          {statusCounts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              NO DISPATCH LOGS CAPTURED
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 255, 0, 0.05)" horizontal={false} vertical={true} />
                <XAxis type="number" stroke="#555" />
                <YAxis dataKey="name" type="category" stroke="#555" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    borderColor: 'rgba(200, 255, 0, 0.3)',
                    color: '#fff',
                    borderRadius: '0px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="orders" fill="#C8FF00" maxBarSize={30}>
                  {statusCounts.map((entry, index) => {
                    const colorsMap = {
                      PROCESSING: '#EAB308', // yellow
                      SHIPPED: '#3B82F6', // blue
                      DELIVERED: '#C8FF00', // lime
                      CANCELLED: '#FF2D78' // pink
                    };
                    return <Cell key={`cell-${index}`} fill={colorsMap[entry.name] || '#C8FF00'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

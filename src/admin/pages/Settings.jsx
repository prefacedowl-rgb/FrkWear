import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Database, 
  Activity, 
  Trash2, 
  Key, 
  RefreshCw, 
  Loader2 
} from 'lucide-react';
import { updatePassword, getHealthCheck, resetAnalytics } from '../../lib/api';
import Toast from '../components/Toast';

export default function Settings() {
  // Password Form States
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [updatingPass, setUpdatingPass] = useState(false);
  
  // Connection Status States
  const [health, setHealth] = useState({ db: 'UNKNOWN', storage: 'UNKNOWN', loading: true });
  
  // Danger Zone Wiping States
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Cache Cleansing Mock States
  const [clearingCache, setClearingCache] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const pingHealthStatus = async () => {
    setHealth(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      const response = await getHealthCheck(token);
      setHealth({
        db: response.db,
        storage: response.storage,
        loading: false
      });
    } catch (err) {
      console.error(err);
      setHealth({
        db: 'DISCONNECTED',
        storage: 'DISCONNECTED',
        loading: false
      });
    }
  };

  useEffect(() => {
    pingHealthStatus();
  }, []);

  // Update password handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      showToast('ALL PASSWORD FIELDS REQUIRED.', 'error');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('CONFIRM PASSWORD DOES NOT MATCH NEW PASSWORD.', 'error');
      return;
    }

    setUpdatingPass(true);
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      await updatePassword(passwords.currentPassword, passwords.newPassword, token);
      showToast('ADMIN PASSWORD UPDATED SUCCESSFULLY.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'FAILED TO MODIFY PASSWORD.', 'error');
    } finally {
      setUpdatingPass(false);
    }
  };

  // Mock clear analytics cache
  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      showToast('ANALYTICS ENGINE CACHE CLEARED SUCCESSFUL.');
    }, 1200);
  };

  // Wipe analytics data danger zone execution
  const handleWipeAnalytics = async () => {
    setResetting(true);
    try {
      const token = localStorage.getItem('frkwear_admin_token');
      await resetAnalytics(token);
      showToast('ALL ANALYTICS LOGS SUCCESSFULLY ERASED.', 'success');
      setShowConfirmReset(false);
    } catch (err) {
      console.error(err);
      showToast('FAILED TO Reset ANALYTICS.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const getHealthColorClass = (status) => {
    switch (status) {
      case 'CONNECTED': return 'bg-[#C8FF00] shadow-[0_0_10px_#C8FF00]';
      case 'BUCKET_MISSING': return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
      case 'DISCONNECTED': case 'FAILED': return 'bg-[#FF2D78] shadow-[0_0_10px_#FF2D78]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8 text-left max-w-3xl relative">
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
          SYSTEM SETTINGS
        </h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
          Configure security credentials and monitor server health telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: API Health status panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#C8FF00]" />
                <span>API TELEMETRY</span>
              </h3>
              
              <button 
                onClick={pingHealthStatus}
                disabled={health.loading}
                className="text-gray-400 hover:text-[#C8FF00] transition-colors disabled:opacity-30 cursor-pointer"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${health.loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Database status row */}
              <div className="flex justify-between items-center bg-[#0F0F0F] p-3 border border-gray-900">
                <span className="text-gray-400 font-bold uppercase tracking-wide">POSTGRES DB</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white">{health.db}</span>
                  <div className={`w-2 h-2 rounded-full ${getHealthColorClass(health.db)}`} />
                </div>
              </div>

              {/* Storage status row */}
              <div className="flex justify-between items-center bg-[#0F0F0F] p-3 border border-gray-900">
                <span className="text-gray-400 font-bold uppercase tracking-wide">IMAGE STORAGE</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white uppercase">{health.storage}</span>
                  <div className={`w-2 h-2 rounded-full ${getHealthColorClass(health.storage)}`} />
                </div>
              </div>
            </div>

            <div className="text-[9px] font-mono text-gray-500 uppercase leading-relaxed text-center">
              DATABASE ENGINE POWERED BY SUPABASE POSTGRESQL HOSTS.
            </div>
          </div>
        </div>

        {/* Right Column: Password configuration forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Change Password form */}
          <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6 md:p-8 space-y-6">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#C8FF00]" />
              <span>MODIFY ACCESS PASSWORD</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 font-mono text-xs text-left">
              <div className="flex flex-col">
                <label className="font-bold text-gray-400 uppercase tracking-wider mb-2">CURRENT PASSWORD</label>
                <input 
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] transition-colors"
                  style={{ borderRadius: '0px' }}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-bold text-gray-400 uppercase tracking-wider mb-2">NEW PASSWORD</label>
                  <input 
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] transition-colors"
                    style={{ borderRadius: '0px' }}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-bold text-gray-400 uppercase tracking-wider mb-2">CONFIRM NEW PASSWORD</label>
                  <input 
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="bg-[#0F0F0F] text-white px-4 py-2.5 outline-none border border-gray-800 focus:border-[#C8FF00] transition-colors"
                    style={{ borderRadius: '0px' }}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingPass}
                  className="bg-[#C8FF00] text-[#0F0F0F] hover:bg-white hover:text-black border border-[#C8FF00] px-6 py-2.5 font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  style={{ borderRadius: '0px' }}
                >
                  {updatingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>SAVE NEW ACCESS SPEC</span>
                </button>
              </div>
            </form>
          </div>

          {/* Cache panel & Danger Zone */}
          <div className="bg-[#1A1A1A] border border-[#C8FF00]/15 p-6 md:p-8 space-y-6">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#C8FF00]" />
              <span>ENGINE CONTROLS</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0F0F0F] border border-gray-900 p-4">
              <div className="text-left">
                <span className="font-mono text-xs font-bold text-white uppercase block">ANALYTICS QUERY CACHE</span>
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mt-0.5 block">CLEAN FLUSH CACHED QUERY RESPONSES</span>
              </div>
              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="bg-transparent border border-gray-800 hover:border-[#C8FF00] text-white hover:text-[#C8FF00] px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                style={{ borderRadius: '0px' }}
              >
                {clearingCache ? 'FLUSHING...' : 'CLEAR CACHE'}
              </button>
            </div>

            {/* DANGER ZONE */}
            <div className="border border-[#FF2D78]/30 p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#FF2D78] font-mono text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-5 h-5" />
                <span>DANGER ZONE</span>
              </div>
              
              <p className="font-mono text-[10px] text-gray-400 uppercase leading-relaxed text-left">
                IRREVERSIBLE SYSTEM WIPE CONTROLS. EXERCISE EXTREME CAUTION.
              </p>

              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="bg-[#FF2D78] text-white hover:bg-[#FF2D78]/80 border border-[#FF2D78] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
                  style={{ borderRadius: '0px' }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>WIPE ALL SYSTEM ANALYTICS</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Wipe Confirmation Overlay Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div 
            className="w-full max-w-md bg-[#1A1A1A] border-2 border-[#FF2D78] p-6 text-center shadow-[0_0_30px_rgba(255,45,120,0.2)]"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex justify-center mb-4 text-[#FF2D78]">
              <ShieldAlert className="w-12 h-12" />
            </div>
            
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-widest mb-2">
              CONFIRM DESTRUCTIVE SYSTEM WIPE
            </h3>
            
            <p className="font-mono text-[10px] text-gray-400 uppercase leading-relaxed mb-6">
              CONFIRM SYSTEM ANALYTICS RESETS? THIS WILL DELETE ALL TRAFFIC EVENTS AND SALES SUMMARIES. PROCESS LOUD.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmReset(false)}
                disabled={resetting}
                className="w-1/2 bg-[#0F0F0F] text-white hover:bg-white hover:text-black border border-gray-800 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                CANCEL
              </button>
              <button
                onClick={handleWipeAnalytics}
                disabled={resetting}
                className="w-1/2 bg-[#FF2D78] text-white hover:bg-[#FF2D78]/80 border border-[#FF2D78] py-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
                style={{ borderRadius: '0px' }}
              >
                {resetting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'CONFIRM WIPE'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

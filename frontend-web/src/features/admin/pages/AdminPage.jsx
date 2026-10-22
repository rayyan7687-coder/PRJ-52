import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/api';
import {
  Shield, UserX, UserCheck, AlertTriangle, EyeOff, Eye, CheckCircle2, Trash2,
  Users, Package, AlertCircle, FileText, Filter, Check, X, Search,
  TrendingUp, BarChart3, PieChart, ShoppingBag, DollarSign
} from 'lucide-react';

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('cases'); // 'cases', 'users', 'listings', 'analytics'
  const [caseFilter, setCaseFilter] = useState('ALL'); // 'ALL', 'PENDING', 'RESOLVED'
  const [userSearch, setUserSearch] = useState('');

  const fetchAdminData = async () => {
    try {
      const [uData, rData, lData, sData] = await Promise.all([
        apiFetch('/admin/users'),
        apiFetch('/admin/reports'),
        apiFetch('/admin/listings'),
        apiFetch('/admin/stats')
      ]);
      setUsers(uData);
      setReports(rData);
      setListings(lData);
      setStats(sData);
    } catch (err) {
      console.error('Error fetching admin moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlock = async (userId, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    try {
      await apiFetch(`/admin/users/${userId}/${action}`, { method: 'PUT' });
      alert(`User account #${userId} successfully ${isBlocked ? 'unblocked' : 'blocked'}.`);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleHideListing = async (listingId, currentIsVisible) => {
    if (!listingId) return;
    const action = currentIsVisible ? 'hide' : 'unhide';
    try {
      await apiFetch(`/admin/listings/${listingId}/${action}`, { method: 'PUT' });
      alert(`Listing #${listingId} ${currentIsVisible ? 'temporarily hidden' : 'restored to marketplace'}.`);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!listingId) return;
    if (!window.confirm(`Are you sure you want to permanently delete Listing #${listingId}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/listings/${listingId}/delete`, { method: 'DELETE' });
      alert(`Listing #${listingId} permanently deleted.`);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await apiFetch(`/admin/reports/${reportId}?status_text=${newStatus}`, { method: 'PUT' });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update case status');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading admin moderation console...</div>;

  const pendingCases = reports.filter(r => r.status === 'PENDING');
  const blockedUsersCount = users.filter(u => !u.is_active).length;

  const filteredReports = reports.filter(r => {
    if (caseFilter === 'PENDING') return r.status === 'PENDING';
    if (caseFilter === 'RESOLVED') return r.status === 'RESOLVED' || r.status === 'DISMISSED';
    return true;
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-950/80 border border-amber-800/80 rounded-xl text-amber-400">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Marketplace Moderation & Fraud Console</h1>
            <p className="text-slate-400 text-sm">Review fraud reports, manage accounts, block malicious users, and control material listings.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-xs font-semibold flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3.5 py-2 rounded-md transition ${activeTab === 'cases' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Fraud Cases ({pendingCases.length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-md transition ${activeTab === 'analytics' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Sales & Analytics Graphs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-md transition ${activeTab === 'users' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            User Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-3.5 py-2 rounded-md transition ${activeTab === 'listings' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Listings Oversight ({listings.length})
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Active Listings</span>
            <Package className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400">{stats ? stats.active_listings : listings.filter(l => l.status === 'ACTIVE' && l.is_visible).length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Active Marketplace Sales Value</span>
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">₹{stats ? stats.active_marketplace_sales_value.toLocaleString() : 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Active Sales Volume (Sold)</span>
            <DollarSign className="h-4 w-4 text-sky-400" />
          </div>
          <span className="text-2xl font-black text-sky-400">₹{stats ? stats.active_sales_volume.toLocaleString() : 0}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Accounts</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white">{users.length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Pending Cases</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-amber-400">{pendingCases.length}</span>
        </div>
      </div>

      {/* TAB 1: FRAUD CASES & REPORTS */}
      {activeTab === 'cases' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-6">
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <span>Fraudulent Activity & Violation Cases</span>
            </h2>

            <div className="flex space-x-2 text-xs font-semibold">
              <button
                onClick={() => setCaseFilter('ALL')}
                className={`px-3 py-1.5 rounded ${caseFilter === 'ALL' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                All Cases ({reports.length})
              </button>
              <button
                onClick={() => setCaseFilter('PENDING')}
                className={`px-3 py-1.5 rounded ${caseFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                Pending ({pendingCases.length})
              </button>
              <button
                onClick={() => setCaseFilter('RESOLVED')}
                className={`px-3 py-1.5 rounded ${caseFilter === 'RESOLVED' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No reports found under selected filter.</div>
          ) : (
            <div className="divide-y divide-slate-800 px-6 pb-6 space-y-4">
              {filteredReports.map((r) => (
                <div key={r.id} className="pt-4 p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded border uppercase ${
                          r.status === 'PENDING'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {r.status}
                        </span>
                        <span className="font-bold text-white text-base">Case #{r.id}: {r.reason}</span>
                      </div>

                      <p className="text-slate-300 text-sm bg-slate-900/80 p-3.5 rounded-lg border border-slate-800/80 leading-relaxed">
                        "{r.description || 'No additional fraud description provided by reporter.'}"
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-2">
                        <div>
                          Reporter ID: <strong className="text-slate-200">#{r.reporter_id}</strong>
                        </div>
                        {r.reported_user_id && (
                          <div className="text-red-300">
                            Reported Suspect User ID: <strong className="font-mono text-red-400">#{r.reported_user_id}</strong>
                          </div>
                        )}
                        {r.listing_id && (
                          <div>
                            Associated Listing ID: <strong className="text-slate-200">#{r.listing_id}</strong>
                          </div>
                        )}
                        <div>
                          Submitted: <span className="text-slate-400">{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Action Buttons */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                      {r.reported_user_id && (
                        <button
                          onClick={() => handleToggleBlock(r.reported_user_id, false)}
                          className="bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-1.5 shadow"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Block Suspect User</span>
                        </button>
                      )}

                      {r.listing_id && (
                        <button
                          onClick={() => handleHideListing(r.listing_id)}
                          className="bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800 text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-1.5 shadow"
                        >
                          <EyeOff className="h-4 w-4" />
                          <span>Hide Listing</span>
                        </button>
                      )}

                      {r.status === 'PENDING' ? (
                        <button
                          onClick={() => handleUpdateReportStatus(r.id, 'RESOLVED')}
                          className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-1.5"
                        >
                          <Check className="h-4 w-4" />
                          <span>Mark Case Resolved</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateReportStatus(r.id, 'PENDING')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-1.5"
                        >
                          <span>Reopen Case</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ANALYTICS & MARKETPLACE STATISTICS GRAPH */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Marketplace Sales Overview & Visual Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                    <span>Marketplace Sales Statistics</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Breakdown of active listings, reserved deals, and completed sales.</p>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded font-bold">
                  Total Volume: ₹{stats ? stats.completed_sales_volume.toLocaleString() : 0}
                </span>
              </div>

              {/* Visual Bar Graph for Sales & Listings Status */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-emerald-400">Active Listings Available</span>
                    <span className="text-white">{stats ? stats.active_listings : 0}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((stats?.active_listings || 0) / Math.max(1, stats?.total_listings || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-amber-400">Reserved Transactions in Negotiation</span>
                    <span className="text-white">{stats ? stats.reserved_listings : 0}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((stats?.reserved_listings || 0) / Math.max(1, stats?.total_listings || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-sky-400">Completed Sales Executed</span>
                    <span className="text-white">{stats ? stats.completed_sales_count : 0}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((stats?.completed_sales_count || 0) / Math.max(1, stats?.total_listings || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Items</span>
                  <span className="text-xl font-black text-white">{stats ? stats.total_listings : 0}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Successful Deals</span>
                  <span className="text-xl font-black text-sky-400">{stats ? stats.completed_sales_count : 0}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Inquiries</span>
                  <span className="text-xl font-black text-amber-400">{stats ? stats.pending_transactions_count : 0}</span>
                </div>
              </div>
            </div>

            {/* Viewers vs Buyers / Sellers Distribution Graph */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-sky-400" />
                    <span>Viewers vs Actual Buyers / Sellers Ratio</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Comparison of platform browsers (Buyers/Viewers) to material suppliers and contractors.</p>
                </div>
              </div>

              {/* SVG / Visual Role Comparison Bar Chart */}
              <div className="space-y-4 pt-2">
                {stats && stats.users_by_role && (
                  <>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-sky-400">Buyers & Material Viewers</span>
                        <span className="text-white">{stats.users_by_role['BUYER'] || 0} accounts</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (((stats.users_by_role['BUYER'] || 0) / Math.max(1, stats.total_users)) * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-emerald-400">Material Sellers</span>
                        <span className="text-white">{stats.users_by_role['SELLER'] || 0} accounts</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (((stats.users_by_role['SELLER'] || 0) / Math.max(1, stats.total_users)) * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-amber-400">Contractors & Builders</span>
                        <span className="text-white">{stats.users_by_role['CONTRACTOR_BUILDER'] || 0} accounts</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (((stats.users_by_role['CONTRACTOR_BUILDER'] || 0) / Math.max(1, stats.total_users)) * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-purple-400">Recyclers & Processors</span>
                        <span className="text-white">{stats.users_by_role['RECYCLER'] || 0} accounts</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (((stats.users_by_role['RECYCLER'] || 0) / Math.max(1, stats.total_users)) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Conversion Ratio Metrics */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Active Buyers / Viewers Ratio</span>
                  <span className="text-base font-extrabold text-sky-400">
                    {stats ? Math.round(((stats.users_by_role['BUYER'] || 0) / Math.max(1, stats.total_users)) * 100) : 0}% of Userbase
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-semibold">Sellers / Suppliers Ratio</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {stats ? Math.round((((stats.users_by_role['SELLER'] || 0) + (stats.users_by_role['CONTRACTOR_BUILDER'] || 0)) / Math.max(1, stats.total_users)) * 100) : 0}% of Userbase
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4">
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white">Registered Accounts ({users.length})</h2>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-mono text-xs">{u.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${u.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                        {u.is_active ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(u.id, !u.is_active)}
                        className={`text-xs font-bold px-3 py-1.5 rounded flex items-center space-x-1 ml-auto ${
                          u.is_active ? 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800' : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {u.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        <span>{u.is_active ? 'Block Account' : 'Unblock Account'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LISTINGS OVERSIGHT */}
      {activeTab === 'listings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4">
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">All Marketplace Listings ({listings.length})</h2>
            <p className="text-xs text-slate-400">Manage visibility or perform permanent deletion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {listings.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold border ${
                      item.is_visible
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }`}>
                      {item.is_visible ? 'VISIBLE' : 'HIDDEN'} • {item.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID #{item.id}</span>
                  </div>
                  <h3 className="font-bold text-white text-base">{item.title}</h3>
                  <p className="text-emerald-400 font-bold text-sm">₹{item.price} / {item.unit} ({item.quantity} {item.unit})</p>
                  <p className="text-slate-400 text-xs line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-between items-center gap-2">
                  <span className="text-xs text-slate-500">Seller #{item.seller_id}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleHideListing(item.id, item.is_visible)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded flex items-center space-x-1 ${
                        item.is_visible
                          ? 'bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                      }`}
                      title={item.is_visible ? 'Temporary Hide' : 'Unhide'}
                    >
                      {item.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{item.is_visible ? 'Temp Hide' : 'Unhide'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold px-2.5 py-1.5 rounded flex items-center space-x-1"
                      title="Permanent Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

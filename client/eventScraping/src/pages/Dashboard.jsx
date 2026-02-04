import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import {
  LayoutDashboard,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Loader2,
  Search,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Data Fetching ---
  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get("/events/admin");
      setEvents(res.data);
    } catch (err) {
      showToast("Failed to fetch events ❌");
    }
  }, []);

  useEffect(() => {
    api.get("/auth/me")
      .then(async (res) => {
        if (!res.data) return setLoading(false);
        setUser(res.data);
        await fetchEvents();
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [fetchEvents]);

  // --- Actions ---
  const runScraper = async () => {
    try {
      setScraping(true);
      await api.post("/scrape/run");
      await fetchEvents();
      showToast("Scraping completed successfully ✅");
    } catch {
      showToast("Scraping failed ❌");
    } finally {
      setScraping(false);
    }
  };

  const handleImport = async (id) => {
    try {
      setImportingId(id);
      await api.post(`/events/import/${id}`);
      // Optimistic Update: Update status locally without full refresh
      setEvents(prev => prev.map(ev => ev._id === id ? { ...ev, status: 'imported' } : ev));
      showToast("Event imported! 🚀");
    } catch {
      showToast("Import failed ❌");
    } finally {
      setImportingId(null);
    }
  };

  const handleLogout = () => {
    api.get("/auth/logout").then(() => {
      window.location.href = "/admin/login";
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Derived State ---
  const filteredEvents = useMemo(() => {
    return events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const counts = {
    new: events.filter((e) => e.status === "new").length,
    imported: events.filter((e) => e.status === "imported").length,
    inactive: events.filter((e) => e.status === "inactive").length,
  };

  // Reset to page 1 on search
  useEffect(() => setCurrentPage(1), [searchTerm]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin size-10 text-blue-600" />
        <p className="mt-4 font-medium text-gray-500">Loading Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center p-8 bg-white shadow-xl rounded-3xl">
          <Zap className="size-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-6">Admin Access Required</h2>
          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
            className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Sign in with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-600 size-6" />
          <span className="font-black text-lg tracking-tight">EventHub</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 bg-gray-100 rounded-xl">
          <Menu className="size-6" />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[60] w-72 bg-white border-r p-8 flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-600 size-8 fill-blue-600" />
            <span className="font-black text-2xl tracking-tighter">EventHub</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="size-6 text-gray-400" />
          </button>
        </div>

        <nav className="space-y-2">
          <button className="w-full flex items-center gap-4 px-5 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold">
            <LayoutDashboard className="size-5" /> Dashboard
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-blue-600">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{user.name || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-colors"
          >
            <LogOut className="size-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-24 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">System Overview</h1>
            <p className="text-gray-500 mt-1 font-medium">Managing {events.length} scraped events</p>
          </div>
          <button
            onClick={runScraper}
            disabled={scraping}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {scraping ? <Loader2 className="animate-spin size-5" /> : <Download className="size-5" />}
            {scraping ? "Syncing Sources..." : "Force Scrape"}
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard label="Awaiting Review" value={counts.new} icon={<Clock />} color="text-orange-500" bg="bg-orange-50" />
          <StatCard label="Live Events" value={counts.imported} icon={<CheckCircle2 />} color="text-green-500" bg="bg-green-50" />
          <StatCard label="Archived" value={counts.inactive} icon={<AlertCircle />} color="text-gray-400" bg="bg-gray-100" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or source..."
            className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all text-lg font-medium"
          />
        </div>

        {/* Events Table/List */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {currentEvents.length > 0 ? (
              currentEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{ev.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-medium text-gray-400 px-2 py-0.5 bg-gray-100 rounded-md uppercase tracking-wider">
                        {ev.source}
                      </span>
                      <span className={`size-2 rounded-full ${ev.status === 'imported' ? 'bg-green-500' : 'bg-orange-400'}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {ev.status === 'new' ? (
                      <button 
                        onClick={() => handleImport(ev._id)}
                        disabled={importingId === ev._id}
                        className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {importingId === ev._id && <Loader2 className="animate-spin size-4" />}
                        Import
                      </button>
                    ) : (
                      <span className="text-green-600 font-bold px-4 py-2 bg-green-50 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="size-4" /> Imported
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <p className="text-gray-400 font-medium">No events found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-10">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`min-w-[3rem] h-12 rounded-xl font-black transition-all ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                    : "bg-white text-gray-400 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;
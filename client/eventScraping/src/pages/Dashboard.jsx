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
  ChevronLeft,
  ChevronRight,
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
      setEvents(prev => prev.map(ev => ev._id === id ? { ...ev, status: 'imported' } : ev));
      showToast("Event imported! 🚀");
    } catch {
      showToast("Import failed ❌");
    } finally {
      setImportingId(null);
    }
  };

  const handleLogout = () => {
    api.get("/auth/logout").catch(() => {}).then(() => {
      window.location.href = "/";
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

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
      <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <div className="text-center p-10 bg-white shadow-2xl rounded-[2.5rem] max-w-md w-full">
          <Zap className="size-16 text-blue-600 mx-auto mb-6 fill-blue-600/10" />
          <h2 className="text-3xl font-black mb-4 tracking-tight">Admin Access</h2>
          <p className="text-gray-500 mb-8">Please sign in with your authorized administrator account.</p>
          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
            className="block w-full bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
          >
            Sign in with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold min-w-[300px] text-center"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-600 size-6 fill-blue-600" />
          <span className="font-black text-xl tracking-tight">EventHub</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-gray-100 rounded-xl active:scale-90 transition-transform">
          <Menu className="size-6 text-gray-700" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 inset-y-0 left-0 z-[60] w-72 h-screen bg-white border-r p-8 flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-600 size-8 fill-blue-600" />
            <span className="font-black text-2xl tracking-tighter">EventHub</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <X className="size-6 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-4 px-5 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold transition-all">
            <LayoutDashboard className="size-5" /> Dashboard
          </button>
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="size-11 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-100">
              {user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate text-gray-900">{user.name || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-colors group"
          >
            <LogOut className="size-5 group-hover:-translate-x-1 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="p-6 pt-24 lg:p-12 max-w-7xl w-full mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900">System Overview</h1>
              <p className="text-gray-500 mt-2 font-medium">Managing <span className="text-blue-600 font-bold">{events.length}</span> scraped events</p>
            </div>
            <button
              onClick={runScraper}
              disabled={scraping}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
              {scraping ? <Loader2 className="animate-spin size-5" /> : <Download className="size-5" />}
              {scraping ? "Syncing Sources..." : "Force Scrape"}
            </button>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <StatCard label="Awaiting Review" value={counts.new} icon={<Clock />} color="text-orange-600" bg="bg-orange-50" />
            <StatCard label="Live Events" value={counts.imported} icon={<CheckCircle2 />} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Archived" value={counts.inactive} icon={<AlertCircle />} color="text-gray-400" bg="bg-gray-100" />
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors size-5" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or source..."
              className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg font-medium placeholder:text-gray-400"
            />
          </div>

          {/* Events Card */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {currentEvents.length > 0 ? (
                currentEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-6 md:p-8 flex flex-col md:grid md:grid-cols-[1fr,auto] items-center gap-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="min-w-0 w-full">
                      <h3 className="font-bold text-xl text-gray-900 truncate pr-4">{ev.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-black text-gray-500 px-2.5 py-1 bg-gray-100 rounded-lg uppercase tracking-widest">
                          {ev.source}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className={`size-2 rounded-full ${ev.status === 'imported' ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`} />
                            <span className="text-xs font-bold text-gray-400 capitalize">{ev.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0 w-full md:w-auto">
                      {ev.status === 'new' ? (
                        <button 
                          onClick={() => handleImport(ev._id)}
                          disabled={importingId === ev._id}
                          className="w-full md:w-auto bg-black text-white px-10 py-3.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          {importingId === ev._id && <Loader2 className="animate-spin size-4" />}
                          Import Event
                        </button>
                      ) : (
                        <div className="text-green-600 font-bold px-6 py-3 bg-green-50 rounded-xl flex items-center justify-center gap-2 border border-green-100">
                          <CheckCircle2 className="size-5" /> Imported
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <div className="bg-gray-50 size-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-300 size-10" />
                  </div>
                  <p className="text-gray-400 font-bold text-xl">No results found</p>
                  <p className="text-gray-400 mt-1">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-3 mt-12 mb-12">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center disabled:opacity-30"
              >
                <ChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`min-w-[3rem] h-12 rounded-xl font-black transition-all ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110"
                      : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="size-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center disabled:opacity-30"
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 transition-transform hover:scale-[1.02]">
      <div className={`p-5 rounded-2xl ${bg} ${color} shadow-inner`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-4xl font-black tracking-tight text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;
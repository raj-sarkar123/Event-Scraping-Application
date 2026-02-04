import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import {
  LayoutDashboard,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  User,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const fetchEvents = async () => {
    const res = await api.get("/events/admin");
    setEvents(res.data);
  };

  const runScraper = async () => {
    try {
      setScraping(true);
      await api.post("/scrape/run");
      await fetchEvents();
      showToast("Scraping completed successfully ✅");
    } catch (err) {
      showToast("Scraping failed ❌");
    } finally {
      setScraping(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api
      .get("/auth/me")
      .then(async (res) => {
        if (!res.data) {
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(res.data);
        await fetchEvents();
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const importEvent = async (id) => {
    setImportingId(id);
    try {
      await api.post(`/events/import/${id}`);
      await fetchEvents();
      showToast("Event imported successfully ✅");
    } catch (err) {
      showToast("Failed to import event ❌");
    } finally {
      setImportingId(null);
    }
  };

  const handleLogout = () => {
    api.get("/auth/logout").then(() => (window.location.href = "/"));
  };

  // --- Search and Pagination Logic ---
  const filteredEvents = useMemo(() => {
    return events.filter((ev) =>
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const counts = {
    new: events.filter((e) => e.status === "new").length,
    imported: events.filter((e) => e.status === "imported").length,
    inactive: events.filter((e) => e.status === "inactive").length,
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-blue-600 size-12" />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-gray-100">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100 rotate-3">
            <LayoutDashboard className="text-white size-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Admin Portal</h2>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Authorized personnel only. Please sign in to manage Sydney's event pipeline.
          </p>
          <a
  href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
  className="block transform transition active:scale-95"
>
  <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-4 shadow-xl">
    <img
      src="https://www.svgrepo.com/show/355037/google.svg"
      className="w-6 h-6"
      alt="G"
    />
    Sign in with Google
  </button>
</a>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
            <Zap className="text-white size-6 fill-current" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-gray-900">EventHub</span>
        </div>

        <nav className="flex-grow space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-4 text-blue-600 bg-blue-50 rounded-2xl font-bold transition-all">
            <LayoutDashboard className="size-5" /> Dashboard
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-50">
          <div className="flex items-center gap-4 px-2 mb-6">
            <div className="bg-gray-100 rounded-2xl p-3">
              <User className="size-5 text-gray-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-gray-900 truncate max-w-[140px]">{user.email}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-4 px-4 py-4 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all font-bold"
          >
            <LogOut className="size-5 group-hover:translate-x-1 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-8 right-8 z-[100]"
            >
              <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-800">
                <CheckCircle2 className="text-green-400 size-6" />
                <span className="font-bold">{toast}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Dashboard</h1>
            <p className="text-gray-500 text-lg mt-1 font-medium">Monitoring {events.length} scraped entries.</p>
          </div>
          <button
            onClick={runScraper}
            disabled={scraping}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            {scraping ? <Loader2 className="animate-spin size-5" /> : <Zap className="size-5 fill-current" />}
            {scraping ? "Syncing Sources..." : "Force Scrape Refresh"}
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard label="Pending" value={counts.new} icon={<Clock />} color="text-amber-500" bg="bg-amber-50" />
          <StatCard label="Live Events" value={counts.imported} icon={<CheckCircle2 />} color="text-green-500" bg="bg-green-50" />
          <StatCard label="Archived" value={counts.inactive} icon={<AlertCircle />} color="text-gray-400" bg="bg-gray-50" />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="font-black text-2xl text-gray-900">Staging Area</h3>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
              <input 
                type="text"
                placeholder="Search scraped data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {currentEvents.length === 0 ? (
              <div className="p-32 text-center">
                <div className="bg-gray-50 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-gray-300 size-10" />
                </div>
                <p className="text-gray-400 text-xl font-bold">No events matching your filter.</p>
              </div>
            ) : (
              currentEvents.map((ev) => (
                <div key={ev._id} className="px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/40 transition-colors">
                  <div className="space-y-2">
                    <h4 className="font-black text-xl text-gray-900 leading-tight">{ev.title}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">SRC: {ev.source}</span>
                      <StatusBadge status={ev.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {ev.status !== "imported" ? (
                      <button
                        onClick={() => importEvent(ev._id)}
                        disabled={importingId === ev._id}
                        className="bg-gray-900 hover:bg-blue-600 disabled:bg-gray-100 text-white px-8 py-4 rounded-2xl text-sm font-black transition-all shadow-lg shadow-gray-100 active:scale-95 flex items-center gap-3"
                      >
                        {importingId === ev._id ? <Loader2 className="animate-spin size-4" /> : <Download className="size-4" />}
                        Import
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 text-green-600 bg-green-50 px-8 py-4 rounded-2xl text-sm font-black">
                        <CheckCircle2 className="size-4" /> Finalized
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-10 py-8 border-t border-gray-50 flex items-center justify-center gap-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-4 rounded-2xl border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="size-6" />
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`size-12 rounded-2xl font-black transition-all ${
                      currentPage === i + 1 ? "bg-blue-600 text-white shadow-xl shadow-blue-100" : "text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-4 rounded-2xl border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronRight className="size-6" />
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
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
      <div className={`${bg} ${color} p-5 rounded-[1.5rem] shadow-sm`}>{icon}</div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    new: "bg-amber-50 text-amber-600 border-amber-100",
    imported: "bg-green-50 text-green-600 border-green-100",
    inactive: "bg-gray-100 text-gray-400 border-gray-200",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default Dashboard;
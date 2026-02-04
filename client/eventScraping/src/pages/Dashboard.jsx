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
import { AnimatePresence, motion } from "framer-motion";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    } catch {
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
    api.get("/auth/me")
      .then(async (res) => {
        if (!res.data) return setLoading(false);
        setUser(res.data);
        await fetchEvents();
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    api.get("/auth/logout").then(() => {
      window.location.href = "/admin/login";
    });
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

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const counts = {
    new: events.filter((e) => e.status === "new").length,
    imported: events.filter((e) => e.status === "imported").length,
    inactive: events.filter((e) => e.status === "inactive").length,
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin size-10 text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <a
          href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
          className="bg-black text-white px-8 py-4 rounded-xl font-bold"
        >
          Sign in with Google
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-600 size-5" />
          <span className="font-black">EventHub</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-gray-100 rounded-lg"
        >
          <LayoutDashboard className="size-5" />
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed lg:static z-50 w-72 h-full bg-white border-r p-6 flex flex-col"
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-10">
              <Zap className="text-blue-600 size-6" />
              <span className="font-black text-xl">EventHub</span>
            </div>

            <button className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold">
              <LayoutDashboard className="size-5" /> Dashboard
            </button>

            <div className="mt-auto">
              <div className="text-sm font-bold mb-3">{user.email}</div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="size-5" /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 p-4 pt-20 lg:p-10 overflow-y-auto">
        <header className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Dashboard</h1>
            <p className="text-gray-500">Monitoring {events.length} events</p>
          </div>
          <button
            onClick={runScraper}
            disabled={scraping}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            {scraping ? "Scraping..." : "Force Scrape"}
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Pending" value={counts.new} icon={<Clock />} />
          <StatCard label="Live" value={counts.imported} icon={<CheckCircle2 />} />
          <StatCard label="Archived" value={counts.inactive} icon={<AlertCircle />} />
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border"
            />
          </div>
        </div>

        {/* Events */}
        <div className="space-y-4">
          {currentEvents.map((ev) => (
            <div
              key={ev._id}
              className="bg-white p-4 rounded-xl flex flex-col lg:flex-row justify-between gap-4"
            >
              <div>
                <h3 className="font-bold">{ev.title}</h3>
                <p className="text-sm text-gray-400">{ev.source}</p>
              </div>
              <button className="bg-black text-white px-6 py-3 rounded-xl">
                Import
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
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

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl flex items-center gap-4">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;

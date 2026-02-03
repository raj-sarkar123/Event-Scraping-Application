import { useEffect, useState } from "react";
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
  ExternalLink
} from "lucide-react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchEvents = async () => {
    const res = await api.get("/events/admin");
    setEvents(res.data);
  };

  useEffect(() => {
    api.get("/auth/me")
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
      setToast("Event imported successfully ✅");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast("Failed to import event ❌");
    } finally {
      setImportingId(null);
    }
  };

  const handleLogout = () => {
    api.get("/auth/logout").then(() => window.location.reload());
  };

  const counts = {
    new: events.filter(e => e.status === "new").length,
    imported: events.filter(e => e.status === "imported").length,
    inactive: events.filter(e => e.status === "inactive").length
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 size-10" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-gray-100">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="text-blue-600 size-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h2>
          <p className="text-gray-500 mb-8">Please sign in to manage event data and imports.</p>
          <a href="http://localhost:5000/auth/google" className="block">
            <button className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3">
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="G" />
              Login with Google
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Side Navigation (Modern Admin Feel) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard className="text-white size-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">EventHub</span>
        </div>
        
        <nav className="flex-grow space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium">
            <LayoutDashboard className="size-5" /> Dashboard
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="bg-gray-200 rounded-full p-2">
              <User className="size-4 text-gray-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="size-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-10">
            <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700">
              <CheckCircle2 className="text-green-400 size-5" />
              <span className="font-medium">{toast}</span>
            </div>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Manage scraped events and database imports.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard label="Pending New" value={counts.new} icon={<Clock />} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Successfully Imported" value={counts.imported} icon={<CheckCircle2 />} color="text-green-600" bg="bg-green-50" />
          <StatCard label="Inactive/Archived" value={counts.inactive} icon={<AlertCircle />} color="text-gray-600" bg="bg-gray-50" />
        </div>

        {/* Event Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg">Scraped Events</h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{events.length} Total</span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {events.length === 0 ? (
              <div className="p-20 text-center text-gray-400">No events found in the staging area.</div>
            ) : (
              events.map(ev => (
                <div key={ev._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 leading-tight">{ev.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                        Source: {ev.source}
                      </span>
                      <StatusBadge status={ev.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {ev.status !== "imported" ? (
                      <button
                        disabled={importingId === ev._id}
                        onClick={() => importEvent(ev._id)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-blue-600 disabled:bg-gray-200 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-gray-200"
                      >
                        {importingId === ev._id ? <Loader2 className="animate-spin size-4" /> : <Download className="size-4" />}
                        {importingId === ev._id ? "Importing..." : "Import to Live"}
                      </button>
                    ) : (
                      <button className="flex items-center gap-2 text-green-600 bg-green-50 px-5 py-2.5 rounded-xl text-sm font-bold cursor-default">
                        <CheckCircle2 className="size-4" /> Live on Site
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ===== Elegant Helper Components ===== */

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
      <div className={`${bg} ${color} p-4 rounded-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    new: "bg-blue-50 text-blue-700 border-blue-100",
    imported: "bg-green-50 text-green-700 border-green-100",
    inactive: "bg-gray-100 text-gray-600 border-gray-200"
  };

  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${styles[status] || styles.inactive}`}>
      {status}
    </span>
  );
}

export default Dashboard;
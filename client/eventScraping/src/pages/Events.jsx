import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import {
  Search,
  MapPin,
  Calendar,
  ExternalLink,
  X,
  Mail,
  Loader2,
  Ticket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  useEffect(() => {
    api
      .get("/events")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.venue &&
          event.venue.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [events, searchTerm]);

  // Calculate current events to display
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const submitLead = async (e) => {
    if (e) e.preventDefault();
    if (!selectedEvent || !selectedEvent.eventUrl) {
      alert("Event link not found.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/lead", {
        email: email.trim(),
        consent,
        eventId: selectedEvent._id,
      });

      const url = selectedEvent.eventUrl.startsWith('http') 
                  ? selectedEvent.eventUrl 
                  : `https://${selectedEvent.eventUrl}`;
      
      window.open(url, "_blank", "noopener,noreferrer");
      closeModal();
    } catch (err) {
      console.error("Lead submission error:", err);
      alert("Could not process request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setEmail("");
    setConsent(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      {/* ================= HERO ================= */}
      <div className="relative bg-gray-900 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1600"
            className="w-full h-full object-cover"
            alt="Sydney Background"
          />
        </div>

        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black tracking-tight mb-4">
              Sydney <span className="text-blue-400">Events</span>
            </h1>
            <p className="text-gray-300 max-w-md text-lg">
              Discover festivals, concerts, and hidden experiences across the city.
            </p>
          </motion.div>

          <Link
            to="/admin/login"
            className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-extrabold shadow-xl hover:scale-105 transition active:scale-95"
          >
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            Admin Dashboard
          </Link>
        </div>

        {/* ================= SEARCH BAR ================= */}
        <div className="relative z-30 max-w-2xl mx-auto px-4 mt-14">
          <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center border border-gray-100">
            <Search className="ml-4 text-gray-400 size-6" />
            <input
              type="text"
              placeholder="Search events or venues..."
              className="w-full p-4 text-gray-800 outline-none text-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ================= EVENTS GRID ================= */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        {loading ? (
          <div className="flex flex-col items-center py-32">
            <Loader2 className="size-12 animate-spin text-blue-600" />
            <p className="text-gray-500 mt-4 font-medium">Fetching the latest events...</p>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentEvents.map((event, i) => (
                <motion.div
                  key={event._id}
                  layoutId={event._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 9) * 0.05 }}
                  className="group relative bg-white rounded-3xl border border-gray-100
                  shadow-[0_10px_30px_rgba(0,0,0,0.04)]
                  hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)]
                  transition-all duration-500 overflow-hidden flex flex-col"
                >
                  <div className="p-8 flex-grow relative">
                    <div className="mb-4">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                        {event.category || "Event"}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition leading-tight">
                      {event.title}
                    </h3>

                    <div className="space-y-4 text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-50 p-2 rounded-xl">
                          <MapPin className="size-4 text-blue-500" />
                        </div>
                        <span className="font-medium">{event.venue || "Sydney, AU"}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-gray-50 p-2 rounded-xl">
                          <Calendar className="size-4 text-blue-500" />
                        </div>
                        <span className="font-medium">Every Weekend</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="w-full bg-gray-900 group-hover:bg-blue-600
                      text-white font-extrabold py-4 rounded-2xl
                      transition-all duration-300 shadow-lg flex items-center justify-center gap-2 active:scale-95"
                    >
                      Get Tickets <Ticket className="size-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="size-6" />
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`size-12 rounded-2xl font-bold transition-all ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-dashed border-2 border-gray-200">
            <Search className="size-12 mx-auto text-gray-200 mb-4" />
            <h3 className="font-bold text-2xl text-gray-800">Nothing found</h3>
            <p className="text-gray-500">Try searching for something else!</p>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white max-w-lg w-full rounded-[3rem] shadow-2xl p-10 relative z-10"
            >
              <button
                onClick={closeModal}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="size-6 text-gray-400" />
              </button>

              <div className="bg-blue-600 size-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
                <Mail className="text-white size-8" />
              </div>

              <h3 className="text-3xl font-black text-gray-900 mb-2">Secure your spot</h3>
              <p className="text-gray-500 mb-8 text-lg">
                Enter your email to unlock tickets for <br/>
                <span className="font-bold text-blue-600 underline decoration-blue-100">
                  {selectedEvent.title}
                </span>
              </p>

              <div className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <label className="flex items-start gap-4 p-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1.5 size-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700">
                    I'm happy to receive updates about the coolest events in Sydney.
                  </span>
                </label>

                <button
                  disabled={!email.includes("@") || !consent || submitting}
                  onClick={submitLead}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 text-lg active:scale-95"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ExternalLink className="size-5" />
                  )}
                  {submitting ? "Processing..." : "Continue to Tickets"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING ADMIN ACCESS
      <Link
        to="/admin/login"
        className="fixed bottom-8 right-8 bg-gray-900 text-white px-8 py-5 rounded-full shadow-2xl hover:bg-blue-600 hover:scale-105 transition-all z-40 font-bold active:scale-95"
      >
        Admin Panel
      </Link> */}
    </div>
  );
}

export default Events;
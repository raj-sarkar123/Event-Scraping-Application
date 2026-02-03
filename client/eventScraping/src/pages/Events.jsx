import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { Search, MapPin, Calendar, ExternalLink, X, Mail, Loader2 } from "lucide-react";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/events")
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter events based on search term
  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.venue && event.venue.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [events, searchTerm]);

  const submitLead = async () => {
    setSubmitting(true);
    try {
      await api.post("/lead", {
        email,
        consent,
        eventId: selectedEvent._id
      });
      window.open(selectedEvent.eventUrl, "_blank");
      closeModal();
    } catch (err) {
      alert("Something went wrong. Please try again.");
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Sydney Events</h1>
        <p className="text-gray-500 mb-8">Discover the best happenings around the city.</p>

        {/* Search Feature */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input 
            type="text"
            placeholder="Search events or venues..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin size-10 text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {event.source || "Featured"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">{event.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="size-4 mr-2 text-gray-400" />
                      {event.venue || "Venue to be announced"}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="size-4 mr-2 text-gray-400" />
                      Every Weekend
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <button 
                    onClick={() => setSelectedEvent(event)}
                    className="w-full bg-gray-900 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group"
                  >
                    Get Tickets
                    <ExternalLink className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-lg font-medium">
            No events found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Lead Generation Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X className="size-5" />
            </button>
            
            <div className="p-8">
              <div className="bg-blue-50 size-12 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="text-blue-600 size-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Almost there!</h3>
              <p className="text-gray-500 mb-6">Enter your email to unlock tickets for <span className="text-gray-900 font-semibold">{selectedEvent.title}</span>.</p>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                  />
                  <span className="text-sm text-gray-500 leading-snug group-hover:text-gray-700 transition-colors">
                    I agree to receive updates about upcoming events in Sydney.
                  </span>
                </label>

                <button
                  disabled={!email.includes("@") || !consent || submitting}
                  onClick={submitLead}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin size-5" />}
                  {submitting ? "Processing..." : "Continue to Tickets"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
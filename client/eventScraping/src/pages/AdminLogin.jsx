import { LayoutDashboard, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans p-6 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] max-w-md w-full text-center border border-gray-100 relative z-10"
      >
        {/* Logo Section */}
        <div className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 rotate-3 transition-transform hover:rotate-0 duration-500">
          <Zap className="text-white size-10 fill-current" />
        </div>

        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <ShieldCheck className="size-3" /> Secure Access
        </div>

        <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
          Admin Portal
        </h2>

        <p className="text-gray-500 mb-10 text-lg leading-relaxed font-medium">
          Welcome back. Please authenticate with your corporate account to
          manage the Sydney Event pipeline.
        </p>

        {/* Login Button */}
        <div className="space-y-4">
          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
            className="block group"
          >
            <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-between shadow-xl shadow-gray-200 group-hover:shadow-gray-300 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="bg-white p-1.5 rounded-lg">
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    className="w-5 h-5"
                    alt="Google"
                  />
                </div>
                <span>Continue with Google</span>
              </div>
              <ArrowRight className="size-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </a>

          <p className="text-xs text-gray-400 font-medium pt-4">
            By signing in, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-gray-600">
              Terms of Service
            </span>
          </p>
        </div>
      </motion.div>

      {/* Footer Brand */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-20">
        <Zap className="size-4 fill-current" />
        <span className="font-black tracking-tighter text-sm uppercase">
          EventHub Terminal
        </span>
      </div>
    </div>
  );
}

export default AdminLogin;

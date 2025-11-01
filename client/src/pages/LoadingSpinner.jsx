import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LoadingSpinner = () => {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-emerald-400/10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
              scale: [0, Math.random() * 0.5 + 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
            }}
          />
        ))}
      </div>

      {/* Main spinner container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Primary spinner */}
        <motion.div
          className="
            w-16
            h-16
            border-4
            border-t-4
            border-t-emerald-400
            border-emerald-800
            rounded-full
            shadow-lg
            shadow-emerald-400/20
          "
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsating ring (delayed appearance) */}
        {showPulse && (
          <motion.div
            className="
              absolute
              w-20
              h-20
              border-2
              border-emerald-400/30
              rounded-full
            "
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: [0, 0.5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}

        {/* Loading text with fade animation */}
        <motion.p
          className="mt-6 text-emerald-100 font-medium tracking-wider"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
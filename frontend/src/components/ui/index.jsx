import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ children, className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]',
    secondary: 'bg-white/10 text-white border border-white/20 backdrop-blur-md',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      className={twMerge(
        'px-6 py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function GlassCard({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={twMerge(
        'bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// Interim holding screen. The full React product is under active build against
// the design spec; this keeps the deploy preview coherent in the meantime.
import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';

const Notch = (p) => (
  <svg className="notch" viewBox="0 0 45 22" fill="currentColor" {...p}>
    <path d="M3.0832 0 L0 10.2844 L35.01766 10.2844 L35.01767 22 L45 22 L45 0 Z" />
  </svg>
);

function App() {
  return (
    <motion.div className="hold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .5 }}>
      <div>
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .1 }}>
          <Notch />
        </motion.div>
        <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .2 }}>
          Day 1 Craft
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }}>
          Storyline in rebuild.
        </motion.p>
      </div>
    </motion.div>
  );
}
createRoot(document.getElementById('root')).render(<App />);

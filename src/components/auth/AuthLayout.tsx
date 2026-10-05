import { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-zeyna.png";

const svgVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "spring", duration: 2, bounce: 0 },
      opacity: { duration: 0.5 }
    }
  }
};

const ZLogoAnimation = () => {
  return (
    <div className="relative w-full max-w-[180px] md:max-w-sm mx-auto flex items-center justify-center aspect-square">
      {/* Lignes architecturales qui dessinent la structure */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full text-accent/30 hidden md:block"
        initial="hidden"
        animate="visible"
      >
        <motion.path
          d="M 20 20 L 180 20 L 180 180 L 20 180 Z M 20 60 L 180 60 M 60 20 L 60 180"
          fill="transparent"
          strokeWidth="1"
          stroke="currentColor"
          variants={svgVariants}
        />
        <motion.path
          d="M 20 180 L 180 20 M 20 20 L 180 180"
          fill="transparent"
          strokeWidth="0.5"
          stroke="currentColor"
          variants={svgVariants}
        />
      </motion.svg>

      {/* Révélation du logo ZEYNA après l'animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 bg-gradient-navy p-4 md:p-6 rounded-full border-0 md:border border-accent/20 hover:scale-105 transition-transform duration-300"
      >
        <Link to="/" className="block cursor-pointer">
          <img src={logo} alt="Zeyna" className="w-24 md:w-32 h-auto" />
        </Link>
      </motion.div>
    </div>
  );
};

export const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Panneau visuel abstrait (Gauche sur desktop, Haut sur mobile) */}
      <div className="w-full md:w-1/2 lg:w-5/12 bg-gradient-navy text-primary-foreground relative flex flex-col justify-center p-6 lg:p-12 border-b md:border-b-0 md:border-r border-accent/20 shrink-0">
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-accent transition-colors text-xs md:text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Retour</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center mt-6 md:mt-0">
          <ZLogoAnimation />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
            className="mt-4 md:mt-8 text-center hidden md:block"
          >
            <h2 className="font-serif text-xl md:text-2xl font-bold tracking-wide">L'Excellence du Logement</h2>
            <p className="text-primary-foreground/60 mt-2 max-w-sm mx-auto text-sm">
              Une plateforme moderne et sécurisée pour gérer et trouver vos espaces de vie.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Panneau de formulaire (Droite sur desktop, Bas sur mobile) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-background">
        <div className="w-full max-w-md relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

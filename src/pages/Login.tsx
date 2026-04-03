import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, signup, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (isSignup) {
      if (!email.endsWith("@elcdeparis.fr")) {
        toast.error("Seuls les emails @elcdeparis.fr sont autorisés.");
        setSubmitting(false);
        return;
      }
      const error = await signup(email, password, fullName);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Compte créé ! Un administrateur doit valider votre compte.");
      }
    } else {
      const error = await login(email, password);
      if (error) {
        toast.error(error);
      } else {
        navigate("/dashboard");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* SECTION GAUCHE : NOIR PREMIUM AVEC LOGO */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-white/5"
        style={{ backgroundColor: "#121212" }}>
        
        {/* Décoration subtile en arrière-plan */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#00C2B2]/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <img src="/Flow RH.png" alt="Flow RH Logo" className="w-12 h-auto" />
          <span className="font-heading font-bold text-2xl text-white tracking-tight">FLOWRH</span>
        </div>

        <div className="space-y-6 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="font-heading text-5xl font-bold text-white leading-tight">
            Gérez vos RH <br />
            <span className="text-[#00C2B2]">en toute fluidité.</span>
          </motion.h2>
          <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
            L'outil centralisé pour les congés, remboursements et la gestion des talents de l'ELC de Paris.
          </p>
        </div>

        <p className="text-gray-600 text-xs relative z-10">
          © 2026 FLOWRH — École des Langues et Cultures
        </p>
      </div>

      {/* SECTION DROITE : FORMULAIRE ÉPURÉ */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-full max-w-sm space-y-8"
        >
          {/* Logo visible uniquement sur Mobile */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <img src="/Flow RH.png" alt="Flow RH Logo" className="w-16 h-auto" />
            <h1 className="font-heading font-bold text-2xl text-white">FLOWRH</h1>
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-bold text-white">
              {isSignup ? "Créer un compte" : "Bon retour !"}
            </h1>
            <p className="text-sm text-gray-400">
              {isSignup ? "Inscription @elcdeparis.fr" : "Entrez vos identifiants pour continuer"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prénom Nom" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2B2]/50 transition-all" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.nom@elcdeparis.fr" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2B2]/50 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2B2]/50 transition-all" />
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00C2B2] text-white font-bold text-sm hover:bg-[#00a89a] transition-all shadow-lg shadow-[#00C2B2]/20 disabled:opacity-50">
              {submitting ? "Traitement..." : isSignup ? "Créer mon compte" : "Se connecter"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-sm text-center text-gray-400">
            {isSignup ? "Vous avez déjà un compte ?" : "Pas encore de membre ?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="text-[#00C2B2] font-bold hover:text-white transition-colors">
              {isSignup ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
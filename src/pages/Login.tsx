import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, ArrowRight, User } from "lucide-react";
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
        toast.success("Compte créé ! Un administrateur doit valider votre compte avant que vous puissiez accéder à l'application.");
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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "var(--gradient-sidebar)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary/20">
            <GraduationCap className="w-6 h-6 text-sidebar-primary" />
          </div>
          <span className="font-heading font-bold text-xl text-sidebar-primary-foreground">FLOWRH</span>
        </div>
        <div className="space-y-6">
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="font-heading text-4xl font-bold text-sidebar-primary-foreground leading-tight">
            Gérez vos ressources <br />humaines en toute <br />
            <span className="text-sidebar-primary">simplicité.</span>
          </motion.h2>
          <p className="text-sidebar-foreground max-w-sm text-sm leading-relaxed">
            Congés, remboursements, heures supplémentaires — tout au même endroit pour l'École des Langues et Cultures.
          </p>
        </div>
        <p className="text-sidebar-muted text-xs">© 2026 FLOWRH — École des Langues et Cultures</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">FLOWRH</span>
          </div>

          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {isSignup ? "Créer un compte" : "Connexion"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignup ? "Inscription réservée aux emails @elcdeparis.fr" : "Accédez à votre espace RH"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prénom Nom" required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSignup ? "prenom.nom@elcdeparis.fr" : "votre@email.com"} required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow" />
              </div>
              {isSignup && (
                <p className="text-xs text-muted-foreground">Uniquement les adresses @elcdeparis.fr</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow" />
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "Chargement..." : isSignup ? "Créer le compte" : "Se connecter"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            {isSignup ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
              {isSignup ? "Se connecter" : "Créer un compte"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

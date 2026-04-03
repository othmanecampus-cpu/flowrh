
-- Role enum
CREATE TYPE public.app_role AS ENUM ('professeur', 'admin_simple', 'admin_gestionnaire');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'professeur',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Leave balances
CREATE TABLE public.soldes_conges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total INTEGER NOT NULL DEFAULT 25,
  utilise INTEGER NOT NULL DEFAULT 0,
  restant INTEGER GENERATED ALWAYS AS (total - utilise) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.soldes_conges ENABLE ROW LEVEL SECURITY;

-- Enums
CREATE TYPE public.conge_type AS ENUM ('annuel', 'maladie', 'sans_solde', 'exceptionnel', 'maternite');
CREATE TYPE public.request_status AS ENUM ('en_attente', 'approuve', 'refuse');
CREATE TYPE public.priorite_type AS ENUM ('normale', 'urgente');

-- Leave requests
CREATE TABLE public.conges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conge_type conge_type NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  priorite priorite_type NOT NULL DEFAULT 'normale',
  telephone TEXT,
  justificatif_url TEXT,
  commentaire TEXT,
  status request_status NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conges ENABLE ROW LEVEL SECURITY;

-- Reimbursement requests
CREATE TABLE public.remboursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motif TEXT NOT NULL,
  montant NUMERIC(10,2) NOT NULL CHECK (montant > 0),
  date_depense DATE NOT NULL,
  justificatif_url TEXT,
  description TEXT,
  status request_status NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.remboursements ENABLE ROW LEVEL SECURITY;

-- Overtime requests
CREATE TABLE public.heures_supplementaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  heures NUMERIC(4,1) NOT NULL CHECK (heures > 0),
  motif TEXT NOT NULL,
  justificatif_url TEXT,
  commentaire TEXT,
  status request_status NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.heures_supplementaires ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_gestionnaire(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin_gestionnaire'
  )
$$;

-- RLS: Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can view all profiles" ON public.profiles FOR SELECT USING (public.is_gestionnaire(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: User roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can view all roles" ON public.user_roles FOR SELECT USING (public.is_gestionnaire(auth.uid()));
CREATE POLICY "Gestionnaires can manage roles" ON public.user_roles FOR ALL USING (public.is_gestionnaire(auth.uid()));

-- RLS: Soldes congés
CREATE POLICY "Users can view own balance" ON public.soldes_conges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can view all balances" ON public.soldes_conges FOR SELECT USING (public.is_gestionnaire(auth.uid()));
CREATE POLICY "Gestionnaires can update balances" ON public.soldes_conges FOR UPDATE USING (public.is_gestionnaire(auth.uid()));

-- RLS: Congés
CREATE POLICY "Users can view own leaves" ON public.conges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can view all leaves" ON public.conges FOR SELECT USING (public.is_gestionnaire(auth.uid()));
CREATE POLICY "Users can create own leaves" ON public.conges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can update leaves" ON public.conges FOR UPDATE USING (public.is_gestionnaire(auth.uid()));

-- RLS: Remboursements
CREATE POLICY "Users can view own reimbursements" ON public.remboursements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can view all reimbursements" ON public.remboursements FOR SELECT USING (public.is_gestionnaire(auth.uid()));
CREATE POLICY "Users can create own reimbursements" ON public.remboursements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can update reimbursements" ON public.remboursements FOR UPDATE USING (public.is_gestionnaire(auth.uid()));

-- RLS: Heures supplémentaires
CREATE POLICY "Users can view own overtime" ON public.heures_supplementaires FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can view all overtime" ON public.heures_supplementaires FOR SELECT USING (public.is_gestionnaire(auth.uid()));
CREATE POLICY "Users can create own overtime" ON public.heures_supplementaires FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Gestionnaires can update overtime" ON public.heures_supplementaires FOR UPDATE USING (public.is_gestionnaire(auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conges_updated_at BEFORE UPDATE ON public.conges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_remboursements_updated_at BEFORE UPDATE ON public.remboursements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_heures_sup_updated_at BEFORE UPDATE ON public.heures_supplementaires FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_soldes_updated_at BEFORE UPDATE ON public.soldes_conges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role + leave balance on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'professeur');

  INSERT INTO public.soldes_conges (user_id, total, utilise)
  VALUES (NEW.id, 25, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

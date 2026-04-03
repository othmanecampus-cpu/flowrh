
-- Add approved column to profiles (existing users approved by default)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true;

-- Gestionnaires can update profiles (for approval)
CREATE POLICY "Gestionnaires can update profiles"
ON public.profiles FOR UPDATE TO public
USING (is_gestionnaire(auth.uid()));

-- Users can update own pending reimbursements
CREATE POLICY "Users can update own pending reimbursements"
ON public.remboursements FOR UPDATE TO public
USING (auth.uid() = user_id AND status = 'en_attente')
WITH CHECK (auth.uid() = user_id);

-- Users can delete own pending reimbursements
CREATE POLICY "Users can delete own pending reimbursements"
ON public.remboursements FOR DELETE TO public
USING (auth.uid() = user_id AND status = 'en_attente');

-- Users can update own pending overtime
CREATE POLICY "Users can update own pending overtime"
ON public.heures_supplementaires FOR UPDATE TO public
USING (auth.uid() = user_id AND status = 'en_attente')
WITH CHECK (auth.uid() = user_id);

-- Users can delete own pending overtime
CREATE POLICY "Users can delete own pending overtime"
ON public.heures_supplementaires FOR DELETE TO public
USING (auth.uid() = user_id AND status = 'en_attente');

-- Create entretiens table
CREATE TABLE public.entretiens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  evaluator_id uuid NOT NULL,
  date_entretien date NOT NULL,
  performance_score integer,
  competences_score integer,
  feedback_manager text,
  status text NOT NULL DEFAULT 'planifie',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.entretiens ENABLE ROW LEVEL SECURITY;

-- Validation trigger for entretien scores
CREATE OR REPLACE FUNCTION public.validate_entretien_scores()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.performance_score IS NOT NULL AND (NEW.performance_score < 1 OR NEW.performance_score > 5) THEN
    RAISE EXCEPTION 'performance_score must be between 1 and 5';
  END IF;
  IF NEW.competences_score IS NOT NULL AND (NEW.competences_score < 1 OR NEW.competences_score > 5) THEN
    RAISE EXCEPTION 'competences_score must be between 1 and 5';
  END IF;
  IF NEW.status NOT IN ('planifie', 'termine') THEN
    RAISE EXCEPTION 'status must be planifie or termine';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_entretien_before_insert_update
  BEFORE INSERT OR UPDATE ON public.entretiens
  FOR EACH ROW EXECUTE FUNCTION validate_entretien_scores();

CREATE TRIGGER update_entretiens_updated_at
  BEFORE UPDATE ON public.entretiens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for entretiens
CREATE POLICY "Users can view own entretiens"
ON public.entretiens FOR SELECT TO public
USING (auth.uid() = user_id);

CREATE POLICY "Gestionnaires can manage all entretiens"
ON public.entretiens FOR ALL TO public
USING (is_gestionnaire(auth.uid()));

-- Update handle_new_user to use employe role and approved=false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, approved)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, false);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employe');

  INSERT INTO public.soldes_conges (user_id, total, utilise)
  VALUES (NEW.id, 25, 0);

  RETURN NEW;
END;
$$;

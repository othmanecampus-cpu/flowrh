
-- Add extended profile fields for employee management
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS prenom text,
ADD COLUMN IF NOT EXISTS date_naissance date,
ADD COLUMN IF NOT EXISTS adresse text,
ADD COLUMN IF NOT EXISTS numero_securite_sociale text,
ADD COLUMN IF NOT EXISTS contact_urgence text,
ADD COLUMN IF NOT EXISTS contact_urgence_tel text,
ADD COLUMN IF NOT EXISTS type_contrat text DEFAULT 'CDI',
ADD COLUMN IF NOT EXISTS temps_travail text DEFAULT '35h',
ADD COLUMN IF NOT EXISTS date_entree date,
ADD COLUMN IF NOT EXISTS date_sortie date,
ADD COLUMN IF NOT EXISTS poste text,
ADD COLUMN IF NOT EXISTS departement text,
ADD COLUMN IF NOT EXISTS statut_employe text DEFAULT 'actif',
ADD COLUMN IF NOT EXISTS numero_salarie text,
ADD COLUMN IF NOT EXISTS convention_collective text,
ADD COLUMN IF NOT EXISTS salaire numeric,
ADD COLUMN IF NOT EXISTS iban text;

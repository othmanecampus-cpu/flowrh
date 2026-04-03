CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, approved)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, true);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employe');

  INSERT INTO public.soldes_conges (user_id, total, utilise)
  VALUES (NEW.id, 25, 0);

  RETURN NEW;
END;
$$;
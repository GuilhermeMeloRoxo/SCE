--- Tabelas
CREATE TABLE public.tags (
  tag_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  cor text,
  CONSTRAINT tags_pkey PRIMARY KEY (tag_id)
);

CREATE TABLE public.perfis (
  id uuid NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  criado_em timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  github_user text UNIQUE,
  atualizado_em timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  username text NOT NULL UNIQUE,
  avatar_url text,
  CONSTRAINT perfis_pkey PRIMARY KEY (id),
  CONSTRAINT perfis_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.formacao (
  id uuid NOT NULL DEFAULT auth.uid(),
  curso text,
  termino text,
  CONSTRAINT formacao_pkey PRIMARY KEY (id),
  CONSTRAINT formacao_id_fkey FOREIGN KEY (id) REFERENCES public.perfis(id)
);

CREATE TABLE public.dados_privados (
  id uuid NOT NULL DEFAULT auth.uid(),
  email text NOT NULL UNIQUE,
  cpf bytea NOT NULL UNIQUE,
  telefone text,
  matricula_institucional text UNIQUE,
  github_token text,
  CONSTRAINT dados_privados_pkey PRIMARY KEY (id),
  CONSTRAINT dados_privados_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT dados_privados_id_fkey1 FOREIGN KEY (id) REFERENCES public.perfis(id)
);

CREATE TABLE public.posts (
  post_id uuid NOT NULL DEFAULT gen_random_uuid(),
  id uuid NOT NULL,
  conteudo text NOT NULL,
  quantidade_curtidas bigint NOT NULL DEFAULT '0'::bigint CHECK (quantidade_curtidas >= 0),
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  quantidade_comentarios bigint NOT NULL DEFAULT '0'::bigint CHECK (quantidade_comentarios >= 0),
  tag_id uuid,
  caminho_imagem text,
  CONSTRAINT posts_pkey PRIMARY KEY (post_id),
  CONSTRAINT posts_id_fkey FOREIGN KEY (id) REFERENCES public.perfis(id),
  CONSTRAINT posts_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(tag_id)
);

CREATE TABLE public.comentarios (
  comentario_id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  id uuid,
  conteudo text NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT comentarios_pkey PRIMARY KEY (comentario_id),
  CONSTRAINT comentarios_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(post_id),
  CONSTRAINT comentarios_id_fkey FOREIGN KEY (id) REFERENCES public.perfis(id)
);

CREATE TABLE public.curtidas (
  curtida_id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  id uuid,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT curtidas_pkey PRIMARY KEY (curtida_id),
  CONSTRAINT curtidas_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(post_id),
  CONSTRAINT curtidas_id_fkey FOREIGN KEY (id) REFERENCES public.perfis(id)
);

--- Funções

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.buscar_perfil_usuario(usuario_id uuid)
 RETURNS TABLE(id uuid, nome text, github_user text, username text, avatar_url text, matricula_institucional text, telefone text, email text, curso text, termino text, cpf_aberto text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  chave_secreta TEXT;
BEGIN
  SELECT decrypted_secret INTO chave_secreta 
  FROM vault.decrypted_secrets 
  WHERE name = 'chave_criptografia_cpf'
  LIMIT 1;

  IF chave_secreta IS NULL THEN
    RAISE EXCEPTION 'Chave secreta não encontrada no Vault.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id, 
    p.nome,      
    p.github_user, 
    p.username,
    p.avatar_url,
    d.matricula_institucional,
    d.telefone,
    d.email, 
    f.curso,
    f.termino,
    extensions.pgp_sym_decrypt(d.cpf, chave_secreta)::text
  FROM public.perfis p
  LEFT JOIN public.dados_privados d ON p.id = d.id
  LEFT JOIN public.formacao f ON p.id = f.id
  WHERE p.id = usuario_id;
END;$function$
;

CREATE OR REPLACE FUNCTION public.atualizar_contador_curtidas()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET quantidade_curtidas = quantidade_curtidas + 1 WHERE post_id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET quantidade_curtidas = quantidade_curtidas - 1 WHERE post_id = OLD.post_id;
  END IF;
  RETURN NULL;
END;$function$
;

CREATE OR REPLACE FUNCTION public.atualizar_contador_comentarios()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET quantidade_comentarios = quantidade_comentarios + 1 WHERE post_id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET quantidade_comentarios = quantidade_comentarios - 1 WHERE post_id = OLD.post_id;
  END IF;
  RETURN NULL;
END;$function$
;

CREATE OR REPLACE FUNCTION public.verificar_cpf_existente(cpf_teste text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  chave_secreta text;
  existe_cpf boolean;
begin
  select decrypted_secret into chave_secreta from vault.decrypted_secrets where name = 'chave_criptografia_cpf';
  
  select exists (
    select 1 from dados_privados 
    where cpf = pgp_sym_encrypt(cpf_teste, chave_secreta)
  ) into existe_cpf;
  
  return existe_cpf;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.criptografar_cpf()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  chave_secreta TEXT;
BEGIN
  IF (TG_OP = 'INSERT' OR NEW.cpf IS DISTINCT FROM OLD.cpf) AND NEW.cpf IS NOT NULL THEN
    
    SELECT decrypted_secret INTO chave_secreta
    FROM vault.decrypted_secrets 
    WHERE name = 'chave_criptografia_cpf' 
    LIMIT 1;

    IF chave_secreta IS NULL THEN
      RAISE EXCEPTION 'Chave secreta não encontrada no Vault.';
    END IF;

    NEW.cpf := extensions.pgp_sym_encrypt(
                 CONVERT_FROM(NEW.cpf, 'UTF8'), 
                 chave_secreta
               );
  END IF;
             
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.sincronizar_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.dados_privados
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public."buscar_perfil_usuarioOLD"(usuario_id uuid)
 RETURNS TABLE(id uuid, nome text, github_user text, username text, matricula_institucional text, telefone text, email text, curso text, termino text, cpf_aberto text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  chave_secreta TEXT;
BEGIN
  SELECT decrypted_secret INTO chave_secreta 
  FROM vault.decrypted_secrets 
  WHERE name = 'chave_criptografia_cpf'
  LIMIT 1;

  IF chave_secreta IS NULL THEN
    RAISE EXCEPTION 'Chave secreta não encontrada no Vault.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id, 
    p.nome,      
    p.github_user, 
    p.username,
    p.avatar_url,
    d.matricula_institucional,
    d.telefone,
    d.email, 
    f.curso,
    f.termino,
    extensions.pgp_sym_decrypt(d.cpf, chave_secreta)::text
  FROM public.perfis p
  LEFT JOIN public.dados_privados d ON p.id = d.id
  LEFT JOIN public.formacao f ON p.id = f.id
  WHERE p.id = usuario_id;
END;$function$
;

CREATE OR REPLACE FUNCTION public.automatizar_cadastro_usuario()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.perfis (id, username, nome)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', ''), 
    COALESCE(NEW.raw_user_meta_data->>'nome', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.dados_privados (id, email, cpf)
  VALUES (
    NEW.id, 
    NEW.email, 
    CONVERT_TO(COALESCE(NEW.raw_user_meta_data->>'cpf', ''), 'UTF8')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.formacao (id, curso, termino)
  VALUES (
    NEW.id,
    NULL,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.edicao_perfil_usuario(p_user_id uuid, p_username text DEFAULT NULL::text, p_nome text DEFAULT NULL::text, p_cpf text DEFAULT NULL::text, p_telefone text DEFAULT NULL::text, p_matricula_institucional text DEFAULT NULL::text, p_curso text DEFAULT NULL::text, p_termino text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.perfis (id, username, nome)
    VALUES (p_user_id, p_username, p_nome)
    ON CONFLICT (id) 
    DO UPDATE SET 
        username = COALESCE(NULLIF(p_username, ''), public.perfis.username),
        nome     = COALESCE(NULLIF(p_nome, ''), public.perfis.nome);

    INSERT INTO public.formacao (id, curso, termino)
    VALUES (p_user_id, p_curso, p_termino)
    ON CONFLICT (id)
    DO UPDATE SET
        curso   = COALESCE(NULLIF(p_curso, ''), public.formacao.curso),
        termino = COALESCE(NULLIF(p_termino, ''), public.formacao.termino);

    INSERT INTO public.dados_privados (id, telefone, matricula_institucional, email, cpf)
    VALUES (
        p_user_id, 
        p_telefone, 
        p_matricula_institucional,
        (SELECT email FROM auth.users WHERE id = p_user_id),
        CONVERT_TO(COALESCE(NULLIF(p_cpf, ''), ''), 'UTF8')
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
        telefone = COALESCE(NULLIF(p_telefone, ''), public.dados_privados.telefone),
        matricula_institucional = COALESCE(NULLIF(p_matricula_institucional, ''), public.dados_privados.matricula_institucional),
        cpf = CASE 
                WHEN p_cpf IS NOT NULL AND p_cpf <> '' 
                THEN CONVERT_TO(p_cpf, 'UTF8') 
                ELSE public.dados_privados.cpf 
              END;
END;
$function$
; 

--- Triggers

CREATE TRIGGER trigger_cadastro_completo AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION automatizar_cadastro_usuario();

CREATE TRIGGER antes_de_salvar_privado BEFORE INSERT OR UPDATE ON public.dados_privados FOR EACH ROW EXECUTE FUNCTION criptografar_cpf();

CREATE TRIGGER on_auth_user_email_updated AFTER UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION sincronizar_email();

CREATE TRIGGER trigger_contar_curtidas AFTER INSERT OR DELETE ON public.curtidas FOR EACH ROW EXECUTE FUNCTION atualizar_contador_curtidas();

CREATE TRIGGER trigger_contar_comentarios AFTER INSERT OR DELETE ON public.comentarios FOR EACH ROW EXECUTE FUNCTION atualizar_contador_comentarios();
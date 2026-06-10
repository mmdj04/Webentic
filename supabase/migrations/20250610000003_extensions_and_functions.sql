-- Enable pg_trgm extension for fuzzy text search on repo names/descriptions
create extension if not exists "pg_trgm"
    with schema "extensions";

-- Create an index on repository_analyses for faster text search
-- pg_trgm's gin_trgm_ops is resolved via the extensions schema in search_path
create index if not exists idx_repo_name_trgm
    on public.repository_analyses
    using gin (repo_name extensions.gin_trgm_ops);

create index if not exists idx_repo_owner_trgm
    on public.repository_analyses
    using gin (repo_owner extensions.gin_trgm_ops);

-- Full-text search function: searches completed analyses by repo name or owner
-- Usage: select * from search_repositories('react');
create or replace function public.search_repositories(search_term text)
returns setof public.repository_analyses
language sql
stable
as $$
    select *
    from public.repository_analyses
    where status = 'completed'
      and (
            repo_name ilike '%' || search_term || '%'
         or repo_owner ilike '%' || search_term || '%'
         or (analysis_data->>'description') ilike '%' || search_term || '%'
         or (analysis_data->>'topics') ilike '%' || search_term || '%'
      )
    order by
        case
            when repo_name ilike search_term || '%' then 0
            when repo_owner ilike search_term || '%' then 1
            when repo_name ilike '%' || search_term || '%' then 2
            else 3
        end,
        (analysis_data->>'stars')::int desc
    limit 50;
$$;

-- Count documented repos function
create or replace function public.count_documented_repos()
returns bigint
language sql
stable
as $$
    select count(*) from public.repository_analyses where status = 'completed';
$$;

-- Random featured repos function
create or replace function public.featured_repos(limit_count int default 6)
returns setof public.repository_analyses
language sql
stable
as $$
    select *
    from public.repository_analyses
    where status = 'completed'
    order by random()
    limit limit_count;
$$;

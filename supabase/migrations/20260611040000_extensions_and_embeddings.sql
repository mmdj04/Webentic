-- Enable pgvector extension for embedding storage and similarity search
create extension if not exists "vector"
    with schema "extensions";

-- Add embedding column to repository_analyses for future RAG features
alter table public.repository_analyses
    add column if not exists embedding extensions.vector(768);

-- Index for fast vector similarity search (cosine distance)
create index if not exists idx_repo_embedding
    on public.repository_analyses
    using hnsw (embedding extensions.vector_cosine_ops);

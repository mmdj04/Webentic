alter table "public"."agent_configs" add column "processing_state" jsonb;

alter table "public"."agent_configs" alter column "status" drop default;

alter table "public"."agent_configs" alter column "status" set default 'stopped';

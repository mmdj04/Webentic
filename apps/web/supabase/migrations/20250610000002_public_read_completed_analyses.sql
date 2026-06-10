-- Allow anyone (including anonymous users) to view completed analyses
create policy "Anyone can view completed analyses"
on "public"."repository_analyses"
as permissive
for select
to public
using (status = 'completed');

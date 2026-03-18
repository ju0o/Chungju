alter table public_guestbooks enable row level security;
alter table public_moments enable row level security;
alter table generated_cards enable row level security;
alter table site_visit_stats enable row level security;

create policy "public read guestbooks"
on public_guestbooks for select
using (is_public = true and is_hidden = false and is_deleted = false);

create policy "service role manage guestbooks"
on public_guestbooks for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "public read moments"
on public_moments for select
using (is_public = true and is_hidden = false and is_deleted = false);

create policy "service role manage moments"
on public_moments for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manage cards"
on generated_cards for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manage stats"
on site_visit_stats for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

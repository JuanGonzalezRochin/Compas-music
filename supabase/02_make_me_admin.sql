-- Run this AFTER you create your own account on the website (entrar.html).
-- It makes you the admin, so you can turn other accounts into teachers from the dashboard.
update public.profiles set role = 'admin' where email = 'gonz.roch@gmail.com';

-- Check:
select full_name, email, role from public.profiles order by created_at;

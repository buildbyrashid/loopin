-- Run this after the user has signed up and after schema.sql has been applied.
-- Replace the email only if you want a different administrator account.
update public.profiles
set role = 'admin'
where email = 'mhdrashid142@gmail.com';

-- Verify the promotion:
select id, email, role, created_at
from public.profiles
where email = 'mhdrashid142@gmail.com';

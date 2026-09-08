-- Example seed used during first build: creates the September batch and
-- enrolls the students whose names appear on the A1_SEP_01 sheet (Evening).
insert into public.batches (batch_name, level, start_month, start_year, seq, is_dual_slot)
values ('A1_SEP_01','A1',9,2026,1,true)
on conflict (batch_name) do nothing;

insert into public.batch_enrollments (batch_name, roll_number, slot)
select 'A1_SEP_01', roll_number, 'Evening'
from public.approved_students
where lower(trim(name)) in ('supriya pramanik','jagdish','kavita')
   or lower(trim(name)) like 'evans%vyas%'
   or lower(trim(name)) like '%bharat%verma%'
   or lower(trim(name)) like '%baisakhi%'
on conflict do nothing;

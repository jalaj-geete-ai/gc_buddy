-- Real batches + faculty loaded from CRM workbook "Post sales management - GC".
-- Enrollments (89) were loaded separately by matching each student's phone to the
-- Rollno sheet (-> GC Buddy roll_number), falling back to name match against
-- public.approved_students, with the CRM Enrollment Date as batch_enrollments.start_date.
-- All 8 batches start at level A1 in 2026; daily marking model (is_dual_slot=false).

insert into public.batches (batch_name, level, start_month, start_year, seq, is_dual_slot) values
 ('A1_MAR_01','A1',3,2026,1,false),('A1_APR_01','A1',4,2026,1,false),('A1_MAY_01','A1',5,2026,1,false),
 ('A1_JUN_01','A1',6,2026,1,false),('A1_JUN_02','A1',6,2026,2,false),('A1_JUN_03','A1',6,2026,3,false),
 ('A1_JUL_01','A1',7,2026,1,false),('A1_JUL_02','A1',7,2026,2,false)
on conflict (batch_name) do nothing;

insert into public.faculty (email, name) values
 ('himanshu.raj@testbook.com','Himanshu Raj'),('jahanavi@testbook.com','Jahanavi')
on conflict (email) do nothing;

insert into public.faculty_batches (faculty_id, batch_name)
select f.id, m.batch_name from public.faculty f
join (values
 ('himanshu.raj@testbook.com','A1_MAR_01'),('himanshu.raj@testbook.com','A1_APR_01'),('himanshu.raj@testbook.com','A1_MAY_01'),
 ('jahanavi@testbook.com','A1_JUN_01'),('jahanavi@testbook.com','A1_JUN_02'),('jahanavi@testbook.com','A1_JUN_03')
) m(email,batch_name) on m.email=f.email
on conflict do nothing;

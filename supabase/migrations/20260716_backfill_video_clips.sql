-- Backfill AI video clip allotment for users who already own OTO9 / OTO12
-- to the new baseline (OTO9 = 40, OTO12 = 80). greatest() ensures no one is reduced.

-- OTO12 (Infinity) owners → 80 clips
update public.profiles
set ai_video_credits = greatest(ai_video_credits, 80)
where 'oto12' = any(unlocked_otos);

-- OTO9 (Faceless Empire) owners → 40 clips
update public.profiles
set ai_video_credits = greatest(ai_video_credits, 40)
where 'oto9' = any(unlocked_otos);

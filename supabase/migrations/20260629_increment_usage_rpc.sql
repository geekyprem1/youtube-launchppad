CREATE OR REPLACE FUNCTION increment_daily_usage(p_user_id uuid, p_feature text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO usage_logs (user_id, feature, date, count)
  VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature, date)
  DO UPDATE SET count = usage_logs.count + 1;
END;
$$;

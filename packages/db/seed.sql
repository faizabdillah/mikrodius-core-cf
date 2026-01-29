-- Seed packages data (run this after creating tables)
INSERT INTO packages (name, max_nas, max_subscribers, max_devices, rate_limit, price_cents) VALUES
  ('starter', 3, 100, 150, 100, 200),
  ('basic', 10, 500, -1, 300, 800),
  ('pro', -1, 1500, -1, 500, 1500),
  ('business', -1, 3000, -1, 1000, 2500),
  ('enterprise', -1, 10000, -1, 5000, 5000);

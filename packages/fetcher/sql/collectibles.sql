CREATE TABLE IF NOT EXISTS collectibles (
  year TEXT NOT NULL,
  link TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  id TEXT NOT NULL,
  poap_event_id TEXT,
  fancy_id TEXT,
  name TEXT,
  image TEXT,
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  PRIMARY KEY (source, id)
); 
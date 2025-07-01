CREATE TABLE IF NOT EXISTS collectors (
  source TEXT NOT NULL,
  id TEXT NOT NULL,
  address TEXT NOT NULL,
  tokenId TEXT NOT NULL,
  PRIMARY KEY (source, id, address)
); 
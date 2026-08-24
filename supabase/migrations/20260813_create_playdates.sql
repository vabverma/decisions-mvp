CREATE TABLE IF NOT EXISTS playdates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requestee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_different_users CHECK (requester_id != requestee_id),
  CONSTRAINT check_valid_status CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled'))
);

ALTER TABLE playdates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their playdates" ON playdates
  FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = requestee_id);

CREATE POLICY "Users can create playdate requests" ON playdates
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can respond to playdate requests" ON playdates
  FOR UPDATE
  USING (auth.uid() = requestee_id)
  WITH CHECK (auth.uid() = requestee_id);

CREATE POLICY "Users can cancel their requests" ON playdates
  FOR UPDATE
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

CREATE INDEX IF NOT EXISTS idx_playdates_requester ON playdates(requester_id);
CREATE INDEX IF NOT EXISTS idx_playdates_requestee ON playdates(requestee_id);
CREATE INDEX IF NOT EXISTS idx_playdates_status ON playdates(status);
CREATE INDEX IF NOT EXISTS idx_playdates_scheduled_date ON playdates(scheduled_date);

-- Database schema for foods
CREATE TABLE IF NOT EXISTS foods (
    id TEXT PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    cuisine TEXT,
    moods TEXT, -- Comma-separated or JSON array of mood IDs
    regions TEXT, -- Comma-separated or JSON array of region codes
    is_vegetarian BOOLEAN DEFAULT 0,
    is_vegan BOOLEAN DEFAULT 0,
    is_gluten_free BOOLEAN DEFAULT 0,
    image_url TEXT,
    description_tr TEXT,
    description_en TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_foods_cuisine ON foods(cuisine);

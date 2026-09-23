-- Seed data for FR-01 Scenario Browser.
-- Run after 0002_scenarios.sql (and after 0001_init.sql/seed.sql).
-- Mirrors the exact example scenarios/categories from the Tech Requirement
-- doc (§1.1 Business Objective, §13 Filtering, §15 Recommended Scenarios).

-- =========================================================================
-- CATEGORIES
-- =========================================================================
insert into categories (id, name, slug, icon, display_order) values
  ('c0000000-0000-0000-0000-000000000001', 'Relationships', 'relationships', 'heart', 1),
  ('c0000000-0000-0000-0000-000000000002', 'Travel', 'travel', 'plane', 2),
  ('c0000000-0000-0000-0000-000000000003', 'Family', 'family', 'home', 3),
  ('c0000000-0000-0000-0000-000000000004', 'Work', 'work', 'briefcase', 4),
  ('c0000000-0000-0000-0000-000000000005', 'Everyday', 'everyday', 'sun', 5),
  ('c0000000-0000-0000-0000-000000000006', 'Culture', 'culture', 'globe', 6);

-- =========================================================================
-- PERSONAS (selected during onboarding; feed get_recommended_scenarios)
-- =========================================================================
insert into personas (id, slug, name, description) values
  ('p0000000-0000-0000-0000-000000000001', 'partner-is-indian', 'My partner is Indian', 'Learning Hindi to connect with a partner and their family'),
  ('p0000000-0000-0000-0000-000000000002', 'travel-to-india', 'Traveling to India', 'Learning Hindi for an upcoming trip'),
  ('p0000000-0000-0000-0000-000000000003', 'work-with-india', 'Working with Indian colleagues', 'Learning Hindi for office/work contexts'),
  ('p0000000-0000-0000-0000-000000000004', 'general-interest', 'General interest', 'Learning Hindi for culture and general enrichment');

-- =========================================================================
-- SCENARIOS + their current published version
-- (Thumbnails point at a placeholder CDN path; see README for how to swap
-- in real Supabase Storage URLs — same pattern as supabase/seed.sql.)
-- =========================================================================
do $$
declare
  v_scenario_id uuid;
  v_version_id uuid;
begin
  -- 1. Meeting Your Partner's Parents
  v_scenario_id := 's0000000-0000-0000-0000-000000000001';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'meeting-your-partners-parents', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Meeting Your Partner''s Parents',
    'Learn how to greet and talk to your partner''s parents.', 'BEGINNER', 8,
    'https://cdn.example.com/scn_meeting_partners_parents.jpg', false,
    array['Greet older people respectfully', 'Introduce yourself', 'Answer basic questions', 'Accept an offer of tea'],
    8, 12, 3, now() - interval '30 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000001'), (v_scenario_id, 'c0000000-0000-0000-0000-000000000003');
  insert into scenario_personas (scenario_id, persona_id, relevance) values (v_scenario_id, 'p0000000-0000-0000-0000-000000000001', 10);

  -- 2. Ordering Food
  v_scenario_id := 's0000000-0000-0000-0000-000000000002';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'ordering-food', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Ordering Food',
    'Learn how to order food naturally in Hindi.', 'BEGINNER', 6,
    'https://cdn.example.com/scn_ordering_food.jpg', false,
    array['Order a dish confidently', 'Ask for the bill', 'Ask about spice level', 'Say thank you'],
    6, 10, 2, now() - interval '28 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000002'), (v_scenario_id, 'c0000000-0000-0000-0000-000000000005');
  insert into scenario_personas (scenario_id, persona_id, relevance) values (v_scenario_id, 'p0000000-0000-0000-0000-000000000002', 8);

  -- 3. Talking to Grandparents
  v_scenario_id := 's0000000-0000-0000-0000-000000000003';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'talking-to-grandparents', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Talking to Grandparents',
    'Warm, respectful conversation starters for elders in the family.', 'ELEMENTARY', 7,
    'https://cdn.example.com/scn_grandparents.jpg', true,
    array['Use respectful pronouns', 'Ask about their day', 'Share a family update', 'Say goodbye warmly'],
    7, 11, 4, now() - interval '25 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000003');
  insert into scenario_personas (scenario_id, persona_id, relevance) values (v_scenario_id, 'p0000000-0000-0000-0000-000000000001', 6);

  -- 4. Taking an Auto-Rickshaw
  v_scenario_id := 's0000000-0000-0000-0000-000000000004';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'taking-an-auto-rickshaw', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Taking an Auto-Rickshaw',
    'Negotiate a fare and give directions to an auto-rickshaw driver.', 'BEGINNER', 5,
    'https://cdn.example.com/scn_auto_rickshaw.jpg', false,
    array['Ask if the driver is available', 'Negotiate or confirm a fare', 'Give a destination', 'Ask to stop'],
    5, 9, 2, now() - interval '20 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000002'), (v_scenario_id, 'c0000000-0000-0000-0000-000000000005');
  insert into scenario_personas (scenario_id, persona_id, relevance) values (v_scenario_id, 'p0000000-0000-0000-0000-000000000002', 9);

  -- 5. Introducing Yourself
  v_scenario_id := 's0000000-0000-0000-0000-000000000005';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'introducing-yourself', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Introducing Yourself',
    'The essential first-conversation phrases every beginner needs.', 'BEGINNER', 4,
    'https://cdn.example.com/scn_introducing_yourself.jpg', false,
    array['Say your name', 'Say where you''re from', 'Ask someone''s name', 'Exchange a friendly greeting'],
    4, 8, 1, now() - interval '35 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000005');
  insert into scenario_personas (scenario_id, persona_id, relevance) values
    (v_scenario_id, 'p0000000-0000-0000-0000-000000000004', 10),
    (v_scenario_id, 'p0000000-0000-0000-0000-000000000002', 5);

  -- 6. Office Small Talk
  v_scenario_id := 's0000000-0000-0000-0000-000000000006';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'office-small-talk', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Office Small Talk',
    'Casual, friendly conversation with Hindi-speaking colleagues.', 'INTERMEDIATE', 9,
    'https://cdn.example.com/scn_office_small_talk.jpg', true,
    array['Make weekend small talk', 'Talk about the weather', 'Offer to get chai', 'Wrap up a conversation politely'],
    9, 14, 2, now() - interval '15 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000004');
  insert into scenario_personas (scenario_id, persona_id, relevance) values (v_scenario_id, 'p0000000-0000-0000-0000-000000000003', 10);

  -- 7. Shopping
  v_scenario_id := 's0000000-0000-0000-0000-000000000007';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'shopping', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Shopping',
    'Ask for sizes, prices, and haggle politely at a local market.', 'ELEMENTARY', 7,
    'https://cdn.example.com/scn_shopping.jpg', false,
    array['Ask the price', 'Ask for a different size/color', 'Negotiate a discount', 'Complete the purchase'],
    7, 12, 3, now() - interval '18 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000002'), (v_scenario_id, 'c0000000-0000-0000-0000-000000000005');

  -- 8. Talking to a Doctor
  v_scenario_id := 's0000000-0000-0000-0000-000000000008';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'talking-to-a-doctor', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Talking to a Doctor',
    'Describe symptoms and understand basic medical advice.', 'UPPER_INTERMEDIATE', 10,
    'https://cdn.example.com/scn_doctor.jpg', true,
    array['Describe a symptom', 'Answer yes/no health questions', 'Understand simple instructions', 'Ask about medication'],
    10, 16, 2, now() - interval '10 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000005');

  -- 9. Attending an Indian Wedding
  v_scenario_id := 's0000000-0000-0000-0000-000000000009';
  insert into scenarios (id, slug, status) values (v_scenario_id, 'attending-an-indian-wedding', 'published');
  insert into scenario_versions (id, scenario_id, version_number, title, description, level, duration_minutes, thumbnail_url, is_premium, objectives, interaction_count, phrase_count, cultural_note_count, published_at)
  values (uuid_generate_v4(), v_scenario_id, 1, 'Attending an Indian Wedding',
    'Navigate greetings, blessings, and celebrations at a Hindi wedding.', 'ADVANCED', 12,
    'https://cdn.example.com/scn_indian_wedding.jpg', true,
    array['Offer congratulations', 'Understand ceremony vocabulary', 'Compliment the celebration', 'Take a respectful leave'],
    12, 20, 6, now() - interval '5 days')
  returning id into v_version_id;
  update scenarios set current_version_id = v_version_id where id = v_scenario_id;
  insert into scenario_categories (scenario_id, category_id) values (v_scenario_id, 'c0000000-0000-0000-0000-000000000001'), (v_scenario_id, 'c0000000-0000-0000-0000-000000000006');
  insert into scenario_personas (scenario_id, persona_id, relevance) values (v_scenario_id, 'p0000000-0000-0000-0000-000000000001', 9);
end $$;

-- Run after seed.sql and migrations/0003_vocabulary_lessons.sql.
-- Add words to each lesson through vocabulary_lesson_words as the curriculum grows.

insert into vocabulary_lessons (language, title, description, icon, order_index) values
  ('de', 'Greetings', 'Say hello, goodbye, and make a friendly first impression.', '👋', 1),
  ('de', 'People & Family', 'Talk about the people closest to you.', '👨‍👩‍👧', 2),
  ('de', 'Numbers & Time', 'Use numbers, days, and everyday time expressions.', '🕒', 3),
  ('de', 'Food & Drinks', 'Order and talk about food and drinks.', '☕', 4),
  ('de', 'Home', 'Name rooms, objects, and places around the home.', '🏠', 5),
  ('de', 'Getting Around', 'Navigate transport, directions, and stations.', '🚆', 6),
  ('de', 'At the Shops', 'Buy everyday items and ask about prices.', '🛍️', 7),
  ('de', 'Weather & Nature', 'Describe the weather and the world outside.', '🌦️', 8),
  ('de', 'Health', 'Handle appointments and basic health needs.', '🩺', 9),
  ('de', 'Daily Routine', 'Describe what you do throughout the day.', '🌅', 10),
  ('de', 'Work & Study', 'Use practical vocabulary for work and study.', '💼', 11),
  ('de', 'Feelings & Opinions', 'Express feelings, preferences, and opinions.', '💬', 12),
  ('de', 'Leisure & Hobbies', 'Talk about how you spend your free time.', '⚽', 13),
  ('de', 'Communication', 'Connect, ask questions, and keep a conversation going.', '💭', 14),
  ('de', 'Travel & Hotels', 'Manage common travel and accommodation situations.', '🧳', 15),
  ('de', 'City Life', 'Find your way around town and local services.', '🏙️', 16),
  ('de', 'Clothes & Shopping', 'Describe clothing, sizes, and purchases.', '👕', 17),
  ('de', 'Technology', 'Use essential words for devices and the internet.', '💻', 18),
  ('de', 'Plans & Invitations', 'Make plans and invite people to join you.', '📅', 19),
  ('de', 'Review & Real Life', 'Bring your new vocabulary into everyday conversations.', '🌟', 20)
on conflict (language, order_index) do update
  set title = excluded.title,
      description = excluded.description,
      icon = excluded.icon;

insert into vocabulary_lesson_words (lesson_id, vocabulary_id, order_index)
select lesson.id, word.id, assignments.order_index
from (
  values
    (4, 'Kaffee', 1), (4, 'Milch', 2), (4, 'Brot', 3),
    (6, 'Gleis', 1), (9, 'Termin', 1), (11, 'Unternehmenskultur', 1),
    (12, 'Meinung', 1), (16, 'nebenan', 1), (16, 'Miete', 2),
    (20, 'Anzahlung', 1)
) as assignments(lesson_order, word_value, order_index)
join vocabulary_lessons lesson
  on lesson.language = 'de' and lesson.order_index = assignments.lesson_order
join vocabulary word
  on word.language = 'de' and word.word = assignments.word_value
on conflict (lesson_id, vocabulary_id) do update
  set order_index = excluded.order_index;

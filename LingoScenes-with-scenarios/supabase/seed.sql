-- LingoScenes seed data — ORIGINAL sample content for a German course.
-- Audio/video URLs point at placeholder paths in a `media` Supabase Storage
-- bucket (public). Replace them with real uploaded files at those paths, or
-- swap in URLs from a TTS provider — see README "Adding your own content".
--
-- Run after 0001_init.sql: `supabase db execute -f supabase/seed.sql`
-- or paste into the Supabase SQL editor.

-- =========================================================================
-- COURSES
-- =========================================================================
insert into courses (id, name, language, description, level) values
  ('c0000000-0000-0000-0000-000000000001', 'German Starter Path', 'de', 'Everyday scenes for absolute beginners.', 'beginner'),
  ('c0000000-0000-0000-0000-000000000002', 'German Everyday Life', 'de', 'Conversations for getting around daily life.', 'intermediate'),
  ('c0000000-0000-0000-0000-000000000003', 'German in Depth', 'de', 'Nuanced, longer-form dialogues for confident speakers.', 'advanced');

-- =========================================================================
-- STORIES (10 total: 5 beginner, 3 intermediate, 2 advanced)
-- =========================================================================
insert into stories (id, course_id, title, description, difficulty, topic, thumbnail_url, duration_minutes, order_index) values
  ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Coffee at the Corner Café', 'Order a coffee and make small talk with the barista.', 'beginner', 'food', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/cafe.jpg', 4, 1),
  ('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Meeting a New Neighbor', 'Introduce yourself to someone who just moved in.', 'beginner', 'social', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/neighbor.jpg', 4, 2),
  ('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Finding the Train Platform', 'Ask for directions at a busy train station.', 'beginner', 'travel', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/train.jpg', 5, 3),
  ('50000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Grocery Shopping Basics', 'Buy fruit, bread, and cheese at the market.', 'beginner', 'food', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/market.jpg', 5, 4),
  ('50000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'A Rainy Day Plan', 'Two friends decide what to do when it starts raining.', 'beginner', 'social', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/rain.jpg', 4, 5),
  ('50000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'Booking a Doctor''s Appointment', 'Call a clinic to schedule a check-up.', 'intermediate', 'health', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/doctor.jpg', 6, 1),
  ('50000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 'Apartment Hunting', 'Discuss a flat viewing with a landlord.', 'intermediate', 'housing', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/apartment.jpg', 7, 2),
  ('50000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 'A Job Interview', 'Answer common interview questions with confidence.', 'intermediate', 'work', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/interview.jpg', 7, 3),
  ('50000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'A Disagreement at Dinner', 'Two old friends debate politics over dinner.', 'advanced', 'social', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/dinner.jpg', 8, 1),
  ('50000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', 'Negotiating a Contract', 'A freelancer negotiates project terms with a client.', 'advanced', 'work', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/thumbnails/contract.jpg', 9, 2);

-- =========================================================================
-- STORY SCENES (3 scenes for the first story shown in full detail;
-- remaining stories get 2-3 lighter scenes each to keep seed data manageable)
-- =========================================================================

-- Story 1: Coffee at the Corner Café
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0001-000000000001', '50000000-0000-0000-0000-000000000001', 1, 'Barista', 'Guten Morgen! Was möchten Sie trinken?', 'Good morning! What would you like to drink?', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/cafe_1.mp3'),
  ('a0000000-0000-0000-0001-000000000002', '50000000-0000-0000-0000-000000000001', 2, 'Anna', 'Ich hätte gern einen Kaffee mit Milch, bitte.', 'I would like a coffee with milk, please.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/cafe_2.mp3'),
  ('a0000000-0000-0000-0001-000000000003', '50000000-0000-0000-0000-000000000001', 3, 'Barista', 'Kommt sofort! Das macht drei Euro fünfzig.', 'Coming right up! That will be three euros fifty.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/cafe_3.mp3');

-- Story 2: Meeting a New Neighbor
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0002-000000000001', '50000000-0000-0000-0000-000000000002', 1, 'Tom', 'Hallo! Ich bin Tom. Ich wohne nebenan.', 'Hello! I''m Tom. I live next door.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/neighbor_1.mp3'),
  ('a0000000-0000-0000-0002-000000000002', '50000000-0000-0000-0000-000000000002', 2, 'Lena', 'Schön, dich kennenzulernen! Ich heiße Lena.', 'Nice to meet you! My name is Lena.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/neighbor_2.mp3');

-- Story 3: Finding the Train Platform
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0003-000000000001', '50000000-0000-0000-0000-000000000003', 1, 'Reisender', 'Entschuldigung, wo ist Gleis fünf?', 'Excuse me, where is platform five?', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/train_1.mp3'),
  ('a0000000-0000-0000-0003-000000000002', '50000000-0000-0000-0000-000000000003', 2, 'Angestellte', 'Gehen Sie geradeaus und dann links.', 'Go straight ahead and then left.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/train_2.mp3');

-- Story 4: Grocery Shopping Basics
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0004-000000000001', '50000000-0000-0000-0000-000000000004', 1, 'Verkäufer', 'Guten Tag! Brauchen Sie Hilfe?', 'Good day! Do you need help?', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/market_1.mp3'),
  ('a0000000-0000-0000-0004-000000000002', '50000000-0000-0000-0000-000000000004', 2, 'Kunde', 'Ja, ich suche frisches Brot und Käse.', 'Yes, I''m looking for fresh bread and cheese.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/market_2.mp3');

-- Story 5: A Rainy Day Plan
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0005-000000000001', '50000000-0000-0000-0000-000000000005', 1, 'Mia', 'Es regnet! Was machen wir jetzt?', 'It''s raining! What do we do now?', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/rain_1.mp3'),
  ('a0000000-0000-0000-0005-000000000002', '50000000-0000-0000-0000-000000000005', 2, 'Jonas', 'Lass uns einen Film zu Hause schauen.', 'Let''s watch a movie at home.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/rain_2.mp3');

-- Story 6: Booking a Doctor's Appointment
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0006-000000000001', '50000000-0000-0000-0000-000000000006', 1, 'Empfang', 'Praxis Dr. Weber, wie kann ich helfen?', 'Dr. Weber''s office, how can I help?', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/doctor_1.mp3'),
  ('a0000000-0000-0000-0006-000000000002', '50000000-0000-0000-0000-000000000006', 2, 'Patient', 'Ich möchte einen Termin vereinbaren.', 'I would like to schedule an appointment.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/doctor_2.mp3');

-- Story 7: Apartment Hunting
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0007-000000000001', '50000000-0000-0000-0000-000000000007', 1, 'Vermieter', 'Die Wohnung hat zwei Zimmer und einen Balkon.', 'The apartment has two rooms and a balcony.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/apartment_1.mp3'),
  ('a0000000-0000-0000-0007-000000000002', '50000000-0000-0000-0000-000000000007', 2, 'Mieterin', 'Wie hoch ist die Miete pro Monat?', 'How much is the rent per month?', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/apartment_2.mp3');

-- Story 8: A Job Interview
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0008-000000000001', '50000000-0000-0000-0000-000000000008', 1, 'Personaler', 'Warum möchten Sie bei uns arbeiten?', 'Why do you want to work with us?', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/interview_1.mp3'),
  ('a0000000-0000-0000-0008-000000000002', '50000000-0000-0000-0000-000000000008', 2, 'Bewerberin', 'Ich schätze die Unternehmenskultur sehr.', 'I value the company culture a lot.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/interview_2.mp3');

-- Story 9: A Disagreement at Dinner
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0009-000000000001', '50000000-0000-0000-0000-000000000009', 1, 'Karl', 'Ich bin anderer Meinung als du.', 'I have a different opinion than you.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/dinner_1.mp3'),
  ('a0000000-0000-0000-0009-000000000002', '50000000-0000-0000-0000-000000000009', 2, 'Petra', 'Lass es uns in Ruhe diskutieren.', 'Let''s discuss it calmly.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/dinner_2.mp3');

-- Story 10: Negotiating a Contract
insert into story_scenes (id, story_id, order_index, character, dialogue, translation, audio_url) values
  ('a0000000-0000-0000-0010-000000000001', '50000000-0000-0000-0000-000000000010', 1, 'Klient', 'Können wir über die Bedingungen sprechen?', 'Can we talk about the terms?', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/contract_1.mp3'),
  ('a0000000-0000-0000-0010-000000000002', '50000000-0000-0000-0000-000000000010', 2, 'Freelancer', 'Natürlich, ich schlage eine Anzahlung vor.', 'Of course, I suggest a deposit.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/contract_2.mp3');

-- =========================================================================
-- VOCABULARY (a bank of words used across the above scenes)
-- =========================================================================
insert into vocabulary (id, word, translation, pronunciation, part_of_speech, example_sentence, audio_url, language) values
  ('b0000000-0000-0000-0000-000000000001', 'Kaffee', 'coffee', 'KAH-fay', 'noun', 'Ich trinke gern Kaffee am Morgen.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_kaffee.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000002', 'Milch', 'milk', 'milkh', 'noun', 'Die Milch ist im Kühlschrank.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_milch.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000003', 'nebenan', 'next door', 'NAY-ben-an', 'adverb', 'Meine Freundin wohnt nebenan.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_nebenan.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000004', 'Gleis', 'platform (train)', 'glyce', 'noun', 'Der Zug fährt von Gleis drei ab.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_gleis.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000005', 'Brot', 'bread', 'broht', 'noun', 'Ich kaufe frisches Brot jeden Tag.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_brot.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000006', 'Termin', 'appointment', 'ter-MEEN', 'noun', 'Ich habe morgen einen Termin.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_termin.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000007', 'Miete', 'rent', 'MEE-teh', 'noun', 'Die Miete ist diesen Monat gestiegen.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_miete.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000008', 'Unternehmenskultur', 'company culture', 'oon-ter-NAY-mens-kool-toor', 'noun', 'Die Unternehmenskultur gefällt mir gut.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_kultur.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000009', 'Meinung', 'opinion', 'MY-noong', 'noun', 'Das ist nur meine Meinung.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_meinung.mp3', 'de'),
  ('b0000000-0000-0000-0000-000000000010', 'Anzahlung', 'deposit', 'AHN-tsah-loong', 'noun', 'Ich zahle eine Anzahlung von zehn Prozent.', 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/word_anzahlung.mp3', 'de');

-- =========================================================================
-- EXERCISES (mixed types, tied to stories/scenes)
-- =========================================================================

-- Story 1 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0001-000000000001', 'multiple_choice', 'What does "Guten Morgen" mean?', 'Good morning', array['Good morning','Good night','Good afternoon','Goodbye'], '"Morgen" means morning in German.', null, 1),
  ('50000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0001-000000000002', 'fill_blank', 'Ich hätte gern einen ___ mit Milch.', 'Kaffee', null, '"Kaffee" is the German word for coffee.', null, 2),
  ('50000000-0000-0000-0000-000000000001', null, 'word_order', 'Build the sentence: "That will be three euros fifty."', 'Das macht drei Euro fünfzig', array['Das','macht','drei','Euro','fünfzig'], null, null, 3),
  ('50000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0001-000000000002', 'listening', 'Listen and select what Anna orders.', 'Kaffee mit Milch', array['Kaffee mit Milch','Tee mit Zucker','Kaffee schwarz','Heiße Schokolade'], null, 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/media/audio/cafe_2.mp3', 4);

-- Story 2 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000002', null, 'vocabulary', 'What does "nebenan" mean?', 'next door', array['next door','far away','upstairs','downtown'], null, null, 1),
  ('50000000-0000-0000-0000-000000000002', null, 'translation', 'Translate: "Nice to meet you!"', 'Schön, dich kennenzulernen', null, 'This is a common informal greeting when meeting someone new.', null, 2);

-- Story 3 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000003', null, 'multiple_choice', 'What does "Gleis" mean?', 'Platform', array['Platform','Ticket','Train','Station'], null, null, 1),
  ('50000000-0000-0000-0000-000000000003', null, 'fill_blank', 'Entschuldigung, wo ist ___ fünf?', 'Gleis', null, null, null, 2);

-- Story 4 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000004', null, 'vocabulary', 'What does "Brot" mean?', 'bread', array['bread','cheese','butter','milk'], null, null, 1),
  ('50000000-0000-0000-0000-000000000004', null, 'word_order', 'Build: "I''m looking for fresh bread and cheese."', 'Ich suche frisches Brot und Käse', array['Ich','suche','frisches','Brot','und','Käse'], null, null, 2);

-- Story 5 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000005', null, 'translation', 'Translate: "It''s raining!"', 'Es regnet', null, null, null, 1);

-- Story 6 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000006', null, 'vocabulary', 'What does "Termin" mean?', 'appointment', array['appointment','doctor','medicine','waiting room'], null, null, 1),
  ('50000000-0000-0000-0000-000000000006', null, 'fill_blank', 'Ich möchte einen ___ vereinbaren.', 'Termin', null, null, null, 2);

-- Story 7 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000007', null, 'vocabulary', 'What does "Miete" mean?', 'rent', array['rent','apartment','balcony','landlord'], null, null, 1),
  ('50000000-0000-0000-0000-000000000007', null, 'translation', 'Translate: "How much is the rent per month?"', 'Wie hoch ist die Miete pro Monat', null, null, null, 2);

-- Story 8 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000008', null, 'multiple_choice', 'What does "Unternehmenskultur" mean?', 'Company culture', array['Company culture','Job interview','Salary','Office building'], null, null, 1);

-- Story 9 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000009', null, 'vocabulary', 'What does "Meinung" mean?', 'opinion', array['opinion','fact','argument','question'], null, null, 1),
  ('50000000-0000-0000-0000-000000000009', null, 'translation', 'Translate: "Let''s discuss it calmly."', 'Lass es uns in Ruhe diskutieren', null, null, null, 2);

-- Story 10 exercises
insert into exercises (story_id, scene_id, type, question, answer, options, explanation, audio_url, order_index) values
  ('50000000-0000-0000-0000-000000000010', null, 'vocabulary', 'What does "Anzahlung" mean?', 'deposit', array['deposit','invoice','contract','refund'], null, null, 1),
  ('50000000-0000-0000-0000-000000000010', null, 'word_order', 'Build: "Of course, I suggest a deposit."', 'Natürlich ich schlage eine Anzahlung vor', array['Natürlich','ich','schlage','eine','Anzahlung','vor'], null, null, 2);

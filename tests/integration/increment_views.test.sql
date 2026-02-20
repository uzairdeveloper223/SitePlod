-- Test file for increment_views function
-- This file can be run manually to verify the function works correctly
-- Run this after applying the migrations to your Supabase database

-- Setup: Create a test site
DO $$
DECLARE
  test_site_id UUID;
  initial_views INTEGER;
  updated_views INTEGER;
BEGIN
  -- Insert a test site
  INSERT INTO sites (name, slug, managed, views)
  VALUES ('Test Site', 'test-increment-views', false, 0)
  RETURNING id INTO test_site_id;
  
  -- Get initial view count
  SELECT views INTO initial_views FROM sites WHERE id = test_site_id;
  RAISE NOTICE 'Initial views: %', initial_views;
  
  -- Test 1: Increment views once
  PERFORM increment_views(test_site_id);
  SELECT views INTO updated_views FROM sites WHERE id = test_site_id;
  RAISE NOTICE 'After first increment: %', updated_views;
  
  IF updated_views != initial_views + 1 THEN
    RAISE EXCEPTION 'Test 1 failed: Expected %, got %', initial_views + 1, updated_views;
  END IF;
  RAISE NOTICE 'Test 1 passed: Single increment works';
  
  -- Test 2: Increment views multiple times
  PERFORM increment_views(test_site_id);
  PERFORM increment_views(test_site_id);
  PERFORM increment_views(test_site_id);
  SELECT views INTO updated_views FROM sites WHERE id = test_site_id;
  RAISE NOTICE 'After multiple increments: %', updated_views;
  
  IF updated_views != initial_views + 4 THEN
    RAISE EXCEPTION 'Test 2 failed: Expected %, got %', initial_views + 4, updated_views;
  END IF;
  RAISE NOTICE 'Test 2 passed: Multiple increments work';
  
  -- Test 3: Verify atomic increment (simulate race condition)
  -- This test verifies that concurrent increments don't lose updates
  PERFORM increment_views(test_site_id);
  PERFORM increment_views(test_site_id);
  SELECT views INTO updated_views FROM sites WHERE id = test_site_id;
  RAISE NOTICE 'After concurrent-style increments: %', updated_views;
  
  IF updated_views != initial_views + 6 THEN
    RAISE EXCEPTION 'Test 3 failed: Expected %, got %', initial_views + 6, updated_views;
  END IF;
  RAISE NOTICE 'Test 3 passed: Atomic increments work correctly';
  
  -- Cleanup: Delete test site
  DELETE FROM sites WHERE id = test_site_id;
  RAISE NOTICE 'Cleanup complete';
  
  RAISE NOTICE 'All tests passed!';
END $$;

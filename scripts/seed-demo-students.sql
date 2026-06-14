-- Seed script: ensure M. Aldridge is a Gryffindor student in the demo DB.
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New Query).
-- Safe to re-run — all operations are idempotent.

DO $$
DECLARE
  v_user_id        uuid;
  v_role_id        uuid;
  v_house_id       uuid;
BEGIN
  -- 1. Resolve Gryffindor house
  SELECT id INTO v_house_id FROM houses WHERE name = 'Gryffindor';
  IF v_house_id IS NULL THEN
    RAISE EXCEPTION 'Gryffindor house not found — run the main seed first';
  END IF;

  -- 2. Resolve (or create) the Student role
  SELECT id INTO v_role_id FROM roles WHERE name ILIKE 'student' LIMIT 1;
  IF v_role_id IS NULL THEN
    INSERT INTO roles (name, point_limit)
    VALUES ('Student', NULL)
    RETURNING id INTO v_role_id;
    RAISE NOTICE 'Created Student role with id %', v_role_id;
  END IF;

  -- 3. Find or create M. Aldridge in users
  SELECT id INTO v_user_id FROM users WHERE full_name = 'M. Aldridge' LIMIT 1;
  IF v_user_id IS NULL THEN
    INSERT INTO users (full_name, email, house_id)
    VALUES ('M. Aldridge', 'aldridge@hogwarts.edu', v_house_id)
    RETURNING id INTO v_user_id;
    RAISE NOTICE 'Created user M. Aldridge with id %', v_user_id;
  ELSE
    -- Ensure they are in Gryffindor
    UPDATE users SET house_id = v_house_id WHERE id = v_user_id;
    RAISE NOTICE 'Found existing user M. Aldridge (%)', v_user_id;
  END IF;

  -- 4. Grant Student role if not already active
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = v_user_id
      AND role_id = v_role_id
      AND removed_at IS NULL
  ) THEN
    INSERT INTO user_roles (user_id, role_id, assigned_at, created_at, updated_at)
    VALUES (v_user_id, v_role_id, now(), now(), now());
    RAISE NOTICE 'Assigned Student role to M. Aldridge';
  ELSE
    RAISE NOTICE 'M. Aldridge already has Student role — nothing to do';
  END IF;
END $$;

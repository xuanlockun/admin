UPDATE deployments
SET status = CASE
  WHEN status IN ('success', 'built') THEN 'success'
  WHEN status IN ('failed', 'errored', 'error') THEN 'failed'
  ELSE 'pending'
END;

UPDATE posts
SET deploy_status = CASE
  WHEN deploy_status IN ('success', 'built') THEN 'success'
  WHEN deploy_status IN ('failed', 'errored', 'error') THEN 'failed'
  WHEN deploy_status IS NULL THEN NULL
  ELSE 'pending'
END;

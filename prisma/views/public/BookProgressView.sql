SELECT bp.book_id, bp.progress, bp.device, bp.sync_date
FROM (
  SELECT *,
        ROW_NUMBER() OVER (PARTITION BY book_id ORDER BY sync_date DESC, progress DESC) AS rn
  FROM book_progress
) bp
WHERE bp.rn = 1;`

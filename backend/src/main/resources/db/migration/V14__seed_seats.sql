INSERT INTO seats (room_id, row, number, status)
SELECT
    r.id,
    chr(64 + f.row_num),
    n.number,
    'ACTIVE'
FROM rooms r
CROSS JOIN generate_series(1, 10) AS f(row_num)
CROSS JOIN LATERAL generate_series(1,CASE WHEN f.row_num = 10 THEN 16 ELSE 12 END) AS n(number);

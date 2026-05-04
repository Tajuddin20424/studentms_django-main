import sqlite3
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
for table in ['classes', 'students', 'subjects', 'student_subject', 'teachers', 'department', 'designation']:
    print('TABLE', table)
    try:
        print(list(cur.execute(f"PRAGMA table_info('{table}');")))
    except Exception as e:
        print('ERROR', e)
    print('-' * 60)
conn.close()

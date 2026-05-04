import sqlite3
import os
path = 'db.sqlite3'
print('db exists', os.path.exists(path))
if os.path.exists(path):
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print('tables:', cur.fetchall())
    try:
        cur.execute('SELECT count(*) FROM students')
        print('students count', cur.fetchone()[0])
    except Exception as e:
        print('students error', repr(e))
    conn.close()

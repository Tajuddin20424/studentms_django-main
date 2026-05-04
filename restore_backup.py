import sqlite3
import os
import re
import shutil

DB_PATH = 'db.sqlite3'
SQL_DUMP = 'student_management_django_new.sql'
BACKUP_DB = 'db.sqlite3.bak'

if not os.path.exists(DB_PATH):
    raise SystemExit('SQLite database file not found: ' + DB_PATH)
if not os.path.exists(SQL_DUMP):
    raise SystemExit('SQL dump not found: ' + SQL_DUMP)

print('Backing up current database to', BACKUP_DB)
shutil.copy2(DB_PATH, BACKUP_DB)

with open(SQL_DUMP, 'r', encoding='utf-8', errors='ignore') as f:
    data = f.read()

# Remove MySQL-specific statements and comments.
clean = []
for line in data.splitlines():
    line = line.strip()
    if not line or line.startswith('--'):
        continue
    if line.startswith('SET ') or line.startswith('START TRANSACTION') or line.startswith('COMMIT'):
        continue
    if line.startswith('LOCK TABLES') or line.startswith('UNLOCK TABLES'):
        continue
    if line.startswith('/*!') and line.endswith('*/;'):
        continue
    clean.append(line)
clean_sql = '\n'.join(clean)

# Normalize backticks and remove MySQL engine/charset clauses from CREATE TABLE
clean_sql = clean_sql.replace('`', '"')
clean_sql = re.sub(r'\) ENGINE=.*?;', ') ;', clean_sql, flags=re.S)
clean_sql = re.sub(r'unsigned', '', clean_sql, flags=re.IGNORECASE)
clean_sql = re.sub(r'\bAUTO_INCREMENT\b', '', clean_sql, flags=re.IGNORECASE)
clean_sql = re.sub(r'\bDEFAULT CHARSET=[^\s;]+', '', clean_sql, flags=re.IGNORECASE)
clean_sql = re.sub(r'COLLATE=[^\s;]+', '', clean_sql, flags=re.IGNORECASE)

def split_sql_statements(sql_text):
    statements = []
    stmt = ''
    in_string = False
    i = 0
    while i < len(sql_text):
        ch = sql_text[i]
        if ch == "'":
            stmt += ch
            if in_string and i + 1 < len(sql_text) and sql_text[i + 1] == "'":
                stmt += "'"
                i += 1
            else:
                in_string = not in_string
        elif ch == ';' and not in_string:
            stmt += ch
            cleaned = stmt.strip()
            if cleaned:
                statements.append(cleaned)
            stmt = ''
        else:
            stmt += ch
        i += 1
    if stmt.strip():
        statements.append(stmt.strip())
    return statements

# Extract INSERT statements only.
statements = split_sql_statements(clean_sql)
inserts = [s for s in statements if s.strip().upper().startswith('INSERT INTO')]
print('Found', len(inserts), 'INSERT statements.')

TABLE_NAME_MAP = {
    'designations': 'designation',
}

STATUS_MAPPING = {
    "'Active'": '1',
    "'Inactive'": '0',
}

def split_value_tuples(values_text):
    tuples = []
    depth = 0
    in_string = False
    start = None
    for i, ch in enumerate(values_text):
        if ch == "'":
            in_string = not in_string
        if not in_string:
            if ch == '(':
                if depth == 0:
                    start = i
                depth += 1
            elif ch == ')':
                depth -= 1
                if depth == 0 and start is not None:
                    tuples.append(values_text[start:i + 1])
    return tuples


def split_tuple_values(tuple_text):
    text = tuple_text.strip()
    if text.startswith('(') and text.endswith(')'):
        text = text[1:-1]
    values = []
    current = ''
    in_string = False
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == "'":
            current += ch
            i += 1
            while i < len(text):
                current += text[i]
                if text[i] == "'":
                    if i + 1 < len(text) and text[i + 1] == "'":
                        current += "'"
                        i += 2
                        continue
                    i += 1
                    break
                i += 1
            continue
        if ch == ',' and not in_string:
            values.append(current.strip())
            current = ''
        else:
            current += ch
        i += 1
    if current.strip():
        values.append(current.strip())
    return values


def transform_designations(stmt):
    values_part = stmt[stmt.upper().index('VALUES') + len('VALUES'):].strip().rstrip(';')
    tuples = split_value_tuples(values_part)
    new_tuples = []
    for tup in tuples:
        fields = split_tuple_values(tup)
        if len(fields) < 5:
            continue
        status_value = STATUS_MAPPING.get(fields[3], fields[3])
        new_fields = [fields[0], fields[1], fields[2], status_value, fields[4], 'NULL']
        new_tuples.append('(' + ', '.join(new_fields) + ')')
    return 'INSERT OR IGNORE INTO "designation" ("id", "name", "created_by", "status", "created_at", "department_id") VALUES ' + ', '.join(new_tuples) + ';'

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("PRAGMA foreign_keys = OFF;")

# Ensure missing columns exist before importing inserts.
for stmt in [
    "ALTER TABLE classes ADD COLUMN subject_id bigint;",
    "ALTER TABLE classes ADD COLUMN teacher_id bigint;",
    "ALTER TABLE subjects ADD COLUMN teacher_id bigint;",
    "ALTER TABLE student_subject ADD COLUMN student_id bigint;",
    "ALTER TABLE student_subject ADD COLUMN subject_id bigint;",
    "ALTER TABLE class_student ADD COLUMN class_id bigint;",
    "ALTER TABLE class_student ADD COLUMN student_id bigint;",
]:
    try:
        cur.execute(stmt)
    except sqlite3.OperationalError as e:
        if 'duplicate column name' in str(e).lower() or 'already exists' in str(e).lower():
            pass
        else:
            raise

existing_tables = {row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()}
print('Existing tables:', sorted(existing_tables))

count = 0
for stmt in inserts:
    table_match = re.match(r'INSERT INTO\s+"?([\w_]+)"?', stmt, flags=re.I)
    if not table_match:
        continue
    table_name = table_match.group(1)
    mapped_table = TABLE_NAME_MAP.get(table_name, table_name)
    if mapped_table not in existing_tables:
        print('Skipping INSERT for missing table:', table_name, 'mapped to', mapped_table)
        continue
    if table_name == 'designations':
        stmt = transform_designations(stmt)
    else:
        stmt = re.sub(r'^INSERT INTO', 'INSERT OR IGNORE INTO', stmt, flags=re.I)
    try:
        cur.execute(stmt)
        count += 1
    except sqlite3.DatabaseError as e:
        print('ERROR on table', table_name, e)
        print('Statement:', stmt[:200])
        raise

conn.commit()
cur.close()
conn.close()
print('Inserted', count, 'statements into SQLite database.')

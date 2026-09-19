with open('server/db.ts', 'r') as f:
    content = f.read()

new_save = """
  private saveTimeout: NodeJS.Timeout | null = null;
  private save(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        if (!fs.existsSync(DB_DIR)) {
          fs.mkdirSync(DB_DIR, { recursive: true });
        }
        fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8', (err) => {
          if (err) console.error('[DB] Failed to async save DB file:', err);
        });
      } catch (err) {
        console.error('[DB] Failed to initiate save DB file:', err);
      }
    }, 1000);
  }
"""

content = content.replace("""  private save(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save DB file:', err);
    }
  }""", new_save)

with open('server/db.ts', 'w') as f:
    f.write(content)

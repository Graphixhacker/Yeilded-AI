with open('server/db.ts', 'r') as f:
    content = f.read()

funcs = """
  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public setUserBanned(userId: string, banned: boolean): User {
    const user = this.getUser(userId);
    (user as any).banned = banned;
    this.saveData();
    return user;
  }
"""

if "public getAllUsers" not in content:
    content = content.replace("public getUser(id: string): User {", funcs + "\n  public getUser(id: string): User {")

with open('server/db.ts', 'w') as f:
    f.write(content)

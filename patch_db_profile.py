import re

db_path = "server/db.ts"
with open(db_path, "r") as f:
    db = f.read()

profile_method = """
  public updateUserProfile(userId: string, name: string): User {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');
    user.name = name;
    this.save();
    return user;
  }
"""

db = db.replace("public updateUserTier(userId: string", profile_method + "\n  public updateUserTier(userId: string")

with open(db_path, "w") as f:
    f.write(db)


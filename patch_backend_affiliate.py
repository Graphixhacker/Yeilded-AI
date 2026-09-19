import re

with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

content = content.replace("const { email, name, password } = req.body;", "const { email, name, password, affiliateCode } = req.body;")
content = content.replace("const { user, token } = db.createUser(cleanEmail, name ? String(name).trim() : cleanEmail.split('@')[0], cleanPass);", "const { user, token } = db.createUser(cleanEmail, name ? String(name).trim() : cleanEmail.split('@')[0], cleanPass, affiliateCode);")

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)

with open('server/db.ts', 'r') as f:
    dbcontent = f.read()

dbcontent = dbcontent.replace("public createUser(email: string, name: string, passwordHash: string): { user: User, token: string } {", "public createUser(email: string, name: string, passwordHash: string, affiliateCode?: string): { user: User, token: string } {")

add_affiliate = """
    if (affiliateCode) {
      (newUser as any).affiliateCode = affiliateCode;
      
      // Increment referred users count
      const partners = this.getPartnerships();
      const partner = partners.find(p => p.affiliateCode === affiliateCode);
      if (partner) {
        partner.referredUsers = (partner.referredUsers || 0) + 1;
      }
    }
"""

if "if (affiliateCode)" not in dbcontent:
    dbcontent = dbcontent.replace("this.users.set(newUser.id, newUser);", add_affiliate + "\n    this.users.set(newUser.id, newUser);")


tier_update = """
  public updateUserTier(userId: string, tier: 'free' | '3day' | 'monthly'): User {
    const user = this.getUser(userId);
    const oldTier = user.tier;
    user.tier = tier;
    
    // If upgrading from free to paid, attribute conversion
    if (oldTier === 'free' && tier !== 'free' && (user as any).affiliateCode) {
      const partners = this.getPartnerships();
      const partner = partners.find(p => p.affiliateCode === (user as any).affiliateCode);
      if (partner) {
        partner.paidConversions = (partner.paidConversions || 0) + 1;
      }
    }
    
"""
if "oldTier" not in dbcontent:
    dbcontent = dbcontent.replace("public updateUserTier(userId: string, tier: 'free' | '3day' | 'monthly'): User {\n    const user = this.getUser(userId);\n    user.tier = tier;", tier_update)

with open('server/db.ts', 'w') as f:
    f.write(dbcontent)

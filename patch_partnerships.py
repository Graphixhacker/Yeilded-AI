with open('server/db.ts', 'r') as f:
    content = f.read()

funcs = """
  private partnerships = new Map<string, any>();

  public getPartnerships() {
    return Array.from(this.partnerships.values());
  }

  public addPartnership(partner: any) {
    const id = 'ptn_' + Math.random().toString(36).substring(2, 9);
    partner.id = id;
    partner.createdAt = new Date().toISOString();
    partner.referredUsers = 0;
    partner.paidConversions = 0;
    this.partnerships.set(id, partner);
    this.saveData();
    return partner;
  }
"""

if "public getPartnerships" not in content:
    content = content.replace("private users = new Map<string, User>();", "private users = new Map<string, User>();\n" + funcs)

with open('server/db.ts', 'w') as f:
    f.write(content)

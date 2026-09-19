import re

with open("server/db.ts", "r") as f:
    db_content = f.read()

# 1. Update DatabaseSchema
db_content = db_content.replace(
    "usageLogs: UsageLog[];\n}",
    "usageLogs: UsageLog[];\n  partnerships: any[];\n}"
)

# 2. Update INITIAL_DB
db_content = db_content.replace(
    "crisisNotes: [],\n  usageLogs: []\n};",
    "crisisNotes: [],\n  usageLogs: [],\n  partnerships: []\n};"
)
db_content = db_content.replace(
    "crisisNotes: [],\n  usageLogs: [\n",
    "crisisNotes: [],\n  partnerships: [],\n  usageLogs: [\n"
)

# 3. Update constructor to NOT use new Map(), but this.data.partnerships
db_content = db_content.replace(
    "private partnerships = new Map<string, any>();",
    ""
)

# 4. Update getPartnerships
get_part_target = """  public getPartnerships() {
    return Array.from(this.partnerships.values());
  }"""
get_part_replace = """  public getPartnerships() {
    return this.data.partnerships || [];
  }"""
db_content = db_content.replace(get_part_target, get_part_replace)

# 5. Update addPartnership
add_part_target = """  public addPartnership(partner: any) {
    const id = 'ptn_' + Math.random().toString(36).substring(2, 9);
    partner.id = id;
    partner.createdAt = new Date().toISOString();
    partner.referredUsers = 0;
    partner.paidConversions = 0;
    this.partnerships.set(id, partner);
    this.save();
    return partner;
  }"""
add_part_replace = """  public addPartnership(partner: any) {
    const id = 'ptn_' + Math.random().toString(36).substring(2, 9);
    partner.id = id;
    partner.createdAt = new Date().toISOString();
    partner.referredUsers = 0;
    partner.paidConversions = 0;
    if (!this.data.partnerships) this.data.partnerships = [];
    this.data.partnerships.push(partner);
    this.save();
    return partner;
  }"""
db_content = db_content.replace(add_part_target, add_part_replace)

# 6. Update reference in verifyAffiliateCode or similar? 
# Check if this.partnerships is used elsewhere.
search_target = "const partners = this.getPartnerships();"
# That one uses the method, so it's fine!

with open("server/db.ts", "w") as f:
    f.write(db_content)

print("db.ts patched.")

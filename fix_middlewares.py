import re

with open("server/apiRouter.ts", "r") as f:
    content = f.read()

# 1. Extract the express compatibility middleware
express_compat_start = content.find("// Ensure standard Express response methods")
express_compat_end = content.find("// Middleware to extract user")
express_compat = content[express_compat_start:express_compat_end]

# 2. Extract the authenticate middleware
auth_mid_start = content.find("// Middleware to extract user")
auth_mid_end = content.find("// --- AUTH ENDPOINTS ---")
auth_mid = content[auth_mid_start:auth_mid_end]

# 3. Remove them from their current location
new_content = content[:express_compat_start] + content[auth_mid_end:]

# 4. Insert them before ADMIN_EMAILS
insertion_point = new_content.find("const ADMIN_EMAILS =")
final_content = new_content[:insertion_point] + express_compat + auth_mid + new_content[insertion_point:]

with open("server/apiRouter.ts", "w") as f:
    f.write(final_content)

print("Middlewares moved to the top.")

import re

with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

# Pattern for Demo button
demo_pattern = r'\s*<button[^>]*id="demo-delegate-signin-btn".*?</button>'
content = re.sub(demo_pattern, '', content, flags=re.DOTALL)

# Pattern for Google button
google_pattern = r'\s*\{\/\* Continue with Google Button \*\/\}\s*<button[^>]*id="google-signin-btn".*?</button>'
content = re.sub(google_pattern, '', content, flags=re.DOTALL)

# Pattern for "Or with email" divider
divider_pattern = r'\s*<div className="relative my-4">.*?Or with email.*?</div>\s*</div>'
content = re.sub(divider_pattern, '', content, flags=re.DOTALL)

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)

print("Done")

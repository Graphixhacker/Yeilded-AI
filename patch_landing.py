import re

file_path = "src/components/LandingPage.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace tiny fonts and generic padding
content = content.replace("text-xs", "text-sm")
content = content.replace("text-[10px]", "text-xs")
content = content.replace("text-[11px]", "text-xs")
content = content.replace("text-sm", "text-base") # Upgrade some sm to base
content = content.replace("sm:text-base", "sm:text-lg")
content = content.replace("text-base sm:text-lg", "text-lg sm:text-xl")

# Fix headings
content = content.replace("font-extrabold", "font-display font-bold")
content = content.replace("text-3xl sm:text-5xl lg:text-6xl", "text-4xl sm:text-5xl lg:text-6xl")

with open(file_path, "w") as f:
    f.write(content)

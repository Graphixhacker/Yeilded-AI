import re

with open('src/components/PricingModal.tsx', 'r') as f:
    content = f.read()

# Update bank details
content = content.replace("Meezan Bank", "Bank Alfalah")
content = content.replace("PK12MEZN0001234567890123", "PK33ALFH0304001005709819")
content = content.replace("0300-1234567", "{{JAZZCASH_NUMBER}}")
content = content.replace("John Doe", "{{JAZZCASH_TITLE}}")

# Update whatsapp links
content = re.sub(r'https://wa\.me/\d+', 'https://wa.me/923122421899', content)

with open('src/components/PricingModal.tsx', 'w') as f:
    f.write(content)

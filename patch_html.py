import re

html_path = "index.html"
with open(html_path, "r") as f:
    html = f.read()

# Replace Inter and Cinzel with Playfair Display and Plus Jakarta Sans
target_fonts = '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
new_fonts = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">'

html = html.replace(target_fonts, new_fonts)

with open(html_path, "w") as f:
    f.write(html)

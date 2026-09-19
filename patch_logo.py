import re

files = [
    'src/components/LandingPage.tsx',
    'src/components/Sidebar.tsx'
]

logo_tag = '<img src="/logo.png" alt="Yeilded Logo" className="w-full h-full object-contain p-1" />'

# We are looking for `<div className="w-10 h-10 rounded-xl bg-gradient-to-br ...">` and replacing its content
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern for LandingPage.tsx
    content = re.sub(
        r'<div className="w-10 h-10 rounded-xl bg-gradient[^>]*>\s*<span className="font-serif">UN</span>\s*</div>',
        f'<div className="w-10 h-10 bg-white rounded-xl shadow-md overflow-hidden">{logo_tag}</div>',
        content
    )
    
    # Pattern for Sidebar.tsx
    content = re.sub(
        r'<div className="w-9 h-9 rounded-lg bg-gradient[^>]*>\s*<span className="font-serif">UN</span>\s*</div>',
        f'<div className="w-9 h-9 bg-white rounded-lg shadow-md overflow-hidden">{logo_tag}</div>',
        content
    )

    # Some old "Yeilded" might be "YEILDED" where it should be "Yeilded"
    content = content.replace("YEILDED", "Yeilded")

    with open(filepath, 'w') as f:
        f.write(content)


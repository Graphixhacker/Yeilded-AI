import re

def process_file(filepath, is_header):
    with open(filepath, 'r') as f:
        content = f.read()

    # Insert isPNA logic if not present
    if "const isPNA" not in content:
        if is_header:
            content = content.replace("const handleLogout", "const isPNA = context.committee?.toLowerCase().includes('pakistan') || context.committee?.toLowerCase().includes('pna') || context.committee?.toLowerCase().includes('national assembly');\n  const handleLogout")
        else:
            content = content.replace("const handleSave", "const isPNA = committee.toLowerCase().includes('pakistan') || committee.toLowerCase().includes('pna') || committee.toLowerCase().includes('national assembly');\n  const handleSave")

    # Replace the label and map
    if is_header:
        content = content.replace("Country / Sovereign State", "{isPNA ? 'Political Party' : 'Country / Sovereign State'}")
        content = re.sub(
            r'\{UN_COUNTRIES\.map\(\(c\) => \(\s*<option key=\{c\} value=\{c\}>\{c\}</option>\s*\)\)\}',
            '{(isPNA ? PAKISTAN_POLITICAL_PARTIES : UN_COUNTRIES).map((c) => (<option key={c} value={c}>{c}</option>))}',
            content
        )
    else:
        content = content.replace("Represented Nation", "{isPNA ? 'Political Party' : 'Represented Nation'}")
        content = re.sub(
            r'\{UN_COUNTRIES\.map\(\(c\) => \(\s*<option key=\{c\} value=\{c\}>\{c\}</option>\s*\)\)\}',
            '{(isPNA ? PAKISTAN_POLITICAL_PARTIES : UN_COUNTRIES).map((c) => (<option key={c} value={c}>{c}</option>))}',
            content
        )

    with open(filepath, 'w') as f:
        f.write(content)

process_file('src/components/OnboardingModal.tsx', False)
process_file('src/components/Header.tsx', True)
print("Done")

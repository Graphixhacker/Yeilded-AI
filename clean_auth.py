import re

with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

# Remove handleGoogleSignIn
content = re.sub(r'const handleGoogleSignIn = async \(\) => \{.*?\n  \};\n', '', content, flags=re.DOTALL)

# Remove handleDemoSignIn
content = re.sub(r'const handleDemoSignIn = async \(\) => \{.*?\n  \};\n', '', content, flags=re.DOTALL)

# Remove googleNotice and setGoogleNotice
content = re.sub(r'const \[googleNotice, setGoogleNotice\] = useState<string \| null>\(null\);\n', '', content)
content = re.sub(r'setGoogleNotice\(null\);\n', '', content)
content = re.sub(r'\{googleNotice && \(.*?</div>\s*\)\}', '', content, flags=re.DOTALL)

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)

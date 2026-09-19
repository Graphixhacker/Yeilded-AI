import os
import re

files = [
    "src/components/tabs/PolicyResearchTab.tsx",
    "src/components/tabs/CrisisSimulatorTab.tsx",
    "src/components/tabs/DebatePracticeTab.tsx",
    "src/components/tabs/RoPAssistantTab.tsx"
]

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Matches a typical inline error rendering block
    pattern = r'\{errorMsg && \(\s*<div[^>]*bg-rose-50[^>]*>\s*\{?errorMsg\}?\s*(?:\{isLimitBlocked[^}]*\})?\s*</div>\s*\)\}'
    # Some use spans or other structures. Let's make a generic replace function
    
    # We will just replace it if we find something that looks like the error div
    content = re.sub(
        r'\{errorMsg && \(\s*<div[^>]*bg-rose-50.*?(?=</div>\s*\)\})</div>\s*\)\}', 
        '{errorMsg && <ErrorAlert message={errorMsg} />}',
        content,
        flags=re.DOTALL
    )
    
    # Also replace for limit blocked versions
    content = re.sub(
        r'\{errorMsg && \(\s*<ErrorAlert message=\{errorMsg\} />\s*\)\}',
        '{errorMsg && <ErrorAlert message={errorMsg} />}',
        content,
        flags=re.DOTALL
    )
    
    with open(f, 'w') as file:
        file.write(content)

print("Done")

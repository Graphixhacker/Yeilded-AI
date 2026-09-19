import os

# Target directories
dirs = ['src/components', 'src/components/tabs']

for dir_path in dirs:
    for filename in os.listdir(dir_path):
        if not filename.endswith('.tsx') and not filename.endswith('.ts'):
            continue
            
        file_path = os.path.join(dir_path, filename)
        
        with open(file_path, "r") as f:
            content = f.read()

        # Simple replacement chain (order matters to avoid double replacement)
        # We want to upgrade everything by one step.
        # But wait, if we replace text-sm with text-base, then later we replace text-xs with text-sm, the new text-sm won't be replaced again (which is correct because it's sequential replacement).
        
        content = content.replace("text-sm", "text-base")
        content = content.replace("text-xs", "text-sm")
        content = content.replace("text-[11px]", "text-xs")
        content = content.replace("text-[10px]", "text-xs")
        content = content.replace("text-[9px]", "text-[10px]")

        # We should also upgrade min-h-[44px] touch targets if they are there, but 44px is fine for mobile (touch target).
        # We can increase padding slightly.
        content = content.replace("p-3.5", "p-4")
        content = content.replace("p-2.5", "p-3")

        with open(file_path, "w") as f:
            f.write(content)
            
print("Typography updated across components.")

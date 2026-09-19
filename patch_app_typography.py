file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("text-sm", "text-base")
content = content.replace("text-xs", "text-sm")
content = content.replace("text-[11px]", "text-xs")
content = content.replace("text-[10px]", "text-xs")
content = content.replace("text-[9px]", "text-[10px]")
content = content.replace("p-3.5", "p-4")
content = content.replace("p-2.5", "p-3")

with open(file_path, "w") as f:
    f.write(content)

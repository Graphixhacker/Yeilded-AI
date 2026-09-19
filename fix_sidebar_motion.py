import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Replace the style block
content = re.sub(r'\s*style=\{\{[^}]+\}\}\s*', ' ', content)

# Also check for `<motion.aside` and if it already has drag props, keep them, otherwise add them.
# I will just replace `<motion.aside` up to `className` with the proper attributes.
# The previous script might not have added drag props because the regex failed.
if 'drag="x"' not in content:
    content = content.replace(
        '<motion.aside',
        '<motion.aside\n        drag="x"\n        dragConstraints={{ left: 0, right: 0 }}\n        dragElastic={0.2}\n        onDragEnd={(e, info) => {\n          if (info.offset.x < -50) {\n            handleClose();\n          }\n        }}'
    )

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)

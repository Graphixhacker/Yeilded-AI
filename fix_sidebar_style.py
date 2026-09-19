with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Find the exact style block
style_block = """        style={{
          transform: isDrawerOpen && (offset.x < 0 || offset.y > 0)
            ? `translate3d(${offset.x < 0 ? offset.x : 0}px, ${offset.y > 0 ? offset.y : 0}px, 0)`
            : undefined,
          transition: isSwiping ? 'none' : undefined
        }}"""

content = content.replace(style_block, "")

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)

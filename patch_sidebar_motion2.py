import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Remove useSwipeDismiss block
content = re.sub(
    r'// Swipe-to-dismiss support on mobile drawer \(swipe left or swipe down\)\n\s*const \{ offset, isSwiping, touchHandlers \} = useSwipeDismiss\(\{\n\s*onDismiss: handleClose,\n\s*direction: \'both\',\n\s*threshold: 50,\n\s*enabled: isDrawerOpen\n\s*\}\);\n',
    '',
    content,
    flags=re.MULTILINE
)

# Replace the <motion.aside style={...} className={...}>
new_aside = """
      <motion.aside
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.x < -50) {
            handleClose();
          }
        }}
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto w-72 shrink-0 h-full bg-[#0B1F3A] text-slate-100 flex flex-col border-r border-[#1E3A5F] shadow-2xl lg:shadow-none transition-transform lg:translate-x-0 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
"""

content = re.sub(
    r'<motion\.aside\s+style=\{\{\s*transform:[^}]+\}\}\s+className=\{\`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto w-72 shrink-0 h-full bg-\[\#0B1F3A\] text-slate-100 flex flex-col border-r border-\[\#1E3A5F\] shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 \$\{\s*isDrawerOpen \? \'translate-x-0\' : \'-translate-x-full\'\s*\}\`\}\s*>',
    new_aside.strip(),
    content,
    flags=re.DOTALL
)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)

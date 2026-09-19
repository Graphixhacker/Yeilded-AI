import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

if "motion/react" not in content:
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { motion, PanInfo } from 'motion/react';")

# Replace useSwipeDismiss stuff
content = re.sub(r'const \{ touchHandlers.*?;\n', '', content, flags=re.DOTALL)
content = re.sub(r'import \{ useSwipeDismiss \} from \'../hooks/useSwipeDismiss\';\n', '', content)

# Change aside to motion.aside
content = content.replace('<aside', '<motion.aside')
content = content.replace('</aside>', '</motion.aside>')

# Add drag props
drag_props = """
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.x < -50) {
            handleClose();
          }
        }}
"""

content = content.replace('className={`fixed inset-y-0', drag_props + 'className={`fixed inset-y-0')

# Remove touchHandlers from aside
content = re.sub(r'\{.*?\.\.\.touchHandlers.*?\n\s*', '', content)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)


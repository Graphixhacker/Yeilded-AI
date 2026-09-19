import re

with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

# Find useSwipeDismiss
swipe_block = """  const { offset, isSwiping, touchHandlers } = useSwipeDismiss({
    onDismiss: onClose,
    direction: 'down',
    threshold: 60,
    enabled: isOpen
  });"""

# Remove existing
content = content.replace(swipe_block, "")

# Find early return
early_return = "  if (!isOpen) return null;"

# Insert just before
content = content.replace(early_return, swipe_block + "\n\n" + early_return)

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)


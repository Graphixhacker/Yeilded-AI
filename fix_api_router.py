with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

import re
# Find the broken catch block and remove it
broken = r'  } catch \(err: any\) \{\n    console\.error\(\'\[Demo Auth Error\]:\', err\);\n    res\.status\(500\)\.json\(\{ error: \'Failed to initialize demo session\' \}\);\n  \}\}\);\n'
content = content.replace('  } catch (err: any) {\n    console.error(\'[Demo Auth Error]:\', err);\n    res.status(500).json({ error: \'Failed to initialize demo session\' });\n  }});\n', '')

# For google auth, maybe it also left something?
google_broken = r'        \} else \{\n          return res\.status\(400\)\.json\(\{ error: \'Google login failed: No email returned\' \}\);\n        \}\n      \} else \{\n        return res\.status\(400\)\.json\(\{ error: \'Invalid credential structure\' \}\);\n      \}\n    \} catch \(err\) \{\n      console\.warn\(\'\[Google Credential Parse Warning\]:\', err\);\n    \}\n  \}\n\n  if \(\!email\) \{\n    return res\.status\(400\)\.json\(\{ error: \'Valid Email is required for Google Sign-In\' \}\);\n  \}\n\n  const cleanEmail = String\(email\)\.trim\(\)\.toLowerCase\(\);\n  let user = db\.getUserByEmail\(cleanEmail\);\n  if \(\!user\) \{\n    const \{ user: newUser \} = db\.createUser\(cleanEmail, name \? String\(name\)\.trim\(\) : cleanEmail\.split\(\'@\'\)\[0\], \'google_sso_dummy_pass\'\);\n    if \(avatar\) \{\n      newUser\.avatar = avatar;\n    \}\n    user = newUser;\n  \} else if \(avatar \&\& \!user\.avatar\) \{\n    user\.avatar = avatar;\n  \}\n\n  const token = db\.createTokenForUser\(user\.id\);\n  res\.json\(\{ user, token \}\);\n\}\);\n'
# Let's just fix it properly by using sed and head/tail if necessary, or just clean it up based on syntax tree.

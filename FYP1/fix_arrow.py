
content = open(r'c:\Users\MZ\Desktop\FYP1\FYP1\frontend\src\pages\AdminDashboard.jsx', 'r', encoding='utf-8').read()

old = "onClick={() =>\n                                      navigate(`/profile/${item.id}`)\n                                    }"
new = "onClick={() => openProfile(item.id)}"

if old in content:
    content = content.replace(old, new, 1)
    print('Arrow button: REPLACED')
else:
    # Try to find what is around navigate
    idx = content.find('navigate')
    if idx >= 0:
        print('navigate found at:', idx)
        print(repr(content[idx-100:idx+80]))
    else:
        print('navigate NOT FOUND in file at all')

open(r'c:\Users\MZ\Desktop\FYP1\FYP1\frontend\src\pages\AdminDashboard.jsx', 'w', encoding='utf-8').write(content)
print('DONE')

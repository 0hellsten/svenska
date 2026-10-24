import subprocess
import re

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///c:/Hellsten/Wilawan/test_suite.html?v=test4'
]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
summary_match = re.search(r'id="summary-bar"[^>]*>(.*?)</div>', res.stdout)
print("Summary:", summary_match.group(1) if summary_match else "None")

passes = re.findall(r'<div class="test-card pass">.*?<strong>(.*?)</strong>', res.stdout, re.DOTALL)
fails = re.findall(r'<div class="test-card fail">.*?<strong>(.*?)</strong>', res.stdout, re.DOTALL)

print(f"Total passed: {len(passes)}")
print(f"Total failed: {len(fails)}")

if fails:
    print("Failed tests:")
    for f in fails:
        print("  -", f)
else:
    print("All tests passed cleanly!")

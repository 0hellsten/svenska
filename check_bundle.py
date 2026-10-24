import subprocess
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///c:/Hellsten/Wilawan/svenska_satun_iphone.html'
]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
content = res.stdout

dom_only = re.sub(r'<style.*?</style>', '', content, flags=re.DOTALL)
dom_only = re.sub(r'<script.*?</script>', '', dom_only, flags=re.DOTALL)

mascot_idx = dom_only.find('id="mascot-container"')
mascot_slice = dom_only[mascot_idx:mascot_idx+800] if mascot_idx != -1 else ""

checks = {
    'App Shell': 'id="app-shell"' in dom_only,
    'Mascot Container': 'id="mascot-container"' in dom_only,
    'Mascot SVG inside Container': '<svg' in mascot_slice and 'dala' in mascot_slice,
    'Themes Grid': 'id="themes-grid"' in dom_only,
    'Theme cards rendered (10 themes)': len(re.findall(r'class="theme-card[^"]*"', dom_only)) == 10,
    'Bottom Nav': 'class="bottom-nav"' in dom_only,
    'Compete View': 'id="view-compete"' in dom_only,
    'Word Bank View': 'id="view-vocab"' in dom_only,
    'Streak pill': 'id="streak-pill"' in dom_only,
    'Gems pill': 'id="gems-pill"' in dom_only,
    'XP pill': 'id="xp-pill"' in dom_only,
    'Welcome banner with Satun dialect': 'Hej! มาแหลงสวีเดนกันต๊ะ' in dom_only
}

all_ok = True
print("\nDOM Checks on svenska_satun_iphone.html:")
for name, ok in checks.items():
    print(f" - {name}: {'OK' if ok else 'FAILED'}")
    if not ok:
        all_ok = False

if all_ok:
    print("\nSUCCESS: All UI components and themes in svenska_satun_iphone.html rendered 100% cleanly!")
else:
    print("\nWARNING: Some checks failed.")

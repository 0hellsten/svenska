# -*- coding: utf-8 -*-
"""Merge Batch 1-5 into database.js to reach exactly 1,000 items (100 per theme)."""
import json
import os
import sys
import importlib.util

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\Hellsten\Wilawan"

def load_batch(filename):
    path = os.path.join(BASE_DIR, "data_batches", filename)
    spec = importlib.util.spec_from_file_location("mod", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    for attr in dir(mod):
        val = getattr(mod, attr)
        if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
            return val
    raise ValueError(f"No item list found in {filename}")

b1 = load_batch("batch1.py")
b2 = load_batch("batch2.py")
b3 = load_batch("batch3.py")
b4 = load_batch("batch4.py")
b5 = load_batch("batch5.py")

all_new_items = b1 + b2 + b3 + b4 + b5
print(f"Total new items to inject: {len(all_new_items)}")

db_path = os.path.join(BASE_DIR, "database.js")
with open(db_path, "r", encoding="utf-8") as f:
    db_text = f.read()

# Verify header comment update
db_text = db_text.replace(
    "2. KOMPLETT DATABAS (160 HANDSKRIVNA POSTER — 16 PER TEMA)",
    "2. KOMPLETT DATABAS (1 000 NOGGRANT UTVALDA POSTER — 100 PER TEMA)"
)

# Format JS items
# We want to format each new item with clean indentation
def item_to_js(item):
    lines = ["    {"]
    lines.append(f"      id: {json.dumps(item['id'], ensure_ascii=False)},")
    lines.append(f"      themeId: {json.dumps(item['themeId'], ensure_ascii=False)},")
    lines.append(f"      type: {json.dumps(item['type'], ensure_ascii=False)},")
    lines.append(f"      sv: {json.dumps(item['sv'], ensure_ascii=False)},")
    lines.append(f"      th: {json.dumps(item['th'], ensure_ascii=False)},")
    lines.append(f"      satunFlavor: {json.dumps(item['satunFlavor'], ensure_ascii=False)},")
    lines.append(f"      phoneticTh: {json.dumps(item['phoneticTh'], ensure_ascii=False)},")
    lines.append(f"      pronunciationTip: {json.dumps(item['pronunciationTip'], ensure_ascii=False)},")
    lines.append(f"      svgScene: {json.dumps(item['svgScene'], ensure_ascii=False)},")
    lines.append(f"      distractorsSv: {json.dumps(item['distractorsSv'], ensure_ascii=False)},")
    lines.append(f"      distractorsTh: {json.dumps(item['distractorsTh'], ensure_ascii=False)},")
    lines.append(f"      wordChunks: {json.dumps(item['wordChunks'], ensure_ascii=False)}")
    lines.append("    }")
    return "\n".join(lines)

new_js_blocks = []
current_theme = None

for it in all_new_items:
    item_str = item_to_js(it)
    if it['themeId'] != current_theme:
        current_theme = it['themeId']
        item_str = f"    /* --- EXPANDED THEME: {current_theme.upper()} --- */\n" + item_str
    new_js_blocks.append(item_str)

injected_js = ",\n" + ",\n".join(new_js_blocks) + "\n"

# Find target location: right before `  ];\n\n  /* ==========================================================================\n     3. NORMALISERA FÄLT`
target_marker = "\n  ];\n\n  /* ==========================================================================\n     3. NORMALISERA FÄLT"
if target_marker not in db_text:
    # Try alternate line endings
    target_marker = "\r\n  ];\r\n\r\n  /* ==========================================================================\r\n     3. NORMALISERA FÄLT"
    if target_marker not in db_text:
        # Try generic find
        idx = db_text.find("  const SCENE_EMOJI_MAP = {")
        if idx != -1:
            # find last `  ];` before SCENE_EMOJI_MAP
            close_idx = db_text.rfind("  ];", 0, idx)
            if close_idx != -1:
                db_text = db_text[:close_idx] + injected_js + db_text[close_idx:]
                print(f"Injected at position {close_idx}")
            else:
                raise RuntimeError("Could not find closing '  ];'")
        else:
            raise RuntimeError("Could not find marker for SCENE_EMOJI_MAP")
    else:
        parts = db_text.split(target_marker, 1)
        db_text = parts[0] + injected_js + "  ];\r\n\r\n  /* ==========================================================================\r\n     3. NORMALISERA FÄLT" + parts[1]
else:
    parts = db_text.split(target_marker, 1)
    db_text = parts[0] + injected_js + "\n  ];\n\n  /* ==========================================================================\n     3. NORMALISERA FÄLT" + parts[1]

with open(db_path, "w", encoding="utf-8") as f:
    f.write(db_text)

print("database.js successfully updated with 1,000 items!")

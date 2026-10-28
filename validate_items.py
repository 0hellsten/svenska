import sys

sys.stdout.reconfigure(encoding='utf-8')

VALID_THEMES = {
    'greetings', 'family_love', 'supermarket', 'fika_food', 'everyday',
    'weather_time', 'shopping_numbers', 'city_transport', 'sfi_smalltalk', 'real_dialogs'
}

VALID_TYPES = {'word', 'sentence', 'concept'}

def validate_item_list(items, existing_ids=None, existing_sv=None):
    if existing_ids is None:
        existing_ids = set()
    else:
        existing_ids = set(existing_ids)
        
    if existing_sv is None:
        existing_sv = set()
    else:
        existing_sv = set(s.lower().strip() for s in existing_sv)

    errors = []
    ids_in_batch = set()
    sv_in_batch = set()

    for idx, item in enumerate(items):
        item_id = item.get('id', '')
        if not item_id:
            errors.append(f"Item #{idx} missing 'id'")
        elif item_id in existing_ids:
            errors.append(f"Item #{idx} id '{item_id}' already exists in database")
        elif item_id in ids_in_batch:
            errors.append(f"Item #{idx} id '{item_id}' duplicated in current batch")
        ids_in_batch.add(item_id)

        theme_id = item.get('themeId', '')
        if theme_id not in VALID_THEMES:
            errors.append(f"Item #{idx} ('{item_id}') invalid themeId: '{theme_id}'")

        itype = item.get('type', '')
        if itype not in VALID_TYPES:
            errors.append(f"Item #{idx} ('{item_id}') invalid type: '{itype}'")

        sv = item.get('sv', '').strip()
        if not sv:
            errors.append(f"Item #{idx} ('{item_id}') missing 'sv'")
        elif sv.lower() in existing_sv:
            errors.append(f"Item #{idx} ('{item_id}') sv '{sv}' already exists in database")
        elif sv.lower() in sv_in_batch:
            errors.append(f"Item #{idx} ('{item_id}') sv '{sv}' duplicated in current batch")
        sv_in_batch.add(sv.lower())

        th = item.get('th', '').strip()
        if not th:
            errors.append(f"Item #{idx} ('{item_id}') missing 'th'")

        satun = item.get('satunFlavor', '').strip()
        if not satun:
            errors.append(f"Item #{idx} ('{item_id}') missing 'satunFlavor'")

        phon = item.get('phoneticTh', '').strip()
        if not phon:
            errors.append(f"Item #{idx} ('{item_id}') missing 'phoneticTh'")

        tip = item.get('pronunciationTip', '').strip()
        if not tip:
            errors.append(f"Item #{idx} ('{item_id}') missing 'pronunciationTip'")

        d_sv = item.get('distractorsSv', [])
        if not isinstance(d_sv, list) or len(d_sv) < 3:
            errors.append(f"Item #{idx} ('{item_id}') distractorsSv must have >= 3 elements")

        d_th = item.get('distractorsTh', [])
        if not isinstance(d_th, list) or len(d_th) < 3:
            errors.append(f"Item #{idx} ('{item_id}') distractorsTh must have >= 3 elements")

        chunks = item.get('wordChunks', [])
        if not isinstance(chunks, list) or len(chunks) < 1:
            errors.append(f"Item #{idx} ('{item_id}') wordChunks must have >= 1 elements")

    return errors

if __name__ == '__main__':
    import json
    import os
    import importlib.util

    if len(sys.argv) > 1:
        with open('existing_data.json', 'r', encoding='utf-8') as f:
            exist = json.load(f)
        
        known_ids = set(exist.get('ids', []))
        known_sv = set(s.lower().strip() for s in exist.get('sv', []))
        total_items = 0
        all_passed = True

        for batch_path in sys.argv[1:]:
            spec = importlib.util.spec_from_file_location("batch_module", batch_path)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            items = getattr(mod, 'ITEMS', None) or getattr(mod, 'batch1_items', None) or getattr(mod, 'batch2_items', None) or getattr(mod, 'batch3_items', None) or getattr(mod, 'batch4_items', None) or getattr(mod, 'batch5_items', None) or getattr(mod, 'BATCH_ITEMS', None) or getattr(mod, 'items', None)
            if items is None:
                for attr in dir(mod):
                    val = getattr(mod, attr)
                    if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                        items = val
                        break
            items = items or []
            print(f"Loaded {len(items)} items from {batch_path}")
            total_items += len(items)
            errs = validate_item_list(items, known_ids, known_sv)
            if errs:
                print(f"Validation FAILED for {batch_path} with {len(errs)} errors:")
                for e in errs[:10]:
                    print(f"  - {e}")
                if len(errs) > 10:
                    print(f"  ... and {len(errs) - 10} more.")
                all_passed = False
                break
            else:
                for it in items:
                    known_ids.add(it['id'])
                    known_sv.add(it['sv'].lower().strip())

        if all_passed:
            print(f"All batches validated PASSED! Total items validated: {total_items}")
            sys.exit(0)
        else:
            sys.exit(1)

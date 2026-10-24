import os
import shutil

def bundle():
    base_dir = r"c:\Hellsten\Wilawan"
    template_path = os.path.join(base_dir, "index.template.html")
    
    with open(template_path, "r", encoding="utf-8") as f:
        html = f.read()

    with open(os.path.join(base_dir, "styles.css"), "r", encoding="utf-8") as f:
        styles = f.read()

    with open(os.path.join(base_dir, "animations.css"), "r", encoding="utf-8") as f:
        animations = f.read()

    with open(os.path.join(base_dir, "app.js"), "r", encoding="utf-8") as f:
        app = f.read()

    with open(os.path.join(base_dir, "visuals.js"), "r", encoding="utf-8") as f:
        visuals = f.read()

    with open(os.path.join(base_dir, "speech_audio.js"), "r", encoding="utf-8") as f:
        speech = f.read()

    with open(os.path.join(base_dir, "database.js"), "r", encoding="utf-8") as f:
        db = f.read()

    with open(os.path.join(base_dir, "gamification.js"), "r", encoding="utf-8") as f:
        gamification = f.read()

    css_combined = f"<style>\n/* STYLES.CSS */\n{styles}\n/* ANIMATIONS.CSS */\n{animations}\n</style>"
    html = html.replace('<link rel="stylesheet" href="styles.css">', "")
    html = html.replace('<link rel="stylesheet" href="animations.css">', css_combined)

    html = html.replace('<script src="app.js"></script>', f"<script>\n{app}\n</script>")
    html = html.replace('<script src="visuals.js"></script>', f"<script>\n{visuals}\n</script>")
    html = html.replace('<script src="speech_audio.js"></script>', f"<script>\n{speech}\n</script>")
    html = html.replace('<script src="database.js"></script>', f"<script>\n{db}\n</script>")
    html = html.replace('<script src="gamification.js"></script>', f"<script>\n{gamification}\n</script>")

    out_iphone = os.path.join(base_dir, "svenska_satun_iphone.html")
    with open(out_iphone, "w", encoding="utf-8") as f:
        f.write(html)

    out_index = os.path.join(base_dir, "index.html")
    with open(out_index, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Successfully generated {out_iphone} and {out_index} ({len(html)} chars)")

if __name__ == "__main__":
    bundle()

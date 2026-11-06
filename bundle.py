import os
import shutil
import base64

def bundle():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(base_dir, "index.template.html")
    
    with open(template_path, "r", encoding="utf-8") as f:
        html = f.read().replace('\r\n', '\n')

    with open(os.path.join(base_dir, "styles.css"), "r", encoding="utf-8") as f:
        styles = f.read().replace('\r\n', '\n')

    with open(os.path.join(base_dir, "animations.css"), "r", encoding="utf-8") as f:
        animations = f.read().replace('\r\n', '\n')

    with open(os.path.join(base_dir, "app.js"), "r", encoding="utf-8") as f:
        app = f.read().replace('\r\n', '\n')

    with open(os.path.join(base_dir, "visuals.js"), "r", encoding="utf-8") as f:
        visuals = f.read().replace('\r\n', '\n')

    with open(os.path.join(base_dir, "speech_audio.js"), "r", encoding="utf-8") as f:
        speech = f.read().replace('\r\n', '\n')

    with open(os.path.join(base_dir, "database.js"), "r", encoding="utf-8") as f:
        db = f.read().replace('\r\n', '\n')

    with open(os.path.join(base_dir, "gamification.js"), "r", encoding="utf-8") as f:
        gamification = f.read().replace('\r\n', '\n')

    css_combined = f"<style>\n/* STYLES.CSS */\n{styles}\n/* ANIMATIONS.CSS */\n{animations}\n</style>"
    html = html.replace('<link rel="stylesheet" href="styles.css">', "")
    html = html.replace('<link rel="stylesheet" href="animations.css">', css_combined)

    html = html.replace('<script src="app.js"></script>', f"<script>\n{app}\n</script>")
    html = html.replace('<script src="visuals.js"></script>', f"<script>\n{visuals}\n</script>")
    html = html.replace('<script src="speech_audio.js"></script>', f"<script>\n{speech}\n</script>")
    html = html.replace('<script src="database.js"></script>', f"<script>\n{db}\n</script>")
    html = html.replace('<script src="gamification.js"></script>', f"<script>\n{gamification}\n</script>")

    # Keep the small games and their original vector artwork in the portable file.
    with open(os.path.join(base_dir, "mini_games.css"), "r", encoding="utf-8") as f:
        games_css = f.read()
    html = html.replace('<link rel="stylesheet" href="mini_games.css">',
                        f"<style>\n/* MINI GAMES */\n{games_css}\n</style>")
    with open(os.path.join(base_dir, "zoo_escape.css"), "r", encoding="utf-8") as f:
        zoo_css = f.read()
    html = html.replace('<link rel="stylesheet" href="zoo_escape.css">',
                        f"<style>\n/* NATTNYCKELN */\n{zoo_css}\n</style>")
    for filename in ("learning_progress.js", "mini_games_core.js", "mini_games_art.js", "zoo_core.js",
                     "zoo_art.js", "zoo_escape.js", "mini_games.js"):
        with open(os.path.join(base_dir, filename), "r", encoding="utf-8") as f:
            script = f.read()
        html = html.replace(f'<script src="{filename}"></script>',
                            f"<script>\n{script}\n</script>")

    # Keep the painted zoo self-contained in the transferable iPhone app too.
    for name in ("forest", "wetland", "greenhouse", "animals"):
        asset_path = f"assets/zoo/{name}.webp"
        with open(os.path.join(base_dir, asset_path), "rb") as f:
            encoded = base64.b64encode(f.read()).decode("ascii")
        html = html.replace(asset_path, f"data:image/webp;base64,{encoded}")

    out_iphone = os.path.join(base_dir, "svenska_satun_iphone.html")
    with open(out_iphone, "w", encoding="utf-8", newline='\n') as f:
        f.write(html)

    out_index = os.path.join(base_dir, "index.html")
    with open(out_index, "w", encoding="utf-8", newline='\r\n') as f:
        f.write(html)

    print(f"Successfully generated {out_iphone} and {out_index} ({len(html)} chars)")

if __name__ == "__main__":
    bundle()

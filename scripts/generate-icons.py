import os
from PIL import Image, ImageDraw

ICON_SRC = r"C:\Users\Alex\.gemini\antigravity-ide\brain\4195d9e7-1b98-4bd9-9c90-37794939842d\animafind_app_icon_1793095873689.jpg"
SPLASH_SRC = r"C:\Users\Alex\.gemini\antigravity-ide\brain\4195d9e7-1b98-4bd9-9c90-37794939842d\animafind_splash_art_1793095889366.jpg"

ROOT_DIR = r"c:\Users\Alex\Desktop\AnimaFind"

def make_round(im):
    size = im.size
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size[0], size[1]), fill=255)
    output = Image.new('RGBA', size, (0, 0, 0, 0))
    output.paste(im.convert('RGBA'), (0, 0), mask=mask)
    return output

def main():
    icon_im = Image.open(ICON_SRC).convert('RGB')
    splash_im = Image.open(SPLASH_SRC).convert('RGB')

    print("Processing iOS App Icon (1024x1024 RGB without alpha)...")
    ios_icon_path = os.path.join(ROOT_DIR, "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset", "AppIcon-512@2x.png")
    os.makedirs(os.path.dirname(ios_icon_path), exist_ok=True)
    icon_1024 = icon_im.resize((1024, 1024), Image.Resampling.LANCZOS)
    icon_1024.save(ios_icon_path, "PNG")

    print("Processing iOS Splash Screens...")
    ios_splash_dir = os.path.join(ROOT_DIR, "ios", "App", "App", "Assets.xcassets", "Splash.imageset")
    os.makedirs(ios_splash_dir, exist_ok=True)
    for fn in ["splash-2732x2732-2.png", "splash-2732x2732-1.png", "splash-2732x2732.png"]:
        p = os.path.join(ios_splash_dir, fn)
        # Create a square splash with centered splash graphic on #f7f1e3
        bg = Image.new('RGB', (2732, 2732), (247, 241, 227))
        # resize splash_im keeping aspect ratio
        ratio = 2732 / splash_im.height
        new_w = int(splash_im.width * ratio)
        new_h = 2732
        scaled = splash_im.resize((new_w, new_h), Image.Resampling.LANCZOS)
        offset_x = (2732 - new_w) // 2
        bg.paste(scaled, (offset_x, 0))
        bg.save(p, "PNG")

    print("Processing Android Mipmaps...")
    res_dir = os.path.join(ROOT_DIR, "android", "app", "src", "main", "res")
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }

    for folder, (icon_sz, fore_sz) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # ic_launcher.png (square)
        sq = icon_im.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        sq.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        
        # ic_launcher_round.png (circle)
        rd = make_round(sq)
        rd.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        
        # ic_launcher_foreground.png (for adaptive icon)
        # Foreground should have some padding around the main badge
        fore = Image.new('RGBA', (fore_sz, fore_sz), (0, 0, 0, 0))
        badge_sz = int(fore_sz * 0.72)
        badge = icon_im.resize((badge_sz, badge_sz), Image.Resampling.LANCZOS).convert('RGBA')
        pad = (fore_sz - badge_sz) // 2
        fore.paste(badge, (pad, pad))
        fore.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

    print("Processing Android Splash Drawables...")
    port_densities = {
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
    }
    for folder, (w, h) in port_densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        bg = Image.new('RGB', (w, h), (247, 241, 227))
        # fit splash into w, h
        ratio = min(w / splash_im.width, h / splash_im.height)
        nw, nh = int(splash_im.width * ratio), int(splash_im.height * ratio)
        scaled = splash_im.resize((nw, nh), Image.Resampling.LANCZOS)
        bg.paste(scaled, ((w - nw) // 2, (h - nh) // 2))
        bg.save(os.path.join(folder_path, "splash.png"), "PNG")

    land_densities = {
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280),
    }
    for folder, (w, h) in land_densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        bg = Image.new('RGB', (w, h), (247, 241, 227))
        ratio = min(w / splash_im.width, h / splash_im.height)
        nw, nh = int(splash_im.width * ratio), int(splash_im.height * ratio)
        scaled = splash_im.resize((nw, nh), Image.Resampling.LANCZOS)
        bg.paste(scaled, ((w - nw) // 2, (h - nh) // 2))
        bg.save(os.path.join(folder_path, "splash.png"), "PNG")

    # default drawable
    drawable_dir = os.path.join(res_dir, "drawable")
    os.makedirs(drawable_dir, exist_ok=True)
    splash_default = splash_im.resize((480, 800), Image.Resampling.LANCZOS)
    splash_default.save(os.path.join(drawable_dir, "splash.png"), "PNG")

    print("Processing Web / PWA icons...")
    public_dir = os.path.join(ROOT_DIR, "public")
    icon_512 = icon_im.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(os.path.join(public_dir, "icon-512.png"), "PNG")
    
    icon_192 = icon_im.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(public_dir, "icon-192.png"), "PNG")
    
    icon_apple = icon_im.resize((180, 180), Image.Resampling.LANCZOS)
    icon_apple.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

    icon_fav = icon_im.resize((64, 64), Image.Resampling.LANCZOS)
    icon_fav.save(os.path.join(public_dir, "favicon.png"), "PNG")

    print("All production icons and splash graphics successfully generated!")

if __name__ == "__main__":
    main()

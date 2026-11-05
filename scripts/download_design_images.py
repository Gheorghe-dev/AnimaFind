import glob
import re
import os
import urllib.request
import hashlib

def main():
    target_dir = os.path.join("public", "images", "stitch")
    os.makedirs(target_dir, exist_ok=True)

    urls = {}
    for html_file in glob.glob("public/design/**/*.html", recursive=True):
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()
            # find all img src and background-image urls with their surrounding context/alt
            matches = re.findall(r'data-alt="([^"]*)"[^>]*src="([^"]+)"', content)
            for alt, u in matches:
                if "lh3.googleusercontent.com" in u:
                    urls[u] = alt
            
            # also style background-image
            bg_matches = re.findall(r'style="background-image:\s*url\(\'([^\']+)\'\)"', content)
            for u in bg_matches:
                if "lh3.googleusercontent.com" in u and u not in urls:
                    urls[u] = "background_view"

            # and any other direct src
            src_matches = re.findall(r'src="(https://lh3\.googleusercontent\.com/aida-public/[^"]+)"', content)
            for u in src_matches:
                if u not in urls:
                    urls[u] = "asset"

    print(f"Discovered {len(urls)} assets to download:")
    manifest = {}
    for i, (url, description) in enumerate(urls.items()):
        url_hash = hashlib.md5(url.encode("utf-8")).hexdigest()[:8]
        # create friendly name
        slug = re.sub(r'[^a-zA-Z0-9]+', '_', description.strip()[:30]).strip('_').lower()
        if not slug:
            slug = f"asset_{i}"
        filename = f"{slug}_{url_hash}.png"
        filepath = os.path.join(target_dir, filename)

        print(f"[{i+1}/{len(urls)}] Downloading {filename}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                with open(filepath, 'wb') as out_f:
                    out_f.write(resp.read())
            manifest[url] = f"/images/stitch/{filename}"
            print(f"  -> Saved {filepath} ({os.path.getsize(filepath)} bytes)")
        except Exception as e:
            print(f"  -> Error: {e}")

    # Write manifest json
    import json
    with open(os.path.join(target_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print("Done! Manifest saved.")

if __name__ == "__main__":
    main()

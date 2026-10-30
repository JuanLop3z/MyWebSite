"""Refresh asset URLs so browsers do not reuse files from an older deployment."""

from hashlib import sha256
from pathlib import Path
import re


def main():
    root = Path(__file__).resolve().parent.parent
    entry = root / "index.html"
    html = entry.read_text(encoding="utf-8-sig")

    for asset in (
        "assets/css/styles.css",
        "assets/css/effects.css",
        "assets/css/shake.css",
        "assets/js/main.js",
        "assets/js/effects.js",
        "assets/js/shake.js",
        "assets/images/favicon.svg",
    ):
        content = (root / asset).read_text(encoding="utf-8-sig")
        version = sha256(content.encode("utf-8")).hexdigest()[:12]
        pattern = rf'(\b(?:href|src)="){re.escape(asset)}(?:\?v=[^"\s]+)?(")'
        replacement = rf'\g<1>{asset}?v={version}\g<2>'
        html, matches = re.subn(pattern, replacement, html)
        if matches != 1:
            raise ValueError(f"Expected one HTML reference for {asset}, got {matches}")
        print(f"{asset}?v={version}")

    entry.write_text(html, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()

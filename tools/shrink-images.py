"""把手机/微信里的原图压成网页用的图，输出到 images/ 并剥掉 EXIF（含拍摄位置）。

用法：python tools/shrink-images.py "C:\\路径\\a.jpg" "C:\\路径\\b.jpg"
跑完会打印可以直接粘进 data.js 的 image 那一行。
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "images"
MAX_WIDTH = 1600
QUALITY = 82


def main():
    files = [Path(a) for a in sys.argv[1:]]
    if not files:
        sys.exit('用法：python tools/shrink-images.py "图片1" "图片2" …')
    OUT.mkdir(exist_ok=True)

    for src in files:
        if not src.is_file():
            print("跳过，找不到文件：" + str(src))
            continue
        im = Image.open(src)
        im = ImageOps.exif_transpose(im)  # 先按 EXIF 转正，再丢掉元数据
        if im.width > MAX_WIDTH:
            im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
        im = im.convert("RGB")
        dst = OUT / (src.stem.lower() + ".jpg")
        im.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        kb = dst.stat().st_size // 1024
        print("已生成 %s（%dx%d，%d KB）  →  data.js 里写 image: \"images/%s\""
              % (dst.name, im.width, im.height, kb, dst.name))


main()

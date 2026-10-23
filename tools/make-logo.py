"""从会徽原图生成 assets/logo.png：裁掉白底，按圆形抠图。

用法：python tools/make-logo.py "C:\\路径\\会徽.jpg"
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "logo.png"


def main():
    if len(sys.argv) < 2:
        sys.exit('用法：python tools/make-logo.py "会徽图片路径"')
    src = Path(sys.argv[1])
    if not src.is_file():
        sys.exit("找不到图片：" + str(src))

    im = Image.open(src).convert("RGB")
    # 近白像素视为背景，用来求会徽的实际占位范围
    mask = im.convert("L").point(lambda v: 0 if v > 235 else 255)
    box = mask.getbbox()
    if not box:
        sys.exit("整张图都是白的，没找到会徽。")

    x0, y0, x1, y1 = box
    side = max(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    left = max(0, int(round(cx - side / 2)))
    top = max(0, int(round(cy - side / 2)))
    right = min(im.width, left + side)
    bottom = min(im.height, top + side)
    logo = im.crop((left, top, right, bottom))
    if logo.width != logo.height:
        edge = max(logo.size)
        pad = Image.new("RGB", (edge, edge), (255, 255, 255))
        pad.paste(logo, ((edge - logo.width) // 2, (edge - logo.height) // 2))
        logo = pad

    # 4 倍尺寸画圆再缩回来，边缘不会有锯齿
    n = logo.width
    big = Image.new("L", (n * 4, n * 4), 0)
    ImageDraw.Draw(big).ellipse((0, 0, n * 4 - 1, n * 4 - 1), fill=255)
    logo.putalpha(big.resize((n, n), Image.LANCZOS))
    logo.save(OUT, optimize=True)
    print("已生成 %s（%dx%d）" % (OUT, n, n))


main()

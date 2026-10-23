import zipfile, re, json, datetime
import xml.etree.ElementTree as ET

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "source-table.xlsx")
OUT = os.path.join(ROOT, "assets", "awards.js")
NAME_CUTOFF = 2024

z = zipfile.ZipFile(SRC)
shared = []
if "xl/sharedStrings.xml" in z.namelist():
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    for si in root.findall(NS + "si"):
        shared.append("".join(t.text or "" for t in si.iter(NS + "t")))

wb = ET.fromstring(z.read("xl/workbook.xml"))
names = [s.get("name") for s in wb.iter(NS + "sheet")]
files = sorted(
    [n for n in z.namelist() if re.match(r"xl/worksheets/sheet\d+\.xml$", n)],
    key=lambda n: int(re.search(r"(\d+)", n).group(1)),
)

def letters(ref):
    m = re.match(r"([A-Z]+)", ref)
    return m.group(1) if m else "A"

def cidx(ls):
    v = 0
    for ch in ls:
        v = v * 26 + (ord(ch) - 64)
    return v - 1

def serial_date(v):
    try:
        n = float(v)
    except (TypeError, ValueError):
        return None
    if not (20000 < n < 60000):
        return None
    return datetime.date(1899, 12, 30) + datetime.timedelta(days=int(n))

def clean(s):
    return " ".join(str(s).split()).strip()

def tail(s):
    return re.sub(r"[.\s]+$", "", s)

def names_str(s):
    s = clean(s)
    s = re.sub(r"\s+", "", s)
    s = s.replace(",", "、").replace("，", "、")
    s = re.sub(r"、+", "、", s)
    return s.strip("、")

def norm_time(v):
    d = serial_date(v)
    if d:
        return "%04d-%02d" % (d.year, d.month), d.year
    s = tail(clean(v))
    m = re.match(r"^(\d{4})[.\-/年]?(\d{1,2})?", s)
    if m:
        y = int(m.group(1))
        mo = m.group(2)
        return ("%04d-%02d" % (y, int(mo))) if mo else str(y), y
    return s, None

rows_of = {}
for i, f in enumerate(files):
    label = names[i] if i < len(names) else f
    root = ET.fromstring(z.read(f))
    rows = []
    for r in root.iter(NS + "row"):
        cells = {}
        for c in r.findall(NS + "c"):
            t, v = c.get("t"), c.find(NS + "v")
            isel = c.find(NS + "is")
            if t == "s" and v is not None:
                val = shared[int(v.text)]
            elif t == "inlineStr" and isel is not None:
                val = "".join(x.text or "" for x in isel.iter(NS + "t"))
            elif v is not None:
                val = v.text or ""
            else:
                val = ""
            val = " ".join(str(val).split())
            if val:
                cells[cidx(letters(c.get("r", "A1")))] = val
        width = (max(cells) + 1) if cells else 0
        rows.append([cells.get(j, "") for j in range(width)])
    rows_of[label] = rows

def cell(rows, ri, ci):
    if ri < len(rows) and ci < len(rows[ri]):
        return rows[ri][ci]
    return ""

def block_starts(rows):
    return [ci for ci, v in enumerate(rows[1]) if clean(v) == "序号"]

def level_of(award):
    a = award or ""
    if a.startswith("国家") or a.startswith("国"):
        return "国家级"
    if "东北" in a or "赛区" in a:
        return "赛区"
    if a.startswith("省"):
        return "省级"
    return "其他"

contest = []
contest_warnings = []
rows = rows_of["比赛2017~2021"]
for ci in block_starts(rows):
    block_label = clean(cell(rows, 0, ci))
    block_year = re.match(r"(\d{4})", block_label)
    block_year = int(block_year.group(1)) if block_year else None
    for ri in range(3, len(rows)):
        raw_students = cell(rows, ri, ci + 1)
        event = tail(clean(cell(rows, ri, ci + 3)))
        if not clean(raw_students) and not event:
            continue
        date, y = norm_time(cell(rows, ri, ci + 5))
        year = y or block_year
        if year is None:
            contest_warnings.append("无法定年时间: %s" % event)
            continue
        if block_year is None:
            contest_warnings.append("第 %d 列块无年份标签，按时间列判为 %d 年" % (ci, year))
            block_year = year
        if block_year and year and abs(year - block_year) > 2:
            contest_warnings.append("时间与分块年份不符: %s (%s)" % (event, date))
        award = tail(clean(cell(rows, ri, ci + 4)))
        teacher = names_str(cell(rows, ri, ci + 2))
        if teacher and not re.search(r"[、，,\s]", teacher) and len(teacher) > 6:
            contest_warnings.append("导师姓名可能粘连: %s" % teacher)
        students = names_str(raw_students) if year >= NAME_CUTOFF else ""
        contest.append({
            "y": year,
            "date": date if isinstance(date, str) else str(date),
            "event": event,
            "award": award,
            "level": level_of(award),
            "team": students,
            "teacher": teacher,
        })

contest.sort(key=lambda r: (r["y"], r["date"]), reverse=True)

ip_rows = rows_of["科研项目"]
ip = []
starts = block_starts(ip_rows)
for bi, ci in enumerate(starts):
    end = starts[bi + 1] if bi + 1 < len(starts) else max(len(r) for r in ip_rows)
    kind = tail(clean(cell(ip_rows, 0, ci)))
    items = []
    for ri in range(2, len(ip_rows)):
        student = clean(cell(ip_rows, ri, ci + 1))
        nm = tail(clean(cell(ip_rows, ri, ci + 3)))
        if not nm or student == "姓 名":
            continue
        rest = [tail(clean(cell(ip_rows, ri, j))) for j in range(ci + 4, end)]
        items.append({"name": nm, "rest": [x for x in rest if x]})
    if not items:
        continue
    years = []
    for it in items:
        nums = re.findall(r"(?:ZL|SR)?((?:20\d{2})\d*)", " ".join([it["name"]] + it["rest"]))
        yr = None
        for n in nums:
            if len(n) >= 4 and 2015 <= int(n[:4]) <= 2030:
                yr = n[:4]
                break
        if not yr:
            for x in it["rest"]:
                m = re.search(r"(20\d{2})", x)
                if m:
                    yr = m.group(1)
                    break
        if yr:
            years.append(yr)
    entry = {"kind": kind, "count": len(items)}
    entry["years"] = "、".join(sorted(set(years))) if years else "未标注"
    if kind == "科研项目":
        entry["items"] = [{"name": it["name"], "source": (it["rest"][0] if it["rest"] else "")} for it in items]
    ip.append(entry)

by_level, by_year = {}, {}
for r in contest:
    by_level[r["level"]] = by_level.get(r["level"], 0) + 1
    by_year[str(r["y"])] = by_year.get(str(r["y"]), 0) + 1
ys = sorted(by_year, key=int)
stats = {
    "total": len(contest),
    "span": ("%s—%s" % (ys[0], ys[-1])) if ys else "",
    "byLevel": by_level,
    "byYear": by_year,
}

def js(obj, indent=0):
    pad = "  " * indent
    if isinstance(obj, dict):
        parts = []
        for k, v in obj.items():
            parts.append("%s  %s: %s" % (pad, k, js(v, indent + 1)))
        return "{\n" + ",\n".join(parts) + "\n" + pad + "}"
    if isinstance(obj, list):
        if obj and isinstance(obj[0], dict):
            parts = ["%s  %s" % (pad, js(v, indent + 1)) for v in obj]
            return "[\n" + ",\n".join(parts) + "\n" + pad + "]"
        return "[" + ", ".join(js(v, 0) for v in obj) + "]"
    return json.dumps(obj, ensure_ascii=False)

payload = {
    "generated": "2026-10-23",
    "source": "光电科技协会比赛专利论文项目统计总表",
    "nameCutoff": NAME_CUTOFF,
    "stats": stats,
    "contest": contest,
    "ip": ip,
}
header = (
    "// 由统计总表生成，不要手工大改；表更新后重新生成。\n"
    "// 生成日期见 generated 字段。%d 年以前的记录已剔除学生姓名。\n" % NAME_CUTOFF
)
with open(OUT, "w", encoding="utf-8", newline="\n") as fh:
    fh.write(header)
    fh.write("window.AWARDS = ")
    fh.write(js(payload))
    fh.write(";\n")

print("记录:", stats["total"], stats["span"], json.dumps(by_level, ensure_ascii=False))
print("按年:", json.dumps(dict(sorted(by_year.items())), ensure_ascii=False))
print("知识产权:", json.dumps([{k: v for k, v in e.items() if k != "items"} for e in ip], ensure_ascii=False))
print("告警 %d 条:" % len(set(contest_warnings)))
for w in sorted(set(contest_warnings)):
    print("  -", w)

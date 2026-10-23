# 光电科技协会 · 官网

长春电子科技学院光电科技协会的网站。纯静态：HTML + CSS + JavaScript，
不需要构建工具，不需要装 Node。

板块：**关于我们（含指导老师、各届会长）** · **通知公告**（`news.html` + 单篇 `post.html`）
· **活动与竞赛** · **成果与荣誉**（首页精选）· **协会掠影**（现场照片，暂时收起，见下）
· **成果清单**（`achievements.html`，完整记录按年份分组）。

`about.advisors` 留空数组时，「指导老师」那一栏整块不显示；填上一条就自动出现。
`about.leaders` 同理，控制「各届会长」这一栏。
`works` 这块现在装的是集体荣誉、学生科研项目、获奖记录，也照样能放具体作品，
字段 `kind` 写什么标签就显示什么。

## 本地预览

双击 `index.html` 用浏览器打开即可，改完按 F5 刷新。清单页单独打开 `achievements.html`。

## 改内容

全部集中在 [assets/data.js](assets/data.js)，用记事本或任意编辑器打开，改引号里的文字：

| 位置 | 作用 |
| --- | --- |
| `name` / `shortName` | 协会全称、导航左侧的缩写标记（填了 `logo` 就改用会徽图） |
| `logo` | 会徽图片路径，如 `assets/logo.png`；同时用作页首标志和浏览器标签页小图标 |
| `school` | 校名，出现在页首小标签和页脚 |
| `tagline` / `intro` | 首页大标题、介绍段 |
| `title` / `description` | 浏览器标签页文字、搜索结果里的摘要 |
| `nav` | 顶部导航（要和页面里的板块 `id` 对上） |
| `about.paragraphs` | 「关于我们」的段落，数组里一项就是一段 |
| `about.advisors` | 指导老师：`name` 姓名、`title` 职称或身份、`note` 补充 |
| `about.leaders` | 各届会长：`note` 底部备注、`terms` 每届一项（`year` 届别、`label` 头衔说明、`members` 里的 `name` 姓名 + `major` 专业） |
| `events` | 活动与竞赛：`date` 时间、`kind` 类型标签、`name` 名称、`summary` 说明、`result` 成绩、`link` 详情链接 |
| `works` | 成果作品：`title`、`year`、`kind`、`team` 作者或队伍、`summary`、`award` 获奖、`image` 封面、`link` |
| `gallery` | 协会掠影：`date` 时间、`image` 照片路径、`caption` 一句话说明。**现在整段被 `/* */` 注释掉了**，首页这块和顶部导航里那一项会自动消失；照片放回 `images/` 再取消注释就回来了 |
| `contact` | `email` 邮箱、`wechat` 公众号或微信号、`address` 实验室地址、`joinNote` 招新说明 |

字段留空字符串就不会显示，不会报错。现在文件里带 **（待补）** 的都需要换成真实信息。
通知和文章不在这个文件里，见下面「发通知和文章」。

**加图片**：手机或微信里的原图动辄好几 MB，直接放进来会拖慢首页。用
[tools/shrink-images.py](tools/shrink-images.py) 压一遍——它会缩到 1600 px 宽、存进 `images/`，
并且去掉 EXIF（拍摄时间、手机型号、**拍照地点**这些隐私信息都藏在里面）：

```
python tools/shrink-images.py "C:\路径\活动照片.jpg"
```

跑完把打印出来的那行 `image: "images/xxx.jpg"` 粘到 `data.js` 对应条目里就行。
文件名别用空格和中文，按 `2026-05.jpg` 这样带日期起名最好认。

**换会徽**：`assets/logo.png` 不是原图直接改名，是用 [tools/make-logo.py](tools/make-logo.py)
裁出来的——自动去白边、按圆形抠图，所以在深色背景上不会有白色方块。拿到新的会徽图后重跑一次：

```
python tools/make-logo.py "C:\路径\新会徽.jpg"
```

跑之前需要装一次 Pillow：`pip install pillow`。原图越大越清楚，
首页会徽显示约 116 px、页首 42 px，原图有 300 px 以上就够用了。

**换届改会长名单**：`data.js` 里 `about.leaders.terms` 一项就是一届，`year` 是届别、
`members` 里每人 `name` 姓名加 `major` 专业。页面按 `year` 从大到小排，只把最新一届摊开显示，
其余收在「查看往届」按钮里——所以换届时新增一项 `year: "2027"` 放哪都行，不用动别的地方。
`label` 是届别后面那个小标签（「会长及副会长」，只有一位会长时写「会长」）；
底部那行小字是 `note`，留空字符串就不显示。

**改配色**：[assets/styles.css](assets/styles.css) 顶部 `:root`——
`--a1` 是青色主强调，`--a2` 是蓝色，两者组成按钮与标题的渐变；
`--bg` 是深蓝底，`--surface` 是卡片底色，`--radius` 控制圆角。

## 发通知和文章

通知的内容在 [assets/posts.js](assets/posts.js)，和 `data.js` 一样用记事本打开改文字，
保存后刷新页面就生效。三个地方共用这一份数据：首页「通知公告」只显示最新 3 条，
`news.html` 是全部列表，`post.html?id=编号` 是单篇正文。

一条通知长这样，复制一份改文字就是发新通知：

```js
{
  id: "2026-10-23-zhaoxin",   // 唯一编号，建议「日期-拼音」，别和别的重复
  date: "2026-10-23",         // 排序按这个来，写成 年-月-日
  kind: "通知",                // 小标签，写 通知 / 招新 / 活动 / 喜报 都行
  pinned: true,               // 置顶，一直排最前面；不用就删掉这行
  title: "2026 级新成员招募开始",
  summary: "一句话摘要，列表页显示在标题下面。",
  image: "",                  // 要配图就写 "images/xxx.jpg"
  body: [
    "正文里每一项就是一段，直接写句子。",
    { h: "小标题" },
    { list: ["要列的第一条", "要列的第二条"] },
    { img: "images/xxx.jpg", caption: "图下的说明文字，图片点开能看大图。" }
  ]
}
```

新通知写在数组最前面就行（`pinned` 的那条自己会排到最前）。
现在文件里那条「即将出发：第七届吉林省大学生人工智能创新大赛」是真实通知，
可以直接照着它的写法抄。

## 成果清单与 Excel 总表

`achievements.html` 是完整获奖清单页，数据来自 [assets/awards.js](assets/awards.js)，
而这个文件是用 [tools/regenerate-awards.py](tools/regenerate-awards.py) 从协会的
《比赛专利论文项目统计总表》Excel 生成的。**表更新了不要手工一条条改 awards.js**，重跑一次：

```
python tools/regenerate-awards.py "C:\路径\光电科技协会比赛专利论文项目统计总表.xlsx"
```

脚本会打印记录总数、按年与按等级的统计，以及它拿不准的地方（比如某一列没写年份标签）。
跑完刷新页面即可，首页的统计行和「高规格奖项」卡片会跟着变。

站点当前的三条口径，写在脚本里也写在页面上：

- 只公布 **2024 年及以后**记录的学生姓名，更早的只显示赛事、奖项、年份和指导教师；
  要改这个界限，编辑脚本顶部的 `NAME_CUTOFF = 2024`。
- **论文与软著不列篇目和作者**，只显示数量和年份；科研项目保留课题名称与来源，不显示学生。
- 同一队伍在赛区和国赛各获奖一次，算两条记录，不是重复。

首页 `works` 里那四条（优秀学术类社团、科创计划、建昭奖学金、会员奖学金）是手写的集体荣誉，
在 [assets/data.js](assets/data.js) 里直接改，不受脚本影响。

## 上线（GitHub Pages）

1. 在 [github.com](https://github.com/new) 新建仓库，选 **Public**（免费 Pages 要求公开）。
   注意：仓库公开意味着代码、文案、图片谁都能看到，而且搜索引擎会收录，删掉也未必来得及。
   **带同学正脸的四张活动照已经移出本目录**，放在桌面 `协会照片（暂不公开）` 里，所以现在这个文件夹
   里没有人脸照片。哪天确认过本人和学院都没意见，再按 `assets/data.js` 里 `gallery` 那段的说明放回去。
2. 在本目录执行（`地址` 换成你自己仓库的地址）：

   ```
   git init
   git add .
   git commit -m "协会官网第一版"
   git branch -M main
   git remote add origin 地址
   git push -u origin main
   ```

3. 仓库 → **Settings** → **Pages** → Source 选 **Deploy from a branch** →
   分支 `main`、目录 `/ (root)` → **Save**。
4. 一两分钟后访问 `https://<用户名>.github.io/<仓库名>/`。

之后每次更新：改 `data.js` → `git add . && git commit -m "改了什么" && git push`，约 1 分钟生效。

## 想挂学校域名

`xxx.edu.cn` 这类域名要走学校网络中心审批和 ICP 备案，个人这边申请不了。
两种常见做法：向学院申请二级域名并把本仓库的构建产物交给学校服务器；
或先用 GitHub Pages 的地址对外宣传，同时买个独立域名绑上来（约 50–100 元/年）。

## 备注

- 保留根目录的 `.nojekyll`，否则以后添加以下划线 `_` 开头的文件会被发布流程跳过。
- 换托管平台（Cloudflare Pages、Netlify 等）时整个仓库直接连过去，代码不用改。

(function () {
  var S = window.SITE || {};

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function safeHref(url) {
    if (!url) return null;
    return /^(https?:|mailto:|#|\/|\.)/i.test(url) ? url : null;
  }

  function external(a) {
    if (/^https?:/i.test(a.href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }

  function bind() {
    var fields = {
      name: S.name,
      shortName: S.shortName,
      school: S.school,
      tagline: S.tagline,
      intro: S.intro
    };
    document.querySelectorAll("[data-bind]").forEach(function (node) {
      var key = node.getAttribute("data-bind");
      if (fields[key]) node.textContent = fields[key];
    });
    document.title = document.body.getAttribute("data-page-title")
      || S.title
      || (S.name ? S.name + " · " + (S.school || "") : "协会主页");
    if (S.description) {
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", S.description);
    }
  }

  function logoImg(className, alt) {
    if (!S.logo) return null;
    var img = document.createElement("img");
    img.className = className;
    img.src = S.logo;
    img.alt = alt;
    img.onerror = function () { img.remove(); };
    return img;
  }

  function renderBrand() {
    var alt = (S.name || "协会") + "会徽";
    var mark = document.querySelector(".brand-mark");
    var headLogo = mark && logoImg("brand-logo", alt);
    if (headLogo) mark.replaceWith(headLogo);

    var hero = document.getElementById("hero-logo");
    var bigLogo = hero && logoImg("hero-logo-img", alt);
    if (bigLogo) hero.appendChild(bigLogo);
    if (!headLogo && !bigLogo) return;

    var icon = document.querySelector('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = S.logo;
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    if (!nav || !S.nav) return;
    var onIndex = /(^|\/)index\.html$/i.test(location.pathname) || /\/$/.test(location.pathname);
    S.nav.forEach(function (item) {
      var a = el("a", null, item.label);
      var href = item.href || item.url || "#";
      if (!onIndex && href.charAt(0) === "#") href = "index.html" + href;
      a.href = href;
      nav.appendChild(a);
    });
  }

  function renderLeaders(box, leaders) {
    var terms = (leaders.terms || []).slice().sort(function (a, b) {
      return String(b.year || "").localeCompare(String(a.year || ""));
    });
    if (!terms.length) return;
    box.appendChild(el("h3", "sub-title", "各届会长"));

    var latest = el("div", "leader-terms");
    var past = el("div", "leader-past");
    past.hidden = true;

    terms.forEach(function (t, i) {
      var wrap = el("div", "leader-term");
      var head = el("p", "leader-head");
      head.appendChild(el("span", "leader-year", (t.year || "") + " 届"));
      if (t.label) head.appendChild(el("span", "leader-label", t.label));
      wrap.appendChild(head);

      var list = el("ul", "leader-list");
      (t.members || []).forEach(function (m) {
        if (!m.name) return;
        var li = el("li", "leader");
        li.appendChild(el("span", "leader-name", m.name));
        if (m.major) li.appendChild(el("span", "leader-major", m.major));
        list.appendChild(li);
      });
      wrap.appendChild(list);
      (i === 0 ? latest : past).appendChild(wrap);
    });

    box.appendChild(latest);

    var count = past.children.length;
    if (count) {
      var btn = el("button", "leaders-toggle");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "查看往届（" + count + " 届）";
      btn.addEventListener("click", function () {
        var open = past.hidden;
        past.hidden = !open;
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.textContent = open ? "收起往届" : "查看往届（" + count + " 届）";
      });
      box.appendChild(btn);
      box.appendChild(past);
    }

    if (leaders.note) box.appendChild(el("p", "leaders-note", leaders.note));
  }

  function renderAbout() {
    var body = document.getElementById("about-body");
    var box = document.getElementById("advisors");
    var about = S.about || {};
    if (body) {
      (about.paragraphs || []).forEach(function (para) {
        body.appendChild(el("p", null, para));
      });
    }
    if (!box) return;
    if (about.advisors && about.advisors.length) {
      box.appendChild(el("h3", "sub-title", "指导老师"));
      var list = el("ul", "advisor-list");
      about.advisors.forEach(function (p) {
        if (!p.name) return;
        var li = el("li", "advisor");
        li.appendChild(el("span", "advisor-name", p.name));
        if (p.title) li.appendChild(el("span", "advisor-title", p.title));
        if (p.note) li.appendChild(el("p", "advisor-note", p.note));
        list.appendChild(li);
      });
      box.appendChild(list);
    }
    renderLeaders(box, about.leaders || {});
  }

  function renderEvents() {
    var list = document.getElementById("events-list");
    var empty = document.getElementById("events-empty");
    if (!list) return;
    var events = S.events || [];
    events.forEach(function (e) {
      var li = el("li", "event");
      li.appendChild(el("span", "event-date", e.date || ""));
      var main = el("div", "event-main");
      var head = el("p", "event-head");
      if (e.kind) head.appendChild(el("span", "chip", e.kind));
      var name = el("span", "event-name");
      var href = safeHref(e.link);
      if (href) {
        var a = el("a", null, e.name || "");
        a.href = href;
        name.appendChild(external(a));
      } else {
        name.textContent = e.name || "";
      }
      head.appendChild(name);
      main.appendChild(head);
      if (e.summary) main.appendChild(el("p", "event-summary", e.summary));
      li.appendChild(main);
      if (e.result) li.appendChild(el("span", "event-result", e.result));
      list.appendChild(li);
    });
    if (empty) empty.hidden = events.length > 0;
  }

  function renderWorks() {
    var grid = document.getElementById("works-grid");
    var empty = document.getElementById("works-empty");
    if (!grid) return;
    var works = S.works || [];
    works.forEach(function (w) {
      var card = el("article", "card");

      if (w.image) {
        var media = el("div", "card-media");
        var img = document.createElement("img");
        img.src = w.image;
        img.alt = w.title || "";
        img.loading = "lazy";
        media.appendChild(img);
        card.appendChild(media);
      }

      var body = el("div", "card-body");
      var meta = el("p", "card-meta");
      if (w.kind) meta.appendChild(el("span", null, w.kind));
      if (w.kind && w.year) meta.appendChild(el("span", "dot", "/"));
      if (w.year) meta.appendChild(el("span", null, w.year));
      body.appendChild(meta);

      var title = el("h3", "card-title");
      var href = safeHref(w.link);
      if (href) {
        var a = el("a", null, w.title || "");
        a.href = href;
        title.appendChild(external(a));
      } else {
        title.textContent = w.title || "";
      }
      body.appendChild(title);

      if (w.summary) body.appendChild(el("p", "card-summary", w.summary));
      if (w.team) body.appendChild(el("p", "card-team", w.team));
      if (w.award) body.appendChild(el("p", "card-award", w.award));
      card.appendChild(body);
      grid.appendChild(card);
    });
    if (empty) empty.hidden = works.length > 0;
  }

  function renderFoot() {
    var box = document.getElementById("foot-info");
    var c = S.contact || {};
    if (box) {
      var row = el("p", "foot-row");
      if (c.email) {
        var mail = el("a", "foot-link", c.email);
        mail.href = "mailto:" + c.email;
        row.appendChild(mail);
      }
      if (c.wechat) row.appendChild(el("span", "foot-item", "微信：" + c.wechat));
      if (c.address) row.appendChild(el("span", "foot-item", c.address));
      if (row.childNodes.length) box.appendChild(row);
    }
    if (c.joinNote) {
      var join = document.createElement("p");
      join.className = "foot-join";
      join.textContent = c.joinNote;
      if (box) box.appendChild(join);
    }
  }

  function renderGallery() {
    var grid = document.getElementById("gallery-grid");
    var empty = document.getElementById("gallery-empty");
    if (!grid) return;
    (S.gallery || []).forEach(function (p) {
      if (!p.image) return;
      var fig = el("figure", "photo");
      var img = document.createElement("img");
      img.src = p.image;
      img.alt = p.caption || p.date || "协会照片";
      img.loading = "lazy";
      fig.appendChild(img);
      var cap = el("figcaption", "photo-cap");
      if (p.date) cap.appendChild(el("span", "photo-date", p.date));
      if (p.caption) cap.appendChild(el("span", null, p.caption));
      fig.appendChild(cap);
      grid.appendChild(fig);
    });
    if (empty) empty.hidden = grid.childNodes.length > 0;
    if (grid.childNodes.length) return;

    var section = document.getElementById("gallery");
    if (section) section.hidden = true;
    Array.prototype.forEach.call(
      document.querySelectorAll("#nav a"),
      function (a) {
        if (/#gallery$/.test(a.getAttribute("href") || "")) a.hidden = true;
      }
    );
  }

  function sortedPosts() {
    return (window.POSTS || []).slice().sort(function (a, b) {
      return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        String(b.date || "").localeCompare(String(a.date || ""));
    });
  }

  function fmtDate(d) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(d || "");
    return m ? m[1] + " 年 " + Number(m[2]) + " 月 " + Number(m[3]) + " 日" : (d || "");
  }

  function postHref(p) {
    return "post.html?id=" + encodeURIComponent(p.id);
  }

  function noticeRow(p) {
    var li = el("li", "notice");
    li.appendChild(el("span", "notice-date", fmtDate(p.date)));
    var main = el("div", "notice-main");
    var head = el("p", "notice-head");
    if (p.kind) head.appendChild(el("span", "chip", p.kind));
    if (p.pinned) head.appendChild(el("span", "pin", "置顶"));
    var a = el("a", "notice-title", p.title || "（未命名）");
    a.href = postHref(p);
    head.appendChild(a);
    main.appendChild(head);
    if (p.summary) main.appendChild(el("p", "notice-summary", p.summary));
    li.appendChild(main);
    return li;
  }

  function renderNotices() {
    var list = document.getElementById("notice-list");
    if (!list) return;
    var posts = sortedPosts();
    posts.slice(0, 3).forEach(function (p) { list.appendChild(noticeRow(p)); });
    var empty = document.getElementById("notice-empty");
    if (empty) empty.hidden = posts.length > 0;
    var more = document.getElementById("notice-more");
    if (more) {
      var link = more.querySelector("a");
      if (link) link.textContent = "查看全部 " + posts.length + " 条通知 →";
      more.hidden = posts.length === 0;
    }
  }

  function awardRank(r) {
    if (r.level === "国家级") return 0;
    if (/一等奖|金奖|金牌/.test(r.award)) return 1;
    return 2;
  }

  function featuredList(limit) {
    var A = window.AWARDS;
    if (!A || !A.contest) return [];
    return A.contest
      .filter(function (r) { return r.y >= A.nameCutoff && awardRank(r) < 2; })
      .sort(function (a, b) { return awardRank(a) - awardRank(b) || b.y - a.y; })
      .slice(0, limit);
  }

  function renderWorksSummary() {
    var A = window.AWARDS;
    var box = document.getElementById("award-stats");
    if (!A || !box || !A.stats) return;
    var lv = A.stats.byLevel || {};
    box.textContent =
      A.stats.span + " 年累计获奖 " + A.stats.total + " 项，其中国家级 " + (lv["国家级"] || 0) +
      " 项、省级 " + (lv["省级"] || 0) + " 项、赛区 " + (lv["赛区"] || 0) + " 项。";
    var more = document.getElementById("works-more");
    if (more) {
      var link = more.querySelector("a");
      if (link) link.textContent = "查看全部 " + A.stats.total + " 条获奖记录 →";
      more.hidden = false;
    }
  }

  function renderFeatured() {
    var grid = document.getElementById("featured-grid");
    var title = document.getElementById("featured-title");
    if (!grid) return;
    featuredList(6).forEach(function (r) {
      var card = el("article", "card");
      var body = el("div", "card-body");
      var meta = el("p", "card-meta");
      meta.appendChild(el("span", null, r.level));
      meta.appendChild(el("span", "dot", "/"));
      meta.appendChild(el("span", null, r.date));
      body.appendChild(meta);
      body.appendChild(el("h3", "card-title", r.event));
      body.appendChild(el("p", "card-award", r.award));
      if (r.team) body.appendChild(el("p", "card-team", r.team));
      if (r.teacher) body.appendChild(el("p", "card-team", "指导教师：" + r.teacher));
      card.appendChild(body);
      grid.appendChild(card);
    });
    if (title && grid.childNodes.length) title.hidden = false;
  }

  function render() {
    bind();
    renderBrand();
    renderNav();
    renderAbout();
    renderEvents();
    renderNotices();
    renderWorks();
    renderGallery();
    renderWorksSummary();
    renderFeatured();
    renderFoot();
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  // 供 news.js 复用，避免两个文件各写一份
  window.SITE_UI = {
    el: el,
    fmtDate: fmtDate,
    postHref: postHref,
    sortedPosts: sortedPosts,
    noticeRow: noticeRow
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

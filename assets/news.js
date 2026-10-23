(function () {
  var U = window.SITE_UI || {};
  var S = window.SITE || {};
  var el = U.el;

  function renderNewsList() {
    var host = document.getElementById("all-notices");
    if (!host) return;
    var posts = U.sortedPosts();
    posts.forEach(function (p) { host.appendChild(U.noticeRow(p)); });
    var empty = document.getElementById("news-empty");
    if (empty) empty.hidden = posts.length > 0;
    var count = document.getElementById("news-count");
    if (count && posts.length) {
      count.textContent = "协会的通知、公告和活动文章都在这里，共 " + posts.length + " 条。";
    }
  }

  function postId() {
    var m = /[?&]id=([^&#]+)/.exec(location.search);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function renderPost() {
    var titleEl = document.getElementById("post-title");
    var metaEl = document.getElementById("post-meta");
    var mediaEl = document.getElementById("post-media");
    var bodyEl = document.getElementById("post-body");
    if (!titleEl) return;

    var id = postId();
    var post = null;
    (window.POSTS || []).forEach(function (p) {
      if (p.id === id) post = p;
    });

    if (!post) {
      titleEl.textContent = "没找到这条通知";
      metaEl.textContent = "";
      bodyEl.appendChild(el("p", null,
        "链接里的编号是「" + (id || "（空）") + "」，可能是这条被改过名字或删掉了。"));
      document.title = "没找到这条通知 · " + (S.name || "");
      return;
    }

    document.title = post.title + " · " + (S.name || "");
    titleEl.textContent = post.title || "（未命名）";
    metaEl.textContent = [post.kind, U.fmtDate(post.date)].filter(Boolean).join(" · ");

    if (post.image) {
      var img = document.createElement("img");
      img.className = "post-image";
      img.src = post.image;
      img.alt = post.summary || post.title || "";
      mediaEl.appendChild(img);
    }

    (post.body || []).forEach(function (item) {
      if (typeof item === "string") {
        bodyEl.appendChild(el("p", null, item));
      } else if (item.h) {
        bodyEl.appendChild(el("h2", "post-h", item.h));
      } else if (item.list) {
        var ul = el("ul", "post-ul");
        item.list.forEach(function (t) { ul.appendChild(el("li", null, t)); });
        bodyEl.appendChild(ul);
      } else if (item.img) {
        var fig = el("figure", "post-fig");
        var link = el("a");
        link.href = item.img;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        var shot = document.createElement("img");
        shot.src = item.img;
        shot.alt = item.caption || "正文配图";
        shot.loading = "lazy";
        link.appendChild(shot);
        fig.appendChild(link);
        if (item.caption) fig.appendChild(el("figcaption", "post-fig-cap", item.caption));
        bodyEl.appendChild(fig);
      }
    });
  }

  function run() {
    if (!el) return;
    renderNewsList();
    renderPost();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

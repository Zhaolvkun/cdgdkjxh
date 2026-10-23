(function () {
  var A = window.AWARDS;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function renderHead() {
    var box = document.getElementById("list-stats");
    if (box && A && A.stats) {
      var lv = A.stats.byLevel || {};
      box.textContent =
        A.stats.span + " 年累计竞赛获奖 " + A.stats.total + " 项，其中国家级 " + (lv["国家级"] || 0) +
        " 项、赛区（东北区等）" + (lv["赛区"] || 0) + " 项、省级 " + (lv["省级"] || 0) + " 项。";
    }
    var note = document.getElementById("list-note");
    if (note && A) {
      note.textContent =
        "队伍成员姓名仅公布 " + A.nameCutoff + " 年及以后的获奖记录；数据来源为协会《" + A.source +
        "》，整理于 " + A.generated + "。有错漏请反馈给协会修正。";
    }
  }

  function renderGroups() {
    var host = document.getElementById("year-groups");
    if (!host || !A || !A.contest) return;
    var years = {};
    A.contest.forEach(function (r) {
      (years[r.y] = years[r.y] || []).push(r);
    });
    Object.keys(years)
      .sort(function (a, b) { return b - a; })
      .forEach(function (y) {
        var wrap = el("div", "year-block");
        var head = el("h3", "year-title");
        head.appendChild(el("span", null, y + " 年"));
        head.appendChild(el("span", "year-count", years[y].length + " 项"));
        wrap.appendChild(head);

        var scroller = el("div", "table-wrap");
        var table = el("table", "award-table");
        var thead = el("thead");
        var hrow = el("tr");
        ["时间", "赛事", "奖项", "成员", "指导教师"].forEach(function (h) {
          hrow.appendChild(el("th", null, h));
        });
        thead.appendChild(hrow);
        table.appendChild(thead);

        var tbody = el("tbody");
        years[y].forEach(function (r) {
          var tr = el("tr");
          tr.appendChild(el("td", "col-date", r.date || ""));
          tr.appendChild(el("td", "col-event", r.event || ""));
          var award = el("td", "col-award", r.award || "");
          if (r.level === "国家级") award.className += " is-national";
          tr.appendChild(award);
          tr.appendChild(el("td", "col-team", r.team || "—"));
          tr.appendChild(el("td", "col-teacher", r.teacher || "—"));
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        scroller.appendChild(table);
        wrap.appendChild(scroller);
        host.appendChild(wrap);
      });
  }

  function renderIp() {
    var host = document.getElementById("ip-body");
    if (!host || !A || !A.ip) return;
    var list = el("ul", "ip-list");
    A.ip.forEach(function (item) {
      var li = el("li", "ip-item");
      var line = el("p", "ip-head");
      line.appendChild(el("span", "chip", item.kind));
      line.appendChild(el("span", null, item.count + " 项"));
      line.appendChild(el("span", "ip-years", item.years));
      li.appendChild(line);
      (item.items || []).forEach(function (p) {
        var detail = el("p", "ip-detail", p.name);
        li.appendChild(detail);
        if (p.source) li.appendChild(el("p", "ip-source", p.source));
      });
      list.appendChild(li);
    });
    host.appendChild(list);
    host.appendChild(el("p", "note", "论文与软件著作权按协会口径只统计数量与年份，不公开篇目与作者。"));
  }

  function render() {
    if (!A) return;
    renderHead();
    renderGroups();
    renderIp();
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

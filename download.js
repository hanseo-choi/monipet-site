// 모니펫 PC 설치 파일 주소 찾기 (site/index.html · site/pc/index.html 이 같이 쓴다).
// 1) 버전 없는 고정 주소 (scripts/release-desktop.mjs upload 가 releases/Monipet-setup.exe 로 덮어 올림) 가 살아 있으면 그것.
// 2) 아니면 자동 업데이트가 쓰는 latest.json 의 Windows 설치 파일 (예전 방식, 예비).
// 버튼: data-download 속성이 붙은 <a>. 버전 글: data-download-version 속성이 붙은 요소.
(function () {
  var DIRECT_INSTALLER = "https://djonhveixwjrkmjydxzn.supabase.co/storage/v1/object/public/releases/Monipet-setup.exe";
  var LATEST_JSON = "https://djonhveixwjrkmjydxzn.supabase.co/storage/v1/object/public/releases/latest.json";

  var buttons = document.querySelectorAll("a[data-download]");
  var versions = document.querySelectorAll("[data-download-version]");

  function each(list, fn) { for (var i = 0; i < list.length; i++) fn(list[i]); }

  function ready(url, version) {
    each(buttons, function (a) {
      a.href = url;
      a.removeAttribute("aria-disabled");
      var label = a.querySelector("[data-label]");
      if (label && a.getAttribute("data-ready")) label.textContent = a.getAttribute("data-ready");
    });
    if (version) each(versions, function (v) { v.textContent = "최신 판 " + version + " · Windows 10 · 11 · 무료"; });
  }

  function fail() {
    each(buttons, function (a) {
      // 안내 페이지로 돌아갈 수 있는 버튼(data-fallback)은 그 주소로, 아니면 잠시 뒤 다시
      var fb = a.getAttribute("data-fallback");
      if (fb) { a.href = fb; a.removeAttribute("aria-disabled"); return; }
      var label = a.querySelector("[data-label]") || a;
      label.textContent = "지금은 받을 수 없어요";
    });
    each(versions, function (v) { v.textContent = "잠시 뒤 이 페이지를 다시 열어 주세요."; });
  }

  var latest = fetch(LATEST_JSON, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("latest " + r.status); return r.json(); })
    .then(function (j) {
      var w = j && j.platforms && j.platforms["windows-x86_64"];
      if (!w || !/^https:\/\//.test(w.url)) throw new Error("no url");
      return { url: w.url, version: j.version };
    })
    .catch(function () { return null; });

  var direct = !DIRECT_INSTALLER ? Promise.resolve(false) :
    fetch(DIRECT_INSTALLER, { method: "HEAD", cache: "no-store" })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });

  Promise.all([direct, latest]).then(function (res) {
    var ok = res[0], l = res[1];
    if (ok) ready(DIRECT_INSTALLER, l && l.version);
    else if (l) ready(l.url, l.version);
    else fail();
  });
})();

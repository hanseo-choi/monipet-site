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

// 폰 · 태블릿에서 [PC 다운로드] 를 누르면 .exe 를 받지 않고, "PC 에서 열어 주세요" 작은 판을 띄운다.
// PC (Windows) 에서는 아무것도 바꾸지 않는다. 판 모양은 style.css 의 .pc-sheet (메뉴 판과 같은 색 · 단추).
(function () {
  var SITE_URL = "https://monipet.co.kr/";
  var SITE_TEXT = "monipet.co.kr";

  function isPhoneOrTablet() {
    var ua = navigator.userAgent || "";
    // Windows PC (터치 노트북 · 서피스 포함) 는 PC 로 본다
    if (/Windows NT/i.test(ua) && !/Windows Phone/i.test(ua)) return false;
    if (/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua)) return true;
    // 아이패드 (iPadOS 는 Mac 처럼 보인다)
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
    // 그 밖: 손가락 화면 + 좁은 화면
    var coarse = !!(window.matchMedia && matchMedia("(pointer: coarse)").matches);
    var narrow = Math.min(screen.width || 0, screen.height || 0) <= 820;
    return coarse && narrow;
  }
  if (!isPhoneOrTablet()) return;

  var sheet = null, copyBtn = null, copyLabel = null, addr = null, note = null;

  function copyText(text) {
    function legacy() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.top = "0"; ta.style.left = "0"; ta.style.opacity = "0";
        (sheet || document.body).appendChild(ta);
        ta.select(); ta.setSelectionRange(0, text.length);
        var ok = document.execCommand("copy");
        ta.parentNode.removeChild(ta);
        return ok;
      } catch (e) { return false; }
    }
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(); });
    }
    return Promise.resolve(legacy());
  }

  function build() {
    sheet = document.createElement("dialog");
    sheet.className = "pc-sheet";
    sheet.setAttribute("aria-labelledby", "pc-sheet-title");
    sheet.setAttribute("aria-describedby", "pc-sheet-desc");
    sheet.innerHTML =
      '<div class="pc-sheet-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28"><rect x="2" y="3" width="20" height="13" rx="3" fill="currentColor"/><rect x="10" y="16" width="4" height="3" fill="currentColor"/><rect x="6" y="19" width="12" height="2.5" rx="1.25" fill="currentColor"/></svg></div>' +
      '<h2 id="pc-sheet-title">PC 에서 받아요</h2>' +
      '<p id="pc-sheet-desc">모니펫 PC 앱은 <b>Windows PC</b> 에서 받아요.<br>PC 에서 <b>' + SITE_TEXT + '</b> 을 열어 주세요.</p>' +
      '<p class="pc-sheet-addr">' + SITE_TEXT + '</p>' +
      '<div class="pc-sheet-row">' +
        '<button type="button" class="btn pc-sheet-copy"><span data-copy-label>주소 복사</span></button>' +
        '<button type="button" class="btn alt pc-sheet-close">닫기</button>' +
      '</div>' +
      '<p class="pc-sheet-note" role="status" aria-live="polite"></p>';
    document.body.appendChild(sheet);
    copyBtn = sheet.querySelector(".pc-sheet-copy");
    copyLabel = sheet.querySelector("[data-copy-label]");
    addr = sheet.querySelector(".pc-sheet-addr");
    note = sheet.querySelector(".pc-sheet-note");

    copyBtn.addEventListener("click", function () {
      copyText(SITE_URL).then(function (ok) {
        if (ok) {
          copyLabel.textContent = "복사했어요";
          note.textContent = "PC 로 보내서 열어 보세요.";
          return;
        }
        // 복사가 막힌 브라우저: 주소를 골라 두고 길게 눌러 복사하게
        try {
          var r = document.createRange(); r.selectNodeContents(addr);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        } catch (e) { /* 고르기도 안 되면 글만 */ }
        note.textContent = "주소를 길게 눌러 복사해 주세요.";
      });
    });
    sheet.querySelector(".pc-sheet-close").addEventListener("click", close);
    // 판 바깥(어두운 곳)을 누르면 닫기
    sheet.addEventListener("click", function (e) { if (e.target === sheet) close(); });
    sheet.addEventListener("close", function () {
      copyLabel.textContent = "주소 복사";
      note.textContent = "";
    });
  }

  function open() {
    if (!sheet) build();
    if (sheet.open) return;
    if (sheet.showModal) sheet.showModal(); else sheet.setAttribute("open", "");
    copyBtn.focus();
  }
  function close() {
    if (sheet && sheet.open) { if (sheet.close) sheet.close(); else sheet.removeAttribute("open"); }
  }

  var buttons = document.querySelectorAll("a[data-download]");
  for (var i = 0; i < buttons.length; i++) {
    // 설치 파일을 찾는 중이어도 (aria-disabled) 눌러서 안내를 볼 수 있게
    buttons[i].classList.add("pc-only");
    buttons[i].addEventListener("click", function (e) { e.preventDefault(); open(); });
  }
})();

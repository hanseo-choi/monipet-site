# 모니펫 홈페이지 (`site/`)

주소: **https://monipet.co.kr/** (GitHub Pages, 공개 저장소 `hanseo-choi/monipet-site`, 도메인은 가비아)

| 주소 | 파일 | 원본 |
|---|---|---|
| `/` | `index.html` · `home.css` · `download.js` · `img/` | 여기 (`site/`) |
| `/pc/` PC 설치 안내 (폰의 [PC로 설치 링크 보내기]) | `pc/index.html` | `docs/pc/index.html` |
| `/privacy/` 개인정보처리방침 · `#delete` 계정 삭제 | `privacy/index.html` | `docs/privacy/index.html` |
| `/privacy/en.html` 영문 | `privacy/en.html` | `docs/privacy/en.html` |

- `pc/` · `privacy/` 는 **docs/ 쪽을 고친 뒤** `node scripts/build-site.mjs` 로 복사한다 (`--check` 는 같은지만 확인).
- 그림(`img/`)은 `python scripts/site-images.py` 로 `art/final/` 에서 줄여 만든 것을 커밋해 둔다.
- 게임 장면 그림 (메뉴 [소개] 속 `img/scene-*.webp`) 은
  데스크톱 앱의 `#promo` 무대 (`apps/desktop/src/promo/PromoReel.tsx`) 를 `node scripts/promo-capture.mjs` 로 찍고
  `python scripts/site-scenes.py <정지 화면 폴더>` 로 줄인 것 (명령은 두 스크립트 맨 위 설명). 홍보 영상도 같은 무대로 만든다.
- 첫 페이지 (2026-11-04 새로 꾸밈) 는 `index.html` + `home.css` (`style.css` 는 `pc/` · `privacy/` 용으로 그대로 둔다).
  구역 순서: 첫 화면 (홍보 영상 모니터 + [PC 다운로드] · [Google Play]) → 한 곳에만 (`#about`) → 알 깨기 (`#gacha`) → 성장 (`#grow`)
  → 펫과 지내는 하루 (`#features`) → 시작하기 (`#start`) → 폰 화면 (스토어 스크린샷) → 내려받기 (`#download`) → 자주 묻는 질문 (`#faq`).
  예전 주소 `/#features` · `/#start` · `/#download` · `/#faq` 도 같은 구역으로 간다.
- 움직이는 그림 (소리 없음, 화면에 보일 때만 재생, 움직임 줄이기를 켠 사람에겐 포스터만):
  - `img/promo-1280x720.mp4` · `img/still-*.webp`: `apps/promo` 홍보 영상 (`out/monipet-promo.mp4`) 을 줄이고 자른 것
  - `img/clip-todo|ai|size|hide.mp4`: 같은 홍보 영상에서 장면 하나씩 (장면 사이 겹치는 0.3초는 빼고 자른다)
  - `img/clip-home|pets|boss|hunt.mp4` · `img/gacha-real.mp4`: 폰 앱 웹 데모 (`?demo=home`, 뽑기는 `&mpity=99` 로 신화 확정) 를 헤드리스 Edge 로 녹화
  - `img/growth-1280x720.mp4`: 데스크톱 개발 서버의 `#growth` 무대 (`apps/desktop/src/promo/GrowthReel.tsx`, 뽀삐 아기 → 어린이 → 어른 진화) 를 녹화
  - 알 깨기 · 성장 옆 단계 줄은 영상 시각에 맞춰 켜진다 (`index.html` 아래 스크립트의 초 값 — 영상을 바꾸면 같이 고친다)
- 예전 한 화면 첫 페이지가 쓰던 `img/promo-720x1280.mp4` · `img/promo-poster-*.webp` · `img/scene-*.webp` · `img/hero.*` 는 지금 첫 페이지에서 안 쓴다.

- [Windows PC 내려받기] 버튼은 버전 없는 고정 주소 `releases/Monipet-setup.exe` 를 쓴다
  (`node scripts/release-desktop.mjs upload <버전>` 이 매번 덮어 올림). 그 파일이 아직 없으면 `latest.json` 의 설치 파일로 대신한다.
- 폰 · 태블릿 (Android · iPhone · iPad, 또는 손가락 화면 + 좁은 화면) 에서 [PC 다운로드] 를 누르면 .exe 를 받지 않고
  "PC 에서 monipet.co.kr 을 열어 주세요" 작은 판 + [주소 복사] 가 뜬다 (`download.js` 아래쪽 · `home.css` / `style.css` 의 `.pc-sheet`, `pc/` 페이지도 같음).
  Windows PC 는 터치 화면이어도 그대로 내려받는다.
- Microsoft Store 에 올라가면 `index.html` 아래쪽 `const MS_STORE_URL = null;` 에 주소를 넣는다 (null 이면 배지가 안 보임).
- 앱 안 주소는 `packages/shared/src/links.ts` 한 곳.

## 올리는 곳

GitHub 저장소 `hanseo-choi/monipet-site` (Pages, 사용자 도메인 `monipet.co.kr` — 가비아 DNS 가 GitHub Pages 를 가리킴, `site/CNAME`).
처음 한 번만 원격을 붙인다 (PowerShell, 저장소 맨 위 폴더, `gh auth login` 필요):

```powershell
git remote add site https://github.com/hanseo-choi/monipet-site.git
node scripts/build-site.mjs
# 그 저장소의 예전 소개 · 개인정보처리방침 페이지를 이 site/ 로 바꿔 올린다 (처음 한 번은 강제)
git push site "$(git subtree split --prefix site HEAD):main" --force
start https://monipet.co.kr/
```

`git subtree split` 은 지금 브랜치에 커밋된 `site/` 를 올린다 (커밋 안 한 변경은 안 올라감).

## 다음부터: 고친 것 올리기

```powershell
node scripts/build-site.mjs
git add site docs/pc docs/privacy
git commit -m "chore(site): 홈페이지 고침"
git subtree push --prefix site site main
```

subtree push 가 "non-fast-forward" 로 거절되면 (저장소 쪽을 웹에서 직접 고친 경우) 한 번만 강제로:

```powershell
git push site "$(git subtree split --prefix site HEAD):main" --force
```

## 올린 뒤 할 일

- Play Console: 개인정보처리방침 URL → `https://monipet.co.kr/privacy/`, 계정 삭제 URL → `…/privacy/#delete`, 웹사이트 → `https://monipet.co.kr/`
- Google OAuth 동의 화면 브랜딩: 홈페이지 · 개인정보처리방침 링크를 위 주소로, 승인된 도메인에 `monipet.co.kr`
- 자세한 것: `docs/PLAY-STORE.md` 7절
- 카카오톡 링크 미리보기는 캐시가 있어서, 그림을 바꿨다면 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 캐시를 지운다.

# 쇼핑몰 화면 (1단계: 정적 페이지)

## 실행
- 서버 없이 `index.html`을 브라우저로 열면 된다. (VS Code Live Server로 열어도 됨)
- 로컬 서버: 프로젝트 루트에서 `python .claude/serve.py` → http://localhost:8080 (캐시 끔, 수정 즉시 반영)
- 공유 링크(Artifact, 기본 비공개): https://claude.ai/artifact/Rh3txwGY5bnvL5AWujgy7h — 수정 후 Claude에게 다시 게시 요청
- 모바일 화면 확인: 크롬에서 F12 → 휴대폰 아이콘(기기 툴바) → iPhone 등 선택

## 자주 바꿀 곳
- 사이트 이름·주소·사업자 정보·배송비·적립률: `js/common.js` 맨 위 `SITE`
- 첫 화면 큰 제목: `index.html`의 `hero-text` 안 `h1`
- 상품·서비스 패키지·작업물: `js/data.js`
- 상품 사진: `images/`에 넣고 data.js의 `images`에 경로 입력
  - 1번째 = 대표 사진, 2번째 = 마우스 올렸을 때 사진 (배경이 투명한 PNG 권장)
  - 사진이 없으면 `mock` 설정대로 목업(책·포스터·엽서·노트)이 보인다
- 색·폰트: `css/style.css` 맨 위 `:root` (인쇄 콘셉트는 `css/print.css`)

## 구조
- 메뉴 페이지: index(홈), service(패키지), shop(상품), work(작업물), about
- 기타: product(상품·패키지 상세 공용), cart, login
- `css/style.css` 기본 스타일 (데스크톱 + 768px 이하 모바일)
- `css/print.css` 인쇄 콘셉트 (종이, 세리프, 재단선, 3D 책, 펼침면)
- `js/common.js` 헤더·모바일 메뉴·푸터·장바구니·효과·점 그래픽
- `js/data.js` 상품·카테고리·서비스 패키지·작업물·환불 규정 데이터
- `js/print.js` 인쇄 콘셉트 조각 (망점, 3D 책, 펼침면 뷰어)
- `docs/` 결정 기록·진행 상황

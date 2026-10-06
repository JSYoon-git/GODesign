// 인쇄 콘셉트 공통 조각: 2도 망점, 3D 책, 패키지 카드, 펼침면 뷰어
// data.js, common.js 다음에 불러온다.

const drawIn = (el) => el.querySelectorAll('canvas[data-shape]').forEach(drawHalftone);

// 2도 망점: 같은 모양을 잉크 두 겹으로
const riso = (art, cls = '') => `<div class="riso theme-${art.theme} ${cls}" aria-hidden="true">
    <canvas class="ink ink-1" data-shape="${art.shape}"></canvas>
    <canvas class="ink ink-2" data-shape="${art.shape}"></canvas>
  </div>`;

// 3D 책 (앞표지, 책등, 책장, 뒤표지)
const book = (title, art, cls = '') => `<div class="book theme-${art.theme} ${cls}" aria-hidden="true">
    <div class="book-inner">
      <div class="book-face book-cover">
        <p class="book-sub">${esc(SITE.name)}</p>
        ${riso(art)}
        <p class="book-title">${esc(title)}</p>
      </div>
      <div class="book-face book-spine"><span>${esc(title)}</span></div>
      <div class="book-face book-pages"></div>
      <div class="book-face book-back"></div>
    </div>
  </div>`;

// 작은 표지 (장바구니·썸네일용) — 패키지는 cover, 상품은 mock 그림 사용
const coverThumb = (s) => {
  const art = s.cover || s.mock;
  return `<div class="cover-thumb theme-${art.theme}" role="img" aria-label="${esc(s.name)}">${riso(art)}</div>`;
};

// 상품 사진이 없을 때 보여줄 목업
function productMock(p, cls = '') {
  const m = p.mock;
  const label = `role="img" aria-label="${esc(p.name)}"`;
  if (m.type === 'book') return `<div class="mock mock-book ${cls}" ${label}>${book(m.title, m)}</div>`;
  if (m.type === 'poster') return `<div class="mock mock-poster ${cls}" ${label}><div class="poster theme-${m.theme}">${riso(m)}</div></div>`;
  if (m.type === 'postcard') return `<div class="mock mock-postcard ${cls}" ${label}><div class="card-back"></div><div class="postcard theme-${m.theme}">${riso(m)}</div></div>`;
  return `<div class="mock mock-note ${cls}" ${label}><div class="note theme-${m.theme}">${riso(m)}<span class="band"></span></div></div>`;
}

// 패키지 카드
const pkgCard = (s) => `
  <a class="pkg" href="product.html?id=${s.id}">
    <div class="pkg-stage">${book(s.en, s.cover)}</div>
    <h3>${esc(s.name)}</h3>
    <p class="pkg-price">${priceHtml(s)}</p>
    <dl class="spec"><dt>기간</dt><dd>${s.period}</dd><dt>시안</dt><dd>${s.drafts}</dd><dt>수정</dt><dd>${s.revisions}</dd></dl>
  </a>`;

// 진행 순서
const processHtml = () => `
  <ol class="steps">
    <li><span class="step-no">1</span><h3>패키지 고르기</h3><p>필요한 작업에 맞는 패키지를 고르세요.</p></li>
    <li><span class="step-no">2</span><h3>결제하기</h3><p>결제를 마치면 작업 일정이 잡혀요.</p></li>
    <li><span class="step-no">3</span><h3>의뢰서 보내기</h3><p>원고 파일과 원하는 분위기를 보내주세요.</p></li>
    <li><span class="step-no">4</span><h3>시안 확인하기</h3><p>정해진 횟수 안에서 수정하고 최종 파일이나 인쇄물을 받아요.</p></li>
  </ol>`;

// ===== 펼침면 뷰어: 작업 한 개 = 펼침면 한 개 =====
const folio = (n) => String(n).padStart(2, '0');
const workLeft = (i) => {
  const w = WORKS[i];
  return `<div class="page-art crop theme-${w.art.theme}">${riso(w.art)}</div><span class="folio">${folio(i * 2 + 2)}</span>`;
};
const workRight = (i) => {
  const w = WORKS[i];
  return `<h3>${esc(w.title)}</h3>
    <p class="kind">${esc(w.kind)}</p>
    <dl class="spec"><dt>판형</dt><dd>${w.size}</dd><dt>쪽수</dt><dd>${w.pages}</dd><dt>제본</dt><dd>${w.binding}</dd></dl>
    <p class="work-note">${esc(w.note)}</p>
    <span class="folio">${folio(i * 2 + 3)}</span>`;
};

// root 안에 뷰어를 만들고 { go(i) }를 돌려준다
function mountSpread(root) {
  root.innerHTML = `
    <div class="spread-book" aria-live="polite">
      <div class="page page-l"></div><div class="page page-r"></div>
    </div>
    <div class="spread-nav">
      <button type="button" class="sp-prev" aria-label="이전 작업"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m15 5-7 7 7 7"/></svg></button>
      <span class="sp-count"></span>
      <button type="button" class="sp-next" aria-label="다음 작업"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m9 5 7 7-7 7"/></svg></button>
    </div>`;
  const spread = root.querySelector('.spread-book');
  const pl = root.querySelector('.page-l'), pr = root.querySelector('.page-r');
  const prev = root.querySelector('.sp-prev'), next = root.querySelector('.sp-next');
  let cur = 0, busy = false;

  const set = (el, html) => { el.innerHTML = html; drawIn(el); };
  function updateNav() {
    prev.disabled = cur === 0;
    next.disabled = cur === WORKS.length - 1;
    root.querySelector('.sp-count').textContent = `${cur + 1} / ${WORKS.length}`;
  }
  function go(i) { cur = Math.max(0, Math.min(WORKS.length - 1, i)); set(pl, workLeft(cur)); set(pr, workRight(cur)); updateNav(); }

  // 종이 한 장이 책등을 축으로 넘어감
  function turn(dir) {
    const to = cur + dir;
    if (busy || to < 0 || to >= WORKS.length) return;
    if (reduceMotion) { go(to); return; }
    busy = true;
    const leaf = document.createElement('div');
    leaf.className = `leaf ${dir > 0 ? 'leaf-next' : 'leaf-prev'}`;
    leaf.innerHTML = dir > 0
      ? `<div class="page page-r front">${workRight(cur)}</div><div class="page page-l back">${workLeft(to)}</div>`
      : `<div class="page page-l front">${workLeft(cur)}</div><div class="page page-r back">${workRight(to)}</div>`;
    if (dir > 0) set(pr, workRight(to)); else set(pl, workLeft(to)); // 넘어가는 장 아래에 다음 페이지를 미리 깔아둠
    spread.appendChild(leaf);
    drawIn(leaf);
    cur = to; updateNav();
    requestAnimationFrame(() => requestAnimationFrame(() => leaf.classList.add('turn')));
    leaf.addEventListener('transitionend', () => {
      if (dir > 0) set(pl, workLeft(cur)); else set(pr, workRight(cur));
      leaf.remove(); busy = false;
    }, { once: true });
  }
  prev.onclick = () => turn(-1);
  next.onclick = () => turn(1);
  let touchX = null;
  spread.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  spread.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1);
    touchX = null;
  });
  go(0);
  return { go };
}

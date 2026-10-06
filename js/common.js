// ===== 사이트 설정: 이름·주소·사업자 정보는 여기서만 바꾸면 전체 페이지에 반영된다 =====
const SITE = {
  name: '지오디자인',
  shippingFee: 3000,
  freeShippingOver: 50000,
  pointRate: 0.1, // 적립률 표시용 (0이면 적립 줄 숨김)
  office: { address: '(사무실 주소)', phone: '02-000-0000', hours: '평일 10:00-19:00', email: 'hello@example.com' },
  showroom: null, // 쇼룸이 생기면 { address, phone, hours }
  // 통신판매 사이트는 사업자 정보 표시가 필요하다 (PG 심사 때도 확인함)
  business: { company: '(상호명)', ceo: '(대표자명)', bizNo: '000-00-00000', mailOrderNo: '제0000-서울00-0000호' },
  sns: [
    { label: '인스타그램', url: '#' },
    { label: '페이스북', url: '#' },
    { label: '유튜브', url: '#' },
  ],
};
const SOON = '준비 중인 기능이에요';

// ===== 유틸 =====
const qs = new URLSearchParams(location.search);
const won = (n) => n.toLocaleString('ko-KR') + '원';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// 상품과 서비스 패키지를 같은 장바구니·상세 페이지에서 다룸
const findProduct = (id) => PRODUCTS.find((p) => p.id === id) || SERVICES.find((s) => s.id === id);
const isService = (p) => SERVICES.includes(p);
const shippingFor = (subtotal) => (subtotal === 0 || subtotal >= SITE.freeShippingOver ? 0 : SITE.shippingFee);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== 장바구니 =====
// 브라우저(localStorage)에 [{id, qty}]만 저장한다. 가격은 저장하지 않고 항상 data.js에서 다시 읽는다.
const CART_KEY = 'cart';
function getCart() {
  try {
    const c = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    // 저장값이 깨져도 화면이 망가지지 않게: 없는 상품은 빼고, 수량은 1~99 정수(패키지는 1)
    return c.filter((it) => it && findProduct(it.id)).map((it) => ({
      id: it.id,
      qty: isService(findProduct(it.id)) ? 1 : Math.min(99, Math.max(1, parseInt(it.qty, 10) || 1)),
    }));
  } catch { return []; }
}
function saveCart(c, pop = false) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch {}
  updateBagCount(pop);
}
// 패키지는 1건만 담김. 이미 담긴 패키지면 false
function addToCart(id, qty) {
  const c = getCart();
  const it = c.find((x) => x.id === id);
  const svc = isService(findProduct(id));
  if (it && svc) return false;
  if (it) it.qty = Math.min(99, it.qty + qty); else c.push({ id, qty: svc ? 1 : qty });
  saveCart(c, true);
  return true;
}
function setQty(id, qty) {
  const c = getCart();
  const it = c.find((x) => x.id === id);
  if (!it || isService(findProduct(id))) return;
  it.qty = Math.min(99, Math.max(1, qty));
  saveCart(c);
}
function removeFromCart(id) { saveCart(getCart().filter((x) => x.id !== id)); }
const cartCount = () => getCart().reduce((s, x) => s + x.qty, 0);

// 효과 3: 담을 때 숫자가 톡 튐
function updateBagCount(pop = false) {
  const n = cartCount();
  document.querySelectorAll('.bag-count').forEach((el) => {
    el.textContent = n;
    el.hidden = n === 0;
    if (pop && !reduceMotion) {
      el.classList.remove('pop');
      void el.offsetWidth; // 애니메이션 재시작
      el.classList.add('pop');
    }
  });
}

// ===== 상품 이미지 / 카드 =====
// i번째 사진. 사진이 없으면 자리표시(첫 번째 a, 두 번째 b 모양)
function productImg(p, i, cls = '') {
  const src = p.images[i];
  if (!src && i === 0 && p.mock && typeof productMock === 'function') return productMock(p, cls); // print.js
  return src
    ? `<img class="${cls}" src="${src}" alt="${i === 0 ? esc(p.name) : ''}" loading="lazy">`
    : `<div class="ph ph-${i === 0 ? 'a' : 'b'} ${cls}" ${i === 0 ? `role="img" aria-label="${esc(p.name)}"` : 'aria-hidden="true"'}></div>`;
}
const hasSecond = (p) => (p.images.length === 0 && !p.mock) || !!p.images[1];

const BADGE_LABEL = { sale: '할인', best: '인기' };
function badgesHtml(p) {
  if (!p.badges || !p.badges.length) return '';
  return `<span class="badges">${p.badges.map((b) => `<span class="badge ${b}">${BADGE_LABEL[b] || b}</span>`).join('')}</span>`;
}
const priceHtml = (p) => `${won(p.price)}${p.originalPrice ? `<del>${won(p.originalPrice)}</del>` : ''}`;

// 효과 2: 마우스 올리면 두 번째 사진으로 전환 (CSS에서 처리)
function productCard(p) {
  return `<a class="card" href="product.html?id=${p.id}">
    <div class="card-media">${productImg(p, 0)}${hasSecond(p) ? productImg(p, 1, 'second') : ''}</div>
    <p class="card-name">${esc(p.name)}</p>
    <p class="price">${priceHtml(p)}</p>
    ${badgesHtml(p)}
  </a>`;
}

// ===== 토스트 =====
function showToast(msg, href, linkText) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.innerHTML = `<span>${msg}</span>${href ? `<a href="${href}">${linkText}</a>` : ''}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ===== 하프톤(점) 그래픽 =====
// 모양 함수: 0~1 좌표를 받아 진하기(0~1)를 돌려준다. 0이면 점을 찍지 않는다.
const SHAPES = {
  sphere(u, v) { // 왼쪽 위에서 빛을 받는 구
    const x = (u - 0.5) / 0.48, y = (v - 0.5) / 0.48, r2 = x * x + y * y;
    if (r2 > 1) return 0;
    const light = Math.max(0, -x * 0.45 - y * 0.55 + Math.sqrt(1 - r2) * 0.7);
    return Math.max(0.06, Math.min(1, 1.1 - light * 1.1));
  },
  drum(u, v) { // 납작한 원통 (윗면은 밝게)
    const x = (u - 0.5) / 0.48, top = (v - 0.22) / 0.2, bot = (v - 0.82) / 0.16;
    if (x * x + top * top <= 1) return 0.12 + 0.25 * u;
    if (Math.abs(x) <= 1 && v >= 0.22 && (v <= 0.82 || x * x + bot * bot <= 1)) return 0.3 + 0.7 * Math.pow((x + 1) / 2, 1.6);
    return 0;
  },
  vase(u, v) { // 굴곡 있는 세로 화병
    if (v < 0.04 || v > 0.98) return 0;
    const w = 0.2 + 0.12 * Math.sin(v * Math.PI * 2.5 + 0.6);
    const x = (u - 0.5) / w;
    return Math.abs(x) <= 1 ? 0.15 + 0.85 * Math.pow((x + 1) / 2, 1.3) : 0;
  },
  arch(u, v) { // 위가 둥근 아치
    const x = (u - 0.5) / 0.45;
    if (Math.abs(x) > 1 || v > 0.98) return 0;
    if (v < 0.45) { const y = (v - 0.45) / 0.43; if (x * x + y * y > 1) return 0; }
    return 0.12 + 0.88 * Math.pow((x + 1) / 2, 1.5) * (0.5 + 0.5 * v);
  },
};
function drawHalftone(canvas) {
  const shape = SHAPES[canvas.dataset.shape];
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!shape || !w || !h) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = getComputedStyle(canvas).color;
  const step = Math.max(Math.min(6, w / 14), w / 40); // 점 간격 6px 이상, 작은 그림(84px 미만)은 가로 14개 정도로 촘촘하게
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const d = shape(x / w, y / h);
      if (d <= 0.02) continue;
      ctx.beginPath();
      ctx.arc(x, y, step * 0.5 * Math.sqrt(d), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
function initHalftones() {
  const all = () => document.querySelectorAll('canvas[data-shape]').forEach(drawHalftone);
  all();
  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(all, 150); });
}

// ===== 아이콘 =====
const ICON = {
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
  menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  bag: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m4 4 16 16M20 4 4 20"/></svg>',};

// ===== 헤더 + 모바일 메뉴 =====
function renderHeader() {
  const page = document.body.dataset.page;
  // 상세 페이지는 보고 있는 것이 패키지인지 상품인지에 따라 메뉴 표시
  const item = page === 'product' ? findProduct(qs.get('id')) : null;
  const navPage = item ? (isService(item) ? 'service' : 'shop') : page;
  const curCat = page === 'shop' ? (qs.get('cat') || 'all') : null;
  const nav = [['service', '서비스', 'service.html'], ['shop', '상점', 'shop.html'], ['work', '작업물', 'work.html'], ['about', '소개', 'about.html']];
  const act = (on) => (on ? ' class="is-active" aria-current="page"' : '');

  const desktopNav = page === 'login' ? '' : `<nav class="main-nav" aria-label="주 메뉴">
      ${nav.map(([id, label, href]) => `<a href="${href}"${act(navPage === id)}>${label}</a>`).join('')}
    </nav>`;

  // 모바일 메뉴 = 책의 목차. 장 번호, 점선, 오른쪽 끝에 값(가격·건수)
  const tocSub = {
    service: `<ul class="toc-sub">${SERVICES.map((s) => `<li><a class="toc-row" href="product.html?id=${s.id}"${act(item === s)}>
        <span>${esc(s.name)}</span><i class="leader" aria-hidden="true"></i><span class="toc-val">${s.price.toLocaleString('ko-KR')}</span></a></li>`).join('')}</ul>`,
    shop: `<ul class="toc-cats">${CATEGORIES.map((c) => `<li><a href="shop.html${c.id === 'all' ? '' : '?cat=' + c.id}"${act(curCat === c.id)}>${c.label}</a></li>`).join('')}</ul>`,
  };
  const tocVal = { work: `${WORKS.length}건` };
  const toc = nav.map(([id, label, href], i) => `
        <li class="toc-sec${navPage === id ? ' is-current' : ''}">
          <a class="toc-row toc-head" href="${href}"${act(page === id)}>
            <span class="toc-no">${i + 1}</span><span>${label}</span>
            ${tocVal[id] ? `<i class="leader" aria-hidden="true"></i><span class="toc-val">${tocVal[id]}</span>` : ''}
          </a>
          ${tocSub[id] || ''}
        </li>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
  <header class="site-header" id="site-header">
    <div class="header-inner">
      <button class="menu-btn" aria-label="메뉴 열기" aria-expanded="false" aria-controls="drawer">${ICON.menu}</button>
      <a class="logo" href="index.html">${esc(SITE.name)}</a>
      ${desktopNav}
      <div class="util">
        <form class="search" action="shop.html" role="search">
          <input name="q" type="search" placeholder="검색" aria-label="검색" value="${esc(qs.get('q') || '')}">
          <button aria-label="검색">${ICON.search}</button>
        </form>
        <a href="login.html"${act(page === 'login')}>로그인</a>
        <a href="cart.html"${act(page === 'cart')}>장바구니<span class="count bag-count" hidden></span></a>
      </div>
      <a class="m-cart" href="cart.html"><span class="m-cart-icon" aria-hidden="true">${ICON.bag}</span><span class="m-cart-label">장바구니</span><span class="count bag-count" hidden></span></a>
    </div>
  </header>

  <div class="drawer" id="drawer">
    <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="메뉴">
      <div class="drawer-sheet crop">
        <div class="drawer-head">
          <a class="logo" href="index.html">${esc(SITE.name)}</a>
          <button class="drawer-close" data-close aria-label="메뉴 닫기">${ICON.close}</button>
        </div>
        <form class="drawer-search" action="shop.html" role="search">
          <input name="q" type="search" placeholder="검색" aria-label="검색" value="${esc(qs.get('q') || '')}" required>
          <button aria-label="검색">${ICON.search}</button>
        </form>
        <nav class="toc-wrap" aria-label="목차">
          <p class="toc-label">목차</p>
          <ol class="toc">${toc}</ol>
        </nav>
        <div class="drawer-foot">
          <a href="login.html">로그인</a>
          <a href="cart.html">장바구니<span class="count bag-count" hidden></span></a>
          <span class="color-bar" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </div>
      </div>
    </div>
  </div>`);

  // 검색창이 비어 있으면 돋보기 버튼은 입력창을 여는 역할만 한다
  const form = document.querySelector('.search');
  form.querySelector('button').addEventListener('click', (e) => {
    if (!form.q.value.trim()) { e.preventDefault(); form.q.focus(); }
  });

  // 모바일 메뉴 열기/닫기
  const drawer = document.getElementById('drawer');
  const menuBtn = document.querySelector('.menu-btn');
  const setDrawer = (open) => {
    drawer.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    (open ? drawer.querySelector('.drawer-close') : menuBtn).focus();
  };
  menuBtn.addEventListener('click', () => setDrawer(true));
  drawer.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => setDrawer(false)));
  addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') setDrawer(false);
    // Tab 키 포커스가 열린 메뉴 밖으로 나가지 않게 처음↔끝을 잇는다
    if (e.key === 'Tab') {
      const items = [...drawer.querySelectorAll('a, button, input')].filter((el) => el.offsetParent);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  drawer.querySelectorAll('.toc a').forEach((a) => a.addEventListener('click', () => setDrawer(false)));

  // 효과 4: 스크롤하면 헤더가 얇아지고 배경이 생김
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ===== 푸터 =====
function renderFooter() {
  const { office: o, showroom: s, business: b } = SITE;
  const year = new Date().getFullYear();
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="site-footer">
    <div class="footer-main">
      <div class="footer-cols">
        <div>
          <h2>연락처</h2>
          <p>${o.address}<br>${o.phone} (${o.hours})<br><a href="mailto:${o.email}">${o.email}</a></p>
        </div>
        ${s ? `<div><h2>쇼룸</h2><p>${s.address}<br>${s.phone} (${s.hours})</p></div>` : ''}
        <ul>${SITE.sns.map((x) => `<li><a href="${x.url}">${x.label}</a></li>`).join('')}</ul>
        <ul><li><a href="#">이용약관</a></li><li><a href="#">개인정보처리방침</a></li></ul>
      </div>
      <p class="footer-logo">${esc(SITE.name)}</p>
    </div>
    <div class="footer-bar">
      <nav><a href="service.html">서비스</a><a href="shop.html">상점</a><a href="work.html">작업물</a><a href="about.html">소개</a></nav>
      <p><a href="#">이용약관</a><a href="#"><strong>개인정보처리방침</strong></a></p>
      <p class="biz">상호: ${b.company} | 대표: ${b.ceo} | 사업자등록번호: ${b.bizNo} | 통신판매업 신고: ${b.mailOrderNo}<br>주소: ${o.address} | 대표 이메일: ${o.email}</p>
      <p>Copyright © ${year} ${esc(SITE.name)} All rights reserved.</p>
    </div>
  </footer>`);
}

renderHeader();
renderFooter();
updateBagCount();
initHalftones();
document.title = document.title ? `${document.title} | ${SITE.name}` : SITE.name;

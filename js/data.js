// 사이트 데이터 (DB 대신 사용)
// 금액은 화면 표시용. 결제를 붙일 때 서버가 같은 데이터로 금액을 다시 계산해야 한다.
// images: images/ 폴더에 사진을 넣고 경로를 적는다. 첫 번째 = 대표 사진, 두 번째 = 마우스 올렸을 때 사진.
//   예) images: ['images/p01-1.png', 'images/p01-2.png']
//   비워두면 자리표시 그래픽이 보인다.

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'book', label: '책' },
  { id: 'poster', label: '포스터' },
  { id: 'postcard', label: '엽서' },
  { id: 'stationery', label: '문구' },
];

// 스튜디오가 만든 인쇄물 (임시 상품)
// mock: 사진이 없을 때 보여줄 목업 (type: book | poster | postcard | note, theme, shape)
const PRODUCTS = [
  { id: 'b1', name: '바다의 문법', category: 'book', price: 18000, badges: ['best'], images: [],
    spec: '128×188mm / 216쪽 / 무선제본', summary: '파도를 망점으로 다시 그린 표지의 에세이집.',
    mock: { type: 'book', theme: 'paper', shape: 'sphere', title: 'Sea Grammar' } },
  { id: 'b2', name: '작은 숲', category: 'book', price: 12000, badges: [], images: [],
    spec: '110×178mm / 88쪽 / 무선제본', summary: '손에 쥐기 좋은 작은 판형의 시집.',
    mock: { type: 'book', theme: 'green', shape: 'drum', title: 'A Small Forest' } },
  { id: 'b3', name: '두 가지 잉크', category: 'book', price: 24000, originalPrice: 28000, badges: ['sale'], images: [],
    spec: '170×240mm / 64쪽 / 중철', summary: '네이비와 세이지 두 잉크로만 찍은 리소 작품집.',
    mock: { type: 'book', theme: 'navy', shape: 'arch', title: 'Two Inks' } },
  { id: 'p1', name: '망점 연구 No.1', category: 'poster', price: 35000, badges: ['best'], images: [],
    spec: 'A2 (420×594mm) / 리소 2도', summary: '구 하나를 크고 작은 점으로만 그린 포스터.',
    mock: { type: 'poster', theme: 'paper', shape: 'sphere' } },
  { id: 'p2', name: '아치', category: 'poster', price: 28000, badges: [], images: [],
    spec: 'A3 (297×420mm) / 리소 2도', summary: '창문의 곡선을 옮긴 세로 포스터.',
    mock: { type: 'poster', theme: 'green', shape: 'arch' } },
  { id: 'c1', name: '계절 엽서 세트', category: 'postcard', price: 9000, badges: [], images: [],
    spec: '148×100mm / 6장', summary: '계절마다 한 장씩, 여섯 가지 망점 그림 엽서.',
    mock: { type: 'postcard', theme: 'paper', shape: 'vase' } },
  { id: 'c2', name: '잉크 엽서 세트', category: 'postcard', price: 8000, badges: [], images: [],
    spec: '148×100mm / 5장', summary: '네이비 바탕에 세이지 점을 찍은 엽서 다섯 장.',
    mock: { type: 'postcard', theme: 'navy', shape: 'sphere' } },
  { id: 's1', name: '도트 그리드 노트', category: 'stationery', price: 11000, badges: [], images: [],
    spec: 'A5 / 96쪽 / 실제본', summary: '5mm 점 격자 속지, 펼치면 평평하게 눕는 노트.',
    mock: { type: 'note', theme: 'navy', shape: 'drum' } },
];

// ===== 인쇄 서비스 (고정가 패키지) =====
// 금액은 화면 표시용. 결제를 붙일 때 서버가 같은 데이터로 금액을 다시 확인해야 한다.
// cover: 홈에서 3D 책 표지로 보일 모양 (theme: paper | navy | green, shape: sphere | drum | vase | arch)
const SERVICES = [
  { id: 's-cover', name: '표지 디자인', en: 'Cover', price: 330000,
    period: '7영업일', drafts: '2종', revisions: '2회',
    includes: ['앞표지, 책등, 뒤표지, 날개', '인쇄용 PDF와 홍보용 이미지'],
    summary: '책의 첫인상을 정하는 표지를 디자인합니다. 원고와 원하는 분위기를 바탕으로 두 가지 방향을 제안해요.', delivery: '이메일로 파일 전달',
    cover: { theme: 'paper', shape: 'sphere' } },
  { id: 's-layout', name: '내지 편집 디자인', en: 'Layout', price: 550000,
    period: '14영업일', drafts: '1종', revisions: '2회',
    includes: ['200쪽 이내 본문 편집', '목차, 장 표지, 판권면'],
    summary: '읽기 편한 본문을 만듭니다. 판형과 글꼴, 여백을 정하고 원고 전체를 페이지로 짜요.', delivery: '이메일로 파일 전달',
    cover: { theme: 'navy', shape: 'arch' } },
  { id: 's-bundle', name: '표지 + 내지 패키지', en: 'Cover & Layout', price: 790000, originalPrice: 880000,
    period: '21영업일', drafts: '2종', revisions: '3회',
    includes: ['표지 디자인과 내지 편집 전체', 'ISBN 신청용 판권면 정리'],
    summary: '표지와 본문을 한 디자이너가 함께 맡아 책 전체의 결을 맞춥니다.', delivery: '이메일로 파일 전달',
    cover: { theme: 'green', shape: 'vase' } },
  { id: 's-print', name: '소량 인쇄', en: 'Short Run', price: 290000,
    period: '파일 확정 후 7영업일', drafts: '없음', revisions: '교정지 1회',
    includes: ['A5(148×210mm) 무선제본 50부', '120쪽 이내, 표지 컬러·본문 흑백'],
    summary: '완성된 인쇄용 파일로 책 50부를 찍어 보내드려요. 교정지를 먼저 확인한 뒤 본 인쇄에 들어갑니다.', delivery: '택배 무료',
    cover: { theme: 'paper', shape: 'drum' } },
];

// 작업물 (홈의 펼침면 뷰어에서 한 작업 = 한 펼침면)
const WORKS = [
  { id: 'w1', title: '바다의 문법', kind: '에세이 · 표지와 내지', size: '128×188mm', pages: '216쪽', binding: '무선제본',
    note: '파도 사진을 망점으로 다시 그려 표지 전체를 채웠습니다.', art: { theme: 'paper', shape: 'sphere' } },
  { id: 'w2', title: '오후 네 시의 방', kind: '사진집 · 표지', size: '210×260mm', pages: '96쪽', binding: '양장',
    note: '창으로 들어오는 빛의 각도를 표지 그래픽으로 옮겼습니다.', art: { theme: 'navy', shape: 'arch' } },
  { id: 'w3', title: '일하는 방식', kind: '브랜드북 · 내지 편집', size: '170×240mm', pages: '64쪽', binding: '중철',
    note: '두 가지 잉크만으로 도표와 사진을 모두 정리했습니다.', art: { theme: 'green', shape: 'vase' } },
  { id: 'w4', title: '작은 숲', kind: '시집 · 소량 인쇄', size: '110×178mm', pages: '88쪽', binding: '무선제본',
    note: '손에 쥐기 좋은 작은 판형으로 50부를 찍었습니다.', art: { theme: 'paper', shape: 'drum' } },
];

// 패키지 취소·환불 규정 (예시 문구 — 실제 운영 정책으로 바꿔야 함)
const SERVICE_REFUND = [
  '작업 착수 전에는 전액 환불해 드려요.',
  '첫 시안을 받기 전에는 결제 금액의 50%를 환불해 드려요.',
  '첫 시안을 받은 뒤에는 환불되지 않아요.',
  '소량 인쇄는 본 인쇄를 시작한 뒤 환불되지 않아요. 파손이나 인쇄 사고는 다시 인쇄해 드려요.',
];

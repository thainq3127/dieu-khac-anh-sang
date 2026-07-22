// tools/transform-html.mjs
// Apply: hero cleanup, video iframe replacement
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

// ═══════════════════════════════════════════════════
// 1. Remove hero-intro div (between hero-deck and hero-quote)
// ═══════════════════════════════════════════════════
{
  const introStart = html.indexOf('        <div class="hero-intro">');
  const blockquoteMarker = '        <blockquote class="hero-quote">';
  const blockquotePos = html.indexOf(blockquoteMarker);
  if (introStart !== -1 && blockquotePos > introStart) {
    // Remove everything from hero-intro up to (not including) the blockquote
    html = html.slice(0, introStart) + html.slice(blockquotePos);
  }
}

// ═══════════════════════════════════════════════════
// 2. Remove hero-quote blockquote (by class name, no content matching needed)
// ═══════════════════════════════════════════════════
{
  const startMarker = '        <blockquote class="hero-quote">';
  const endMarker   = '        </blockquote>';
  const start = html.indexOf(startMarker);
  if (start !== -1) {
    const end = html.indexOf(endMarker, start) + endMarker.length;
    // Consume trailing newline too
    const trailChar = html[end] === '\n' ? 1 : 0;
    html = html.slice(0, start) + html.slice(end + trailChar);
  }
}

// ═══════════════════════════════════════════════════
// 3. Preserve quote text as sr-only in intro-band
//    (copy exact bytes from source JSON to keep NFD encoding)
// ═══════════════════════════════════════════════════
{
  const srcText  = JSON.parse(readFileSync('source-page-text.json', 'utf8')).text;
  const quoteLine = srcText.split('\n').find(l => l.includes('Ch\u00e0o m\u1eebng L\u1ec5 Khai m\u1ea1c'));
  const marker   = '        <p class="intro-pull">';
  const idx = html.indexOf(marker);
  if (idx !== -1 && quoteLine) {
    html = html.slice(0, idx)
      + '        <p class="sr-only">' + quoteLine + '</p>\n'
      + html.slice(idx);
  }
}

// ═══════════════════════════════════════════════════
// 4. Replace video vcard link+thumbnail with YouTube iframes
// ═══════════════════════════════════════════════════
const videos = [
  {
    id:    '5PpEvxas5SQ',
    title: 'Khám phá vẻ đẹp di sản tháp Chăm ở Khánh Hòa | THDT',
    sub:   'Góc nhìn của Đài Phát thanh Truyền hình Đồng Tháp về di sản kiến trúc Chăm tại Khánh Hòa.',
  },
  {
    id:    '9h-tyEmgZnM',
    title: 'Kiến trúc Chăm ở tháp bà Ponagar',
    sub:   'Nét đặc sắc trong kiến trúc và điêu khắc của Tháp Bà Ponagar — di tích Chăm nổi tiếng nhất Việt Nam.',
  },
  {
    id:    'qGi_Rad7vHQ',
    title: 'Lễ hội Katê - di sản văn hóa phi vật thể của người Chăm',
    sub:   'Lễ hội lớn nhất, đặc sắc nhất của người Chăm — được công nhận di sản văn hóa phi vật thể quốc gia.',
  },
  {
    id:    'z-7iCxVyav0',
    title: 'Khám phá nguồn gốc và văn hóa Dân tộc Chăm',
    sub:   'Hành trình khám phá lịch sử, nguồn gốc và những nét văn hóa độc đáo của dân tộc Chăm.',
  },
];

for (const v of videos) {
  const linkMarker   = `watch?v=${v.id}`;
  const linkIdx      = html.indexOf(linkMarker);
  if (linkIdx === -1) { console.warn('Video not found:', v.id); continue; }

  const articleStart = html.lastIndexOf('        <article class="vcard"', linkIdx);
  const articleEnd   = html.indexOf('        </article>', linkIdx) + '        </article>'.length;

  const existing = html.slice(articleStart, articleEnd);

  // Extract sr-only paragraph from existing card
  const srStart = existing.indexOf('<p class="sr-only">');
  const srEnd   = existing.indexOf('</p>', srStart) + 4;
  const srPara  = srStart !== -1 ? existing.slice(srStart, srEnd) : '';

  const newArticle =
`        <article class="vcard" data-reveal>
          <div class="video-embed-wrap">
            <iframe
              src="https://www.youtube.com/embed/${v.id}"
              title="${v.title}"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
          </div>
          <div class="vcard-info">
            <h3>${v.title}</h3>
            <p class="vcard-sub">${v.sub}</p>
            ${srPara}
          </div>
        </article>`;

  html = html.slice(0, articleStart) + newArticle + html.slice(articleEnd);
}

writeFileSync('index.html', html, 'utf8');
console.log('Done — hero cleaned, videos replaced with iframes.');

// tools/fix-missing.mjs
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

// ─── 1. Add hero-intro paragraphs as sr-only in intro-band ───────────────
const para1 = 'Văn hóa Chăm là một phần đặc sắc trong nền văn hóa Việt Nam thống nhất và đa dạng. Trải qua nhiều thế hệ, cộng đồng Chăm đã gìn giữ một kho tàng di sản phong phú gồm kiến trúc tháp cổ, tín ngưỡng, lễ hội, âm nhạc, múa dân gian, nghề thủ công, trang phục, ngôn ngữ và tri thức dân gian.';
const para2 = 'Không chỉ là dấu tích của quá khứ, văn hóa Chăm vẫn hiện diện sinh động trong đời sống hôm nay. Mỗi lễ hội, mỗi điệu múa, mỗi tiếng trống Ginăng, Baranưng hay tiếng kèn Saranai đều là cách cộng đồng kể lại ký ức, niềm tin và bản sắc của mình. Việc bảo tồn văn hóa Chăm vì thế không chỉ là giữ lại di tích, mà còn là nuôi dưỡng một đời sống di sản đang tiếp tục vận động.';

// Insert before the first sr-only paragraph in intro-band
const introBandMarker = '    <div class="intro-band">';
const introBandIdx = html.indexOf(introBandMarker);
const firstSrOnly = html.indexOf('<p class="sr-only">', introBandIdx);
if (firstSrOnly !== -1) {
  const insert = '        <p class="sr-only">' + para1 + '</p>\n'
               + '        <p class="sr-only">' + para2 + '</p>\n';
  html = html.slice(0, firstSrOnly) + insert + html.slice(firstSrOnly);
} else {
  console.warn('intro-band sr-only marker not found');
}

// ─── 2. Add YouTube + duration back into each vcard-info ─────────────────
const videoMeta = [
  { id: '5PpEvxas5SQ', dur: '04:04' },
  { id: '9h-tyEmgZnM', dur: '04:45' },
  { id: 'qGi_Rad7vHQ', dur: '02:27' },
  { id: 'z-7iCxVyav0', dur: '24:23' },
];

for (const v of videoMeta) {
  const embedSrc = 'embed/' + v.id;
  const embedIdx = html.indexOf(embedSrc);
  if (embedIdx === -1) { console.warn('Not found:', v.id); continue; }

  const infoMarker = '<div class="vcard-info">';
  const infoIdx = html.indexOf(infoMarker, embedIdx);
  if (infoIdx === -1) { console.warn('vcard-info not found for:', v.id); continue; }

  // Insert after the opening > of <div class="vcard-info">
  const insertPos = infoIdx + infoMarker.length;
  const tagLine = '\n            <span class="vcard-tag">YouTube</span>'
                + '<span class="sr-only"> ' + v.dur + '</span>';
  html = html.slice(0, insertPos) + tagLine + html.slice(insertPos);
}

writeFileSync('index.html', html, 'utf8');
console.log('fix-missing: done');

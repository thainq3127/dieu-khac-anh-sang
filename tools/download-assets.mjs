import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const assetsDir = path.join(root, 'assets');
const imagesDir = path.join(assetsDir, 'images');
const fontsDir = path.join(assetsDir, 'fonts');

const imageAssets = [
  ['hero-tower.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/ueyxnk6jtgw0y0c/f949bcf126be4f769b9c2653f517016a/original/41.jpg'],
  ['culture-space.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/f00a5fc737394841aa3ce347e0b18ae4/optimized/7.jpg'],
  ['tower-detail-01.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/c5f26613c75f4fe99abeee9f71498d6f/optimized/38.jpg'],
  ['tower-detail-02.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/fe5752557b8c4cf098b99702010b6ed7/optimized/45.jpg'],
  ['intangible-01.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/5ea8bb91c3f34b5f80395253fae7a1da/original/42.jpg'],
  ['intangible-02.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/8163f411d56f40a5aeed7379f196e820/original/4.jpg'],
  ['intangible-03.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/f52058d93e15491e95b77ecb0ff8ee16/original/1.jpg'],
  ['heritage-tour-01.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/55dacca421b147ccac85e2fdc88a0cd4/original/14.jpg'],
  ['heritage-tour-02.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/e392c198052e449f937d638aa685a683/original/18.jpg'],
  ['heritage-tour-03.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/b39c1cedb4524fbbb1db0daf3f2d7465/original/27.jpg'],
  ['tour-card-01.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/9a376c44da4b49fab49b703f033d41eb/original/44.jpg'],
  ['tour-card-02.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/902a0c14a53641269e323d1b4a021ad8/original/45.jpg'],
  ['tour-card-03.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/height:400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/c5ec1134ac564ca6992f2d75aee9f10a/original/46.jpg'],
  ['preserve-wide.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/ueyxnk6jtgw0y0c/c4a5ef1d7f864b7a96cef64980982bf3/original/46.jpg'],
  ['closing-wide.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/https://cdn.gamma.app/ueyxnk6jtgw0y0c/a34a017c48394559bce38c24cfbcc08c/original/42.jpg'],
  ['background-brown.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/6ca5ae9bcba54c05895d9ca6042ead65/original/Background-Brown-2.jpg'],
  ['ponagar-wide.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/26d1141054844cd9b1542afcbf499e7d/original/1559544060_photo-by-almutalbrecht-po-nagar-cham-towers-1540098505-470105.jpg'],
  ['gallery-wide-01.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/cb46205568354d3cb869399cf9cfd895/original/43.jpg'],
  ['gallery-wide-02.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/2b6c0876c6d0423db3e119b9aa95f4d4/original/49.jpg'],
  ['gallery-square.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:1200/https://cdn.gamma.app/ueyxnk6jtgw0y0c/76f7b185866e406c8a1bfe8221ed906b/original/41.jpg'],
  ['gallery-wide-03.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/c0c4321c01b84d3ea46817f1be174e63/original/42.jpg'],
  ['gallery-wide-04.jpg', 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2400/https://cdn.gamma.app/ueyxnk6jtgw0y0c/029549802db84721bf19691ae2a8c284/original/50.jpg'],
  ['video-thdt.jpg', 'https://cdn.gamma.app/ueyxnk6jtgw0y0c/f9cd8d96b88d4f46bdcd9e105fb70533/original/maxresdefault.jpg'],
  ['video-ponagar.jpg', 'https://cdn.gamma.app/ueyxnk6jtgw0y0c/fb3a40cac9234225a7b5d25a268f3b6c/original/maxresdefault.jpg'],
  ['video-kate.jpg', 'https://cdn.gamma.app/ueyxnk6jtgw0y0c/1703f6cabadd4645b43d354948d02045/original/maxresdefault.jpg'],
  ['video-origin.jpg', 'https://cdn.gamma.app/ueyxnk6jtgw0y0c/4c0eb948e7874e27a908246dbdadb045/original/maxresdefault.jpg'],
  ['youtube-favicon-a.png', 'https://www.youtube.com/s/desktop/2e64e932/img/favicon_144x144.png'],
  ['youtube-favicon-b.png', 'https://www.youtube.com/s/desktop/8194554b/img/favicon_144x144.png'],
  ['site-favicon.jpg', 'https://van-hoa-cham-khanh-hoa-vefe02l.gamma.site/41-9433b299cf3c461e82650118c17547c1.jpg']
];

const fontStylesheets = [
  ['brygada-1918.css', 'https://fonts.googleapis.com/css2?family=Brygada%201918:wght@400;500;600;700&display=swap'],
  ['inter.css', 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap']
];

const manifest = {
  source: 'https://van-hoa-cham-khanh-hoa-vefe02l.gamma.site/v%C4%83n-h%C3%B3a-ch%C4%83m-kh%C3%A1nh-h%C3%B2a',
  generatedAt: new Date().toISOString(),
  images: {},
  fonts: []
};

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36'
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36'
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.text();
}

function fontFileName(url) {
  const parsed = new URL(url);
  const ext = path.extname(parsed.pathname) || '.woff2';
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 12);
  return `font-${hash}${ext}`;
}

async function downloadImages() {
  await mkdir(imagesDir, { recursive: true });
  for (const [fileName, url] of imageAssets) {
    const buffer = await fetchBuffer(url);
    await writeFile(path.join(imagesDir, fileName), buffer);
    manifest.images[fileName] = { url, bytes: buffer.length };
    console.log(`image ${fileName} ${buffer.length}`);
  }
}

async function downloadFonts() {
  await mkdir(fontsDir, { recursive: true });
  const localCss = [];
  for (const [cssName, cssUrl] of fontStylesheets) {
    let css = await fetchText(cssUrl);
    const matches = [...css.matchAll(/url\((https:\/\/[^)]+)\)/g)];
    for (const match of matches) {
      const fontUrl = match[1];
      const fileName = fontFileName(fontUrl);
      const buffer = await fetchBuffer(fontUrl);
      await writeFile(path.join(fontsDir, fileName), buffer);
      css = css.replaceAll(fontUrl, `./${fileName}`);
      manifest.fonts.push({ stylesheet: cssUrl, file: fileName, url: fontUrl, bytes: buffer.length });
      console.log(`font ${fileName} ${buffer.length}`);
    }
    await writeFile(path.join(fontsDir, cssName), css, 'utf8');
    localCss.push(`@import url('./${cssName}');`);
  }
  await writeFile(path.join(fontsDir, 'fonts.css'), `${localCss.join('\n')}\n`, 'utf8');
}

await mkdir(assetsDir, { recursive: true });
await downloadImages();
await downloadFonts();
await writeFile(path.join(assetsDir, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Downloaded ${Object.keys(manifest.images).length} images and ${manifest.fonts.length} font files.`);

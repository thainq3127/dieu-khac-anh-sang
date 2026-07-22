// tools/migrate-images.mjs
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';

// 1. Read environment variables from .env.local
let supabaseUrl = '';
let supabaseKey = '';

if (existsSync('.env.local')) {
  const envContent = readFileSync('.env.local', 'utf8');
  const matchUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/);
  const matchKey = envContent.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\s*=\s*(.+)/);
  if (matchUrl) supabaseUrl = matchUrl[1].trim();
  if (matchKey) supabaseKey = matchKey[1].trim();
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Lỗi: Không tìm thấy NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY trong .env.local');
  process.exit(1);
}

console.log('--- Cấu hình Supabase ---');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseKey.slice(0, 15)}...`);
console.log('------------------------\n');

// 2. Prompt user for credentials
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function run() {
  console.log('Để tải ảnh lên Supabase Storage và cập nhật database, vui lòng đăng nhập tài khoản Admin của bạn.');
  const email = await question('Email admin: ');
  const password = await question('Mật khẩu admin: ');
  rl.close();

  console.log('\nĐang kết nối và đăng nhập vào Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim()
  });

  if (authError) {
    console.error('Đăng nhập thất bại:', authError.message);
    process.exit(1);
  }

  console.log('Đăng nhập thành công! Bắt đầu quét dữ liệu...\n');

  // 3. Scan tables for local images starting with "/images/"
  console.log('--- Quét cơ sở dữ liệu ---');
  
  // A. Pages
  const { data: pages, error: pagesError } = await supabase.from('pages').select('id, slug, seo_image');
  if (pagesError) {
    console.error('Lỗi khi lấy dữ liệu bảng pages:', pagesError.message);
    process.exit(1);
  }
  
  // B. Content Blocks
  const { data: blocks, error: blocksError } = await supabase.from('content_blocks').select('id, page_id, block_type, content');
  if (blocksError) {
    console.error('Lỗi khi lấy dữ liệu bảng content_blocks:', blocksError.message);
    process.exit(1);
  }

  // C. Posts
  const { data: posts, error: postsError } = await supabase.from('posts').select('id, slug, cover_image, title, summary, content');
  if (postsError) {
    console.error('Lỗi khi lấy dữ liệu bảng posts:', postsError.message);
    process.exit(1);
  }

  // Find unique local image paths
  const localImageUrls = new Set();

  function findLocalImageUrls(obj) {
    if (typeof obj === 'string') {
      if (obj.startsWith('/images/')) {
        localImageUrls.add(obj);
      }
    } else if (Array.isArray(obj)) {
      for (const item of obj) {
        findLocalImageUrls(item);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        findLocalImageUrls(obj[key]);
      }
    }
  }

  // Scan pages
  for (const page of pages) {
    if (page.seo_image) findLocalImageUrls(page.seo_image);
  }

  // Scan blocks
  for (const block of blocks) {
    if (block.content) findLocalImageUrls(block.content);
  }

  // Scan posts
  for (const post of posts) {
    if (post.cover_image) findLocalImageUrls(post.cover_image);
    if (post.title) findLocalImageUrls(post.title);
    if (post.summary) findLocalImageUrls(post.summary);
    if (post.content) findLocalImageUrls(post.content);
  }

  console.log(`Tìm thấy ${localImageUrls.size} hình ảnh tĩnh cần di chuyển.`);
  if (localImageUrls.size === 0) {
    console.log('Không có hình ảnh tĩnh nào cần di chuyển. Hoàn tất!');
    process.exit(0);
  }

  console.log('\n--- Bắt đầu tải ảnh lên Supabase Storage ---');
  const replacementMap = {};

  for (const localUrl of localImageUrls) {
    const relativePath = localUrl.replace(/^\//, ''); // Removes leading slash
    const diskPath = path.join(process.cwd(), 'public', relativePath);
    
    if (!existsSync(diskPath)) {
      console.warn(`[Cảnh báo] File không tồn tại trên đĩa: ${diskPath} (Bỏ qua)`);
      continue;
    }

    const fileBuffer = readFileSync(diskPath);
    const fileName = path.basename(diskPath);
    const fileExt = path.extname(diskPath).toLowerCase().replace('.', '');
    
    // Determine Mime Type
    let mimeType = 'image/jpeg';
    if (fileExt === 'png') mimeType = 'image/png';
    else if (fileExt === 'webp') mimeType = 'image/webp';
    else if (fileExt === 'gif') mimeType = 'image/gif';
    else if (fileExt === 'svg') mimeType = 'image/svg+xml';

    // Clean name
    const cleanName = fileName
      .replace(/\.[^/.]+$/, "") // remove extension
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9-_]/g, '-'); // clean special characters

    const storagePath = `migrated/${cleanName}-${Date.now()}.${fileExt}`;

    try {
      console.log(`Tải lên: ${fileName} -> ${storagePath}...`);
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);

      replacementMap[localUrl] = publicUrl;
      console.log(`✓ Thành công: ${localUrl} -> ${publicUrl}\n`);
    } catch (err) {
      console.error(`✗ Lỗi khi tải ảnh ${fileName} lên storage:`, err.message);
    }
  }

  console.log('--- Cập nhật Cơ sở dữ liệu ---');

  function replaceImageUrls(obj) {
    if (typeof obj === 'string') {
      if (replacementMap[obj]) {
        return replacementMap[obj];
      }
    } else if (Array.isArray(obj)) {
      return obj.map(item => replaceImageUrls(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const nextObj = {};
      for (const key in obj) {
        nextObj[key] = replaceImageUrls(obj[key]);
      }
      return nextObj;
    }
    return obj;
  }

  // A. Update Pages Table
  let pagesUpdated = 0;
  for (const page of pages) {
    if (page.seo_image && replacementMap[page.seo_image]) {
      const newSeoImage = replacementMap[page.seo_image];
      const { error: updateError } = await supabase
        .from('pages')
        .update({ seo_image: newSeoImage, updated_at: new Date().toISOString() })
        .eq('id', page.id);
      
      if (updateError) {
        console.error(`Lỗi cập nhật page ${page.slug}:`, updateError.message);
      } else {
        pagesUpdated++;
      }
    }
  }
  console.log(`Đã cập nhật ${pagesUpdated} trang (pages).`);

  // B. Update Content Blocks Table
  let blocksUpdated = 0;
  for (const block of blocks) {
    if (block.content) {
      const updatedContent = replaceImageUrls(block.content);
      if (JSON.stringify(updatedContent) !== JSON.stringify(block.content)) {
        const { error: updateError } = await supabase
          .from('content_blocks')
          .update({ content: updatedContent, updated_at: new Date().toISOString() })
          .eq('id', block.id);
        
        if (updateError) {
          console.error(`Lỗi cập nhật block ID ${block.id}:`, updateError.message);
        } else {
          blocksUpdated++;
        }
      }
    }
  }
  console.log(`Đã cập nhật ${blocksUpdated} khối nội dung (content_blocks).`);

  // C. Update Posts Table
  let postsUpdated = 0;
  for (const post of posts) {
    const updatedCover = post.cover_image ? (replacementMap[post.cover_image] || post.cover_image) : post.cover_image;
    const updatedTitle = replaceImageUrls(post.title);
    const updatedSummary = replaceImageUrls(post.summary);
    const updatedContent = replaceImageUrls(post.content);

    const changes = {};
    if (updatedCover !== post.cover_image) changes.cover_image = updatedCover;
    if (JSON.stringify(updatedTitle) !== JSON.stringify(post.title)) changes.title = updatedTitle;
    if (JSON.stringify(updatedSummary) !== JSON.stringify(post.summary)) changes.summary = updatedSummary;
    if (JSON.stringify(updatedContent) !== JSON.stringify(post.content)) changes.content = updatedContent;

    if (Object.keys(changes).length > 0) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', post.id);

      if (updateError) {
        console.error(`Lỗi cập nhật bài viết ${post.slug}:`, updateError.message);
      } else {
        postsUpdated++;
      }
    }
  }
  console.log(`Đã cập nhật ${postsUpdated} bài viết (posts).`);

  console.log('\n--- Hoàn tất di chuyển ---');
  console.log(`Đã di chuyển thành công ${Object.keys(replacementMap).length} tệp lên Supabase Storage.`);
  console.log('Vui lòng khởi chạy lại Next.js server hoặc cập nhật cache để xem thay đổi.');
}

run().catch(err => {
  console.error('Lỗi không xác định:', err);
  process.exit(1);
});

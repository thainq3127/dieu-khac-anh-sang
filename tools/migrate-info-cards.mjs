// tools/migrate-info-cards.mjs
import { readFileSync, existsSync } from 'fs';
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

// 2. Prompt user for credentials if not passed as arguments
let email = process.argv[2];
let password = process.argv[3];

async function getCredentials() {
  if (email && password) {
    return { email, password };
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  console.log('Để di chuyển các blocks trong Supabase, vui lòng đăng nhập tài khoản Admin của bạn.');
  const inputEmail = await question('Email admin: ');
  const inputPassword = await question('Mật khẩu admin: ');
  rl.close();
  
  return { email: inputEmail, password: inputPassword };
}

async function run() {
  const creds = await getCredentials();
  email = creds.email;
  password = creds.password;

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

  console.log('Đăng nhập thành công! Bắt đầu quét các blocks cần migrate...\n');

  // Query all content_blocks
  const { data: blocks, error: fetchError } = await supabase
    .from('content_blocks')
    .select('*');

  if (fetchError) {
    console.error('Lỗi khi tải blocks:', fetchError.message);
    process.exit(1);
  }

  const infoCardBlocks = blocks.filter(b => b.block_type === 'split' && b.content && b.content.mediaType === 'info-cards');

  console.log(`Tìm thấy ${infoCardBlocks.length} block split dạng info-cards cần di chuyển.`);

  if (infoCardBlocks.length === 0) {
    console.log('Không có block nào cần di chuyển.');
    return;
  }

  for (const block of infoCardBlocks) {
    console.log(`\nĐang migrate block ID: ${block.id}`);
    console.log(`Tiêu đề: ${JSON.stringify(block.content.title)}`);

    const newContent = { ...block.content };
    delete newContent.mediaType;

    const { error: updateError } = await supabase
      .from('content_blocks')
      .update({
        block_type: 'split_cards',
        content: newContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', block.id);

    if (updateError) {
      console.error(`Lỗi khi cập nhật block ${block.id}:`, updateError.message);
    } else {
      console.log(`-> Đã migrate block ${block.id} sang split_cards thành công!`);
    }
  }

  console.log('\nQuá trình di chuyển hoàn tất!');
}

run();

import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseKey = '';

if (existsSync('.env.local')) {
  const envContent = readFileSync('.env.local', 'utf8');
  const matchUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/);
  const matchKey = envContent.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\s*=\s*(.+)/);
  if (matchUrl) supabaseUrl = matchUrl[1].trim().replace(/['";]/g, '');
  if (matchKey) supabaseKey = matchKey[1].trim().replace(/['";]/g, '');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const { data: page } = await supabase
  .from('pages')
  .select('id')
  .eq('slug', 'ponagar')
  .single();

if (page) {
  const { data: blocks } = await supabase
    .from('content_blocks')
    .select('id, block_type, sort_order, content')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true });
  console.log(JSON.stringify(blocks, null, 2));
} else {
  console.log('Page not found');
}

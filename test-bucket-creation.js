// Quick test to check if bucket was created
require('dotenv').config({ path: '.env.local' });

async function checkBucket() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  console.log('🔍 Checking for images bucket...\n');
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log('📦 Available buckets:');
  buckets.forEach(bucket => {
    console.log(`  • ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
  });
  
  const imagesBucket = buckets.find(b => b.name === 'images');
  
  if (imagesBucket) {
    console.log('\n✅ Images bucket found!');
    console.log(`   Public: ${imagesBucket.public}`);
    console.log('   Your upload functionality should work now.');
  } else {
    console.log('\n❌ Images bucket not found yet.');
    console.log('   Please create it in the Supabase dashboard.');
  }
}

checkBucket();
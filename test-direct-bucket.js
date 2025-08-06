// Test direct access to images bucket
require('dotenv').config({ path: '.env.local' });

async function testDirectBucketAccess() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  console.log('🔍 Testing direct access to images bucket...\n');
  
  // Test 1: Try to list files in the bucket (even if bucket listing fails)
  console.log('📁 Testing file listing in images bucket...');
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('');
    
    if (listError) {
      console.log('❌ List error:', listError.message);
      console.log('Error details:', listError);
    } else {
      console.log('✅ Can access images bucket!');
      console.log('Files found:', files?.length || 0);
    }
  } catch (err) {
    console.log('❌ Exception accessing bucket:', err.message);
  }
  
  // Test 2: Try to upload a small test file
  console.log('\n📤 Testing upload to images bucket...');
  try {
    const testContent = 'test upload';
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`test-uploads/${testFileName}`, new Blob([testContent], { type: 'text/plain' }));
    
    if (uploadError) {
      console.log('❌ Upload error:', uploadError.message);
      console.log('Error details:', uploadError);
    } else {
      console.log('✅ Upload successful!');
      console.log('Upload data:', uploadData);
      
      // Try to get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(`test-uploads/${testFileName}`);
      
      console.log('📎 Public URL:', urlData.publicUrl);
      
      // Clean up
      await supabase.storage.from('images').remove([`test-uploads/${testFileName}`]);
      console.log('🧹 Test file cleaned up');
    }
  } catch (err) {
    console.log('❌ Exception during upload:', err.message);
  }
}

testDirectBucketAccess();
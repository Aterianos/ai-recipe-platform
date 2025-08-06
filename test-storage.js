// Test Supabase storage bucket
require('dotenv').config({ path: '.env.local' });

async function testStorage() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 Testing Supabase Storage...\n');
    console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Not found');
    console.log('Supabase Key:', supabaseKey ? 'Found (hidden)' : 'Not found');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test: List buckets
    console.log('\n📦 Testing bucket access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      throw new Error(`Bucket list error: ${bucketError.message}`);
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Check if 'images' bucket exists
    const imagesBucket = buckets.find(b => b.name === 'images');
    if (!imagesBucket) {
      throw new Error('Images bucket not found!');
    }
    
    console.log('✅ Images bucket found:', imagesBucket);
    
    // Test: Try to upload a small test file
    console.log('\n📤 Testing upload functionality...');
    const testContent = 'Hello, this is a test file!';
    const testFileName = `test-${Date.now()}.txt`;
    const testPath = `test-uploads/${testFileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(testPath, new Blob([testContent], { type: 'text/plain' }));
    
    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`);
    }
    
    console.log('✅ Upload successful:', uploadData);
    
    // Test: Get public URL
    console.log('\n🔗 Testing public URL generation...');
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(testPath);
    
    console.log('✅ Public URL generated:', urlData.publicUrl);
    
    // Test: List files in bucket
    console.log('\n📁 Testing file listing...');
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('test-uploads');
    
    if (listError) {
      console.warn('List error (might be normal if folder is new):', listError.message);
    } else {
      console.log('✅ Files in test-uploads folder:', files.length);
    }
    
    // Cleanup: Delete test file
    console.log('\n🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([testPath]);
    
    if (deleteError) {
      console.warn('Delete warning:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    console.log('\n🎉 Storage test completed successfully!');
    console.log('Your images bucket is ready for the app to use.');
    
  } catch (error) {
    console.error('❌ Storage test failed:', error.message);
    console.error('Please check your bucket configuration in Supabase dashboard.');
  }
}

testStorage();
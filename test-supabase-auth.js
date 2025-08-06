// Test Supabase connection and permissions
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 Testing Supabase Connection...\n');
    console.log('URL:', supabaseUrl);
    console.log('Key starts with:', supabaseKey?.substring(0, 20) + '...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Basic database connection
    console.log('\n🗄️ Testing database connection...');
    const { data: recipes, error: dbError } = await supabase
      .from('recipes')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('Database error:', dbError.message);
    } else {
      console.log('✅ Database connection successful');
    }
    
    // Test 2: Storage service availability
    console.log('\n📦 Testing storage service...');
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        console.error('Storage service error:', storageError);
        console.log('\n💡 This might mean:');
        console.log('1. Storage service is not enabled in your Supabase project');
        console.log('2. Your anon key doesn\'t have storage permissions');
        console.log('3. RLS policies are blocking access');
      } else {
        console.log('✅ Storage service accessible');
        console.log('Available buckets:', buckets?.map(b => `${b.name} (public: ${b.public})`));
        
        if (buckets?.length === 0) {
          console.log('\n⚠️ No buckets found. You need to create the "images" bucket in Supabase dashboard.');
        }
      }
    } catch (storageErr) {
      console.error('Storage service exception:', storageErr.message);
    }
    
    // Test 3: Auth status
    console.log('\n👤 Testing auth status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('Auth status: Not signed in (expected for anon key)');
    } else if (user) {
      console.log('Auth status: Signed in as', user.email);
    } else {
      console.log('Auth status: Anonymous (expected)');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testSupabaseConnection();
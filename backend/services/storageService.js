const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

let supabaseClient;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not set');
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  return supabaseClient;
}

function getBucketName() {
  return process.env.SUPABASE_BUCKET || 'card-images';
}

async function uploadCardImage({ filePath, fileName, userId, contentType }) {
  const supabase = getSupabaseClient();
  const bucket = getBucketName();
  const fileBuffer = await fs.readFile(filePath);
  const ext = path.extname(fileName) || '.jpg';
  const baseName = path.basename(fileName, ext);
  const safeUserId = userId ? String(userId) : 'anonymous';
  const objectPath = `cards/${safeUserId}/${Date.now()}-${baseName}${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(objectPath, fileBuffer, {
    contentType: contentType || 'application/octet-stream',
    upsert: false
  });

  if (error) {
    throw new Error(error.message || 'Failed to upload image');
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return {
    path: objectPath,
    publicUrl: data.publicUrl
  };
}

async function removeCardImage(imageKey) {
  if (!imageKey) return;
  const supabase = getSupabaseClient();
  const bucket = getBucketName();

  const { error } = await supabase.storage.from(bucket).remove([imageKey]);

  if (error) {
    throw new Error(error.message || 'Failed to remove image');
  }
}

module.exports = {
  uploadCardImage,
  removeCardImage
};

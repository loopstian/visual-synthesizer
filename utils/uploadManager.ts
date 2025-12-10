import { supabase } from '@/lib/supabaseClient';

/**
 * Uploads an image file to Supabase Storage.
 * @param file The image file to upload
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export async function uploadImage(file: File): Promise<string | null> {
    try {
        // Generate unique filename
        const fileName = `${Date.now()}-${file.name}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, file);

        if (error) {
            console.error('Upload error:', error);
            return null;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Upload manager error:', error);
        return null;
    }
}

/**
 * Deletes an image from Supabase Storage.
 * @param publicUrl The public URL of the image to delete
 * @returns True if deletion was successful or URL is external, false if deletion failed
 */
export async function deleteImageFromStorage(publicUrl: string): Promise<boolean> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        // Check if this is actually a Supabase URL
        if (!supabaseUrl || !publicUrl.includes(supabaseUrl)) {
            // External URL (e.g., Unsplash), nothing to delete
            console.log('External URL detected, skipping storage deletion');
            return true;
        }

        // Extract filename from URL
        // URL format: https://{project}.supabase.co/storage/v1/object/public/uploads/filename.png
        const uploadsPart = '/uploads/';
        const uploadsIndex = publicUrl.indexOf(uploadsPart);

        if (uploadsIndex === -1) {
            console.warn('Could not extract filename from URL:', publicUrl);
            return false;
        }

        const filePath = publicUrl.substring(uploadsIndex + uploadsPart.length);

        // Delete from Supabase Storage
        const { error } = await supabase.storage
            .from('uploads')
            .remove([filePath]);

        if (error) {
            console.error('Storage deletion error:', error);
            return false;
        }

        console.log('Successfully deleted from storage:', filePath);
        return true;
    } catch (error) {
        console.error('Delete manager error:', error);
        return false;
    }
}

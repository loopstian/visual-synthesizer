
/**
 * Converts a Blob or File object to a Base64 Data URL string.
 */
export const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert blob to data URL'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Converts a Blob to a raw Base64 string (without the data: prefix).
 */
export const blobToBase64 = async (blob: Blob): Promise<string> => {
    const dataUrl = await blobToDataUrl(blob);
    return dataUrl.split(',')[1];
};

/**
 * Fetches a URL and returns it as a Blob.
 */
export const urlToBlob = async (url: string): Promise<Blob> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        return await response.blob();
    } catch (error) {
        console.error("Error converting URL to Blob:", error);
        throw error;
    }
};

/**
 * Gets the dimensions and aspect ratio of an image from a URL.
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number; aspectRatio: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight
            });
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
};

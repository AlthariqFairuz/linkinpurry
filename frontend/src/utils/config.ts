export const getImageUrl = (path: string | null) => {
 if (!path) return null;
 
 // For static images, use from frontend public
 if (path.startsWith('/images/')) {
   return path;  // Vite will handle this correctly
 }
 
 return path;
};
/**
 * Utilidad para comprimir imágenes antes de subirlas
 */

/**
 * Comprime una imagen reduciendo su tamaño y calidad
 * @param {File} file - Archivo de imagen original
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<File>} - Archivo comprimido
 */
export async function compressImage(file, options = {}) {
  const {
    maxSizeMB = 1.5, // Máximo 1.5MB por imagen (3 imágenes = 4.5MB límite de Vercel)
    maxWidthOrHeight = 1920,
    quality = 0.8,
    fileType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = height * (maxWidthOrHeight / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = width * (maxWidthOrHeight / height);
            height = maxWidthOrHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Intentar comprimir con diferentes calidades hasta alcanzar el tamaño objetivo
        const attemptCompression = (currentQuality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir imagen'));
                return;
              }

              const targetSize = maxSizeMB * 1024 * 1024;
              
              // Si el blob es lo suficientemente pequeño o ya bajamos mucho la calidad
              if (blob.size <= targetSize || currentQuality <= 0.5) {
                const compressedFile = new File([blob], file.name, {
                  type: fileType,
                  lastModified: Date.now()
                });
                
                console.log(`🗜️ Imagen comprimida: ${file.name}`);
                console.log(`   Original: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                console.log(`   Comprimida: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                console.log(`   Calidad: ${Math.round(currentQuality * 100)}%`);
                
                resolve(compressedFile);
              } else {
                // Intentar con menor calidad
                attemptCompression(currentQuality - 0.1);
              }
            },
            fileType,
            currentQuality
          );
        };
        
        attemptCompression(quality);
      };
      
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Comprime múltiples imágenes
 * @param {FileList|Array<File>} files - Archivos a comprimir
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<Array<File>>} - Array de archivos comprimidos
 */
export async function compressImages(files, options = {}) {
  const filesArray = Array.from(files);
  
  console.log(`🗜️ Comprimiendo ${filesArray.length} imágenes...`);
  
  const compressedFiles = await Promise.all(
    filesArray.map(file => compressImage(file, options))
  );
  
  const originalSize = filesArray.reduce((sum, file) => sum + file.size, 0);
  const compressedSize = compressedFiles.reduce((sum, file) => sum + file.size, 0);
  const savedPercentage = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  
  console.log(`✅ Compresión completada:`);
  console.log(`   Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Tamaño comprimido: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Reducción: ${savedPercentage}%`);
  
  return compressedFiles;
}

/**
 * Valida que las imágenes cumplan con los límites de tamaño
 * @param {FileList|Array<File>} files - Archivos a validar
 * @param {number} maxTotalSizeMB - Tamaño total máximo en MB
 * @returns {Object} - Resultado de validación
 */
export function validateImageSizes(files, maxTotalSizeMB = 4) {
  const filesArray = Array.from(files);
  const totalSize = filesArray.reduce((sum, file) => sum + file.size, 0);
  const totalSizeMB = totalSize / 1024 / 1024;
  
  return {
    isValid: totalSizeMB <= maxTotalSizeMB,
    totalSizeMB: parseFloat(totalSizeMB.toFixed(2)),
    maxSizeMB: maxTotalSizeMB,
    needsCompression: totalSizeMB > maxTotalSizeMB,
    files: filesArray.map(file => ({
      name: file.name,
      sizeMB: parseFloat((file.size / 1024 / 1024).toFixed(2))
    }))
  };
}

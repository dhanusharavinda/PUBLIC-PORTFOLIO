export interface ImageTransformOptions {
  aspectRatio: number;
  width: number;
  height: number;
  quality?: number;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to read selected image.'));
    };
    image.src = url;
  });
}

export async function cropAndResizeImage(file: File, options: ImageTransformOptions): Promise<File> {
  const image = await loadImage(file);
  const { aspectRatio, width, height, quality = 0.9 } = options;

  const sourceWidth = image.width;
  const sourceHeight = image.height;
  const sourceRatio = sourceWidth / sourceHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  let cropX = 0;
  let cropY = 0;

  if (sourceRatio > aspectRatio) {
    cropWidth = sourceHeight * aspectRatio;
    cropX = (sourceWidth - cropWidth) / 2;
  } else if (sourceRatio < aspectRatio) {
    cropHeight = sourceWidth / aspectRatio;
    cropY = (sourceHeight - cropHeight) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to process selected image.');
  }

  context.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );

  if (!blob) {
    throw new Error('Image transformation failed.');
  }

  const outputName = file.name.replace(/\.[^.]+$/, '') + '-optimized.jpg';
  return new File([blob], outputName, { type: 'image/jpeg' });
}

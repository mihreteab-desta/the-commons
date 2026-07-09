const IMAGE_BASE_URL = 'http://localhost:5000';
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

const toBackendImageUrl = (imagePath) => {
  if (!imagePath || imagePath === '/images/default-item.svg') return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (imagePath.startsWith('/images/')) return `${IMAGE_BASE_URL}${imagePath}`;
  if (imagePath.startsWith('images/')) return `${IMAGE_BASE_URL}/${imagePath}`;
  return imagePath;
};

export const getDefaultItemImageUrl = () => `${IMAGE_BASE_URL}/images/default-item.svg`;

export const getItemImageCandidates = (item) => {
  const candidates = [];
  const title = item?.title?.trim();
  const explicitImageUrl = toBackendImageUrl(item?.image_url);

  if (explicitImageUrl) {
    candidates.push(explicitImageUrl);
  }

  if (title) {
    const baseNames = [
      title,
      title.replace(/\s+/g, '-'),
      title.replace(/\s+/g, '_'),
      title.replace(/[()]/g, '').trim(),
      title.replace(/[()]/g, '').trim().replace(/\s+/g, '-'),
      title.replace(/[()]/g, '').trim().replace(/\s+/g, '_')
    ].filter(Boolean);

    IMAGE_EXTENSIONS.forEach((extension) => {
      baseNames.forEach((baseName) => {
        candidates.push(`${IMAGE_BASE_URL}/images/${encodeURIComponent(baseName)}.${extension}`);
      });
    });
  }

  candidates.push(getDefaultItemImageUrl());

  return [...new Set(candidates)];
};

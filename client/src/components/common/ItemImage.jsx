import React, { useEffect, useMemo, useState } from 'react';
import { getItemImageCandidates } from '../../utils/itemImages';

const ItemImage = ({ item, alt, className, style }) => {
  const candidates = useMemo(() => getItemImageCandidates(item), [item]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setCandidateIndex(0);
    setImageLoading(true);
  }, [candidates]);

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((currentIndex) => currentIndex + 1);
      setImageLoading(true);
      return;
    }

    setImageLoading(false);
  };

  return (
    <>
      {imageLoading && <div className="image-skeleton"></div>}
      <img
        src={candidates[candidateIndex]}
        alt={alt || item?.title || 'Item'}
        className={className}
        onLoad={() => setImageLoading(false)}
        onError={handleImageError}
        style={{ ...style, display: imageLoading ? 'none' : 'block' }}
      />
    </>
  );
};

export default ItemImage;

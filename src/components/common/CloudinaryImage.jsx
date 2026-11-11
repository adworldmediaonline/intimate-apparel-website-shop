'use client';

import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

/** Whether src is our image proxy URL (needs Next Image, not CldImage). */
const isProxyUrl = (src) =>
  typeof src === 'string' && src.startsWith('/api/image?');

/** Minimal blur placeholder for above-fold images (perceived performance) */
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAQIAAtAAAD/AAAAA';

const CloudinaryImage = ({
  src,
  alt,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, 1920px',
  priority = false,
  fetchPriority,
  className = '',
  style = {},
  loading = 'lazy',
  quality = 'auto',
  format = 'auto',
  dpr = 'auto',
  crop = 'fill',
  gravity = 'auto',
  preserveTransformations = false,
  removeBackground = false,
  objectFit = 'cover',
  deliveryType,
  ...props
}) => {
  // Ensure src has version number if it's a full URL
  const hasVersion = src?.includes('/v');
  if (src?.startsWith('http') && !hasVersion) {
  }

  // Don't pass loading prop if priority is true
  const loadingProp = priority ? {} : { loading };

  // Proxy URLs: use Next Image so "Save Image As" gets correct filename
  if (src && isProxyUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt || ''}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        fetchPriority={fetchPriority}
        className={className}
        style={{ ...style, objectFit }}
        loading={priority ? undefined : loading}
        unoptimized
        placeholder={priority ? 'blur' : undefined}
        blurDataURL={priority ? BLUR_DATA_URL : undefined}
        {...props}
      />
    );
  }

  // Combine style with objectFit
  const combinedStyle = {
    ...style,
    objectFit,
    aspectRatio: `${width}/${height}`,
  };

  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      fetchPriority={fetchPriority}
      className={className}
      style={combinedStyle}
      quality={quality}
      format={format}
      dpr={dpr}
      crop={crop}
      gravity={gravity}
      preserveTransformations={preserveTransformations}
      removeBackground={removeBackground}
      deliveryType={deliveryType}
      placeholder={priority ? 'blur' : undefined}
      blurDataURL={priority ? BLUR_DATA_URL : undefined}
      {...loadingProp}
      {...props}
    />
  );
};

export default CloudinaryImage;

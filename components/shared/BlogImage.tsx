import React from 'react';
import { BlogPost } from '../../types/seo';

interface BlogImageProps {
  post: BlogPost;
  className?: string;
  aspectRatio?: '16:9' | '4:3' | 'square';
  showTitle?: boolean;
}

/**
 * Consistent blog image component with placeholder generation
 * Ensures all posts have the same framing whether they have images or not
 */
const BlogImage: React.FC<BlogImageProps> = ({
  post,
  className = '',
  aspectRatio = '16:9',
  showTitle = false,
}) => {
  // Generate consistent placeholder URL
  const getPlaceholderUrl = (): string => {
    const searchTerm = post.target_keywords?.[0] || post.title.split(' ').slice(0, 3).join(' ') || 'Blog Post';
    const encodedKeyword = encodeURIComponent(searchTerm.substring(0, 50));
    return `https://placehold.co/1200x630/1a1a1a/f97316?text=${encodedKeyword}`;
  };

  const imageUrl = post.featured_image_url || getPlaceholderUrl();
  
  // Aspect ratio classes
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    'square': 'aspect-square',
  };

  const aspectClass = aspectRatioClasses[aspectRatio];

  return (
    <div className={`relative overflow-hidden rounded-lg ${aspectClass} ${className}`}>
      {post.featured_image_url ? (
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder on error
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.image-placeholder')) {
              const placeholder = document.createElement('div');
              placeholder.className = 'image-placeholder absolute inset-0 bg-gradient-to-br from-orange-500/10 via-blue-500/5 to-transparent flex items-center justify-center';
              const text = showTitle ? post.title : (post.target_keywords?.[0] || post.title.split(' ').slice(0, 3).join(' '));
              placeholder.innerHTML = `<div class="text-white/60 text-sm font-medium text-center px-4">${text.substring(0, 50)}${text.length > 50 ? '...' : ''}</div>`;
              parent.appendChild(placeholder);
            }
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-blue-500/5 to-transparent flex items-center justify-center">
          <div className="text-white/60 text-sm font-medium text-center px-4">
            {showTitle ? post.title : (post.target_keywords?.[0] || post.title.split(' ').slice(0, 3).join(' '))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogImage;


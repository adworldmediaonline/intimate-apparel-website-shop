'use client';

import { Button } from '@/components/ui/button';
import { notifySuccess } from '@/utils/toast';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

export interface SocialShareProps {
  /** URL to share */
  url: string;
  /** Title or text to share */
  title: string;
  /** Optional description */
  description?: string;
  /** Custom brand name for share text (default: "Intimate Apparel") */
  brandName?: string;
  /** Show label text (default: true) */
  showLabel?: boolean;
  /** Custom label text */
  labelText?: string;
  /** Variant: 'horizontal' | 'vertical' */
  variant?: 'horizontal' | 'vertical';
  /** Size of buttons */
  size?: 'sm' | 'lg' | 'default';
  /** Custom className for container */
  className?: string;
  /** Platforms to show (default: all) */
  platforms?: Array<'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'copy'>;
  /** Custom share text formatter */
  formatShareText?: (title: string, url: string, brandName: string) => string;
  /** Callback when share is successful */
  onShare?: (platform: string) => void;
  /** Show icon only (no text labels) */
  iconOnly?: boolean;
}

/**
 * Individual Share Button Component
 * Composable sub-component for each platform
 */
interface ShareButtonProps {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'copy';
  url: string;
  title: string;
  description?: string;
  brandName: string;
  size: 'sm' | 'lg' | 'default';
  formatShareText?: (title: string, url: string, brandName: string) => string;
  onShare?: (platform: string) => void;
  iconOnly?: boolean;
}

const ShareButton = ({
  platform,
  url,
  title,
  description,
  brandName,
  size,
  formatShareText,
  onShare,
  iconOnly = false,
}: ShareButtonProps) => {
  const getShareText = () => {
    if (formatShareText) {
      return formatShareText(title, url, brandName);
    }
    return `Check out ${title} on ${brandName}!`;
  };

  const handleShare = () => {
    const shareText = getShareText();
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;

      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${url}`)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;

      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;

      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;
        window.open(shareUrl, '_blank');
        break;

      case 'copy':
        handleCopyLink(url);
        break;
    }

    onShare?.(platform);
  };

  const handleCopyLink = async (linkUrl: string) => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      notifySuccess('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = linkUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      notifySuccess('Link copied to clipboard!');
    }
  };

  const platformConfig = {
    facebook: {
      icon: Facebook,
      label: 'Facebook',
      color: 'text-[#1877F2]',
      ariaLabel: 'Share on Facebook',
    },
    twitter: {
      icon: Twitter,
      label: 'Twitter',
      color: 'text-[#1DA1F2]',
      ariaLabel: 'Share on Twitter',
    },
    linkedin: {
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'text-[#0077B5]',
      ariaLabel: 'Share on LinkedIn',
    },
    whatsapp: {
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'text-[#25D366]',
      ariaLabel: 'Share on WhatsApp',
    },
    copy: {
      icon: LinkIcon,
      label: 'Copy Link',
      color: '',
      ariaLabel: 'Copy link',
    },
  };

  const config = platformConfig[platform];
  const Icon = config.icon;

  const sizeClasses = {
    sm: iconOnly ? 'h-9 w-9 p-0' : 'h-9 px-3 text-xs',
    default: iconOnly ? 'h-10 w-10 p-0' : 'h-10 px-4 text-sm',
    lg: iconOnly ? 'h-11 w-11 p-0' : 'h-11 px-5 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  return (
    <Button
      variant="outline"
      size={size}
      className={`${sizeClasses[size]} ${iconOnly ? 'flex items-center justify-center' : ''}`}
      onClick={handleShare}
      aria-label={config.ariaLabel}
      title={config.label}
    >
      <Icon className={`${iconSizes[size]} ${iconOnly ? '' : 'mr-2'} ${config.color}`} />
      {!iconOnly && <span>{config.label}</span>}
    </Button>
  );
};

/**
 * Share Label Component
 * Composable sub-component for the label section
 */
interface ShareLabelProps {
  showLabel: boolean;
  labelText: string;
  variant: 'horizontal' | 'vertical';
}

const ShareLabel = ({ showLabel, labelText, variant }: ShareLabelProps) => {
  if (!showLabel) return null;

  return (
    <div className="flex items-center gap-2">
      <Share2 className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{labelText}</span>
    </div>
  );
};

/**
 * Social Share Container Component
 * Main container with composition support
 */
interface SocialShareContainerProps {
  children: ReactNode;
  variant: 'horizontal' | 'vertical';
  className?: string;
}

const SocialShareContainer = ({
  children,
  variant,
  className = '',
}: SocialShareContainerProps) => {
  const containerClasses =
    variant === 'vertical'
      ? 'flex flex-col gap-3'
      : 'space-y-3';

  return (
    <div className={`${containerClasses} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Social Share Buttons Group Component
 * Composable sub-component for buttons container
 */
interface SocialShareButtonsProps {
  children: ReactNode;
  variant: 'horizontal' | 'vertical';
}

const SocialShareButtons = ({
  children,
  variant,
}: SocialShareButtonsProps) => {
  const buttonsClasses =
    variant === 'vertical'
      ? 'flex flex-col gap-2'
      : 'flex flex-wrap items-center gap-2';

  return <div className={buttonsClasses}>{children}</div>;
};

/**
 * SocialShare Component
 *
 * A reusable component for sharing content on social media platforms.
 * Follows composition design patterns with sub-components.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SocialShare
 *   url="https://example.com/product"
 *   title="Amazing Product"
 * />
 *
 * // Custom configuration
 * <SocialShare
 *   url={productUrl}
 *   title={productTitle}
 *   brandName="My Store"
 *   variant="vertical"
 *   platforms={['facebook', 'twitter', 'copy']}
 *   onShare={(platform) => console.log(`Shared on ${platform}`)}
 * />
 * ```
 */
export default function SocialShare({
  url,
  title,
  description,
  brandName = 'Intimate Apparel',
  showLabel = true,
  labelText = 'Share Product',
  variant = 'horizontal',
  size = 'sm',
  className = '',
  platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'copy'],
  formatShareText,
  onShare,
  iconOnly = false,
}: SocialShareProps) {
  return (
    <SocialShareContainer variant={variant} className={className}>
      <ShareLabel
        showLabel={showLabel}
        labelText={labelText}
        variant={variant}
      />
      <SocialShareButtons variant={variant}>
        {platforms.map(platform => (
          <ShareButton
            key={platform}
            platform={platform}
            url={url}
            title={title}
            description={description}
            brandName={brandName}
            size={size}
            formatShareText={formatShareText}
            onShare={onShare}
            iconOnly={iconOnly}
          />
        ))}
      </SocialShareButtons>
    </SocialShareContainer>
  );
}

// Export sub-components for advanced composition
export { ShareButton, ShareLabel, SocialShareContainer, SocialShareButtons };


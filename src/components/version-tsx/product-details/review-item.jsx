'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Star } from 'lucide-react';

// Consistent Rating Component
const ReviewRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <Star
          key={`full-${index}`}
          className="w-4 h-4 text-[var(--wf-sale)] fill-current"
        />
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <div className="relative w-4 h-4">
          <Star className="w-4 h-4 text-[var(--wf-sale)] fill-current" />
          <div
            className="absolute inset-0 bg-background"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          >
            <Star className="w-4 h-4 text-[var(--wf-sale)]" />
          </div>
        </div>
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <Star
          key={`empty-${index}`}
          className="w-4 h-4 text-muted-foreground/30"
        />
      ))}
    </div>
  );
};

const ReviewItem = ({ review }) => {
  const { rating, comment, name, email, createdAt, title, guestName, guestEmail } = review || {};

  // Generate initials from name or email
  const getInitials = () => {
    if (name || guestName) {
      return (name || guestName)
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email || guestEmail) {
      return (email || guestEmail).split('@')[0].slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'Recently';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" alt={name || email || guestName} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">
                    {name || email?.split('@')[0] || guestName || 'Anonymous'}
                  </h4>
                  {title && (
                    <Badge variant="secondary" className="text-xs">
                      {title}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ReviewRating rating={rating} />
              <span className="text-sm font-medium text-foreground">
                {rating}/5
              </span>
            </div>
          </div>

          {/* Review Content */}
          {comment && (
            <div className="pl-13">
              <p className="text-foreground leading-relaxed">{comment}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewItem;

'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Play, ExternalLink, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ProductVideoPlayerProps {
  videoId: string;
  productTitle?: string;
}

export default function ProductVideoPlayer({
  videoId,
  productTitle = 'Product',
}: ProductVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 py-0">
      {/* <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Youtube className="h-4 w-4 text-red-600" />
            Product Video
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs gap-1 h-7 px-2 hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch on YouTube"
            >
              <ExternalLink className="h-3 w-3" />
              YouTube
            </a>
          </Button>
        </div>
      </CardHeader> */}

      <CardContent className="p-0">
        <div className="relative w-full bg-black aspect-video group">
          {!isPlaying ? (
            <>
              {/* YouTube Thumbnail with Play Button Overlay */}
              <img
                src={thumbnailUrl}
                alt={`${productTitle} video thumbnail`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all duration-300">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="transform transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="Play video"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />

                    {/* Play button */}
                    <div className="relative bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-xl border-3 border-white/90">
                      <Play className="h-8 w-8 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </button>
              </div>

              {/* YouTube watermark */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1.5">
                  <Youtube className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-white text-[10px] font-medium">YouTube</span>
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute top-2 left-2">
                <div className="bg-black/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-white text-[10px] font-medium">
                  HD
                </div>
              </div>
            </>
          ) : (
            /* YouTube iframe player */
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={`${productTitle} - Product Video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          )}
        </div>

        {/* Compact video info footer */}
        {/* <div className="px-3 py-2 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Official Video
            </span>
            <span className="flex items-center gap-1">
              <Youtube className="h-3 w-3 text-red-600" />
              YouTube
            </span>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}


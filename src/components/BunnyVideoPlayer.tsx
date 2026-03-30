import { useEffect, useRef } from "react";

interface BunnyVideoPlayerProps {
  videoId: string;
  thumbnailUrl?: string;
  className?: string;
}

// Bunny.net Stream Library ID for SCHROOL
export function BunnyVideoPlayer({ videoId, thumbnailUrl, className = "" }: BunnyVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Default library ID for SCHROOL
  let libraryId = "360729";
  let actualVideoId = videoId;

  // Handle full URLs and extract library ID if present
  if (videoId.startsWith('http://') || videoId.startsWith('https://')) {
    try {
      const url = new URL(videoId);
      const parts = url.pathname.split('/').filter(Boolean);
      
      // Format: /embed/{libraryId}/{videoId}
      if (parts[0] === 'embed' && parts.length >= 3) {
        libraryId = parts[1];
        actualVideoId = parts[2];
      } else {
        // Fallback: just take the last part
        actualVideoId = parts[parts.length - 1];
      }
      
      // Remove extension if it's .mp4 (Bunny embed expects just the ID/filename)
      actualVideoId = actualVideoId.replace(/\.mp4$/, '');
    } catch (e) {
      console.error("Invalid video URL:", videoId);
    }
  }

  // Bunny.net embed URL format: https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${actualVideoId}?autoplay=false&preload=true`;

  // Don't render if no videoId
  if (!videoId) {
    return (
      <div className={`relative w-full bg-gray-100 flex items-center justify-center ${className}`} style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">No video available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ paddingBottom: "56.25%" }}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        loading="lazy"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        title="Lesson Video"
      />
    </div>
  );
}

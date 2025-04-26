"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiMaximize, 
  FiX, 
  FiZoomIn,
  FiZoomOut,
  FiPlay,
  FiHeart,
  FiShare2,
  FiGrid,
  FiImage
} from "react-icons/fi";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

interface ProductGalleryProps {
  images: string[];
  videos?: string[]; // Optional video URLs
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  images, 
  videos = [] 
}) => {
  const [mainImage, setMainImage] = useState(images[0] || "");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'grid'>('standard');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [showThumbnailsPreview, setShowThumbnailsPreview] = useState(false);
  const [thumbnailLayout, setThumbnailLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [hoveredThumbnail, setHoveredThumbnail] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  
  const allMedia = [...images, ...videos];
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const zoomLensRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // For drag functionality
  const x = useMotionValue(0);
  const dragConstraints = useRef<HTMLDivElement>(null);
  
  // Enhanced mobile detection with ResizeObserver
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  
  useEffect(() => {
    // Set initial values
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      
      // Use ResizeObserver for more efficient resize handling
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const width = entry.contentRect.width || window.innerWidth;
          setWindowWidth(width);
          setIsMobile(width < 768);
          
          // Force horizontal thumbnails on mobile
          if (width < 768 && thumbnailLayout === 'vertical') {
            setThumbnailLayout('horizontal');
          }
        }
      });
      
      resizeObserver.observe(document.body);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Handle previous image navigation
  const handlePrevious = useCallback(() => {
    if (allMedia.length <= 1) return;
    
    setImageLoaded(false);
    setIsVideoActive(false);
    setActiveVideoUrl(null);
    
    const newIndex = (currentIndex - 1 + allMedia.length) % allMedia.length;
    setCurrentIndex(newIndex);
    
    // Check if the new item is a video
    if (newIndex >= images.length) {
      setIsVideoActive(true);
      setActiveVideoUrl(videos[newIndex - images.length]);
    } else {
      setMainImage(images[newIndex]);
    }
  }, [currentIndex, allMedia, images, videos]);

  // Handle next image navigation
  const handleNext = useCallback(() => {
    if (allMedia.length <= 1) return;
    
    setImageLoaded(false);
    setIsVideoActive(false);
    setActiveVideoUrl(null);
    
    const newIndex = (currentIndex + 1) % allMedia.length;
    setCurrentIndex(newIndex);
    
    // Check if the new item is a video
    if (newIndex >= images.length) {
      setIsVideoActive(true);
      setActiveVideoUrl(videos[newIndex - images.length]);
    } else {
      setMainImage(images[newIndex]);
    }
  }, [currentIndex, allMedia, images, videos]);

  // Auto-scroll thumbnails when current image changes
  useEffect(() => {
    if (thumbnailsContainerRef.current) {
      const container = thumbnailsContainerRef.current;
      const thumbnail = container.children[currentIndex] as HTMLElement;
      
      if (thumbnail) {
        if (thumbnailLayout === 'horizontal') {
          const scrollLeft = thumbnail.offsetLeft - container.offsetWidth / 2 + thumbnail.offsetWidth / 2;
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        } else {
          const scrollTop = thumbnail.offsetTop - container.offsetHeight / 2 + thumbnail.offsetHeight / 2;
          container.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
      }
    }
  }, [currentIndex, thumbnailLayout]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'ArrowLeft') {
          handlePrevious();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'Escape') {
          setIsLightboxOpen(false);
          setIsZoomed(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrevious, handleNext]);

  // Handle magnifying glass effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    if (isZoomed) {
      // For zoom mode, just update position
      setZoomPosition({ x, y });
      
      // Update lens position
      if (zoomLensRef.current) {
        const lensWidth = zoomLensRef.current.offsetWidth;
        const lensHeight = zoomLensRef.current.offsetHeight;
        const lensLeft = e.clientX - left - lensWidth / 2;
        const lensTop = e.clientY - top - lensHeight / 2;
        
        // Constrain lens within image
        const boundedLeft = Math.max(0, Math.min(width - lensWidth, lensLeft));
        const boundedTop = Math.max(0, Math.min(height - lensHeight, lensTop));
        
        zoomLensRef.current.style.left = `${boundedLeft}px`;
        zoomLensRef.current.style.top = `${boundedTop}px`;
      }
    }
  };

  // Enhanced touch handling for better mobile experience
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isZoomed) return; // Don't interfere with native pinch zoom
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isZoomed) return;
    
    setTouchEnd({
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    });
    
    const deltaX = touchStart.x - e.changedTouches[0].clientX;
    const deltaY = touchStart.y - e.changedTouches[0].clientY;
    
    // Only process as swipe if horizontal movement is greater than vertical
    // and the movement is significant enough
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swiped left, go to next
        handleNext();
      } else {
        // Swiped right, go to previous
        handlePrevious();
      }
    }
  };

  // Toggle thumbnail layout
  const toggleThumbnailLayout = () => {
    setThumbnailLayout(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // Share product
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this product',
          text: 'I found this amazing product!',
          url: window.location.href,
        });
      } else {
        // Fallback
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Image variants for animation
  const imageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  // Variant for thumbnails
  const thumbnailVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  // Custom animation for the image counter
  const counterVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  // Responsive layout classes based on screen size
  const galleryLayoutClass = isMobile
    ? 'flex flex-col space-y-4' 
    : thumbnailLayout === 'vertical' 
      ? 'md:flex md:flex-row md:space-x-4' 
      : 'flex flex-col space-y-4';

  // Responsive thumbnail container classes
  const thumbnailsContainerClass = isMobile
    ? 'flex flex-row space-x-2 overflow-x-auto pb-2 hide-scrollbar snap-x'
    : thumbnailLayout === 'vertical'
      ? 'md:flex-col md:space-y-2 md:space-x-0 md:w-20 md:overflow-y-auto md:overflow-x-hidden md:max-h-[500px] md:pr-2'
      : 'flex space-x-2 overflow-x-auto pb-2 hide-scrollbar snap-x';

  // Responsive thumbnail size based on screen size
  const getThumbnailSize = () => {
    if (isMobile) {
      return 'w-16 h-16';
    } else {
      return thumbnailLayout === 'vertical' ? 'w-16 h-16' : 'w-20 h-20';
    }
  };

  return (
    <div className={`${galleryLayoutClass}`}>
      {/* Thumbnails - Vertical layout places them on the left */}
      {thumbnailLayout === 'vertical' && !isMobile && (
        <div 
          ref={thumbnailsContainerRef}
          className={thumbnailsContainerClass}
          onMouseEnter={() => setShowThumbnailsPreview(true)}
          onMouseLeave={() => setShowThumbnailsPreview(false)}
        >
          {allMedia.map((src, index) => {
            const isVideo = index >= images.length;
            return (
              <motion.button
                key={index}
                variants={thumbnailVariants}
                initial="initial"
                animate="animate"
                custom={index}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={() => setHoveredThumbnail(index)}
                onMouseLeave={() => setHoveredThumbnail(null)}
                onClick={() => {
                  setImageLoaded(false);
                  setCurrentIndex(index);
                  
                  if (isVideo) {
                    setIsVideoActive(true);
                    setActiveVideoUrl(videos[index - images.length]);
                    setMainImage('');
                  } else {
                    setIsVideoActive(false);
                    setActiveVideoUrl(null);
                    setMainImage(images[index]);
                  }
                }}
                className={`relative rounded-md overflow-hidden flex-shrink-0 border-2 transition-all duration-200 
                  ${getThumbnailSize()}
                  ${currentIndex === index
                    ? "border-indigo-500 shadow-md"
                    : "border-transparent hover:border-indigo-200"
                  }`}
              >
                {isVideo ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <FiPlay className="text-white" />
                  </div>
                ) : null}
                
                <Image
                  src={isVideo 
                    ? `https://picsum.photos/seed/${index}/200/200` // Placeholder for video thumbnail
                    : src
                  }
                  alt={`Product thumbnail ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  sizes="80px"
                />
                
                {currentIndex === index && (
                  <div className="absolute inset-0 bg-indigo-500/10"></div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 space-y-4">
        {/* Main image/video container */}
        <div 
          ref={imageContainerRef}
          className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isZoomed && setIsZoomed(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Gradient background for more visual appeal */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200"></div>
          
          {/* Video player */}
          {isVideoActive && activeVideoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <video
                ref={videoRef}
                src={activeVideoUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            </div>
          )}
          
          {/* Main product image with zoom effect */}
          {!isVideoActive && mainImage ? (
            <div className="relative h-full w-full">
              {/* Loading indicator */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
              
              {/* Actual image */}
              <motion.div 
                initial="hidden"
                animate={imageLoaded ? "visible" : "hidden"}
                variants={imageVariants}
                className="h-full w-full z-10"
              >
                <Image
                  src={mainImage}
                  alt="Product image"
                  fill
                  className={`object-contain transition-transform duration-300 ${
                    isZoomed ? 'scale-200' : ''
                  }`}
                  style={
                    isZoomed 
                      ? { 
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        } 
                      : undefined
                  }
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
              </motion.div>
              
              {/* Zoom lens for magnifying glass effect */}
              {isZoomed && (
                <div 
                  ref={zoomLensRef}
                  className="absolute w-20 h-20 border-2 border-white rounded-full pointer-events-none z-20 shadow-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(1px)',
                  }}
                />
              )}
            </div>
          ) : (
            !isVideoActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                No image available
              </div>
            )
          )}

          {/* Image navigation arrows - larger on mobile for touch targets */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 sm:p-2 rounded-full shadow-md z-20 transition-all duration-200 opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Previous image"
                style={{ width: isMobile ? 40 : 36, height: isMobile ? 40 : 36 }}
              >
                <FiChevronLeft size={isMobile ? 24 : 20} className="text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 sm:p-2 rounded-full shadow-md z-20 transition-all duration-200 opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Next image"
                style={{ width: isMobile ? 40 : 36, height: isMobile ? 40 : 36 }}
              >
                <FiChevronRight size={isMobile ? 24 : 20} className="text-gray-700" />
              </button>
            </>
          )}

          {/* Image counter with adjusted size for mobile */}
          {allMedia.length > 1 && (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={counterVariants}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full z-20 backdrop-blur-sm"
              >
                {currentIndex + 1} / {allMedia.length}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Controls overlay - more visible on mobile */}
          <div className={`absolute top-4 right-4 flex space-x-2 ${isMobile ? 'opacity-70' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200 z-20`}>
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 transition-transform hover:scale-110"
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              title={isZoomed ? "Zoom out" : "Zoom in"}
              style={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32 }}
            >
              {isZoomed ? <FiZoomOut size={isMobile ? 18 : 16} /> : <FiZoomIn size={isMobile ? 18 : 16} />}
            </button>

            {/* Show fullscreen button only if not on mobile or using iOS with limited fullscreen support */}
            <button
              onClick={() => {
                setIsLightboxOpen(true);
                setIsZoomed(false);
              }}
              className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 transition-transform hover:scale-110"
              aria-label="View fullscreen"
              title="View fullscreen"
              style={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32 }}
            >
              <FiMaximize size={isMobile ? 18 : 16} />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full shadow-md transition-transform hover:scale-110 ${
                isLiked 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-white hover:bg-gray-50 text-gray-700"
              }`}
              aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
              title={isLiked ? "Remove from favorites" : "Add to favorites"}
              style={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32 }}
            >
              <FiHeart size={isMobile ? 18 : 16} className={isLiked ? "fill-white" : ""} />
            </button>
            <button
              onClick={handleShare}
              className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 transition-transform hover:scale-110"
              aria-label="Share product"
              title="Share product"
              style={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32 }}
            >
              <FiShare2 size={isMobile ? 18 : 16} />
            </button>
          </div>

          {/* Mobile swipe instruction overlay */}
          {isMobile && !isVideoActive && (
            <div className="absolute top-1/3 inset-x-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                Swipe to navigate
              </div>
            </div>
          )}

          {/* 360 badge for improved UX */}
          <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold z-10 animate-pulse">
            360° View
          </div>
        </div>

        {/* Thumbnails - Horizontal layout optimized for mobile */}
        {(thumbnailLayout === 'horizontal' || isMobile) && (
          <div 
            ref={thumbnailsContainerRef}
            className={thumbnailsContainerClass}
            onMouseEnter={() => setShowThumbnailsPreview(true)}
            onMouseLeave={() => setShowThumbnailsPreview(false)}
          >
            {allMedia.map((src, index) => {
              const isVideo = index >= images.length;
              return (
                <motion.button
                  key={index}
                  variants={thumbnailVariants}
                  initial="initial"
                  animate="animate"
                  custom={index}
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setHoveredThumbnail(index)}
                  onMouseLeave={() => setHoveredThumbnail(null)}
                  onClick={() => {
                    setImageLoaded(false);
                    setCurrentIndex(index);
                    
                    if (isVideo) {
                      setIsVideoActive(true);
                      setActiveVideoUrl(videos[index - images.length]);
                      setMainImage('');
                    } else {
                      setIsVideoActive(false);
                      setActiveVideoUrl(null);
                      setMainImage(images[index]);
                    }
                  }}
                  className={`relative rounded-md overflow-hidden flex-shrink-0 border-2 snap-start transition-all duration-200 hover:opacity-95 
                    ${getThumbnailSize()}
                    ${currentIndex === index
                      ? "border-indigo-500 shadow-md"
                      : "border-transparent hover:border-indigo-200"
                    }`}
                >
                  {isVideo ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                      <FiPlay className="text-white" size={20} />
                    </div>
                  ) : null}
                  
                  <Image
                    src={isVideo 
                      ? `https://picsum.photos/seed/${index}/200/200` // Placeholder for video thumbnail
                      : src
                    }
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover object-center"
                    sizes="64px"
                  />
                  
                  {currentIndex === index && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-indigo-500/10 border-2 border-indigo-500 rounded-sm"
                    />
                  )}
                  
                  {/* Quick preview on hover */}
                  {showThumbnailsPreview && hoveredThumbnail === index && index !== currentIndex && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-24 left-1/2 -translate-x-1/2 w-32 h-32 rounded-md overflow-hidden shadow-lg z-30 border-2 border-white pointer-events-none"
                    >
                      <Image
                        src={isVideo 
                          ? `https://picsum.photos/seed/${index}/200/200` // Placeholder for video preview
                          : src
                        }
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover object-center"
                      />
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <FiPlay className="text-white" size={24} />
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile-optimized Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close button - larger on mobile for easier tapping */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white p-2 sm:p-3 rounded-full hover:bg-white/10 z-10 transition-transform hover:scale-110"
              aria-label="Close fullscreen view"
              style={{ width: isMobile ? 44 : 40, height: isMobile ? 44 : 40 }}
            >
              <FiX size={isMobile ? 28 : 24} />
            </motion.button>

            {/* Image counter with animation */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-6 left-6 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full"
            >
              {currentIndex + 1} / {allMedia.length}
            </motion.div>

            {/* Main fullscreen image or video */}
            <div 
              className="relative w-full h-full max-w-5xl max-h-[80vh] select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                ref={dragConstraints}
                className="w-full h-full overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isVideoActive && activeVideoUrl ? (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <video
                        src={activeVideoUrl}
                        className="max-w-full max-h-full"
                        controls
                        autoPlay
                        playsInline
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentIndex}
                      drag
                      dragConstraints={dragConstraints}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      style={{ x }}
                      className="relative w-full h-full cursor-grab active:cursor-grabbing"
                    >
                      <Image
                        src={mainImage}
                        alt={`Product image ${currentIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 80vw"
                      />
                      
                      {/* Subtle instruction for draggable image */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm pointer-events-none"
                      >
                        Drag to explore
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Navigation arrows for lightbox - enlarged on mobile */}
              {allMedia.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-3 sm:p-4 rounded-full text-white z-10 transition-transform hover:scale-110"
                    aria-label="Previous image"
                    style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
                  >
                    <FiChevronLeft size={isMobile ? 24 : 24} />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-3 sm:p-4 rounded-full text-white z-10 transition-transform hover:scale-110"
                    aria-label="Next image"
                    style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
                  >
                    <FiChevronRight size={isMobile ? 24 : 24} />
                  </motion.button>
                </>
              )}

              {/* Mobile-optimized thumbnail strip in lightbox */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 sm:mt-6 flex space-x-2 sm:space-x-3 overflow-x-auto max-w-full bg-white/5 backdrop-blur-sm p-2 sm:p-3 rounded-xl"
              >
                {allMedia.map((src, index) => {
                  const isVideo = index >= images.length;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                        
                        if (isVideo) {
                          setIsVideoActive(true);
                          setActiveVideoUrl(videos[index - images.length]);
                          setMainImage('');
                        } else {
                          setIsVideoActive(false);
                          setActiveVideoUrl(null);
                          setMainImage(images[index]);
                        }
                      }}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${
                        currentIndex === index
                          ? "ring-2 ring-white ring-offset-1 ring-offset-black"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      {isVideo ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                          <FiPlay className="text-white" />
                        </div>
                      ) : null}
                      
                      <Image
                        src={isVideo 
                          ? `https://picsum.photos/seed/${index}/200/200` // Placeholder
                          : src
                        }
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover object-center"
                        sizes="64px"
                      />
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Enhanced CSS to handle mobile styles */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Ensure images are properly sized on mobile */
        @media (max-width: 640px) {
          .object-contain {
            max-height: 80vh;
          }
        }
        
        /* Improve touch targets for mobile */
        @media (max-width: 640px) {
          button {
            min-width: 36px;
            min-height: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductGallery;
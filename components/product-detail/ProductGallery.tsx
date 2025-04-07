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
  const [touchStart, setTouchStart] = useState(0);
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
  
  // Determine if running on mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Handle touch events for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // If swipe distance is significant enough
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
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

  // Gallery layout based on thumbnail orientation
  const galleryLayoutClass = thumbnailLayout === 'vertical' 
    ? 'md:flex md:space-x-4' 
    : 'space-y-4';

  // Thumbnail layout class
  const thumbnailsContainerClass = thumbnailLayout === 'vertical'
    ? 'md:flex-col md:space-y-2 md:space-x-0 md:w-20 md:overflow-y-auto md:overflow-x-hidden md:max-h-[500px] md:pr-2'
    : 'flex space-x-2 overflow-x-auto pb-2 hide-scrollbar snap-x';

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
                  ${thumbnailLayout === 'vertical' ? 'w-16 h-16' : 'w-20 h-20 snap-start'}
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

          {/* Image navigation arrows */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-2 rounded-full shadow-md z-20 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Previous image"
              >
                <FiChevronLeft size={20} className="text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-2 rounded-full shadow-md z-20 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Next image"
              >
                <FiChevronRight size={20} className="text-gray-700" />
              </button>
            </>
          )}

          {/* Image counter with animation */}
          {allMedia.length > 1 && (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={counterVariants}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full z-20 backdrop-blur-sm"
              >
                {currentIndex + 1} / {allMedia.length}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Controls overlay - zoom, fullscreen, like, share */}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-md text-gray-700 transition-transform hover:scale-110"
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              title={isZoomed ? "Zoom out" : "Zoom in"}
            >
              {isZoomed ? <FiZoomOut size={16} /> : <FiZoomIn size={16} />}
            </button>
            <button
              onClick={() => {
                setIsLightboxOpen(true);
                setIsZoomed(false);
              }}
              className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-md text-gray-700 transition-transform hover:scale-110"
              aria-label="View fullscreen"
              title="View fullscreen"
            >
              <FiMaximize size={16} />
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
            >
              <FiHeart size={16} className={isLiked ? "fill-white" : ""} />
            </button>
            <button
              onClick={handleShare}
              className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-md text-gray-700 transition-transform hover:scale-110"
              aria-label="Share product"
              title="Share product"
            >
              <FiShare2 size={16} />
            </button>
          </div>

          {/* Layout toggle button */}
          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button
              onClick={toggleThumbnailLayout}
              className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-md text-gray-700 transition-transform hover:scale-110"
              aria-label="Toggle layout"
              title="Toggle thumbnail layout"
            >
              {thumbnailLayout === 'horizontal' ? <FiGrid size={16} /> : <FiImage size={16} />}
            </button>
          </div>

          {/* Zoom instruction overlay */}
          {!isZoomed && !isLightboxOpen && !isVideoActive && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                Click to zoom
              </div>
            </div>
          )}
          
          {/* 360 badge for improved UX */}
          <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold z-10 animate-pulse">
            360° View
          </div>
        </div>

        {/* Thumbnails - Horizontal layout places them on the bottom */}
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
                  className={`relative ${thumbnailLayout === 'vertical' ? 'w-full h-16' : 'w-20 h-20'} rounded-md overflow-hidden flex-shrink-0 border-2 snap-start transition-all duration-200 hover:opacity-95 ${
                    currentIndex === index
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

      {/* Lightbox / Fullscreen view with improved design */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white p-2 rounded-full hover:bg-white/10 z-10 transition-transform hover:scale-110"
              aria-label="Close fullscreen view"
            >
              <FiX size={24} />
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

              {/* Navigation arrows for lightbox with improved design */}
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-full text-white z-10 transition-transform hover:scale-110"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={24} />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-full text-white z-10 transition-transform hover:scale-110"
                    aria-label="Next image"
                  >
                    <FiChevronRight size={24} />
                  </motion.button>
                </>
              )}
            </div>

            {/* Thumbnail strip in lightbox with improved design */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex space-x-3 overflow-x-auto max-w-full bg-white/5 backdrop-blur-sm p-3 rounded-xl"
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
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add CSS for hide-scrollbar utility */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProductGallery;
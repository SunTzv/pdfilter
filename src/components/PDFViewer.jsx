import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Loader2 } from 'lucide-react';
import ErrorState from './ErrorState';

// Use a reliable worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const SVGFilters = ({ filters }) => {
  const temp = filters.temperature / 100; 
  const rT = 1 + (temp > 0 ? temp * 0.3 : 0);
  const bT = 1 - (temp < 0 ? temp * 0.3 : 0);
  
  const tint = filters.tint / 100;
  const gT = 1 - (tint < 0 ? tint * 0.3 : 0);
  const rT2 = 1 + (tint > 0 ? tint * 0.3 : 0);
  const bT2 = 1 + (tint > 0 ? tint * 0.3 : 0);

  const rMulti = rT * rT2;
  const gMulti = gT;
  const bMulti = bT * bT2;

  const shadows = filters.shadows / 100; 
  const highlights = filters.highlights / 100; 
  const blacks = filters.blacks / 100; 
  const whites = filters.whites / 100; 
  
  const intercept = shadows * 0.2 + blacks * 0.5;
  const slope = 1 - (highlights * 0.2) + (whites * 0.5);

  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <filter id="custom-color-filter">
        <feColorMatrix 
          type="matrix" 
          values={`
            ${rMulti} 0 0 0 0
            0 ${gMulti} 0 0 0
            0 0 ${bMulti} 0 0
            0 0 0 1 0
          `} 
        />
        <feComponentTransfer>
          <feFuncR type="linear" slope={slope} intercept={intercept} />
          <feFuncG type="linear" slope={slope} intercept={intercept} />
          <feFuncB type="linear" slope={slope} intercept={intercept} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
};

const PDFViewer = ({ file, filters }) => {
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    let localLoadingTask = null;

    const renderPDF = async () => {
      if (!file) return;
      
      try {
        setError(null);
        const arrayBuffer = await file.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);
        
        localLoadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await localLoadingTask.promise;
        if (isCancelled) return;

        const page = await pdf.getPage(1);
        if (isCancelled) return;
        
        // Optimize resolution: Cap the max dimension to 2000px to prevent toDataURL from hanging the browser
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const maxDimension = 2000;
        const largestDimension = Math.max(unscaledViewport.width, unscaledViewport.height);
        
        const baseScale = 1.5;
        const targetScale = (largestDimension * baseScale > maxDimension) 
          ? (maxDimension / largestDimension) 
          : baseScale;
          
        const viewport = page.getViewport({ scale: targetScale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
        
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
        
        if (!isCancelled) {
          // toDataURL can be extremely slow on massive canvases, hence the dynamic scale cap
          setImgSrc(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        if (err.name === 'RenderingCancelledException') {
          // Ignore cancelled renders
          return;
        }
        console.error("Error rendering PDF:", err);
        if (!isCancelled) {
          setError(err.message || "Failed to load PDF");
        }
      }
    };

    renderPDF();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      if (localLoadingTask) {
        // Destroy the loading task to free up the worker thread
        localLoadingTask.destroy().catch(() => {});
      }
    };
  }, [file]);

  const presetInvert = filters.presetInvert ? 'invert(100%) ' : '';
  const presetGrayscale = filters.presetGrayscale ? 'grayscale(100%) ' : '';
  const presetSepia = filters.presetSepia ? 'sepia(100%) ' : '';
  const presetWarm = filters.presetWarm ? 'sepia(40%) saturate(140%) hue-rotate(-10deg) ' : '';
  const presetCool = filters.presetCool ? 'sepia(30%) saturate(120%) hue-rotate(170deg) ' : '';
  const presetsStr = presetInvert + presetGrayscale + presetSepia + presetWarm + presetCool;

  const cssFilter = `
    ${presetsStr}
    brightness(${filters.brightness + (filters.exposure * 0.5)}%) 
    contrast(${filters.contrast}%) 
    saturate(${filters.saturation}%) 
    hue-rotate(${filters.hue}deg) 
    blur(${filters.blur}px) 
    opacity(${filters.opacity}%) 
    url(#custom-color-filter)
  `;

  const updatePosition = (clientX, allowOutside = false) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    
    // Only allow updating if inside the image bounds horizontally, or if dragging
    if (!allowOutside && (clientX < rect.left || clientX > rect.right)) return;
    
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  const handleMouseDown = (e) => {
    updatePosition(e.clientX, false);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      if (!isDragging) setIsDragging(true);
      // When dragging, we allow dragging slightly outside the image so it doesn't get stuck at 99% if you move fast
      updatePosition(e.clientX, true); 
    } else if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) setIsDragging(false);
  };

  return (
    <div 
      className="canvas-container" 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onDragStart={(e) => e.preventDefault()}
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        cursor: 'ew-resize',
        userSelect: 'none'
      }}
    >
      <SVGFilters filters={filters} />
      
      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : imgSrc ? (
        <div style={{ 
          position: 'relative', 
          height: '100%', 
          display: 'flex', 
          justifyContent: 'center',
          border: 'var(--brutal-border-heavy)',
          boxShadow: 'var(--brutal-shadow)',
          backgroundColor: 'var(--bg-color)',
          overflow: 'hidden'
        }}>
          {/* BEFORE LAYER (Original) */}
          <img 
            ref={imgRef}
            src={imgSrc} 
            alt="Original PDF"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            style={{ 
              maxHeight: '100%', 
              maxWidth: '100%', 
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
              display: 'block'
            }}
          />
          
          {/* AFTER LAYER (Filtered) */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
            transition: isDragging ? 'clip-path 0.08s ease-out' : 'clip-path 0.25s ease-out',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <img 
              src={imgSrc} 
              alt="Filtered PDF"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              style={{ 
                maxHeight: '100%', 
                maxWidth: '100%', 
                objectFit: 'contain',
                filter: cssFilter,
                userSelect: 'none',
                pointerEvents: 'none',
                display: 'block'
              }}
            />
          </div>

          {/* SLIDER LINE */}
          <div 
            className="comparison-slider" 
            style={{ 
              left: `calc(${sliderPos}%)`,
              transition: isDragging ? 'left 0.08s ease-out' : 'left 0.25s ease-out'
            }}
          />

          <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 10, pointerEvents: 'none' }}>
            <span className="brutal-btn" style={{ padding: '4px 12px', fontSize: '0.9rem', boxShadow: '4px 4px 0 #000' }}>Before</span>
          </div>
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 10, pointerEvents: 'none' }}>
            <span className="brutal-btn" style={{ padding: '4px 12px', fontSize: '0.9rem', boxShadow: '4px 4px 0 #000' }}>After</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          <div className="brutal-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', border: 'var(--brutal-border-heavy)', boxShadow: '8px 8px 0 var(--primary-color)' }}>
            <Loader2 size={32} style={{ color: 'var(--highlight-color)', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-color)' }}>Analyzing Document...</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;

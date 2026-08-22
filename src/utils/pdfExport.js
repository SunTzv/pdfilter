import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Export logic for the PDF
export const exportFilteredPDF = async (file, filters) => {
  const fileReader = new FileReader();
  
  return new Promise((resolve, reject) => {
    fileReader.onload = async function() {
      try {
        const typedarray = new Uint8Array(this.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        // We initialize jsPDF later when we know the dimensions of the first page
        let doc = null;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          
          // Optimize resolution: Cap the max dimension to 3000px for export
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          const maxDimension = 3000;
          const largestDimension = Math.max(unscaledViewport.width, unscaledViewport.height);
          
          const baseScale = 2.0;
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
          
          await page.render(renderContext).promise;
          
          // Now we have the rendered PDF page on a canvas.
          // Let's create a new canvas to apply the CSS filters.
          const filterCanvas = document.createElement('canvas');
          filterCanvas.width = canvas.width;
          filterCanvas.height = canvas.height;
          const filterCtx = filterCanvas.getContext('2d');
          
          // Construct the CSS filter string
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
          `;
          
          filterCtx.filter = cssFilter;
          filterCtx.drawImage(canvas, 0, 0);
          
          // If advanced filters are needed, manual pixel manipulation would be done here
          // For now, we apply the basic filters to the image data
          
          const imgData = filterCanvas.toDataURL('image/jpeg', 0.95);
          
          // Initialize jsPDF doc on first page
          if (pageNum === 1) {
            const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';
            // Use pts for dimensions as jsPDF uses them
            doc = new jsPDF({
              orientation: orientation,
              unit: 'px',
              format: [viewport.width, viewport.height]
            });
          } else {
            doc.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? 'landscape' : 'portrait');
          }
          
          doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
        }
        
        // Save the PDF
        doc.save(`filtered_${file.name}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.readAsArrayBuffer(file);
  });
};

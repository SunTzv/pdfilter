import pymupdf as fitz  # PyMuPDF
from PIL import Image
import concurrent.futures
import os
import tempfile
from pathlib import Path
from .filters import apply_preset, apply_custom, load_plugin_and_apply, PRESETS

def process_page(worker_args):
    """
    Worker function to process a single PDF page.
    Args:
        worker_args: Tuple containing:
            - input_path: path to original PDF
            - page_index: page number to process
            - dpi: resolution for rasterization
            - filter_kwargs: dictionary of filter arguments
            - temp_dir: directory to save the temporary page PDF
    Returns:
        Path to the temporary PDF containing the processed page, or raises Exception.
    """
    input_path, page_index, dpi, filter_kwargs, temp_dir = worker_args
    
    # Open read-only document instance for this worker
    doc = fitz.open(input_path)
    page = doc.load_page(page_index)
    
    # Rasterize page to pixmap
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    
    # Convert fitz.Pixmap to PIL.Image
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    
    # Apply filter logic
    preset = filter_kwargs.get("preset")
    plugin_path = filter_kwargs.get("plugin_path")
    
    if preset and preset in PRESETS:
        img = apply_preset(img, preset)
    elif plugin_path:
        img = load_plugin_and_apply(img, plugin_path)
    elif filter_kwargs.get("is_custom"):
        img = apply_custom(
            img,
            contrast=filter_kwargs.get("contrast", 1.0),
            brightness=filter_kwargs.get("brightness", 1.0),
            saturation=filter_kwargs.get("saturation", 1.0),
            invert=filter_kwargs.get("invert", False)
        )
        
    # Convert PIL Image back to PDF bytes
    # Save as JPEG in memory, then insert into a new PDF
    temp_pdf_path = os.path.join(temp_dir, f"page_{page_index:04d}.pdf")
    
    # Pillow allows saving directly to PDF
    img.save(temp_pdf_path, "PDF", resolution=dpi)
    
    doc.close()
    return temp_pdf_path

def process_pdf(input_path, output_path, dpi, filter_kwargs, progress_callback=None):
    """
    Main function to manage concurrent processing of the PDF.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")
        
    # Get total pages
    doc = fitz.open(input_path)
    total_pages = len(doc)
    doc.close()
    
    # Determine number of workers (leave 1 core free if possible)
    max_workers = max(1, (os.cpu_count() or 4) - 1)
    
    with tempfile.TemporaryDirectory() as temp_dir:
        worker_args_list = [
            (input_path, i, dpi, filter_kwargs, temp_dir) 
            for i in range(total_pages)
        ]
        
        temp_pdf_paths = [None] * total_pages
        
        # Process concurrently
        with concurrent.futures.ProcessPoolExecutor(max_workers=max_workers) as executor:
            future_to_index = {
                executor.submit(process_page, args): args[1]
                for args in worker_args_list
            }
            
            for future in concurrent.futures.as_completed(future_to_index):
                page_index = future_to_index[future]
                try:
                    result_path = future.result()
                    temp_pdf_paths[page_index] = result_path
                    if progress_callback:
                        progress_callback()
                except Exception as exc:
                    print(f"Page {page_index} generated an exception: {exc}")
                    raise
                    
        # Stitch back together
        out_doc = fitz.open()
        for page_pdf_path in temp_pdf_paths:
            if page_pdf_path and os.path.exists(page_pdf_path):
                page_doc = fitz.open(page_pdf_path)
                out_doc.insert_pdf(page_doc)
                page_doc.close()
            else:
                raise RuntimeError("A page failed to process correctly, missing temp file.")
                
        out_doc.save(output_path, garbage=3, deflate=True)
        out_doc.close()
        
    return True

import numpy as np
from PIL import Image, ImageEnhance, ImageOps
import importlib.util
import os
import sys

PRESETS = {
    "darkmode": "darkmode",
    "sepia": "sepia",
    "grayscale": "grayscale",
    "high-contrast": "high-contrast",
    "midnight": "midnight",
}

def _apply_sepia(img: Image.Image) -> Image.Image:
    # Convert image to numpy array
    img_data = np.array(img)
    # Ensure it is RGB
    if img_data.shape[2] == 4: # RGBA
        img_data = img_data[:, :, :3]
    
    # Sepia matrix
    sepia_matrix = np.array([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131]
    ])
    
    # Apply matrix multiplication
    sepia_img = img_data.dot(sepia_matrix.T)
    
    # Clip values to 0-255 and cast back to uint8
    sepia_img = np.clip(sepia_img, 0, 255).astype(np.uint8)
    return Image.fromarray(sepia_img, mode="RGB")

def apply_preset(img: Image.Image, preset: str) -> Image.Image:
    preset = preset.lower()
    
    if preset == "darkmode":
        return ImageOps.invert(img)
        
    elif preset == "sepia":
        return _apply_sepia(img)
        
    elif preset == "grayscale":
        return ImageOps.grayscale(img).convert("RGB")
        
    elif preset == "high-contrast":
        enhancer = ImageEnhance.Contrast(img)
        return enhancer.enhance(1.5)
        
    elif preset == "midnight":
        img = ImageOps.invert(img)
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(0.8)
        enhancer = ImageEnhance.Color(img)
        return enhancer.enhance(0.7)
        
    return img

def apply_custom(img: Image.Image, contrast: float = 1.0, brightness: float = 1.0, 
                 saturation: float = 1.0, invert: bool = False) -> Image.Image:
    
    if invert:
        img = ImageOps.invert(img)
        
    if contrast != 1.0:
        img = ImageEnhance.Contrast(img).enhance(contrast)
        
    if brightness != 1.0:
        img = ImageEnhance.Brightness(img).enhance(brightness)
        
    if saturation != 1.0:
        img = ImageEnhance.Color(img).enhance(saturation)
        
    # Note: Hue shifting in PIL is a bit tricky, often done by converting to HSV.
    # We will stick to Brightness, Contrast, Saturation, and Invert for now as they cover 99% of use cases.
    
    return img

def load_plugin_and_apply(img: Image.Image, plugin_path: str) -> Image.Image:
    """Loads a custom python script and calls its apply_filter function."""
    if not os.path.exists(plugin_path):
        raise FileNotFoundError(f"Plugin file not found: {plugin_path}")
        
    module_name = "pdfilter_custom_plugin"
    spec = importlib.util.spec_from_file_location(module_name, plugin_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load plugin from {plugin_path}")
        
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    
    if not hasattr(module, 'apply_filter'):
        raise ValueError(f"Plugin {plugin_path} must define an 'apply_filter(img: PIL.Image.Image) -> PIL.Image.Image' function.")
        
    return module.apply_filter(img)

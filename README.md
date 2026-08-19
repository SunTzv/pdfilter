# pdfilter

A universal, highly concurrent command-line tool to apply visual filters and color transformations to PDF documents. 

Reading PDFs shouldn't cause eye strain, and printing them shouldn't waste ink. `pdfilter` processes PDFs page-by-page concurrently, applying powerful visual filters (like Dark Mode and Sepia) to the pages while retaining high resolution.

## Installation

**Option 1: Quick Install (pipx - Recommended)**
The recommended way to install Python CLI applications is via `pipx`.
```bash
pipx install git+https://github.com/SunTzv/pdfilter.git
```

**Option 2: Using the Install Script (macOS/Linux)**
```bash
curl -sSL https://raw.githubusercontent.com/SunTzv/pdfilter/main/install.sh | bash
```

**Option 3: Using the Install Script (Windows)**
```powershell
irm https://raw.githubusercontent.com/SunTzv/pdfilter/main/install.ps1 | iex
```

## Uninstallation

If you installed via `pipx`:
```bash
pipx uninstall pdfilter
```
Or use the uninstaller script:

**macOS/Linux:**
```bash
curl -sSL https://raw.githubusercontent.com/SunTzv/pdfilter/main/uninstall.sh | bash
```

**Windows:**
```powershell
irm https://raw.githubusercontent.com/SunTzv/pdfilter/main/uninstall.ps1 | iex
```

## Usage

To apply a predefined filter to a PDF:
```bash
pdfilter input.pdf --preset darkmode
```
*This will automatically generate a new file named `input_darkmode.pdf`.*

### Presets
- `darkmode`: Standard white-to-black inversion (the classic). Great for handwritten notes.
- `sepia`: Warms up bright white backgrounds to a soft, brownish-yellow hue to reduce blue-light strain.
- `grayscale`: Strips all color data. Perfect for optimizing colorful documents before sending them to a laser printer.
- `high-contrast`: Pushes light grays to pure white and dark grays to pure black. Useful for poorly scanned documents.
- `midnight`: An aggressive dark mode that pushes backgrounds to true black (OLED friendly) and dims brightly colored ink to softer pastel variants.

### Custom Adjustments
You can manually dial in visual parameters without using a preset:
```bash
pdfilter input.pdf --custom --invert --brightness 0.8 --saturation 1.2
```

### High Resolution
By default, pages are processed at `150 DPI` to balance file size and visual fidelity. You can increase this if you need print-quality output (warning: this will increase processing time and file size):
```bash
pdfilter input.pdf --preset grayscale --dpi 300
```

## Architecture
`pdfilter` bypasses standard Python concurrency bottlenecks by using the `ProcessPoolExecutor` alongside `PyMuPDF`. It dynamically calculates the number of CPU cores available and processes multiple pages simultaneously, allowing for incredibly fast transformations on very large PDF files.

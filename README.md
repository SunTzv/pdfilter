# PDFilter

PDFilter is a client-side web application that allows you to easily apply visual filters to your PDF documents. Upload a PDF, adjust colors, apply presets, and export the modified PDF entirely in your browser without any server processing!

## Features

- **Client-Side Processing**: No documents are sent to a server. All processing is done locally in your browser.
- **Visual Filters**: Adjust brightness, contrast, saturation, hue, blur, and opacity.
- **Presets**: Apply quick presets like Invert, Grayscale, Sepia, Warm, and Cool.
- **Real-Time Preview**: Instantly see how your filters affect the document before exporting.
- **High-Quality Export**: Export the filtered PDF document while preserving aspect ratios and applying your visual changes.

## Getting Started

### Prerequisites

You need Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SunTzv/pdfilter.git
   cd pdfilter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:
```bash
npm run dev
```

### Build for Production

To build the application for production:
```bash
npm run build
```

## Technologies Used

- **React**: UI Framework
- **Vite**: Build Tool & Dev Server
- **pdfjs-dist**: PDF rendering
- **jspdf**: PDF generation and export
- **lucide-react**: Icons

## License

This project is licensed under the MIT License.

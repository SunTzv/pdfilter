import React, { useState, useEffect } from 'react';
import { Sun, Moon, Upload, Download } from 'lucide-react';
import PDFViewer from './components/PDFViewer';
import Controls from './components/Controls';
import './index.css';
import { exportFilteredPDF } from './utils/pdfExport';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  
  // Filter states
  const defaultFilters = {
    hue: 0,
    saturation: 100,
    contrast: 100,
    brightness: 100,
    exposure: 0,
    temperature: 0,
    tint: 0,
    shadows: 0,
    highlights: 0,
    blacks: 0,
    whites: 0,
    sharpness: 0,
    blur: 0,
    opacity: 100,
    presetInvert: false,
    presetGrayscale: false,
    presetSepia: false,
    presetWarm: false,
    presetCool: false
  };

  const [filters, setFilters] = useState(defaultFilters);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleExport = async () => {
    if (!pdfFile) return;
    try {
      await exportFilteredPDF(pdfFile, filters);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. See console for details.");
    }
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="app-container">
      <main className="main-content" style={{ justifyContent: pdfFile ? 'flex-start' : 'center', alignItems: pdfFile ? 'stretch' : 'center', paddingTop: pdfFile ? '0' : '0' }}>
        {pdfFile ? (
          <>
            <aside className="sidebar">
              <Controls 
                filters={filters} 
                setFilters={setFilters} 
                onReset={handleReset} 
                onExport={handleExport}
                onUpload={() => document.getElementById('file-upload').click()}
              />
              {/* Hidden file input used by Controls and Welcome screen */}
              <input 
                id="file-upload" 
                type="file" 
                accept="application/pdf" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
            </aside>
            <section className="preview-area">
              <PDFViewer file={pdfFile} filters={filters} />
            </section>
          </>
        ) : (
          <div className="brutal-card" style={{ textAlign: 'center', maxWidth: '500px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Upload size={64} style={{ opacity: 1, marginBottom: '24px', color: 'var(--highlight-color)' }} />
            <h2 style={{ marginBottom: '16px', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>PDFilter</h2>
            <p style={{ opacity: 0.9, marginBottom: '32px', lineHeight: '1.6', fontSize: '1.1rem' }}>
              Command your documents! Upload a PDF to strategically apply color grades and deploy tactical filters in real-time. Every page will be conquered upon export.
            </p>
            <button className="brutal-btn primary" onClick={() => document.getElementById('file-upload-main').click()} style={{ fontSize: '1.2rem', padding: '16px 40px' }}>
              Select a PDF
            </button>
            <input 
              id="file-upload-main" 
              type="file" 
              accept="application/pdf" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
          </div>
        )}
      </main>
      <footer style={{
        padding: '24px 16px',
        textAlign: 'center',
        borderTop: 'var(--brutal-border-heavy)',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        zIndex: 10
      }}>
        <div style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem', marginBottom: '8px' }}>
          PDFilter &copy; {new Date().getFullYear()} • <a href="https://github.com/SunTzv" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', borderBottom: '2px solid var(--primary-color)' }}>SunTzv</a>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--highlight-color)', opacity: 0.8, fontStyle: 'italic', letterSpacing: '0.5px' }}>
          "The supreme art of war is to subdue the enemy without fighting."
        </div>
      </footer>
    </div>
  );
}

export default App;

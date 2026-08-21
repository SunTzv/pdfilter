import React, { useState, useEffect } from 'react';
import { Upload, Download, RotateCcw, ChevronDown, ChevronRight, Sparkles, SlidersHorizontal, Palette, SunMoon, ZoomIn } from 'lucide-react';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  return isMobile;
};

const Slider = ({ label, value, onChange, min = 0, max = 200, step = 1, unit = '%' }) => (
  <div className="brutal-slider-container">
    <div className="brutal-slider-header">
      <span>{label}</span>
      <span>{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

const PresetToggle = ({ label, active, onClick }) => (
  <button 
    className={`brutal-btn ${active ? 'highlight' : ''}`} 
    onClick={onClick}
    style={{ flex: '1 1 45%', fontSize: '0.8rem', padding: '8px', justifyContent: 'center', marginBottom: '8px' }}
  >
    {label}
  </button>
);

const ControlGroup = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="brutal-panel" style={{ marginBottom: '24px' }}>
      <h3 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          marginBottom: isOpen ? '16px' : '0', fontSize: '1.1rem', 
          borderBottom: isOpen ? '2px solid var(--text-color)' : 'none', 
          paddingBottom: isOpen ? '8px' : '0', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none'
        }}
      >
        {title}
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </h3>
      {isOpen && children}
    </div>
  );
};

// Render Helpers to keep code DRY
const RenderPresets = ({ filters, togglePreset }) => (
  <div className="presets-container" style={{ gap: '8px' }}>
    <PresetToggle label="Invert" active={filters.presetInvert} onClick={() => togglePreset('presetInvert')} />
    <PresetToggle label="Grayscale" active={filters.presetGrayscale} onClick={() => togglePreset('presetGrayscale')} />
    <PresetToggle label="Sepia" active={filters.presetSepia} onClick={() => togglePreset('presetSepia')} />
    <PresetToggle label="Warm" active={filters.presetWarm} onClick={() => togglePreset('presetWarm')} />
    <PresetToggle label="Cool" active={filters.presetCool} onClick={() => togglePreset('presetCool')} />
  </div>
);

const RenderBasic = ({ filters, handleChange }) => (
  <>
    <Slider label="Brightness" value={filters.brightness} onChange={(v) => handleChange('brightness', v)} />
    <Slider label="Contrast" value={filters.contrast} onChange={(v) => handleChange('contrast', v)} />
    <Slider label="Exposure" value={filters.exposure} min={-100} max={100} onChange={(v) => handleChange('exposure', v)} unit="" />
    <Slider label="Opacity" value={filters.opacity} onChange={(v) => handleChange('opacity', v)} />
  </>
);

const RenderColor = ({ filters, handleChange }) => (
  <>
    <Slider label="Saturation" value={filters.saturation} min={0} max={200} onChange={(v) => handleChange('saturation', v)} />
    <Slider label="Hue" value={filters.hue} min={-180} max={180} unit="°" onChange={(v) => handleChange('hue', v)} />
    <Slider label="Temperature" value={filters.temperature} min={-100} max={100} unit="" onChange={(v) => handleChange('temperature', v)} />
    <Slider label="Tint" value={filters.tint} min={-100} max={100} unit="" onChange={(v) => handleChange('tint', v)} />
  </>
);

const RenderLight = ({ filters, handleChange }) => (
  <>
    <Slider label="Highlights" value={filters.highlights} min={-100} max={100} unit="" onChange={(v) => handleChange('highlights', v)} />
    <Slider label="Shadows" value={filters.shadows} min={-100} max={100} unit="" onChange={(v) => handleChange('shadows', v)} />
    <Slider label="Whites" value={filters.whites} min={-100} max={100} unit="" onChange={(v) => handleChange('whites', v)} />
    <Slider label="Blacks" value={filters.blacks} min={-100} max={100} unit="" onChange={(v) => handleChange('blacks', v)} />
  </>
);

const RenderDetail = ({ filters, handleChange }) => (
  <>
    <Slider label="Sharpness" value={filters.sharpness} min={0} max={100} unit="" onChange={(v) => handleChange('sharpness', v)} />
    <Slider label="Blur" value={filters.blur} min={0} max={20} unit="px" onChange={(v) => handleChange('blur', v)} />
  </>
);


// DESKTOP CONTROLS (Accordion Style)
const DesktopControls = ({ filters, handleChange, togglePreset, onReset, onExport, onUpload }) => {
  return (
    <div style={{ paddingBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary-color)' }}>PDFilter</h2>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="brutal-btn" style={{ flex: 1 }} onClick={onUpload}>
          <Upload size={16} /> New File
        </button>
        <button className="brutal-btn primary" style={{ flex: 1 }} onClick={onExport}>
          <Download size={16} /> Export
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Filters</h3>
        <button className="brutal-btn" onClick={onReset} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
          <RotateCcw size={14} /> Reset All
        </button>
      </div>

      <ControlGroup title="Presets">
        <RenderPresets filters={filters} togglePreset={togglePreset} />
      </ControlGroup>
      <ControlGroup title="Basic Adjustments">
        <RenderBasic filters={filters} handleChange={handleChange} />
      </ControlGroup>
      <ControlGroup title="Color & Tone">
        <RenderColor filters={filters} handleChange={handleChange} />
      </ControlGroup>
      <ControlGroup title="Highlights & Shadows">
        <RenderLight filters={filters} handleChange={handleChange} />
      </ControlGroup>
      <ControlGroup title="Detail">
        <RenderDetail filters={filters} handleChange={handleChange} />
      </ControlGroup>
    </div>
  );
};


// MOBILE CONTROLS (Bottom Nav Style)
const MobileControls = ({ filters, handleChange, togglePreset, onReset, onExport, onUpload }) => {
  // Allow activeTab to be null (nothing open) to maximize PDF viewer space
  const [activeTab, setActiveTab] = useState(null);

  const tabs = [
    { id: 'presets', icon: Sparkles, label: 'Presets' },
    { id: 'basic', icon: SlidersHorizontal, label: 'Basic' },
    { id: 'color', icon: Palette, label: 'Color' },
    { id: 'light', icon: SunMoon, label: 'Light' },
    { id: 'detail', icon: ZoomIn, label: 'Detail' },
  ];

  const handleTabClick = (id) => {
    setActiveTab(prev => prev === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Top action row for mobile: more compact */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
          <button className="brutal-btn" style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }} onClick={onUpload}>
            <Upload size={14} /> New
          </button>
          <button className="brutal-btn primary" style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }} onClick={onExport}>
            <Download size={14} /> Export
          </button>
        </div>
        <button className="brutal-btn" onClick={onReset} style={{ fontSize: '0.8rem', padding: '8px 12px' }}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* ACTIVE TAB CONTENT OVERLAY */}
      <div style={{ 
        position: 'absolute', 
        bottom: '80px', // Just above the bottom nav
        left: '16px',
        right: '16px',
        zIndex: 100,
        pointerEvents: activeTab ? 'auto' : 'none',
        opacity: activeTab ? 1 : 0,
        transition: 'opacity 0.2s ease-out',
        transform: activeTab ? 'translateY(0)' : 'translateY(10px)'
      }}>
        {activeTab === 'presets' && (
          <div className="brutal-panel" style={{ boxShadow: '8px 8px 0 var(--primary-color)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '2px solid var(--text-color)', paddingBottom: '8px' }}>Presets</h3>
            <RenderPresets filters={filters} togglePreset={togglePreset} />
          </div>
        )}
        {activeTab === 'basic' && (
          <div className="brutal-panel" style={{ boxShadow: '8px 8px 0 var(--primary-color)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '2px solid var(--text-color)', paddingBottom: '8px' }}>Basic Adjustments</h3>
            <RenderBasic filters={filters} handleChange={handleChange} />
          </div>
        )}
        {activeTab === 'color' && (
          <div className="brutal-panel" style={{ boxShadow: '8px 8px 0 var(--primary-color)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '2px solid var(--text-color)', paddingBottom: '8px' }}>Color & Tone</h3>
            <RenderColor filters={filters} handleChange={handleChange} />
          </div>
        )}
        {activeTab === 'light' && (
          <div className="brutal-panel" style={{ boxShadow: '8px 8px 0 var(--primary-color)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '2px solid var(--text-color)', paddingBottom: '8px' }}>Highlights & Shadows</h3>
            <RenderLight filters={filters} handleChange={handleChange} />
          </div>
        )}
        {activeTab === 'detail' && (
          <div className="brutal-panel" style={{ boxShadow: '8px 8px 0 var(--primary-color)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '2px solid var(--text-color)', paddingBottom: '8px' }}>Detail</h3>
            <RenderDetail filters={filters} handleChange={handleChange} />
          </div>
        )}
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="bottom-nav-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


const Controls = ({ filters, setFilters, onReset, onExport, onUpload }) => {
  const isMobile = useIsMobile();

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const togglePreset = (key) => {
    setFilters(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      if (key === 'presetWarm' && newState.presetWarm) newState.presetCool = false;
      if (key === 'presetCool' && newState.presetCool) newState.presetWarm = false;
      return newState;
    });
  };

  const props = { filters, handleChange, togglePreset, onReset, onExport, onUpload };

  return isMobile ? <MobileControls {...props} /> : <DesktopControls {...props} />;
};

export default Controls;

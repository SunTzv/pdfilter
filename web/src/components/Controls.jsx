import React from 'react';
import { Upload, Download, RotateCcw } from 'lucide-react';

const ControlGroup = ({ title, children }) => (
  <div className="brutal-panel" style={{ marginBottom: '24px' }}>
    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', borderBottom: '2px solid var(--text-color)', paddingBottom: '8px' }}>
      {title}
    </h3>
    {children}
  </div>
);

const Slider = ({ label, value, onChange, min = 0, max = 200, step = 1, unit = '%' }) => {
  return (
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
};

const PresetToggle = ({ label, active, onClick }) => (
  <button 
    className={`brutal-btn ${active ? 'highlight' : ''}`} 
    onClick={onClick}
    style={{ 
      flex: '1 1 45%', 
      fontSize: '0.8rem', 
      padding: '8px', 
      justifyContent: 'center',
      marginBottom: '8px'
    }}
  >
    {label}
  </button>
);

const Controls = ({ filters, setFilters, onReset, onExport, onUpload }) => {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const togglePreset = (key) => {
    setFilters(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      // Optional: Prevent mutually exclusive presets from being active together
      if (key === 'presetWarm' && newState.presetWarm) newState.presetCool = false;
      if (key === 'presetCool' && newState.presetCool) newState.presetWarm = false;
      return newState;
    });
  };

  return (
    <div>
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <PresetToggle label="Invert" active={filters.presetInvert} onClick={() => togglePreset('presetInvert')} />
          <PresetToggle label="Grayscale" active={filters.presetGrayscale} onClick={() => togglePreset('presetGrayscale')} />
          <PresetToggle label="Sepia" active={filters.presetSepia} onClick={() => togglePreset('presetSepia')} />
          <PresetToggle label="Warm" active={filters.presetWarm} onClick={() => togglePreset('presetWarm')} />
          <PresetToggle label="Cool" active={filters.presetCool} onClick={() => togglePreset('presetCool')} />
        </div>
      </ControlGroup>

      <ControlGroup title="Basic Adjustments">
        <Slider label="Brightness" value={filters.brightness} onChange={(v) => handleChange('brightness', v)} />
        <Slider label="Contrast" value={filters.contrast} onChange={(v) => handleChange('contrast', v)} />
        <Slider label="Exposure" value={filters.exposure} min={-100} max={100} onChange={(v) => handleChange('exposure', v)} unit="" />
        <Slider label="Opacity" value={filters.opacity} onChange={(v) => handleChange('opacity', v)} />
      </ControlGroup>

      <ControlGroup title="Color & Tone">
        <Slider label="Saturation" value={filters.saturation} min={0} max={200} onChange={(v) => handleChange('saturation', v)} />
        <Slider label="Hue" value={filters.hue} min={-180} max={180} unit="°" onChange={(v) => handleChange('hue', v)} />
        <Slider label="Temperature" value={filters.temperature} min={-100} max={100} unit="" onChange={(v) => handleChange('temperature', v)} />
        <Slider label="Tint" value={filters.tint} min={-100} max={100} unit="" onChange={(v) => handleChange('tint', v)} />
      </ControlGroup>

      <ControlGroup title="Highlights & Shadows">
        <Slider label="Highlights" value={filters.highlights} min={-100} max={100} unit="" onChange={(v) => handleChange('highlights', v)} />
        <Slider label="Shadows" value={filters.shadows} min={-100} max={100} unit="" onChange={(v) => handleChange('shadows', v)} />
        <Slider label="Whites" value={filters.whites} min={-100} max={100} unit="" onChange={(v) => handleChange('whites', v)} />
        <Slider label="Blacks" value={filters.blacks} min={-100} max={100} unit="" onChange={(v) => handleChange('blacks', v)} />
      </ControlGroup>
      
      <ControlGroup title="Detail">
        <Slider label="Sharpness" value={filters.sharpness} min={0} max={100} unit="" onChange={(v) => handleChange('sharpness', v)} />
        <Slider label="Blur" value={filters.blur} min={0} max={20} unit="px" onChange={(v) => handleChange('blur', v)} />
      </ControlGroup>
    </div>
  );
};

export default Controls;

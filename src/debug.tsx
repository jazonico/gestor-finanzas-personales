import React from 'react';

const Debug: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Debug - Variables de Entorno</h1>
      <div style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
        <p><strong>VITE_SUPABASE_URL:</strong></p>
        <code>{import.meta.env.VITE_SUPABASE_URL || 'undefined ❌'}</code>
      </div>
      <div style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong></p>
        <code>{import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida ✅' : 'undefined ❌'}</code>
      </div>
      <div style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
        <p><strong>NODE_ENV:</strong></p>
        <code>{import.meta.env.NODE_ENV || 'undefined'}</code>
      </div>
      <div style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
        <p><strong>MODE:</strong></p>
        <code>{import.meta.env.MODE || 'undefined'}</code>
      </div>
    </div>
  );
};

export default Debug; 
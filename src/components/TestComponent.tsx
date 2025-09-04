export default function TestComponent() {
  console.log('🔴 TestComponent renderizado');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ff0000', 
      color: 'white', 
      fontSize: '24px', 
      padding: '20px',
      textAlign: 'center' 
    }}>
      <h1>🔴 COMPONENTE DE PRUEBA</h1>
      <p>Si ves esto, el routing funciona</p>
      <p>Hora: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

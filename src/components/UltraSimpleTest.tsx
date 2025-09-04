function UltraSimpleTest() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#00ff00',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontSize: '32px',
      color: 'black',
      fontWeight: 'bold'
    }}>
      <div>🟢 ULTRA SIMPLE TEST</div>
      <div style={{ fontSize: '16px', marginTop: '20px' }}>
        Si ves esta pantalla verde, el routing funciona
      </div>
      <div style={{ fontSize: '14px', marginTop: '10px' }}>
        Timestamp: {Date.now()}
      </div>
    </div>
  );
}

export default UltraSimpleTest;

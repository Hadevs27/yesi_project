export default function Home() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.statusIndicator}>
            <div style={styles.pulseNode}></div>
          </div>
          <h1 style={styles.title}>API Server Aktif</h1>
          <p style={styles.subtitle}>
            Sistem Backend <strong>Ai-CHA Smart System</strong> beroperasi dengan normal.
          </p>
          <div style={styles.divider}></div>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Engine:</strong> Next.js 15</li>
            <li style={styles.listItem}><strong>Database:</strong> Neon PostgreSQL (Connected)</li>
            <li style={styles.listItem}><strong>Status:</strong> Online 24/7</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '2rem',
  },
  container: {
    maxWidth: '500px',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '3rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    border: '1px solid #f3f4f6',
  },
  statusIndicator: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  pulseNode: {
    width: '20px',
    height: '20px',
    backgroundColor: '#10b981', // Emerald green
    borderRadius: '50%',
    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
    animation: 'pulse 2s infinite',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '2rem',
    lineHeight: '1.5',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '2rem 0',
  },
  list: {
    listStyle: 'none',
    textAlign: 'left',
    color: '#4b5563',
    fontSize: '0.95rem',
  },
  listItem: {
    padding: '0.75rem 0',
    borderBottom: '1px dashed #e5e7eb',
  }
};

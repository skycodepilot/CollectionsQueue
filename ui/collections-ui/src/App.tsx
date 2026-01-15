import { useEffect, useState } from 'react';
import { type Debtor } from './types';
import { CallModal } from './CallModal';

function App() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDebtor, setActiveDebtor] = useState<Debtor | null>(null);

  // --- NEW: Toast State ---
  const [showToast, setShowToast] = useState(false);
  const [lastRemovedDebtor, setLastRemovedDebtor] = useState<Debtor | null>(null);

  useEffect(() => {
    fetch("http://localhost:5196/api/queue")
      .then(res => res.ok ? res.json() : Promise.reject("API Failed"))
      .then(data => { setDebtors(data); setLoading(false); })
      .catch(err => { console.error(err); setError("API Error"); setLoading(false); });
  }, []);

  const handleSaveCall = async (debtorId: number, note: string, resultCode: string) => {
    try {
        const response = await fetch(`http://localhost:5196/api/queue/${debtorId}/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note, resultCode })
        });

        if (!response.ok) throw new Error("Failed to save");

        // 1. Find the debtor before we delete them (so we can restore them later)
        const debtorToRemove = debtors.find(d => d.id === debtorId);
        
        // 2. Optimistic Update: Remove from list
        setDebtors(current => current.filter(d => d.id !== debtorId));

        // 3. Trigger Undo Toast
        if (debtorToRemove) {
            setLastRemovedDebtor(debtorToRemove);
            setShowToast(true);
            // Auto-hide after 5 seconds
            setTimeout(() => setShowToast(false), 5000);
        }

    } catch (err) {
        alert("Error saving call log!");
    }
  };

  // --- NEW: Undo Logic ---
  const handleUndo = () => {
      if (lastRemovedDebtor) {
          // Add them back to the list
          setDebtors(current => [lastRemovedDebtor, ...current]);
          // Hide toast
          setShowToast(false);
          setLastRemovedDebtor(null);
      }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Collections Queue</h1>
      
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>Balance</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {debtors.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={cellStyle}>{d.fullName}</td>
                <td style={{ ...cellStyle, color: "#d32f2f", fontWeight: "bold" }}>${d.totalBalance.toFixed(2)}</td>
                <td style={cellStyle}>{d.priorityReason}</td>
                <td style={cellStyle}>
                  <button onClick={() => setActiveDebtor(d)} style={{ cursor: "pointer" }}>Call</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeDebtor && (
        <CallModal 
            debtor={activeDebtor} 
            onClose={() => setActiveDebtor(null)} 
            onSave={handleSaveCall}
        />
      )}

      {/* --- NEW: The Toast Notification Component --- */}
      {showToast && (
          <div style={toastStyle}>
              <span>✅ Call Logged.</span>
              <button onClick={handleUndo} style={undoButtonStyle}>
                  UNDO
              </button>
          </div>
      )}
    </div>
  )
}

// Styles
const cellStyle = { padding: "12px 8px" };
const toastStyle: React.CSSProperties = {
    position: 'fixed', bottom: '20px', right: '20px',
    backgroundColor: '#333', color: 'white',
    padding: '15px 25px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', gap: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    animation: 'fadeIn 0.3s ease-in-out'
};
const undoButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent', border: '1px solid white',
    color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px',
    fontWeight: 'bold'
};

export default App;
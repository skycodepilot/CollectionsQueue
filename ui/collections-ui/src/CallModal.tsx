import { useState } from 'react';
import { type Debtor } from './types';

interface CallModalProps {
    debtor: Debtor;
    onClose: () => void;
    onSave: (debtorId: number, note: string, resultCode: string) => Promise<void>;
}

export function CallModal({ debtor, onClose, onSave }: CallModalProps) {
    const [note, setNote] = useState("");
    const [result, setResult] = useState("Voicemail");
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(debtor.id, note, result);
        setIsSaving(false);
        onClose();
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2>Call with {debtor.fullName}</h2>
                <div style={{ marginBottom: '15px', color: '#666' }}>
                    Balance: <strong>${debtor.totalBalance.toFixed(2)}</strong>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={fieldStyle}>
                        <label>Result Code:</label>
                        <select 
                            value={result} 
                            onChange={(e) => setResult(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="Voicemail">Left Voicemail</option>
                            <option value="PTP">Promise to Pay</option>
                            <option value="Hangup">User Hung Up</option>
                            <option value="Refusal">Refused to Pay</option>
                        </select>
                    </div>

                    <div style={fieldStyle}>
                        <label>Agent Notes:</label>
                        <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            style={inputStyle}
                            placeholder="Enter call details..."
                            required 
                        />
                    </div>

                    <div style={buttonGroupStyle}>
                        <button type="button" onClick={onClose} style={cancelButtonStyle}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} style={saveButtonStyle}>
                            {isSaving ? 'Saving...' : 'Complete Call'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// -- Styles (Inline for speed) --
const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '25px', borderRadius: '8px',
    width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const fieldStyle: React.CSSProperties = { marginBottom: '15px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', marginTop: '5px' };
const buttonGroupStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' };
const saveButtonStyle: React.CSSProperties = { backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' };
const cancelButtonStyle: React.CSSProperties = { backgroundColor: '#ccc', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' };
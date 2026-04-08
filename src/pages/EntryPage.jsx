import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardHeader } from "../components/CardHeader";
import { VmsLayout } from "../components/VmsLayout";
import { useVisitor } from "../hooks/VisitorContext";

export const EntryPage = () => {
  const navigate = useNavigate();
  const { fetchVisitor, loading, error, clearError } = useVisitor();
  const [visitorId, setVisitorId] = useState("");

  const handleProceed = async () => {
    clearError();

    if (!visitorId.trim()) {
      navigate("/register");
      return;
    }

    try {
      const visitor = await fetchVisitor(visitorId);

      if (visitor) {
        // Visitor found, navigate to pass or expired page
        navigate(visitor.status === "EXPIRED" ? `/expired/${visitor.passId}` : `/pass/${visitor.passId}`);
        return;
      }

      // Visitor not found, navigate to registration
      navigate("/register", { state: { searchedVisitorId: visitorId.trim() } });
    } catch (err) {
      // Error handled by context, user will see error message
      console.error("Proceed error:", err);
    }
  };

  return (
    <VmsLayout>
      <CardHeader subtitle="VISITOR MANAGEMENT" />
      <section className="card-body entry-body">
        <div className="scanner-box" aria-label="Mock QR scanner area">
          <div className="qr-mock">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="entry-scanner-title">Scan Visitor QR Code</p>
          <p className="entry-muted-text">Position the QR code within the frame</p>
        </div>

        <div className="entry-separator">
          <span />
          <p>OR</p>
          <span />
        </div>

        <div className="field-group">
          <label htmlFor="visitorId" className="field-label">
            Enter Visitor ID
          </label>
          <input
            id="visitorId"
            className="field-input"
            placeholder="e.g. AMU-20260408-0001A7B"
            value={visitorId}
            onChange={(event) => setVisitorId(event.target.value.toUpperCase())}
            disabled={loading}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="button" className="btn btn-primary full-width entry-cta" onClick={handleProceed} disabled={loading}>
          {loading ? "LOADING..." : "PROCEED"}
        </button>
      </section>
    </VmsLayout>
  );
};

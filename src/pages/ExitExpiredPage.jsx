import { useEffect, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, useParams } from "react-router-dom";
import { CardHeader } from "../components/CardHeader";
import { VmsLayout } from "../components/VmsLayout";
import { useVisitor } from "../hooks/VisitorContext";
import {
  calculateDuration,
  formatDisplayDate,
  formatDisplayTime,
} from "../utils/dateTime";

export const ExitExpiredPage = () => {
  const navigate = useNavigate();
  const { visitorId: passId } = useParams();
  const { currentVisitor, fetchVisitor, loading } = useVisitor();

  useEffect(() => {
    if (!passId) return;
    if (!currentVisitor || currentVisitor.passId !== passId) {
      fetchVisitor(passId);
    }
  }, [passId, currentVisitor, fetchVisitor]);

  const visitor = useMemo(() => {
    if (!currentVisitor || currentVisitor.passId !== passId) return null;
    return currentVisitor;
  }, [currentVisitor, passId]);

  return (
    <VmsLayout>
      <CardHeader subtitle="VISITOR PASS" status="EXPIRED" />
      <section className="card-body pass-page-body expired-pass-body">
        {loading && <p className="muted-text centered">Loading exit details...</p>}

        {!loading && !visitor && (
          <p className="muted-text centered">Visitor pass not found. Please register again.</p>
        )}

        {visitor && (
          <>
            <div className="avatar-ring expired-ring">
              {visitor.profilePhoto ? (
                <img src={visitor.profilePhoto} alt={visitor.fullName} className="avatar-photo" />
              ) : (
                <div className="avatar-icon" aria-hidden="true" />
              )}
            </div>
            <p className="visitor-id-text">{visitor.passId}</p>

            <div className="success-box">
              <h3>Visit Completed Successfully</h3>
              <p>You exited at {formatDisplayDate(visitor.exitTime)}, {formatDisplayTime(visitor.exitTime)}</p>
              <p>Duration on campus: {calculateDuration(visitor.entryTime, visitor.exitTime)}</p>
            </div>

            <div className="entry-pill faded">
              <p>ENTRY TIME</p>
              <strong>{formatDisplayDate(visitor.entryTime)}, {formatDisplayTime(visitor.entryTime)}</strong>
            </div>

            <div className="qr-wrap qr-disabled">
              <QRCodeCanvas value={visitor.passId} size={150} />
            </div>
            <p className="danger-text centered">This pass is no longer valid</p>
            <p className="muted-text centered">Contact security if you need assistance.</p>

            <button type="button" className="btn btn-outline full-width" onClick={() => navigate("/")}>
              BACK TO ENTRY
            </button>
          </>
        )}
      </section>
    </VmsLayout>
  );
};

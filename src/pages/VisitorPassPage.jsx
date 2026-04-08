import { useEffect, useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, useParams } from "react-router-dom";
import { CardHeader } from "../components/CardHeader";
import { VmsLayout } from "../components/VmsLayout";
import { useVisitor } from "../hooks/VisitorContext";
import { formatDisplayDateTime } from "../utils/dateTime";
import { downloadPassAsImage } from "../utils/downloadPass";

const DetailItem = ({ label, value }) => (
  <div className="detail-item">
    <p className="detail-label">{label}</p>
    <p className="detail-value">{value || "N/A"}</p>
  </div>
);

export const VisitorPassPage = () => {
  const navigate = useNavigate();
  const { visitorId: passId } = useParams();
  const { currentVisitor, fetchVisitor, loading, error } = useVisitor();
  const passCardRef = useRef(null);

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

  useEffect(() => {
    if (!visitor) return;
    if (String(visitor.status || "").toUpperCase() === "EXPIRED") {
      navigate(`/expired/${visitor.passId}`, { replace: true });
    }
  }, [visitor, navigate]);

  const handleDownload = () => {
    if (!visitor || String(visitor.status || "").toUpperCase() === "EXPIRED") return;
    downloadPassAsImage(visitor.passId, passCardRef.current);
  };

  return (
    <VmsLayout>
      <CardHeader subtitle="VISITOR PASS" status={visitor?.status || "Generated"} />
      <section className="card-body pass-page-body">
        {loading && <p className="muted-text centered">Loading visitor pass...</p>}
        {!loading && error && <p className="error-text centered">{error}</p>}

        {!loading && !error && !visitor && (
          <p className="muted-text centered">No visitor details found. Return to entry screen.</p>
        )}

        {visitor && (
          <>
            <div ref={passCardRef} className="pass-card-content">
              <div className="pass-header-band export-only">
                <div className="pass-brand-row">
                  <div className="brand-logo" aria-hidden="true">
                    <span className="brand-logo-text">AMITY</span>
                  </div>
                  <div>
                    <p className="pass-brand-title">AMITY UNIVERSITY NOIDA</p>
                    <p className="pass-brand-sub">VISITOR PASS</p>
                  </div>
                </div>
                <span className={`pass-status-pill ${visitor.status?.toLowerCase()}`}>{visitor.status}</span>
              </div>

              <div className="pass-body">
                <div className="pass-identity">
                  <div className="pass-avatar-ring">
                    {visitor.profilePhoto ? (
                      <img src={visitor.profilePhoto} alt={visitor.fullName} className="avatar-photo" />
                    ) : (
                      <div className="avatar-icon" aria-hidden="true" />
                    )}
                  </div>
                  <h2 className="pass-name">{visitor.fullName}</h2>
                  <p className="pass-id-badge">{visitor.passId}</p>
                </div>

                <div className="pass-details-grid">
                  <DetailItem label="MOBILE" value={visitor.mobileNumber} />
                  <DetailItem label="TYPE" value={visitor.visitorType} />
                  <DetailItem label="GATE" value={visitor.entryGate} />
                  <DetailItem label="DEPARTMENT" value={visitor.department} />
                  <DetailItem label="PURPOSE" value={visitor.purposeOfVisit} />
                  <DetailItem label="VEHICLE" value={visitor.vehicleNumber} />
                  <DetailItem label="VISITORS" value={visitor.num_of_visitors} />
                  <DetailItem
                    label="LOCATION"
                    value={
                      visitor.latitude && visitor.longitude
                        ? `${Number(visitor.latitude).toFixed(6)}, ${Number(visitor.longitude).toFixed(6)}`
                        : null
                    }
                  />
                </div>

                <div className="pass-entry-strip">
                  <div>
                    <p className="pass-entry-label">ENTRY TIME</p>
                    <p className="pass-entry-value">{formatDisplayDateTime(visitor.entryTime)}</p>
                  </div>
                </div>

                <div className="pass-qr-section">
                  <div className="pass-qr-box">
                    {visitor.passId && (
                      <QRCodeCanvas value={visitor.passId} size={130} level="M" />
                    )}
                  </div>
                  <p className="pass-qr-hint">Show this QR to the security guard on exit</p>
                </div>

                <p className="pass-footer-text">Powered by Amity Security System</p>
              </div>
            </div>

            {String(visitor.status || "").toUpperCase() !== "EXPIRED" && (
              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-secondary full-width"
                  onClick={handleDownload}
                >
                  DOWNLOAD PASS
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </VmsLayout>
  );
};

import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CardHeader } from "../components/CardHeader";
import { VmsLayout } from "../components/VmsLayout";
import { VisitorForm } from "../forms/VisitorForm";
import { useVisitor } from "../hooks/VisitorContext";
import { getNowParts } from "../utils/dateTime";

export const ExitFormPage = () => {
  const { visitorId: passId } = useParams();
  const navigate = useNavigate();
  const { currentVisitor, fetchVisitor, confirmExit, loading, error, clearError } =
    useVisitor();

  useEffect(() => {
    if (!passId) return;
    if (!currentVisitor || currentVisitor.passId !== passId) {
      fetchVisitor(passId);
    }
  }, [passId, currentVisitor, fetchVisitor]);

  const defaultValues = useMemo(() => {
    const now = getNowParts();

    return {
      fullName: currentVisitor?.fullName || "",
      mobileNumber: currentVisitor?.mobileNumber || "",
      emailId: currentVisitor?.emailId || currentVisitor?.email || "",
      visitorType: currentVisitor?.visitorType || "",
      purposeOfVisit: currentVisitor?.purposeOfVisit || "",
      entryGate: currentVisitor?.entryGate || "",
      department: currentVisitor?.department || "",
      vehicleNumber: currentVisitor?.vehicleNumber || "",
      expectedHours: currentVisitor?.expectedHours || "",
      profilePhoto: currentVisitor?.profilePhoto || "",
      date: now.date,
      time: now.time,
      entryTime: currentVisitor?.entryTime || now.iso,
    };
  }, [currentVisitor]);

  const handleSubmit = async (values) => {
    clearError();

    const updated = await confirmExit(passId, {
      ...values,
      exitTime: new Date().toISOString(),
    });

    navigate(`/expired/${updated.passId}`);
  };

  return (
    <VmsLayout>
      <CardHeader subtitle="EXIT FORM" />
      <section className="card-body form-page-body">
        {!currentVisitor && !loading && (
          <p className="muted-text centered">No visitor selected. Please search using visitor ID.</p>
        )}

        <VisitorForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="CONFIRM EXIT"
          onCancel={() => navigate(`/pass/${passId}`)}
          infoText="Please verify your details before exiting campus."
          readOnlyMode
        />

        {error && <p className="error-text center-error">{error}</p>}
      </section>
    </VmsLayout>
  );
};

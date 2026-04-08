import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardHeader } from "../components/CardHeader";
import { VmsLayout } from "../components/VmsLayout";
import { VisitorForm } from "../forms/VisitorForm";
import { useVisitor } from "../hooks/VisitorContext";
import { checkFormAccessByLocation } from "../services/apiService";
import { getNowParts } from "../utils/dateTime";

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const { registerVisitor, loading, error, clearError } = useVisitor();
  const [accessStatus, setAccessStatus] = useState("checking"); // checking | allowed | denied
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const runAccessCheck = async () => {
      if (!navigator.geolocation) {
        if (!isMounted) return;
        setAccessStatus("denied");
        setAccessError("Access Denied: You are outside the permitted boundary.");
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });

        const { latitude, longitude } = position.coords;
        const hasAccess = await checkFormAccessByLocation({ latitude, longitude });

        if (!isMounted) return;
        if (hasAccess) {
          setAccessStatus("allowed");
          setAccessError("");
          return;
        }

        setAccessStatus("denied");
        setAccessError("Access Denied: You are outside the permitted boundary.");
      } catch {
        if (!isMounted) return;
        setAccessStatus("denied");
        setAccessError("Access Denied: You are outside the permitted boundary.");
      }
    };

    runAccessCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  const defaultValues = useMemo(() => {
    const now = getNowParts();

    return {
      fullName: "",
      mobileNumber: "",
      emailId: "",
      visitorType: "",
      visitorTypeOther: "",
      purposeOfVisit: "",
      purposeOfVisitOther: "",
      entryGate: "",
      department: "",
      num_of_visitors: 1,
      vehicleNumber: "",
      expectedHours: 5,
      gov_id_type: "",
      gov_id_number: "",
      profilePhoto: "",
      latitude: undefined,
      longitude: undefined,
      date: now.date,
      time: now.time,
      entryTime: now.iso,
    };
  }, []);

  const onSubmit = async (values) => {
    clearError();
    const visitor = await registerVisitor(values);
    navigate(`/pass/${visitor.passId}`);
  };

  return (
    <VmsLayout>
      <CardHeader subtitle="VISITOR REGISTRATION" />
      <section className="card-body form-page-body">
        {accessStatus === "checking" && (
          <p className="muted-text centered">Validating location access...</p>
        )}

        {accessStatus === "denied" && <p className="error-text center-error">{accessError}</p>}

        {accessStatus === "allowed" && (
          <VisitorForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel="SUBMIT"
            infoText="Fill in the visitor details to generate a pass."
          />
        )}

        {error && <p className="error-text center-error">{error}</p>}
      </section>
    </VmsLayout>
  );
};

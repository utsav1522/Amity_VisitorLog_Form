import { useNavigate } from "react-router-dom";
import { VmsLayout } from "../components/VmsLayout";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <VmsLayout>
      <section className="card-body centered-body compact-page-body">
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="muted-text">The page you requested does not exist in this flow.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/")}>
          GO TO ENTRY
        </button>
      </section>
    </VmsLayout>
  );
};

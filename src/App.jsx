import { Navigate, Route, Routes } from "react-router-dom";
import { ExitExpiredPage } from "./pages/ExitExpiredPage";
import { ExitFormPage } from "./pages/ExitFormPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { VisitorPassPage } from "./pages/VisitorPassPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/pass/:visitorId" element={<VisitorPassPage />} />
      <Route path="/exit/:visitorId" element={<ExitFormPage />} />
      <Route path="/expired/:visitorId" element={<ExitExpiredPage />} />
      <Route path="/entry" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

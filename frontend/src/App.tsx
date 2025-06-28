import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PA_Companies from "./pages/PA_Companies";
import ComparisonPage from "./pages/PA_Compare";
import PA_Login from "./pages/PA_Login";
import PA_Register from "./pages/PA_Register";
import PA_Home from "./pages/PA_Home";
import COM_ProtectedRoute from "./components/COM_ProtectedRoute";
import PA_Search from "./pages/PA_Search";
import PA_Verication from "./pages/PA_Verification";
import { PRV_UserStore } from "./context/CTX_UserStore";
import PA_VericationRequest from "./pages/PA_VerificationRequest";
import PA_PasswordResetRequest from "./pages/PA_PasswordResetRequest";
import PA_PasswordReset from "./pages/PA_PasswordReset";
import COM_Loading from "./components/COM_Loading";

function Logout() {
  localStorage.clear();
  return <Navigate to="/users/login" />;
}

function CreateAndLogout() {
  localStorage.clear();
  return <PA_Register />;
}

function App() {
  return (
    <PRV_UserStore args={[]}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <COM_ProtectedRoute>
                <PA_Home />
              </COM_ProtectedRoute>
            }
          />
          <Route path="/users/login" element={<PA_Login />} />
          <Route path="/users/logout" element={<Logout />} />
          <Route path="/users/register" element={<CreateAndLogout />} />
          <Route
            path="/users/verification/token/request/"
            element={<PA_VericationRequest />}
          />
          <Route path="/users/verification" element={<PA_Verication />} />
          <Route 
            path="/users/password-reset/token/request" 
            element={
              <COM_ProtectedRoute>
                <PA_PasswordResetRequest />
              </COM_ProtectedRoute>
            } 
          />
          <Route 
            path="/users/password-reset" 
            element={
              <COM_ProtectedRoute>
                <PA_PasswordReset />
              </COM_ProtectedRoute>
            } 
          />
          <Route path="/companies/search/" element={<PA_Search />} />
          <Route
            path="/companies/page/:symbol"
            element={
              <COM_ProtectedRoute>
                <PA_Companies />
              </COM_ProtectedRoute>
            }
          />
          <Route
            path="/companies/compare/"
            element={
              <COM_ProtectedRoute>
                <ComparisonPage />
              </COM_ProtectedRoute>
            }
          />
          <Route path="/loading/" element={<COM_Loading />}/>
        </Routes>
      </BrowserRouter>
    </PRV_UserStore>
  );
}

export default App;

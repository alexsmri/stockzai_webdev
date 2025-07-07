import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PAG_Companies from "./pages/PAG_Companies";
import ComparisonPage from "./pages/PAG_Compare";
import PAG_Login from "./pages/PAG_Login";
import PAG_Register from "./pages/PAG_Register";
import PAG_Home from "./pages/PAG_Home";
import COM_ProtectedRoute from "./components/COM_ProtectedRoute";
import PAG_Search from "./pages/PAG_Search";
import PAG_Verication from "./pages/PAG_Verification";
import { PRV_UserStore } from "./context/CTX_UserStore";
import PAG_VericationRequest from "./pages/PAG_VerificationRequest";
import PA_PasswordResetRequest from "./pages/PAG_PasswordResetRequest";
import PAG_PasswordReset from "./pages/PAG_PasswordReset";
import COM_Loading from "./components/COM_Loading";

function Logout() {
  localStorage.clear();
  return <Navigate to="/users/login" />;
}

function CreateAndLogout() {
  localStorage.clear();
  return <PAG_Register />;
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
                <PAG_Home />
              </COM_ProtectedRoute>
            }
          />
          <Route path="/users/login" element={<PAG_Login />} />
          <Route path="/users/logout" element={<Logout />} />
          <Route path="/users/register" element={<CreateAndLogout />} />
          <Route
            path="/users/verification/token/request/"
            element={<PAG_VericationRequest />}
          />
          <Route path="/users/verification" element={<PAG_Verication />} />
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
                <PAG_PasswordReset />
              </COM_ProtectedRoute>
            } 
          />
          <Route 
            path="/companies/search/" 
            element={
              <COM_ProtectedRoute>
                <PAG_Search />
              </COM_ProtectedRoute>
              } 
          />
          <Route
            path="/companies/page/:symbol"
            element={
              <COM_ProtectedRoute>
                <PAG_Companies />
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

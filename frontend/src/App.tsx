import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PAG_Companies from './pages/PAG_Companies';
import PAG_Login from './pages/PAG_Login';
import PAG_Register from './pages/PAG_Register';
import PAG_Home from './pages/PAG_Home';
import COM_ProtectedRoute from './components/COM_ProtectedRoute';
import PAG_Search from './pages/PAG_Search';
import PAG_Verication from './pages/PAG_Verification';
import { PRV_UserStore } from './context/CTX_UserStore';
import PA_PasswordResetRequest from './pages/PAG_PasswordResetRequest';
import PAG_PasswordReset from './pages/PAG_PasswordReset';
import COM_Loading from './components/COM_Loading';
import PAG_EditProfile from './pages/PAG_EditProfile';
import { PRV_Alert } from './context/CTX_Alert';
import PAG_Legal from './pages/PAG_Legal';
import COM_HandleTokens from './components/COM_HandleTokens';
import PAG_FormFeedback from './pages/PAG_FormFeedback';
import COM_LightboxTimed from './components/COM_LightboxTimed';
import { PRV_Lightbox } from './context/CTX_Lightbox';

function Logout() {
  localStorage.clear();
  return <Navigate to="/users/login/" />;
}

function CreateAndLogout() {
  localStorage.clear();
  return <PAG_Register />;
}

function App() {
  return (
    <PRV_UserStore args={[]} showFallback={true}>
      <COM_HandleTokens>
        <PRV_Alert>
          <PRV_Lightbox>
            <BrowserRouter>
              <COM_LightboxTimed />
              <Routes>
                <Route path="/" element={<PAG_Home />} />
                <Route path="/legal/:page" element={<PAG_Legal />} />
                <Route path="/users/login" element={<PAG_Login />} />
                <Route path="/users/logout" element={<Logout />} />
                <Route path="/users/register" element={<CreateAndLogout />} />
                <Route path="/users/verification" element={<PAG_Verication />} />
                <Route
                  path="/users/password-reset/token/request"
                  element={<PA_PasswordResetRequest />}
                />
                <Route
                  path="/users/edit"
                  element={
                    <COM_ProtectedRoute>
                      <PAG_EditProfile />
                    </COM_ProtectedRoute>
                  }
                />
                <Route path="/users/password-reset" element={<PAG_PasswordReset />} />
                <Route
                  path="/companies/search"
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
                  path="/users/unsubscribe-newsletter"
                  element={
                    <COM_ProtectedRoute>
                      <PAG_Companies />
                    </COM_ProtectedRoute>
                  }
                />
                <Route path="/feedback" element={<PAG_FormFeedback />} />
                <Route path="/loading" element={<COM_Loading />} />
              </Routes>
            </BrowserRouter>
          </PRV_Lightbox>
        </PRV_Alert>
      </COM_HandleTokens>
    </PRV_UserStore>
  );
}

export default App;

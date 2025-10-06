import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PAG_Companies from './pages/PAG_Companies';
import PAG_Login from './pages/PAG_Login';
import PAG_Register from './pages/PAG_Register';
import PAG_RegisterPassword from './pages/PAG_RegisterPassword';
import COM_ProtectedRoute from './components/COM_ProtectedRoute';
import PAG_Search from './pages/PAG_Search';
import { PRV_UserStore } from './context/CTX_UserStore';
import { PRV_CompaniesStore } from './context/CTX_CompanyStore';
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
import PAG_Unsubscribe from './pages/PAG_Unsubscribe';
import PAG_Subscribe from './pages/PAG_Subscribe';
import PAG_SubscribeVerify from './pages/PAG_SubscribeVerify';
import PAG_VericationCode from './pages/PAG_VerificationCode';
import PAG_404 from './pages/PAG_404';
import PAG_Debug from './pages/PAG_Debug';
import PAG_TopStocks from './pages/PAG_TopStocks';
import PAG_Alerts from './pages/PAG_Alerts';

function Logout() {
  localStorage.clear();
  return <Navigate to="/users/login/" />;
}

function CreateAndLogout() {
  localStorage.clear();
  return <PAG_Register />;
}

function CreatePasswordAndLogout() {
  localStorage.clear();
  return <PAG_RegisterPassword />;
}

function App() {
  return (
    <PRV_UserStore args={[]} showFallback={true}>
      <PRV_CompaniesStore args={[]} showFallback={true}>
        <COM_HandleTokens>
          <PRV_Alert>
            <PRV_Lightbox>
              <BrowserRouter>
                <COM_LightboxTimed />
                <Routes>
                  <Route path="/" element={<Navigate to="/companies/search" replace />} />
                  <Route path="/legal/:page" element={<PAG_Legal />} />
                  <Route path="/users/login" element={<PAG_Login />} />
                  <Route path="/users/logout" element={<Logout />} />
                  <Route path="/users/register" element={<CreateAndLogout />} />
                  <Route path="/users/register/password" element={<CreatePasswordAndLogout />} />
                  <Route path="/users/verification" element={<PAG_VericationCode />} />
                  <Route path="/users/password-reset/token/request" element={<PA_PasswordResetRequest />} />
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
                    path="/companies/top-stocks"
                    element={
                      <COM_ProtectedRoute>
                        <PAG_TopStocks />
                      </COM_ProtectedRoute>
                    }
                  />
                  <Route
                    path="/alerts"
                    element={
                      <COM_ProtectedRoute>
                        <PAG_Alerts />
                      </COM_ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/subscribe-newsletter"
                    element={
                      <COM_ProtectedRoute>
                        <PAG_Subscribe />
                      </COM_ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/subscribe-newsletter/verify"
                    element={
                      <COM_ProtectedRoute>
                        <PAG_SubscribeVerify />
                      </COM_ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/unsubscribe-newsletter"
                    element={
                      <COM_ProtectedRoute>
                        <PAG_Unsubscribe />
                      </COM_ProtectedRoute>
                    }
                  />
                  <Route path="/feedback" element={<PAG_FormFeedback />} />
                  <Route path="/loading" element={<COM_Loading />} />
                  <Route path="/debug" element={<PAG_Debug />} />
                  <Route path="*" element={<PAG_404 />} />
                </Routes>
              </BrowserRouter>
            </PRV_Lightbox>
          </PRV_Alert>
        </COM_HandleTokens>
      </PRV_CompaniesStore>
    </PRV_UserStore>
  );
}

export default App;

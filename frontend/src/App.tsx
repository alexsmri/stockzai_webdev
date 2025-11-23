import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PAG_Companies from './pages/PAG_Companies';
import PAG_CompaniesFree from './pages/PAG_CompaniesFree';
import PAG_Login from './pages/PAG_Login';
import PAG_Register from './pages/PAG_Register';
import PAG_RegisterPassword from './pages/PAG_RegisterPassword';
import COM_ProtectedRoute from './components/COM_ProtectedRoute';
import PAG_Search from './pages/PAG_Search';
import { PRV_UserStore, useUserStore } from './context/CTX_UserStore';
import { PRV_CompaniesStore, useCompaniesStore } from './context/CTX_CompanyStore';
import PA_PasswordResetRequest from './pages/PAG_PasswordResetRequest';
import PAG_PasswordReset from './pages/PAG_PasswordReset';
import COM_Loading from './components/COM_Loading';
import { PRV_Alert } from './context/CTX_Alert';
import COM_HandleTokens from './components/COM_HandleTokens';
import PAG_FormFeedback from './pages/PAG_FormFeedback';
import { PRV_Lightbox } from './context/CTX_Lightbox';
import PAG_Unsubscribe from './pages/PAG_Unsubscribe';
import PAG_Subscribe from './pages/PAG_Subscribe';
import PAG_SubscribeVerify from './pages/PAG_SubscribeVerify';
import PAG_SubscribeConfirmation from './pages/PAG_SubscribeConfirmation';
import PAG_PlanSelection from './pages/PAG_PlanSelection';
import PAG_VericationCode from './pages/PAG_VerificationCode';
import PAG_404 from './pages/PAG_404';
import PAG_Debug from './pages/PAG_Debug';
import PAG_SocialComplete from './pages/PAG_SocialComplete';
import PAG_TopStocks from './pages/PAG_TopStocks';
import PAG_Alerts from './pages/PAG_Alerts';
import COM_PremiumRoute from './components/COM_PremiumRoute';
import PAG_ChooseTicker from './pages/PAG_ChooseTicker';
import STR_UserManagement from './structures/STR_UserManagement';
import type { ValidKeys as UserStoreKeys } from './stores/STO_Users';
import type { ValidKeys as CompanyStoreKeys } from './stores/STO_Companies';
import { REGISTRATION_PASSWORD_STORAGE_KEY } from './constants';

function usePerformLogout() {
  const userStore = useUserStore();
  const companiesStore = useCompaniesStore();
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
    try {
      window.sessionStorage.removeItem(REGISTRATION_PASSWORD_STORAGE_KEY);
    } catch {
      /* ignore */
    }

    const userKeysToReset: UserStoreKeys[] = [
      'ActionLogin',
      'ActionRefreshToken',
      'PropertyCredentials',
      'PropertyAccess',
      'PropertySubscriptions',
      'PropertyConsents',
    ];
    userKeysToReset.forEach((key) => {
      userStore.set(key, null);
    });
    userStore.set('StateEditing', false);
    userStore.set('PropertyStatus', null);
    userStore.set('PropertyNewUser', false);

    const companiesKeysToReset: CompanyStoreKeys[] = [
      'PropertyCompanyProfile',
      'PropertyCompanyProfileFree',
      'PropertySearchResults',
      'PropertyCompanyLeaderboard',
    ];
    companiesKeysToReset.forEach((key) => {
      companiesStore.set(key, null);
    });

    setCompleted(true);
  }, [companiesStore, userStore]);

  return completed;
}

function Logout() {
  const navigate = useNavigate();
  const isReady = usePerformLogout();

  useEffect(() => {
    if (isReady) {
      navigate('/users/login/', { replace: true });
    }
  }, [isReady, navigate]);

  return <COM_Loading />;
}

function CreateAndLogout() {
  const isReady = usePerformLogout();
  if (!isReady) {
    return <COM_Loading />;
  }
  return <PAG_Register />;
}

function CreatePasswordAndLogout() {
  const isReady = usePerformLogout();
  if (!isReady) {
    return <COM_Loading />;
  }
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
                <STR_UserManagement />
                <Routes>
                  <Route path="/" element={<Navigate to="/companies/search" replace />} />
                  <Route path="/users/login" element={<PAG_Login />} />
                  <Route path="/users/logout" element={<Logout />} />
                  <Route path="/users/register" element={<CreateAndLogout />} />
                  <Route path="/users/register/password" element={<CreatePasswordAndLogout />} />
                  <Route path="/users/verification" element={<PAG_VericationCode />} />
                  <Route path="/users/social/complete" element={<PAG_SocialComplete />} />
                  <Route
                    path="/users/plans/select"
                    element={
                      <COM_ProtectedRoute>
                        <PAG_PlanSelection />
                      </COM_ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/password-reset/token/request"
                    element={<PA_PasswordResetRequest />}
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
                  <Route path="/companies/page/free/:symbol" element={<PAG_CompaniesFree />} />
                  <Route
                    path="/companies/top-stocks"
                    element={
                      <COM_ProtectedRoute>
                        <COM_PremiumRoute prAccessConfig={{ permissions: ['company_page:all'] }}>
                          <PAG_TopStocks />
                        </COM_PremiumRoute>
                      </COM_ProtectedRoute>
                    }
                  />
                  <Route path="/onboarding/choose-ticker" element={<PAG_ChooseTicker />} />
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
                    path="/users/subscribe/pro/confirmation"
                    element={
                      <COM_ProtectedRoute>
                        <COM_PremiumRoute prAccessConfig={{ permissions: ['company_page:all'] }}>
                          <PAG_SubscribeConfirmation />
                        </COM_PremiumRoute>
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

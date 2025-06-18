import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CompaniesPage from "./pages/CompaniesPage";
import ComparisonPage from "./pages/ComparisonPage";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import Home from "./pages/Home";
import ProtectedRoute from "./components/CO_ProtectedRoute";
import SearchPage from "./pages/SearchPage";
import PA_Verication from "./pages/PA_Verification";
import { UserStoreProvider } from "./context/UserStoreContext";
import PA_VericationRequest from "./pages/PA_VerificationRequest";

function Logout() {
  localStorage.clear();
  return <Navigate to="/users/login" />;
}

function CreateAndLogout() {
  localStorage.clear();
  return <UserRegister />;
}

function App() {
  return (
    <UserStoreProvider args={[]}>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/users/login" element={<UserLogin />} />
        <Route path="/users/logout" element={<Logout />} />
        <Route path="/users/register" element={<CreateAndLogout />} />
        <Route path="users/verification/token/request/" element={<PA_VericationRequest />} />
        <Route path="/users/verification/:uid/:token/:email" element={<PA_Verication />} />
        <Route path="/companies/search/" element={<SearchPage />} />
        <Route
          path="/companies/page/:symbol"
          element={
            <ProtectedRoute>
              <CompaniesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies/compare/"
          element={
            <ProtectedRoute>
              <ComparisonPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </UserStoreProvider>
  );
}

export default App;

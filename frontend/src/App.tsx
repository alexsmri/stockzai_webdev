import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CompaniesPage from "./pages/CompaniesPage"
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import Home from "./pages/Home";
import NotFOund from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login"/>;
}

function CreateAndLogout() {
  localStorage.clear();
  return <UserRegister />
}
 
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element = {
        <ProtectedRoute>
          <Home />
          </ProtectedRoute>
          }
      />
      <Route
        path="/users/login"
        element = {<UserLogin />}
      />
      <Route
        path="/users/logout"
        element = {<Logout />}
      />
      <Route
        path="/users/register"
        element = {<CreateAndLogout />}
      />
      <Route
        path="/companies/:symbol"
        element = {
        <ProtectedRoute>
          <CompaniesPage />
          </ProtectedRoute>
          }
      />
      
    </Routes>
    </BrowserRouter>

  );
}

export default App;

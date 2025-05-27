import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
        path="/login"
        element = {<UserLogin />}
      />
      <Route
        path="/logout"
        element = {<Logout />}
      />
      <Route
        path="/register"
        element = {<CreateAndLogout />}
      />
      <Route
      path="*"
      element = {<NotFOund />}
      />
      
    </Routes>
    </BrowserRouter>

  );
}

export default App;

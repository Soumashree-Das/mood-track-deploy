import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AddJournal from '../src/Pages/AddJounral.jsx';
import RegisterUser from '../src/Pages/RegisterUser.jsx';
import LoginUser from '../src/Pages/LoginUser.jsx';
import PrivateRoute from './Components/PrivateRoute.jsx';
import Navbar from './Components/Navbar.jsx';
import Home from './Pages/Home.jsx';
import AccountPage from './Pages/AccountPage.jsx';
import { AuthProvider } from './Context/AuthContext.jsx';

function App() {
  return (
    <>
    <Router> {/* 👈 must be outermost */}
  <AuthProvider> {/* 👈 this is now inside Router */}
    <Navbar />
    <Routes>
      {/* Default route - home page  */}
      <Route path="/" element={<Home />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/journal" element={<AddJournal />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      {/* Public routes */}
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/login" element={<LoginUser />} />
    </Routes>
  </AuthProvider>
</Router></>
    


  );
}

export default App;
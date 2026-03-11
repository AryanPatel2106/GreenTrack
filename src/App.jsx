import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Trees from './pages/Trees';
import RegisterTree from './pages/RegisterTree';
import TreeDetails from './pages/TreeDetails';
import Feed from './pages/Feed';
import Community from './pages/Community';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Friends from './pages/Friends';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/trees" element={
            <ProtectedRoute>
              <Layout>
                <Trees />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/trees/new" element={
            <ProtectedRoute>
              <Layout>
                <RegisterTree />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/trees/:id" element={
            <ProtectedRoute>
              <Layout>
                <TreeDetails />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/feed" element={
            <ProtectedRoute>
              <Layout>
                <Feed />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <Layout>
                <Community />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Layout>
                <Leaderboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute>
              <Layout>
                <Friends />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile/user/:uid" element={
            <ProtectedRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;

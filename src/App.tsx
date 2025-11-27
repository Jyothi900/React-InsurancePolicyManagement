import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import type { RootState, AppDispatch } from './store';
import { restoreAuth } from './slices/authslice';
import { fetchUserById } from './slices/userSlice';
import AppRoutes from './routes/AppRoutes';
import Header from './components/common/Header';
import CustomerChatWidget from './components/chat/CustomerChatWidget';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';



function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { mode } = useTheme();
  
  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchUserById(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);
  
  const showHeader = location.pathname !== '/';
  
  return (
    <>
      {showHeader && <Header />}
      <AppRoutes />
      <CustomerChatWidget />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={mode}
      />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

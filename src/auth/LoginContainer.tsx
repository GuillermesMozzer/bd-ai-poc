import React, { Suspense, lazy } from 'react';
import { useAuthContext } from './contexts/AuthContext';

const LoginScreen = lazy(() => import('./LoginScreen'));

export const LoginContainer = () => {
  const {
    isLoginLoading,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    handleLogin,
  } = useAuthContext();

  return (
    <Suspense fallback={null}>
      <LoginScreen
        isLoginLoading={isLoginLoading}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loginError={loginError}
        handleLogin={handleLogin}
      />
    </Suspense>
  );
};

import { useHistory } from 'react-router-dom';

export const useSignIn = () => {
  const history = useHistory();

  function signIn(publicKey: string | undefined): boolean {
    if (typeof publicKey == 'string') {
      console.log('sign in publickey = ', publicKey);
      localStorage.setItem('publicKey', publicKey);
      return true;
    }
    return false;
  }

  function signOut(): void {
    localStorage.removeItem('publicKey');
    history.push('/');
  }

  function signInConfirm(publicKey: string | undefined): boolean {
    if (typeof publicKey == 'string' && localStorage.getItem('publicKey'))
      return localStorage.getItem('publicKey') == publicKey;
    return false;
  }

  return { signIn, signOut, signInConfirm };
};

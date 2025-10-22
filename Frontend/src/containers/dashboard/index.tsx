import { Button } from '~/components/controls';
import { useAlertContext, useAuthContext } from '~/store/contexts';
import { useLogoutMutation } from '~/store/queries/auth';

export default function Index() {
  const alert = useAlertContext();
  const { logout } = useAuthContext();

  const { mutate: signOut, isPending: loading } = useLogoutMutation({
    onSuccess(response) {
      alert.success(response.message);
      logout(response.data);
    },
  });
  return (
    <div className='bg-blue-600 min-h-[100svh] space-y-5 p-20 text-center text-white'>
      <h1 className='text-center'>Welcome to the home page</h1>
      <Button disabled={loading} loading={loading} onClick={() => signOut()}>
        Logout
      </Button>
    </div>
  );
}

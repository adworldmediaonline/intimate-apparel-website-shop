'use client';
import Wrapper from '@/components/wrapper';
import { useConfirmEmailQuery } from '@/redux/features/auth/authApi';
import { notifySuccess } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ErrorMsg from '../common/error-msg';

export default function EmailVerifyArea({ token }) {
  const router = useRouter();
  const { data, isLoading, isError, error, isSuccess } =
    useConfirmEmailQuery(token);

  useEffect(() => {
    if (isSuccess) {
      router.push('/checkout');
      notifySuccess('Account activated successfully!');
    }
  }, [router, isSuccess]);

  return (
    <Wrapper>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: '100vh' }}
      >
        {isLoading ? (
          <h3>Loading ....</h3>
        ) : isSuccess ? (
          <h2>{data?.message}</h2>
        ) : (
          <ErrorMsg msg={error?.data?.error} />
        )}
      </div>
    </Wrapper>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/pages/setup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">FIRST Robotics Match Display</h1>
        <p className="text-white">Redirecting to setup page...</p>
      </div>
    </div>
  );
}

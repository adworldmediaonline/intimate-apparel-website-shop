'use client';
import Link from 'next/link';

export default function Breadcrumb({ title, current, productId }) {
  return (
    <div className="">
      <div className="">
        <Link href="/" className="">
          Home
        </Link>
        <span className="">/</span>
        <Link href="/shop" className="">
          Shop
        </Link>
        <span className="">/</span>
        <span className="">{current}</span>
      </div>
    </div>
  );
}

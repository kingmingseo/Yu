"use client";
import { useSession } from "next-auth/react";
import AddButtonUI from "./AddButtonUI";

/**
 * Container Component - useSession 호출 및 데이터 전달
 * 실제 페이지에서 사용
 */
export default function AddButtonContainer({ category, variant = 'gallery' }) {
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;

  return (
    <AddButtonUI
      category={category}
      variant={variant}
      isAdmin={isAdmin}
    />
  );
}

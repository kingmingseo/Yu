"use client";
import { useSession } from "next-auth/react";
import DeleteButtonUI from "./DeleteButtonUI";

/**
 * Container Component - useSession 호출 및 데이터 전달
 * 실제 페이지에서 사용
 */
export default function DeleteButtonContainer({ category, id, section = 'GALLERY' }) {
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;
  console.log(isAdmin);
  return (
    <DeleteButtonUI
      category={category}
      id={id}
      section={section}
      isAdmin={isAdmin}
    />
  );
}

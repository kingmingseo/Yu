"use client";
import { useSession } from "next-auth/react";
import { useDeleteContent } from "@/app/hooks/useDeleteContent";
import DeleteButtonUI from "./DeleteButtonUI";

/**
 * Container Component - 모든 훅 처리
 * 실제 페이지에서 사용
 */
export default function DeleteButtonContainer({ category, id, section = 'GALLERY' }) {
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;
  const { deleteData } = useDeleteContent({ section, action: "delete", category, id });

  return (
    <DeleteButtonUI
      onDelete={deleteData}
      isAdmin={isAdmin}
    />
  );
}

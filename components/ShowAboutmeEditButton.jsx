"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaPen } from "react-icons/fa";

export default function ShowAboutmeEditButton() {
  const { data } = useSession();
  const isAdmin = !!data?.user?.admin;
  if (!isAdmin) return null;
  return (
    <div className="fixed bottom-10 right-10">
      <Link href="/ABOUTME/update" aria-label="소개 페이지 편집">
        <button className="bg-transparent border-2 border-white rounded-full p-3 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
          <FaPen size={20} />
        </button>
      </Link>
    </div>
  );
}



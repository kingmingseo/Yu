"use client";
import { usePathname } from "next/navigation";

export default function MarginWrapper({ children }) {
  const pathname = usePathname();

  // 경로에 따라 마진을 적용
  const marginClass = pathname === "/" ? "" : "sm:mt-28 mt-20";

  return <div className={marginClass}>{children}</div>;
}

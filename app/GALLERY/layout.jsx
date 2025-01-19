"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GalleryLayout({ children }) {
  let pathname = usePathname();
  let path = pathname.split('/').pop()
  if (path === "write" ) {
    return <>{children}</>;
  }
  return (
    <>
      <aside className="sm:hidden text-sm grid grid-cols-4 grid-rows-2 gap-1 top-16 left-0 w-full place-items-center mb-5">
        <Link
          className={pathname === '/GALLERY/LOOKBOOK' ? "underline" : "no-underline"}
          href="/GALLERY/LOOKBOOK"
        >
          LOOKBOOK
        </Link>
        <Link
          className={pathname === '/GALLERY/POLAROID' ? "underline" : "no-underline"}
          href="/GALLERY/POLAROID"
        >
          POLAROID
        </Link>
        <Link
          className={pathname === '/GALLERY/BEAUTY' ? "underline" : "no-underline"}
          href="/GALLERY/BEAUTY"
        >
          BEAUTY
        </Link>
        <Link
          className={pathname === '/GALLERY/MEDIA' ? "underline" : "no-underline"}
          href="/GALLERY/MEDIA"
        >
          MEDIA
        </Link>
        <Link
          className={pathname === '/GALLERY/MV' ? "underline" : "no-underline"}
          href="/GALLERY/MV"
        >
          M/V
        </Link>
        <Link
          className={pathname === '/GALLERY/VIDEO' ? "underline" : "no-underline"}
          href="/GALLERY/VIDEO"
        >
          VIDEO
        </Link>
        <Link
          className={pathname === '/GALLERY/MAGAZINE' ? "underline" : "no-underline"}
          href="/GALLERY/MAGAZINE"
        >
          MAGAZINE
        </Link>
        <Link
          className={pathname === '/GALLERY/PROFILE' ? "underline" : "no-underline"}
          href="/GALLERY/PROFILE"
        >
          PROFILE
        </Link>
      </aside>
      <div className="grid sm:grid-cols-7 grid-cols-1 gap-4 h-screen">
        {/* 데스크탑 사이드바 */}
        <aside className="sm:flex hidden flex-col col-span-1 gap-10 ml-10 mt-24 fixed top-1/5">
          <Link
            className={pathname === '/GALLERY/LOOKBOOK' ? "underline" : "no-underline"}
            href="/GALLERY/LOOKBOOK"
          >
            LOOKBOOK
          </Link>
          <Link
            className={pathname === '/GALLERY/POLAROID' ? "underline" : "no-underline"}
            href="/GALLERY/POLAROID"
          >
            POLAROID & SNAP
          </Link>
          <Link
            className={pathname === '/GALLERY/BEAUTY' ? "underline" : "no-underline"}
            href="/GALLERY/BEAUTY"
          >
            BEAUTY
          </Link>
          <Link
            className={pathname === '/GALLERY/MEDIA' ? "underline" : "no-underline"}
            href="/GALLERY/MEDIA"
          >
            MEDIA
          </Link>
          <Link
            className={pathname === '/GALLERY/MV' ? "underline" : "no-underline"}
            href="/GALLERY/MV"
          >
            M/V
          </Link>
          <Link
            className={pathname === '/GALLERY/VIDEO' ? "underline" : "no-underline"}
            href="/GALLERY/VIDEO"
          >
            VIDEO
          </Link>
          <Link
            className={pathname === '/GALLERY/MAGAZINE' ? "underline" : "no-underline"}
            href="/GALLERY/MAGAZINE"
          >
            MAGAZINE
          </Link>
          <Link
            className={pathname === '/GALLERY/PROFILE' ? "underline" : "no-underline"}
            href="/GALLERY/PROFILE"
          >
            PROFILE
          </Link>
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="flex flex-col col-span-5 sm:ml-[15vw] justify-items-center w-full">
          {children}
        </div>

        {/* 비어 있는 공간 */}
        <div className="sm:col-span-1 hidden"></div>
      </div>
    </>

  );
}
``

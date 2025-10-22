"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const session = useSession();

  // 스크롤 이벤트 처리 함수
  const handleScroll = () => {
    if (window.scrollY > 0) {
      setIsScrolled(true); // 스크롤이 있으면 배경색을 검정으로 변경
    } else {
      setIsScrolled(false); // 최상단에 있으면 배경색을 투명으로 유지
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 메뉴 열기/닫기 토글
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // 링크 클릭 시 메뉴 닫기
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`z-10 w-full fixed top-0 px-5 sm:px-10 py-6 flex items-center transition-all duration-300 ease-in-out ${
          isScrolled || menuOpen ? "bg-black" : "bg-transparent"
        }`}
      >
        {/* 모바일에서 햄버거 버튼 */}
        <div className="sm:hidden absolute left-5">
          <button onClick={toggleMenu} className="text-white">
            ☰ {/* 햄버거 아이콘 */}
          </button>
        </div>

        {/* 로고는 모바일에서도 항상 중앙에 위치 */}
        <Link
          className="text-3xl sm:text-6xl font-regular font-brygada text-white mx-auto"
          href="/"
        >
          Yu
        </Link>

        {/* 데스크탑 화면에서 메뉴 */}
        <div className="hidden sm:flex flex-grow justify-center gap-24 sm:gap-10 md:gap-12 lg:gap-16">
          <Link
            className="text-lg font-semibold text-white hover:text-gray-400 font-roboto"
            href="/ABOUTME"
          >
            ABOUT ME
          </Link>
          <Link
            className="text-lg font-semibold text-white hover:text-gray-400 font-roboto"
            href="/GALLERY/LOOKBOOK"
          >
            GALLERY
          </Link>
          <Link
            className="text-lg font-semibold text-white hover:text-gray-400 font-roboto"
            href="/SPONSORSHIP"
          >
            SPONSORSHIP
          </Link>
          <Link
            className="text-lg font-semibold text-white hover:text-gray-400 font-roboto"
            href="/DAILYLIFE"
          >
            DAILYLIFE
          </Link>
          <Link
            className="text-lg font-semibold text-white hover:text-gray-400 font-roboto"
            href="/CONTACT"
          >
            CONTACT
          </Link>
        </div>

        {/* 모바일에서 메뉴 열릴 때 표시되는 부분 */}
        <div
          className={`sm:hidden ${
            menuOpen ? "block" : "hidden"
          } absolute top-20 left-0 w-full bg-black text-white p-5`}
        >
          <Link
            className="block text-lg py-2 hover:text-gray-400"
            href="/ABOUTME"
            onClick={closeMenu}
          >
            ABOUT ME
          </Link>
          <Link
            className="block text-lg py-2 hover:text-gray-400"
            href="/GALLERY/LOOKBOOK"
            onClick={closeMenu}
          >
            GALLERY
          </Link>
          <Link
            className="block text-lg py-2 hover:text-gray-400"
            href="/SPONSORSHIP"
            onClick={closeMenu}
          >
            SPONSORSHIP
          </Link>
          <Link
            className="block text-lg py-2 hover:text-gray-400"
            href="/DAILYLIFE"
            onClick={closeMenu}
          >
            DAILYLIFE
          </Link>
          <Link
            className="block text-lg py-2 hover:text-gray-400"
            href="/CONTACT"
            onClick={closeMenu}
          >
            CONTACT
          </Link>
          {session.status === "authenticated" ? (
            <Link
              className="block text-lg py-2 hover:text-gray-400"
              href="/"
              onClick={() => {
                signOut({ callbackUrl: "/" });
              }}
            >
              LOGOUT
            </Link>
          ) : (
            <Link
              className="block text-lg py-2 hover:text-gray-400"
              href="/LOGIN"
              onClick={closeMenu}
            >
              LOGIN
            </Link>
          )}
        </div>

        {/* LOGIN 링크는 데스크탑에서만 보이도록 설정 */}
        {session.status === "authenticated" ? (
          <Link
            href="/"
            className="text-sm text-white hover:text-gray-400 font-roboto hidden sm:block"
            onClick={() => {
              signOut({ callbackUrl: "/" });
            }}
          >
            LOGOUT
          </Link>
        ) : (
          <Link
            href="/LOGIN"
            className="text-sm text-white hover:text-gray-400 font-roboto hidden sm:block"
          >
            LOGIN
          </Link>
        )}
      </nav>
    </>
  );
}

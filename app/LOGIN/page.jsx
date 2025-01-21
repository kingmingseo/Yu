"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // useRouter import

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const router = useRouter(); // useRouter hook 사용

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 로딩 상태 활성화

    try {
      const result = await signIn("credentials", {
        redirect: false, // redirect를 수동 처리
        email,
        password,
      });

      if (result.error) {
        setError("Login failed, check your email and password.");
      } else {
        console.log("로그인 성공!");
        router.push("/");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="font-light text-4xl mb-8">WELCOME, YU</h1>
      <form className="w-full max-w-lg" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="text"
            className="w-full px-2 py-2 text-black focus:outline-none focus:border-black"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-2 py-2 text-black focus:outline-none focus:border-black"
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="text-center mt-10">
          <button
            type="submit"
            className="hover:underline focus:outline-none h-full w-full border py-3 flex items-center justify-center"
            disabled={isLoading} // 로딩 중 버튼 비활성화
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "LOGIN"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

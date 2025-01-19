"use client"
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";  // useRouter import

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();  // useRouter hook 사용

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false, // redirect를 수동 처리
      email,
      password,
    });

    if (result.error) {
      setError("login failed, check your email and password.");
    } else {
      console.log("로그인 성공!");
      router.push("/"); 
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="font-light text-4xl mb-8">WELCOME, YU</h1>
      <form className="w-full max-w-lg" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1"
          >
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
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1"
          >
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
            className="hover:underline focus:outline-none h-full w-full border py-3"
          >
            LOGIN
          </button>
        </div>
      </form>
    </div>
  );
}

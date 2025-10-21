"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // useRouter import
import InputField from "@/components/common/InputField";
import Button from "@/components/common/Button";

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
        <InputField
          label="Email"
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="text-center mt-10">
          <Button isLoading={isLoading} label="LOGIN" type="submit" />
        </div>
      </form>
    </div>
  );
}

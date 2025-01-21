"use client";

import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 로딩 상태 활성화
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Your message has been sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="font-light text-4xl mb-8">CONTACT</h1>
      <form className="w-full max-w-lg" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-2 py-1 text-black border-b focus:outline-none focus:border-black"
            placeholder="Your Name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-2 py-1 border-b text-black focus:outline-none focus:border-black"
            placeholder="Your Email"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-2 py-1 border-b text-black focus:outline-none focus:border-black"
            placeholder="Your Phone"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={handleChange}
            rows={7}
            className="w-full px-2 py-1 border-b text-black focus:outline-none focus:border-black"
            placeholder="Your Message"
          ></textarea>
        </div>

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
              "SEND"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

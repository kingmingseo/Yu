export default function Contact() {
  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="font-light text-4xl mb-8">CONTACT</h1>
      <form className="w-full max-w-lg">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-2 py-1 text-black border-b focus:outline-none focus:border-black"
            placeholder="Your Name"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-2 py-1 border-b text-black focus:outline-none focus:border-black"
            placeholder="Your Email"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-sm font-medium mb-1"
          >
            Phone
          </label>
          <div className="flex items-center gap-2">
            <input
              id="phone-part1"
              type="text"
              maxLength={3}
              className="w-1/4 px-2 py-1 text-black border-b focus:outline-none focus:border-black "
              placeholder="010"
            />
            <span className="text-gray-500">-</span>
            <input
              id="phone-part2"
              type="text"
              maxLength={4}
              className="w-1/3 px-2 py-1 text-black border-b focus:outline-none focus:border-black "
              placeholder="1234"
            />
            <span className="text-gray-500">-</span>
            <input
              id="phone-part3"
              type="text"
              maxLength={4}
              className="w-1/3 px-2 py-1 text-black border-b focus:outline-none focus:border-black "
              placeholder="5678"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="message"
            className="block text-sm font-medium mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            rows={7}
            className="w-full px-2 py-1 border-b text-black focus:outline-none focus:border-black"
            placeholder="Your Message"
          ></textarea>
        </div>

        <div className="text-center mt-10">
          <button
            type="submit"
            className="hover:underline focus:outline-none h-full w-full border py-3"
          >
            SEND
          </button>
        </div>
      </form>
    </div>
  );
}

import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 w-screen h-screen">
      <div className="relative">
        <Image
          src="/main1.jpg"
          alt="Image 1"
          fill
          className="object-cover object-top overflow-hidden"
          priority
        />
      </div>
      <div className="relative">
        <Image
          src="/main2.jpg"
          alt="Image 2"
          fill
          className="object-cover object-top overflow-hidden"
          priority
        />
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 w-screen h-screen">
      <div >
        <img
          src="main1.jpg"
          alt="Image 1"
          className="w-full h-full object-cover object-top overflow-hidden"
        />
      </div>
      <div>
        <img
          src="main2.jpg"
          alt="Image 2"
          className="w-full h-full object-cover object-top overflow-hidden"
        />
      </div>
    </div>
  );
}
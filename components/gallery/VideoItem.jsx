import DeleteButton from "@/components/common/DeleteButton";

export default function VideoItem({ item, category, session }) {
  return (
    <div className="relative group w-full flex justify-center">
      {item.mainVideo ? (
        <video
          src={item.mainVideo}
          className="w-3/5 max-w-lg h-auto object-contain"
          controls
          preload="metadata"
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="allow"
        />
      ) : (
        <div className="w-5/6 max-w-lg h-56 bg-gray-800 flex items-center justify-center text-gray-400">
          영상이 없습니다
        </div>
      )}
      {session && (
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
          <DeleteButton category={category} id={item._id} />
        </div>
      )}
    </div>
  );
}

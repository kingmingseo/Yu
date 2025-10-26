import VideoDeleteButton from "@/components/common/VideoDeleteButton";

export default function VideoItem({ item, category }) {
  return (
    <div className="relative group w-full flex justify-center">
      <div className="w-5/6 max-w-3xl">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={
              item.embedUrl || `https://www.youtube.com/embed/${item.videoId}`
            }
            title={item.title || "YouTube 영상"}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* 영상 우상단에 삭제 버튼 */}
          <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
            <VideoDeleteButton category={category} id={item._id} />
          </div>
        </div>
      </div>
    </div>
  );
}

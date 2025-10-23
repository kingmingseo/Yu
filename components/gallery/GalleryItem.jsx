import VideoItem from "./VideoItem";
import ImageItem from "./ImageItem";

export default function GalleryItem({ item, category, session }) {
  const isVideoCategory = category === 'MV' || category === 'VIDEO';

  return (
    <div className="flex flex-col w-full h-full justify-center items-center" >
      {isVideoCategory ? (
        <VideoItem item={item} category={category} session={session} />
      ) : (
        <ImageItem item={item} category={category} />
      )}
      <h1 className="mt-1 sm:mt-3 text-sm sm:text-lg font-extralight text-center">
        {item.title}
      </h1>
    </div>
  );
}

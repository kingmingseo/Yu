import Link from "next/link";
import Image from "next/image";

export default function ImageItem({ item, category }) {
  return (
    <Link
      href={`/GALLERY/${category}/${item._id}`}
      className="flex items-center justify-center w-full h-full"
    >
      <Image
        src={item.mainImage}
        alt={item.title}
        width={400}
        height={600}
        className="sm:w-5/6 h-auto object-contain sm:hover:opacity-50"
      />
    </Link>
  );
}

import Link from "next/link";
import { ViewTransition } from "react";
import { IoMdHeart } from "react-icons/io";

export default function Home() {
  return (
    <div className="flex items-start justify-center">
      <ViewTransition name={`IoMdHeart`}>
        <Link href="/th">
          <IoMdHeart className="text-red-300 size-20 cursor-pointer" />
        </Link>
      </ViewTransition>
    </div>
  );
}

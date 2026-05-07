import Link from "next/link";
import { ViewTransition } from "react";
import { IoMdHeart } from "react-icons/io";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <ViewTransition name={`IoMdHeart`}>
        <Link href="/th/A">
          <IoMdHeart className="text-red-300 size-20 cursor-pointer" />
        </Link>
      </ViewTransition>
    </div>
  );
}

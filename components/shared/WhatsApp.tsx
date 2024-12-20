import Image from "next/image";
import Link from "next/link";

export default function StickyWhatsAppButton() {
  const whatsappNumber = "9324350209";

  return (
    <div className="  h-auto w-auto">
      <Link
        className="flex  sm:flex-col lg:flex-row  items-center justify-start md:p-2"
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
      >
        <Image
          src="/assets/img/whatsapp.png"
          className=" h-8 w-8 sm:h-10 md:w-10 lg:h-15 lg:w-15  cursor-pointer rounded-lg object-cover object-center bg-transparent"
          alt="gallery-image"
          height={50}
          width={50}
        />{" "}
        <span className="font-thin text-sm md:font-normal md:text-md">
          Chat
        </span>
        {/* Replace with a WhatsApp-specific icon if available */}
      </Link>
    </div>
  );
}

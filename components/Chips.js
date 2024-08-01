import React from "react";
import {Chip} from "@nextui-org/react";

export default function Chips({title}) {
  return (
    <div className="cursor-pointer">
    <Chip
      variant="shadow"
      classNames={{
        base: "bg-gradient-to-br from-violet-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
        content: "drop-shadow shadow-black text-white",
      }}
    >
      {title}
    </Chip>
    </div>
  );
}

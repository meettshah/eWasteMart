import React from "react";
import { Card, CardFooter, Image, Button } from "@nextui-org/react";
import { SSG_FALLBACK_EXPORT_ERROR } from "next/dist/lib/constants";
import DivWrapper from "./DivWrapper";

const cardData = [
  { 
    "title": " Easy E-Waste Recycling", 
    "description": "Dispose of electronics responsibly with our eco-friendly recycling platform.", 
    "imgUrl": "/card_img_03.jpg" 
  },
  { 
    "title": "Recycling Partners", 
    "description": "Partnering with certified recyclers ensures safe, compliant e-waste recycling.", 
    "imgUrl": "/card_img_02.jpg" 
  },
  { 
    "title": "Environmental Impact", 
    "description": "Reduce landfill waste and carbon footprint with every recycled item.", 
    "imgUrl": "/card_img_05.jpg" 
  },
  { 
    "title": "Expert Support", 
    "description": "Our experts provide personalized support for recycling and purchases.", 
    "imgUrl": "/card_img_04.jpg" 
  }
]


export default function App() {
  return (
    <DivWrapper title={'Our Cards'}>
      <div className="flex justify-center h-[400px] gap-8">
        {cardData.map((card,index) => (
          <Card
            key={index}
            isFooterBlurred
            radius="lg"
            className="border-none h-[400px]"

          >
            <Image
              alt="Woman listing to music"
              className="object-cover"
              height={500}
              src={card.imgUrl}
              width={300}
            />
            <CardFooter className=" flex flex-col justify-center items-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl gap-3 rounded-large bottom-1 w-[98%] mx-[2px] h-[150px] shadow-small z-10">
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="text-tiny text-white/80">{card.description}</p>
              <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
                Read More
              </Button>

            </CardFooter>
          </Card>
        ))}

      </div>
    </DivWrapper>


  );
}

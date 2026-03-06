import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const SLIDES = [
  { title: "BTC > $100K", price: "58¢", side: "Yes" },
  { title: "CPI > 3.0%", price: "34¢", side: "Yes" },
  { title: "Fed Rate Cut", price: "72¢", side: "Yes" },
  { title: "Oil > $80", price: "45¢", side: "Yes" },
  { title: "GDP > 2.5%", price: "61¢", side: "Yes" },
];

export default function CarouselDemo() {
  return (
    <div className="w-full max-w-xs mx-auto px-12">
      <Carousel>
        <CarouselContent>
          {SLIDES.map((slide) => (
            <CarouselItem key={slide.title}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-sm font-medium">{slide.title}</p>
                  <p className="text-2xl font-mono font-bold text-brand mt-1">{slide.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{slide.side}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

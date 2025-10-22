import { Carousel as AntdCarousel, type CarouselProps } from 'antd';

type CarouselType = CarouselProps;

export default function Carousel({ ...props }: CarouselType) {
	return <AntdCarousel dots={false} {...props} />;
}

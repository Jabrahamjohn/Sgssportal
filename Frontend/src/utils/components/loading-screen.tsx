import { LoadingOutlined } from '@ant-design/icons';

import { Spin } from '../../components/controls';

export default function LoadingScreen() {
	return (
		<div className="flex flex-grow items-center justify-center">
			<Spin
				indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
				percent="auto"
			/>
		</div>
	);
}

export function OverlayLoadingScreen() {
	return (
		<div
			className="flex flex-grow fixed h-full items-center justify-center top-0 right-0 w-full z-[20] content-width"
			style={{
				backgroundColor: 'rgba(0, 0, 0, 0.4)',
			}}
		>
			<Spin
				indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
				percent="auto"
			/>
		</div>
	);
}

import { ReactNode, useState } from 'react';
import { ColorPicker } from '../src';
import './styles.css';

export default function App(): ReactNode {
	const [color, setColor] = useState('ff9999');
	return (
		<>
			<h1>{color}</h1>
			<button
				onClick={() => {
					setColor('ff00ff');
				}}
			>
				Click me
			</button>
			<div className="p-8 m-8 border border-1 rounded">
				<ColorPicker value={color} onChange={setColor}>
					<div className="flex flex-row flex-wrap">
						<ColorPicker.Color size={50} />
					</div>

					<label>Hex:</label>
					<ColorPicker.Hex />

					<div className="flex flex-row">
						<label>Red:</label>
						<ColorPicker.R />
						<label>Green:</label>
						<ColorPicker.G />
						<label>Blue:</label>
						<ColorPicker.B />
					</div>

					<div className="flex flex-row">
						<label>Hue:</label>
						<ColorPicker.H />
						<label>Saturation:</label>
						<ColorPicker.S />
						<label>Lightness:</label>
						<ColorPicker.L />
					</div>

					<div className="flex flex-row">
						<label>Hue:</label>
						<ColorPicker.H />
						<label>Saturation:</label>
						<ColorPicker.S />
						<label>Value:</label>
						<ColorPicker.V />
					</div>
					<div className="flex flex-col justify-between mt-8">
						<label>Lightness</label>
						<ColorPicker.Lightness />
						<label>Hue</label>
						<ColorPicker.Hue />
						<label>Saturation</label>
						<ColorPicker.Saturation />
					</div>

					<div className="flex-row flex space-x-2">
						<ColorPicker.Color size={50} pickable color="#ff0000" />
						<ColorPicker.Color size={50} pickable color="#00ff00" />
						<ColorPicker.Color size={50} pickable color="#0000ff" />
						<ColorPicker.Color size={50} pickable color="#ffff00" />
					</div>

					<ColorPicker.Picker />
				</ColorPicker>
			</div>
		</>
	);
}

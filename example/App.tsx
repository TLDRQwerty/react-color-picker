import { ReactNode, useState } from "react";
import ColorPicker from "../src";

export default function App(): ReactNode {
  const [color, setColor] = useState({ r: 255, g: 0, b: 0 });
  return (
    <>
      <h1>{JSON.stringify(color)}</h1>
      <button
        onClick={() => {
          setColor({ g: 255, r: 0, b: 0 });
        }}
      >
        Click me
      </button>
      <ColorPicker
        value={color}
        onChange={setColor}
        format={ColorPicker.Formats.hsl}
        className="space-y-4 p-8 m-8 border border-1 rounded"
      >
        <div className="flex flex-row flex-wrap">
          <ColorPicker.Color />
        </div>

        <div>
          <label>Hex:</label>
          <ColorPicker.Hex />
        </div>

        <div className="flex flex-row">
          <label>Red:</label>
          <ColorPicker.R className="focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm sm:text-sm border-gray-300 rounded-md" />

          <label>Green:</label>
          <ColorPicker.G />
          <label>Blue:</label>
          <ColorPicker.B />
          <label>Alpha:</label>
          <ColorPicker.A />
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
          <label>Alpha</label>
          <ColorPicker.Alpha />
        </div>

        <div className="flex-row flex space-x-2">
          <ColorPicker.Color selectable color="#ff0000" />
          <ColorPicker.Color selectable color="#00ff00" />
          <ColorPicker.Color selectable color="#0000ff" />
          <ColorPicker.Color selectable color="#ffff00" />

          <ColorPicker.Color selectable color={{ r: 130, g: 190, b: 20 }} />
        </div>

        <ColorPicker.Picker as="section" />
      </ColorPicker>
    </>
  );
}

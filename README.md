# React Color Picker

A basic color picker

(Work in progress)

## Example

```typescript
function App() {
    const [color, setColor] = useState('#ffffff')

    return (
        <ColorPicker color={color} onChange={setColor} format="rgb">
            <ColorPicker.Color />

            <ColorPicker.Saturation />
            <ColorPicker.Hue />
            <ColorPicker.Lightness />
            <ColorPicker.Alpha />

            <ColorPicker.Color selectable color="#ff0000" />

            <ColorPicker.Picker />

            <ColorPicker.Hex />
            <ColorPicker.R />
            <ColorPicker.G />
            <ColorPicker.B />

            <ColorPicker.H />
            <ColorPicker.S />
            <ColorPicker.L />
            <ColorPicker.V />
        </ColorPicker>
    )
}
```
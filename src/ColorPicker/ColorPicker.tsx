import tinycolor from 'tinycolor2';
import styled from 'styled-components';
import React, {
	createContext,
	Dispatch,
	ReactNode,
	SyntheticEvent,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useRef,
	useState,
	useId,
	createElement,
	ComponentProps,
} from 'react';
import clsx from 'clsx';

type State = {
	instance: tinycolor.Instance;
	onChange: (value: any) => void;
	format: string;
	value: string;
};

enum ActionTypes {
	SetValue,
	SetInstance,
}

type Actions =
	| { type: ActionTypes.SetValue; value: tinycolor.ColorInput }
	| { type: ActionTypes.SetInstance; instance: tinycolor.Instance };

const reducers: {
	[P in ActionTypes]: (
		state: State,
		Action: Extract<Actions, { type: P }>,
	) => State;
} = {
	[ActionTypes.SetValue]: (state, action) => {
		return {
			...state,
			value: action.value,
			instance: tinycolor(action.value),
		};
	},
	[ActionTypes.SetInstance]: (state, action) => {
		return {
			...state,
			instance: action.instance,
		};
	},
};

const ColorContext = createContext<null | [State, Dispatch<Actions>]>(null);

function useColorContext() {
	const context = useContext(ColorContext);

	if (context == null) {
		throw Error('Failed to find context');
	}
	return context;
}

function Color({
	size = 24,
	color,
	pickable,
}: {
	size?: number;
	color?: string;
	pickable?: boolean;
}) {
	const [{ instance }, dispatch] = useColorContext();
	const handleClick = () => {
		dispatch({ type: ActionTypes.SetInstance, instance: tinycolor(color) });
	};
	return (
		<div
			onClick={color && pickable ? handleClick : undefined}
			className={clsx({ 'cursor-pointer': color && pickable })}
			style={{
				width: size,
				height: size,
				backgroundColor: color || instance.toHexString(),
			}}
		/>
	);
}

function HexInput({
	...props
}: {} & Omit<ComponentProps<'input'>, 'onChange' | 'value' | 'type'>) {
	const [{ value }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetValue,
				value: value.currentTarget.value,
			});
		},
		[dispatch],
	);

	return <input type="text" value={value} onChange={handleChange} {...props} />;
}

function NumberInput({
	value,
	onChange,
	min = 0,
	max,
	...props
}: {
	value: string | number;
	onChange: (value: string) => void;
	min?: number;
	max: number;
} & ComponentProps<'input'>) {
	const handleChange = useCallback(
		(value) => {
			onChange(value.currentTarget.value);
		},
		[onChange],
	);
	return (
		<input
			type="number"
			value={value}
			min={min}
			max={max}
			onChange={handleChange}
			{...props}
		/>
	);
}

function Lightness() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetInstance,
				instance: tinycolor({
					...instance.toHsl(),
					l: value / 100,
				}),
			});
		},
		[instance, dispatch],
	);
	return (
		<NumberInput
			onChange={handleChange}
			value={instance.toHsl().l * 100}
			type="range"
			min={0}
			max={100}
			step="1"
			className="brightness"
		/>
	);
}

// TODO: try and not rely on the styled components package
const SaturationSlider = styled.input`
	&::-moz-range-track {
		background-image: linear-gradient(
			to right,
			hsl(${(props: { h: number }) => props.h}, 0%, 50%),
			hsl(${(props: { h: number }) => props.h}, 100%, 50%)
		);
	}
`;

function Saturation() {
	const [{ instance }, dispatch] = useColorContext();
	const ref = useRef<HTMLInputElement | null>(null);
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetInstance,
				instance: tinycolor({
					...instance.toHsl(),
					s: value.currentTarget.value / 100,
				}),
			});
		},
		[instance, dispatch],
	);

	return (
		<>
			<SaturationSlider
				h={instance.toHsl().h}
				onChange={handleChange}
				value={instance.toHsl().s * 100}
				type="range"
				min="0"
				max="100"
				step="1"
				ref={ref}
			/>
		</>
	);
}

function Hue() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetInstance,
				instance: tinycolor({
					...instance.toHsl(),
					h: value.currentTarget.value,
				}),
			});
		},
		[instance, dispatch],
	);
	return (
		<input
			onChange={handleChange}
			value={instance.toHsl().h}
			type="range"
			min="0"
			max="360"
			step="1"
			className="hue"
		/>
	);
}

function Picker() {
	const [mouseDown, setMouseDown] = useState(false);
	const [{ instance }, dispatch] = useColorContext();
	const pointerRef = useRef<HTMLDivElement | null>(null);

	const pointer = {
		centerWidth: (pointerRef.current?.clientWidth || 0) / 2,
		centerHeight: (pointerRef.current?.clientHeight || 0) / 2,
		width: pointerRef.current?.clientWidth || 0,
		height: pointerRef.current?.clientHeight || 0,
	};

	const calculateColor = (
		event: SyntheticEvent<HTMLDivElement, MouseEvent>,
	) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.pageX;
		const y = event.pageY;

		let left = Math.min(x - (rect.left + window.pageXOffset), rect.width);
		let top = Math.min(rect.height - pointer.centerHeight, y - rect.top);

		const s = left / rect.width;
		const v = 1 - top / rect.height;
		dispatch({
			type: ActionTypes.SetInstance,
			instance: tinycolor({ h: instance.toHsv().h, s, v }),
		});
	};

	const handleMouseDown = () => {
		setMouseDown(true);
	};
	const handleMouseUp = () => {
		setMouseDown(false);
	};
	const handleMouseMove = (
		event: SyntheticEvent<HTMLDivElement, MouseEvent>,
	) => {
		if (!mouseDown) return;
		calculateColor(event);
	};

	return (
		<div
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onClick={calculateColor}
			className="h-32 w-32 absolute"
			style={{
				background: `hsl(${instance.toHsl().h}, 100%, 50%)`,
			}}
		>
			<div
				className="absolute inset-0"
				style={{
					background:
						'linear-gradient(to right, rgb(255, 255, 255), rgba(255, 255, 255, 0))',
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					background: 'linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0))',
				}}
			/>
			<div
				className="rounded-full absolute border-white border-2 bg-black h-4 w-4"
				ref={pointerRef}
				style={{
					top: `${-(instance.toHsv().v * 100) - pointer.centerHeight + 100}%`,
					left: `${Math.min(
						instance.toHsv().s * 100 - pointer.centerWidth,
						100,
					)}%`,
				}}
			/>
		</div>
	);
}

function RInput() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetValue,
				value: tinycolor({ ...instance.toRgb(), r: value }).toHex(),
			});
		},
		[dispatch, instance],
	);
	return (
		<NumberInput value={instance.toRgb().r} onChange={handleChange} max={255} />
	);
}
function GInput() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetValue,
				value: tinycolor({ ...instance.toRgb(), g: value }).toHex(),
			});
		},
		[dispatch, instance],
	);
	return (
		<NumberInput value={instance.toRgb().g} onChange={handleChange} max={255} />
	);
}
function BInput() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetValue,
				value: tinycolor({ ...instance.toRgb(), b: value }).toHex(),
			});
		},
		[dispatch, instance],
	);
	return (
		<NumberInput value={instance.toRgb().b} onChange={handleChange} max={255} />
	);
}
function HInput() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetValue,
				value: tinycolor({ ...instance.toHsl(), h: value }).toHex(),
			});
		},
		[dispatch, instance],
	);
	return (
		<NumberInput
			value={instance.toHsl().h.toFixed(0)}
			onChange={handleChange}
			max={360}
		/>
	);
}
function SInput() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetValue,
				value: tinycolor({ ...instance.toHsl(), s: value / 100 }).toHex(),
			});
		},
		[dispatch, instance],
	);
	return (
		<NumberInput
			value={(instance.toHsl().s * 100).toFixed(0)}
			onChange={handleChange}
			max={100}
		/>
	);
}

function LInput() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetValue,
				value: tinycolor({ ...instance.toHsl(), l: value / 100 }).toHex(),
			});
		},
		[dispatch, instance],
	);
	return (
		<NumberInput
			value={(instance.toHsl().l * 100).toFixed(0)}
			onChange={handleChange}
			max={100}
		/>
	);
}

function VInput() {
	const [{ instance }, dispatch] = useColorContext();
	const handleChange = useCallback(
		(value) => {
			dispatch({
				type: ActionTypes.SetValue,
				value: tinycolor({ ...instance.toHsv(), v: value / 100 }).toHex(),
			});
		},
		[dispatch, instance],
	);
	return (
		<NumberInput
			value={(instance.toHsv().v * 100).toFixed(0)}
			onChange={handleChange}
			max={100}
		/>
	);
}

// TODO: allow for the value to be changed externally
function ColorPicker({
	value,
	onChange,
	children,
}: {
	value: tinycolor.ColorInput;
	onChange: (value: any) => void;
	children: ReactNode;
}) {
	const [state, dispatch] = useReducer(
		(state: State, action: Actions) => reducers[action.type](state, action),
		{
			value: tinycolor(value).toHex(),
			instance: tinycolor(value),
			onChange,
			format: 'hex',
		},
	);

	useEffect(() => {
		onChange(state.instance.toHex());
	}, [state.instance, onChange]);

	return (
		<ColorContext.Provider value={[state, dispatch]}>
			{children}
		</ColorContext.Provider>
	);
}

function render(component, theirProps, ourProps) {
	return createElement(component, { ...theirProps, ourProps });
}

export default Object.assign(ColorPicker, {
	Color,
	Lightness,
	Saturation,
	Hue,
	Picker,
	Hex: HexInput,
	R: RInput,
	G: GInput,
	B: BInput,
	H: HInput,
	S: SInput,
	L: LInput,
	V: VInput,
});

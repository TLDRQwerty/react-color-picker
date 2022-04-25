import tinycolor from "tinycolor2";
import styled from "styled-components";
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
  ComponentProps,
  useLayoutEffect,
  createElement,
  JSXElementConstructor,
} from "react";
import clsx from "clsx";

import css from "./styles.module.css";

type State = {
  instance: tinycolor.Instance;
  onChange: (value: any) => void;
  format: Formats;
  value: string;
};

export enum Formats {
  hex = "hex",
  rgb = "rgb",
  hsl = "hsl",
  hsv = "hsv",
}

enum ActionTypes {
  SetValue,
  SetInstance,
}

type Actions =
  | { type: ActionTypes.SetValue; value: string }
  | { type: ActionTypes.SetInstance; instance: tinycolor.Instance };

const reducers: {
  [P in ActionTypes]: (
    state: State,
    Action: Extract<Actions, { type: P }>
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
    throw Error("Failed to find context");
  }
  return context;
}

function Color({
  color,
  selectable,
  ...props
}: {
  color?: tinycolor.ColorInput;
  selectable?: boolean;
} & Omit<ComponentProps<"div">, "onClick">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleClick = () => {
    dispatch({ type: ActionTypes.SetInstance, instance: tinycolor(color) });
  };
  return (
    <div
      {...props}
      onClick={color && selectable ? handleClick : undefined}
      className={clsx(
        { "cursor-pointer": color && selectable },
        "h-12 w-12",
        props.className
      )}
      style={{
        backgroundColor:
          color != null ? tinycolor(color).toHexString() : instance.toHexString(),
        ...props.style,
      }}
    />
  );
}

function HexInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value" | "type">) {
  const [{ value }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: value.currentTarget.value,
      });
    },
    [dispatch]
  );

  return <input {...props} type="text" value={value} onChange={handleChange} />;
}

function Lightness({
  ...props
}: {} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetInstance,
        instance: tinycolor({
          ...instance.toHsl(),
          l: parseInt(value.currentTarget.value, 10) / 100,
        }),
      });
    },
    [instance, dispatch]
  );
  return (
    <input
      {...props}
      onChange={handleChange}
      value={instance.toHsl().l * 100}
      type={props.type || "range"}
      min={props.min || 0}
      max={props.max || 100}
      step={props.step || 1}
      className={clsx(css.lightness, props.className)}
    />
  );
}

function Alpha({
  ...props
}: {} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetInstance,
        instance: tinycolor({
          ...instance.toRgb(),
          a: parseInt(value.currentTarget.value, 10) / 100,
        }),
      });
    },
    [instance, dispatch]
  );
  return (
    <input
      {...props}
      onChange={handleChange}
      value={instance.toRgb().a * 100}
      type={props.type || "range"}
      min={props.min || 0}
      max={props.max || 100}
      step={props.step || 1}
      className={clsx(css.alpha, props.className)}
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
  &::-webkit-slider-runnable-track {
    background-image: linear-gradient(
      to right,
      hsl(${(props: { h: number }) => props.h}, 0%, 50%),
      hsl(${(props: { h: number }) => props.h}, 100%, 50%)
    );
  }
`;

function Saturation({
  ...props
}: {} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetInstance,
        instance: tinycolor({
          ...instance.toHsl(),
          s: parseInt(value.currentTarget.value, 10) / 100,
        }),
      });
    },
    [instance, dispatch]
  );

  return (
    <>
      <SaturationSlider
        {...props}
        h={instance.toHsl().h}
        onChange={handleChange}
        type={props.type || "range"}
        min={props.min || 0}
        max={props.max || 100}
        step={props.step || 1}
        value={instance.toHsl().s * 100}
      />
    </>
  );
}

function Hue({
  ...props
}: {} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetInstance,
        instance: tinycolor({
          ...instance.toHsl(),
          h: parseInt(value.currentTarget.value, 10),
        }),
      });
    },
    [instance, dispatch]
  );
  return (
    <input
      onChange={handleChange}
      value={instance.toHsl().h.toFixed(0)}
      type={props.type || "range"}
      min={props.min || 0}
      max={props.max || 100}
      step={props.step || 1}
      className={clsx(css.hue, props.className)}
    />
  );
}

function Picker<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
>({ as = "div", ...props }: { as: T } & ComponentProps<T>) {
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
    event: SyntheticEvent<HTMLDivElement, MouseEvent>
  ) => {
    const { height, width, x, y } = event.currentTarget.getBoundingClientRect();

    const s = Math.max(Math.min((event.clientX - x) / width, 1), 0);
    const v = Math.max(Math.min(1 - (event.clientY - y) / height, 1), 0);
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
    event: SyntheticEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!mouseDown) return;
    calculateColor(event);
  };

  return createElement(
    as,
    {
      ...props,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onClick: calculateColor,
      className: `h-32 w-32 relative ${props.className}`,
      style: {
        background: `hsl(${instance.toHsl().h}, 100%, 50%)`,
      },
    },
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgb(255, 255, 255), rgba(255, 255, 255, 0))",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0))",
        }}
      />
      <div
        className="rounded-full absolute border-white border-2 bg-black h-4 w-4"
        ref={pointerRef}
        style={{
          top: `${-(instance.toHsv().v * 100) - pointer.centerHeight + 100}%`,
          left: `${Math.min(
            instance.toHsv().s * 100 - pointer.centerWidth,
            100
          )}%`,
        }}
      />
    </>
  );

  return <div></div>;
}

function RInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: tinycolor({
          ...instance.toRgb(),
          r: parseInt(value.currentTarget.value, 10),
        }).toHex(),
      });
    },
    [dispatch, instance]
  );
  return (
    <input
      {...props}
      type={props.type || "number"}
      max={props.max || 255}
      value={instance.toRgb().r}
      onChange={handleChange}
    />
  );
}
function GInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: tinycolor({
          ...instance.toRgb(),
          g: parseInt(value.currentTarget.value, 10),
        }).toHex(),
      });
    },
    [dispatch, instance]
  );
  return (
    <input
      {...props}
      type={props.type || "number"}
      max={props.max || 255}
      value={instance.toRgb().g}
      onChange={handleChange}
    />
  );
}
function BInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: tinycolor({
          ...instance.toRgb(),
          b: parseInt(value.currentTarget.value, 10),
        }).toHex(),
      });
    },
    [dispatch, instance]
  );
  return (
    <input
      {...props}
      type={props.type || "number"}
      max={props.max || 255}
      value={instance.toRgb().b}
      onChange={handleChange}
    />
  );
}
function HInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: tinycolor({
          ...instance.toHsl(),
          h: parseInt(value.currentTarget.value, 10),
        }).toHex(),
      });
    },
    [dispatch, instance]
  );
  return (
    <input
      {...props}
      type={props.type || "number"}
      max={props.max || 360}
      value={instance.toHsl().h.toFixed(0)}
      onChange={handleChange}
    />
  );
}
function SInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: tinycolor({
          ...instance.toHsl(),
          s: parseInt(value.currentTarget.value, 10) / 100,
        }).toHex(),
      });
    },
    [dispatch, instance]
  );
  return (
    <input
      {...props}
      type={props.type || "number"}
      max={props.max || 100}
      value={(instance.toHsl().s * 100).toFixed(0)}
      onChange={handleChange}
    />
  );
}

function LInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: tinycolor({
          ...instance.toHsl(),
          l: parseInt(value.currentTarget.value, 10) / 100,
        }).toHex(),
      });
    },
    [dispatch, instance]
  );
  return (
    <input
      {...props}
      type={props.type || "number"}
      max={props.max || 100}
      value={(instance.toHsl().l * 100).toFixed(0)}
      onChange={handleChange}
    />
  );
}

function VInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: tinycolor({
          ...instance.toHsv(),
          v: parseInt(value.currentTarget.value, 10) / 100,
        }).toHex(),
      });
    },
    [dispatch, instance]
  );
  return (
    <input
      {...props}
      type={props.type || "number"}
      max={props.max || 100}
      value={(instance.toHsv().v * 100).toFixed(0)}
      onChange={handleChange}
    />
  );
}

function AInput({
  ...props
}: {} & Omit<ComponentProps<"input">, "onChange" | "value">) {
  const [{ instance }, dispatch] = useColorContext();
  const handleChange = useCallback(
    (value: SyntheticEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionTypes.SetValue,
        value: tinycolor({
          ...instance.toRgb(),
          a: parseInt(value.currentTarget.value, 10) / 100,
        }).toHex(),
      });
    },
    [dispatch, instance]
  );
  return (
    <input
      {...props}
      type={props.type || "number"}
      max={props.max || 100}
      value={(instance.toRgb().a * 100).toFixed(0)}
      onChange={handleChange}
    />
  );
}

// TODO: allow for the value to be changed externally
function ColorPicker<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
>({
  value,
  onChange,
  children,
  format,
  as = "div",
  ...props
}: {
  value: tinycolor.ColorInput;
  onChange: (value: any) => void;
  children: ReactNode;
  format?: Formats;
  as: T;
} & ComponentProps<T>) {
  const [state, dispatch] = useReducer(
    (state: State, action: Actions) => reducers[action.type](state, action),
    {
      value: tinycolor(value).toHex(),
      instance: tinycolor(value),
      onChange,
      format: format || Formats.hex,
    }
  );

  useLayoutEffect(() => {
    if (state.instance.toHex() != tinycolor(value).toHex()) {
      dispatch({ type: ActionTypes.SetInstance, instance: tinycolor(value) });
    }
  }, [value]);

  useEffect(() => {
    onChange(transformInstanceToFormat(state.instance, state.format));
  }, [state.instance, onChange]);

  return (
    <ColorContext.Provider value={[state, dispatch]}>
      {createElement(as, props, children)}
    </ColorContext.Provider>
  );
}

function transformInstanceToFormat(
  instance: tinycolor.Instance,
  format: Formats
) {
  switch (format) {
    case Formats.hex:
      return instance.toHex();
    case Formats.rgb:
      return instance.toRgb();
    case Formats.hsl:
      return instance.toHsl();
    case Formats.hsv:
      return instance.toHsv();
  }
}

export default Object.assign(ColorPicker, {
  Color,
  Lightness,
  Saturation,
  Alpha,
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
  A: AInput,
});

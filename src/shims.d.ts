declare module 'react' {
  export const StrictMode: any;
  export function createContext<T>(value: T): any;
  export function useContext<T>(context: any): any;
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useRef<T>(value: T): { current: T };
  export type PropsWithChildren = { children?: any };
}

declare module 'react-dom/client' {
  export function createRoot(element: Element): { render(node: any): void };
}

declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Link: any;
  export const Navigate: any;
  export const Route: any;
  export const Routes: any;
  export function useNavigate(): (path: string) => void;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

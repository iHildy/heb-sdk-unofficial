/**
 * This component uses a MutationObserver to listen for DOM changes made by our Turnstile logic,
 * which operates outside the React lifecycle. It stores the observed state in ref to ensure that
 * any external style changes, such as updates to max-height, min-height, or margin-bottom persist across re-renders,
 * preventing unwanted layout resets.
 */
export declare const CaptchaElement: () => import("@emotion/react/jsx-runtime").JSX.Element;

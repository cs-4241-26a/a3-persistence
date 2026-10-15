import * as Stacks from "../../stacks";
export declare class ToastController extends Stacks.StacksController {
    static targets: string[];
    readonly toastTarget: HTMLElement;
    readonly initialFocusTargets: HTMLElement[];
    private _boundClickFn;
    private _boundKeypressFn;
    private activeTimeout;
    private returnElement;
    connect(): void;
    /**
     * Disconnects all added event listeners on controller disconnect
     */
    disconnect(): void;
    /**
     * Toggles the visibility of the toast
     */
    toggle(dispatcher?: Event | Element | null): void;
    /**
     * Shows the toast
     */
    show(dispatcher?: Event | Element | null): void;
    /**
     * Hides the toast
     */
    hide(dispatcher?: Event | Element | null): void;
    /**
     * Validates the toast settings and attempts to set necessary internal variables
     */
    private validate;
    /**
     * Toggles the visibility of the toast element
     * @param show Optional parameter that force shows/hides the element or toggles it if left undefined
     */
    private _toggle;
    /**
     * Listens for the s-toast:hidden event and focuses the returnElement when it is fired
     */
    private focusReturnElement;
    /**
     * Remove the element on hide if the `remove-when-hidden` flag is set
     */
    private removeToastOnHide;
    /**
     * Hide the element after a delay
     */
    private hideAfterTimeout;
    /**
     * Cancels the activeTimeout
     */
    clearActiveTimeout(): void;
    /**
     * Gets all elements within the toast that could receive keyboard focus.
     */
    private getAllTabbables;
    /**
     * Returns the first visible element in an array or `undefined` if no elements are visible.
     */
    private firstVisible;
    /**
     * Attempts to shift keyboard focus into the toast.
     * If elements with `data-s-toast-target="initialFocus"` are present and visible, one of those will be selected.
     * Otherwise, the first visible focusable element will receive focus.
     */
    private focusInsideToast;
    /**
     * Binds global events to the document for hiding toasts on user interaction
     */
    private bindDocumentEvents;
    /**
     * Unbinds global events to the document for hiding toasts on user interaction
     */
    private unbindDocumentEvents;
    /**
     * Forces the toast to hide if a user clicks outside of it or its reference element
     */
    private hideOnOutsideClick;
    /**
     * Forces the toast to hide if the user presses escape while it, one of its childen, or the reference element are focused
     */
    private hideOnEscapePress;
    /**
     * Determines the correct dispatching element from a potential input
     * @param dispatcher The event or element to get the dispatcher from
     */
    private getDispatcher;
}
/**
 * Helper to manually show an s-toast element via external JS
 * @param element the element the `data-controller="s-toast"` attribute is on
 */
export declare function showToast(element: HTMLElement): void;
/**
 * Helper to manually hide an s-toast element via external JS
 * @param element the element the `data-controller="s-toast"` attribute is on
 */
export declare function hideToast(element: HTMLElement): void;

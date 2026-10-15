import * as Stacks from "../../stacks";
export declare class BannerController extends Stacks.StacksController {
    static targets: string[];
    readonly bannerTarget: HTMLElement;
    /**
     * Toggles the visibility of the banner
     */
    toggle(dispatcher?: Event | Element | null): void;
    /**
     * Shows the banner
     */
    show(dispatcher?: Event | Element | null): void;
    /**
     * Hides the banner
     */
    hide(dispatcher?: Event | Element | null): void;
    /**
     * Toggles the visibility of the banner element
     * @param show Optional parameter that force shows/hides the element or toggles it if left undefined
     */
    private _toggle;
    /**
     * Remove the element on hide if the `remove-when-hidden` flag is set
     */
    private removeBannerOnHide;
    /**
     * Determines the correct dispatching element from a potential input
     * @param dispatcher The event or element to get the dispatcher from
     */
    private getDispatcher;
}
/**
 * Helper to manually show an s-banner element via external JS
 * @param element the element the `data-controller="s-banner"` attribute is on
 */
export declare function showBanner(element: HTMLElement): void;
/**
 * Helper to manually hide an s-banner element via external JS
 * @param element the element the `data-controller="s-banner"` attribute is on
 */
export declare function hideBanner(element: HTMLElement): void;

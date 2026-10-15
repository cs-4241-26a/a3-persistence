import * as Stacks from "../../stacks";
/**
 * The string values of these enumerations should correspond with `aria-sort` valid values.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-sort#values
 */
export declare enum SortOrder {
    Ascending = "ascending",
    Descending = "descending",
    None = "none"
}
export declare class TableController extends Stacks.StacksController {
    readonly columnTarget: HTMLTableCellElement;
    readonly columnTargets: HTMLTableCellElement[];
    static targets: string[];
    sort(evt: PointerEvent): void;
    private updateSortedColumnStyles;
}
/**
 * @internal This function is exported for testing purposes but is not a part of our public API
 *
 * @param section
 */
export declare function buildIndex(section: HTMLTableSectionElement): HTMLTableCellElement[][];
/**
 * @internal This function is exported for testing purposes but is not a part of our public API
 *
 * @param cell
 */
export declare function getCellSlot(cell: HTMLTableCellElement): number;

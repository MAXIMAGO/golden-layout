import { JsonValue } from '../utils/utils';
import { Config, ItemConfig, JsonComponentConfig, ManagerConfig, PopoutManagerConfig, ReactComponentConfig } from './config';

export interface UserItemConfig {
    /**
     * The type of the item. Possible values are 'row', 'column', 'stack', 'component' and 'react-component'.
     */
    type: ItemConfig.Type;

    /**
     * An array of configurations for items that will be created as children of this item.
     */
    content?: UserItemConfig[];

    /**
     * The width of this item, relative to the other children of its parent in percent
     */
    width?: number;

    /**
     * The height of this item, relative to the other children of its parent in percent
     */
    height?: number;

    /**
     * A String or an Array of Strings. Used to retrieve the item using item.getItemsById()
     */
    id?: string | string[];

    /**
     * Determines if the item is closable. If false, the x on the items tab will be hidden and container.close()
     * will return false
     * Default: true
     */
    isClosable?: boolean;

    /**
     * The title of the item as displayed on its tab and on popout windows
     * Default: componentName or ''
     */
    title?: string;

    /**
     * Default: true
     */
    reorderEnabled?: boolean;

    activeItemIndex?: number;
}

export namespace UserItemConfig {
    export function resolveDefaults(user: UserItemConfig): ItemConfig {
        switch (user.type) {
            case ItemConfig.Type.root:
            case ItemConfig.Type.row:
            case ItemConfig.Type.column:
            case ItemConfig.Type.stack:
                const result: ItemConfig = {
                    type: user.type,
                    content: UserItemConfig.resolveContentDefaults(user.content),
                    width: user.width ?? defaults.width,
                    height: user.height ?? defaults.height,
                    id: user.id ?? defaults.id,
                    isClosable: user.isClosable ?? defaults.isClosable,
                    reorderEnabled: user.reorderEnabled ?? defaults.reorderEnabled,
                    title: user.title ?? defaults.title,
                    activeItemIndex: user.activeItemIndex ?? defaults.activeItemIndex,
                }
                return result;

            case ItemConfig.Type.component:
                return UserJsonComponentConfig.resolveDefaults(user as UserJsonComponentConfig);

            case ItemConfig.Type['react-component']:
                return UserReactComponentConfig.resolveDefaults(user as UserReactComponentConfig);

            default:
                const neverUserType: never = user.type;
                throw new Error(`UserItemConfig.resolveDefaults: Unreachable Type: ${neverUserType}`);
        }
    }

    export function resolveContentDefaults(content: UserItemConfig[] | undefined): ItemConfig[] {
        if (content === undefined) {
            return [];
        } else {
            const count = content.length;
            const result = new Array<ItemConfig>(count);
            for (let i = 0; i < count; i++) {
                result[i] = UserItemConfig.resolveDefaults(content[i]);
            }
            return result;
        }
    }

    export const defaults: ItemConfig = {
        type: ItemConfig.Type.stack, // not really default but need something
        content: [],
        width: 50,
        height: 50,
        id: '',
        isClosable: true,
        reorderEnabled: true,
        title: '',
        activeItemIndex: -1,
    }

    export function isRoot(config: UserItemConfig): config is UserItemConfig {
        return config.type === ItemConfig.Type.root;
    }
    export function isRow(config: UserItemConfig): config is UserItemConfig {
        return config.type === ItemConfig.Type.row;
    }
    export function isColumn(config: UserItemConfig): config is UserItemConfig {
        return config.type === ItemConfig.Type.column;
    }
    export function isStack(config: UserItemConfig): config is UserItemConfig {
        return config.type === ItemConfig.Type.stack;
    }
    export function isJson(config: UserItemConfig): config is UserJsonComponentConfig {
        return config.type === ItemConfig.Type.component;
    }
    export function isReact(config: UserItemConfig): config is UserReactComponentConfig {
        return config.type === ItemConfig.Type["react-component"];
    }
}

export interface UserComponentConfig extends UserItemConfig {
    /**
     * The name of the component as specified in layout.registerComponent. Mandatory if type is 'component'.
     */
    componentName: string;
}

export interface UserJsonComponentConfig extends UserComponentConfig {
    /**
     * A serialisable object. Will be passed to the component constructor function and will be the value returned by
     * container.getState().
     */
    componentState?: JsonValue;
}

export namespace UserJsonComponentConfig {
    export function resolveDefaults(user: UserJsonComponentConfig): JsonComponentConfig {
        if (user.componentName === undefined) {
            throw new Error('UserJsonComponentConfig.componentName is undefined');
        } else {
            const result: JsonComponentConfig = {
                type: user.type,
                content: UserItemConfig.resolveContentDefaults(user.content),
                width: user.width ?? UserItemConfig.defaults.width,
                height: user.height ?? UserItemConfig.defaults.height,
                id: user.id ?? UserItemConfig.defaults.id,
                isClosable: user.isClosable ?? UserItemConfig.defaults.isClosable,
                reorderEnabled: user.reorderEnabled ?? UserItemConfig.defaults.reorderEnabled,
                title: user.title ?? user.componentName,
                activeItemIndex: user.activeItemIndex ?? UserItemConfig.defaults.activeItemIndex,
                componentName: user.componentName,
                componentState: user.componentState ?? {},
            };
            return result;
        }
    }
}

export interface UserReactComponentConfig extends UserComponentConfig {
    /**
     * Properties that will be passed to the component and accessible using this.props.
     */
    props?: unknown;
}

export namespace UserReactComponentConfig {
    export function resolveDefaults(user: UserReactComponentConfig): ReactComponentConfig {
        if (user.componentName === undefined) {
            throw new Error('UserReactComponentConfig.componentName is undefined');
        } else {
            const result: ReactComponentConfig = {
                type: ItemConfig.Type["react-component"],
                content: UserItemConfig.resolveContentDefaults(user.content),
                width: user.width ?? UserItemConfig.defaults.width,
                height: user.height ?? UserItemConfig.defaults.height,
                id: user.id ?? UserItemConfig.defaults.id,
                isClosable: user.isClosable ?? UserItemConfig.defaults.isClosable,
                reorderEnabled: user.reorderEnabled ?? UserItemConfig.defaults.reorderEnabled,
                title: user.title ?? user.componentName,
                activeItemIndex: user.activeItemIndex ?? UserItemConfig.defaults.activeItemIndex,
                componentName: ReactComponentConfig.REACT_COMPONENT_ID,
                props: user.props,
            };
            return result;
        }
    }
}

export interface UserManagerConfig {
    content?: UserItemConfig[];
    openPopouts?: UserPopoutManagerConfig[];
    dimensions?: UserManagerConfig.Dimensions;
    settings?: UserManagerConfig.Settings;
    labels?: UserManagerConfig.Labels;
    maximisedItemId?: string | null,
}

export namespace UserManagerConfig {
    export interface Settings {
        /**
         * Turns headers on or off. If false, the layout will be displayed with splitters only.
         * Default: true
         */
        hasHeaders?: boolean;

        /**
         * Constrains the area in which items can be dragged to the layout's container. Will be set to false
         * automatically when layout.createDragSource() is called.
         * Default: true
         */
        constrainDragToContainer?: boolean;

        /**
         * If true, the user can re-arrange the layout by dragging items by their tabs to the desired location.
         * Default: true
         */
        reorderEnabled?: boolean;

        /**
         * If true, the user can select items by clicking on their header. This sets the value of layout.selectedItem to
         * the clicked item, highlights its header and the layout emits a 'selectionChanged' event.
         * Default: false
         */
        selectionEnabled?: boolean;

        /**
         * Decides what will be opened in a new window if the user clicks the popout icon. If true the entire stack will
         * be transferred to the new window, if false only the active component will be opened.
         * Default: false
         */
        popoutWholeStack?: boolean;

        /**
         * Specifies if an error is thrown when a popout is blocked by the browser (e.g. by opening it programmatically).
         * If false, the popout call will fail silently.
         * Default: true
         */
        blockedPopoutsThrowError?: boolean;

        /**
         * Specifies if all popouts should be closed when the page that created them is closed. Popouts don't have a
         * strong dependency on their parent and can exist on their own, but can be quite annoying to close by hand. In
         * addition, any changes made to popouts won't be stored after the parent is closed.
         * Default: true
         */
        closePopoutsOnUnload?: boolean;

        /**
         * Specifies if the popout icon should be displayed in the header-bar.
         * Default: true
         */
        showPopoutIcon?: boolean;

        /**
         * Specifies if the maximise icon should be displayed in the header-bar.
         * Default: true
         */
        showMaximiseIcon?: boolean;

        /**
         * Specifies if the close icon should be displayed in the header-bar.
         * Default: true
         */
        showCloseIcon?: boolean;

        /**
         * Specifies Responsive Mode (more info needed).
         * Default: onload
         */
        responsiveMode?: ManagerConfig.Settings.ResponsiveMode;

        /**
         * Specifies Maximum pixel overlap per tab.
         * Default: 0
         */
        tabOverlapAllowance?: number;

        /**
         * 
         * Default: true
         */
        reorderOnTabMenuClick?: boolean;

        /**
         * @default Settings.tabControlOffset
         * Default: 10
         */
        tabControlOffset?: number;
    }

    export namespace Settings {
        export function resolveDefaults(user: Settings | undefined): ManagerConfig.Settings {
            const result: ManagerConfig.Settings = {
                hasHeaders: user?.hasHeaders ?? defaults.hasHeaders,
                constrainDragToContainer: user?.constrainDragToContainer ?? defaults.constrainDragToContainer,
                reorderEnabled: user?.reorderEnabled ?? defaults.reorderEnabled,
                selectionEnabled: user?.selectionEnabled ?? defaults.selectionEnabled,
                popoutWholeStack: user?.popoutWholeStack ?? defaults.popoutWholeStack,
                blockedPopoutsThrowError: user?.blockedPopoutsThrowError ?? defaults.blockedPopoutsThrowError,
                closePopoutsOnUnload: user?.closePopoutsOnUnload ?? defaults.closePopoutsOnUnload,
                showPopoutIcon: user?.showPopoutIcon ?? defaults.showPopoutIcon,
                showMaximiseIcon: user?.showMaximiseIcon ?? defaults.showMaximiseIcon,
                showCloseIcon: user?.showCloseIcon ?? defaults.showCloseIcon,
                responsiveMode: user?.responsiveMode ?? defaults.responsiveMode,
                tabOverlapAllowance: user?.tabOverlapAllowance ?? defaults.tabOverlapAllowance,
                reorderOnTabMenuClick: user?.reorderOnTabMenuClick ?? defaults.reorderOnTabMenuClick,
                tabControlOffset: user?.tabControlOffset ?? defaults.tabControlOffset,
            }
            return result;
        }

        export const defaults: ManagerConfig.Settings = {
            hasHeaders: true,
            constrainDragToContainer: true,
            reorderEnabled: true,
            selectionEnabled: false,
            popoutWholeStack: false,
            blockedPopoutsThrowError: true,
            closePopoutsOnUnload: true,
            showPopoutIcon: true,
            showMaximiseIcon: true,
            showCloseIcon: true,
            responsiveMode: ManagerConfig.Settings.ResponsiveMode.onload,
            tabOverlapAllowance: 0,
            reorderOnTabMenuClick: true,
            tabControlOffset: 10
        }
    }

    export interface Dimensions {
        /**
         * The width of the borders between the layout items in pixel. Please note: The actual draggable area is wider
         * than the visible one, making it safe to set this to small values without affecting usability.
         * Default: 5
         */
        borderWidth?: number;

        /**
         * Default: 15
         */
        borderGrabWidth?: number,

        /**
         * The minimum height an item can be resized to (in pixel).
         * Default: 10
         */
        minItemHeight?: number;

        /**
         * The minimum width an item can be resized to (in pixel).
         * Default: 10
         */
        minItemWidth?: number;

        /**
         * The height of the header elements in pixel. This can be changed, but your theme's header css needs to be
         * adjusted accordingly.
         * Default: 20
         */
        headerHeight?: number;

        /**
         * The width of the element that appears when an item is dragged (in pixel).
         * Default: 300
         */
        dragProxyWidth?: number;

        /**
         * The height of the element that appears when an item is dragged (in pixel).
         * Default: 200
         */
        dragProxyHeight?: number;
    }

    export namespace Dimensions {
        export function resolveDefaults(user: Dimensions | undefined): ManagerConfig.Dimensions {
            const result: ManagerConfig.Dimensions = {
                borderWidth: user?.borderWidth ?? defaults.borderWidth,
                borderGrabWidth: user?.borderGrabWidth ?? defaults.borderGrabWidth,
                minItemHeight: user?.minItemHeight ?? defaults.minItemHeight,
                minItemWidth: user?.minItemWidth ?? defaults.minItemWidth,
                headerHeight: user?.headerHeight ?? defaults.headerHeight,
                dragProxyWidth: user?.dragProxyWidth ?? defaults.dragProxyWidth,
                dragProxyHeight: user?.dragProxyHeight ?? defaults.dragProxyHeight,
            }
            return result;
        }

        export const defaults: ManagerConfig.Dimensions = {
            borderWidth: 5,
            borderGrabWidth: 15,
            minItemHeight: 10,
            minItemWidth: 10,
            headerHeight: 20,
            dragProxyWidth: 300,
            dragProxyHeight: 200
        }
    }

    export interface Labels {
        /**
         * The tooltip text that appears when hovering over the close icon.
         * Default: 'close'
         */
        close?: string;

        /**
         * The tooltip text that appears when hovering over the maximise icon.
         * Default: 'maximise'
         */
        maximise?: string;

        /**
         * The tooltip text that appears when hovering over the minimise icon.
         * Default: 'minimise'
         */
        minimise?: string;

        /**
         * The tooltip text that appears when hovering over the popin icon.
         * Default: 'pop in'
         */
        popin?: string;

        /**
         * The tooltip text that appears when hovering over the popout icon.
         * Default: 'open in new window'
         */
        popout?: string;

        /**
         * 
         * Default: 'additional tabs'
         */
        tabDropdown?: string;
    }

    export namespace Labels {
        export function resolveDefaults(user: Labels | undefined): ManagerConfig.Labels {
            const result: ManagerConfig.Labels = {
                close: user?.close ?? defaults.close,
                maximise: user?.maximise ?? defaults.maximise,
                minimise: user?.minimise ?? defaults.minimise,
                popout: user?.popout ?? defaults.popout,
                popin: user?.popin ?? defaults.popin,
                tabDropdown: user?.tabDropdown ?? defaults.tabDropdown,
            }
            return result;
        }

        export const defaults: ManagerConfig.Labels = {
            close: 'close',
            maximise: 'maximise',
            minimise: 'minimise',
            popout: 'open in new window',
            popin: 'pop in',
            tabDropdown: 'additional tabs'
        }
    }

    export function resolveOpenPopouts(userPopoutConfigs: UserPopoutManagerConfig[] | undefined): PopoutManagerConfig[] {
        if (userPopoutConfigs === undefined) {
            return [];
        } else {
            const count = userPopoutConfigs.length;
            const result = new Array<PopoutManagerConfig>(count);
            for (let i = 0; i < count; i++) {
                result[i] = UserPopoutManagerConfig.resolveDefaults(userPopoutConfigs[i]);
            }
            return result;
        }
    }
}

export interface UserPopoutManagerConfig extends UserManagerConfig {
    parentId: string;
    indexInParent: number;
    dimensions: UserPopoutManagerConfig.Dimensions;
}

export namespace UserPopoutManagerConfig {
    export interface Dimensions extends UserManagerConfig.Dimensions {
        width: number | null,
        height: number | null,
        left: number | null,
        top: number | null,
    }

    export namespace Dimensions {
        export function resolveDefaults(user: Dimensions | undefined): PopoutManagerConfig.Dimensions {
            const result: PopoutManagerConfig.Dimensions = {
                borderWidth: user?.borderWidth ?? defaults.borderWidth,
                borderGrabWidth: user?.borderGrabWidth ?? defaults.borderGrabWidth,
                minItemHeight: user?.minItemHeight ?? defaults.minItemHeight,
                minItemWidth: user?.minItemWidth ?? defaults.minItemWidth,
                headerHeight: user?.headerHeight ?? defaults.headerHeight,
                dragProxyWidth: user?.dragProxyWidth ?? defaults.dragProxyWidth,
                dragProxyHeight: user?.dragProxyHeight ?? defaults.dragProxyHeight,
                width: user?.width ?? defaults.width,
                height: user?.height ?? defaults.height,
                left: user?.left ?? defaults.left,
                top: user?.top ?? defaults.top,
            }
            return result;
        }

        export const defaults: PopoutManagerConfig.Dimensions = {
            borderWidth: 5,
            borderGrabWidth: 15,
            minItemHeight: 10,
            minItemWidth: 10,
            headerHeight: 20,
            dragProxyWidth: 300,
            dragProxyHeight: 200,
            width: null,
            height: null,
            left: null,
            top: null,
        }
    }

    export function resolveDefaults(user: UserPopoutManagerConfig): PopoutManagerConfig {
        const config: PopoutManagerConfig = {
            content: UserItemConfig.resolveContentDefaults(user.content),
            parentId: user.parentId,
            indexInParent: user.indexInParent,
            openPopouts: UserManagerConfig.resolveOpenPopouts(user.openPopouts),
            settings: UserManagerConfig.Settings.resolveDefaults(user.settings),
            labels: UserManagerConfig.Labels.resolveDefaults(user.labels),
            dimensions: Dimensions.resolveDefaults(user.dimensions),
            maximisedItemId: user.maximisedItemId ?? null,
        } 
        return config;
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserConfig extends UserManagerConfig {
}

export namespace UserConfig {
    export function resolveDefaults(user: UserConfig): Config {
        const config: Config = {
            defaultsResolved: true,
            content: UserItemConfig.resolveContentDefaults(user.content),
            openPopouts: UserManagerConfig.resolveOpenPopouts(user.openPopouts),
            dimensions: UserManagerConfig.Dimensions.resolveDefaults(user.dimensions),
            settings: UserManagerConfig.Settings.resolveDefaults(user.settings),
            labels: UserManagerConfig.Labels.resolveDefaults(user.labels),
            maximisedItemId: user.maximisedItemId ?? null,
        } 
        return config;
    }

    export const defaultConfig: Config = {
        defaultsResolved: true,
        content: [],
        openPopouts: [],
        settings: UserManagerConfig.Settings.defaults,
        dimensions: UserManagerConfig.Dimensions.defaults,
        labels: UserManagerConfig.Labels.defaults,
        maximisedItemId: null,
    };

    export function isUserConfig(configOrUserConfig: Config | UserConfig): configOrUserConfig is UserConfig {
        const config = configOrUserConfig as Config;
        return config.defaultsResolved === undefined || !config.defaultsResolved;
    }
}

// modules/configSelector/state.js

import { TAB_KEYS } from './constants.js';

// 单例状态
const state = {
    // DOM 元素
    dialog: null,
    configMenu: null,
    advancedDialog: null,
    advancedEditDialog: null,

    // 加载状态
    isLoading: false,
    isLoaded: false,
    closeTipShown: false,

    // UI 构建状态
    uiBuilt: false,
    advancedEditBuilt: false,

    // 当前配置
    currentConfig: null,
    currentMode: 'randomGen',

    // Tab 状态
    tabState: {},

    // 动作处理器
    actionHandlers: null
};


// ============ Getters ============

export const getState = () => state;

export const getDialog = () => state.dialog;
export const getConfigMenu = () => state.configMenu;
export const getAdvancedDialog = () => state.advancedDialog;
export const getAdvancedEditDialog = () => state.advancedEditDialog;

export const getTabState = (tabKey) => state.tabState[tabKey];
export const getCurrentConfig = () => state.currentConfig;
export const getCurrentMode = () => state.currentMode;

// ============ Setters ============

export const setDialog = (dialog) => { state.dialog = dialog; };
export const setConfigMenu = (menu) => { state.configMenu = menu; };
export const setAdvancedDialog = (dialog) => { state.advancedDialog = dialog; };
export const setAdvancedEditDialog = (dialog) => { state.advancedEditDialog = dialog; };

export const setIsLoading = (value) => { state.isLoading = value; };
export const setIsLoaded = (value) => { state.isLoaded = value; };
export const setUiBuilt = (value) => { state.uiBuilt = value; };
export const setAdvancedEditBuilt = (value) => { state.advancedEditBuilt = value; };

export const setCurrentConfig = (config) => { state.currentConfig = config; };
export const setCurrentMode = (mode) => { state.currentMode = mode; };

export const setActionHandlers = (handlers) => { state.actionHandlers = handlers; };

// ============ Tab 状态管理 ============

export const createTabState = (tabKey) => {
    const isHero = tabKey === 'hero';

    const baseState = {
        all: {},
        team: { blue: {}, red: {} },
        currentView: 'all',
        currentTeam: 'blue'
    };

    if (isHero) {
        baseState.player = {
            blue: Array(5).fill(null).map(() => ({})),
            red: Array(5).fill(null).map(() => ({}))
        };
        baseState.currentPlayer = 1;
    }

    return baseState;
};

export const initTabState = () => {
    TAB_KEYS.forEach(tabKey => {
        state.tabState[tabKey] = createTabState(tabKey);
    });
};

export const resetAllState = () => {
    TAB_KEYS.forEach(tabKey => {
        state.tabState[tabKey] = createTabState(tabKey);
    });
    state.currentConfig = null;
};

export const getCurrentData = (tabKey) => {
    const tab = state.tabState[tabKey];
    if (!tab) return {};

    switch (tab.currentView) {
        case 'all': return tab.all;
        case 'team': return tab.team[tab.currentTeam];
        case 'player': return tab.player[tab.currentTeam][tab.currentPlayer - 1];
        default: return {};
    }
};

export const saveCurrentData = (tabKey, data) => {
    const tab = state.tabState[tabKey];
    if (!tab) return;

    switch (tab.currentView) {
        case 'all':
            tab.all = data;
            break;
        case 'team':
            tab.team[tab.currentTeam] = data;
            break;
        case 'player':
            tab.player[tab.currentTeam][tab.currentPlayer - 1] = data;
            break;
    }
};

export const switchView = (tabKey, view, options = {}) => {
    const tab = state.tabState[tabKey];
    if (!tab) return;

    tab.currentView = view;
    if (options.team) tab.currentTeam = options.team;
    if (options.player) tab.currentPlayer = options.player;
};

export const saveAllCurrentData = (collectFn) => {
    TAB_KEYS.forEach(tabKey => {
        const data = collectFn(tabKey);
        saveCurrentData(tabKey, data);
    });
};
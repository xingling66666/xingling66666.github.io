// modules/heroSelector/state.js

/**
 * 英雄选择器状态管理
 * 使用单例模式确保状态唯一
 */

const state = {
    // DOM 元素
    dialog: null,
    heroList: null,
    heroMenu: null,
    
    // 加载状态
    isLoading: false,
    isLoaded: false,
    
    // UI 状态
    closeTipShown: false,
    currentFilter: 'all',
    searchKeyword: '',
    
    // 动作处理器（延迟绑定）
    actionHandlers: null
};

// ============ Getters ============

export const getState = () => state;

export const getDialog = () => state.dialog;
export const getHeroList = () => state.heroList;
export const getHeroMenu = () => state.heroMenu;

export const isLoading = () => state.isLoading;
export const isLoaded = () => state.isLoaded;

export const getCurrentFilter = () => state.currentFilter;
export const getSearchKeyword = () => state.searchKeyword;

// ============ Setters ============

export const setDialog = (dialog) => { state.dialog = dialog; };
export const setHeroList = (list) => { state.heroList = list; };
export const setHeroMenu = (menu) => { state.heroMenu = menu; };

export const setIsLoading = (value) => { state.isLoading = value; };
export const setIsLoaded = (value) => { state.isLoaded = value; };

export const setCurrentFilter = (filter) => { state.currentFilter = filter; };
export const setSearchKeyword = (keyword) => { state.searchKeyword = keyword; };

export const setActionHandlers = (handlers) => { state.actionHandlers = handlers; };

// ============ 状态重置 ============

export const resetState = () => {
    state.dialog = null;
    state.heroList = null;
    state.heroMenu = null;
    state.isLoaded = false;
    state.isLoading = false;
    state.currentFilter = 'all';
    state.searchKeyword = '';
    state.closeTipShown = false;
};
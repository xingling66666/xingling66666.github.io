// modules/mapSelector/state.js

/**
 * 地图选择器状态管理
 * 使用单例模式确保状态唯一
 */

const state = {
    // DOM 元素
    menuContainer: null,
    
    // 搜索相关
    searchKeyword: '',
    
    // 缓存
    mapNamesCache: null
};

// ============ Getters ============

export const getState = () => state;

export const getMenuContainer = () => state.menuContainer;
export const getSearchKeyword = () => state.searchKeyword;
export const getMapNamesCache = () => state.mapNamesCache;

// ============ Setters ============

export const setMenuContainer = (container) => { state.menuContainer = container; };
export const setSearchKeyword = (keyword) => { state.searchKeyword = keyword; };
export const setMapNamesCache = (names) => { state.mapNamesCache = names; };

// ============ 状态重置 ============

export const resetState = () => {
    state.menuContainer = null;
    state.searchKeyword = '';
    state.mapNamesCache = null;
};

export const resetSearch = () => {
    state.searchKeyword = '';
};
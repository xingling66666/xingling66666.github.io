// modules/mapSelector/panel.js

import * as storage from '../../services/storage.js';
import {
    getState,
    setMenuContainer,
    setSearchKeyword,
    setMapNamesCache,
    resetSearch
} from './state.js';
import {
    createSearchInput,
    renderMapMenu,
    filterMenuItems,
    resetFilter,
    clearContainer
} from './renderer.js';

/**
 * 创建地图选择器面板
 */
export const createMapSelectorPanel = () => {
    const state = getState();
    
    // ============ 初始化 ============
    
    const init = () => {
        setMenuContainer(document.querySelector(".map-menu"));
        
        if (!state.menuContainer) {
            console.warn('地图选择器容器未找到');
            return false;
        }
        
        // 创建并添加搜索框
        const searchInput = createSearchInput();
        state.menuContainer.appendChild(searchInput);
        
        // 渲染菜单
        const mapNames = renderMapMenu(state.menuContainer, handleSelectMap);
        setMapNamesCache(mapNames);
        
        // 绑定事件
        bindEvents(searchInput);
        
        console.log('地图选择器初始化完成');
        return true;
    };
    
    // ============ 事件绑定 ============
    
    const bindEvents = (searchInput) => {
        // 搜索事件
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value;
            setSearchKeyword(keyword);
            filterMenuItems(state.menuContainer, keyword);
        });
        
        // 菜单关闭时重置搜索
        state.menuContainer.parentElement?.addEventListener('closed', () => {
            searchInput.value = '';
            resetSearch();
            resetFilter(state.menuContainer);
        });
    };
    
    // ============ 事件处理 ============
    
    const handleSelectMap = (mapName) => {
        storage.setCurrentMapMode(mapName);
        
        const mapInput = document.querySelector(".map-input");
        if (mapInput) {
            mapInput.value = mapName;
        }
    };
    
    // ============ 公共方法 ============
    
    /**
     * 刷新菜单
     */
    const refresh = () => {
        if (!state.menuContainer) return;
        
        clearContainer(state.menuContainer);
        
        const mapNames = renderMapMenu(state.menuContainer, handleSelectMap);
        setMapNamesCache(mapNames);
        
        // 如果有搜索关键词，重新应用过滤
        if (state.searchKeyword) {
            filterMenuItems(state.menuContainer, state.searchKeyword);
        }
    };
    
    /**
     * 获取当前选中的地图
     */
    const getCurrentMap = () => {
        return document.querySelector(".map-input")?.value || '';
    };
    
    /**
     * 设置当前地图
     */
    const setCurrentMap = (mapName) => {
        const mapInput = document.querySelector(".map-input");
        if (mapInput) {
            mapInput.value = mapName;
            storage.setCurrentMapMode(mapName);
        }
    };
    
    /**
     * 获取所有地图名称
     */
    const getMapNames = () => {
        return state.mapNamesCache || [];
    };
    
    /**
     * 检查地图是否存在
     */
    const hasMap = (mapName) => {
        return state.mapNamesCache?.includes(mapName) || false;
    };
    
    // ============ 返回 API ============
    
    return {
        init,
        refresh,
        getCurrentMap,
        setCurrentMap,
        getMapNames,
        hasMap
    };
};
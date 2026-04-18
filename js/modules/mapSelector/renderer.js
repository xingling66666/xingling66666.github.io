// modules/mapSelector/renderer.js

import { createElement } from '../../utils/dom.js';
import { getWebCreateableMapNames, getMapTip } from '../../data/mapData.js';

// ============ 搜索框 ============

/**
 * 创建搜索框
 */
export const createSearchInput = () => {
    return createElement('mdui-text-field', {
        className: 'search-input',
        attributes: {
            variant: 'outlined',
            label: '搜索内容',
            autosize: true
        },
        style: { padding: '0 5px' }
    });
};

// ============ 菜单项 ============

/**
 * 创建地图菜单项
 */
export const createMapMenuItem = (mapName, onClick) => {
    return createElement('mdui-menu-item', {
        textContent: mapName,
        dataset: { mapName },
        onclick: onClick
    });
};

/**
 * 创建带提示的菜单项包装
 */
export const createMapMenuItemWithTooltip = (mapName, onClick) => {
    const menuItem = createMapMenuItem(mapName, onClick);
    const mapTip = getMapTip(mapName);
    
    if (mapTip) {
        const tooltip = createTooltip(mapName, mapTip);
        tooltip.appendChild(menuItem);
        return tooltip;
    }
    
    return menuItem;
};

// ============ 提示工具 ============

/**
 * 创建提示工具
 */
export const createTooltip = (title, content) => {
    const tooltip = createElement('mdui-tooltip', {
        attributes: {
            trigger: 'click',
            placement: 'right'
        }
    });
    
    const tooltipContent = createElement('div', {
        attributes: { slot: 'content' }
    });
    
    const titleDiv = createElement('div', {
        textContent: title,
        style: { fontSize: '1.2em', fontWeight: 'bold' }
    });
    tooltipContent.appendChild(titleDiv);
    
    if (content) {
        const contentDiv = createElement('div', {
            textContent: content,
            style: { marginTop: '5px' }
        });
        tooltipContent.appendChild(contentDiv);
    }
    
    tooltip.appendChild(tooltipContent);
    return tooltip;
};

// ============ 渲染 ============

/**
 * 渲染地图菜单
 */
export const renderMapMenu = (container, onSelectMap) => {
    const mapNames = getWebCreateableMapNames();
    
    mapNames.forEach(mapName => {
        const item = createMapMenuItemWithTooltip(mapName, () => onSelectMap(mapName));
        container.appendChild(item);
    });
    
    return mapNames;
};

// ============ 过滤 ============

/**
 * 过滤菜单项
 */
export const filterMenuItems = (container, keyword) => {
    const searchTerm = keyword.toLowerCase();
    const items = container.querySelectorAll('mdui-menu-item');
    
    items.forEach(item => {
        const text = item.dataset.mapName || item.textContent;
        const shouldShow = text.toLowerCase().includes(searchTerm);
        
        item.style.display = shouldShow ? '' : 'none';
        
        // 如果父元素是 tooltip，也需要隐藏
        const parent = item.parentElement;
        if (parent?.tagName === 'MDUI-TOOLTIP') {
            parent.style.display = shouldShow ? '' : 'none';
        }
    });
};

/**
 * 重置过滤器
 */
export const resetFilter = (container) => {
    container.querySelectorAll('mdui-menu-item, mdui-tooltip').forEach(el => {
        el.style.display = '';
    });
};

// ============ 工具函数 ============

/**
 * 清空容器（保留搜索框）
 */
export const clearContainer = (container) => {
    const searchInput = container.querySelector('.search-input');
    container.innerHTML = '';
    if (searchInput) {
        container.appendChild(searchInput);
    }
};
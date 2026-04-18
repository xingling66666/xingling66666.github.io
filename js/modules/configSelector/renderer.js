// modules/configSelector/renderer.js

import { createElement } from '../../utils/dom.js';
import { 
    UI_SECTIONS,
    VICTORY_CONDITIONS,
    DEFAULT_VICTORY,
} from '../../utils/config/index.js';
import { applyVictoryToDOM } from './core.js';

// ============ 面板构建 ============

/**
 * 构建所有配置面板
 */
export const buildAllConfigPanels = async (dialog) => {
    const panels = dialog.querySelectorAll('.config-panel');
    const sections = UI_SECTIONS;
    
    for (let i = 0; i < sections.length; i++) {
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                const container = panels[i].querySelector('.config-container');
                buildSection(container, sections[i]);
                resolve();
            });
        });
    }
    
    // 最后一个面板添加胜利条件
    const lastPanel = panels[panels.length - 1];
    const lastContainer = lastPanel.querySelector('.config-container');
    addVictorySelect(lastContainer);
};

/**
 * 构建单个区块
 */
const buildSection = (container, section) => {
    const list = createElement('mdui-list');
    
    if (section.groups) {
        section.groups.forEach(group => {
            list.appendChild(createElement('mdui-list-subheader', { textContent: group.name }));
            group.order.forEach(attrKey => {
                const attr = group.attributes[attrKey];
                if (attr) {
                    list.appendChild(createConfigSelect(attrKey, attr.label, attr.options, attr.defaultValue));
                }
            });
        });
    } else {
        list.appendChild(createElement('mdui-list-subheader', { textContent: section.name }));
        section.order.forEach(attrKey => {
            const attr = section.attributes[attrKey];
            if (attr) {
                list.appendChild(createConfigSelect(attrKey, attr.label, attr.options, attr.defaultValue));
            }
        });
    }
    
    container.appendChild(list);
};

/**
 * 添加胜利条件选择器
 */
const addVictorySelect = (container) => {
    const list = container.querySelector('mdui-list') || createElement('mdui-list');
    
    const options = VICTORY_CONDITIONS.map(c => c.label);
    const victorySelect = createConfigSelect('victory', '胜利条件', options, DEFAULT_VICTORY);
    victorySelect.id = 'victory-condition';
    list.appendChild(victorySelect);
    
    if (!container.contains(list)) {
        container.appendChild(list);
    }
};

// ============ 组件创建 ============

/**
 * 创建配置选择器
 */
export const createConfigSelect = (attrKey, label, options, defaultValue = 0) => {
    const select = createElement('mdui-select', {
        attributes: { 
            label, 
            variant: 'outlined',
            'data-attr-key': attrKey
        },
        style: { padding: '10px' }
    });
    
    options.forEach((option, index) => {
        select.appendChild(createElement('mdui-menu-item', {
            textContent: option,
            attributes: { value: String(index) }
        }));
    });
    
    select.updateComplete.then(() => {
        select.value = String(defaultValue);
        select.defaultValue = String(defaultValue);
    });
    
    return select;
};

/**
 * 创建文本字段
 */
export const createTextField = (label, configCount) => {
    return createElement('mdui-text-field', {
        className: 'form-input advanced-edit-field',
        attributes: { label, variant: 'outlined', readonly: true },
        value: `点击编辑配置 共有${configCount}个配置`
    });
};

// ============ UI 更新 ============

/**
 * 更新选择器显示状态
 */
export const updateSelectorsVisibility = (panel, mode) => {
    const teamSelector = panel.querySelector('.team-selector');
    const playerSelector = panel.querySelector('.player-selector');
    
    const visibility = {
        all: { team: false, player: false },
        team: { team: true, player: false },
        player: { team: true, player: true }
    }[mode];
    
    if (teamSelector) teamSelector.style.display = visibility.team ? 'block' : 'none';
    if (playerSelector) playerSelector.style.display = visibility.player ? 'block' : 'none';
};

/**
 * 更新胜利条件选择器
 */
export const updateUIModeSelectors = (dialog, config) => {
    const panels = dialog.querySelectorAll('.config-panel');
    
    panels.forEach(panel => {
        const tabKey = panel.dataset.tabKey;
        const panelConfig = config[tabKey];
        if (!panelConfig) return;
        
        const modeGroup = panel.querySelector('.config-mode-group');
        if (modeGroup) modeGroup.value = panelConfig.mode || 'all';
    });
    
    if (config.victory) {
        applyVictoryToDOM(config.victory);
    }
};
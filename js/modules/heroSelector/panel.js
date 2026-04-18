// modules/heroSelector/panel.js

import { createElement } from '../../utils/dom.js';
import * as storage from '../../services/storage.js';
import { copyText } from '../../services/clipboard.js';
import { showSnackbar, showConfirm, showPrompt, showAlert } from '../../ui/components/dialog/index.js';
import { TIPS } from '../../config/constants.js';
import {
    getState,
    setDialog,
    setHeroList,
    setHeroMenu,
    setIsLoading,
    setIsLoaded,
    setActionHandlers
} from './state.js';
import {
    getAllHeroNames,
    isRandomBanConfig,
    isJSON,
    getHeroTypeStats,
    getAvailableHeroesByTypes,
    generateRandomConfigName,
    generateRandomConfigValue
} from './core.js';
import {
    loadHeroList,
    filterCardsByType,
    filterCardsBySearch,
    resetFilter,
    selectHeroes,
    getSelectedHeroes,
    selectAllCards,
    invertCardSelection,
    clearCardSelection,
    setupResizeHandler,
    adjustLayout,
    renderTypeFilter,
    createRandomBanDialogContent
} from './renderer.js';

/**
 * 创建英雄选择器面板
 */
export const createHeroSelectorPanel = () => {
    const state = getState();

    // 动作处理器
    const actionHandlers = {
        new: createNewConfig,
        copySelection: copySelection,
        importSelection: importSelection,
        delete: deleteConfig,
        rename: renameConfig,
        selectAll: handleSelectAll,
        invertSelect: handleInvertSelection,
        save: saveConfig,
        randomBan: createRandomBan
    };

    setActionHandlers(actionHandlers);

    // ============ 初始化 ============

    const init = () => {
        setDialog(document.querySelector(".hero-selector-dialog"));
        setHeroList(document.querySelector(".hero-grid-container"));
        setHeroMenu(document.querySelector(".hero-menu"));

        if (!state.dialog || !state.heroList) {
            console.warn('英雄选择器容器未找到');
            return false;
        }

        bindEvents();
        initSearchFilter();
        initTypeFilter();
        initHeroMenu();
        setupResizeHandler(state.dialog);

        console.log('英雄选择器初始化完成');
        return true;
    };

    const bindEvents = () => {
        const closeBtn = state.dialog.querySelector(".dialog-close-btn");
        if (closeBtn) closeBtn.addEventListener('click', handleClose);

        bindActionButtons();
        bindSchemeMenuEvents();
    };

    const bindActionButtons = () => {
        const buttons = state.dialog.querySelectorAll('[data-hero-action]');

        buttons.forEach(btn => {
            const action = btn.dataset.heroAction;
            const handler = actionHandlers[action];

            if (handler) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        });
    };

    const initTypeFilter = () => {
        const heroTypeFilter = document.querySelector(".hero-type-filter");
        if (heroTypeFilter) {
            renderTypeFilter(heroTypeFilter);
            heroTypeFilter.addEventListener("change", (e) => {
                filterCardsByType(state.heroList, e.target.value);
            });
        }
    };

    const initSearchFilter = () => {
        const searchInput = state.dialog.querySelector(".hero-search-input");
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            filterCardsBySearch(state.heroList, e.target.value);
        });

        state.dialog.addEventListener('close', (e) => {
            if (e.target === state.dialog) {
                searchInput.value = '';
                resetFilter(state.heroList);
            }
        });
    };

    // ============ 菜单管理 ============

    const initHeroMenu = () => {
        if (!state.heroMenu) return;

        state.heroMenu.parentElement?.addEventListener('open', () => renderConfigMenuItems());
    };

    const renderConfigMenuItems = (isInDialog = false) => {
        const menuContainer = isInDialog ? state.dialog.querySelector('.hero-scheme-menu') : state.heroMenu;
        if (!menuContainer) return;

        menuContainer.innerHTML = '';

        const searchInput = createElement('mdui-text-field', {
            className: 'search-input',
            attributes: { variant: 'outlined', label: '搜索配置', clearable: true },
            style: { padding: '0 5px' }
        });
        menuContainer.appendChild(searchInput);

        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            menuContainer.querySelectorAll('mdui-menu-item:not([data-keep])').forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(keyword) ? '' : 'none';
            });
        });

        if (!isInDialog) {
            menuContainer.appendChild(createElement('mdui-menu-item', {
                textContent: '管理配置',
                onclick: open
            }));
        }

        menuContainer.appendChild(createElement('mdui-divider'));

        const configs = storage.getBanConfigs();
        const configNames = Object.keys(configs);

        if (configNames.length === 0) {
            menuContainer.appendChild(createElement('mdui-menu-item', {
                textContent: '暂无配置，请新建',
                attributes: { disabled: true }
            }));
            return;
        }

        configNames.sort().forEach(name => {
            menuContainer.appendChild(createElement('mdui-menu-item', {
                textContent: name,
                onclick: () => selectConfig(name)
            }));
        });
    };

    const selectConfig = (name) => {
        storage.setCurrentBanConfigName(name);
        document.querySelector(".hero-ban-input").value = name;

        if (state.dialog.open) {
            selectCurrentConfig();
        }

        showSnackbar(`已选择配置: ${name}`);
    };

    const bindSchemeMenuEvents = () => {
        const schemeTrigger = state.dialog.querySelector('.hero-scheme-trigger');
        if (schemeTrigger) {
            schemeTrigger.addEventListener('click', () => renderConfigMenuItems(true));
        }
    };

    // ============ 面板控制 ============

    const open = async () => {
        if (!state.isLoaded) {
            setIsLoading(true);

            try {
                const heroNames = getAllHeroNames();

                if (heroNames.length === 0) {
                    showSnackbar("英雄数据为空，请更新配置");
                    return;
                }

                await loadHeroList(state.heroList, heroNames);
                setIsLoaded(true);
            } catch (error) {
                console.error('加载失败:', error);
                showSnackbar("加载失败，请重试");
                return;
            } finally {
                setIsLoading(false);
            }
        }

        state.dialog.open = true;
        selectCurrentConfig();
    };

    const selectCurrentConfig = () => {
        const currentValue = document.querySelector(".hero-ban-input")?.value;
        if (!currentValue) return;

        const heroStr = storage.getBanConfigs()[currentValue];
        if (heroStr) {
            if (isRandomBanConfig(heroStr)) {
                clearCardSelection(state.heroList);
                return;
            }
            selectHeroes(state.heroList, heroStr);
        }
    };

    const close = () => {
        if (state.dialog) state.dialog.open = false;
    };

    const handleClose = () => {
        if (state.closeTipShown) return;

        state.closeTipShown = true;
        showConfirm({
            headline: "提示",
            description: "确认关闭吗？更改了配置必须要新建或保存才能生效",
            confirmText: "确认",
            cancelText: "取消"
        }).then(confirmed => {
            if (confirmed) state.dialog.open = false;
            state.closeTipShown = false;
        });
    };

    // ============ 配置操作 ============

    async function createNewConfig() {
        const selectedHeroes = getSelectedHeroes(state.heroList);
        if (!selectedHeroes) {
            showSnackbar("请至少选择一个英雄");
            return;
        }

        const heroCount = selectedHeroes.split(' ').length;

        const name = await showPrompt({
            headline: '新建配置',
            description: '请输入配置名',
        });

        if (!name || isJSON(name)) {
            showSnackbar(isJSON(name) ? '配置名不能是 JSON 格式' : '已取消');
            return;
        }

        const customHeros = storage.getBanConfigs();
        if (customHeros[name]) {
            const confirmed = await showConfirm({
                headline: '配置已存在',
                description: `配置 "${name}" 已存在，是否覆盖？`
            });
            if (!confirmed) return;
        }

        customHeros[name] = selectedHeroes;
        storage.setBanConfigs(customHeros);
        storage.setCurrentBanConfigName(name);
        document.querySelector(".hero-ban-input").value = name;

        showSnackbar(`已保存 ${heroCount} 个英雄到 "${name}"`);
    }

    function copySelection() {
        const selected = getSelectedHeroes(state.heroList);

        if (selected) {
            copyText(selected);
            return;
        }

        const banInput = document.querySelector('.hero-ban-input');
        const selection = banInput?.value && storage.getBanConfigs()[banInput.value];

        // 仅允许复制随机英雄
        if (isRandomBanConfig(selection)) {
            showConfirm({
                description: '当前为随机禁用英雄规则，复制后仅可填写在自定义配置模块的“高级配置”，复制后无法直接使用。确定复制吗？',
                onConfirm: () => copyText(selection)
            });
            return;
        }

        showSnackbar('请先选择英雄');
    }

    async function importSelection() {
        const value = await showPrompt({
            headline: '导入选中',
            description: '请粘贴英雄选中内容'
        });

        if (!value) return;

        if (isRandomBanSelection(value)) {
            showAlert('选中内容为随机英雄不能导入');
            return;
        }

        try {
            selectHeroes(state.heroList, value);
            showSnackbar(TIPS.IMPORT_SUCCESS);
        } catch {
            showSnackbar('输入内容有误');
        }
    }

    async function deleteConfig() {
        const currentValue = document.querySelector(".hero-ban-input")?.value;
        const customHeros = storage.getBanConfigs();

        if (!currentValue || !customHeros[currentValue]) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }

        const confirmed = await showConfirm({
            headline: "提示",
            description: `确定要删除配置 "${currentValue}" 吗？`
        });

        if (confirmed) {
            delete customHeros[currentValue];
            storage.setBanConfigs(customHeros);
            storage.setCurrentBanConfigName('');
            document.querySelector(".hero-ban-input").value = '';
            clearCardSelection(state.heroList);
            showSnackbar("删除配置成功");
        }
    }

    async function renameConfig() {
        const currentValue = document.querySelector(".hero-ban-input")?.value;
        const customHeros = storage.getBanConfigs();

        if (!currentValue || !customHeros[currentValue]) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }

        if (isRandomBanConfig(customHeros[currentValue])) {
            showSnackbar("随机配置不可重命名");
            return;
        }

        const newName = await showPrompt({
            headline: "重命名配置",
            description: `当前：${currentValue}`,
            defaultValue: currentValue
        });

        if (!newName || newName === currentValue) return;

        if (customHeros[newName]) {
            showSnackbar("配置名已存在");
            return;
        }

        customHeros[newName] = customHeros[currentValue];
        delete customHeros[currentValue];
        storage.setBanConfigs(customHeros);
        storage.setCurrentBanConfigName(newName);
        document.querySelector(".hero-ban-input").value = newName;

        showSnackbar("重命名成功");
    }

    function handleSelectAll() {
        selectAllCards(state.heroList);
    }

    function handleInvertSelection() {
        invertCardSelection(state.heroList);
    }

    async function saveConfig() {
        const currentValue = document.querySelector(".hero-ban-input")?.value;
        const customHeros = storage.getBanConfigs();

        // '' 会被当做falsy，需要特殊判断，不能使用!customHeros[currentValue]
        if (!currentValue || customHeros[currentValue] === undefined) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }

        if (isRandomBanConfig(customHeros[currentValue])) {
            showSnackbar("随机配置不可保存");
            return;
        }

        customHeros[currentValue] = getSelectedHeroes(state.heroList);
        storage.setBanConfigs(customHeros);
        showSnackbar("保存配置成功");
    }

    async function createRandomBan() {
        const typeStats = getHeroTypeStats();
        const { bodyDiv, checkboxes } = createRandomBanDialogContent(typeStats);

        mdui.dialog({
            headline: "随机禁用配置",
            body: bodyDiv,
            actions: [
                { text: "取消" },
                {
                    text: "确认",
                    onClick: () => handleRandomBanConfirm(checkboxes, typeStats)
                }
            ]
        });
    }

    async function handleRandomBanConfirm(checkboxes, typeStats) {
        const selectedTypes = checkboxes.filter(cb => cb.checked).map(cb => cb.value);

        if (selectedTypes.length === 0) {
            showSnackbar("请至少选择一个定位");
            return false;
        }

        const availableHeroes = getAvailableHeroesByTypes(selectedTypes);
        const count = await showPrompt({
            headline: "输入随机禁用数量",
            description: `可禁用：1-${availableHeroes.length}`,
            defaultValue: Math.min(5, availableHeroes.length).toString()
        });

        if (!count) return true;

        const num = parseInt(count, 10);
        if (isNaN(num) || num < 1 || num > availableHeroes.length) {
            showSnackbar(`请输入 1-${availableHeroes.length} 之间的数字`);
            return false;
        }

        const typeNameStr = selectedTypes.length === Object.keys(typeStats).length
            ? "全部"
            : selectedTypes.map(t => typeStats[t].name).join('、');

        const configName = generateRandomConfigName(num, typeNameStr);
        const configValue = generateRandomConfigValue(num, selectedTypes);

        const customHeros = storage.getBanConfigs();
        customHeros[configName] = configValue;
        storage.setBanConfigs(customHeros);
        storage.setCurrentBanConfigName(configName);
        document.querySelector(".hero-ban-input").value = configName;

        showSnackbar(`已创建：${configName}`);
        return true;
    }

    // ============ 公共 API ============

    return {
        init,
        open,
        close,
        getSelectedHeroes: () => getSelectedHeroes(state.heroList),
        getCurrentConfigName: () => document.querySelector(".hero-ban-input")?.value || '',
        refresh: () => {
            state.isLoaded = false;
            if (state.heroList) state.heroList.innerHTML = '';
        },
        adjustLayout
    };
};
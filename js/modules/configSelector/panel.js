// modules/configSelector/panel.js

import { createElement } from '../../utils/dom.js';
import * as storage from '../../services/storage.js';
import { copyText } from '../../services/clipboard.js';
import { showSnackbar, showConfirm, showPrompt, showAlert, getDialogBody } from '../../ui/components/dialog/index.js';
import { TIPS, lastCustomVersion } from '../../config/constants.js';
import { compressConfig, decompressConfig, isWebCreateableMapById, isRoomOnlyMapById } from '../../utils/config/index.js';

import {
    getState,
    setDialog,
    setConfigMenu,
    setAdvancedDialog,
    setAdvancedEditDialog,
    setIsLoading,
    setIsLoaded,
    setUiBuilt,
    setCurrentConfig,
    setCurrentMode,
    setActionHandlers,
    initTabState,
    resetAllState,
    saveAllCurrentData,
    getTabState
} from './state.js';

import {
    collectUIData,
    getPanelByTabKey,
    applyFullConfig,
    collectFullConfig,
    loadAllDataToUI,
    switchToAll,
    switchToTeam,
    switchToPlayer,
    isJSON,
    generateConfigName
} from './core.js';

import {
    buildAllConfigPanels,
    updateSelectorsVisibility,
    updateUIModeSelectors
} from './renderer.js';

import {
    openAdvancedEdit,
    getAdvancedSettings,
    applyAdvancedSettingsToUI
} from './advanced.js';

import { buildFullConfig } from './constants.js'

/**
 * 创建配置选择器面板
 */
export const createConfigSelectorPanel = () => {
    const state = getState();

    // 动作处理器
    const actionHandlers = {
        new: createNewConfig,
        copy: copyCurrentConfig,
        import: importConfig,
        delete: deleteConfig,
        rename: renameConfig,
        advanced: openAdvancedSettings,
        save: saveConfig,
        reset: resetConfig
    };

    setActionHandlers(actionHandlers);

    // ============ 初始化 ============

    const init = () => {
        setDialog(document.querySelector('.custom-config-dialog'));
        setConfigMenu(document.querySelector('.custom-menu'));
        setAdvancedDialog(document.querySelector('.advanced-settings-dialog'));
        setAdvancedEditDialog(document.querySelector('.advanced-edit-dialog'));

        if (!state.dialog) {
            console.warn('自定义配置对话框未找到');
            return false;
        }

        checkAndCleanOldConfigs();
        bindEvents();
        initConfigMenu();
        initAdvancedEvents();

        console.log('配置选择器初始化完成');
        return true;
    };

    const checkAndCleanOldConfigs = () => {
        const configs = storage.getCustomConfigs();
        const hasOldConfig = Object.values(configs).some(config => config.version !== lastCustomVersion);

        if (hasOldConfig) {
            showAlert({
                headline: '检测到旧版本配置',
                description: '旧版本配置格式已不再支持，将自动清理所有配置数据。请重新创建配置。'
            }).then(() => cleanOldConfigs());
        }
    };

    const cleanOldConfigs = () => {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) keysToRemove.push(key);
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    };

    // ============ 事件绑定 ============

    const bindEvents = () => {
        const closeBtn = state.dialog.querySelector('.dialog-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', handleClose);

        bindActionButtons();
        bindSchemeMenuEvents();
        bindModeSwitches();
        bindDialogClose();
    };

    const bindActionButtons = () => {
        state.dialog.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-custom-action]');
            if (!btn) return;

            const action = btn.dataset.customAction;
            const handler = actionHandlers[action];

            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    };

    const bindSchemeMenuEvents = () => {
        const schemeTrigger = state.dialog.querySelector('.custom-scheme-trigger');
        if (schemeTrigger) {
            schemeTrigger.addEventListener('click', () => renderConfigMenuItems(true));
        }
    };

    const bindModeSwitches = () => {
        state.dialog.querySelectorAll('.config-mode-group').forEach(group => {
            group.addEventListener('change', (e) => {
                const panel = group.closest('.config-panel');
                handleModeChange(panel, e.target.value);
            });
        });

        state.dialog.querySelectorAll('.team-selector').forEach(selector => {
            selector.addEventListener('change', (e) => {
                const panel = selector.closest('.config-panel');
                handleTeamChange(panel, e.target.value);
            });
        });

        state.dialog.querySelectorAll('.player-selector').forEach(selector => {
            selector.addEventListener('change', (e) => {
                const panel = selector.closest('.config-panel');
                handlePlayerChange(panel, e.target.value);
            });
        });
    };

    const bindDialogClose = () => {
        state.dialog.addEventListener('close', (e) => {
            if (e.target === state.dialog) {
                resetConfigUI();
            }
        });
    };

    // ============ 模式切换处理 ============

    const handleModeChange = (panel, mode) => {
        const tabKey = panel.dataset.tabKey;
        updateSelectorsVisibility(panel, mode);

        switch (mode) {
            case 'all': switchToAll(state.dialog, tabKey); break;
            case 'team': switchToTeam(state.dialog, tabKey); break;
            case 'player': switchToPlayer(state.dialog, tabKey); break;
        }
    };

    const handleTeamChange = (panel, team) => {
        const tabKey = panel.dataset.tabKey;
        switchToTeam(state.dialog, tabKey, team);
    };

    const handlePlayerChange = (panel, playerNum) => {
        const tabKey = panel.dataset.tabKey;
        switchToPlayer(state.dialog, tabKey, playerNum);
    };

    // ============ 菜单管理 ============

    const initConfigMenu = () => {
        if (!state.configMenu) return;
        state.configMenu.parentElement?.addEventListener('open', () => renderConfigMenuItems());
    };

    const renderConfigMenuItems = (isInDialog = false) => {
        const menuContainer = isInDialog ? state.dialog.querySelector('.custom-scheme-menu') : state.configMenu;
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

        const configs = storage.getCustomConfigs();
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
        storage.setCurrentCustomConfigName(name);
        document.querySelector('.custom-input').value = name;

        if (state.dialog.open) {
            selectCurrentConfig();
        }
        showSnackbar(`已选择配置: ${name}`);
    };

    // ============ 高级设置事件 ============

    const initAdvancedEvents = () => {
        if (!state.advancedDialog) return;

        state.advancedDialog.querySelector('.advanced-random-gen')?.addEventListener('click', () => {
            setCurrentMode('randomGen');
            openAdvancedEdit();
        });

        state.advancedDialog.querySelector('.advanced-random-shuffle')?.addEventListener('click', () => {
            setCurrentMode('randomShuffle');
            openAdvancedEdit();
        });

        state.advancedDialog.querySelector('.advanced-confirm-btn')?.addEventListener('click', saveAdvancedSettings);
        state.advancedDialog.querySelector('.advanced-cancel-btn')?.addEventListener('click', () => {
            state.advancedDialog.open = false;
        });

        if (state.advancedEditDialog) {
            state.advancedEditDialog.querySelector('.dialog-close-btn')?.addEventListener('click', () => {
                state.advancedEditDialog.open = false;
            });
        }
    };

    // ============ 面板控制 ============

    const open = async () => {
        if (!state.isLoaded) {
            await buildConfigUI();
        } else {
            state.dialog.open = true;
            selectCurrentConfig();
        }
    };

    const buildConfigUI = async () => {
        if (state.isLoading) {
            showSnackbar('加载中');
            return;
        }

        setIsLoading(true);

        try {
            if (!state.uiBuilt) {
                await buildAllConfigPanels(state.dialog);

                // 初始化状态
                initTabState();

                setUiBuilt(true);
            }

            setIsLoaded(true);
            state.dialog.open = true;
            selectCurrentConfig();
        } catch (error) {
            console.error('构建配置UI失败:', error);
            showSnackbar('加载配置界面失败');
        } finally {
            setIsLoading(false);
        }
    };

    const selectCurrentConfig = () => {
        const name = document.querySelector('.custom-input')?.value;
        if (!name) return;

        const configs = storage.getCustomConfigs();
        const savedConfig = configs[name];
        if (!savedConfig) return;

        if (!savedConfig.version || savedConfig.version !== lastCustomVersion) {
            showAlert({
                headline: '配置格式不兼容',
                description: '检测到旧版本配置格式，请重新创建配置。'
            });
            return;
        }

        applyFullConfig(savedConfig, state.tabState);
        updateUIModeSelectors(state.dialog, savedConfig);
        loadAllDataToUI(state.dialog);

        setCurrentConfig(savedConfig);
    };

    const close = () => {
        if (state.dialog) state.dialog.open = false;
    };

    const handleClose = async () => {
        if (state.closeTipShown) return;

        state.closeTipShown = true;
        const confirmed = await showConfirm({
            headline: '提示',
            description: '确认关闭吗？更改了配置必须要新建或保存才能生效'
        });

        if (confirmed) state.dialog.open = false;
        state.closeTipShown = false;
    };

    // ============ 配置操作 ============

    const getFullConfig = (configName) => {
        saveAllCurrentData((tabKey) => collectUIData(getPanelByTabKey(state.dialog, tabKey)));

        // 收集配置
        const uiConfig = collectFullConfig(state.tabState);
        const advancedSettings = getAdvancedSettings();

        // 构建完整配置
        return buildFullConfig(uiConfig, advancedSettings, {
            name: configName || document.querySelector('.custom-input')?.value || generateConfigName(),
            createdAt: state.currentConfig?.createdAt || new Date().toISOString()
        });
    };

    async function createNewConfig() {
        const configName = await showPrompt({
            headline: '新建配置',
            description: '请输入配置名以新建配置'
        });

        if (!configName || isJSON(configName)) {
            showSnackbar(isJSON(configName) ? '配置名不能是 JSON 格式' : '已取消');
            return;
        }

        const configs = storage.getCustomConfigs();

        if (configs[configName]) {
            const confirmed = await showConfirm({
                headline: '配置已存在',
                description: `配置 "${configName}" 已存在，是否覆盖？`
            });
            if (!confirmed) return;
        }
        const fullConfig = getFullConfig(configName);

        configs[configName] = fullConfig;
        storage.setCustomConfigs(configs);
        storage.setCurrentCustomConfigName(configName);

        document.querySelector('.custom-input').value = configName;
        setCurrentConfig(fullConfig);

        showSnackbar('新建配置成功');
    }

    function copyCurrentConfig() {
        let config = state.currentConfig;
        if (!config) {
            const name = document.querySelector('.custom-input')?.value;
            config = storage.getCustomConfigs()[name];
        }

        if (!config) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }

        copyText(JSON.stringify(compressConfig(config)));
    }

    async function importConfig() {
        const jsonStr = await showPrompt({
            headline: '导入配置',
            description: '请粘贴配置 JSON'
        });

        if (!jsonStr) return;

        try {
            const parsed = JSON.parse(jsonStr);
            let config;

            if (parsed.v === lastCustomVersion || parsed.version === lastCustomVersion) {
                config = parsed.v ? decompressConfig(parsed) : parsed;
            } else {
                showAlert({
                    headline: '配置格式不兼容',
                    description: '导入的配置为旧版本格式，无法使用。'
                });
                return;
            }

            const configName = config.name || `导入配置_${Date.now()}`;
            config.name = configName;
            config.updatedAt = new Date().toISOString();

            const configs = storage.getCustomConfigs();
            configs[configName] = config;
            storage.setCustomConfigs(configs);
            storage.setCurrentCustomConfigName(configName);

            document.querySelector('.custom-input').value = configName;
            applyFullConfig(config, state.tabState);
            updateUIModeSelectors(state.dialog, config);
            loadAllDataToUI(state.dialog);

            setCurrentConfig(config);

            showSnackbar(`配置 "${configName}" 导入成功`);
        } catch (error) {
            console.error('导入失败:', error);
            showSnackbar('配置格式错误');
        }
    }

    async function deleteConfig() {
        const name = document.querySelector('.custom-input')?.value;
        if (!name) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }

        const confirmed = await showConfirm({
            headline: '提示',
            description: `确定要删除配置 "${name}" 吗？`
        });

        if (!confirmed) return;

        const configs = storage.getCustomConfigs();
        delete configs[name];
        storage.setCustomConfigs(configs);
        storage.setCurrentCustomConfigName('');

        document.querySelector('.custom-input').value = '';
        setCurrentConfig(null);
        resetConfigUI();

        showSnackbar('删除配置成功');
    }

    async function renameConfig() {
        const oldName = document.querySelector('.custom-input')?.value;
        if (!oldName) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }

        const newName = await showPrompt({
            headline: '重命名配置',
            description: `当前：${oldName}`,
            defaultValue: oldName
        });

        if (!newName || newName === oldName) return;

        if (isJSON(newName)) {
            showAlert({ description: '保存失败，配置名不能是 JSON 格式' });
            return;
        }

        const configs = storage.getCustomConfigs();

        if (configs[newName]) {
            showSnackbar('配置名已存在');
            return;
        }

        configs[newName] = configs[oldName];
        const config = configs[newName];
        config.name = newName;
        config.updatedAt = new Date().toISOString();

        delete configs[oldName];

        storage.setCustomConfigs(configs);
        storage.setCurrentCustomConfigName(newName);

        document.querySelector('.custom-input').value = newName;
        setCurrentConfig(configs[newName]);

        showSnackbar('重命名成功');
    }

    function openAdvancedSettings() {
        if (!state.advancedDialog) return;

        const name = document.querySelector('.custom-input')?.value;
        const configs = storage.getCustomConfigs();

        if (!configs[name]) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }

        if (name && configs[name]?.advanced) {
            applyAdvancedSettingsToUI(configs[name].advanced);
        } else {
            applyAdvancedSettingsToUI({ mapID: '', heroBans: '', randomGen: {}, randomShuffle: {} });
        }

        state.advancedDialog.open = true;
    }

    function saveAdvancedSettings() {
        const name = document.querySelector('.custom-input')?.value;
        if (!name) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }

        const advanced = getAdvancedSettings();

        // 检测地图是否可在网页开房
        if (advanced.mapID) {
            const mapId = advanced.mapID;

            if (!isWebCreateableMapById(mapId)) {
                showSnackbar('输入的地图ID不可在网页开房');
                return;
            }

            if (isRoomOnlyMapById(mapId)) {
                showSnackbar('该地图仅支持开房，不可自定义配置');
                return;
            }
        }

        const configs = storage.getCustomConfigs();
        configs[name].advanced = advanced;
        configs[name].updatedAt = new Date().toISOString();

        storage.setCustomConfigs(configs);
        setCurrentConfig(configs[name]);


        state.advancedDialog.open = false;
        showSnackbar('高级设置保存成功');
    }

    async function saveConfig() {
        const name = document.querySelector('.custom-input')?.value;
        if (!name) {
            showSnackbar(TIPS.MUST_SELECT);
            return;
        }
        const configs = storage.getCustomConfigs();

        const config = getFullConfig();
        configs[name] = config;

        storage.setCustomConfigs(configs);
        storage.setCurrentCustomConfigName(name);

        setCurrentConfig(config);

        showSnackbar('保存配置成功');
    }

    async function resetConfig() {
        const confirmed = await showConfirm({
            headline: '提示',
            description: '是否还原所有设置？'
        });

        if (!confirmed) return;

        resetConfigUI();
        showSnackbar('还原成功');
    }

    const resetConfigUI = () => {
        state.dialog.querySelectorAll('.config-mode-group').forEach(group => {
            group.value = 'all';
            group.dispatchEvent(new Event('change', { bubbles: true }));
        });

        state.dialog.querySelectorAll('mdui-select').forEach(select => {
            if (select.defaultValue !== undefined) select.value = select.defaultValue;
        });

        const tab = state.dialog.querySelector('mdui-tab');
        if (tab) tab.click();

        getDialogBody(state.dialog)?.scrollTo(0, 0);

        resetAllState();
    };

    // ============ 公共 API ============

    return {
        init,
        open,
        close,
        getCurrentConfig: () => state.currentConfig,
        getCurrentConfigName: () => document.querySelector('.custom-input')?.value || '',
        getCurrentMode: () => state.currentMode,
        refresh: () => {
            setIsLoaded(false);
            setUiBuilt(false);
        }
    };
};
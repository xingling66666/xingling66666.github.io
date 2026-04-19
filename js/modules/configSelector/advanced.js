// modules/configSelector/advanced.js

import { createElement } from '../../utils/dom.js';
import { showSnackbar, showConfirm } from '../../ui/components/dialog/index.js';
import * as storage from '../../services/storage.js';
import { FLAT_CONFIG } from '../../utils/config/index.js';
import {
    getState,
    getCurrentMode,
    setAdvancedEditBuilt,
    getTabState
} from './state.js';
import { VICTORY_SELECT_ID } from './constants.js';
import { getDialogBody } from '../../ui/components/dialog/index.js';

// ============ 高级设置对话框 ============

/**
 * 打开高级编辑对话框
 */
export const openAdvancedEdit = () => {
    const state = getState();
    if (!state.advancedEditDialog) return;

    if (!state.advancedEditBuilt) {
        buildAdvancedEditDialog();
        setAdvancedEditBuilt(true);
    }

    loadAdvancedEditData();
    state.advancedEditDialog.open = true;
};

/**
 * 构建高级编辑对话框
 */
const buildAdvancedEditDialog = () => {
    const state = getState();
    const originalTabs = state.dialog.querySelector('mdui-tabs');
    if (!originalTabs) return;

    const clonedTabs = originalTabs.cloneNode(true);
    clonedTabs.querySelector(`#${VICTORY_SELECT_ID}`)?.remove();

    const clonedPanels = clonedTabs.querySelectorAll('mdui-tab-panel');

    clonedPanels.forEach(clonedPanel => {
        const selects = clonedPanel.querySelectorAll('mdui-select');

        selects.forEach(select => {
            const attrKey = select.dataset.attrKey;
            if (!attrKey) return;

            const tabKey = clonedPanel.dataset.tabKey;
            const id = `${tabKey}.${attrKey}`;
            const flatMeta = FLAT_CONFIG[id];

            const textField = createTextField(select.label, 0);
            textField.dataset.configId = id;
            textField._data = [];
            textField.availablePositions = flatMeta?.totalCount === 10
                ? Array.from({ length: 10 }, (_, i) => `选手${i + 1}`)
                : ['蓝方', '红方'];

            textField.addEventListener('click', () => showEditDialogForField(textField));
            select.replaceWith(textField);
        });
    });

    clonedTabs.querySelectorAll('mdui-radio-group').forEach(group => group.remove());
    state.advancedEditDialog.appendChild(clonedTabs);
};

/**
 * 创建文本字段
 */
const createTextField = (label, configCount) => {
    return createElement('mdui-text-field', {
        className: 'form-input advanced-edit-field',
        attributes: { label, variant: 'outlined', readonly: true },
        value: `点击编辑配置 共有${configCount}个配置`
    });
};

// ============ 数据加载与保存 ============

/**
 * 加载高级编辑数据
 */
const loadAdvancedEditData = () => {
    const state = getState();
    const name = document.querySelector('.custom-input')?.value;
    if (!name) return;

    const configs = storage.getCustomConfigs();
    const config = configs[name];
    if (!config) return;

    const advanced = config.advanced || {};
    const dataKey = state.currentMode === 'randomGen' ? 'randomGen' : 'randomShuffle';
    const savedData = advanced[dataKey] || {};

    const textFields = state.advancedEditDialog.querySelectorAll('mdui-text-field');

    textFields.forEach(textField => {
        const id = textField.dataset.configId;
        const fieldData = savedData[id];

        if (fieldData && fieldData.length > 0) {
            if (state.currentMode === 'randomGen') {
                textField._data = fieldData.map(rule => {
                    const rangeStr = rule.range.join(',');
                    const posStr = rule.positions.join(',');
                    return `${rangeStr}:${posStr}`;
                });
            } else {
                textField._data = fieldData.map(pos => pos.join(','));
            }
            textField.value = `点击编辑配置 共有${fieldData.length}个配置`;
        } else {
            textField._data = [];
            textField.value = '点击编辑配置 共有0个配置';
        }
    });

    const firstTab = state.advancedEditDialog.querySelector('mdui-tab');
    if (firstTab) firstTab.click();
    getDialogBody(state.advancedEditDialog)?.scrollTo(0, 0);
};

/**
 * 保存高级编辑数据
 */
export const saveAdvancedEditData = (textField, data) => {
    const state = getState();
    const name = document.querySelector('.custom-input')?.value;
    if (!name) {
        showSnackbar('请先选择或新建配置');
        return;
    }

    const configs = storage.getCustomConfigs();
    const dataKey = state.currentMode === 'randomGen' ? 'randomGen' : 'randomShuffle';
    const id = textField.dataset.configId;

    if (!configs[name].advanced) {
        configs[name].advanced = { mapID: '', heroBans: '', randomGen: {}, randomShuffle: {} };
    }

    if (data.length === 0) {
        delete configs[name].advanced[dataKey][id];
    } else {
        if (state.currentMode === 'randomGen') {
            const rules = data.map(ruleStr => {
                const [rangeStr, posStr] = ruleStr.split(':');
                return {
                    range: rangeStr.split(',').map(Number),
                    positions: posStr.split(',').map(Number)
                };
            });
            configs[name].advanced[dataKey][id] = rules;
        } else {
            const positions = data.map(ruleStr => ruleStr.split(',').map(Number));
            configs[name].advanced[dataKey][id] = positions;
        }
    }

    configs[name].updatedAt = new Date().toISOString();
    storage.setCustomConfigs(configs);
    state.currentConfig = configs[name];

    showSnackbar('配置已保存');
};

// ============ 编辑对话框 ============

/**
 * 显示字段编辑对话框
 */
const showEditDialogForField = (textField) => {
    const state = getState();
    const id = textField.dataset.configId;
    const flatMeta = FLAT_CONFIG[id];
    const options = flatMeta.options;

    const dialogContent = createElement('div', {
        style: { padding: '16px', width: '100%', maxHeight: '400px', overflowY: 'auto' }
    });

    const newBtn = createElement('mdui-button', {
        textContent: '+ 新建配置',
        variant: 'filled',
        fullWidth: true
    });

    const chipsContainer = createElement('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', marginBottom: '16px' }
    });

    newBtn.addEventListener('click', () => {
        showEditRuleDialog(textField, null, options, (result) => {
            chipsContainer.appendChild(createEditChip(result, textField, options));
        });
    });

    dialogContent.appendChild(newBtn);

    const existingData = textField._data || [];
    existingData.forEach(data => {
        chipsContainer.appendChild(createEditChip(data, textField, options));
    });

    dialogContent.appendChild(chipsContainer);

    showConfirm({
        headline: `编辑 ${textField.getAttribute('label')} ${state.currentMode === 'randomGen' ? '随机生成配置' : '随机打乱配置'}`,
        description: dialogContent,
        confirmText: '保存',
        onConfirm: () => {
            const chips = chipsContainer.querySelectorAll('mdui-chip');
            const data = Array.from(chips).map(chip => chip._data);

            textField.value = `点击编辑配置 共有${data.length}个配置`;
            textField._data = data;

            saveAdvancedEditData(textField, data);
            updateExternalDialog(textField, data);
        },
        cancelText: '取消'
    });
};

/**
 * 创建编辑 Chip
 */
const createEditChip = (data, textField, options) => {
    const chip = createElement('mdui-chip', {
        textContent: "一个配置",
        attributes: { elevated: true },
        style: { cursor: 'pointer' }
    });

    chip._data = data;

    chip.addEventListener('click', () => {
        showEditRuleDialog(textField, chip, options, (result) => {
            chip._data = result;
        }, () => {
            chip.remove();
        });
    });

    return chip;
};

// ============ 规则编辑对话框 ============

const showEditRuleDialog = (textField, chip, options, onSave, onDelete) => {
    const state = getState();
    const { availablePositions } = textField;
    const isRandomGen = state.currentMode === 'randomGen';
    const existingData = chip?._data;
    const hasExistingData = !!existingData;

    let step = 0;
    let selectedRange = [];

    const [existingRange = '', existingPositions = ''] = existingData?.split(':') || [];

    // 创建复选框组
    function createCheckGroup(items, existingValues, getValue) {
        const group = createElement('div', { style: { maxHeight: '300px', overflowY: 'auto' } });

        items.forEach((item, i) => {
            const value = getValue ? getValue(item, i) : String(item);
            const checkbox = createElement('mdui-checkbox', {
                textContent: item,
                attributes: { value }
            });

            if (existingValues.split(',').includes(value)) {
                checkbox.checked = true;
            }

            group.appendChild(checkbox);
        });

        return group;
    }

    // 获取选中的值
    function getSelectedValues(checkGroup) {
        return Array.from(checkGroup.querySelectorAll('mdui-checkbox'))
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    // 创建内容
    function createContent() {
        const container = createElement('div', { style: { padding: '16px' } });
        const isFirstStep = step === 0;

        container.appendChild(createElement('h4', {
            textContent: isFirstStep
                ? (isRandomGen ? '选择随机生成范围' : '选择要打乱的项')
                : '选择作用位置',
            style: { marginTop: 0, marginBottom: '16px' }
        }));

        let items;
        let existingValues;
        let getValue;

        if (isFirstStep) {
            if (isRandomGen) {
                items = options;
            } else {
                const id = textField.dataset.configId;
                const [category, attrKey] = id.split('.');
                const tabState = getTabState(category);

                function getCurrentValue(positionIndex) {
                    if (tabState.currentView === 'all') {
                        return tabState.all[attrKey];
                    } else if (tabState.currentView === 'team') {
                        return positionIndex === 0
                            ? tabState.team.blue[attrKey]
                            : tabState.team.red[attrKey];
                    } else if (tabState.currentView === 'player') {
                        const isBlue = positionIndex < 5;
                        const playerIndex = isBlue ? positionIndex : positionIndex - 5;
                        const teamData = isBlue ? tabState.player.blue : tabState.player.red;
                        return teamData[playerIndex]?.[attrKey];
                    }
                }

                items = [];
                availablePositions.forEach((pos, i) => {
                    const data = getCurrentValue(i);
                    if (data !== undefined) {
                        const valueIndex = parseInt(data);
                        const value = options[valueIndex];
                        items.push(pos + ' ' + value);
                    }
                });
            }
            existingValues = existingRange;
            getValue = (_, i) => String(i);
        } else {
            items = availablePositions;
            existingValues = existingPositions;
            getValue = (_, i) => String(i);
        }

        const checkGroup = createCheckGroup(items, existingValues, getValue);
        checkGroup.className = 'rule-check-group';
        container.appendChild(checkGroup);

        return container;
    }

    // 显示对话框
    function showDialog() {
        const isFirstStep = step === 0;
        const content = createContent();

        const actions = [];

        // 全选按钮
        actions.push({
            text: '全选',
            onClick: (dialog) => {
                dialog.querySelectorAll('.rule-check-group mdui-checkbox').forEach(cb => cb.checked = true);
                return false;
            }
        });

        // 删除按钮
        if (hasExistingData && onDelete) {
            actions.push({
                text: '删除规则',
                onClick: (dialog) => {
                    showConfirm({
                        headline: '删除规则',
                        description: '确定要删除这个规则吗？',
                        confirmText: '删除',
                        cancelText: '取消'
                    }).then(confirmed => {
                        if (confirmed) {
                            onDelete();
                            dialog.open = false;
                        }
                    });
                    return false;
                }
            });
        }

        // 返回按钮
        actions.push({
            text: '返回',
            onClick: () => true
        });

        // 下一步/保存按钮
        actions.push({
            text: isFirstStep && isRandomGen ? '下一步' : '保存',
            variant: 'filled',
            onClick: (dialog) => {
                const selected = getSelectedValues(dialog.querySelector('.rule-check-group'));

                if (selected.length === 0) {
                    showSnackbar(isFirstStep ? '请至少选择一个选项' : '请至少选择一个位置');
                    return false;
                }

                if (isFirstStep && selected.length < 2) {
                    showSnackbar('必须至少选择两个选项');
                    return false;
                }

                if (isFirstStep) {
                    selectedRange = selected;
                    if (isRandomGen) {
                        step = 1;
                        showDialog();
                        return true;
                    } else {
                        onSave(selectedRange.join(','));
                        return true;
                    }
                } else {
                    onSave(selectedRange.join(',') + ':' + selected.join(','));
                    return true;
                }
            }
        });

        mdui.dialog({
            headline: hasExistingData ? '编辑规则' : '新建规则',
            body: content,
            closeOnEsc: true,
            closeOnOverlayClick: false,
            actions: actions
        });
    }

    showDialog();
};

/**
 * 更新外部对话框显示
 */
const updateExternalDialog = (textField, data) => {
    const state = getState();
    const name = document.querySelector('.custom-input')?.value;
    if (!name) return;

    const configs = storage.getCustomConfigs();
    const config = configs[name];
    if (!config) return;

    if (state.advancedDialog) {
        const dataKey = state.currentMode === 'randomGen' ? 'randomGen' : 'randomShuffle';
        const targetField = state.currentMode === 'randomGen'
            ? state.advancedDialog.querySelector('.advanced-random-gen')
            : state.advancedDialog.querySelector('.advanced-random-shuffle');

        if (targetField) {
            const dataObj = config.advanced?.[dataKey] || {};
            const count = Object.keys(dataObj).length;
            targetField.value = count > 0
                ? `点击编辑配置 共有${count}个配置`
                : '点击编辑配置 共有0个配置';
            targetField._data = JSON.stringify(dataObj);
        }
    }
};

// ============ 高级设置 UI ============

export const getAdvancedSettings = () => {
    const state = getState();
    if (!state.advancedDialog) {
        return { mapID: '', heroBans: '', randomGen: {}, randomShuffle: {} };
    }

    const mapInput = state.advancedDialog.querySelector('.advanced-map-input');
    const heroInput = state.advancedDialog.querySelector('.advanced-hero-input');
    const randomGen = state.advancedDialog.querySelector('.advanced-random-gen');
    const randomShuffle = state.advancedDialog.querySelector('.advanced-random-shuffle');

    let randomGenData = {};
    let randomShuffleData = {};

    try {
        if (randomGen?._data) randomGenData = JSON.parse(randomGen._data);
        if (randomShuffle?._data) randomShuffleData = JSON.parse(randomShuffle._data);
    } catch (e) {
        console.warn('解析高级设置失败:', e);
    }

    return {
        mapID: mapInput?.value || '',
        heroBans: heroInput?.value || '',
        randomGen: randomGenData,
        randomShuffle: randomShuffleData
    };
};

export const applyAdvancedSettingsToUI = (advanced) => {
    const state = getState();
    if (!state.advancedDialog || !advanced) return;

    const mapInput = state.advancedDialog.querySelector('.advanced-map-input');
    const heroInput = state.advancedDialog.querySelector('.advanced-hero-input');
    const randomGen = state.advancedDialog.querySelector('.advanced-random-gen');
    const randomShuffle = state.advancedDialog.querySelector('.advanced-random-shuffle');

    if (mapInput) mapInput.value = advanced.mapID || '';
    if (heroInput) heroInput.value = advanced.heroBans || '';

    if (randomGen) {
        const genData = advanced.randomGen || {};
        const count = Object.keys(genData).length;
        randomGen.value = count > 0 ? `点击编辑配置 共有${count}个配置` : '点击编辑配置 共有0个配置';
        randomGen._data = JSON.stringify(genData);
    }

    if (randomShuffle) {
        const shuffleData = advanced.randomShuffle || {};
        const count = Object.keys(shuffleData).length;
        randomShuffle.value = count > 0 ? `点击编辑配置 共有${count}个配置` : '点击编辑配置 共有0个配置';
        randomShuffle._data = JSON.stringify(shuffleData);
    }
};
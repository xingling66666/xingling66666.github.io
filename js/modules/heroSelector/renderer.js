// modules/heroSelector/renderer.js

import { getHeroAvatarUrl } from '../../data/heroData.js';
import { createElement } from '../../utils/dom.js';
import { BATCH_SIZE, HERO_TYPE_MAP, PLACEHOLDER_IMAGE } from './constants.js';
import { shouldShowHeroByType, parseHeroString } from './core.js';

// ============ 英雄卡片 ============

export const createHeroCard = (heroName) => {
    const avatarUrl = getHeroAvatarUrl(heroName);

    const tooltip = createElement('mdui-tooltip', {
        className: 'hero-tooltip',
        openDelay: 1000,
        closeDelay: 300,
        attributes: {
            content: heroName,
            position: 'top',
        }
    });

    const card = createElement('mdui-card', {
        className: 'hero-card',
        attributes: {
            clickable: true,
            variant: 'elevated',
            'data-selected': 'false',
            'data-hidden': 'false'
        }
    });

    const avatarImg = createElement('img', {
        className: 'hero-avatar',
        attributes: { src: avatarUrl, loading: 'lazy' },
        onerror: (e) => {
            e.target.src = PLACEHOLDER_IMAGE;
            e.target.setAttribute('data-error', 'true');
        }
    });

    const checkIcon = createElement('mdui-icon-check', {
        className: 'hero-check',
        attributes: { name: 'check' }
    });

    const nameLabel = createElement('div', {
        className: 'hero-name',
        textContent: heroName
    });

    card.appendChild(avatarImg);
    card.appendChild(checkIcon);
    card.appendChild(nameLabel);

    card._selected = false;
    card._visible = true;

    card.setSelected = (value) => {
        card._selected = value;
        card.setAttribute('data-selected', value);
    };

    card.toggleSelected = () => {
        card.setSelected(!card._selected);
    };

    card.addEventListener("click", (e) => {
        e.stopPropagation();
        card.toggleSelected();
    });

    tooltip.appendChild(card);

    // 把 card 挂到 tooltip 上，方便获取
    tooltip.card = card;

    return tooltip;
};

// 获取真正的卡片元素
const getCard = (el) => el.card || el;

// ============ 列表加载 ============

export const loadHeroList = async (container, heroNames, options = {}) => {
    const { onProgress } = options;

    container.innerHTML = '';
    container.classList.add('hero-grid-container');

    for (let i = 0; i < heroNames.length; i += BATCH_SIZE) {
        const batch = heroNames.slice(i, i + BATCH_SIZE);
        await new Promise((resolve) => {
            requestAnimationFrame(() => {
                batch.forEach(heroName => {
                    container.appendChild(createHeroCard(heroName));
                });
                resolve();
            });
        });
        onProgress?.(Math.min(i + BATCH_SIZE, heroNames.length), heroNames.length);
    }

    adjustLayout();
};

// ============ 筛选渲染 ============

export const filterCardsByType = (container, heroType) => {
    const tools = Array.from(container.children);

    tools.forEach(tool => {
        const card = getCard(tool);
        const heroName = card.querySelector('.hero-name')?.textContent;
        const isVisible = shouldShowHeroByType(heroName, heroType);
        card._visible = isVisible;
        tool.style.display = isVisible ? '' : 'none';
    });

    adjustLayout();
};

export const filterCardsBySearch = (container, searchKeyword) => {
    const tools = Array.from(container.children);
    const lowerKeyword = searchKeyword.toLowerCase();

    tools.forEach(tool => {
        const card = getCard(tool);
        if (!card._visible) return;

        const heroName = card.querySelector('.hero-name')?.textContent || '';
        const matchesSearch = heroName.toLowerCase().includes(lowerKeyword);
        tool.style.display = matchesSearch ? '' : 'none';
    });

    adjustLayout();
};

export const resetFilter = (container) => {
    const tools = Array.from(container.children);

    tools.forEach(tool => {
        const card = getCard(tool);
        if (card._visible) {
            tool.style.display = '';
        }
    });

    adjustLayout();
};

// ============ 选择渲染 ============

export const selectHeroes = (container, heroString) => {
    if (!heroString) return;

    const selectedHeroes = parseHeroString(heroString);
    const tools = Array.from(container.children);

    tools.forEach(tool => {
        const card = getCard(tool);
        const heroName = card.querySelector('.hero-name')?.textContent;
        card.setSelected(selectedHeroes.includes(heroName));
    });
};

export const getSelectedHeroes = (container) => {
    const tools = Array.from(container.children);
    const selectedNames = tools
        .filter(tool => getCard(tool)._selected)
        .map(tool => getCard(tool).querySelector('.hero-name')?.textContent)
        .filter(Boolean);

    return selectedNames.join(' ');
};

export const selectAllCards = (container) => {
    const tools = Array.from(container.children);
    tools.forEach(tool => {
        const card = getCard(tool);
        if (card._visible) card.setSelected(true);
    });
};

export const invertCardSelection = (container) => {
    const tools = Array.from(container.children);
    tools.forEach(tool => {
        const card = getCard(tool);
        if (card._visible) card.setSelected(!card._selected);
    });
};

export const clearCardSelection = (container) => {
    const tools = Array.from(container.children);
    tools.forEach(tool => {
        getCard(tool).setSelected(false);
    });
};

// ============ 布局调整 ============
const getLayoutInfo = (container) => {
    const tools = Array.from(container.children).filter(child => {
        if (child.classList?.contains('hero-placeholder')) return false;
        return getCard(child)._visible;
    });
    if (tools.length === 0) return null;

    const firstTool = tools[0];
    const card = getCard(firstTool);
    const cardWidth = card.offsetWidth;
    if (cardWidth === 0) return null;

    const containerWidth = container.clientWidth;
    const cardsPerRow = Math.floor(containerWidth / cardWidth);
    const lastRowCount = tools.length % cardsPerRow || cardsPerRow;

    const computedStyle = window.getComputedStyle(card);

    return {
        cardsPerRow,
        lastRowCount,
        cardWidth: computedStyle.width,
        cardHeight: computedStyle.height,
        cardMargin: computedStyle.margin
    };
};

const adjustGridLayout = (containerSelector) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const placeholders = container.querySelectorAll('.hero-placeholder');
    placeholders.forEach(el => el.remove());

    const layoutInfo = getLayoutInfo(container);

    if (!layoutInfo) return;

    const { cardsPerRow, lastRowCount, cardWidth, cardHeight, cardMargin } = layoutInfo;

    if (cardsPerRow > lastRowCount) {
        const emptyCount = cardsPerRow - lastRowCount;

        for (let i = 0; i < emptyCount; i++) {
            const emptyDiv = createElement('div', {
                className: 'hero-placeholder',
                style: {
                    width: cardWidth,
                    height: cardHeight,
                    margin: cardMargin,
                    visibility: 'hidden',
                    pointerEvents: 'none'
                }
            });
            container.appendChild(emptyDiv);
        }
    }
};

export const setupResizeHandler = (dialog) => {
    let resizeTimer = null;
    const handleResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            adjustLayout();
        }, 100);
    };

    dialog.addEventListener('open', (e) => {
        if (e.target === dialog) {
            dialog.updateComplete?.then(() => adjustLayout());
            window.addEventListener('resize', handleResize);
        }
    });

    dialog.addEventListener('close', (e) => {
        if (e.target === dialog) {
            window.removeEventListener('resize', handleResize);
            if (resizeTimer) clearTimeout(resizeTimer);
        }
    });
};

export const adjustLayout = () => {
    adjustGridLayout('.hero-grid-container');
};

// ============ 类型筛选器渲染 ============
export const renderTypeFilter = (container, currentType = 'all') => {
    container.innerHTML = '';

    // 添加"全部"选项
    container.appendChild(createElement('mdui-radio', {
        value: 'all',
        textContent: '全部'
    }));

    // 添加各类型选项
    Object.entries(HERO_TYPE_MAP).forEach(([id, name]) => {
        container.appendChild(createElement('mdui-radio', {
            value: id,
            textContent: name
        }));
    });

    container.value = currentType;
};

// ============ 随机禁用弹窗 ============

export const createRandomBanDialogContent = (positionTypeMap) => {
    const containerDiv = createElement('div');
    const checkboxContainer = createElement('div');
    const checkboxes = [];

    Object.entries(positionTypeMap).forEach(([typeValue, item]) => {
        const displayName = item.name;
        const heroCount = item.count;

        const checkbox = createElement('mdui-checkbox', {
            textContent: `${displayName}（${heroCount}个）`,
            attributes: { value: typeValue, checked: true }
        });
        checkboxContainer.appendChild(checkbox);
        checkboxes.push(checkbox);
    });

    containerDiv.appendChild(checkboxContainer);

    const hintParagraph = createElement('p', {
        textContent: `可选定位：${Object.values(positionTypeMap).map(item => item.name).join('、')}`,
        style: { marginTop: '12px' }
    });
    containerDiv.appendChild(hintParagraph);

    return { bodyDiv: containerDiv, checkboxes };
};
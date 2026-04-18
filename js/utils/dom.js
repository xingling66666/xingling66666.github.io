// dom.js - DOM 操作工具函数

/**
 * 创建 DOM 元素并应用配置
 * @param {string} tag - 标签名
 * @param {Object} options - 配置项
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {
    const element = document.createElement(tag);

    // 需要特殊处理的属性（不能直接赋值或需要额外逻辑）
    const specialHandlers = {
        // 样式：支持对象或字符串
        style: (el, val) => {
            if (typeof val === 'string') {
                el.style.cssText = val;
            } else {
                Object.assign(el.style, val);
            }
        },
        
        // dataset 需要使用特殊语法
        dataset: (el, val) => {
            Object.entries(val).forEach(([k, v]) => {
                el.dataset[k] = v;
            });
        },
        
        // attributes 通过 setAttribute 设置
        attributes: (el, val) => {
            Object.entries(val).forEach(([k, v]) => {
                el.setAttribute(k, v);
            });
        }
    };

    // 遍历处理所有配置项
    for (const [key, value] of Object.entries(options)) {
        if (value === undefined) continue;

        // 处理事件：onClick、onInput 等
        if (key.startsWith('on') && key.length > 2) {
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
        }
        // 处理特殊属性
        else if (key in specialHandlers) {
            specialHandlers[key](element, value);
        }
        // 处理普通属性：直接赋值
        else {
            if (key in element) {
                element[key] = value;
            } else {
                console.warn(`[createElement] 属性 "${key}" 不是 <${tag}> 元素的有效属性`);
            }
        }
    }

    return element;
}

/**
 * 查找元素
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => parent.querySelectorAll(selector);

/**
 * 显示/隐藏元素
 */
export function show(el) { el.style.display = ''; }
export function hide(el) { el.style.display = 'none'; }
export function toggle(el) { el.style.display = el.style.display === 'none' ? '' : 'none'; }

/**
 * 添加/移除类
 */
export function addClass(el, ...classes) { el.classList.add(...classes); }
export function removeClass(el, ...classes) { el.classList.remove(...classes); }
export function toggleClass(el, className) { el.classList.toggle(className); }
export function hasClass(el, className) { return el.classList.contains(className); }

/**
 * 设置属性
 */
export function setAttr(el, attrs) {
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
}

/**
 * 获取属性
 */
export function getAttr(el, attr) {
    return el.getAttribute(attr);
}

/**
 * 设置样式
 */
export function setStyle(el, styles) {
    Object.assign(el.style, styles);
}

/**
 * 清空容器
 */
export function clearContainer(container, keepSelector = null) {
    const children = Array.from(container.children);
    children.forEach(child => {
        if (!keepSelector || !child.matches(keepSelector)) {
            child.remove();
        }
    });
}

/**
 * 插入元素
 */
export function insertAfter(newEl, targetEl) {
    targetEl.parentNode.insertBefore(newEl, targetEl.nextSibling);
}

export function insertBefore(newEl, targetEl) {
    targetEl.parentNode.insertBefore(newEl, targetEl);
}
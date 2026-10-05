const MODULE_DEFAULTS = {
    claim_victory: true,
    computer_analysis: true,
    move_planner: true,
    rating_stakes: true
};

let saveQueue = Promise.resolve();
let statusTimer;

function renderToggle(toggle, enabled) {
    toggle.checked = enabled;
    toggle.setAttribute('aria-checked', String(enabled));

    const state = document.querySelector(`[data-state-for="${toggle.dataset.module}"]`);
    if (state) {
        state.textContent = enabled ? 'On' : 'Off';
    }
}

function showStatus(message, kind = '') {
    const status = document.getElementById('save-status');
    window.clearTimeout(statusTimer);
    status.textContent = message;
    status.dataset.kind = kind;

    if (kind === 'saved') {
        statusTimer = window.setTimeout(() => {
            status.textContent = '';
            delete status.dataset.kind;
        }, 1400);
    }
}

async function readPreferences() {
    const result = await chrome.storage.local.get('prefs');
    return result.prefs && typeof result.prefs === 'object' ? result.prefs : {};
}

async function setModuleEnabled(moduleName, enabled) {
    const prefs = await readPreferences();
    const modules = prefs.modules && typeof prefs.modules === 'object' ? prefs.modules : {};
    const moduleSettings = modules[moduleName] && typeof modules[moduleName] === 'object'
        ? modules[moduleName]
        : {};

    await chrome.storage.local.set({
        prefs: {
            ...prefs,
            modules: {
                ...modules,
                [moduleName]: {
                    ...moduleSettings,
                    enabled
                }
            }
        }
    });
}

function queueModuleUpdate(moduleName, enabled) {
    const operation = saveQueue.then(() => setModuleEnabled(moduleName, enabled));
    saveQueue = operation.catch(() => {});
    return operation;
}

async function handleToggle(event) {
    const toggle = event.currentTarget;
    const enabled = toggle.checked;
    renderToggle(toggle, enabled);
    toggle.disabled = true;
    showStatus('Saving…');

    try {
        await queueModuleUpdate(toggle.dataset.module, enabled);
        showStatus('Saved', 'saved');
    } catch (error) {
        renderToggle(toggle, !enabled);
        showStatus('Couldn’t save', 'error');
        console.error('Unable to save module preference:', error);
    } finally {
        toggle.disabled = false;
    }
}

async function initializePopup() {
    document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;

    const toggles = [...document.querySelectorAll('[data-module]')];
    toggles.forEach((toggle) => {
        renderToggle(toggle, MODULE_DEFAULTS[toggle.dataset.module]);
        toggle.addEventListener('change', handleToggle);
    });

    document.getElementById('settings-button').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    try {
        const prefs = await readPreferences();
        toggles.forEach((toggle) => {
            const storedValue = prefs.modules?.[toggle.dataset.module]?.enabled;
            const enabled = typeof storedValue === 'boolean'
                ? storedValue
                : MODULE_DEFAULTS[toggle.dataset.module];
            renderToggle(toggle, enabled);
        });
    } catch (error) {
        showStatus('Using defaults', 'error');
        console.error('Unable to load module preferences:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializePopup);

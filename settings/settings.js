const MODULE_DEFAULTS = getDefaultSettings().modules;

function getToggles() {
    return [...document.querySelectorAll('[data-module]')];
}

function renderToggle(toggle, enabled) {
    toggle.checked = enabled;
    toggle.setAttribute('aria-checked', String(enabled));

    const state = document.querySelector(`[data-state-for="${toggle.dataset.module}"]`);
    if (state) {
        state.textContent = enabled ? 'On' : 'Off';
    }
}

function showStatus(message, kind = '') {
    document.getElementById('save-status-text').textContent = message;
    const status = document.getElementById('save-status');
    if (kind) {
        status.dataset.kind = kind;
    } else {
        delete status.dataset.kind;
    }
}

function setFormBusy(isBusy) {
    getToggles().forEach((toggle) => {
        toggle.disabled = isBusy;
    });
    document.getElementById('restore-button').disabled = isBusy;
    document.getElementById('save-button').disabled = isBusy;
}

function markDirty() {
    document.getElementById('save-button').disabled = false;
    showStatus('You have unsaved changes', 'pending');
}

async function saveSettings() {
    setFormBusy(true);
    showStatus('Saving changes…');
    let saved = false;

    try {
        const settings = await readPreferences();
        const storedModules = settings.modules && typeof settings.modules === 'object'
            ? settings.modules
            : {};
        const modules = { ...storedModules };

        getToggles().forEach((toggle) => {
            const current = modules[toggle.dataset.module] && typeof modules[toggle.dataset.module] === 'object'
                ? modules[toggle.dataset.module]
                : {};
            modules[toggle.dataset.module] = {
                ...current,
                enabled: toggle.checked
            };
        });

        await chrome.storage.local.set({
            settings: {
                ...settings,
                modules
            }
        });

        saved = true;
        showStatus('All changes saved', 'saved');
    } catch (error) {
        showStatus('Changes could not be saved', 'error');
        console.error('Unable to save preferences:', error);
    } finally {
        getToggles().forEach((toggle) => {
            toggle.disabled = false;
        });
        document.getElementById('restore-button').disabled = false;
        document.getElementById('save-button').disabled = saved;
    }
}

function restoreDefaults() {
    getToggles().forEach((toggle) => {
        renderToggle(toggle, MODULE_DEFAULTS[toggle.dataset.module]);
    });
    markDirty();
}

async function initializeSettings() {
    document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;

    const toggles = getToggles();
    toggles.forEach((toggle) => {
        renderToggle(toggle, MODULE_DEFAULTS[toggle.dataset.module]);
        toggle.addEventListener('change', () => {
            renderToggle(toggle, toggle.checked);
            markDirty();
        });
    });

    document.getElementById('save-button').addEventListener('click', saveSettings);
    document.getElementById('restore-button').addEventListener('click', restoreDefaults);

    try {
        const settings = await getSettings();
        toggles.forEach((toggle) => {
            const storedValue = settings[toggle.dataset.module]?.enabled;
            renderToggle(
                toggle,
                typeof storedValue === 'boolean' ? storedValue : MODULE_DEFAULTS[toggle.dataset.module]
            );
            toggle.disabled = false;
        });
        document.getElementById('restore-button').disabled = false;
        showStatus('Preferences are up to date', 'saved');
    } catch (error) {
        toggles.forEach((toggle) => {
            toggle.disabled = false;
        });
        document.getElementById('restore-button').disabled = false;
        showStatus('Using defaults — save to try again', 'error');
        document.getElementById('save-button').disabled = false;
        console.error('Unable to load preferences:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeSettings);

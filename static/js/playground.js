// =============================================================================
// Sentinel Playground
// Interactive configuration validation and request simulation
// =============================================================================

import init, {
    validate,
    simulate,
    create_sample_request,
    init_panic_hook
} from '../wasm/sentinel_playground_wasm.js';

// State
let wasmReady = false;
let lastValidation = null;
let debounceTimer = null;

// DOM Elements
const configEditor = document.getElementById('config-editor');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const errorDisplay = document.getElementById('error-display');
const simulateBtn = document.getElementById('simulate-btn');
const flowDiagram = document.getElementById('flow-diagram');
const traceContent = document.getElementById('trace-content');
const headersList = document.getElementById('headers-list');
const addHeaderBtn = document.getElementById('add-header-btn');

// Icons
const icons = {
    valid: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    invalid: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    loading: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};

// Initialize WASM
async function initWasm() {
    setStatus('loading', 'Loading...');
    try {
        await init();
        init_panic_hook();
        wasmReady = true;
        validateConfig();
    } catch (e) {
        setStatus('error', 'Failed to load');
        console.error('WASM init error:', e);
    }
}

// Set validation status
function setStatus(type, text) {
    statusText.textContent = text;
    statusIcon.innerHTML = type === 'valid' ? icons.valid :
                           type === 'invalid' ? icons.invalid :
                           type === 'loading' ? icons.loading :
                           type === 'warning' ? icons.warning : '';
    statusIcon.className = 'status-icon status-' + type;
}

// Validate configuration
function validateConfig() {
    if (!wasmReady) return;

    const config = configEditor.value;
    try {
        lastValidation = validate(config);

        if (lastValidation.valid) {
            if (lastValidation.warnings && lastValidation.warnings.length > 0) {
                setStatus('warning', `Valid (${lastValidation.warnings.length} warning${lastValidation.warnings.length > 1 ? 's' : ''})`);
                showWarnings(lastValidation.warnings);
            } else {
                setStatus('valid', 'Valid');
                errorDisplay.innerHTML = '';
                errorDisplay.classList.remove('visible');
            }
            simulateBtn.disabled = false;
        } else {
            setStatus('invalid', 'Invalid');
            showErrors(lastValidation.errors);
            simulateBtn.disabled = true;
        }
    } catch (e) {
        setStatus('invalid', 'Parse Error');
        showErrors([{ message: e.message || String(e), severity: 'error' }]);
        simulateBtn.disabled = true;
    }
}

// Show errors
function showErrors(errors) {
    errorDisplay.innerHTML = errors.map(e => `
        <div class="error-item error-${e.severity || 'error'}">
            <span class="error-icon">${icons.invalid}</span>
            <pre class="error-message">${escapeHtml(e.message)}</pre>
        </div>
    `).join('');
    errorDisplay.classList.add('visible');
}

// Show warnings
function showWarnings(warnings) {
    errorDisplay.innerHTML = warnings.map(w => `
        <div class="error-item error-warning">
            <span class="error-icon">${icons.warning}</span>
            <pre class="error-message">${escapeHtml(w.message)}</pre>
        </div>
    `).join('');
    errorDisplay.classList.add('visible');
}

// Run simulation
function runSimulation() {
    if (!wasmReady || !lastValidation?.valid) return;

    const config = configEditor.value;
    const method = document.getElementById('request-method').value;
    const host = document.getElementById('request-host').value;
    const path = document.getElementById('request-path').value;

    // Collect headers
    const headers = {};
    document.querySelectorAll('.header-row').forEach(row => {
        const key = row.querySelector('.header-key')?.value?.trim();
        const value = row.querySelector('.header-value')?.value?.trim();
        if (key) headers[key] = value || '';
    });

    try {
        const request = create_sample_request(method, host, path);
        request.headers = headers;

        const result = simulate(config, JSON.stringify(request));
        renderFlowDiagram(result, { method, host, path });
        renderTrace(result);
    } catch (e) {
        console.error('Simulation error:', e);
        flowDiagram.innerHTML = `<div class="flow-error">Simulation failed: ${escapeHtml(e.message || String(e))}</div>`;
    }
}

// Render flow diagram
function renderFlowDiagram(result, request) {
    const matched = result.matched_route;
    const upstream = result.upstream_selection;
    const policies = result.applied_policies || {};

    const nodes = [
        { id: 'client', label: 'Client', sublabel: `${request.method} ${request.path}`, type: 'client' },
        { id: 'route', label: matched ? `Route: ${matched.id}` : 'No Match', sublabel: matched ? `priority: ${matched.priority}` : '', type: matched ? 'route' : 'nomatch' },
    ];

    if (matched) {
        if (Object.keys(policies).length > 0) {
            const policyLabels = [];
            if (policies.timeout_secs) policyLabels.push(`timeout: ${policies.timeout_secs}s`);
            if (policies.failure_mode) policyLabels.push(`mode: ${policies.failure_mode}`);
            nodes.push({ id: 'policies', label: 'Policies', sublabel: policyLabels.join(', ') || 'default', type: 'policies' });
        }

        if (upstream) {
            nodes.push({
                id: 'upstream',
                label: `Upstream: ${upstream.upstream_id}`,
                sublabel: upstream.selected_target || '',
                type: 'upstream'
            });
        }
    }

    flowDiagram.innerHTML = `
        <div class="flow-nodes">
            ${nodes.map((node, i) => `
                <div class="flow-node flow-node-${node.type}" data-node="${node.id}">
                    <div class="flow-node-label">${escapeHtml(node.label)}</div>
                    ${node.sublabel ? `<div class="flow-node-sublabel">${escapeHtml(node.sublabel)}</div>` : ''}
                </div>
                ${i < nodes.length - 1 ? '<div class="flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>' : ''}
            `).join('')}
        </div>
    `;

    // Animate nodes appearing
    requestAnimationFrame(() => {
        document.querySelectorAll('.flow-node, .flow-arrow').forEach((el, i) => {
            el.style.animationDelay = `${i * 0.1}s`;
            el.classList.add('flow-animate');
        });
    });
}

// Render detailed trace
function renderTrace(result) {
    const sections = [];

    // Route matching trace
    if (result.match_trace && result.match_trace.length > 0) {
        sections.push(`
            <details class="trace-section" open>
                <summary class="trace-summary">
                    <span class="trace-icon">${icons.valid}</span>
                    Route Matching
                </summary>
                <div class="trace-details">
                    ${result.match_trace.map(step => `
                        <div class="trace-step trace-step-${step.result}">
                            <span class="trace-step-route">${escapeHtml(step.route_id)}</span>
                            <span class="trace-step-result">${step.result === 'match' ? '✓ Match' : '✗ No match'}</span>
                            <span class="trace-step-reason">${escapeHtml(step.reason)}</span>
                        </div>
                    `).join('')}
                </div>
            </details>
        `);
    }

    // Applied policies
    const policies = result.applied_policies || {};
    if (Object.keys(policies).length > 0) {
        sections.push(`
            <details class="trace-section">
                <summary class="trace-summary">
                    <span class="trace-icon">${icons.valid}</span>
                    Applied Policies
                </summary>
                <div class="trace-details">
                    <div class="trace-policies">
                        ${Object.entries(policies).map(([key, value]) => `
                            <div class="trace-policy">
                                <span class="policy-key">${escapeHtml(key)}</span>
                                <span class="policy-value">${escapeHtml(JSON.stringify(value))}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </details>
        `);
    }

    // Upstream selection
    if (result.upstream_selection) {
        const us = result.upstream_selection;
        sections.push(`
            <details class="trace-section">
                <summary class="trace-summary">
                    <span class="trace-icon">${icons.valid}</span>
                    Upstream Selection
                </summary>
                <div class="trace-details">
                    <div class="trace-upstream">
                        <div><strong>Upstream:</strong> ${escapeHtml(us.upstream_id)}</div>
                        <div><strong>Target:</strong> ${escapeHtml(us.selected_target)}</div>
                        <div><strong>Algorithm:</strong> ${escapeHtml(us.load_balancer)}</div>
                        ${us.selection_reason ? `<div><strong>Reason:</strong> ${escapeHtml(us.selection_reason)}</div>` : ''}
                    </div>
                </div>
            </details>
        `);
    }

    // Agent hooks
    if (result.agent_hooks && result.agent_hooks.length > 0) {
        sections.push(`
            <details class="trace-section">
                <summary class="trace-summary">
                    <span class="trace-icon">${icons.valid}</span>
                    Agent Hooks (${result.agent_hooks.length})
                </summary>
                <div class="trace-details">
                    ${result.agent_hooks.map(hook => `
                        <div class="trace-hook">
                            <span class="hook-agent">${escapeHtml(hook.agent_id)}</span>
                            <span class="hook-phase">${escapeHtml(hook.hook)}</span>
                            <span class="hook-timeout">${hook.timeout_ms}ms</span>
                            <span class="hook-mode ${hook.failure_mode}">${escapeHtml(hook.failure_mode)}</span>
                        </div>
                    `).join('')}
                </div>
            </details>
        `);
    }

    // Warnings
    if (result.warnings && result.warnings.length > 0) {
        sections.push(`
            <details class="trace-section trace-section-warning">
                <summary class="trace-summary">
                    <span class="trace-icon">${icons.warning}</span>
                    Warnings (${result.warnings.length})
                </summary>
                <div class="trace-details">
                    ${result.warnings.map(w => `
                        <div class="trace-warning">
                            ${w.code ? `<span class="warning-code">${escapeHtml(w.code)}</span>` : ''}
                            <span class="warning-message">${escapeHtml(w.message)}</span>
                        </div>
                    `).join('')}
                </div>
            </details>
        `);
    }

    if (sections.length === 0) {
        traceContent.innerHTML = '<div class="trace-empty">No routing decision (config may be incomplete)</div>';
    } else {
        traceContent.innerHTML = sections.join('');
    }
}

// Add header row
function addHeaderRow(key = '', value = '') {
    const row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = `
        <input type="text" class="header-key" placeholder="Header name" value="${escapeHtml(key)}">
        <input type="text" class="header-value" placeholder="Value" value="${escapeHtml(value)}">
        <button type="button" class="header-remove" aria-label="Remove header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    `;
    row.querySelector('.header-remove').addEventListener('click', () => row.remove());
    headersList.appendChild(row);
}

// Parse URL hash for pre-loaded config
function loadConfigFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#config=')) {
        try {
            const encoded = hash.slice(8);
            const config = atob(decodeURIComponent(encoded));
            configEditor.value = config;
        } catch (e) {
            console.error('Failed to parse config from URL:', e);
        }
    }
}

// Escape HTML
function escapeHtml(str) {
    if (typeof str !== 'string') return String(str);
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

// Debounced validation
function debouncedValidate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(validateConfig, 300);
}

// Event listeners
configEditor.addEventListener('input', debouncedValidate);
simulateBtn.addEventListener('click', runSimulation);
addHeaderBtn.addEventListener('click', () => addHeaderRow());

// Initialize
loadConfigFromHash();
initWasm();

/* constellation.js — Cytoscape.js setup for the cosmology graph.
 *
 * Loads `/api/constellation.json` (cached server-side, single fetch), wires the
 * brutalist node-shape map, and binds the controls panel.
 *
 * No frameworks, no transitions. Hover yellow is #fffacd to match the rest of
 * the site. Click navigates to the node's canonical page in a new tab.
 */

(function () {
    'use strict';

    var $stage = document.getElementById('cn-stage');
    var $graph = document.getElementById('cn-graph');
    var $search = document.getElementById('cn-search');
    var $layout = document.getElementById('cn-layout');
    var $tip = document.getElementById('cn-tip');
    var $tipLabel = document.getElementById('cn-tip-label');
    var $tipType = document.getElementById('cn-tip-type');

    if (!window.cytoscape || !$graph) {
        console.warn('[constellation] cytoscape not available');
        return;
    }

    // ─────────────── node shape per type ───────────────
    // Brutalist: white interior, 1px black border. Shape encodes the type.
    var SHAPE = {
        figure:     'ellipse',
        place:      'rectangle',
        chapter:    'diamond',
        artifact:   'diamond',
        concept:    'hexagon',
        case:       'hexagon',
        code:       'hexagon',
        // 2026-06 corpus expansion — ongoing phenomena (Mothman, foo
        // fighters, cattle mutilations, crop circles…) get a distinct
        // triangle shape so they don't visually collapse into figures.
        phenomenon: 'triangle',
    };

    function fetchGraph() {
        return fetch('/constellation.json', { credentials: 'same-origin' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            });
    }

    function buildElements(data) {
        var nodes = data.nodes || [];
        var edges = data.edges || [];

        // Weight-driven node size: 12–28 px diameter.
        var weights = nodes.map(function (n) { return n.weight || 1; });
        var wMin = Math.min.apply(null, weights);
        var wMax = Math.max.apply(null, weights);
        var span = Math.max(1, wMax - wMin);

        var elements = [];
        nodes.forEach(function (n) {
            var rel = (n.weight - wMin) / span;
            var diameter = 12 + rel * 16;
            // Show labels by default only for the top-quartile (most-connected).
            // Hover/zoom reveals the rest.
            var showLabel = rel >= 0.6;
            elements.push({
                group: 'nodes',
                data: {
                    id: n.id,
                    label: n.label,
                    type: n.type,
                    url: n.url,
                    sub: n.sub || '',
                    weight: n.weight || 1,
                    diameter: diameter,
                    shape: SHAPE[n.type] || 'ellipse',
                    showLabel: showLabel ? 'yes' : 'no',
                },
            });
        });
        edges.forEach(function (e, idx) {
            elements.push({
                group: 'edges',
                data: {
                    id: 'e' + idx,
                    source: e.source,
                    target: e.target,
                    type: e.type,
                    weight: e.weight || 1,
                },
            });
        });
        return elements;
    }

    function styleSheet() {
        return [
            // ── base node ──
            // Border bumped 1 → 1.5 so the shape-coded glyphs hold
            // their visual weight against the now-darker edges.
            {
                selector: 'node',
                style: {
                    'shape': 'data(shape)',
                    'background-color': '#ffffff',
                    'border-color': '#000000',
                    'border-width': 1.5,
                    'width':  'data(diameter)',
                    'height': 'data(diameter)',
                    'label': '',
                    'font-family': 'ui-monospace, Menlo, monospace',
                    'font-size': 10,
                    'color': '#000',
                    'text-valign': 'bottom',
                    'text-halign': 'center',
                    'text-margin-y': 3,
                    'text-background-color': '#ffffff',
                    'text-background-opacity': 0.85,
                    'text-background-padding': 2,
                    'min-zoomed-font-size': 6,
                },
            },
            // Labels are visible for the top-quartile by default.
            {
                selector: 'node[showLabel = "yes"]',
                style: { 'label': 'data(label)' },
            },
            // Label all nodes when zoomed in.
            {
                selector: 'node',
                style: {},
            },
            // ── edges ──
            // Width and opacity tuned for legibility on both desktop and
            // mobile: 0.8px / 0.45 opacity rendered as near-invisible
            // hairlines on retina displays, especially where multiple
            // edges overlap. Bumped to 1.3px / 0.78 — still feels
            // brutalist-quiet but the relationships actually read.
            {
                selector: 'edge',
                style: {
                    'width': 1.3,
                    'line-color': '#000000',
                    'opacity': 0.78,
                    'curve-style': 'haystack',
                    'haystack-radius': 0,
                },
            },
            // ── hover / highlight ──
            {
                selector: 'node.cn-hover',
                style: {
                    'background-color': '#fffacd',
                    'border-width': 2,
                    'label': 'data(label)',
                    'z-index': 999,
                },
            },
            {
                selector: 'edge.cn-hover',
                style: {
                    'line-color': '#000000',
                    'opacity': 1,
                    'width': 2.2,
                },
            },
            // Connected neighbors when a node is hovered.
            {
                selector: 'node.cn-neighbor',
                style: {
                    'background-color': '#fffacd',
                    'border-width': 1.5,
                    'label': 'data(label)',
                },
            },
            // Search match.
            {
                selector: 'node.cn-match',
                style: {
                    'background-color': '#fffacd',
                    'border-width': 2,
                    'label': 'data(label)',
                    'z-index': 998,
                },
            },
            // Faded when a hover-focus exists elsewhere.
            {
                selector: 'node.cn-faded',
                style: {
                    'opacity': 0.18,
                    'label': '',
                },
            },
            {
                selector: 'edge.cn-faded',
                // Was 0.06 — completely invisible. 0.22 still recedes
                // visibly while keeping the structure of the graph
                // legible behind the hover focus.
                style: { 'opacity': 0.22 },
            },
            // Selected (clicked once before navigation).
            {
                selector: 'node:selected',
                style: {
                    'border-width': 2.5,
                    'border-color': '#000',
                    'background-color': '#fffacd',
                },
            },
            // Hide nodes whose type is filtered out (and any edges touching them).
            {
                selector: 'node.cn-hidden, edge.cn-hidden',
                style: { 'display': 'none' },
            },
        ];
    }

    function layoutConfig(name) {
        if (name === 'circle')      return { name: 'circle', animate: false, fit: true, padding: 30 };
        if (name === 'grid')        return { name: 'grid',   animate: false, fit: true, padding: 30 };
        if (name === 'concentric')  return {
            name: 'concentric',
            animate: false, fit: true, padding: 30,
            concentric: function (node) { return node.degree(); },
            levelWidth: function () { return 1; },
        };
        // Default: cose (Cytoscape's built-in force-directed). No animation —
        // brutalist register, no movement-for-its-own-sake.
        return {
            name: 'cose',
            animate: false,
            fit: true,
            padding: 30,
            randomize: true,
            componentSpacing: 60,
            nodeRepulsion: function () { return 8000; },
            idealEdgeLength: function () { return 70; },
            edgeElasticity: function () { return 80; },
            gravity: 0.4,
            numIter: 1200,
            initialTemp: 200,
        };
    }

    fetchGraph().then(function (data) {
        var elements = buildElements(data);

        var cy = cytoscape({
            container: $graph,
            elements: elements,
            style: styleSheet(),
            layout: layoutConfig('cose'),
            wheelSensitivity: 0.25,
            minZoom: 0.2,
            maxZoom: 4.0,
        });

        // Expose for debugging only.
        window.__constellation = cy;

        // ─────────────── interactions ───────────────

        function clearHoverState() {
            cy.elements().removeClass('cn-hover cn-neighbor cn-faded');
        }

        function onNodeMouseover(evt) {
            var node = evt.target;
            var connected = node.closedNeighborhood();
            cy.elements().not(connected).addClass('cn-faded');
            connected.removeClass('cn-faded');
            node.addClass('cn-hover');
            connected.nodes().not(node).addClass('cn-neighbor');
            connected.edges().addClass('cn-hover');

            // Position the tooltip.
            $tipLabel.textContent = node.data('label');
            var t = node.data('type');
            var sub = node.data('sub');
            $tipType.textContent = sub ? (t + ' · ' + sub) : t;
            $tip.style.visibility = 'visible';
        }

        function onNodeMouseout() {
            clearHoverState();
            $tip.style.visibility = 'hidden';
        }

        function onNodeTap(evt) {
            var node = evt.target;
            var url = node.data('url');
            if (url) {
                window.open(url, '_blank', 'noopener');
            }
        }

        cy.on('mouseover', 'node', onNodeMouseover);
        cy.on('mouseout',  'node', onNodeMouseout);
        cy.on('tap',       'node', onNodeTap);

        // Cursor follow for the tooltip — bound to the stage so it works
        // whether the mouse is over a node or an edge.
        $stage.addEventListener('mousemove', function (e) {
            if ($tip.style.visibility !== 'visible') return;
            var rect = $stage.getBoundingClientRect();
            var x = e.clientX - rect.left + 12;
            var y = e.clientY - rect.top + 12;
            // Clamp inside the stage.
            x = Math.max(0, Math.min(x, rect.width  - 320));
            y = Math.max(0, Math.min(y, rect.height -  60));
            $tip.style.left = x + 'px';
            $tip.style.top  = y + 'px';
        });

        // ─────────────── filter checkboxes ───────────────
        var checkboxes = document.querySelectorAll('.cn-check input[type="checkbox"]');
        function applyFilters() {
            var active = {};
            checkboxes.forEach(function (cb) {
                active[cb.dataset.type] = cb.checked;
            });
            cy.nodes().forEach(function (n) {
                if (active[n.data('type')] === false) {
                    n.addClass('cn-hidden');
                } else {
                    n.removeClass('cn-hidden');
                }
            });
            // Hide edges with any hidden endpoint.
            cy.edges().forEach(function (e) {
                if (e.source().hasClass('cn-hidden') || e.target().hasClass('cn-hidden')) {
                    e.addClass('cn-hidden');
                } else {
                    e.removeClass('cn-hidden');
                }
            });
        }
        checkboxes.forEach(function (cb) {
            cb.addEventListener('change', applyFilters);
        });

        // ─────────────── search ───────────────
        function runSearch() {
            var q = ($search.value || '').trim().toLowerCase();
            cy.nodes().removeClass('cn-match');
            if (!q) return;
            cy.nodes().forEach(function (n) {
                var lbl = (n.data('label') || '').toLowerCase();
                if (lbl.indexOf(q) !== -1) {
                    n.addClass('cn-match');
                }
            });
            // Pan to fit matches if any.
            var matches = cy.$('node.cn-match:visible');
            if (matches.length > 0) {
                cy.animate({ fit: { eles: matches, padding: 80 }, duration: 0 });
            }
        }
        $search.addEventListener('input', runSearch);
        $search.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                $search.value = '';
                runSearch();
            }
        });

        // ─────────────── layout selector ───────────────
        $layout.addEventListener('change', function () {
            cy.layout(layoutConfig($layout.value)).run();
        });

        // ─────────────── zoom buttons ───────────────
        document.getElementById('cn-zoom-in').addEventListener('click', function () {
            cy.zoom({ level: cy.zoom() * 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
        });
        document.getElementById('cn-zoom-out').addEventListener('click', function () {
            cy.zoom({ level: cy.zoom() / 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
        });
        document.getElementById('cn-reset').addEventListener('click', function () {
            cy.fit(null, 40);
        });

        // ─────────────── keyboard accessibility ───────────────
        // Allow Enter to activate the selected node (open its URL).
        $graph.tabIndex = 0;
        $graph.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                var sel = cy.$('node:selected').first();
                if (sel.length) {
                    var u = sel.data('url');
                    if (u) window.open(u, '_blank', 'noopener');
                }
            }
        });

        // Initial fit after a tick — layout runs synchronously with animate:false
        // but the stage may have just been sized.
        setTimeout(function () { cy.fit(null, 40); }, 0);

    }).catch(function (err) {
        console.error('[constellation] load failed', err);
        $graph.innerHTML = '<p style="padding:24px; font-family: ui-monospace, Menlo, monospace; font-size:13px;">'
            + 'Failed to load the constellation: ' + (err && err.message ? err.message : err)
            + '</p>';
    });

})();

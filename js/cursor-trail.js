(() => {
    'use strict';

    const desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lifetime = 220;
    const dotCount = 12;
    let layer = null;
    let dots = [];
    let nextDot = 0;
    let frame = 0;
    let pendingPoint = null;

    function clear() {
        cancelAnimationFrame(frame);
        frame = 0;
        pendingPoint = null;
        dots.forEach(dot => {
            dot.born = null;
            dot.element.style.opacity = '0';
        });
    }

    function syncPreference() {
        clear();
        if (!desktop.matches || reducedMotion.matches) {
            if (layer) layer.remove();
            layer = null;
            dots = [];
            return;
        }
        if (layer) return;
        layer = document.createElement('div');
        layer.className = 'cursor-trail';
        layer.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < dotCount; i++) {
            const element = document.createElement('span');
            element.className = 'cursor-trail__dot';
            layer.appendChild(element);
            dots.push({ element, born: null, x: 0, y: 0 });
        }
        document.body.appendChild(layer);
    }

    function draw(now) {
        frame = 0;
        if (pendingPoint) {
            const dot = dots[nextDot];
            nextDot = (nextDot + 1) % dotCount;
            dot.x = pendingPoint.x;
            dot.y = pendingPoint.y;
            dot.born = now;
            pendingPoint = null;
        }
        let active = false;
        dots.forEach(dot => {
            if (dot.born === null) return;
            const remaining = Math.max(0, 1 - (now - dot.born) / lifetime);
            dot.element.style.opacity = String(remaining * 0.45);
            dot.element.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%) scale(${0.3 + remaining * 0.7})`;
            if (remaining > 0) active = true;
            else dot.born = null;
        });
        // Stop scheduling frames as soon as the last dot fades out.
        if (active) frame = requestAnimationFrame(draw);
    }

    document.addEventListener('pointermove', event => {
        if (!layer || document.hidden) return;
        if (event.pointerType !== 'mouse') {
            clear();
            return;
        }
        pendingPoint = { x: event.clientX, y: event.clientY };
        if (!frame) frame = requestAnimationFrame(draw);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', clear);
    document.addEventListener('pointercancel', clear);
    document.addEventListener('visibilitychange', clear);
    window.addEventListener('blur', clear);
    window.addEventListener('pagehide', clear);
    desktop.addEventListener('change', syncPreference);
    reducedMotion.addEventListener('change', syncPreference);
    syncPreference();
})();

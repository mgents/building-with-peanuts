// ===========================================
// VIRTUAL JOYSTICK - Touch controls for iPad
// ===========================================

const Joystick = {
    render(ctx) {
        if (!Input.touch.active) return;

        const baseX = Input.touch.startX;
        const baseY = Input.touch.startY;
        const knobX = Input.touch.currentX;
        const knobY = Input.touch.currentY;

        // Calculate clamped knob position
        const dx = knobX - baseX;
        const dy = knobY - baseY;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, JOYSTICK_MAX_RADIUS);

        let finalKnobX = baseX;
        let finalKnobY = baseY;

        if (dist > 0) {
            finalKnobX = baseX + (dx / dist) * clampedDist;
            finalKnobY = baseY + (dy / dist) * clampedDist;
        }

        ctx.save();

        // Outer ring (base)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(baseX, baseY, JOYSTICK_MAX_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(baseX, baseY, JOYSTICK_MAX_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Knob
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(finalKnobX, finalKnobY, JOYSTICK_VISUAL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Knob border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(finalKnobX, finalKnobY, JOYSTICK_VISUAL_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Direction indicator
        if (clampedDist > JOYSTICK_DEAD_ZONE * JOYSTICK_MAX_RADIUS) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            ctx.lineTo(finalKnobX, finalKnobY);
            ctx.stroke();
        }

        ctx.restore();
    }
};

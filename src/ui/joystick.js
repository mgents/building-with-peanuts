// ===========================================
// VIRTUAL JOYSTICK - Touch controls for iPad (v2)
// ===========================================

const Joystick = {
    render(ctx, touchState, playerId = 1) {
        // Use provided touch state or fall back to legacy single-player input
        const touch = touchState || Input.p1Touch;
        if (!touch.active) return;

        const baseX = touch.startX;
        const baseY = touch.startY;
        const knobX = touch.currentX;
        const knobY = touch.currentY;

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

        // Player-specific colors
        const baseColor = playerId === 1 ? '100, 180, 255' : '100, 255, 150'; // Blue for P1, Green for P2

        // Outer ring (base)
        ctx.strokeStyle = `rgba(${baseColor}, 0.3)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(baseX, baseY, JOYSTICK_MAX_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fill
        ctx.fillStyle = `rgba(${baseColor}, 0.1)`;
        ctx.beginPath();
        ctx.arc(baseX, baseY, JOYSTICK_MAX_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Knob
        ctx.fillStyle = `rgba(${baseColor}, 0.6)`;
        ctx.beginPath();
        ctx.arc(finalKnobX, finalKnobY, JOYSTICK_VISUAL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Knob border
        ctx.strokeStyle = `rgba(${baseColor}, 0.8)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(finalKnobX, finalKnobY, JOYSTICK_VISUAL_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Direction indicator
        if (clampedDist > JOYSTICK_DEAD_ZONE * JOYSTICK_MAX_RADIUS) {
            ctx.strokeStyle = `rgba(${baseColor}, 0.4)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            ctx.lineTo(finalKnobX, finalKnobY);
            ctx.stroke();
        }

        // Player label
        ctx.fillStyle = `rgba(${baseColor}, 0.7)`;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('P' + playerId, baseX, baseY - JOYSTICK_MAX_RADIUS - 8);

        ctx.restore();
    }
};

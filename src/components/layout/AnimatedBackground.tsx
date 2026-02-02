
import React from 'react';
import FairyDust from '../effects/FairyDust';
import CenterLightBeam from '../effects/CenterLightBeam';

const AnimatedBackground = () => {
    return (
        <div
            className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none pt-24"
            aria-hidden="true"
            style={{ minHeight: '100dvh' }}
        >
            {/* Background Image Container with Rounded Frame */}
            <div className="absolute inset-4 md:inset-8 rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl border border-white/10">
                <div
                    className="absolute inset-0 animate-bg-motion"
                    style={{
                        backgroundImage: "url('/images/bg-anime.jpeg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: "brightness(1.1) contrast(1.05)",
                        width: '100%',
                        height: '100%',
                    }}
                />

                {/* Internal Vignette inside the frame */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse 150% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)`,
                        boxShadow: 'inset 0 0 100px 20px rgba(0,0,0,0.5)'
                    }}
                />

                {/* Fairy Dust Effect */}
                <div className="hidden sm:block absolute inset-0">
                    <FairyDust />
                </div>

                {/* Center Light Beam Effect */}
                <CenterLightBeam />
            </div>
        </div>
    );
};

export default AnimatedBackground;

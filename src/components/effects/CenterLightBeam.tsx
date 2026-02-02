import React from 'react';
import { motion } from 'framer-motion';

const CenterLightBeam = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
            {/* Main Central Beam */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-0 w-3/4 md:w-1/2 h-screen"
                style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 100%)',
                    filter: 'blur(60px)',
                    transform: 'perspective(100px) rotateX(10deg)',
                }}
            />

            {/* Core Bright Beam */}
            <motion.div
                initial={{ height: '0%' }}
                animate={{ height: '80%' }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="absolute top-0 w-32 md:w-64 bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-3xl"
            />

            {/* Ambient Sunlight Glow */}
            <div className="absolute top-[-100px] w-full h-[500px] bg-gradient-to-b from-sky-200/20 via-white/10 to-transparent blur-[100px]" />
        </div>
    );
};

export default CenterLightBeam;

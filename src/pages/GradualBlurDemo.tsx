import GradualBlur from '@/components/GradualBlur';

/**
 * GradualBlur Component Demo
 * 
 * This demonstrates various ways to use the GradualBlur component
 */

const GradualBlurDemo = () => {
    return (
        <div className="min-h-screen bg-slate-950 p-8 space-y-12">
            <h1 className="text-4xl font-bold text-white text-center mb-12">
                GradualBlur Component Examples
            </h1>

            {/* Example 1: Bottom Blur on Scrollable Content */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                    1. Bottom Blur on Scrollable Content
                </h2>
                <div className="relative h-[500px] overflow-hidden rounded-xl border border-white/10">
                    <div className="h-full overflow-y-auto p-8 bg-slate-900">
                        <div className="space-y-4">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-slate-800 rounded-lg border border-white/5"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Content Item {i + 1}
                                    </h3>
                                    <p className="text-slate-400">
                                        This is some sample content to demonstrate the blur effect.
                                        Scroll down to see the gradual blur at the bottom.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <GradualBlur
                        target="parent"
                        position="bottom"
                        height="6rem"
                        strength={2}
                        divCount={5}
                        curve="bezier"
                        exponential={true}
                        opacity={1}
                    />
                </div>
            </section>

            {/* Example 2: Top Blur */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">2. Top Blur Effect</h2>
                <div className="relative h-[400px] overflow-hidden rounded-xl border border-white/10">
                    <div className="h-full overflow-y-auto p-8 bg-gradient-to-b from-sky-900 to-slate-900">
                        <div className="space-y-4">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-white/5 rounded-lg backdrop-blur-sm"
                                >
                                    <p className="text-slate-300">Content line {i + 1}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <GradualBlur
                        target="parent"
                        position="top"
                        height="5rem"
                        strength={1.5}
                        divCount={4}
                        curve="ease-out"
                        exponential={false}
                        opacity={0.9}
                    />
                </div>
            </section>

            {/* Example 3: Image with Bottom Blur */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                    3. Image with Blur Overlay
                </h2>
                <div className="relative h-[400px] overflow-hidden rounded-xl border border-white/10">
                    <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-emerald-900 flex items-center justify-center">
                        <div className="text-center space-y-4 p-8">
                            <h3 className="text-3xl font-bold text-white">
                                Beautiful Gradient Background
                            </h3>
                            <p className="text-slate-200">
                                The blur effect creates a smooth transition at the bottom
                            </p>
                        </div>
                    </div>

                    <GradualBlur
                        target="parent"
                        position="bottom"
                        height="8rem"
                        strength={3}
                        divCount={6}
                        curve="bezier"
                        exponential={true}
                        opacity={1}
                    />
                </div>
            </section>

            {/* Example 4: Left Side Blur */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                    4. Left Side Blur (Horizontal)
                </h2>
                <div className="relative h-[300px] overflow-hidden rounded-xl border border-white/10">
                    <div className="h-full overflow-x-auto flex gap-4 p-8 bg-slate-900">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-64 h-full bg-gradient-to-br from-sky-500/20 to-emerald-500/20 rounded-lg border border-white/10 flex items-center justify-center"
                            >
                                <span className="text-white font-semibold">Card {i + 1}</span>
                            </div>
                        ))}
                    </div>

                    <GradualBlur
                        target="parent"
                        position="left"
                        width="6rem"
                        strength={2}
                        divCount={5}
                        curve="bezier"
                        exponential={true}
                        opacity={1}
                    />
                </div>
            </section>

            {/* Example 5: Multiple Blurs */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                    5. Multiple Blur Effects (Top & Bottom)
                </h2>
                <div className="relative h-[400px] overflow-hidden rounded-xl border border-white/10">
                    <div className="h-full overflow-y-auto p-8 bg-slate-900">
                        <div className="space-y-4">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-gradient-to-r from-sky-500/10 to-emerald-500/10 rounded-lg border border-white/5"
                                >
                                    <p className="text-slate-300">
                                        Scroll content with blur on both top and bottom - Item {i + 1}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Blur */}
                    <GradualBlur
                        target="parent"
                        position="top"
                        height="4rem"
                        strength={1.5}
                        divCount={4}
                        curve="bezier"
                        exponential={true}
                        opacity={0.8}
                    />

                    {/* Bottom Blur */}
                    <GradualBlur
                        target="parent"
                        position="bottom"
                        height="6rem"
                        strength={2}
                        divCount={5}
                        curve="bezier"
                        exponential={true}
                        opacity={1}
                    />
                </div>
            </section>

            {/* Props Documentation */}
            <section className="space-y-4 mt-16">
                <h2 className="text-2xl font-semibold text-white">Component Props</h2>
                <div className="bg-slate-900 rounded-xl border border-white/10 p-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="pb-3 text-sky-400">Prop</th>
                                <th className="pb-3 text-sky-400">Type</th>
                                <th className="pb-3 text-sky-400">Default</th>
                                <th className="pb-3 text-sky-400">Description</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            <tr className="border-b border-white/5">
                                <td className="py-3 font-mono text-sm text-emerald-400">target</td>
                                <td className="py-3">'parent' | 'self'</td>
                                <td className="py-3">'parent'</td>
                                <td className="py-3">Target element for blur effect</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 font-mono text-sm text-emerald-400">position</td>
                                <td className="py-3">'top' | 'bottom' | 'left' | 'right'</td>
                                <td className="py-3">'bottom'</td>
                                <td className="py-3">Position of the blur effect</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 font-mono text-sm text-emerald-400">height</td>
                                <td className="py-3">string</td>
                                <td className="py-3">'6rem'</td>
                                <td className="py-3">Height of blur area (for top/bottom)</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 font-mono text-sm text-emerald-400">width</td>
                                <td className="py-3">string</td>
                                <td className="py-3">'100%'</td>
                                <td className="py-3">Width of blur area (for left/right)</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 font-mono text-sm text-emerald-400">strength</td>
                                <td className="py-3">number</td>
                                <td className="py-3">2</td>
                                <td className="py-3">Blur intensity (px)</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 font-mono text-sm text-emerald-400">divCount</td>
                                <td className="py-3">number</td>
                                <td className="py-3">5</td>
                                <td className="py-3">Number of blur layers</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 font-mono text-sm text-emerald-400">curve</td>
                                <td className="py-3">'linear' | 'bezier' | 'ease-in' | 'ease-out'</td>
                                <td className="py-3">'bezier'</td>
                                <td className="py-3">Blur transition curve</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 font-mono text-sm text-emerald-400">exponential</td>
                                <td className="py-3">boolean</td>
                                <td className="py-3">true</td>
                                <td className="py-3">Use exponential blur progression</td>
                            </tr>
                            <tr>
                                <td className="py-3 font-mono text-sm text-emerald-400">opacity</td>
                                <td className="py-3">number</td>
                                <td className="py-3">1</td>
                                <td className="py-3">Overall opacity (0-1)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default GradualBlurDemo;

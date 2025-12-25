# GradualBlur Component

A React component that creates smooth, gradual blur effects at the edges of containers. Perfect for creating elegant fade-out effects on scrollable content, images, and other UI elements.

## Installation

The component has been added to your project at `/src/components/GradualBlur.tsx`.

## Usage

### Basic Example

```tsx
import GradualBlur from '@/components/GradualBlur';

function MyComponent() {
  return (
    <section style={{ position: 'relative', height: 500, overflow: 'hidden' }}>
      <div style={{ height: '100%', overflowY: 'auto', padding: '6rem 2rem' }}>
        {/* Your scrollable content here */}
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
    </section>
  );
}
```

### Examples in Your Project

The component is already implemented in:
- **Landing Page Hero Section** (`/src/pages/Index.tsx`) - Bottom blur effect
- **Feature Sections** (`/src/pages/Index.tsx`) - Visual content areas

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `'parent' \| 'self'` | `'parent'` | Specifies which element the blur should apply to |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Position where the blur effect appears |
| `height` | `string` | `'6rem'` | Height of the blur area (for top/bottom positions) |
| `width` | `string` | `'100%'` | Width of the blur area (for left/right positions) |
| `strength` | `number` | `2` | Maximum blur intensity in pixels |
| `divCount` | `number` | `5` | Number of blur layers (more = smoother gradient) |
| `curve` | `'linear' \| 'bezier' \| 'ease-in' \| 'ease-out'` | `'bezier'` | Blur transition curve type |
| `exponential` | `boolean` | `true` | Use exponential blur progression for smoother effect |
| `opacity` | `number` | `1` | Overall opacity of the blur effect (0-1) |
| `className` | `string` | `''` | Additional CSS classes |

## Common Use Cases

### 1. Scrollable Content with Bottom Blur

```tsx
<div className="relative h-96 overflow-hidden">
  <div className="h-full overflow-y-auto p-8">
    {/* Long scrollable content */}
  </div>
  
  <GradualBlur
    position="bottom"
    height="6rem"
    strength={2}
  />
</div>
```

### 2. Image Gallery with Fade

```tsx
<div className="relative h-80 overflow-hidden">
  <img src="your-image.jpg" className="w-full h-full object-cover" />
  
  <GradualBlur
    position="bottom"
    height="8rem"
    strength={3}
    opacity={0.9}
  />
</div>
```

### 3. Horizontal Scroll with Side Blur

```tsx
<div className="relative overflow-hidden">
  <div className="overflow-x-auto flex gap-4 p-4">
    {/* Horizontal scrolling cards */}
  </div>
  
  <GradualBlur
    position="left"
    width="4rem"
    strength={1.5}
  />
</div>
```

### 4. Double-Sided Blur (Top & Bottom)

```tsx
<div className="relative h-96 overflow-hidden">
  <div className="h-full overflow-y-auto p-8">
    {/* Content */}
  </div>
  
  <GradualBlur position="top" height="4rem" />
  <GradualBlur position="bottom" height="6rem" />
</div>
```

## Demo Page

Visit `/demo/gradual-blur` in your application to see interactive examples of all the different configurations and use cases.

## Tips

1. **Performance**: Keep `divCount` between 3-7 for optimal performance
2. **Smoothness**: Use `exponential={true}` with `curve="bezier"` for the smoothest effect
3. **Subtle Effects**: For subtle blurs, use lower `strength` (1-2) and `opacity` (0.6-0.8)
4. **Strong Effects**: For dramatic fades, use higher `strength` (3-5) and `divCount` (6-8)
5. **Parent Container**: Make sure the parent container has `position: relative` and `overflow: hidden`

## Browser Support

The component uses `backdrop-filter` which is supported in:
- Chrome/Edge 76+
- Safari 9+
- Firefox 103+

For older browsers, the effect will gracefully degrade.

## Credits

Component created by Ansh Dhanani - [github.com/ansh-dhanani](https://github.com/ansh-dhanani)

Original source: [react-bits.dev](https://react-bits.dev)

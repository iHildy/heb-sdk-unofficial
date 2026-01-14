export default function HEBLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-white text-heb-red font-black px-2 py-0.5 text-xl tracking-tighter border-2 border-white rounded-xs inline-flex items-center justify-center italic ${className}`} style={{ fontFamily: 'Arial, sans-serif' }}>
            H-E-B
        </div>
    );
}

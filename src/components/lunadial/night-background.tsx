import { cn } from "@/utils/utils";

interface NightBackgroundProps {
  /** 背景场景图（月升/水月/月相） */
  image?: string;
  /** 图片不透明度 */
  imageOpacity?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 深夜蓝底 + 月华径向光晕的场景背景。
 * 可叠一层生成的月夜桥影场景图，并覆深蓝纱幕。
 */
export function NightBackground({
  image,
  imageOpacity = 0.5,
  className,
  children,
}: NightBackgroundProps) {
  return (
    <div className={cn("night-field relative min-h-full w-full overflow-hidden", className)}>
      {image && (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${image})`, opacity: imageOpacity }}
          aria-hidden
        />
      )}
      {image && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,17,32,0.35) 0%, rgba(10,17,32,0.55) 55%, rgba(7,13,24,0.9) 100%)",
          }}
          aria-hidden
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

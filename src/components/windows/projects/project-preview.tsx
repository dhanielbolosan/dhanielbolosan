import { cn } from "@/lib/utils";
import { ImageFrame } from "../../image-frame";
import type { Project } from "./projects.data";
import { useSlideshow } from "./use-slideshow";

export const ProjectPreview = ({
  project,
  active,
  className,
  expanded = false,
}: {
  project: Project;
  active: boolean;
  className: string;
  expanded?: boolean;
}) => {
  const images =
    !expanded && project.thumbnail ? [project.thumbnail] : project.images;
  const index = useSlideshow(images.length, active);

  return (
    <ImageFrame className={className}>
      {images.length === 0 && (
        <span className="absolute inset-0 grid place-items-center p-1 text-center font-heading text-xs">
          {project.name}
        </span>
      )}

      {/* Stack screenshots for opacity crossfades. */}
      {images.map((src, imageIndex) => (
        <img
          key={src}
          src={src}
          alt=""
          className={cn(
            "absolute inset-0 size-full motion-safe:transition-opacity motion-safe:duration-(--window-entry-duration)",
            expanded ? "object-contain" : "object-cover",
            imageIndex === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </ImageFrame>
  );
};

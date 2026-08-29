import { CoverPreview } from "@/components/eazo-cover/cover-preview";
import { EazoCoverReady } from "@/components/eazo-cover/cover-ready";

export default function CoverPreviewPage() {
  return (
    <EazoCoverReady>
      <CoverPreview />
    </EazoCoverReady>
  );
}

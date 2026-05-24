import { isExpoCameraAvailable } from "../../../lib/nativeMedia";

type Props = {
  visible: boolean;
  mode: "photo" | "video";
  onClose: () => void;
  onPhotoCaptured: (uri: string) => void;
  onVideoCaptured: (uri: string, fileName?: string) => void;
};

export default function MaintenanceCaptureCamera(props: Props) {
  if (!isExpoCameraAvailable() || !props.visible) {
    return null;
  }

  const MaintenanceCaptureCameraNative = require("./MaintenanceCaptureCameraNative").default;
  return <MaintenanceCaptureCameraNative {...props} />;
}

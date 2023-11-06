import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from "react-icons/fi";

type Props = {
  volume: number;
  isMuted: boolean;
};

export default function VolumeIcon({ volume, isMuted }: Props) {
  if (volume == 0 || isMuted) return <FiVolumeX className="" size={30} />;
  if (volume < 0.3) return <FiVolume className="" size={30} />;
  if (volume >= 0.8) return <FiVolume2 className="" size={30} />;
  if (volume < 0.8) return <FiVolume1 className="" size={30} />;
  return null;
}

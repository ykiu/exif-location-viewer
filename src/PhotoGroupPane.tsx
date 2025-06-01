import React, {
  useEffect,
  useMemo,
  useState,
  type ImgHTMLAttributes,
} from "react";
import { X } from "lucide-react";
import type { Photo } from "./types";

type PhotoGroup = {
  latitude: number;
  longitude: number;
  representativeThumbnail: string;
  photos: Photo[];
};

interface PhotoGroupPaneProps {
  group: PhotoGroup;
  onClose: () => void;
}

const FileImage = (
  props: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { file: File }
) => {
  const src = useMemo(() => URL.createObjectURL(props.file), [props.file]);
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(src);
    };
  }, [src]);
  return <img {...props} src={src} alt={props.file.name} />;
};

const PhotoGroupPane: React.FC<PhotoGroupPaneProps> = ({ group, onClose }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo>(group.photos[0]);

  return (
    <div className="w-1/2 bg-gray-100 relative flex flex-col">
      <div className="flex items-center p-2">
        <button
          className="p-2 rounded-full hover:bg-gray-200"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold">Photos</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <FileImage
          file={selectedPhoto.file}
          alt="Selected Photo"
          className="max-w-full max-h-full rounded-lg shadow-md"
        />
      </div>
      <div className="flex overflow-x-auto p-4 space-x-4">
        {group.photos.map((photo, index) => (
          <img
            key={index}
            src={photo.thumbnail}
            alt="Thumbnail"
            className={`w-24 h-24 rounded-lg shadow-md cursor-pointer ${
              photo === selectedPhoto ? "border-4 border-blue-500" : ""
            }`}
            onClick={() => setSelectedPhoto(photo)}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoGroupPane;

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Text,
  Image as KonvaImage,
} from "react-konva";
import type Konva from "konva";
import {
  Eraser,
  Redo2,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { FABRIC_COLORS, findColorHex } from "../../data/colors";
import { useConfiguratorStore } from "../../store/configuratorStore";
import type { ImageElement, TextElement } from "../../types/configurator";
import { Button } from "../ui/Button";

const BASE_WIDTH = 640;
const BASE_HEIGHT = 320;

function useHtmlImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = src;
  }, [src]);

  return image;
}

function EditableText({
  element,
  stageWidth,
  stageHeight,
  selected,
  onSelect,
}: {
  element: TextElement;
  stageWidth: number;
  stageHeight: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const updateElementTransform = useConfiguratorStore(
    (s) => s.updateElementTransform,
  );
  const shapeRef = useRef<Konva.Text>(null);

  return (
    <Text
      ref={shapeRef}
      id={element.id}
      text={element.content}
      x={element.transform.x * stageWidth}
      y={element.transform.y * stageHeight}
      fontSize={element.fontSize * element.transform.scaleY}
      fontFamily={element.fontFamily}
      fontStyle={element.fontWeight === "bold" ? "bold" : "normal"}
      fill={element.fill}
      align={element.align}
      letterSpacing={element.letterSpacing}
      offsetX={0}
      rotation={element.transform.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        updateElementTransform(element.id, {
          x: e.target.x() / stageWidth,
          y: e.target.y() / stageHeight,
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        node.scaleX(1);
        node.scaleY(1);
        updateElementTransform(element.id, {
          x: node.x() / stageWidth,
          y: node.y() / stageHeight,
          scaleX: element.transform.scaleX * scaleX,
          scaleY: element.transform.scaleY * scaleX,
          rotation: node.rotation(),
        });
      }}
      stroke={selected ? "#0F4C81" : undefined}
      strokeWidth={selected ? 1 : 0}
    />
  );
}

function EditableImage({
  element,
  stageWidth,
  stageHeight,
  selected,
  onSelect,
}: {
  element: ImageElement;
  stageWidth: number;
  stageHeight: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const image = useHtmlImage(element.src);
  const updateElementTransform = useConfiguratorStore(
    (s) => s.updateElementTransform,
  );
  const shapeRef = useRef<Konva.Image>(null);

  if (!image) return null;

  const aspect = element.naturalWidth / Math.max(element.naturalHeight, 1);
  const width = stageWidth * 0.28 * element.transform.scaleX;
  const height = width / aspect;

  return (
    <KonvaImage
      ref={shapeRef}
      id={element.id}
      image={image}
      x={element.transform.x * stageWidth}
      y={element.transform.y * stageHeight}
      width={width}
      height={height}
      offsetX={width / 2}
      offsetY={height / 2}
      rotation={element.transform.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        updateElementTransform(element.id, {
          x: e.target.x() / stageWidth,
          y: e.target.y() / stageHeight,
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        node.scaleX(1);
        node.scaleY(1);
        updateElementTransform(element.id, {
          x: node.x() / stageWidth,
          y: node.y() / stageHeight,
          scaleX: element.transform.scaleX * scaleX,
          scaleY: element.transform.scaleY * scaleX,
          rotation: node.rotation(),
        });
      }}
      stroke={selected ? "#0F4C81" : undefined}
      strokeWidth={selected ? 2 : 0}
    />
  );
}

export function DesignEditor2D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });

  const configuration = useConfiguratorStore((s) => s.configuration);
  const selectedElementId = useConfiguratorStore((s) => s.selectedElementId);
  const selectElement = useConfiguratorStore((s) => s.selectElement);
  const undo = useConfiguratorStore((s) => s.undo);
  const redo = useConfiguratorStore((s) => s.redo);
  const canUndo = useConfiguratorStore((s) => s.canUndo);
  const canRedo = useConfiguratorStore((s) => s.canRedo);
  const clearDesign = useConfiguratorStore((s) => s.clearDesign);
  const addTextElement = useConfiguratorStore((s) => s.addTextElement);
  const removeElement = useConfiguratorStore((s) => s.removeElement);

  const bg = findColorHex(FABRIC_COLORS, configuration.colors.canopy);
  const elementCount =
    configuration.textElements.length + configuration.imageElements.length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(280, entry.contentRect.width);
      const height = width * (BASE_HEIGHT / BASE_WIDTH);
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const stage = transformer.getStage();
    if (!stage || !selectedElementId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }
    const node = stage.findOne(`#${selectedElementId}`);
    if (node) {
      transformer.nodes([node]);
      transformer.getLayer()?.batchDraw();
    }
  }, [
    selectedElementId,
    configuration.textElements,
    configuration.imageElements,
    size,
  ]);

  const guide = useMemo(
    () => "Artwork panel — drag, scale, and rotate. Synced to the 3D canopy.",
    [],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">2D Design Editor</h3>
          <p className="text-xs text-ink-muted">{guide}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 className="size-3.5" />
            Undo
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 className="size-3.5" />
            Redo
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="text-xs"
            onClick={() => addTextElement()}
          >
            <Type className="size-3.5" />
            Add text
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            disabled={!selectedElementId}
            onClick={() =>
              selectedElementId ? removeElement(selectedElementId) : undefined
            }
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            disabled={elementCount === 0}
            onClick={clearDesign}
          >
            <Eraser className="size-3.5" />
            Clear art
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-line bg-white shadow-inner"
      >
        <Stage
          width={size.width}
          height={size.height}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) selectElement(null);
          }}
          onTouchStart={(e) => {
            if (e.target === e.target.getStage()) selectElement(null);
          }}
        >
          <Layer>
            <Rect
              width={size.width}
              height={size.height}
              fill={bg}
              listening={false}
            />
            {configuration.imageElements.map((element) => (
              <EditableImage
                key={element.id}
                element={element}
                stageWidth={size.width}
                stageHeight={size.height}
                selected={selectedElementId === element.id}
                onSelect={() => selectElement(element.id)}
              />
            ))}
            {configuration.textElements.map((element) => (
              <EditableText
                key={element.id}
                element={element}
                stageWidth={size.width}
                stageHeight={size.height}
                selected={selectedElementId === element.id}
                onSelect={() => selectElement(element.id)}
              />
            ))}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 16 || newBox.height < 16 ? oldBox : newBox
              }
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

declare module '@hello-pangea/dnd' {
  import * as React from 'react';

  export type DraggableId = string;
  export type DroppableId = string;
  export type DragStart = any;
  export type DropResult = any;

  export interface DraggableProps {
    draggableId: DraggableId;
    index: number;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactElement;
  }

  export interface DroppableProps {
    droppableId: DroppableId;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
    type?: string;
  }

  export interface DraggableProvided {
    draggableProps: any;
    dragHandleProps: any | null;
    innerRef: (element: HTMLElement | null) => void;
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: any;
    placeholder?: React.ReactElement | null;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    draggingOver: DroppableId | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: DraggableId | null;
  }

  export class Droppable extends React.Component<DroppableProps> {}
  export class Draggable extends React.Component<DraggableProps> {}
  export class DragDropContext extends React.Component<{
    onDragEnd: (result: DropResult) => void;
    onDragStart?: (initial: DragStart) => void;
    children: React.ReactNode;
  }> {}
} 
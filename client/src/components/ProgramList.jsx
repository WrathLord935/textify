import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'

import ProgramContainer from './ProgramContainer'

const ProgramList = ({ programs, onAdd, onDelete, onChange, onToggleCollapse, onReorder }) => {

  // ── DND-KIT SENSORS ────────────────────────────────────
  // sensors define how drag is initiated
  // PointerSensor — mouse and touch
  // KeyboardSensor — accessibility, drag with keyboard
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // called when user drops a dragged item
  const handleDragEnd = (event) => {
    const { active, over } = event
    // active — the item being dragged
    // over — the item it was dropped on

    // if dropped on a different item, reorder
    if (active.id !== over?.id) {
      const oldIndex = programs.findIndex(p => p.id === active.id)
      const newIndex = programs.findIndex(p => p.id === over.id)
      // arrayMove is a dnd-kit helper that moves an item from one index to another
      const reordered = arrayMove(programs, oldIndex, newIndex)
      onReorder(reordered)
    }
  }

  return (
    <div className="flex flex-col flex-1 px-5 py-4 overflow-y-auto">

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Programs
      </p>

      {/* DndContext wraps everything that participates in drag and drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* SortableContext needs the list of ids in order */}
        <SortableContext
          items={programs.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* render each program — map gives us the item and its index */}
          {programs.map((program, index) => (
            <ProgramContainer
              key={program.id}          // React needs a unique key for list items
              program={program}
              index={index}
              onChange={onChange}
              onDelete={onDelete}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* ADD PROGRAM BUTTON */}
      <button
        onClick={onAdd}
        className="mt-2 w-full border border-dashed border-[#2d3148] hover:border-[#e11d48] text-slate-500 hover:text-[#e11d48] text-sm py-2 rounded-lg transition-colors"
      >
        + Add Program
      </button>

    </div>
  )
}

export default ProgramList

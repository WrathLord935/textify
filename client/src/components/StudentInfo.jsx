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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import checkboxChecked from '../img/Pink_checkbox-checked.svg'
import checkboxUnchecked from '../img/Pink_checkbox-unchecked.svg'

// ── SINGLE FIELD ROW ──────────────────────────────────────
const FieldRow = ({ field, onChange, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-[#1a1d27] border border-[#2d3148] rounded-lg px-3 py-2"
    >
      {/* DRAG HANDLE */}
      <button
        {...attributes}
        {...listeners}
        className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing text-sm flex-shrink-0"
        title="Drag to reorder"
      >
        ⠿
      </button>

      {/* LABEL INPUT — fixed width on the left */}
      <input
        type="text"
        value={field.label}
        onChange={(e) => onChange(field.id, 'label', e.target.value)}
        placeholder="Label"
        className="w-32 flex-shrink-0 bg-transparent text-xs text-slate-400 outline-none placeholder-slate-600"
      />

      {/* DIVIDER */}
      <div className="w-px h-4 bg-[#2d3148] flex-shrink-0" />

      {/* VALUE INPUT — takes remaining space */}
      <div className="relative flex-1 min-w-0">
        <input
          type="text"
          value={field.value}
          onChange={(e) => onChange(field.id, 'value', e.target.value)}
          placeholder="Value"
          className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder-slate-600 pr-6"
        />
        {field.value && (
          <button
            onClick={() => onChange(field.id, 'value', '')}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {/* SHOW LABEL CHECKBOX */}
      <div className="flex items-center gap-1.5 flex-shrink-0 group" title="Show label in output">
        <input
          type="checkbox"
          id={`show-label-${field.id}`}
          checked={field.showLabel}
          onChange={(e) => onChange(field.id, 'showLabel', e.target.checked)}
          className="peer sr-only"
        />
        <label htmlFor={`show-label-${field.id}`} className="cursor-pointer">
          <img
            src={field.showLabel ? checkboxChecked : checkboxUnchecked}
            alt="checkbox toggle"
            className="w-3.5 h-3.5 object-contain transition-transform group-hover:scale-110 pointer-events-none"
          />
        </label>
        <label htmlFor={`show-label-${field.id}`} className="text-xs text-slate-500 cursor-pointer select-none group-hover:text-slate-300 transition-colors">
          label
        </label>
      </div>

      {/* DELETE */}
      <button
        onClick={() => onDelete(field.id)}
        className="text-slate-600 hover:text-red-400 text-xs flex-shrink-0 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

// ── STUDENT INFO PANEL ────────────────────────────────────
const StudentInfo = ({ fields, onFieldsChange }) => {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id)
      const newIndex = fields.findIndex(f => f.id === over.id)
      onFieldsChange(arrayMove(fields, oldIndex, newIndex))
    }
  }

  const handleChange = (id, key, value) => {
    onFieldsChange(fields.map(f => f.id === id ? { ...f, [key]: value } : f))
  }

  const handleDelete = (id) => {
    onFieldsChange(fields.filter(f => f.id !== id))
  }

  const handleAdd = () => {
    onFieldsChange([
      ...fields,
      { id: Date.now(), label: '', value: '', showLabel: false }
    ])
  }

  return (
    <div className="px-5 py-4 flex flex-col gap-3 h-full overflow-hidden">

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
        Student Details
      </p>

      {/* DRAGGABLE FIELD LIST */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 -mr-2 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map(field => (
              <FieldRow
                key={field.id}
                field={field}
                onChange={handleChange}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* ADD FIELD BUTTON */}
      <button
        onClick={handleAdd}
        className="w-full border border-dashed border-[#2d3148] hover:border-[#e11d48] text-slate-500 hover:text-[#e11d48] text-xs py-1.5 rounded-lg transition-colors flex-shrink-0"
      >
        + Add Field
      </button>

    </div>
  )
}

export default StudentInfo